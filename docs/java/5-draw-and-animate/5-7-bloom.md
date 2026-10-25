# 泛光（Bloom）

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

## 二、加色混合：最便宜、也最够用的“发光”

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

> **贴图找不到会怎样？** `Core.atlas.find("xxx")` 永远不返回 `null`，找不到时给的是 `error` 占位贴图（屏幕上会出现一个带叉的方块）。如果你希望“没有 `-glow` 贴图就干脆不画”，用 `Core.atlas.has(name)` 判断，或者 `find` 之后检查 `region.found()`。

---

## 三、屏幕光照：让光真的照亮黑暗

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

需要不规则形状（比如光带、环形护盾）时，用 `renderer.lights.add(Runnable)` 手动往光照层里画 `Lines` 或自定义图元即可，`LightRenderer.add` 还有接受 `TextureRegion` 和 `rotation` 的重载。

---

## 四、泛光 Bloom：让亮部溢出

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

最直接的办法：在画特效的地方临时借一下这个区间。

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

## 五、性能与常见翻车点

1. **混合模式切换会打断批次。** `Batch.setBlending()` 发现混合模式变了就会 flush，所以加色绘制要尽量集中在同一层级（这正是 `Layer.blockAdditive` 存在的理由）。
2. **别在 `draw()` 里 `new` 任何东西。** 每帧都跑的代码里 `new Color(...)`、`new Runnable`、字符串拼接都会持续产生垃圾，用 `Tmp.c1`、静态常量和 `Core.atlas.find` 的缓存结果。
3. **三个复位缺一不可：** `Draw.reset()`（颜色/缩放）、`Draw.blend()`（混合模式）、`Draw.z(z)`（层级，如果你改过）。
4. **贴图名不要写错。** 找不到时不会崩溃，只是默默给你 `error` 贴图，然后在别人的游戏里变成一个诡异的方块。
5. **泛光和光照在移动端都不便宜。** 泛光要三张帧缓冲加多次全屏模糊，光照是每帧重建的光点列表；能在“加色贴图”层面解决的就别上泛光。
6. **别指望加法混合“更亮”：** 颜色通道值在最终输出时会被裁剪，想要更亮只能靠多次叠加、提高 alpha 或换更大的发光面积。

---

## 六、检查清单

- 我只是想让方块“看起来在发光”？→ 加色混合 + `-glow` 贴图，收工。
- 我想让它在黑暗里照亮周围？→ `drawLight()` + `Drawf.light`，注意 `lighting` 和 `ambientLight`。
- 我想让它像子弹一样有溢出光晕？→ 画到 `Layer.bullet ~ Layer.effect` 之间，或者自己开一个 `Bloom` 通道。
- 画完之后画面一直发白/一直很亮？→ 检查有没有漏掉 `Draw.blend()`。
- 夜间地图卡顿？→ 数一数每帧的 `Drawf.light` 调用和泛光区间里的绘制次数。
