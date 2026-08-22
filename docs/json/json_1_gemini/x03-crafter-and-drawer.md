# 0x03 工厂、方块通性与绘制器

> ***“机械的轰鸣是工业的心跳。”***

作为一个以工厂、物流和塔防为核心的游戏，生产机制自然是重中之重。在 Mindustry 中，方块（Block）是构成一切物理实体的基石，而工厂（Crafter）则是将低级资源转化为高级资源的心脏。

本章，我们不再只提供一个枯燥的模板。我们将像剥洋葱一样，为你深度解析方块的底层运行逻辑、各个字段的实际意义，以及 v7 时代最为核心的 **多层绘制器系统（Drawer System）**。

**学习本章需要具备的基础：**
- 已经掌握了 0x02 中物品与流体的创建方法。

---

## 一、 方块通性与隐性机制

无论是炮塔、发电机还是我们要做的工厂，它们在 Java 底层都继承自同一个名为 `Block` 的父类。因此，它们共享一套极为庞大的基础属性库。

请在 `content/blocks/production/` 目录下创建一个 `silicon-steel-smelter.hjson`（硅钢冶炼厂）。我们先看它的共通属性：

```hjson
{
  // 必须声明具体的子类型。GenericCrafter 是最通用、也是最基础的工厂类
  type: GenericCrafter
  
  // 占地大小：3 代表这是一个 3x3 的方块。注意：Mindustry 原生不支持长方形方块
  size: 3
  
  // 血量：方块承受伤害的上限。通常 3x3 的工厂血量在 300 到 500 左右
  health: 400
  
  // 所属分类：决定了它在 UI 底部的哪个分类栏里出现。常见分类有：
  // crafting(制作), power(电力), turret(炮塔), defense(防御墙), distribution(物流)
  category: crafting
  
  // 建造需求：玩家需要花费什么材料才能建造它。
  requirements: [
    copper/100
    lead/50
    graphite/20
  ]
  
  // --- 以下为进阶隐性机制属性 ---
  
  // 建造时间倍率：方块的实际建造时间是根据 requirements 里的物品总 cost 自动计算的。
  // 如果你觉得建得太慢，不要去改物品，而是调整这个倍率（比如 0.5 就是快一倍）
  buildCostMultiplier: 0.8
  
  // 内部容量：工厂内部能“憋”多少东西。默认是 24。
  // 如果你的单次消耗极大（比如一次吃 30 个硅），必须把这个值调高，否则工厂会因为“装不下原料”而永远罢工！
  itemCapacity: 60
  liquidCapacity: 100
}
```

---

## 二、 消耗器 (Consumers) 与加工循环

一个标准的 `GenericCrafter` 运作周期是这样的：**检测材料是否足够 -> 扣除材料并开始预热 -> 等待 craftTime -> 产出物品并播放特效**。

我们用 `consumes`（消耗器）来定义它的胃口：

```hjson
  // 加工时间：制作一次产物需要花费的 Tick 数
  // Mindustry 游戏逻辑固定每秒运行 60 帧（Tick），因此 90 Tick 刚好是 1.5 秒
  craftTime: 90
  
  // 最终产物：注意，如果有你自定义的物品，必须加上你的模组前缀！
  outputItem: my-first-mod-silicon-steel/2
  
  // 消耗器组
  consumes: {
    // 消耗的物品清单
    items: [
      silicon/4
      titanium/2
    ]
    
    // 运行时的电力消耗。这里的数值是【每Tick】的消耗量！
    // 填 1.5 意味着它每秒消耗 1.5 * 60 = 90 电力
    power: 1.5
    
    // （可选）消耗流体
    // liquids: [ water/0.2 ]
  }
  
  // --- 加工表现反馈 ---
  
  // 生产完成瞬间喷发的粒子特效（会在 0x06 章细讲）
  craftEffect: smeltsmoke
  
  // 生产过程中持续不断播放的特效（比如冒出的小火花）
  updateEffect: pulverizeSmall
  
  // 工作时的环境音效及其音量
  ambientSound: loopSmelter
  ambientSoundVolume: 0.88
```

