
# 工厂


> ***游戏的灵魂***

作为一个工厂+塔防+RTS游戏，Mindustry的第一大灵魂玩法当之无愧是“工厂”。工厂的作用可以概括为“转换”，即把输入的物品、流体、电力、热量等资源耗费一定时间转换成新的物品或流体。

## 创建一个GenericCrafter

像物品和流体一样，所有方块都被封装成了一个类型`mindustry.world.Block`的**子类（Subclass）**。不同方块有着不同的功能，可以设置不同的属性，这就需要方块拥有不同的类型。因此，在创建一个方块的时候，需要根据需要的功能选择合适的类型。要创建一个通用工厂，需要的类型为`mindustry.world.blocks.production.GenericCrafter`。

::: code-group

```java
new GenericCrafter("tutorial-crafter");
```

```kotlin
GenericCrafter("tutorial-crafter")
```

:::

和上节一样，你可以选择简单地在主类的`loadContent()`里创建这个对象，也可以选择选择新建一个类来存放所有的工厂或所有的方块。

## 方块的共性

如果只是创建了这个对象，而不做任何设置，那么在核心数据库和建造栏中均不会见到这个方块，因为方块默认是隐藏的。所以，你需要设置一些属性来让方块“现形”。

对于一个方块来说，最基本的属性有以下几个：

- `health`：建筑的生命值；
- `size`：建筑的尺寸，也就是边长。注意，Mindustry原生不支持非正方形建筑；

还有四个属性也是基本属性，但设置它们并不推荐直接给对应字段赋值，而是应该使用`requirements`方法。这个方法有很多版本的重载，根据形参的名称和类型可以得知各个重载版本中参数的含义。

- `alwaysUnlock`（在参数列表中叫`unlocked`）：顾名思义，即为在战役模式中是否始终解锁；
- `category`：方块所属的类别，原版有十大类别，分别对应建造栏中的十个图标，从上到下分别为`turret`（炮塔）、`production`（生产）、`distribution`（物流）、`liquid`（液体）、`power`（电力）、`defense`（防御）、`crafting`（制造）、`units`（单位）、`effect`（特殊）、`logic`（逻辑）；
- `requirements`（在参数列表叫`stacks`）：建造方块所需的物品。参照原版可知，有一个**工厂方法**`ItemStack.with`专门用来生成一个`ItemStack[]`供这个方法使用。注意，建造时间是直接通过建造耗费物品量来计算的，也可以通过`buildCostMultiplier`间接控制，具体设置方法见于下方代码；
- `buildVisibility`：建筑可视性，即为某一方块是否在建造栏或核心数据库中可见，默认为`BuildVisibility.hidden`（隐藏状态），需要设置成`BuildVisibility.shown`才能默认显示。其余的`BuildVisibility`会在几节之后提到。

如你所见，如果不设置`requirements()`，那么方块默认就是处于隐藏状态。所以，你需要使用任意一个`requirements()`方法来设置`buildVisibility`。例如，可以使用这样的代码：

::: code-group

```java
new GenericCrafter("tutorial-crafter"){{
  health = 100f;
  size = 2;
  //使用此重载，Anuke会贴心地帮你设置成BuildVisibility.shown
  requirements(Category.crafting, ItemStack.with(Items.copper,50,Items.lead,50));
}};
```

```kotlin
GenericCrafter("tutorial-crafter").apply{
  health = 100f
  size = 2
    //使用此重载，Anuke会贴心地帮你设置成BuildVisibility.shown
  requirements(Category.crafting, ItemStack.with(Items.copper,50,Items.lead,50))
}
```

:::

从这里开始，你将会需要在代码当中 **引用（Refer to）** 原版的内容。原版的内容的引用大部分都存放在`mindustry.content`这个包下对应的类中，例如`mindustry.content.Items`存放了所有物品的引用，`mindustry.content.Blocks`存放了所有的方块的引用。在这些存放内容的类中，变量名起到标识的作用，通常与内容的内部名称或英文名是保持一致的，例如铜（Copper）是`mindustry.content.Items.copper`，双管（Duo）是`mindustry.content.Blocks.duo`。引用本模组的内容也是类似的，如果你的内容声明在`loadContents`方法中，你需要用一个变量把它的引用存起来，然后直接引用变量即可。如果你仿照原版的组织架构，那么引用时也和原版类似。关于引用其他模组的内容，详见本章最后一节。

值得注意的是，方块的建造时间并不是手动设置的，而是由建造需求决定的，计算公式为需求物品的`cost`总和再乘以`buildCostMultiplier`。如果你觉得某个方块的建造时间过长，但又不想更改物品的`cost`时，可以设置`buildCostMultiplier`为一个比1小的数来降低建造时间。 **直接设置`buildCost`不会起效，因为计算`buildCost`在创建对象之后很久之后才会发生**。

