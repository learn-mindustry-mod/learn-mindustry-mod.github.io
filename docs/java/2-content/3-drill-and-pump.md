# 钻头与泵

> ***我们不生产资源，我们只是资源的搬运工***

钻头、光束钻头、凿墙机与泵，以及固态泵、石油压采器，是原版物品与流体的资源生产者，它们构成了自然资源的来源。本节将聚焦这些生产性方块的创建。

## 创建一个Drill

钻头的类型是`mindustry.world.blocks.production.Drill`，它有一个子类`mindustry.world.blocks.production.BurstDrill`，功能是一样的，只是绘制过程更加复杂，且无视物品的硬度。

::: code-group

```java
new Drill("tutorial-drill");
new BurstDrill("tutorial-drill");
```

```kotlin
Drill("tutorial-drill")
BurstDrill("tutorial-drill");
```

:::

对于一个钻头来说，我们最关心的是它的钻探能力，这在游戏里的体现是`tier`，原版资源的硬度遵从下表：

| 资源 | 钻头 | 矿机 | 硬度 |
|:---:|:---:|:---:|:---:|
|沙、废料、石墨|||0|
|铜、铅||独影、阿尔法、贝塔|1|
|煤|机械钻头|恒星、幻形、伽马|2|
|钛、铍|气动钻头、等离子钻机|耀星、巨像、苏醒、策动、发散|3|
|钍|激光钻头||4|
|钨|爆炸钻头、大型等离子钻机||5|
||冲击钻头||6|
||爆裂钻头||7|

- `drillTime`：基础速度，挖每一个物品需要的基础帧数；
- `liquidBoostIntensity`：液体的加速倍率；
- `blockedItems`：不能挖的物品，是一个`Seq`，即序列。设置的时候可以直接使用`Seq.with(item1, item2, ...)`这样的语法。
- `drillMultipliers`：各种物品的 **速度而非时间** 倍率，设置时使用`drillMultipliers.put(item1, 100f)`这样的语法。

这样，每种物品的钻探时间由下式决定，这表明物品硬度在钻探时间的影响可以通过设置的`hardnessDrillMultiplier`来改变，最终还要除以物品在`drillMultiplier`的值，如果没设置为就是`1f`：

``` java
(drillTime + hardnessDrillMultiplier * item.hardness) / drillMultipliers.get(item, 1f)
```

钻头的贴图设计具有特定结构。除了本体贴图 `tutorial-drill.png` 外，通常还需要以下两张贴图：`tutorial-drill-rotator.png`（转子部分）和 `tutorial-drill-top.png`（顶端定子部分）。这三部分分别对应钻头的**框架**、**可旋转的转子**以及**静止的顶端**。

此外，根据钻头的具体设计，可能还需要额外的贴图：
*   **光环效果**：如果钻头需要类似爆炸钻头的光环效果，则需要准备一张以 `-rim` 为后缀的贴图（例如 `tutorial-drill-rim.png`）。
*   **物品图标**：如果钻头的凹口不在正中央，或其尺寸满足 `size >= 5` 或 `size == 1` 的条件，则需要准备一张以 `-item` 为后缀的贴图（例如 `tutorial-drill-item.png`），用于在游戏中更清晰地显示为物品图标。

相关示例可在原版游戏的贴图文件中找到。例如，原版的冲击钻头（`blast-drill`）就包含了上述所有贴图文件：`blast-drill.png`、`blast-drill-rotator.png`、`blast-drill-top.png`、`blast-drill-rim.png` 以及 `blast-drill-item.png`。


```properties bundle_zh_CN.properties
block.tutorial-mod-tutorial-drill.name = 演示钻头
block.tutorial-mod-tutorial-drill.description = 放置在矿物上时，以缓慢的速度无限输出物品。只能开采非常软的资源。不能用水加速。
block.tutorial-mod-tutorial-drill.details = 为什么矿物是无限的啊
```

```properties bundle.properties
block.tutorial-mod-tutorial-drill.name = Tutorial Drill
block.tutorial-mod-tutorial-drill.description = When placed on ore, outputs items at a slow pace indefinitely. Only capable of mining very soft resources. Incapable of using water to boost efficiency.
block.tutorial-mod-tutorial-drill.details = WHY INFINITE ORE
```

## 创建一个BeamDrill和WallCrafter

光束钻头的类型是`mindustry.world.blocks.production.BeamDrill`，凿墙机的类型是`mindustry.world.blocks.production.WallCrafter`。

::: code-group

```java
new BeamDrill("tutorial-beam-drill");
new WallCrafter("tutorial-wall-crafter");
```

```kotlin
BeamDrill("tutorial-beam-drill")
WallCrafter("tutorial-pump")
```

:::

光束钻头和钻头的设置完全相同，区别在于光束钻头需要的贴图数量更多，但是大多数的贴图都有默认值，额外必需的只有`-top`和`-glow`贴图。

凿墙机的设置兼有钻头与属性工厂，既可以设置`drillTime`，也可以设置所需属性`attribute`和输出物品`output`。

## 钻头的消耗项声明

钻头的消耗器声明和工厂的语法完全一致。但钻头默认会输出所有物品，所以不要使用物品对进行强化。

如果在有水的时候加强钻头，而不是必须消耗水才能工作，需要使用如下语法：

``` java
consumeLiquid(Liquids.water, 0.05f).boost();
```

## 创建一个Pump

流体泵的类型是`mindustry.world.blocks.production.Pump`

::: code-group

```java
new Pump("tutorial-pump");
```

```kotlin
Pump("tutorial-pump")
```

:::

泵唯一的属性就是其抽取速度`pumpAmount`，单位为刻。

```properties bundle_zh_CN.properties
block.tutorial-mod-tutorial-pump.name = 演示泵
block.tutorial-mod-tutorial-pump.description = 缓慢地无限抽取流体。
block.tutorial-mod-tutorial-pump.details = 为什么液体地板也是无限的啊
```

```properties bundle.properties
block.tutorial-mod-tutorial-pump.name = Tutorial Pump
block.tutorial-mod-tutorial-pump.description = Pumps liquid slowly and infinitely.
block.tutorial-mod-tutorial-pump.details = WHY LIQUID TILE ALSO INFINITE
```

## 创建一个SolidPump

原版的抽水机是一种固态泵，是在固态地板上抽取流体的方块，类型为`mindustry.world.blocks.production.SolidPump`，它也有一个子类，是石油压采机，是`mindustry.world.blocks.production.Fracker`，只是比抽水机多了消耗物品的功能。

::: code-group

```java
new SolidPump("tutorial-solid-pump");
new Fracker("tutorial-fracker");
```

```kotlin
SolidPump("tutorial-solid-pump")
Fracker("tutorial-fracker")
```

:::

你可以设置它们的产出流体`result`，每刻产出量`pumpAmount`，以及属性增益`attribute`。和钻头一样，你需要一张以`-rotator`为后缀的转子贴图。石油压采机通过`itemUseTime`来设置物品使用时长。

## 钻头与泵的共性

这两类方块（钻头与泵）在资源生产中均扮演着**生产者**的角色，具有相似的功能定位。在钻头系统中，通过合理配置 `hardness`与 `tier`之间的关系，能够构建出层次分明、循序渐进的科技发展路径。

从代码架构来看，`Drill` 与 `Pump` 均属于功能高度特化、设置目的单一的类。此类设计在原版中十分常见，它们通过继承特定的基础类，专注于实现某一项核心的生产逻辑。

