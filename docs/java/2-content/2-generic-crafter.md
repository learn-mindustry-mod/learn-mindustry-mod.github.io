
# 工厂

- 创建一个GenericCrafter
- 声明消耗项（Consume） // 引子 - 消耗系统
- 常规产出项
- 绘制器（Drawer） // 引子 - 自定义drawer
- 一些特殊的工厂子类型 // 引子 - 环境与Attribute


> ***游戏的灵魂***

作为一个工厂+塔防+RTS游戏，Mindustry的第一大灵魂一定就是工厂了。

## 创建一个GenericCrafter

像物品和流体一样，方块也被封装成了一个类型`mindustry.world.Block`。不过，不同方块有着不同的功能，这就需要方块拥有不同的类型。因此，我们在创建一个方块的时候，需要根据需要的功能选择合适的类型。而要创建一个通用工厂，我们需要的类型为`mindustry.world.blocks.production.GenericCrafter`。

```java
new GenericCrafter("tutorial-crafter");
```

```kotlin
GenericCrafter("tutorial-crafter")
```

:::

和上节一样，你可以选择简单地在主类的`loadContent()`里创建这个对象，也可以选择选择新建一个类来存放所有的方块。

## 方块的共性

这一次事情没有这么顺利——你在核心数据库和建造栏中均没有见到这个方块。事实上这是一个正常现象，原因是你还没有对方块做任何的设置。

对于一个方块来说，最基本的属性如下表：

- `health`：建筑的生命值；
- `size`：建筑的尺寸，也就是边长。注意，Mindustry原生不支持非正方形建筑；

还有一类属性也十分基本，但它们的设置方式不太一样——必须使用`requirements`方法进行赋值。这方法有很多重载，以下是它的一些重载参数的涵义：

- `alwaysUnlock`（在参数列表中叫`unlocked`）：顾名思义，即为在战役中始终解锁；
- `category`：方块所属的类别，原版有十大类型，分别对应建造栏中的十个图标；
- `requirements`（在参数列表叫`stacks`）：建造方块所需的物品。注意，建造时间直接通过建造耗费物品量来计算，但可以通过`buildCostMultiplier`间接控制，具体设置方法见下；
- `buildVisibility`：建筑可视性，即为某一方块是否在建造栏或核心数据库中可见，默认为`BuildVisibility.hidden`（隐藏状态）。

如你所见，如果不设置`requirements()`，那么方块默认就是处于隐藏状态。所以，你需要使用任意一个`requirements()`方法来解开`buildVisibility`。我们可以使用这样的语法：

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

接下来，名称和贴图的设置不再备述。

:::

以上代码设置`stacks`时使用了`ItemStack.with`这一**工厂方法（Factory Method）**，免去我们直接创建ItemStack[]时的冗杂。关于ItemStack，本阶段我们只需要知道它是一种用来描述具有一定数量的物品和如何声明之即可。

## 声明消耗器（Consume）

接下来，让我们为工厂添加上输入（Input），不过，在Mindustry中，大部分输入都被抽象成了**消耗器（Consumer）**。

Anuke已经帮我们封装好了常用的消耗器的声明，如下，均如字面义：

``` java
consumeItem(Items.copper,1);
consumeItems(ItemStack.with(Items.copper,1,Items.lead,2));
consumeLiquid(Liquids.water,f);
consumeLiquids(LiquidStack.with(Liquids.water,1f,Liquids.slag,2f));
consumePower(1f);
```

值得注意的是，流体和电量的消耗都是以**刻（Tick）**为单位的，而`1s = 60tick`，所以千万不要让流体和电力消耗扩大60倍！

这只是消耗器的一部分用法，事实上，原版中火力发电机、炮塔的冷却剂等都是消耗器的功能，所以你甚至可以在自己的工厂里塞更多奇怪的东西。

``` java
//像火力发电机一样，遇到高燃烧性的物品会开始工作，工作效率由物品的燃烧性决定
consume(new ConsumeItemFlammable());
//像火力发电机一样，遇到高爆炸性的物品会炸坏方块
consume(new ConsumeItemExplode());
//像炮塔一样，使用冷却剂提高工作效率
consume(new ConsumeCoolant(1f));
```
在此处，我们抛开了Anuke给我们封装好的方法，直接使用了其源头上的注册方法`consume()`，在未来，我们可以自己动手写一个消耗器来满足复杂的输入需求，也需要深入探究**消耗系统**的工作原理来让它更好地为我们所用。

最后仍要强调的是，`GenericCrafter`是严格单配方的，你声明的所有消耗器最终会归结到一个配方中，所以，不要试图创建自相矛盾的消耗器，要合理地安排工厂的输入。

## 输出项

非常遗憾的是，工厂的输出没有被抽象出来，实在是原版的一大败笔。

原版中，`outputItem``outputItems``outputLiquid``outputLiquids`（注意这里的output均为原型，`outputsLiquid`是另一个属性）是用来声明输出项的，
不过，**单复数形式不能混用！**代码如下：

``` java
outputItem = new ItemStack(Items.copper,1);
outputItems = ItemStack.with(Items.copper,1,Items.lead,2);
outputLiquids = new LiquidStack(Liquids.water,1f);
outputItem = LiquidStack.with(Liquids.water,1f,Liquids.slag,2f);
```

## 声明绘制器（Drawer）

在v7之前，原版的工厂只有屈指可数的几种绘制模式，并且绘制的内容还受制于工厂的类型。而在v7之后，就全都不一样了：一方面，所有没有热量需求和地形增益的工厂都被统一到`GenericCrafter`；另一方面，工厂的绘制完全被提取到绘制器（Drawer）这一组件中，使得JSON模组获得了超强的自定义能力，也优化了Java中工厂的架构，提高了绘制模式的可重用性。在本节中，你将先了解如何组合并使用原版中已有的drawer。


## 一些特殊的工厂子类型

正如上一节中所提，并非所有工厂都是`GenericCrafter`。实际上，有地形增益的工厂是`AttributeCrafter`，有热量需求的工厂是`HeatCrafter`。

这两个类型都是`GenericCrafter`的子类，也就是说，上文所提的一切在这两个类型中都是可用的；相应地，这两个类也有一些独创之处：

对于`AttributeCrafter`：
- `atrribute`：使此工厂获得增益或减益的属性（Attribute），原版中的attribute包括`heat``spores``water``oil``light``sand``steam`等，均可望名生义；
- `displayEfficiencyScale`：在显示工厂效率时的一个乘数；
- 其他属性均可望名生义。

对于`HeatCrafter`：
- `heatRequirement`：所需热量；
- `overheatScale`：当获取热量超出所需热量时，多出的热量将以多大的比例提高效率，默认是按原倍数增长；
- `maxEfficiency`：由热量增益产生的最大效率。

## 思考题
只有那些category为crafting的才算是工厂吗？查找原版还有哪些方块也是工厂，并思考用工厂还能做出来什么新奇的策划设计。
