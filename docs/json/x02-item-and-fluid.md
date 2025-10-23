# 物品与流体

按以往教程的惯例，应该给萌新准备281个模板，本教程也不例外。但是，笔者认为，了解这些模板是怎么来的，比套模板更能走得长远。

## 物品

首先，找到存储物品JSON文件的目录`content/items`，在其中新建一个文件`tutotial-item1.json`。

```json content/items/tutorial-item1.json
{
	"hardness": 4,
	"cost":8,
	"color": "39C5BB",
	"healthScaling": 1.4,
	"alwaysUnlocked":false,
	"radioactivity": 0,
	"explosiveness": 0,
	"flammability": 0,
	"charge":1.2,
	"research": "copper"
}

```

我们在接下来的教程中会称呼如`hardness` `cost`这类东西为**字段（Field）**，字段在Java中指**实例变量**，你不需要知道在Java它是什么意思，只需要知道它们中有的可以填写数值，有的可以填写字符串，最终影响这个方块的**功能与特性**即可。传统上它也可以被称为**变量或接口**，本教程不会使用有误导性的名称。

下面介绍各个字段的用途：

- `type`：虽然上文根本没有这个字段，但做Mindustry模组永远绕不开的一个问题就是物品的`type`到底有没有意义，正确答案是曾经有。所以不要再给你的物品写`"type": "material"`了。
- `color`：**代表色**，控制物品在分类器中被选中时的颜色，使用6位RGB或8位RGBA为表示；
- `flammability`：**可燃性**，控制方块在**火力发电机等**中的发电量，及承载此物品的容器或单位爆炸时产生的火焰大小，包括神风能力。作为参考，原版中的煤是1；
- `explosiveness`：**爆炸性**，控制方块在**火力发电机等**中的爆炸伤害，及承载此物品的容器或单位爆炸时产生的爆炸大小。作为参考，原版中的爆炸混合物是1；
- `radioactivity`：**放射性**，控制方块在**RTG发电机等**中的发电量。作为参考，原版中的钍是1；
- `charge`：**放电性**，承载此物品的容器或单位爆炸时产生的电弧大小。作为参考，原版中巨浪合金为1；
- `hardness`：**硬度**，影响以此物品为出产的**矿物地板**的采掘等级，例如铜为1而钨为5，更多信息见后文；
- `cost`：**建造时间**。原版中方块的建造时间是根据其所需物品计算的，`建造时间 = 对（物品数量 * 物品cost）求和 `。原版中所有的时间都是以 **刻（Tick）** 或 **逻辑帧（Frame）** 为单位的，`1秒 = 60刻`。作为参考，原版中此值最大的为巨浪合金的5；
- `healthScaling`；**生命值倍率**，算法与`cost`类似；
- `research`：**研究**，控制此物品在战役科技树中的位置，你希望让此物品的科技节点在谁后，就在此处填写其**内部名称（Internal Name）**，有关内部名称的问题见下文；
- `alwaysUnlocked`：**是否始终解锁**，`true`代表在科技树中默认解锁；
- 还有一部分字段没有列出……

以上是物品最基本的一些字段，下列原版中矿物硬度及采掘等级表：

| 资源 | 钻头 | 矿机 | 硬度 |
|:---:|:---:|:---:|:---:|
|沙、废料、石墨|||0|
|铜、铅||独影、阿尔法、贝塔|1|
|煤|机械钻头|恒星、幻形、伽马|2|
|钛、铍|气动钻头、等离子钻机|耀星、巨像、苏醒、策动、发散|3|
|钍|激光钻头||4|
|钨|爆炸钻头、大型等离子钻机||5|
||冲击钻头||6|
||爆裂钻头||7|

完成第一个物品的JSON文件后，将文件存入对应的路径，打包模组，进入游戏，你就能看到自己的物品了。如果游戏闪退、红屏、或物品没有显示出来，请再次核对上方内容，或继续向下阅读寻找解决方案。

## 为物品分配名称

> 我们的教程是有体系的，正因如此本教程与众不同，我们没有把`name` `description` `details`算入物品的模板中。

