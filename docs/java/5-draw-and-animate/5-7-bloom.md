# 发光与泛光

> ***“神说，要有光。”——《圣经·创世记》，以及每一位想让方块“亮起来”的模组作者***

在 Mindustry 里说“让东西发光”，其实混着三件完全不同的事：**加色混合的假发光**、**屏幕光照**、**真正的泛光（Bloom）**。它们的外观相似，原理、开销和适用场景却差得很远，混着用是新手最常见的翻车点之一。这一节把三者的边界划清楚，然后重点讲怎么把东西喂进泛光管线、以及那些不得不注意的复位与性能细节。

---

## 一、三种“发光”的分工

| 手段 | 看起来像 | 照亮周围黑暗 | 溢出光晕 | 开销 |
| --- | --- | --- | --- | --- |
| 加色混合（`Blending.additive` / `-glow` 贴图） | 自身变亮，黑色像素等于透明 | × | × | 极低 |
| 屏幕光照（`Drawf.light` / `renderer.lights`） | 周围被染上一层光 | ✔ | × | 低 |
| 泛光（Bloom） | 亮部被模糊、向四周扩散 | × | ✔ | 全屏缓冲 + 多次模糊，很贵 |

一句话的选择建议：**方块、工厂、装饰用第一种；需要“点亮黑暗”的灯、护盾、炮塔蓄能用第二种；只有子弹、爆炸、能量核心这类“必须爆开”的东西才值得第三种。**

原版自己也是这么分工的：`DrawGlowRegion`（工厂的 `-glow` 层）只用加色混合；`照明器`（`LightBlock`）只加屏幕光照；只有在 `Layer.bullet ~ Layer.effect` 之间绘制的子弹与特效才会被泛光捕获。

---

## 二、先看清楚原版是怎么“攒着画”的

在往画面里塞任何发光效果之前，得先知道原版并不是“一个方块一个方块地直接往屏幕上刷”。它先把一大批东西烘进长期存在的缓存对象里，然后靠一套延迟执行的绘制队列把缓存贴回屏幕。不理解这一层，你写的 `draw()` 什么时候被调用、调用了多少次、为什么“改了 z 却没反应”，都会变成玄学。

### `Renderer` 里挂着哪些缓存

`Renderer` 本身就不大，真正干重活的是它持有的这几个对象。`init()` 里创建、每帧按需重建/复用：

| 缓存对象 | 字段 | 干什么 | 什么时候建 | 什么时候重建 / 失效 | 生效条件 |
| --- | --- | --- | --- | --- | --- |
| 世界方块渲染器 | `Renderer.blocks`（`BlockRenderer`） | 地板网格缓存 `floor`（`FloorRenderer` 的 `ChunkMesh[][][]`）、建筑雪碧缓存 `cacheChunks`（`CacheChunk` → 每个 `BuildingCacheLayer` 一张 `SpriteCache`，分块大小 `chunkSize = 30`）、阴影缓冲 `shadows`、黑暗缓冲 `dark`，以及四棵索引四叉树 `blockTree` / `blockCachedTree` / `blockLightTree` / `overlayTree` / `floorTree` | 随 `Renderer` 构造 | 方块变化时按脏块 `dirtyChunks` 重烘；相机换了队伍（`lastSeenTeam`）也会整体重烘 | 建筑缓存只收 `block.drawCached == true` 的方块，按 `block.buildingCacheLayer` 分层 |
| 效果缓冲 | `Renderer.effectBuffer` | 护盾、建造光柱的离屏层，画完套 `Shaders.shield` / `Shaders.buildBeam` 再贴回来 | 字段处直接 `new`，常驻 | 每帧在 `animateWater || animateShields` 时 `resize` | `animateShields && Shaders.shield != null` |
| 背景缓冲 | `Renderer.backgroundBuffer` | 星球背景（`state.rules.planetBackground`）的静态快照 | 第一次用到时才 `new` | 尺寸变了走 `resizeCheck` 重画；`dispose()` 时置 `null` | `state.rules.planetBackground != null` |
| 泛光 | `Renderer.bloom` | 泛光的 FBO 加阈值/模糊用的着色器 | `setupBloom()` 里按设置项 `bloom` 决定建不建 | `toggleBloom()` 里 dispose 后重建；模糊遍数与强度每帧从设置里读 | `bloom != null` |
| 光照 | `Renderer.lights`（`LightRenderer`） | 收集本帧所有光源，最后一次性降采样混合 | 常驻，`lights` 只是一个 `Seq<Runnable>` 加一个圆形光对象池 | `buffer` 每帧 `resize` 到 `1/scaling`（`scaling = 4`）；每帧画完 `lights.clear()` | `Vars.enableLight && state.rules.lighting && ambientLight.a > 0.0001f && renderer.drawLight` |
| 自定义背景 | `Renderer.customBackgrounds` | 名字 → `Runnable` 的映射表 | `addCustomBackground(name, runnable)` 时登记，永不删除 | 常驻 | `state.rules.customBackgroundCallback` 命中某个已登记的键 |

