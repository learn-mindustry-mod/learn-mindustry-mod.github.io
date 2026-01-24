# 如何寻找需要的类型和字段

## 源代码的下载与结构

下载一份源代码是有很大帮助的。你肯定不希望只能一直使用GitHub的在线浏览器。你可以选择直接在[GitHub项目页面](https://github.com/Anuken/Mindustry)中间的 **Download zip** 处下载。如果使用Git，你可以使用`--depth=1`来减少下载量。当然，如果你的网络条件不太好，可以选择使用**镜像站**来加速。比如，[使用ghproxy来加速源代码的下载](https://ghfast.top/https://github.com/Anuken/Mindustry/archive/master.zip)。

下载源代码后，你主要需要关注的是`core/`文件夹。这个文件夹存放了Mindustry核心文件，以与平台相关代码区分开。其中有三个文件夹：

- `assets/`：存放各种原样进入游戏安装包的资源文件。包括我们需要用到的`bundles/`；
- `assets-raw/`：存放需要处理过后进入游戏安装包的资源文件。有图标和字体，还有最重要的贴图`sprites/`；
- `src/`：存放游戏的java源代码。

## 内部名称与`content`包

在寻找或引用原版的内容时，有的时候我们会主观臆断地认为中文名或所谓的“英文名”就能代表这个内容。比如，很多萌新在引用“初代核心”的时候，有的会写成`defaultCore: 初代核心`、`First Core`或者`Core: Shard`（甚至很用心地注意到了这个冒号）。直接写中文、自己翻译出来的英文或直接打英文名都是不正确的方式。

正确的方式是这样的：如果你的客户端可以在设置中“打开控制台”，那么你只需要打开之，然后在核心数据库里找到你想要的内容，在名称下方会出现一行灰字，就是内容的**内部名称（Internal Name）**了。

![core-database](./imgs/core-database.png)

如果你是安卓或iOS的原版端，则无法打开控制台，需要使用游戏之外的方式。打开你刚刚下载的源代码，在`core/assets/bundles/bundle_zh_CN.properites`下，直接搜索物品的中文名，找到对应的行：

```properties
block.core-shrad.name = 初代核心
```

这样，把其中的`core-shard`摘出来，也是同样的效果。

找到内容的内部名称后，若是想要引用，或者是修改，只需要填在对应的位置或创建相应的文件就可以了。

------

下面，我们想了解一下“初代核心”的**类型（Type）**是什么，以及它有什么字段可以修改。

原版中大部分内容的**注册（Registration）**发生在`mindustry.content`这个软件包下。Java的源代码目录与软件包路径是一一对应的，因此这些代码都存放在`core/src/mindustry/content/`下，此处我们只列出对JSON模组或内容补丁有作用的：

| 文件/文件夹名称 | 内容 |
|----------------|------|
| `Blocks.java` | 原版所有方块，包括地板和覆盖层（Overlay） |
| `Fx.java` | 原版大部分特效 |
| `Items.java` | 原版所有物品 |
| `Liquids.java` | 原版所有流体 |
| `Planets.java` | 原版所有星球 |
| `StatusEffects.java` | 原版所有状态效果 |
| `UnitTypes.java` | 原版所有单位，但无人机和导弹在对应的方块或单位里定义 |
| `Weathers.java` | 原版所有天气 |

进入到对应内容类型的文件，使用`ctrl+F`进行搜索，你应该可以定位到唯一的位置了。整个代码会一直蔓延到双花括号结束：

``` java
coreShard = new CoreBlock("core-shard"){{
    requirements(Category.effect, BuildVisibility.coreZoneOnly, with(Items.copper, 1000, Items.lead, 800));
    alwaysUnlocked = true;

    isFirstTier = true;
    unitType = UnitTypes.alpha;
    health = 1100;
    itemCapacity = 4000;
    size = 3;
    buildCostMultiplier = 2f;

    unitCapModifier = 8;
}};
```

其中，`new`关键字后面的东西就是方块的类型，而花括号内部就是设置的字段，你可以依照原版的配置来修改自己内容的属性。

## 类型及继承

::: warning

注意，以下教程都是针对于没有IDE环境者而言的。如果你安装了IDEA或带有拓展的VSCode，只需要使用“转到声明”功能即可。

:::

接着，我们在`core/arc/mindustry`下就可以直接搜索`CoreBlock.java`这个文件了。搜索到这个文件之后，你只需要关注在前面的 **字段声明（Field Decleration）** 部分，也就是从`public class`开始，到第一个方法（Method）结束：

``` java

public class CoreBlock extends StorageBlock{
    public static final float cloudScaling = 1700f, cfinScl = -2f, cfinOffset = 0.3f, calphaFinOffset = 0.25f, cloudAlpha = 0.81f;
    public static final float[] cloudAlphas = {0, 0.5f, 1f, 0.1f, 0, 0f};

    //hacky way to pass item modules between methods
    private static ItemModule nextItems;
    public static final float[] thrusterSizes = {0f, 0f, 0f, 0f, 0.3f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 1f, 0f};

    public @Load(value = "@-thruster1", fallback = "clear-effect") TextureRegion thruster1; //top right
    public @Load(value = "@-thruster2", fallback = "clear-effect") TextureRegion thruster2; //bot left
    public float thrusterLength = 14f/4f, thrusterOffset = 0f;
    public boolean isFirstTier;
    /** If true, this core type requires a core zone to upgrade. */
    public boolean requiresCoreZone;
    public boolean incinerateNonBuildable = false;

    public UnitType unitType = UnitTypes.alpha;
    public float landDuration = 160f;
    public Music landMusic = Musics.land;
    public Music launchMusic = Musics.coreLaunch;
    public Effect launchEffect = Fx.launch;

    public Interp landZoomInterp = Interp.pow3;
    public float landZoomFrom = 0.02f, landZoomTo = 4f;

    public float captureInvicibility = 60f * 15f;

```

------

这些就是在本类中定义的字段。但是你并不是什么都能改的：

- 你只能改仅由`public`修饰的字段，修改`public final`或`private`没有意义；
- `TextureRegion`等类型无法在JSON中修改。

其余的字段就能按照你自己的意愿进行修改了，但是你仍然需要注意每个字段的类型。如果字段的类型不匹配，游戏就会报错（这和你在Hjson里给numbe’加双引号没有关系，那个属于解析器的宽容性）：

- 原始类型：
  - `int` `short` `byte`：这几个属于**整数**。实际上它们在Java中都有各自的表示范围，例如`int`无法储存像`5418854188`这么大的数字，但是很少有人能碰到这个范围。但你必须注意[**补码**](https://www.cnblogs.com/ban-boi-making-dinner/p/18737141)的问题，例如，在`int`中`2147483648 + 1 == -2147483647`；
  - `float`（原版中不得使用`double`）：它是**浮点数**，或者说是**小数**；
  - `boolean`：**布尔值**，代表真假。true表示真，false表示假
  - `String`：**字符串**，是半个原始类型；
- 引用类型：
  - `int[]` `Seq<Items>` `ObjectSet<PayloadStack>`：它们是**列表**，在JSON中就是用`[]`就可以了；
  - `Item` `Liquid` `UnitType`：这类表示**内容**的字段，在JSON中只需要在对应地方填入内部名称就可以了；
  - `Sound` `Effect`：分别是**音效**和**特效**，也是只需要输入名称就可以了；
  - `Consume` `Interp`：它们是在JSON中不能**直接**操作的类，需要一些游戏的额外解析规则，在对应的章节中有所介绍。

------

除了可以使用本类定义的字段，你还可以使用超类定义的字段。一个类的超类就在`extends`后面声明：

``` java
public class CoreBlock extends StorageBlock
```

这说明`CoreBlock`还可以使用`StorageBlock`类的字段，虽然它只有一个字段`coreMerge`。不过`StorageBlock`又有超类`Block`，这就是一切方块的基类了。当然，它的前面还有`UnlockableContent`等类，相应的会代表概念更加普适的功能。

## Javadoc

以上的内容只告诉了你如果找到字段，但是我们对字段的功能还是一无所知。了解字段功能的最好方法就是找到源代码中使用它的地方并研究其用途，但大部分时候这样做对我们的要求比较高。幸好原版中给我们提供了更加便利的方式————查阅Javadoc或直接翻译变量名。

在字段声明处正上方一行的注释就是字段的Javadoc了：

``` java
/** If true, buildings have an ItemModule. */
public boolean hasItems;
/** If true, buildings have a LiquidModule. */
public boolean hasLiquids;
/** If true, buildings have a PowerModule. */
public boolean hasPower;
```

Javadoc的功能主要就是指出字段的功能。你可以直接把这些文字输入到翻译软件中进行翻译。

有些字段没有Javadoc，这是因为从变量名上已经可以看出变量的用途了：

``` java
public boolean coreMerge = true;
```

这个字段的功能就是”是否与核心合并容量”。

对于这一类的字段翻译方式，有一些小技巧：

- 把使用**驼峰命名法**的名称拆成一个个的单词，例如，这里拆成`core merge`；
- 如果类型为`int`，可以在翻译结果后面加上“数量”二字；如果是`boolean`，就在前面加上“是否”，后面加上问号。

## 常见名词表

大部分翻译软件的效果并不尽如人意。有的时候，你需要自己校正一下在 Mindustry 中释义与常用释义不同的词。或者，你可以直接浏览本站的人工翻译版。下给出常见错译表：
|英文|错译|正解|举例|
|---|---|---|---|
|block|街区|n.方块<br>v.阻挡|作名词不必多言<br>作动词时，见塑钢墙的简介|