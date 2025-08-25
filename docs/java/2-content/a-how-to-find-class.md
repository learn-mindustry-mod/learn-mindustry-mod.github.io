# 如何查找自己需要的类型和字段

在本章的学习中，我们已经潜移默化地在利用和查阅源代码了。本节我们将系统地讲解查阅原版源代码的流程，帮助养成举一反三的能力，以及减少对他人的依赖。

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

v7之后，所有的内容加载类的所有字段和方法都是静态的，在原版中由`Vars.content.createBaseContent()`统一调用，紧随着就是各个模组的`loadContent()`被执行。

## 根据方块找到合适的class

这里我们特指的内容类型就是方块，因为其他类型的子类不那么重要。

为了找到一个方块的class，我们首先要找到方块的`name`，在桌面端或某些改端中，`name`通常直接显示在方块的统计信息中，就在本地化名称的正下方。例如，初代核心的`name`是`core-shard`。接下来，直接在`Blocks.java`下面搜索这个`name`，就能直接得到类型了。

如果在移动原版端中，`name`并不在游戏中显示，这时你应该在`源代码文件夹/core/assets/bundle/bundle_zh_CN.properties`中搜索方块当前版本中文译名，然后从对应条目的键名中获得其`name`。

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

这段摘自`LongPowerNode.java`代码告诉了我们，这个方块会试图获取名字为`name + "-beam"`的贴图充当其激光中段；而`find()`的第二个参数代表着，如果没有找到第一个参数的贴图，将 **回滚（Fallback）** 到`power-beam`这张贴图上去。*如果`power-beam`也找不到，就会回滚到`error`这张贴图上，即`ohno`；如果`error`也找不到，说明整个Core.atlas已经彻底坏了，直接崩溃游戏。*

但是只有这个是不够的，原版还有一个非常强力的 **注解（Annotation）** `@Load`。Java 注解（Annotation）又称 Java 标注，是 JDK5.0 引入的一种注释机制。在这里Anuke使用的不是最初的“运行期注解”，而是功能更为复杂的“编译期注解”，有着 **元编程（Meta-programing）** 的能力，说人话就是能自动生成代码。`@Load`注解处理器是原版注解处理器中比较简单的一个，但是我们现在没有必要知道其原理，毕竟注解处理器是原版源代码的珠穆朗玛峰。

在这里我们只需要了解一下`@Load`的各个参数的含义即可。如果只有一个参数，那么这个参数就是`value`，也就是要加载的贴图的“名称”，但中间会夹杂着一些 **插值（Interpolation）** ，用`@`代表方块的名称，用`#` `#1` `#2`代表若干数字的循环；如果有多个参数，还可能会有`fallback`，这个参数指示回滚的目标贴图名称；`length`与`#`搭配指示其长度，`lengths`与`#1` `#2`搭配，所有都是**从1计数**的。

比如：
```java
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

## 原版Bundle格式