接下来同样需要给方块分配名称和贴图：

```properties bundle_zh_CN.properties
block.tutorial-mod-tutorial-crafter.name = 演示工厂
block.tutorial-mod-tutorial-crafter.description = 工厂，也叫冶炼厂、压缩机、混合器、编织器、离心机、提取器、抽水机、培养器
block.tutorial-mod-tutorial-crafter.details = 工厂游戏没有工厂叫什么工厂游戏
```

```properties bundle.properties
block.tutorial-mod-tutorial-crafter.name = Turorial Crafter
block.tutorial-mod-tutorial-crafter.description = Crafter may also be called smelter, compressor, mixer, weaver, centrifuger, extractor and cultivator.
block.tutorial-mod-tutorial-crafter.details = Without factory you cannot spell "factory game"
```

至于贴图，你需要根据方块的尺寸而定，一般每一个地图格子为`32px*32px`（px为像素的意思）。如`3x3`的方块应使用`96px*px`大小的贴图。

## 声明消耗器（Consume）

接下来，你可以为工厂添加输入（Input）。在Mindustry中，大部分输入都被抽象成了一个**消耗器（Consumer）**对象。

Anuke已经封装好了常用的消耗器的声明，这些方法的功能正如其字面义：

``` java
//每次生产消耗1个铜
consumeItem(Items.copper,1);
//每次生产消耗1个铜和2个铅
consumeItems(ItemStack.with(Items.copper,1,Items.lead,2));
//生产时每“刻”（见下）消耗1单位水
consumeLiquid(Liquids.water,1f);
//生产时每刻消耗1单位水和2单位矿渣
consumeLiquids(LiquidStack.with(Liquids.water,1f,Liquids.slag,2f));
//生产时每刻消耗1单位电力
consumePower(1f);
```

值得注意的是，流体和电量的消耗都是以 **刻（Tick）** 为单位的，而`1s = 60tick`，例如，`consumePower(60f)`实际上每秒消耗3600电力。因此，应当注意此处的单位换算问题，避免出现消耗速率意外扩大60倍的问题。

以上只是消耗器字面上的用法。事实上，原版中火力发电机的燃料消耗、炮塔的冷却剂等也是消耗器的功能。这些“不正常”的消耗器并没有什么不同，也可以应用在工厂中。

``` java
//像火力发电机一样，消耗高燃烧性的物品，额外提升的工作效率由物品的燃烧性决定
consume(new ConsumeItemFlammable());
//像火力发电机一样，遇到高爆炸性的物品会炸坏方块
consume(new ConsumeItemExplode());
//像炮塔一样，使用冷却剂提高工作效率
consume(new ConsumeCoolant(1f));
```

Anuke没有封装这些特殊消耗器的“快速通道”，所以你需要用基本方法`consume()`来**注册（Register）**消耗器。查阅源代码可知，`consumeItem()`等方法也是对`consume()`方法的包装。本教程后续章节将会继续深入了解消耗器的相关机制，届时你可以创建自己的消耗器。

最后仍要强调的是，一个类型为`GenericCrafter`的方块有且仅有一个配方，所有的消耗器都是这个配方的输入，自相矛盾的消耗器会导致方块无法正常工作。

## 输出项

接下来，你可以为工厂添加输出项。`GenericCrafter`的输出是由`outputItem` `outputItems` `outputLiquid` `outputLiquids`声明的。

``` java
//每次生产输出1个铜
outputItem = new ItemStack(Items.copper, 1);
//或
//每次生产输出1个铜和2个本模组物品
outputItems = ItemStack.with(Items.copper, 1, ModItems.item1 ,2);

//生产时每刻输出1单位水和2单位矿渣
outputLiquids = new LiquidStack(Liquids.water, 1f);
//或
//生产时每刻输出1单位水和1单位本模组流体
outputItem = LiquidStack.with(Liquids.water, 1f, ModItems.liquid1, 2f);

//同时设置`outputItem`和`outputItems`会无视`outputItem`，流体同理。
```

如果想要让工厂输出电力，可以让工厂消耗负的电量，但是不推荐这么做，因为兼容性较差。但如果想同时输出物品和发电则不得不这样做。

``` java
//不推荐
//生产时每刻消耗-1单位电力，即输出1单位电力
consumePower(-1f);
```

至于输出热量，则需要调整方块的类型才能做到，见于下文。

## 其他字段

除了输入和输出，生产时间`craftTime`也是工厂的要素。这个字段也是以刻为单位的。