### 绘制请求队列：`draw()` 不是立刻执行的

有了缓存之后，原版靠 `Draw.draw(z, runnable)` 把“往哪个 z 上画什么”排进队列：

```java
// SpriteBatch
public void draw(Runnable request){
    if(sort && !flushing){
        // 排序模式下只是把请求存起来，记下 z 和当前混合模式
        ...
        return;
    }
    // 否则立刻执行
}

public void flush(){
    if(!flushing){
        flushing = true;
        flushRequests();   // 按 z 排序，然后依次执行
        flushing = false;
    }
    ... // 再真正提交顶点
}
```

`Renderer.draw()` 里的顺序正好把这条规则说全了：开场 `Draw.sort(true)`，之后一整个世界的 `Draw.draw(...)` 都只是排进队列；一帧末尾 `Draw.reset()` → `Draw.flush()` → `Draw.sort(false)`，世界再一起执行掉，而之后的 UI 阶段不再延迟，画一条执行一条。

```java
Draw.sort(true);                              // 世界阶段：请求入队，按 z 排
...
Draw.draw(Layer.darkness, blocks::drawDarkness);
if(bloom != null){
    Draw.draw(Layer.bullet - 0.02f, bloom::capture);
    Draw.draw(Layer.effect + 0.02f, bloom::render);
}
Draw.drawRange(Layer.shields, 1f, () -> effectBuffer.begin(Color.clear), () -> {
    effectBuffer.end();
    effectBuffer.blit(Shaders.shield);
});
Draw.draw(Layer.overlayUI, overlays::drawTop);
if(state.rules.fog) Draw.draw(Layer.fogOfWar, fog::drawFog);
...
Draw.reset();
Draw.flush();                                 // 世界阶段收尾：把队列全部跑完
Draw.sort(false);                             // 之后的 UI：请求立刻执行
```

于是就有了两条必须记住的推论：

1. **在 `draw()` 里读到的游戏状态，是“渲染时机”的状态，而不是“逻辑时机”的状态。** 逻辑更新和世界渲染是分开的两趟，别在 `draw()` 里改游戏状态、别在 `draw()` 里发网络包、别在 `draw()` 里加物品。
2. **屏障会决定请求什么时候被执行。** 切着色器（`Draw.shader`）、开或关帧缓冲（`Framebuffer.begin/end`）、批次塞满、以及显式 `Draw.flush()`，都会让队列提前跑掉一部分。这也是为什么 `Draw.z(Layer.bullet)` 这种“改层级”的写法是有意义的——它改的是请求在队列里的排序键，而不是“现在马上”画在哪。

<!-- 只是暂时丢在这里，未来目录会调整 -->

### 为什么模组作者要关心这些

- **建筑的 `draw()` 不是每帧都跑。** 只要 `block.drawCached == true`，你的绘制就被烘进 `SpriteCache`，只有在脏块重烘时才执行一次；紧接着的帧只是把那张缓存贴出来。所以拿 `draw()` 做“每帧推进的动画”在缓存方块上是不会动的，动画要么写进 `building.update()` → `build.recache()`，要么就别缓存。
- **缓存会整块重建。** 方块变化会标脏该块、镜头第一次看到某个 chunk 会整块重烘、队伍的视野变化（`lastSeenTeam` 不同）也会触发重烘——所以别在 `draw()` 里存“上一帧的值”拿来做插值，你不一定拿得到上一帧。
- **想真正每帧画、又不想被缓存吃掉**，可以挂 `Events.run(Trigger.draw, ...)`——它是在世界渲染阶段被 `Events.fire(Trigger.draw)` 触发的，位置就在 `Draw.sort(true)` 之后；也可以让方块不定制 `draw()`，改用 `UpdateRenderState` 这类逐帧渲染状态。
- **自己开 FBO 时更要小心屏障。** `Framebuffer.begin()` 会把队列 flush 掉，你在排序模式下“先开缓冲再排队”是行不通的，必须像 `effectBuffer` 那样用 `Draw.drawRange()` 包住一段区间。

