# 方块与建筑

恭喜你已成功掌握内容的创建流程。然而，这些并非你选择使用 Java 的全部原因。从本章开始，你将着手编写真正的代码，充分发挥 Java 的语言优势，实现天马行空的想法。但在此之前，仍需打好坚实基础，方能行稳致远。

## 一组辨析

方块（Block）与建筑（Building）是两个相关但本质不同的概念。在编写代码时，需要明确区分二者：

- 方块（Block）：指具有特定功能和属性的一类方块。例如，“石墨压缩机”是一种方块，其内部名称为`graphite-press`，属于通用工厂`GenericCrafter`类型。它定义了通用的行为，如消耗两单位“煤”并产出一单位“石墨”。方块的属性是所有同类建筑共用的，包括最大生命值`health`、尺寸`size`、建造消耗`requirements`等。前一章所配置的内容均属于此范畴。
- 建筑（Building）：指在世界（World）中实际存在的具体建筑实体，它是一个可独立绘制和更新的对象。例如，在游戏中放置一个“石墨压缩机”后，该实例就是一个建筑。它拥有自己独立的属性，如坐标`x`、`y`，当前生命值`health`、运行效率`efficiency`等。本章大部分操作直接或间接处理的对象都是建筑。

明确区分方块和建筑对于代码编写至关重要，它决定了代码的作用层面。例如，若需修改方块在核心数据库中的显示信息，应意识到这是对方块的配置，不涉及任何具体建筑实例。若希望建筑根据其当前生命值变化显示不同贴图，则应理解这是对建筑实例的处理，因为它依赖于每个建筑独立的状态属性`health`。

## 多态与继承

在深入探讨方块与建筑相关的代码实现之前，一个需要明确的基础问题是：模组的运行机制是怎样的？

这个问题有两种答案。第一种答案是，通过内容注册机制将你的内容注册到原版内容管理器中，再通过多态机制运行你的代码。另一件方式是通过事件系统在合适的时机运行代码，并从参数中获得必要的信息，对于这种机制，我们会在3.8中阐明。此处我们只会阐述内容-多态机制。

首先，我们要明确多态的概念。多态的定义是，允许不同类的对象对同一消息做出不同的响应。简单来说，就是"一个接口，多种实现"。对此问题，通过Mindustry中已有的代码解释再清晰不过。

例如，原版中设置方块在核心数据库显示内容的方法为`setStats()`，对于`GenericCrafter`、`Pump`、`ConsumeGenerator`三个类而言，内容分别如下：

``` java
@Override
public void setStats(){
    stats.timePeriod = craftTime;
    super.setStats();
    if((hasItems && itemCapacity > 0) || outputItems != null){
        stats.add(Stat.productionTime, craftTime / 60f, StatUnit.seconds);
    }

    if(outputItems != null){
        stats.add(Stat.output, StatValues.items(craftTime, outputItems));
    }

    if(outputLiquids != null){
        stats.add(Stat.output, StatValues.liquids(1f, outputLiquids));
    }
}
```

``` java
@Override
public void setStats(){
    super.setStats();
    stats.add(Stat.output, 60f * pumpAmount * size * size, StatUnit.liquidSecond);
}
```

``` java
@Override
public void setStats(){
    stats.timePeriod = itemDuration;
    super.setStats();

    if(hasItems){
        stats.add(Stat.productionTime, itemDuration / 60f, StatUnit.seconds);
    }

    if(outputLiquid != null){
        stats.add(Stat.output, StatValues.liquid(outputLiquid.liquid, outputLiquid.amount * 60f, true));
    }
}
```

对比各字段的含义与游戏内核心数据库页的具体显示内容，可以确认`setStats()`方法中的代码决定了显示内容。

![多态](imgs/generic.png)

然而，另一方面，大部分显示内容并未在这些类中定义，这是面向对象编程的另一特征——继承——所导致的结果。以下为其基类`Block`中的相关定义：

