# 物品与流体

> ***“万事开头难”***

Mindustry的游戏内容大致可以划分为若干个板块，从作为材料的**物品**，**液体**，到进行加工的**工厂**，再到消耗产品的**功能性方块**与**炮塔**，以及用材料生产的**单位**，这些基本的游戏要素构成了游戏的核心玩法。要入门mod开发，自然从最简单的制作物品和流体开始。

## 创建一个Item

在Mindustry中，物品被封装为一个类型`mindustry.type.Item`，而创建一个Item实际上就是创建一个该类型的对象：

::: info 全限定名
全限定名（Fully Qualified Name），是一个Java类的包路径连同类的简单名称，如这里的`mindustry.type.Item`。在情况下，全限定名可以确定唯一一个Java类，因此我们在以后首次遇到某个类的时候都会给出它的全限定名，在不引起歧义时我们会称它的简单名称，如`Item`·
:::

::: code-group

```java
new Item("tutorial-item", Color.red);
```

```kotlin
Item("tutorial-item", Color.red)
```

```javascript
const tutorialItem = extend(Item, "tutorial-item", Color.red, {})
```

```json
// content/items.tutorial-item.json
{
  
}
```

:::

其中，第二个参数传入的颜色会影响此物品在分类器中的显示色。Item还有只有一个String参数的构造方法，可以认为是给颜色赋予默认值——黑色，这个方法在源代码中被标记为内部使用。

只需要在Mod主类的`loadContent()`方法中创建这个Item对象，我们就能够在游戏中找到这个物品了：

::: code-group

```java TurorialMod.java
public class TutorialMod extends Mod{
  @Override
  public void loadContent(){
    new Item("tutorial-item", Color.red);
  }
}
```

```kotlin TutorialMod.kt
class TutorialMod: Mod(){
  override fun loadContent(){
    Item("tutorial-item", Color.red)
  }
}
```

:::

接着，打开游戏的核心数据库，你就能看到你的物品被添加到了“物品”这一类当中：

![第一个物品](imgs/firstItem.png)

如你所见，物品此时还没有贴图，也没有名字，因此会显示为错误贴图（oh no）和一段**内部名称**作为名字。

### 为物品赋予名称和描述

我们不能让物品在游戏内以内部名称显示，所以就需要给物品命名，这就需要将物品的名字写进mod的语言文件当中。

**物品**的本地化名称，描述和细节文本分别被表示为语言文件中的几个固定格式的键值对：

- `item.[modName]-[物品名称].name`：物品的本地化名称
- `item.[modName]-[物品名称].description`：物品的描述文本
- `item.[modName]-[物品名称].details`：物品的细节文本

其中`modName`填写你在`mod.json`中所写的`name`，而`物品名称`即在你创建物品对象时构造方法的参数。

例如，对于我们刚刚创建的那个物品，其参数为`tutorial-item`，我们例子中的演示mod内部名称为`tutorial-mod`，那么在bundle中的键值对键名就应当填写为`tutorial-mod-tutorial-item`，例如我们将如下信息填写到`bundle_zh_CN.properties`和`bundle.properties`当中：

```properties bundle_zh_CN.properties
item.tutorial-mod-tutorial-item.name = 演示物
item.tutorial-mod-tutorial-item.description = Hello World！（为什么在这里还要Hello World？）
item.tutorial-mod-tutorial-item.details = 你看不见我看不见我看不见我
```

```properties bundle.properties
item.tutorial-mod-tutorial-item.name = Tutorial Item
item.tutorial-mod-tutorial-item.description = Hello World！（Why）
item.tutorial-mod-tutorial-item.details = Shhhhhh
```

打开这个物品的详细信息：

![命名物品](imgs/firstItemNamed.png)

### 为物品分配贴图

贴图也是内容的重要组成部分之一，需要我们在mod的`sprites`目录中给物品提供。你只需要为物品绘制一张贴图，并把这张图片命名为你构造方法中写下的那个字符串，然后将它按照*第一章第三节 mod文件结构*中所讲的那样放入到`sprites`目录中即可。

需要注意的一点是，提供给物品的贴图尺寸**必须是32x32**，大于这个尺寸的贴图将会导致物品在某些显示页面上显示错误。*此外它必须是`png`格式，位深为4，是一张彩色的图片，如果不遵守可能会在稀奇古怪的设备上出现奇怪的问题。*

我们将这样一张图片按先前创建物品时提供的名称，命名为`tutorial-item.png`，并放进`sprites`目录里：

> 与语言文件中的键名称不同，物品贴图命名不需要在命名前附加mod名称。