## 三、加色混合：最便宜、也最够用的“发光”

加色混合的规则很简单：**每个像素的最终颜色 = 底色 + 贴图颜色**。所以贴图上纯黑的地方等于完全透明，而越亮的像素叠加后越接近白色——这正是“发光”的视觉本质。

```java
Draw.blend(Blending.additive);
Draw.color(Color.valueOf("ff9f43"));
Draw.alpha(0.7f);
Draw.rect(region, x, y);
Draw.reset();   // 复位颜色、混合色、缩放和 alpha
Draw.blend();   // 混合模式必须单独复位
Draw.z(z);
```

这里有个**必须点出来的坑**：`Draw.reset()` 只复位 `color()`、`mixcol()`、`xScl/yscl` 和 `Lines.stroke()`，**它不会把混合模式改回去**。所以加色绘制结束后，一定要再调一次无参的 `Draw.blend()`，否则后面所有东西（包括别的模组的东西）都会一直是加法混合，画面白成一片。

### 原版范例：`DrawGlowRegion`

原版给工厂用的现成绘制器 `mindustry.world.draw.DrawGlowRegion` 就是一段教科书式的实现，字段如下：

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `blending` | `Blending.additive` | 混合模式 |
| `suffix` | `"-glow"` | 自动拼接的贴图后缀 |
| `alpha` | `0.9f` | 基础透明度 |
| `glowScale` | `10f` | 呼吸效果的周期参数 |
| `glowIntensity` | `0.5f` | 呼吸效果的幅度 |
| `rotateSpeed` | `0f` | 旋转速度 |
| `layer` | `Layer.blockAdditive` | 绘制层级 |
| `rotate` | `false` | 是否跟随建筑朝向 |
| `color` | `Color.red` | 发光颜色 |
| `region` | — | `load()` 中从 `block.name + suffix` 载入 |

它的 `draw()` 只有十行，但每一步都值得抄：

```java
public void draw(Building build){
    if(build.warmup() <= 0.001f) return;          // 1. 没在工作就什么都不画

    float z = Draw.z();                            // 2. 保存当前层级
    if(layer > 0) Draw.z(layer);
    Draw.blend(blending);                          // 3. 切混合
    Draw.color(color);
    Draw.alpha((Mathf.absin(build.totalProgress(), glowScale, alpha) * glowIntensity + 1f - glowIntensity) * build.warmup() * alpha); // 4. 呼吸
    Draw.rect(region, build.x, build.y, build.totalProgress() * rotateSpeed + (rotate ? build.rotdeg() : 0f));
    Draw.reset();                                  // 5. 全部复位
    Draw.blend();
    Draw.z(z);
}
```

注意 `layer = Layer.blockAdditive(31)` 这个选择。`Layer` 的注释写得很直白：`blockAdditive` 是“用于加色叠加的非正式层级，**集中到同一层以减少 draw call**”。因为切换混合模式会让 `Batch` 立即 flush 一次批次，把整张地图上的加色绘制都挤在同一个层级里，就能把它们合并成极少几次绘制。

### 一个自定义的例子

下面这个绘制器把“呼吸”改成随建筑工作效率变化，方便给发电机、反应堆这类东西用（为了避免每帧分配，颜色参数统一用 `Tmp.c1`）：

```java
public class DrawPowerGlow extends DrawBlock{
    public Color color = Color.valueOf("ff7a3d");
    public float base = 0.55f, breathe = 0.45f, period = 8f;
    public float layer = Layer.blockAdditive;
    public TextureRegion region;

    @Override
    public void load(Block block){
        region = Core.atlas.find(block.name + "-glow");
    }

    @Override
    public void draw(Building build){
        float heat = build.warmup();
        if(heat <= 0.001f) return;

        float z = Draw.z();
        Draw.z(layer);
        Draw.blend(Blending.additive);
        Draw.color(color);
        Draw.alpha((base + Mathf.absin(Time.time, period, breathe)) * heat);
        Draw.rect(region, build.x, build.y);
        Draw.reset();
        Draw.blend();
        Draw.z(z);
    }
}
```