``` java
@Override
public void setStats(){
    super.setStats();

    stats.add(Stat.size, "@x@", size, size);

    if(synthetic()){
        stats.add(Stat.health, health, StatUnit.none);
        if(armor > 0){
            stats.add(Stat.armor, armor, StatUnit.none);
        }
    }

    if(canBeBuilt() && requirements.length > 0){
        stats.add(Stat.buildTime, buildTime / 60, StatUnit.seconds);
        stats.add(Stat.buildCost, StatValues.items(false, requirements));
    }

    for(var c : consumers){
        c.display(stats);
    }

    //Note: Power stats are added by the consumers.
    if(hasLiquids) stats.add(Stat.liquidCapacity, liquidCapacity, StatUnit.liquidUnits);
    if(hasItems && itemCapacity > 0) stats.add(Stat.itemCapacity, itemCapacity, StatUnit.items);
}
```

从上方的代码中可以看出，`Block`类中添加的统计信息是所有方块通用的。这是因为所有方块都继承了`Block`类，并且在执行`setStats()`时都调用了`super.setStats()`，即执行其超类的`setStats()`方法。实际上，向统计信息中添加方块的贴图和名称是`Block`超类`UnlockableContent`中的`setStats()`执行的结果。继承机制使得子类可以复用超类中已有的代码。

<!----让我画图要我老命了（哭）----->

最后，但也是最重要的，游戏是如何知道我们新建了一个内容？Mindustry的机制是，在内容对象的构造过程中自动完成注册。如果一个类直接或间接继承自内容的基类`Content`，其构造方法必须调用超类的构造方法，这个调用链最终会执行到`Content`的构造方法中：

``` java
public Content(){
    this.id = (short)Vars.content.getBy(getContentType()).size;
    Vars.content.handleContent(this);
}
```

这两行代码表明，游戏会通过内容管理器`Vars.content`为内容分配一个在其内容类型中唯一的id，并将内容自身注册到管理器中。在后续的加载过程中，该内容会与原版内容以相同的方式被处理。当玩家打开该物品的统计信息界面时，游戏会调用内容的`setStats()`方法来计算需要显示的信息，此时相关的代码逻辑才会被执行。

综上所述，我们可以得出以下结论：若要让游戏执行自定义的代码逻辑，必须创建一个继承自原版内容基类的子类，并实例化该子类。

## 创建一个自定义方块

根据以上的结论，我们已经准备好来向游戏中添加代码了。本教程将以“台灯”为例，向你展示创建一种新的方块的必要流程。

创建任何一种新方块之前，一定要先明确自己的需求，这些需求应当可以通过严谨的流程框图或伪代码来表述。在本例中，我们希望台灯能在玩家手动点击时切换亮/暗形态。

接下来，你需要创建一个继承于`mindustry.type.Block`的类，命名其为`LampBlock`。在原版的代码架构中，方块的类一般放置在`world.blocks`包下，你可以选择效仿这种组织形式。在创建类后，IDE会自动提示你生成与超类符合的构造方法。

::: code-group
``` java
package example.world.blocks;

import mindustry.world.*;

public class LampBlock extends Block{
    public LampBlock(String name){
        super(name);
    }
}
```

``` kotlin
class LampBlock(name: String?) : Block(name) {}
```
:::

你需要将`update`字段设置为`true`，让游戏为这个方块的建筑生成实体。否则放置的建筑将会只能静态地绘制`Block#drawBase(Tile)`这一方块下的内容，而这正是原版环境方块、墙体等不需要复杂实体的方块的默认行为。

和方块一样，建筑实体也是由一个类型封装的。所有建筑实体的基类是`mindustry.gen.Building`。与方块不同的是，游戏通常会自动寻找一种方块所需的实体类型，而寻找的位置就是此类内部定义的第一个继承自`Building`的内部类。因此，在类的内部创建一个继承自`Building`的内部类即可满足此要求。Kotlin用户需要将这个内部类声明为`open`。

