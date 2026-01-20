# 电力方块

电力是原版的能量形式之一，大部分内容都需要电力的参与。电力的生产者为发电机（Generator），传输需要电力节点（PowerNode），存储需要电池（Battery），最终被方块中的电力槽（PowerModule）消耗，而电网（PowerGraph）承担了电力的调度工作。

## 发电机

原版有七种具体的发电机，由同一个基类`PowerGenerator`统领。`PowerGenerator`类只拥有两个功能，一是在统计面板中显示发电量，二是在被摧毁后产生爆炸。而具体的发电方式由子类声明。通常来说，一个发电机的发电量是其基础发电量`powerProduction`与建筑发电效率`productionEfficiency`相乘得到的。

### 太阳能板（SolarGenerator）

太阳能板的建筑发电效率是由地图的光亮属性`light`决定的。其计算公式为`太阳能电池板的发电倍率 * (地图环境light属性值 + 环境光颜色透明度)`。此类型没有可以配置的属性。

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

根据下方地板的属性计算效率，就像工厂中的`AttributeCrafter`一样。可以设置最低工作效率`minEfficiency`。埃里克尔上的涡轮冷凝器也是一个“地热发电机”，这是由于蒸汽喷口也是一种属性（即`steam`），所以地热发电机也被Anuken赋予了`outputLiquid`字段。

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

发电机的消耗器更多的时候使用的是像`ConsumeItemFlammable`这样的筛选消耗器（ConsumeFilter）。筛选消耗器消耗的不是固定的某种物品或流体，而是一系列符合某一“标准”的许多物品或流体，比如火力发电机的`ConsumeItemFlammable`可以消耗的物品包括煤/硫/孢子荚/爆炸混合物，它的标准就是物品的可燃性至少要达到20%，像这样的消耗器还有：

- `ConsumeItemCharged`：筛选物品“放电性”的大小；
- `ConsumeItemExplosive`：筛选物品“爆炸性”的大小；
- `ConsumeItemRadioactive`：筛选物品“放射性”的大小；
- `ConsumeLiquidFlammable`：筛选流体“可燃性”的大小；
- `ConsumeItemExplode`：检测物品爆炸性的大小，根据爆炸性对建筑造成伤害，并产生火焰，例如火力发电机。

在发电机中，这些消耗器会根据所消耗物品或流体的属性大小，动态地调整发电效率“倍率”。但是，调整倍率这一功能是发电机特有的，在工厂中即使使用筛选消耗器，也不会因物品属性大小改变实际效率。

这些消耗器原版并没有像普通消耗器一样封装接口，需要通过`consume()`方法注册。此外，发电机也可以使用普通消耗器，例如原版中的涡轮发电机就兼有`ConsumeItemFlammable`（消耗燃料）和`ConsumeLiquid`（消耗水）两个消耗器。

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

### 产热发电机（HeaterGenerator）、核反应堆（NuclearReactor）和不稳定反应堆（VariableReactor）

这三种发电机并列的原因是，他们都会产生热量，但是产热的逻辑和热量充满后的逻辑不同。

- 产热发电机（HeaterGenerator）的产热速度只与建筑效率有关，热量充满会忽略多余的热量；
- 核反应堆（NuclearReactor）的产热速度和发电量与内部`fuelItem`的多少成正比，可以通过消耗流体降低热量，但这种冷却效果并不考虑冷却液的属性，而是由`coolantPower`字段定义的。核反应堆虽然有`fuelItem`属性，但是**仍然**要用消耗器去声明物品和冷却液消耗。热量充满后会产生爆炸，随着热量上升还会使建筑贴图逐渐变红；
- 不稳定反应堆（VariableReactor）的热量与产热发电机相同，真正需要控制的是不稳定度。如果没有达到消耗器要求，就会增加不稳定度，且增加速度和减少速度为定值，当不稳定度充满后会产生爆炸。

核反应堆（NuclearReactor）和不稳定反应堆（VariableReactor）都设置了`rebuildable`这一属性。这一属性设置为false将禁止使用重建功能建造此方块。

::: code-group

