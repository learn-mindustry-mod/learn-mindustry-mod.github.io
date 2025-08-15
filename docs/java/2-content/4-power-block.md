# 电力方块

电力是原版的能源之一，大部分内容都需要电力的参与。电力生产者即为发电机（Generator），电力的传输需要电力节点（PowerNode），还可以被电池（Battery）存储，最终被方块中的电力模块（PowerModule）消耗，而电网（PowerGraph）承担了一切的调度工作。

## 发电机

原版有七种有具体功能的发电机，由同一个基类`PowerGenerator`统领。基类只声明了两个功能，一是在统计面板中显示的发电量，二是要被毁后发生爆炸。具体的发电方式由子类承担。通常来说，一个发电机的发电量由基础发电量和实际效率进行计算。

### 太阳能板（SolarGenerator）

单纯地根据天气调节实际效率，没有可调节的地方。

::: code-group

``` java
solarPanel = new SolarGenerator("tutorial-solar-panel"){{
    requirements(Category.power, ItemStack.with(Items.lead, 10, Items.silicon, 8));
    powerProduction = 0.12f;
}};
```
``` kotlin
solarPanel = SolarGenerator("tutorial-solar-panel").apply{
    requirements(Category.power, ItemStack.with(Items.lead, 10, Items.silicon, 8))
    powerProduction = 0.12f
}
```
:::

### 地热发电机（ThermalGenerator）

根据下方方块的Attribute计算效率，就像工厂中的`AttributeCrafter`一样。可以设置最低工作效率`minEfficiency`。埃里克尔上的涡轮冷凝器也是一个“地热发电机”，这是由于蒸汽喷口也是一种Attibute（即`steam`），所以“地热发电机”有`outputLiquid`可以输出流体。

::: code-group

``` java
thermalGenerator = new ThermalGenerator("tutorial-thermal-generator"){{
    requirements(Category.power, with(Items.copper, 40));
    size = 2;
    //设置为floating是为了能放置在矿渣地板上
    floating = true;
}};
```
``` kotlin
thermalGenerator = ThermalGenerator("tutorial-thermal-generator").apply{
    requirements(Category.power, with(Items.copper, 40))
    size = 2
    //设置为floating是为了能放置在矿渣地板上
    floating = true
}
```
:::

### 消耗发电机（ConsumeGenerator）

消耗发电机就是可以像工厂一样设置消耗器的发电机。使用`itemDuration`来设置消耗一个物品的时长。

发电机的消耗器毕竟不像工厂的消耗器，更多的时候使用的是像`ConsumeItemFlammable`这样的筛选消耗器（ConsumeFilter）。筛选消耗器消耗的不再是固定一种的物品或流体，而是一系列符合某一“标准”的许多物品或流体“们”，比如`ConsumeItemFlammable`需要的物品可以是煤/硫/孢子荚/爆炸混合物，它的标准就是物品的可燃性至少要达到20%，像这样的、有实际功能的消耗器还有：

- `ConsumeItemCharged`：故名思义，筛选物品“放电性”的大小；
- `ConsumeItemExplosive`：故名思义，筛选物品“爆炸性”的大小；
- `ConsumeItemRadioactive`：故名思义，筛选物品“放射性”的大小；
- `ConsumeLiquidFlammable`：故名思义，筛选流体“可燃性”的大小；
- `ConsumeItemExplode`：检测物品爆炸性的大小，但是实际上是根据爆炸性的大小来对建筑造成伤害并产生火花，就像火力发电机一样

在发电机中，这些消耗器会根据消耗物品或流体的性能，动态地调整实际效率。所以，在策划的时候不建议把这物品的属性定得太高。此外，这一功能是发电机特有的，在普通工厂中即使使用筛选消耗器，也不会因物品性能改变实际效率。

这些消耗器原版并没有像普通消耗器一样封装接口，需要自己通过`consume()`方法注册。此外，并不是发电机就不能使用普通消耗器了，像原版中的涡轮发电机就兼有`ConsumeItemFlammable`（消耗燃料）和`ConsumeLiquid`（消耗水）。