::: tip 机制拓展：液体堵塞问题
如果你的工厂同时产出物品和一种流体（比如原版的塑钢工厂产出塑钢的同时还要产出废液），默认情况下，只要废液管道满了排不出去，整个工厂就会停工。
你可以添加 `ignoreLiquidFullness: true`，这样即使液体满了，工厂也会继续生产物品，多余的液体会直接凭空蒸发掉！
:::

---

## 三、 v7 绘制器系统大揭秘 (Drawer System)

在早期的 Mindustry 版本中，让工厂运转时发光、冒火是一件非常折磨的事情，通常需要懂 Java 的大佬去手写渲染代码。而在 v7 时代，游戏官方将渲染逻辑彻底抽离，形成了一个极其强大的 **多层绘制器 (DrawMulti)** 机制。

这就是为什么像《饱和火力》里的“硅钢高炉”在运转时会有炫酷的底座发光、熔炉内焰喷涌和表面高光等效果。

让我们为我们的硅钢冶炼厂加上高级多层光影：

```hjson
  drawer: {
    type: DrawMulti
    
    // drawers 数组里的元素会按照从上往下（即视觉上的从底层到顶层）的顺序叠加绘制
    drawers: [
      
      // 第一层：底层贴图 (读取 silicon-steel-smelter-bottom.png)
      // 如果你有很多层，最好把底座单独画出来放在底层
      {
        type: DrawRegion
        suffix: -bottom
      }
      
      // 第二层：绘制内部流动的液体效果
      {
        type: DrawLiquidTile
        drawLiquid: slag     // 绘制矿渣的颜色
        padding: 2           // 液体距离方块边缘的缩进像素
      }
      
      // 第三层：高炉火焰特效！
      {
        type: DrawCrucibleFlame
        flameColor: a8baf2A8 // 火焰的颜色
        flameRadius: 2.5     // 基础半径
        flameRadiusMag: 1    // 【律动】火焰随时间跳动的幅度
      }
      
      // 第四层：方块主体默认贴图 (读取 silicon-steel-smelter.png)
      // 如果你的主体贴图中心是透明的，就能看到下面一层的液体和火焰
      { type: DrawDefault }
      
      // 第五层：高亮发光层 (读取 silicon-steel-smelter-glow.png)
      // 它只会在工厂运作时亮起，停止时熄灭
      {
        type: DrawGlowRegion
        color: ffaaaa        // 发光颜色
      }
    ]
  }
```

### 深度理解：Drawer 字典与律动 (Pulse)

在配制 Drawer 时，有几个黑话你必须明白：

1. **后缀 (Suffix)**：像 `DrawRegion` 这样的组件，默认会寻找 `[你的方块名][后缀].png`。如果不写后缀，它就找你的基础方块贴图。
2. **预热 (Warmup)**：这是 Java 底层的一个极小数值（0 到 1）。当机器开机时，它会从 0 慢慢涨到 1；停工时会从 1 降到 0。`DrawGlowRegion` 的透明度就是直接和 `Warmup` 绑定的！
3. **律动 (Pulse - Mag/Scl)**：很多动画（如火焰的跳动）底层用的是正弦函数（Sine Wave）。你看到的 `flameRadiusMag` 代表振幅（跳动有多剧烈），而如果你看到带 `Scl` 的属性，那代表频率（跳动有多快）。

**常见 Drawer 速查表：**

| Drawer 类型 | 效果描述 | 需要的贴图后缀 |
| :--- | :--- | :--- |
| `DrawDefault` | 绘制最普通的方块贴图 | 无后缀 |
| `DrawRegion` | 绘制一张指定的静止贴图 | 你自己定义，如 `-top` |
| `DrawGlowRegion` | 绘制一张发光贴图，亮度随工厂工作状态(预热)变化 | `-glow` |
| `DrawLiquidRegion`| 绘制一张颜色随内部液体颜色变化的图，可调整透明度 | `-liquid` |
| `DrawFlame` | 绘制工作时周期性跳动的灯/火光 | `-top` |
| `DrawWeave` | 绘制一个旋转的梭子（参考原版相织布机） | `-weave` |
| `DrawPistons` | 绘制一圈周期性收缩的活塞 | `-piston` |

只要你灵活组合这些 Drawer 组件并准备好相应的透明层 `.png` 切图，你完全可以用纯 JSON 打造出一个细节爆炸的史诗级工厂！

在掌握了这套系统之后，下一章我们将深入更复杂的生产分离体系与电力网络。