~~(贴图来自笔者已暂停开发的mod)~~

![crystal_FEX.png](imgs/crystal_FEX.png)

重新构建并进入游戏，就可以看到物品成功的被分配了贴图：

![分配贴图的物品](imgs/firstItemSprited.png)

## 物品的属性

正如你在详情页看到的那样，这个物品的所有基础属性都是`0%`，如果物品应该具有这些属性，那么就应该在创建物品时为他们设置这些值（其实不必在创建时，但是通常这样会更利于维护）。

物品中的属性和作用均如下所示，其中大部分属性都在一些工厂识别材料时使用：

- `explosiveness`：爆炸性，这个值会影响物品在容器和传送带上的效果，如果爆炸性较高，容器和传送带被破坏时会引发爆炸，强度取决于易爆性大小，还能影响携带此物品的容器和单位死亡时的爆炸伤害。
- `flammability`：燃烧性，会影响物品在容器和传送带上的效果，如果物品可燃性较高，那么火焰会引起容器燃烧。
- `radioactivity`：放射性，这个值通常只用于筛选工厂消耗的材料，例如RTG发电机。
- `charge`：带电性，同放射性，作为方块消耗的识别项，但还能影响携带此物品的容器和单位死亡时的产生的爆炸。
- `hardness`：硬度，当有一个矿物地板被采掘生产这个物品时，决定此矿物地板的硬度，即影响哪些钻头可以采掘此物品，并影响钻探速度。
- `lowPriority`：影响对应矿物地板的效果，该值影响钻头的采掘优先级，如果钻头覆盖了多种矿物，则会忽略掉这个值为true的地板。
- `buildable`：虽然字面义上叫“能否建造方块”，但实际上控制的是能否进入设置`incinerateNonBuildable`（销毁不可建造物品）的核心，Erekir上的所有核心都设置了此项。
- `cost`：当此物品参与方块的建造时，用于计算建造方块需要的时间，此值越大，消耗时间越长。
- `healthScaling`：此物品在方块未设定默认生命值时，在计算方块生命值时作为额外生命值参加计算。

我们可以使用这样的语法来在创建物品时就地为它们分配属性：

::: code-group

```java
new Item("tutorial-item"){{
  hardness = 3;
  explosiveness = 0f;
  flammability = 0f;
  radioactivity = 0.4f;
  cost = 1.25f;
}};
```

```kotlin
Item("tutorial-item").apply{
  hardness = 3
  explosiveness = 0f
  flammability = 0f
  radioactivity = 0.4f
  cost = 1.25f
}
```

:::

现在，再次看看它的详情：

![分配属性](imgs/firstItemAttred.png)

::: tip 注意

上述的代码中`java`与`kotlin`的程序实际上并不等价，在java的就地分配属性中其实创建了一个**匿名类**，即`new Type(...){...}`表达式，然后在匿名类中仅定义了一个初始化块`{...}`来完成的属性分配，从而形成了`new Type(...){ {...} }`这样的形式，而kotlin则是实际的就地分配属性。

这并不重要，但是如果你很在意这一份开销的话，也可以把java声明拆开写。

:::

## 创建一个Liquid
在Mindustry中，流体被封装为`mindustry.type.Liquid`。虽然叫“液体”，但这样命名的原因是v7前游戏没有原生的气体，而在v7中Anuke简单地把气体实现为不会产生水洼的液体。所以`Liquid`类的正确译名应当是流体。

<!----“流体”一名哪有这么容易，也是当年我在翻译斗争中争取来的---->

::: code-group

```java
new Liquid("tutorial-liquid", Color.blue);
```

```kotlin
Liquid("tutorial-liquid", Color.blue)
```

:::

分配贴图不再陈述。

```properties bundle_zh_CN.properties
liquid.tutorial-mod-tutorial-liquid.name = 演示液体
liquid.tutorial-mod-tutorial-liquid.description = 流体不做任何处理默认是液体。
liquid.tutorial-mod-tutorial-liquid.details = 上善似水。水善利万物而有静，居众之所恶，故几于道矣。
```

```properties bundle.properties
liquid.tutorial-mod-tutorial-liquid.name = Tutorial Liquid
liquid.tutorial-mod-tutorial-liquid.description = He who is not gas is liquid
liquid.tutorial-mod-tutorial-liquid.details = And God said, "Let there be an expanse between the waters to separate water from water." 
```

## 流体的属性