关于原版消耗器的讨论基本结束了，在单位相关方块中还存在着特殊的动态消耗器，此外还有炮塔常用的`ConsumeCoolant`。以后我们还可以通过自定义消耗器来实现想要的生产方式。至于原版中消耗器这一抽象的优劣之处，交由读者自行判断。


::: code-group

``` java
steamGenerator = new ConsumeGenerator("tutorial-steam-generator"){{
    requirements(Category.power, with(Items.copper, 35));
    powerProduction = 5.5f;
    itemDuration = 90f;
    consumeLiquid(Liquids.water, 0.1f);
    hasLiquids = true;
    size = 2;
    consume(new ConsumeItemFlammable());
    consume(new ConsumeItemExplode());
}}
```
``` kotlin
steamGenerator = new ConsumeGenerator("tutorial-steam-generator").apply{
    requirements(Category.power, with(Items.copper, 35))
    powerProduction = 5.5f
    itemDuration = 90f
    consumeLiquid(Liquids.water, 0.1f)
    hasLiquids = true
    size = 2
    consume(new ConsumeItemFlammable())
    consume(new ConsumeItemExplode())
}
```
:::

### 产热发电机（HeaterGenerator）、核反应堆（NuclearReactor）和变量反应堆（VariableReactor）

这三种发电机并列的原因是，他们都会产生热量，但是产热的逻辑和热量充满后的逻辑不同。

- 核反应堆（NuclearReactor）的产热速度和发电量与内部物品的量成正比，消耗流体降低热量，并不考虑实际制冷性能。虽然有`fuelItem`属性，但是**仍然**要用消耗器去声明物品和冷却液消耗，换而言之，`fuelItem`是用来计算热量的，你完全可以有其他消耗器。满热之后就是爆炸，随热量上升还会有红温贴图，需要注意的是此“热量”非彼“热量”，核反应堆中的热量只是建筑的一个状态，而非埃里克尔的热量系统；
- 产热发电机（HeaterGenerator）只是默默地产热，满热之后只会把多余的热量忽略掉，可能是因为瘤液已然十分棘手，Anuke不好意思再用满热爆炸为难玩家；
- 变量反应堆（VariableReactor）其实应该叫不稳定反应堆，如果没有达到冷却要求，就会增加热量，且速度不与方块状态有关。

核反应堆（NuclearReactor）和变量反应堆（VariableReactor）都设置了`rebuildable`这一属性。这一属性设置为false将禁止重建按钮和幻形的AI重建此方块。

::: code-group

``` java
thoriumReactor = new NuclearReactor("tutorial-thorium-reactor"){{
    requirements(Category.power, with(Items.lead, 300));
    itemDuration = 360f;
    powerProduction = 15f;
    heating = 0.02f;
    fuelItem = Items.thorium;
    consumeItem(Items.thorium);
    consumeLiquid(Liquids.cryofluid, heating / coolantPower).update(false);
}};

neoplasiaReactor = new HeaterGenerator("tutorial-neoplasia-reactor"){{
    requirements(Category.power, with(Items.tungsten, 750));
    size = 5;
    liquidCapacity = 80f;
    outputLiquid = new LiquidStack(Liquids.neoplasm, 20f / 60f);
    //当输出流体条满时爆炸
    explodeOnFull = true;
    heatOutput = 60f;
    powerProduction = 140f;
    itemDuration = 60f * 3f;
    itemCapacity = 10;
    consumeLiquid(Liquids.arkycite, 80f / 60f);
    consumeLiquid(Liquids.water, 10f / 60f);
    consumeItem(Items.phaseFabric);
}};

fluxReactor = new VariableReactor("tutorial-flux-reactor"){{
    requirements(Category.power, with(Items.graphite, 300));
    powerProduction = 265f;
    maxHeat = 150f;
    consumeLiquid(Liquids.cyanogen, 9f / 60f);
}};
```
``` kotlin
thoriumReactor = NuclearReactor("tutorial-thorium-reactor").apply{
    requirements(Category.power, with(Items.lead, 300))
    itemDuration = 360f
    powerProduction = 15f
    heating = 0.02f
    fuelItem = Items.thorium
    consumeItem(Items.thorium)
    consumeLiquid(Liquids.cryofluid, heating / coolantPower).update(false)
}

neoplasiaReactor = HeaterGenerator("tutorial-neoplasia-reactor").apply{
    requirements(Category.power, with(Items.tungsten, 750))
    size = 5
    liquidCapacity = 80f
    outputLiquid = new LiquidStack(Liquids.neoplasm, 20f / 60f)
    //当输出流体条满时爆炸
    explodeOnFull = true
    heatOutput = 60f
    powerProduction = 140f
    itemDuration = 60f * 3f
    itemCapacity = 10
    consumeLiquid(Liquids.arkycite, 80f / 60f)
    consumeLiquid(Liquids.water, 10f / 60f)
    consumeItem(Items.phaseFabric)
}

fluxReactor = VariableReactor("tutorial-flux-reactor").apply{
    requirements(Category.power, with(Items.graphite, 300))
    powerProduction = 265f
    maxHeat = 150f
    consumeLiquid(Liquids.cyanogen, 9f / 60f)
}
```
:::

