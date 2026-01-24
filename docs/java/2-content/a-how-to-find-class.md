# 如何查找自己需要的类型

在本章的学习中，我们已经接触并查阅了部分源代码。本节将系统地介绍查阅原版源代码的流程，以帮助建立自主查阅和理解代码的能力。

## 原版内容加载逻辑

原版中所有被**注册**的内容，其加载类基本位于`mindustry.content`包下，此包的所有内容类型我们都已经看过了，此处列表如下：

| 文件/文件夹名称 | 内容 |
|----------------|------|
| `Blocks.java` | 原版所有方块，包括地板和覆盖层（Overlay） |
| `Bullets.java` | *已废止* |
| `ErekirTechTree.java` | Erekir星的科技树 |
| `Fx.java` | 原版大部分特效 |
| `Items.java` | 原版所有物品 |
| `Liquids.java` | 原版所有流体 |
| `Loadouts.java` | 四个在星球上发射的起始贴图的蓝图 |
| `Planets.java` | 原版所有星球 |
| `SectorPresets.java` | 原版所有区块预设 |
| `SerpuloTechTree.java` | Serpulo星的科技树 |
| `StatusEffects.java` | 原版所有状态效果 |
| `TeamEntries.java` | *暂未使用* |
| `TechTree.java` | 科技树的工具类，不是内容加载类 |
| `UnitTypes.java` | 原版所有单位，但无人机和导弹在对应的方块或单位里定义 |
| `Weathers.java` | 原版所有天气 |
|`../ai/UnitCommand.java`| 原版所有单位命令 |
|`../ai/UnitStance.java`| 原版所有单位姿态 |

v7之后，所有内容加载类的字段和方法都是静态的，在原版中由`Vars.content.createBaseContent()`统一调用，随后各模组的`loadContent()`方法被执行。

`loadContent()`执行后，内容加载并未完成。之后会依次执行所有内容的 `createIcons()`（原版内容的此方法在编译期执行）、`init()`、`postInit()`、`loadIcon()` 和 `load()` 方法，最后才执行`Mod#init()`。

## 根据方块找到合适的class

这里我们特指的内容类型是方块，因为其他类型的子类通常不需要特别查找。

要确定一个方块对应的类，首先需要获取方块的`name`属性。在桌面版或某些修改版中，`name`通常直接显示在方块的统计信息面板上，位于本地化名称的正下方。例如，初代核心的`name`是`core-shard`。接下来，在`Blocks.java`文件中搜索这个`name`，即可定位到其对应的类型。

如果在移动原版中，`name`未在游戏内直接显示，则可以在`源代码文件夹/core/assets/bundle/bundle_zh_CN.properties`文件中搜索该方块的当前中文译名，然后从对应条目的键名中获取其`name`。

## Javadoc

Javadoc 是指一种特殊的注释标准，即以*开头的多行注释，有着给类、方法、字段或注解充当**文档**的功能。`Block` `BulletType` `UnitType`等字段较多的类均有较为详细的Javadoc。本教程之前大部分的字段介绍都是直接由DeepSeek翻译的Javadoc，是想向读者证明，现阶段AI翻译的Javadoc已经达到可堪一用的程度了。

并不是所有字段都有Javadoc，这种情况是由两种原因引起的：一是Anuke犯懒没写；二是这个字段的名称已经完全表明字段的用途了，例如`GenericCrafter`的`ignoreLiquidFullness`，即字面意思是否忽略流体充满。另一方面，你也要利用IDEA提供的“查找用法”功能，当你不知道某一字段用处的时候，可以看看原版内容是如何设置这一字段的。

## 根据类型查找所需的贴图

使用某些类型，特别是贴图导数非常多的类型，会让我们分不清要添加哪些贴图。

原版中所有能绘制的贴图可以用一个`TextureRegion`来表示，而这种贴图都需要在`load()`期从`Core.atlas.find()`中掏出来，所以我们可以直接观察内容的`load()`方法来研究需要什么名称的贴图，如果方块有drawer，那么也可以对drawer作同样处理。例如：

``` java

@Override
public void load(){
    super.load();

    laser = Core.atlas.find(name + "-beam", Core.atlas.find("power-beam"));
    laserEnd = Core.atlas.find(name + "-beam-end", Core.atlas.find("power-beam-end"));
}

```