`Mathf.absin(time, scl, mag)` 是“正弦取绝对值再乘幅度”，正因为它取了绝对值，`0 → 峰值 → 0` 的节奏比纯 `sin` 更像灯光呼吸。`Time.time` 是全局游戏时间，用 `build.totalProgress()` 也行——区别在于前者全体同步，后者每个建筑各算各的。


## 四、屏幕光照：让光真的照亮黑暗

`Drawf.light` 只是往光照系统里塞一条请求，真正绘制在 `LightRenderer` 中完成：

```java
public static void light(float x, float y, float radius, Color color, float opacity)   // 圆形光
public static void light(Position pos, float radius, Color color, float opacity)       // 任意带位置的对象
public static void light(float x, float y, TextureRegion region, Color color, float opacity) // 贴图形状的光
public static void light(float x, float y, float x2, float y2)                          // 线段光（基础版）
public static void light(float x, float y, float x2, float y2, float stroke, Color tint, float alpha) // 线段光（带粗细和颜色）
```

### 什么时候光照才会生效

`LightRenderer.enabled()` 的完整条件是：

```java
return state.rules.lighting && state.rules.ambientLight.a > 0.0001f && renderer.drawLight;
```

也就是说，**地图规则开启了光照、环境光不是全透明、且玩家没在设置里关掉“绘制光照”**，三者缺一不可。这解释了两个经典困惑：

- 在白天、`ambientLight` 很亮的地图里画了光，却“看不见”——因为光照本来就没有参与合成，不是你的代码错了；
- 光照效果只有一层低分辨率的柔和染色，边缘是糊的——`LightRenderer` 内部用的是缩小后的缓冲区（`buffer.resize(width / scaling, height / scaling)`，`scaling` 默认 4），这是刻意为了性能而牺牲精度的结果。

### 在建筑里实现 `drawLight()`

如果你的方块是建筑，最省事的做法是重写建筑类的 `drawLight()`——`BlockRenderer` 会在建筑进入视野时自动调用它（对应源码就是渲染循环里的 `entity.drawLight()`）：

```java
@Override
public void drawLight(){
    Drawf.light(x, y, lightRadius * Math.min(smoothTime, 2f), Tmp.c1.set(color), brightness * efficiency);
}
```

这段是原版`照明器`（`LightBlock`）的实现，`smoothTime` 让亮度平滑过渡，`efficiency` 让它没电时变暗。顺带一提，`Block` 侧还有两个相关字段：`emitLight`（为 `true` 且该格子上没有建筑时，会调用 `Block.drawEnvironmentLight`，用于地形类光源）和 `lightColor`、`obstructsLight`（会不会遮挡光）。

### 不规则光带：圆拼不出来的时候

`add(x, y, radius, color, opacity)` 只能画圆，`line(...)` 只能画直线段，所以碰到护盾弧、等离子流、闪电链、能量虹吸这种“沿着一条曲线发光”的东西时，得自己按路径铺。三种写法，按手里有什么来挑：

**一、沿路径铺圆点。** 最稳、最不容易出错的一种：路径上每隔半径的一半左右放一个圆，重叠部分会按 `Gl.max` 取较大值（光照层用的是 `blendEquationSeparate(funcAdd, max)`），不会叠成刺眼的白块：

```java
renderer.lights.add(() -> {
    int steps = 12;
    for(int i = 0; i < steps; i++){
        float p = i / (float)(steps - 1);
        float px = x1 + (x2 - x1) * p;
        float py = y1 + (y2 - y1) * p + Mathf.sin(Time.time * 0.06f + i * 0.6f) * 3f;
        float fade = 1f - Math.abs(p - 0.5f) * 1.2f;   // 中间粗、两头细
        renderer.lights.add(px, py, 40f * fade, color, 0.5f);
    }
});
```