### 冲击反应堆（ImpactReactor）

像原版一样需要时间预热，这段时间需要电力输入，实际上，电力输入从未停止，只是在计算实际发电量的时候扣除了耗电量。所以，原版冲击的实际发电量是7800-1500=6300。

::: code-group

``` java
impactReactor = new ImpactReactor("tutorial-impact-reactor"){{
    requirements(Category.power, with(Items.lead, 500));
    powerProduction = 130f;
    itemDuration = 140f;
    consumePower(25f);
    consumeItem(Items.blastCompound);
    consumeLiquid(Liquids.cryofluid, 0.25f);
}};
```
``` kotlin
impactReactor = ImpactReactor("tutorial-impact-reactor").apply{
    requirements(Category.power, with(Items.lead, 500))
    powerProduction = 130f
    itemDuration = 140f
    consumePower(25f)
    consumeItem(Items.blastCompound)
    consumeLiquid(Liquids.cryofluid, 0.25f)
}
```
:::

### 总结

我们到目前为此已经见过十多种方块的类了，它们的类型（Kind）大致可分为三种：

- 通用类：一个类有一个工作的基础模板，在模板之上有一定的自定义空间，通常使用组件来拓展功能，如通用工厂（`GenericCrafter`），消耗发电机（`ConsumeGenerator`）；
- 专用类：一个类只负责干一个非常专门的工作，比如太阳能板（`SolarPanel`）、溢流门（`OverflowGate`），逻辑大多复杂而且不能简单地归入到通用类的框架下；
- 标记类：通常是抽象类，可能用于功能的标记，或者是不计较的时候拿来直接用，如方块（`Block`），电力方块（`PowerBlock`）

## 电力节点

电力节点有两种类型，一种是在圆形范围内、有连接数量限制、手动连接的电力节点，一种是在范围里自动连接的激光节点。还有一个奇怪的`LongPowerNode`，似乎只是在绘制上与电力节点稍有区别。

你当然可以让电力节点缓存电力，原版在埃里克尔就是这么做的，因为那里没有电池用。

关于电力节点和激光节点的连接，实际上大有文章可作，此处并不深究。

::: code-group

``` java
powerNode = new PowerNode("tutorial-power-node"){{
    requirements(Category.power, with(Items.copper, 2, Items.lead, 6));
    maxNodes = 10;
    laserRange = 6;
    underBullets = true;
}};

beamNode = new BeamNode("tutorial-beam-node"){{
    requirements(Category.power, with(Items.beryllium, 8));
    range = 10;

    //它们两个是一伙的
    consumesPower = outputsPower = true;
    consumePowerBuffered(1000f);
}};
```
``` kotlin
powerNode = PowerNode("tutorial-power-node").apply{
    requirements(Category.power, with(Items.copper, 2, Items.lead, 6))
    maxNodes = 10
    laserRange = 6
    underBullets = true
}

beamNode = new BeamNode("tutorial-beam-node").apply{
    requirements(Category.power, with(Items.beryllium, 8))
    range = 10

    //它们两个是一伙的
    consumesPower = outputsPower = true
    consumePowerBuffered(1000f)
}
```
:::