``` java
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

thoriumReactor = new NuclearReactor("tutorial-thorium-reactor"){{
    requirements(Category.power, with(Items.lead, 300));
    itemDuration = 360f;
    powerProduction = 15f;
    heating = 0.02f;
    fuelItem = Items.thorium;
    consumeItem(Items.thorium);
    consumeLiquid(Liquids.cryofluid, heating / coolantPower).update(false);
}};

fluxReactor = new VariableReactor("tutorial-flux-reactor"){{
    requirements(Category.power, with(Items.graphite, 300));
    powerProduction = 265f;
    maxHeat = 150f;
    consumeLiquid(Liquids.cyanogen, 9f / 60f);
}};
```

``` kotlin
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

thoriumReactor = NuclearReactor("tutorial-thorium-reactor").apply{
    requirements(Category.power, with(Items.lead, 300))
    itemDuration = 360f
    powerProduction = 15f
    heating = 0.02f
    fuelItem = Items.thorium
    consumeItem(Items.thorium)
    consumeLiquid(Liquids.cryofluid, heating / coolantPower).update(false)
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

需要时间进行预热，这段时间需要电力输入。在冲击反应堆运行时，对电力输入从未停止，只是在计算实际发电量的时候扣除了耗电量。当消耗器和耗电无法满足时，会迅速把预热降到0。

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

到目前为此，我们已经见过十多种方块类型了，它们的类型（Kind）大致可分为三种：

- 通用类：一个类有工作的通用模板，在模板之上有一定的自定义空间，通常使用组件来拓展功能，例如通用工厂（`GenericCrafter`），消耗发电机（`ConsumeGenerator`）；
- 专用类：一个类只负责干单一工作，例如太阳能板（`SolarPanel`）、溢流门（`OverflowGate`），逻辑大多复杂而且不能简单地归入到通用类的框架下；
- 标记类：通常是抽象类，用于功能的标记，也可以直接使用，如方块（`Block`），电力方块（`PowerBlock`）

## 电力节点

电力节点有两种类型，一种是在圆形范围内、有连接数量限制、手动连接的电力节点`PowerNode`，一种是在范围里自动连接的激光节点`BeamNode`。此外还有`LongPowerNode`，只是在绘制上与电力节点稍有区别。你可以让电力节点缓存电力，原版在埃里克尔就是这么做的，因为那里没有电池用。

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

还有一个类型是二极管（`PowerDiode`），它可以让电力在两个电网之间单向传输。

## 电池

``` java
batteryLarge = new Battery("tutorial-battery-large"){{
    requirements(Category.power, with(Items.titanium, 20, Items.lead, 50, Items.silicon, 30));
    size = 3;
    consumePowerBuffered(50000f);
    baseExplosiveness = 5f;
}};
```

电池是用于缓存电力的，而其功能由`ConsumePowerBuffered`这一消耗器负责。电池也拥有drawer，默认会根据缓存电量变换电池的颜色，由于电池没有设置`progress`属性，所以大部分drawer无法生效。

## 其余电力方块

我们在上文提到了“标记类”这一名词，在电力系统中除了`PowerGenerator`用于标记发电机，还有两个标记类，分别是`PowerDistributor`和`PowerBlock`，这两个类设置了一些字段，如默认更新`update = true`，将方块的组别设置为`BlockGroup.power`。此外，电力源`PowerSource`和电力黑洞`PowerVoid`也在`mindustry.world.block.sandbox`包里。

灯光方块`LightBlock`和电力方块在同一包里，它的工作就是用光亮照亮**黑暗**，但没有探开战争迷雾的功能。它的建筑可见性`BuildVisibility`稍有不同：

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
- `ammoOnly`：仅单位需要弹药时，需要规则允许，由于原来的供弹方块“供弹点”已被移除，现版本供弹方块是核心和容器类，所以没有符合此需求的方块，故原版未使用；
- `fogOnly`：仅有战争迷雾时，需要规则允许，雷达采取此设定

::: info 你知道吗？
在v8之前，`BuildVisibility`是枚举而不是普通类。现在你可以自定义BuildVisibility了。
:::

`PowerGraph`是一个完全不同的类，它并不是方块，而是一个表示电网的实体。在Mindustry中，相互连通的电力建筑拥有同一个电网，电网可以调度电力的产生、缓存和消耗。我们将在后文讲解电网的工作原理。