这段摘自`LongPowerNode.java`的代码展示了如何加载贴图：该方块会尝试加载名为`name + "-beam"`的贴图作为激光中段；`find()`方法的第二个参数表示，如果找不到第一个参数指定的贴图，则会**回滚（Fallback）**到`power-beam`这张贴图。*如果`power-beam`也找不到，则会回滚到`error`贴图（即`ohno`）；如果连`error`贴图也找不到，则表明`Core.atlas`已完全损坏，游戏将崩溃。*

仅靠手动加载有时不够便捷，原版还提供了一个功能强大的**注解（Annotation）**`@Load`。Java 注解（Annotation）是 JDK5.0 引入的一种注释机制。此处 Anuke 使用的并非基础的“运行期注解”，而是功能更复杂的“编译期注解”，它具备**元编程（Meta-programing）**能力，可以自动生成代码。`@Load`注解处理器是原版注解处理器中相对简单的一个，目前无需深究其原理，因为注解处理器是原版源代码中较为复杂的部分。

这里只需了解`@Load`各个参数的含义即可。如果只有一个参数，则该参数即为`value`，代表要加载的贴图“名称”，其中可以包含**插值（Interpolation）**：`@`代表方块的名称，`#`、`#1`、`#2`等代表循环的数字；如果有多个参数，还可能包含`fallback`参数，用于指定回滚的目标贴图名称；`length`与`#`搭配使用，指示其循环长度；`lengths`与`#1`、`#2`等搭配使用，所有数字均**从1开始计数**。

比如：
``` java
//把“select-arrow-small”贴图加载到selectArrowRegion中
public @Load("select-arrow-small") TextureRegion selectArrowRegion;

//把“$name-glow”贴图加载到glow中
public @Load("@-glow") TextureRegion glow;

//把“$namw-launch-arrow”贴图加载到arrowRegion中，如果找不到就回滚到“launch-arrow”
public @Load(value = "@-launch-arrow", fallback = "launch-arrow") TextureRegion arrowRegion;

//把“$name-1”、“$name-2”、“$name-3”加载到regions[]中
public @Load(value = "@-#", length = 3) TextureRegion[] regions;

//把“$name-1-1” “$name-1-2” “$name-1-3” “$name-1-4” “$name-2-1” “$name-2-2” “$name-2-3” “$name-2-4” ………… “$name-7-4”加载到regions[][]中
public @Load(value = "@-#1-#2", lengths = {7, 4}) TextureRegion[][] regions;

//把“$name-bottom-1” “$name-bottom-2” …… “$name-bottom-5”加载到botRegions[]中，哪个找不到就用“duct-bottom-$i”代替
@Load(value = "@-bottom-#", length = 5, fallback = "duct-bottom-#") TextureRegion[] botRegions;

```

你可以用`Content`的练习一下：

``` java
@Override
public void loadIcon(){
    fullIcon =
        Core.atlas.find(fullOverride == null ? "" : fullOverride,
        Core.atlas.find(getContentType().name() + "-" + name + "-full",
        Core.atlas.find(name + "-full",
        Core.atlas.find(name,
        Core.atlas.find(getContentType().name() + "-" + name,
        Core.atlas.find(name + "1"))))));

    uiIcon = Core.atlas.find(getContentType().name() + "-" + name + "-ui", fullIcon);
}
```
*请思考：物品的本体贴图到底有多少种命名方式？Mindustry每次大更新都没有模组负担，为什么Anuke还留着他们？*

## 原版Bundle格式

关于语言的获取代码位于`UnlockableContent`中：

``` java
public UnlockableContent(String name){
    super(name);

    this.localizedName = Core.bundle.get(getContentType() + "." + this.name + ".name", this.name);
    this.description = Core.bundle.getOrNull(getContentType() + "." + this.name + ".description");
    this.details = Core.bundle.getOrNull(getContentType() + "." + this.name + ".details");
    this.unlocked = Core.settings != null && Core.settings.getBool(this.name + "-unlocked", false);
}

```

其中`getContentType()`就是上节提到的`ContentType`若干种。另外需要知道的是，在内容的name前面自动加`modName`是`Vars.content.transformName()`方法的功能。此时我们回顾一下各种内容的bundle格式就是极为合适的：

``` properties
```

此外，前面也讲到一些不属于`UnlockableContent`的东西，他们的bundle是自己加载的。