对于输出多种流体的工厂（如电解器），可以用`liquidOutputDirections`控制各种流体的输出面，设置为-1表示任意方向。Mindustry中的方向与数学上任意角的定义是一致的，都是以x轴正方向开始，沿逆时针旋转，这样可以得到`右0上1左2下3`的四个方向。这个字段的顺序需要和`outputLiquids`保持一致。此外，你还需要控制是否忽略部分流体已经充满，`dumpExtraLiquid`为`true`时表示“只要有一种流体还没满就继续工作”，而`ignoreLiquidFullness`表示无论流体输出什么状态均无视。

关于`updateEffect` `craftEffect`等特效和`ambientSound` `destroySound` `breakSound` `placeSound`等音效，见于本章第五节。

## 声明绘制器（Drawer）

在v7版本之前，原版工厂仅有少数几种绘制模式，且绘制内容受工厂类型限制。v7版本更新后，绘制系统发生了显著变化：一方面，所有无需热量需求且无地形增益的工厂被统一归入 `GenericCrafter` 类型；另一方面，绘制逻辑被抽离为独立的绘制器（Drawer）组件。这一改动增强了JSON模组在绘制行为上的自定义能力，同时优化了Java端的工厂架构，提升了绘制模式的复用性。本节将首先介绍如何使用与组合原版中已有的绘制器。

最基本的drawer是`DrawDefault`，可以绘制一张名称与本工厂相同的贴图。使用方式如下：

``` java
drawer = new DrarDefault();
```

Drawer可以对绘制过程进行一定拓展，在`mindustry.world.draw`包中还有许多drawer可供使用。但是一个方块只有一个`drawer`字段，大部分drawer只能做一件事，需要配合使用。这时，你可以使用`DrawMulti`来对drawer进行组合：

```java
drawer = new DrawMulti(
                new DrawRegion("-bottom"),
                new DrawLiquidTile(Liquids.water, 2f),
                new DrawBubbles(Color.valueOf("7693e3")),
                new DrawRegion(),
                new DrawLiquidOutputs(),
                new DrawGlowRegion()
                );
```

一个`DrawMulti`中可以包括多个drawer，这些drawer将会按照声明顺序从先到后，按照从下到上叠加绘制，最终获得较佳的效果。


![neoplastic-reactor](imgs/neoplastic-reactor.gif)

有的drawer会加载贴图。例如`DrawerDefault`需要一张与方块内部名相同的贴图，`DrawRegion`的有参构造器版本会需要一张内部名+特定后缀的贴图，`DrawGlowRegion`需要一张`-glow`为后缀的贴图。各个drawer所加载的贴图要求都会呈现在其`load()`方法。

原版所有的drawer如下表：

| 名称 | 效果 | 所需贴图后缀 | 使用例 |
|:---:|---|---|---|
| DrawArcSmelt | 绘制半径周期变化的圆，和一些向四周飞出的、充当火焰的短线 |  | 电弧硅炉 |
| DrawBlock | 是抽象类，不能直接使用 |  | 所有方块 |
| DrawBlurSpin | 低速时绘制一个旋转贴图，高速时绘制动态模糊版的旋转贴图 | $suffix$和$suffix$-blur | 涡轮冷凝器 |
| DrawBubbles | 绘制一些泡泡 |  | 电解器 |
| DrawCells | 绘制流体层和一些在流体里放大缩小的粒子 | middle | 瘤变反应堆中心瘤液处 |
| DrawCircles | 绘制一些会放大缩小的粒子 |  | 合金坩埚和瘤变反应堆四周 |
| DrawCrucibleFlame | 绘制向内运动并缩小的粒子 |  | 碳化物坩埚的中心 |
| DrawCultivator | 绘制在随机位置出现的逐渐扩大的八边形 |  | 培养机 |
| DrawDefault | 绘制贴图 | 无后缀 | 大部分方块 |
| DrawFade | 绘制有周期性变化颜色的遮罩层 | top | 塑钢压缩机 |
| DrawFlame | 绘制工作时周期性变化大小的灯 | top | 硅冶炼厂 |
| DrawFrames | 绘制随工作进度周期性或线性变换的贴图 | frame$i$ | 无 |
| DrawGlowRegion | 绘制亮度随工作进度线性变化的贴图 | glow | 热解发生器 |
| DrawHeatInput | 绘制亮度随输入热量线性变化的贴图 | heat | 所有带热量输入的方块 |
| DrawHeatOutput | 绘制亮度随输出热量线性变化的贴图 | heat glow top1 top2 | 所有带热量输出的方块 |
| DrawHeatRegion | 绘制亮度随热量线性变化并周期变化的贴图 | glow | 所有热量工厂 |
| DrawLiquidOutputs | 按输出流体面（liquidOutputDirections）绘制贴图 | $liquid$-output | 电解器 |
| DrawLiquidRegion | 绘制透明度随指定或当前存在流体量变化的贴图 | liquid | 孢子压缩机 |
| DrawLiquidTile | 绘制透明度随指定或当前存在流体量变化的纯色层 |  | 冷冻液混合器 |
| DrawMulti | 组合多个Drawer |  | 基本所有方块 |
| DrawMultiWeave | 绘制两个旋转的、会发光的梭子| weave weave-glow | 相织布合成机 |
| DrawParticles | 绘制粒子特效 |  | 大气收集器 |
| DrawPistons | 绘制一圈周期收缩的活塞 | piston | 热解发生器 |
| DrawPlasma | 绘制旋转的、透明度随预热程度线性变化的多张贴图 | plasma-$i$ | 冲击反应堆 |
| DrawPower | 绘制颜色随电量线性变化的贴图 | power或（power-empty和power-full） | 电池 |
| DrawPulseShape | 绘制一个逐渐扩大的菱方形或圆形 |  | 再生投影仪 |
| DrawPumpLiquid | 绘制与抽取流体同色的贴图 | liquid | 泵 |
| DrawRegion | 绘制一张贴图 |  |  |
| DrawShape | 绘制一个多边形 |  | 再生投影仪 |
| DrawSideRegion | 绘制一个与朝向有关（右上/左下）的贴图 | top1 top2 |  |
| DrawSoftParticles | 绘制柔软的粒子特效 |  | 通量反应堆 |
| DrawSpikes |（未知）|  | 相织布合成机 |
| DrawTurret | 绘制炮塔的part | 视情况而定 | 所有很帅的炮塔 |
| DrawWarmupRegion | 绘制随预热程度变化的贴图 | top | RTG发电机 |
| DrawWeave | 绘制一个旋转的的梭子 | weave | 相织布编织器 |

