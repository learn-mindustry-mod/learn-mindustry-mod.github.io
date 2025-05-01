# 物品

> ***"大楼一定是用砖块砌成的"***

作为一个工厂游戏，物品和流体可以说是整个游戏唯二的基础构件，任何游戏性的内容一定是以此为基础的。所以，我们将从这里开始。

## 添加一个物品

如果以前做过其他游戏的模组的话，你肯定对内容的 **注册（Register）** 过程十分熟悉，简而言之注册就是让游戏中可以显示出新添加的内容的过程。在其他游戏中， **实例化（Instantiate）** 代表物品的对象，和注册物品，是不同的两个过程。不过，在Mindustry中，新建一个代表物品的对象和注册一个物品是同一个操作，所以，在任何时候，一句`new Item("my-item",Color.of("#ffffff"))`，就会往游戏里添加一个物品了。

不过，在实际开发的过程中，把干同样事情的代码散落在项目各处，会导致维护上极大的不便，因此，参考原版代码，一个比较良好的范式，就是在一个名为`content`的 **软件包（Package）** 里，把每一种 **内容类型（Content Type）** 放置在一个文件当中。下面我们将给出具体的代码。

### 代码部分

首先，找到项目的源代码根目录，右键之并选择`新建>>软件包`，建立`content`软件包。然后，在此软件包中，新建名为`LLMItems`的类（Java）。

接下来，对于Java，在此类中建立一个类型为`Item`的静态变量`sodium`，再新建一个静态方法`void load()`（意思是此方法没有参数，同时返回值类型为`void`）。如果IDEA提示找不到`Item`类，请稍等片刻，如果持续找不到，请返回上一节查看依赖是否配置正确。接下来，在此方法中，添加如下代码。

::: code-group
```java
sodium = new Item("sodium", Color.valueOf("eeeeee")) {{
        hardness = 0;
        flammability = 0.5f;
        explosiveness = 0.5f;
        cost = 3.5f;
}};
```

```kotlin
```
:::

如果只是写下了这行代码是没有用的，因为这行代码并不会自动被游戏执行。因为，你还需要建立一个通道，把这些代码的执行权交给一个游戏会主动执行的地方，而这个地方，正是主类的`loadContent()`方法。所以，你还要在主类的loadContent方法中添加上一行：

::: code-group
```java
    LLMItems.load()
```

```kotlin
```
:::

现在，打包模组，加载到游戏中，你就会获得一个没有名字、没有贴图的物品了。

如果你要添加第二个物品，`LLMItems`就不必再次添加了，而静态变量和方法中的实例化需要重复。不过，静态变量在Java可以进行堆叠，如原版例：
```java

```

### 语言部分

Mindustry具有天生的多语言支持，当然这里指的是自然语言。如果你以前写JSON模组的话，你可能压根没听说过什么是 **多语言文件（Bundle）** 。不过，既然Java模组直接在代码里添加老三样（即`localizedName` `description` `details`）并不容易，那么下面将介绍Bundle文件的具体写法。

::: info
有关`localizedName`、`name`和bundle中name的概念，及在json和java中的优先次序问题，请参见通识，本文不再赘述。
:::

首先在项目的`assets`文件夹下建立`bundles`文件夹，并在其中建立`bundle.properties`和`bundle_zh_CN.properties`两个文件。接下来，分别填入以下内容：

``` properties
item.lmm-sodium.name = Sodium
item.lmm-sodium.decription = Silver-gray flammable metal.
item.lmm-sodium.details = Fire puts off water while water boils fire
```

``` properties
item.lmm-sodium.name = 钠
item.lmm-sodium.decription = 银白色的可燃金属。
item.lmm-sodium.details = 火能把水浇灭，水能把火蒸干
```

其中，三级域名中的`item`即代表其**内容类型**的**单数形式**。二级域名为此内容的 **内部名称（Internal Name）**，下文将对此概念进一步阐述。一级域名即老三样，其中`name`必定会在游戏中显示，而`description`和`details`若未被声明则无显示。此种查找方式在游戏源代码中可查。