``` properties
command.tutorialUnitCommand = 演示单位命令
stance.tutorialUnitStance = 演示单位姿态
ability.turorialunitability = 演示单位能力
techtree.tutorial = 演示科技树

```

并且我们会发现，这些内容的`name`并不再是连字符命名的，`command`和`stance`是小驼峰命名，而`ability` 干脆是**类名全小写化**，正如它的代码一样：

``` java
public String localized(){
    return Core.bundle.get(getBundle());
}

public String getBundle(){
    var type = getClass();
    return "ability." + (type.isAnonymousClass() ? type.getSuperclass() : type).getSimpleName().replace("Ability", "").toLowerCase();
}
```

## 其他我暂时不知道在哪里讲合适的东西

本节是一些原版比较偏难怪的功能，未来这些内容可能会分散在本章或后几章中。

> 一个莫斯科大学的数学教授跳槽到了哈佛，刚一抵达就被要求教数学分析，于是他跑去问其它教授：“这门课我该教些什么？”其他人告诉他：“教点极限、连续性、可微性，再加点不定积分就行了。”第二天，他又跑过来问其他教授，“那我第二堂课该教些什么呢？”

### Env位掩码系统

在方块、单位等处中你均可以看到三个变量：

- `envRequired`：要求当前地图环境符合该变量的所有环境需求；
- `envEnabled`：要求当前地图环境符合该变量的某个环境需求；
- `envDisabled`：要求当前地图不符合该变量的任何环境需求。

并且行星也有一个字段`defaultEnv`，默认值为`Env.terrestrial | Env.spores | Env.groundOil | Env.groundWater | Env.oxygen`。

但是这些字段的值都是`int`类型的，意味着他们只是数字而已，事实也是如此，defaultEnv的值为`0b01110101`，也就是`117`。这说明，这里采用了某种机制在数字中隐藏了信息，实际上，这里使用的方法是**位掩码（Bitmask）**，通过把二进制数的某位设置为0或1来对标记进行设置。比如说，原版中所有`env`是这样定义的：

``` java
public class Env{
    public static final int
    //处在星球上
    terrestrial = 1,
    //在太空中，没有大气层
    space = 1 << 1,
    //在水下，首先要在星球上
    underwater = 1 << 2,
    //有孢子
    spores = 1 << 3,
    //环境就像火焰山
    scorching = 1 << 4,
    //有石油
    groundOil = 1 << 5,
    //有地下水
    groundWater = 1 << 6,
    //大气层中有氧气
    oxygen = 1 << 7,
    //所有环境，用来位掩码运算
    any = 0xffffffff,
    //没有环境
    none = 0;
}
```

具体来说，位掩码是这样操作的：
- 首先我们要获得当前地图环境的`env`：`Vars.state.rules.env`（假设为默认值：`0b01110101`）
- 然后对一个需要判断在当前地图环境下能否工作的方块或单位：
- * `envRequired`要么是空的，要么与`env`作“或”（Or）操作，结果为`envRequired`，说明要求的环境都是存在的；
  * `envEnabled`与`env`作“与”（And）操作，结果不为空，说明要求的环境至少存在一个；
  * `envDisabled`与`env`作“与”（And）操作，结果为空，说明禁止的环境都不存在。

原版只用了`int`的后八位，模组还有56位的发挥空间。

像这样的位掩码机制原版在**存档机制**中使用较多，毕竟存档是一个 <font style="color:red;">**寸土寸金**</font> 的地方。此外，还有一种数据结构叫作**BitSet**（在Arc为`arc.struct.Bits`），设计出来专门就是存放大量0/1数据的。

### `Interp`

与统计学上的同名概念或`lerp`不同，Arc（源自LibGDX）中的插值`Interp`是一种**补间（Tweening）**函数，通常定义为从`[0,1]`区间映射到`[0,1]`区间的函数，用于在两个值之间实现平滑过渡或创建视觉效果。在Java中，它以Lambda表达式的形式存在，位于`arc.math.Interp`类中，该类也提供了一些实用的补间函数。

插值函数的存在是必要的，因为人眼对匀速运动的感知并不自然，而非线性的补间函数可以使变化看起来更**平滑**。原版（同样源自LibGDX）提供的一些`Interp`示例可见于[LibGDX wiki](https://libgdx.com/wiki/math-utils/interpolation)上的相关图示