注意 `add(Runnable)` 的 lambda 是每帧新建的（圆形光那边有 `circles` 池化，`Runnable` 没有），所以能直接用 `add(x, y, radius, ...)` 的地方就别包 lambda。

**二、自己用 `Lines` 画带子。** 曲线本身能算出来（贝塞尔、圆弧、螺旋）时最省事，`Lines.stroke()` 控制半宽：

```java
renderer.lights.add(() -> {
    Draw.color(Tmp.c1.set(color).a(0.6f));
    Lines.stroke(7f);
    Lines.curve(x1, y1, cx1, cy1, cx2, cy2, x2, y2, 24);   // 三次贝塞尔，24 段
    Lines.stroke(1f);
    Draw.color();                                          // 别把颜色漏给后面的光
});
```

**三、直接用 `LightRenderer.line()` 画贴图带。** 它内部拿 `circle-mid` 和 `circle-end` 两张贴图拼出一个带端帽的四边形，`stroke` 是半宽。直线光带用它就够，曲线就沿路径连续调几次、接缝处再补一个圆点：

```java
renderer.lights.line(x1, y1, x2, y2, 6f, color, 0.7f);
```

如果形状完全不是“圆”也不是“带”（比如一片泪滴形的光、贴着贴图边缘的轮廓光），`LightRenderer.add(x, y, region, rotation, color, opacity)` 可以直接把任意 `TextureRegion` 塞进光照层，还带旋转。

---

## 五、泛光（Bloom）：让亮部溢出

前面两种手段都不会产生“糊出边界”的光晕，那是泛光的活儿。泛光做的事是：**截取画面 → 掐掉不够亮的像素 → 多次高斯模糊 → 把模糊结果加回屏幕**。

### 游戏里的泛光写在哪儿

`Renderer` 的相关代码一共就这几行：

```java
bloom.resize(graphics.getWidth(), graphics.getHeight());
bloom.setBloomIntensity(settings.getInt("bloomintensity", 6) / 4f + 1f);
bloom.blurPasses = settings.getInt("bloomblur", 1);
Draw.draw(Layer.bullet - 0.02f, bloom::capture);
Draw.draw(Layer.effect + 0.02f, bloom::render);
```

关键就在最后两行：**泛光只捕获 `Layer.bullet(100) ~ Layer.effect(110)` 之间的绘制**。这解释了那个流传很广的玄学技巧——`Draw.z(Layer.bullet)` 会让东西“亮起来”：不是图层本身有魔法，而是你把自己挪进了泛光的取景框。

`Bloom` 的内部默认值是 `threshold = 0.5`、`bloomIntensity = 2.5`、`originalIntensity = 1`（设置里的“泛光强度”默认 6，经 `/4f + 1f` 换算后正好 2.5）。`threshold` 的含义是“亮度低于 0.5 的像素直接归零”，所以在这个区间里画**低饱和暗色不会泛光，画亮色或者纯白才会**。

### 想让自定义的东西泛光

这个问题的答案完全取决于你现在站在哪个“绘制上下文”里，因为泛光的取景框就是 `Renderer.draw()` 中间那么一段：

- **在 `Block.draw()` / `Building.draw()` 里画的。** 默认在 `Layer.block` 附近，既不在取景框里，还可能被 `drawCached` 烘进 `SpriteCache`（见第二节），两种原因都不泛光。
- **在 `BulletType.draw`、`Effect.render`、`Fx` 里画的。** 本来就在 `Layer.bullet ~ Layer.effect` 之间，只要颜色够亮就自动泛光，什么都不用做。
- **在 `Events.run(Trigger.draw, ...)` 里按 `Draw.z()` 自己排层画的。** 看你把 z 排到哪儿，排进区间才有。
- **在 UI 里画的（`Table`、`Dialog` 的 `draw()`、HUD 的绘制回调）。** 那时 `Draw.sort(false)` 且泛光早已合成完毕，永远不泛光。

所以“让自定义的东西泛光”这句话，多数时候其实是在说第一种情况。最直接的办法：临时把 z 借到区间里去。

```java
float z = Draw.z();
Draw.z(Layer.bullet);   // 100，落在泛光捕获区间内
Draw.blend(Blending.additive);
Draw.color(Color.white);
Draw.alpha(0.8f);
Draw.rect(Core.atlas.find("my-mod-my-effect"), x, y);
Draw.reset();
Draw.blend();
Draw.z(z);
```