至于bundle文件本身，`bundle.properties`代表的是英语。当玩家使用的语言的bundle中没有某项条目的，会回退到英语；如果英语bundle中仍然没有此项条目，游戏就不得不将此条目直接显示出来，并在左右各加上三个问号。这也就解释了为什么未添加bundle时，物品的 **本地化名称（Localized Name）** 是`???item.lmm-sodium.name???`。而`bundle_zh_CN.properties`代表的是简体中文，其中`zh_CN`即为语言代码，关于原版支持的语言请参考原版，例如`fr``ja``ru``zh_TW`。

### 贴图部分

<font style="color:red;background-color:white">Oh no！</font>

::: warning

**切记，未经允许盗用他人贴图极其破坏圈子氛围，当然灵感来源和引用其他模组的贴图是可以的。**

**“开源的东西，我想干嘛就干嘛”这种借口不可能被认可和接受，小心吃黑名单。**

:::

坦白地说，贴图是模组的一大拦路虎，不过，本系列教程并不会教你画贴图，贴图教程请参考本网站其他栏目。这里假设你已经拥有了合适的贴图，只待加载进游戏。

若想给内容加载贴图，首先应当明白此内容需要什么贴图。就没有动态贴图的物品而言，贴图只需要一张。

首先，在项目的`assets`文件夹下建立`sprites`文件夹，然后将贴图复制进入此文件夹，并把名称改为**无模组名的内部名称**，当然要包括其png后缀，此例中即为`sodium.png`。现在，打包模组，加载到游戏中，你就会获得一个有名字、有贴图的物品了！

在`sprites`文件夹中可以建立任何层数文件夹，贴图文件的路径对对游戏中贴图的引用没有任何关系，不过也有一个例外（见本章后文）。至于贴图本身，应当是`png`格式，且对于物品应当为`32x32`像素大小。尺寸不正常的贴图可能造成游戏卡顿或贴图模糊，同时在一些界面中贴图的大小并不会被自动缩放。


## 属性

::: warning
再次强调：没有Java基础是没有办法做模组的，即使你复制了上面的代码，也可能出现无法理解的语法错误、不规范的大小写等问题，建议至少学完Java面向对象再学习Java模组。
:::

让我们先回到刚才的代码当中：

::: code-group
```java
sodium = new Item("sodium", Color.valueOf("eeeeee")) {{
        hardness = 0;
        flammability = 0.5f;
        explosiveness = 0.5f;
        cost = 3.5f;
}};
```

```kotlin
```
:::

这里我们先介绍三个名词：
+ 变量名（Variable Name）：上方代码中第一个`sodium`处在的位置，通常来说，它是驼峰命名；
+ 无模组名的内部名称（Internal Name）：上方代码中第二个`sodium`处在的位置，通常来说，它是全小写并且由连字符连接的；
+ 有模组名的内部名称：在无模组名的内部名称前面加上一个`模组名称-`。

如果你把这段代码和游戏中的核心数据库进行对比的话，就会发现其可燃性和爆炸性都为50%，和上文的代码相同；不过，刚才的代码中还有两个东西`hardness`和`cost`不清楚有什么用；此外，还不太清楚放电性和放射性怎么在代码里表达出来。最重要的是，刚才那个声明物品的语法（Java）完全没在Java教程中见过，它到底是什么原理？。前两个问题，都应当从源代码中去获取答案。不过，在此我们先解决第三个问题：

## 匿名类
上文代码的原理，可以进行如下概括：
```java

sodium = 
    //构造方法
    new Item("sodium", Color.valueOf("eeeeee")){

    //匿名类方法区

    //对象初始化器
    {
        hardness = 0;
        flammability = 0.5f;
        explosiveness = 0.5f;
        cost = 3.5f;
    }

};
```