进入游戏之后，你会发现物品还没有中文名，而是显示`item.tutorial-json-mod-tutorial-item1.name`，所以我们接下来要给物品添加一下名称。

### 捷径

你可以直接向JSON文件中添加这些内容：

``` json
"name": "示例物品",
"description": "JSON模组的示例物品，有着大葱的绿色。",
"details": "我是灰色的，所以你看不见我看不见我看不见我"
```

添加之后，整个文件应该长这样：



为了行文方便和篇幅精练，以后每次说到**添加**都不再给出添加后的文件。

在游戏中，`name`是不得不显示的名称，而`description`（简介）和`details`（隐藏信息）在没有的时候可以不显示出来。

- 优点：这样做非常之快，而且很方便，也能比较快地把代码与文案对应上；
- 缺点：以后做**国际化（Internalization，简称i18n）**的时候还是不得不采用第二种方法。

### 使用Bundle

Bundle系统中原版用于处理多语言问题的工具。使用Bundle可以快速国际化整个模组，让不同语言的玩家能加载出各自语言的文案。

为了使用Bundle，你需要在`bundles`文件夹下建立两个文件：`bundle.properties`和`bundle_zh_CN.properties`，都是纯文本格式：

```properties bundle.properties
item.tutorial-json-mod-tutorial-item1.name = Tutorial Item
item.tutorial-json-mod-tutorial-item1.description = Emerald-like json-mod example item.
item.tutorial-json-mod-tutorial-item1.name = You cannot see me you cannot see me 
```

```properties bundle_zh_CN.properties
item.tutorial-json-mod-tutorial-item1.name = 示例教程
item.tutorial-json-mod-tutorial-item1.description = JSON模组的示例物品，有着葱绿色。
item.tutorial-json-mod-tutorial-item1.details = 我是灰色的，所以你看不见我看不见我看不见我 
```

和上文一样，`description`和`details`仍然是可选的。打开你的游戏，测试一下这个物品在简体中文和英文中不同的显示效果。

那么，Bundle文件的格式具体是什么呢？具体来说是这样一条公式：

```properties

<内容类型>.<modName>-<内部名称>.<name/description/details> = 具体内容

```

其中，*内容类型*在物品就是`item`，在流体就是`liquid`；`modName`的相关内容参见上一节`mod.json`； *内部名称（Internal Name）* 对于JSON文件来说，就是其**文件名**。（严格地说，内部名称应该是`<modName>-<文件名>`，例如`tutorial-json-mod-tutorial-item1`）

## 为物品分配贴图

当然，你的物品不能顶着ohno的贴图下去，你需要给物品分配贴图。

物品的贴图**应当**是`32x32`像素、32位RGBA格式、`png`格式的。贴图尺寸有误可能导致某些UI显示不正常，而图片格式有误在某些平台会造成游戏崩溃。贴图的名称与JSON代码的文件名保持一致。

接下来，你需要把贴图放入模组的`sprites/`文件夹下**几乎任意**一个地方。在第一节中，我不 有强调物品的贴图必须放在`sprites/items`下什么的。实际上，在`sprites/`中你可以任意嵌套文件夹来组织你的贴图，但不可以把贴图放到`sprites/blocks/environment`下，因为它不是地板。

## 流体

流体的情况简直和物品是一模一样：

{
	"alwaysUnlocked":false,
	"color": "39C5BB",
	"effect":"shocked",
	"flammability": 1.5,
	"temperature": 0.5,
	"heatCapacity": 0,
	"viscosity": 0.8,
	"explosiveness": 3.2,
	"research": "oil"
}

## FAQ

- *物品的`type`曾经是有用的，具体是什么形式？*：在5.0（v98-v104）版本间，物品分为能进核心的`material`和不能进核心的`resource`。在6.0中这个设定就取消了，7.0中添加了回来，但是这个功能是由字段控制的。*因此，可能大多数人在Bilibili中搜索到的教程都是NPE在5.0时期的教程，或者是复制其模板。*


