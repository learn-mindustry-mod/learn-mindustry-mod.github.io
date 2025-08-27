# 钻头和泵

> ***我们不生产资源，我们只是资源的搬运工***

## 创建一个Drill

::: code-group

```java
new Drill("tutorial-drill");
```

```kotlin
Drill("tutorial-drill")
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
- `blockedItems`：不能挖的物品，是一个`Seq`，基本全等于`ArrayList`。设置的时候可以直接使用`Seq.with(item1, item2, ...)`这样的语法。
- `drillMultipliers`：各种物品的 **速度而非时间** 倍率，设置时使用`drillMultipliers.put(item1, 100f)`这样的语法。

这样，每种物品的钻探时间由下式决定，这表明物品硬度在钻探时间的影响可以通过设置合理的`hardnessDrillMultiplier`改变，最终还要除以物品在`drillMultiplier`的值，如果没设置为就是`1f`：

``` java
(drillTime + hardnessDrillMultiplier * item.hardness) / drillMultipliers.get(item, 1f)
```

钻头的贴图比较有新意，你不止需要其本体贴图`tutorial-drill.png`，至少还需要两张贴图，分别叫`tutorial-drill-rotator.png` `tutorial-drill-top.png`。三张贴图分别为钻头的框架、转子、顶端定子。如果你的钻头还有爆炸钻头那样的光环，你还需要一张以`-rim`为后缀的贴图；如果你的钻头凹处不是正中间或`size >= 5 || size == 1 `，你还需要一张`-item`为后缀的贴图。相关贴图在原版体现：

//TODO 图图

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

## 钻头的消耗项声明

钻头的消耗器声明和工厂的语法完全一致。但钻头默认会输出所有物品，所以尽量不要使用物品对进行强化。

不过，你可能想达到的效果是像原版一样，在有水的时候加强钻头，而不是必须要水才能工作，这时你只需要使用如下语法：

``` java
consumeLiquid(Liquids.water, 0.05f).boost();
```

## 创建一个Pump

::: code-group

```java
new Pump("tutorial-pump");
```

```kotlin
Pump("tutorial-pump")
```

:::

泵唯一的特点就是其抽取速度`pumpAmount`，不要忘记涉及流体时，时间的单位都要取刻。

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


## 共性

这两类方块在资源上存在一定的共性，他们在生产中起到类似**生产者**的作用，是原材料的创造者，对于钻头系统来说，合理安排`hardness`和`tier`的关系可以营造出逼真的科技树。

从代码层面上来讲，`Drill`和`Pump`都属于功能特化，设置单一的类，原版像这样的类还有很多。

## 思考
为什么抽水机不是`Pump`？