::: code-group
``` java
public class LampBlock extends Block{
    public LampBlock(String name){
        super(name);
        update = true;
    }
    
    public class LampBuild extends Building{
        
    }
}
```

``` kotlin
class LampBlock(name: String?) : Block(name) {
    init {
        update = true
    }
    
    open class LampBuild: Building() {
        
    }
}
```
:::

这样，方块与建筑实体的代码区域便得以划分，它们分别对应`Block`中的方法和`Building`中的方法。后续的步骤是深入探究这两个区域中的方法。

## 加载贴图、添加进度条和统计信息

尽管`Block`类的方法非常多，但大部分都是用于查询，例如`isAir()` `canReplace(Block)`等。可以设置的方法主要有以下五个：

- `init()`：初始化；执行在所有内容已经加载完毕后，可以在这时将某些空字段赋值为默认值；
- `load()`：加载贴图；执行在所有内容初始化完毕之后，这时应当通过`Core.atlas`等手段获取贴图（`TextureRegion`）的引用，并存储起来以供绘制功能使用；
- `setStats()`：设置统计信息；执行在打开此方块的核心数据库时，这时应当向`stats`中添加统计信息的条目；
- `setBars()`：设置进度条；执行在初始化时，这时应当通过`addBar(String, Func<T, Bar>)`和`removeBar(String)`等方法设置方块的进度条（Bar）；
- `drawPlace(int, int, int, boolean)`：玩家在建造栏中点选方块之后，放置之前所绘制的内容（仅桌面端）；因为此时还没有实例被创建，所以使用参数传递位置、方向（与任意角定义相同，`右0上1左2下3`）和建造是否有效；在`Block`中的实现已经包括绘制方块本身。

### `load()`

原版中几乎全部的显示效果都是使用贴图来呈现的，灯笼也不例外。你需要为灯笼准备一张点亮贴图和一张熄灭贴图。由于这次你需要自定义绘制过程，因此你不能再依赖游戏帮你引用贴图，而是需要自己引用贴图并编写绘制过程。你仍然需要把贴图放置在`assets/sprites/`目录下。你可以通过这样的语法来获得贴图的引用：

``` java
Core.atlas.find("<modName>-<fileName>");
```

这样获取的是一个类型为`TextureRegion`子类的、指向这张贴图的引用。在实践中，多次调用此方法可能会造成性能损失，因此你需要把此方法的返回值存在这个方法中。欲达到此目的，你需要在此方块的类中新建一个字段：

::: code-group
``` java
public class LampBlock extends Block{

    public TextureRegion lightRegion, darkRegion;

    public LampBlock(String name){
        super(name);
        update = true;
    }

    @Override
    public void load(){
        super.load();
        lightRegion = Core.atlas.find(name + "-light");
        darkRegion = Core.atlas.find(name + "-dark");
    }
    
    public class LampBuild extends Building{
        
    }
}
```

``` kotlin
class LampBlock(name: String?) : Block(name) {
    init {
        update = true
    }

    var lightRegion: TextureRegion? = null
    var darkRegion:TextureRegion? = null

    override fun load() {
        super.load()
        lightRegion = Core.atlas.find("$name-light")
        darkRegion = Core.atlas.find("$name-dark")
    }
    
    open class LampBuild: Building() {
        
    }
}
```
:::

字段在不同的位置和不同的修辞符代表的含义并不相同：

- 在建筑区中创建的字段：代表一个建筑实体当前的“状态”，对于不同的实体来说是不同的；
- 在方块区中创建的字段：代表一种方块配置的属性，对于该方块的所有实体来说都是相同的；
- 在方块区中创建的静态字段：代表对此类的所有种方块都相同的设置，对于所有类型为此类的方块都是相同的；

Core.atlas.find有三种不同的重载版本，另两种重载版本允许你在找不到某张贴图时再尝试获取另一张贴图。如果都找不到，就会获取到`error`（即ohno）的引用。

### `setStats()`

统计信息在原版中被封装成类型为`mindustry.world.meta.Stats`。