- `gas`：标识该流体是否为气体；`true`时为气体，不会形成地面水洼，通常向上飘散。
- `color`：流体的基础颜色；用于管道流动和液体水洼的默认渲染。
- `gasColor`：气体状态下的颜色；当`gas=true`时使用此颜色而非`color`，通常更浅更透明。
- `barColor`：UI状态条颜色；**可为空**，显示在储液罐容量等界面，为`null`时回退使用`color`。
- `lightColor`：流体的发光颜色；其Alpha通道值决定了发光的亮度，`Color.clear`表示不发光。
- `hidden`：是否在UI中隐藏；`true`时该流体不会出现在选择器、数据库等界面中。
- `flammability`：易燃性（0-1）；`0`为不可燃，`>0`可能被高温点燃，`>=0.5`表示非常易燃。
- `temperature`：基础温度（0-1）；`0.5`为环境温度，`<0.5`为低温，`>0.5`为高温流体。
- `heatCapacity`：热容量；值越高，作为冷却剂时吸收热量的能力越强，冷却效果越好。
- `viscosity`：粘度（0-1）；影响流动速度，`0.5`类似水，`1.0`类似焦油（流动极慢）。
- `explosiveness`：爆炸性（0-1）；`0`不爆炸，`>0`受热可能爆炸，`1`为剧烈爆炸。
- `boilPoint`：沸点；流体温度达到此值时蒸发为气体，并触发`vaporEffect`。
- `blockReactive`：是否与方块反应；`true`时会与特定方块发生特殊化学反应。
- `coolant`：是否可作为冷却剂；`false`时即使热容量高也不能用于散热器等设备。
- `moveThroughBlocks`：是否可穿透方块；`true`时流体的水洼可以像水一样渗过墙壁。
- `incinerable`：是否可被焚化；`true`时可以在焚化炉中被销毁。
- `capPuddles`：是否限制水洼大小；`true`时会限制单种流体的最大水洼面积，防止无限蔓延。


## 整理并列表

> 本小节仅作建议与参考，只是提供一种接近原版的、相对工整的形式，项目结构的具体组织还须根据实际情况调整。

通常我们制作mod不会只声明一个物品，更不可能只创建物品，我们上文中直接将`Item`和`Liquid`创建在了Mod主类的`loadContent()`中了，但是实际工作中则不应该这么做，而应当将我们的物品，以及所有其他内容都分好类，然后放在不同的类/文件当中，再在`loadContent()`中调用加载函数以进行加载。

与此同时，我们还需要保存各个物品的变量，以方便在我们定义方块生产消耗等情况时引用这个物品。

这就引出了整理物品以及所有其他游戏内容的需要，通常来说，我们会将各个类型的内容按照一定的规则来进行分类，然后将它们集中的定义在多个类型中。

例如，我们创建一个类型（kotlin则是单例）`ModItems`来存储mod的所有物品，`ModLiquids`来存储mod的所有物品，然后在一个`load()`方法中进行统一创建：

::: code-group

```java ModItems.java
public class ModItems{
  public static Item item1, 
      item2, 
      item3, 
      item4,
      //...
      itemN;
  
  public static void load(){
    item1 = new Item("item1"){{
      //...
    }};
    item2 = new Item("item2"){{
      //...
    }};
    item3 = new Item("item3"){{
      //...
    }};
    item4 = new Item("item4"){{
      //...
    }};
    //...
  }
}
```

```kotlin ModItems.kt
object ModItems{
  lateinit var item1
  lateinit var item2
  lateinit var item3
  lateinit var item4
  //...
  lateinit var itemN

  fun load() {
    item1 = Item("item1").apply {
      //...
    }
    item2 = Item("item2").apply {
      //...
    }
    item3 = Item("item3").apply {
      //...
    }
    item4 = Item("item4").apply {
      //...
    }
    //...
  }
}
```

:::

ModLiquids类也类似。

接着在Mod主类的`loadContent()`方法中调用`load()`方法即可：

::: code-group

```java TutorialMod.java
public class TutorialMod extends Mod{
  @Override
  public void loadContent(){
    ModItems.load();
    ModLiquids.load();
  }
}
```

```kotlin TutorialMod.kt
class TutorialMod: Mod(){
  override fun loadContent(){
    ModItems.load()
    ModLiquids.load()
  }
}
```

:::

不只是物品和流体，我们之后会创建的所有类型的内容，都应当做好分类以便管理和维护。本教程将以此范式继续展开讲解。

## 思考题

试想一下如果我们不在`loadContent()`阶段创建物品会怎么样呢？另外我们今后还会在`loadContent()`阶段创建我们的工厂等，那么调用各类列表的`load()`的顺序应当如何确定呢？