此外有几点须知：
- 大部分drawer为了增加动态效果，会通过正弦函数对绘制的参数增加一个周期性变化的值，这种现象称为 **“律动”（Pulse）** ，而正弦函数y=Asinωx中的A、ω分别叫作振幅（Magnificance）和频率（Scale），缩写分别为Mag和Scl；
- 上提到的所有变化中的自变量都不是“量”，而是“量”与“容量”的比值（这种处理叫 **归一化（Normalized）** ），介于0-1之间（有时会超过1），比如`DrawLiquidTile`的自变量是流体量与流体容量的比值。


## 一些特殊的工厂子类型

并非所有工厂都是`GenericCrafter`。正如开头所说，不同的功能需要不同的类型，地形增益工厂的类型是`mindustry.world.blocks.production.AttributeCrafter`，有热量需求的工厂的类型是`mindustry.world.blocks.production.HeatCrafter`，热量产生器为`mindustry.world.blocks.heat.HeatProducer`（不在`production`包内）。

这三个类型都是`GenericCrafter`的子类，也就是说，上文所提的一切字段在这两个类型中都是可用的；相应地，这三个类也有一些新增的属性：

对于`AttributeCrafter`：

- `atrribute`：使此工厂获得增益或减益的**属性（Attribute）**，原版中的attribute包括`heat` `spores` `water` `oil` `light` `sand` `steam`等，均与名称相同；
- `baseEfficiency`：无增益效果时的基础效率；
- `boostScale`：增益效果的倍率；
- `maxBoost`：增益效果的最大值，为增量；
- `minEfficiency`：允许放置方块的最低增益效果，`-1`为无需增益也可放置；
- `displayEfficiencyScale`：在显示工厂效率时的一个乘数；
- `displayEfficiency`：是否在方块的 **放置栏（Placement Fragment）**显示工厂效率，即屏幕右下角显示建筑血量的部分；
- `scaleLiquidConsumption`：是否在更改效率的同时改变流体消耗速率。

对于`HeatCrafter`：

- `heatRequirement`：所需热量；
- `overheatScale`：当获取热量超出所需热量时，多出的热量将以多大的比例提高效率，默认是按原倍数增长；
- `maxEfficiency`：由热量增益产生的最大效率。

对于`HeatProducer`：
- `heatOutput`：热量输出；
- `warmupRate`：预热速度。

## 加载顺序

在方块中使用模组内的物品或流体时，应确保这些内容先于方块本身加载，否则可能引发 `NullPointerException` 异常或游戏内显示异常。为此，只需确保物品或流体的注册代码在方块的注册代码之前执行即可。


## 思考题
只有那些category为crafting的才算是工厂吗？查找原版还有哪些方块也是工厂，并思考用工厂还能做出来什么新奇的策划设计。
