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

最后，但也是最重要的，游戏是如何知道我们新建了一个内容？Mindustry的机制是，在内容对象的构造过程中自动完成注册。如果一个类直接或间接继承自内容的基类`Content`，其构造方法必须调用超类的构造方法，这个调用链最终会执行到`Content`的构造方法中：

``` java
public Content(){
    this.id = (short)Vars.content.getBy(getContentType()).size;
    Vars.content.handleContent(this);
}
```

这两行代码表明，游戏会通过内容管理器`Vars.content`为内容分配一个在其内容类型中唯一的id，并将内容自身注册到管理器中。在后续的加载过程中，该内容会与原版内容以相同的方式被处理。当玩家打开该物品的统计信息界面时，游戏会调用内容的`setStats()`方法来计算需要显示的信息，此时相关的代码逻辑才会被执行。

就以上讨论，我们可以得出结论：想要让游戏执行自己的代码，必须新建一个继承自原版内容的类，并创建此类的实例。