还有一个奇怪的东西就是二极管（`PowerDiode`），在这里二极管只取其使电流单向传输的能力，可是Mindustry中只有电网，没有电流。实际上它的功能需要在有两个电网时才能体现，它可以让电力在两个电网之间单向传输。

## 电池

``` java
batteryLarge = new Battery("tutorial-battery-large"){{
    requirements(Category.power, with(Items.titanium, 20, Items.lead, 50, Items.silicon, 30));
    size = 3;
    consumePowerBuffered(50000f);
    baseExplosiveness = 5f;
}};
```

电池就是缓存电力的，而其功能由`ConsumePowerBuffered`这一消耗器负责。而且，电池居然有drawer，默认的drawer只负责变换电池的颜色，你固然可以给电池上一些更加好看的drawer，但是电池又没有`progress`，所以部分drawer并不能起效。

## 其余电力方块

除了`PowerGenerator`用于标记发电机，还有两个标记类，分别是`PowerDistributor`和`PowerBlock`，这两个类完全没有标记作用，只是做了一些设置工作。此外，电力源`PowerSource`和电力黑洞`PowerVoid`在`mindustry.world.block.sandbox`包里，这两个类的工作原理完全不神秘，单纯是无条件的高能发电机和无条件的高耗能方块而已。

灯光方块`LightBlock`跟电力方块在同一个软件包里，它的工作就是照亮**黑暗**，但没有探开战争迷雾的功能。它的可见性`BuildVisibility`与其他方块稍有不同，只有在战役模式或地图有黑暗的时候才会显示。

``` java
illuminator = new LightBlock("illuminator"){{
    requirements(Category.effect, BuildVisibility.lightingOnly, with(Items.graphite, 12));
    brightness = 0.75f;
    radius = 140f;
    consumePower(0.05f);
}};
```

关于建筑可见性，原版有若干种：
- `hidden`/`shown`：隐藏或显示，需要注意的是是否显示不只由可见性决定，还要受到地图/星球科技的限制；
- `debugOnly`：仅调试模式，实际上就是隐藏，因为在调试模式下无视建筑可见性；
- `editorOnly`：仅在地图编辑器中，不包括“游戏内编辑”和“试玩”，地形和废墙系列都采取此设定；
- `coreZoneOnly`：仅当地图上有“核心区域”地板，两个星球的初级核心采取此设定；
- `worldProcessorOnly`：仅当允许编译世界处理器时，包括在地图编辑器或规则允许时，世界处理器系列物品采取此设定；
- `sandboxOnly`：仅在“无限资源”规则激活时，通常是沙盒模式，各种源和黑洞采取此设定；
- `campaignOnly`：仅在战役中，行星际发射器采取此设定；
- `legacyLaunchPadOnly`：仅启用传统发射台时，需要行星有特殊设置，而且不能是新发射台，旧发射台采取此设定；
- `lightingOnly`：仅需照明器时，通常在战役模式或规则允许时，照明器采取此设定；
- `ammoOnly`：仅单位需要弹药时，需要规则允许，由于供弹方块是核心和容器类，没有符合此需求的方块，原版未使用；
- `fogOnly`：仅有战争迷雾时，需要规则允许，雷达采取此设定

::: info 你知道吗？
在v8之前，`BuildVisibility`是枚举而不是普通类。所以现在你可以自定义BuildVisibility了。
:::

`PowerGraph`是一个完全不同的类，它并不是方块，而是一个表示电网的实体，在原版中，相互联通的电力建筑可以拥有一个电网，以后我们会深入探究电网的工作原理。