代价也很明显：`Layer.bullet` 之后才是单位、护盾、UI，你的光晕会被士兵、子弹、炮塔盖住。所以“真正贴在地面上的光”和“要压过一切的光”要分开处理，这时候就轮到层级排序的知识了（见 5.8 节）。

### 调整与手动泛光

运行时调整全局泛光强度，标准做法是改设置项，让渲染器自己重新读取：

```java
Core.settings.put("bloomintensity", 12);  // 越大越亮
Core.settings.put("bloomblur", 3);        // 模糊遍数，越大越贵
```

也可以直接改实例：

```java
if(renderer.bloom != null){                 // 必须判空！
    renderer.bloom.setBloomIntensity(3f);
    renderer.bloom.blurPasses = 2;
    renderer.bloom.setThreshold(0.35f);     // 更低的阈值 = 更多东西泛光
}
```

`renderer.bloom` 是 `@Nullable` 的：玩家在设置里关掉泛光，或者着色器创建失败（`Renderer.setupBloom()` 里有 `catch`，失败时会自动 `settings.put("bloom", false)` 并弹错误提示），它都会是 `null`。

如果你想要“只有我的东西泛光，背景一概不动”，那就得自己 `new Bloom(true)` 开一个带 alpha 混合的独立通道，用 `capture()` / `render()` 包住自己的绘制。这是第 8 章的范围（FBO、着色器、混合），本章只提醒一点：**这样的第二个 Bloom 实例会额外占用三张帧缓冲**，移动端不要随便开。

---

## 六、性能与常见翻车点

1. **混合模式切换会打断批次。** `Batch.setBlending()` 发现混合模式变了就会 flush，所以加色绘制要尽量集中在同一层级（这正是 `Layer.blockAdditive` 存在的理由）。
2. **别在 `draw()` 里 `new` 任何东西。** 每帧都跑的代码里 `new Color(...)`、`new Runnable`、字符串拼接都会持续产生垃圾，用 `Tmp.c1`、静态常量和 `Core.atlas.find` 的缓存结果。
3. **三个复位缺一不可：** `Draw.reset()`（颜色/缩放）、`Draw.blend()`（混合模式）、`Draw.z(z)`（层级，如果你改过）。
4. **贴图名不要写错。** 找不到时不会崩溃，只是默默给你 `error` 贴图，然后在别人的游戏里变成一个诡异的方块。
5. **泛光和光照在移动端都不便宜。** 泛光要三张帧缓冲加多次全屏模糊，光照是每帧重建的光点列表；能在“加色贴图”层面解决的就别上泛光。
6. **别指望加法混合“更亮”：** 颜色通道值在最终输出时会被裁剪，想要更亮只能靠多次叠加、提高 alpha 或换更大的发光面积。

---

## 七、检查清单

动手之前，按这几句话对一下自己的需求，基本就不会走弯路：

- **“我只是想让它看起来自己在亮。”** 那多半用不着泛光。给方块补一张 `-glow` 贴图，套 `DrawGlowRegion`，或者自己写一行加色 `draw()`，就够了。
- **“我想让它真的照亮周围的黑暗。”** 这是光照的活。建筑重写 `drawLight()`，别的东西直接 `Drawf.light(...)`。但先确认地图真的开了光照，不然你写了也看不见。
- **“我想让它像子弹、爆炸那样，亮到溢出去。”** 这才轮到泛光。最省事的做法是把绘制塞进 `Layer.bullet ~ Layer.effect` 之间；想要独占一条通道，就自己开一个 `Bloom`。
- **“画完以后整个屏幕亮得发白。”** 八成是漏了 `Draw.blend()`；剩下两成是贴图本身太亮、或者 alpha 给得太高。
- **“一进夜间地图就掉帧。”** 数一数每帧有多少次 `Drawf.light` / `renderer.lights.add`，再看看泛光区间里到底画了多少东西。能退回加色贴图解决的，就别留在光照和泛光里。
- **“亮度怎么调都上不去。”** 颜色通道最后会被裁剪，靠加 alpha 加不上去。要么叠两层，要么把发光面积放大，要么去改 `bloomintensity`。