**[匿名类（Anonymous Class）](https://www.runoob.com/java/java-anonymous-class.html)**，故名思义，就是没有名称的类。你可能会怀疑，类声明出来就是为了实例化对象的，没有名称怎么引用它？但有的时候，我们就是需要一种不会被第二次使用的类，只生成一个对象，并且不想浪费时间在给它取名上，这就是匿名类的作用。

对应到Mindustry开发中，Anuke迫切需要一种能快速修改物品的属性的方法，如果上述代码用传统写法，大抵是这样：

```java
sodium = new Item("sodium", Color.valueOf("eeeeee"));
sodium.hardness = 0;
sodium.flammability = 0.5f;
sodium.explosiveness = 0.5f;
sodium.cost = 3.5f;
```

可以看到sodium被写了四次，这还是仅有四个属性要修改，如果有几十个字段要修改，那真的是要累死。

要解决这个问题，有一种解决方式是这样的：
```kotlin
sodium = Item("sodium", Color.valueOf("eeeeee")).apply{
    hardness = 0
    flammability = 0.5f
    explosiveness = 0.5f
    cost = 3.5f
}
```
这可能就是Kotlin中作用域方法发明的初衷，这里的`apply`方法就是直接把lambda中的`this`设置到`sodium`上了，因此不用再写出hardness的接受者是谁，直接按照this的隐式省略原则设置到`sodium`。不过，在Java中也并不是不能这么做，比如在UI编程中，Anuke自己就搓了一套类似作用域方法的轮子，不过并不能像Kotlin一样接替`this`，并没有根治这个问题。

因此，在设置内容的参数的时候，Anuke求助了匿名类。而作为一个类，要想设置新实例化对象的属性，正应该借助由`{}`包裹的对象初始化器。

**对象初始化器**，即在类中直接由大括号包裹，而没有任何方法声明的一个特殊的方法，平时使用的时候可能长这样：
```java
public class Employee{
    public int age;

    public Employee(int age){
        this.age = age;
        System.out.println("构造方法被调用了");
        System.out.println(this.age);
    }

    //对象初始化器
    {
        this.age *= 2
        System.out.println("对象初始化器被调用了");
        System.out.println(this.age);
    }
}
```
把这段代码放在一个正常的Java项目中，在`main`方法中实例化一个Employee对象，然后你就会发现，实际上对象初始化器和构造方法是连续的，他们两个共同构成了实例化过程中初始化对象的`<init>`方法。不过从结果上来看，在构造方法中更改对象的变量，不正是我们想要的效果嘛。这样Anuke写出了字数更少并且可读性更好的代码，我们看起来也方便了不少，可是，代价是什么呢？

代价就是，每一个内容都有自己的类，并且都是匿名类。一方面，Java中一类一class文件，导致了编译出来的文件数极多。另一方面，当你第一次尝试反射的时候，往往会获取不到你想要的基类。此类问题在以后遇到对应位置时将会再次提及。

## 字段、构造方法和Javadoc

现在，明白了背后的语法原理，终于要去源代码看看物品的属性到底是什么了。点击`Item`类，并按下``快捷键（macOS上为`Command+下`），然后将跳转到`Item`类的页面。接下来，找到其中的字段区，如下所示（有省略）：

```java
    public Color color;

    /** how explosive this item is. */
    public float explosiveness = 0f;
    /** flammability above 0.3 makes this eligible for item burners. */
    public float flammability = 0f;
    /** how radioactive this item is. */
    public float radioactivity;
    /** how electrically potent this item is. */
    public float charge = 0f;
    /** drill hardness of the item */
    public int hardness = 0;
    /**
     * base material cost of this item, used for calculating place times
     * 1 cost = 1 tick added to build time
     */
    public float cost = 1f;
    /** When this item is present in the build cost, a block's <b>default</b> health is multiplied by 1 + scaling, where 'scaling' is summed together for all item requirement types. */
    public float healthScaling = 0f;
    /** if true, this item is of the lowest priority to drills. */
    public boolean lowPriority;
    ......

    public Item(String name, Color color){
        super(name);
        this.color = color;
    }

    public Item(String name){
        this(name, new Color(Color.black));
    }
```

一般来说，每个类中代码的第一部分就是实例变量的声明，**这些实例变量被称为字段（Field）**。你应当可以感觉到，刚才的代码中就涉及了`flammability` `explosiveness` 等字段。

**在字段的上方还有一些由`/** */`的包裹的多行注释，这种注释被称为Javadoc**，通常来说，Javadoc用来表明字段的用途。如下例：
> 英文：*how radioactive this item is.*<br>
> 中文：*此物品有多大的放射性。*

不过，有时字段的功能已经十分明晰，就没有再用Javadoc作进一步解释，比如`hidden`，这个单词本来就是隐藏的意思，结合其类型可知要表达物品是否隐藏。

要了解这个字段的用途，对于任何人（包括英语母语者）的困难都是读懂这里的英文。事实上，任何一个细分学科中的英语都和日常的英语大体相同但有细微差别，并且，翻译器有的时候并不能相信，所以，还是建议在开发过程中逐渐积累计算机领域和游戏领域的英语表达。此处仅举一例`Block`。

至于此处除了四个物品的属性和其颜色以外的字段，在此处并没有其用处，对此的讨论将下放至其用例处。

此处你会看到一个`color`字段，其虽然没有Javadoc，但是其意思是“在分类器中显示的颜色”，可是，我们刚才在匿名类中并没有设置这个变量，那它是怎么被设置的呢？这时眼尖的你一定已经发现了，color字段是在构造方法设置的，并且如果采用了不设置颜色的构造方法，那么默认会被设置成黑色。这里我要提醒你的是，**不要放过构造方法的参数**。

## `Color`类



## 练习题
强调建议你在实践中应用以上的规律来检验你对模组的理解程度，所以准备了以下习题供练习：

+ 后文我们将用到几个物品：钾（Potassium）、岩盐（Rock Salt）。请根据自己对这两种物品的理解，在模组中创建出这两个物品，并给出完整的`LLMItems.java`。
+ 刚才的`Item`类中有一部分未节选的字段声明。将他们找出来并推测每一个字段的意思。
+ 以下是`Liquid`类的节选，请解释其中各个字段的意思，请推测其用途：
```java    
    /** 0-1, 0 is completely not flammable, anything above that may catch fire when exposed to heat, 0.5+ is very flammable. */
    public float flammability;
    /** temperature: 0.5 is 'room' temperature, 0 is very cold, 1 is molten hot */
    public float temperature = 0.5f;
    /** how much heat this liquid can store. 0.4=water (decent), anything lower is probably less dense and bad at cooling. */
    public float heatCapacity = 0.5f;
    /** how thick this liquid is. 0.5=water (relatively viscous), 1 would be something like tar (very slow). */
    public float viscosity = 0.5f;
    /** how prone to exploding this liquid is, when heated. 0 = nothing, 1 = nuke */
    public float explosiveness;
```
+ 不复制到IDE中，判断以下代码能否正常运行，如果能，是否符合规范：

A.
```java 
PlumBlossom = new Item("PlumBlossom", Color.valueOf("66fe7e")) {{
        hardness = 0;
        flammability = 0.5f;
        explosiveness = 0.5f;
        cost = 3.5f;
}};
```

B.
```java
orchid = new Item("orchid", Color.valueOf("6e77ef")) {
        hardness = 0;
        flammability = 0.5f;
        explosiveness = 0.5f;
        cost = 3.5f;
};
```

C.
```java 
bamboo = new Item("bamboo", Color.valueOf("1g3e4e")) {{
        hardness = 0;
        flammability = 0.5f;
        explosiveness = 0.5f;
        cost = 3.5f;
}};
```

D.
```java 
chrysanthemum = new Item("chrysanthemum", Color.valueOf("1f3e4e")) {{
        hardness = 0;
        flammability = 0.5f;
        explosiveness = 0.5f;
        cost = 3.5f;
}};
```

如果你看不出来，可以将代码复制到IDEA，请将这四个内容添加到你的模组中去，检察他们是否添加成功，游戏是否被没有崩溃，IDEA是否没有提示语法错误。
