# 物品与流体

传统教程通常提供大量模板供初学者使用，本教程也包含相关模板。然而，理解模板的生成原理比单纯套用模板更有助于长期学习。

## 物品

首先，找到存储物品JSON文件的目录`content/items`，在其中新建一个文件`tutorial-item1.json`。

```json content/items/tutorial-item1.json
{
	"hardness": 4,
	"cost": 8,
	"color": "39C5BB",
	"healthScaling": 1.4,
	"alwaysUnlocked": false,
	"radioactivity": 0,
	"explosiveness": 0,
	"flammability": 0,
	"charge": 1.2,
	"research": "copper"
}

```

我们在接下来的教程中会称呼如`hardness` `cost`这类东西为**字段（Field）**，字段在Java中指**实例变量**，你不需要知道在Java它是什么意思，只需要知道它们中有的可以填写数值，有的可以填写字符串，最终影响这个方块的**功能与特性**即可。传统上它也可以被称为**变量或接口**，本教程不会使用有误导性的名称。

下面介绍各个字段的用途：

- `type`：虽然上文根本没有这个字段，但做Mindustry模组永远绕不开的一个问题就是物品的`type`到底有没有意义，正确答案是曾经有。所以不要再给你的物品写`"type": "material"`了；
- `color`：**代表色**，控制物品在分类器中被选中时的颜色，使用6位RGB或8位RGBA表示；
- `flammability`：**可燃性**，控制方块在**“火力发电机”等**中的发电量，及承载此物品的容器或单位爆炸时产生的火焰大小，包括神风能力。作为参考，原版中的“煤炭”是1；
- `explosiveness`：**爆炸性**，控制方块在**“火力发电机”等**中的爆炸伤害，及承载此物品的容器或单位爆炸时产生的爆炸大小。作为参考，原版中的“爆炸混合物”是1；
- `radioactivity`：**放射性**，控制方块在**“RTG 发电机”等**中的发电量。作为参考，原版中的“钍”是1；
- `charge`：**放电性**，承载此物品的容器或单位爆炸时产生的电弧大小。作为参考，原版中“巨浪合金”为1；
- `hardness`：**硬度**，影响以此物品为出产的**矿物地板**的采掘等级，例如“铜”为1而“钨”为5，更多信息见后文；
- `cost`：**建造时间权重**。原版中方块的建造时间是根据其所需物品计算的，`建造时间 = Σ(物品数量 * 物品cost)`。原版中所有的时间都是以**刻（Tick）**或**逻辑帧（Frame）**为单位的，`1秒 = 60刻`。作为参考，原版中此值最大的为“巨浪合金”的5；
- `healthScaling`：**生命值倍率**，算法与`cost`类似，会累加到方块的基础生命值倍率中；
- `lowPriority`：**低优先级**，为`true`时钻头更倾向于其他矿物；
- `buildable`：**是否可用于建造**，为`false`时该物品不能作为建筑材料，通常会在某些核心中被焚毁；
- `hidden`：**是否隐藏**，为`true`时不会在资源选择界面等位置显示；
- `frames`/`transitionFrames`/`frameTime`：**动画相关**，设置后可让物品贴图帧动画化；
- `research`：**研究**，控制此物品在战役科技树中的位置，你希望让此物品的科技节点在谁后，就在此处填写其**内部名称（Internal Name）**，有关内部名称的问题见下文；
- `alwaysUnlocked`：**是否始终解锁**，`true`代表在科技树中默认解锁；
- 还有一部分字段没有列出……

以上是物品最基本的一些字段，下列原版中矿物硬度及采掘等级表：

| 资源 | 钻头 | 矿机 | 硬度 |
|:---:|:---:|:---:|:---:|
|“沙”、“废料”、“石墨”|||0|
|“铜”、“铅”||“独影”、“阿尔法”、“贝塔”|1|
|“煤炭”|“机械钻头”|“恒星”、“幻型”、“伽马”|2|
|“钛”、“铍”|“气动钻头”、“等离子钻机”|“耀星”、“巨像”、“苏醒”、“策动”、“发散”|3|
|“钍”|“激光钻头”||4|
|“钨”|“爆破钻头”、“大型等离子钻机”||5|
||“冲击钻头”||6|
||“爆裂钻头”||7|

完成第一个物品的JSON文件后，将文件存入对应的路径，打包模组，进入游戏，你就能看到自己的物品了。如果游戏闪退、红屏、或物品没有显示出来，请再次核对上方内容，或继续向下阅读寻找解决方案。

## 为物品分配名称

> 我们的教程是有体系的，正因如此本教程与众不同，我们没有把`name` `description` `details`算入物品的模板中。

进入游戏之后，你会发现物品还没有中文名，而是显示`item.tutorial-json-mod-tutorial-item1.name`，所以我们接下来要给物品添加一下名称。

### 捷径

你可以直接向JSON文件中添加这些内容：

```json
"name": "示例物品",
"description": "JSON模组的示例物品，有着大葱的绿色。",
"details": "我是灰色的，所以你看不见我看不见我看不见我"
```

添加之后，整个文件应该长这样：



为了行文方便和篇幅精练，以后每次说到**添加**都不再给出添加后的文件。

在游戏中，`name`是不得不显示的名称，而`description`（简介）和`details`（隐藏信息）在没有的时候可以不显示出来。

- 优点：这样做非常之快，而且很方便，也能比较快地把代码与文案对应上；
- 缺点：以后做**国际化（Internationalization，简称i18n）**的时候还是不得不采用第二种方法。

### 使用Bundle

Bundle系统是原版用于处理多语言问题的工具。使用Bundle可以快速国际化整个模组，让不同语言的玩家能加载出各自语言的文案。

为了使用Bundle，你需要在`bundles`文件夹下建立两个文件：`bundle.properties`和`bundle_zh_CN.properties`，都是纯文本格式：

```properties bundle.properties
item.tutorial-json-mod-tutorial-item1.name = Tutorial Item
item.tutorial-json-mod-tutorial-item1.description = Emerald-like json-mod example item.
item.tutorial-json-mod-tutorial-item1.details = You cannot see me you cannot see me 
```

```properties bundle_zh_CN.properties
item.tutorial-json-mod-tutorial-item1.name = 示例物品
item.tutorial-json-mod-tutorial-item1.description = JSON模组的示例物品，有着葱绿色。
item.tutorial-json-mod-tutorial-item1.details = 我是灰色的，所以你看不见我看不见我看不见我 
```

和上文一样，`description`和`details`仍然是可选的。打开你的游戏，测试一下这个物品在简体中文和英文中不同的显示效果。

那么，Bundle文件的格式具体是什么呢？具体来说是这样一条公式：

```properties

<内容类型>.<modName>-<文件名>.<name/description/details> = 具体内容

```

其中，内容类型在物品中就是`item`，在流体就是`liquid`；`modName`的相关内容参见上一节`mod.json`；文件名是**文件名**，是`tutorial-item1`而不是什么`示例物品`什么的。其中，`<modName>-<文件名>`合称**内部名称（Internal Name）**。

## 为物品分配贴图

当然，你的物品不能一直顶着ohno的贴图，你需要给物品分配贴图。

物品的贴图**应当**是`32x32`像素、32位RGBA格式、`png`格式的。贴图尺寸有误可能导致某些UI显示不正常，而图片格式有误在某些平台会造成游戏崩溃。贴图的名称与JSON代码的文件名保持一致。

接下来，你需要把贴图放入模组的`sprites/`文件夹下**几乎任意**一个地方。在第一节中，我没有强调物品的贴图必须放在`sprites/items`下什么的。实际上，在`sprites/`中你可以任意嵌套文件夹来组织你的贴图，但不可以把贴图放到`sprites/blocks/environment`下，因为它不是地板。

## 流体

流体的情况简直和物品是一模一样，不过你需要在`content/liquids`目录下建立文件了。

```json content/liquids/tutorial-fluid1.json
{
	"alwaysUnlocked": false,
	"color": "39C5BB",
	"flammability": 1.5,
	"temperature": 0.5,
	"heatCapacity": 0.5,
	"viscosity": 0.8,
	"explosiveness": 3.2,
	"research": "oil"
}

```

- `color`：**代表色**，是在**液体槽**中此流体默认的颜色，也在流体管道中此流体的颜色；
- `gasColor`：**气体颜色**，仅在`gas`为`true`时生效；
- `barColor`：**UI颜色**，不设置时默认使用`color`；
- `lightColor`：**发光颜色**，透明度决定亮度；
- `flammability`：**可燃性**，控制装有此流体的方块或此流体形成的水洼遇火时产生的二次燃烧大小。作为参考，原版中此项最大值为“石油”的1；
- `temperature`：**温度**，控制是否能充当**冷却液（Coolant）**，0.5为常温；
- `heatCapacity`：**热容**，控制充当冷却液时的效果；
- `viscosity`：**黏度**，控制水洼消失的速度；
- `explosiveness`：**爆炸性**，控制装有此流体的方块或此流体形成的水洼遇火时产生的爆炸大小；
- `coolant`：**是否可当冷却液**，为`false`时不会被当作冷却液；
- `gas`：**是否为气体**，设置为`true`为气体，为`false`为液体。气体不会产生水洼，且通常不作为冷却液；
- `boilPoint`：**汽化阈值**，当环境温度超过此值时，从管道中流出的流体会以气体形态泄漏；
- `blockReactive`：**是否与方块反应**，例如“矿渣”与“水”的反应；
- `incinerable`：**是否可被焚毁**，影响“焚化炉”等处理；
- `moveThroughBlocks`：**是否可渗透方块**，为`true`时水洼可以穿过方块；
- `capPuddles`：**是否限制水洼上限**，为`false`时水洼可无限堆积；
- `effect`/`particleEffect`/`particleSpacing`：**状态与粒子效果**，控制液体效果与水洼粒子；
- `hidden`：**是否隐藏**，为`true`时不会在资源选择界面等位置显示；
- 还有一部分字段没有列出……

当然，你还需要一些贴图和语言文件，或者是直接在JSON中设置`name`等字段。

## FAQ

- **物品的`type`曾经是有用的，具体是什么形式？**：在5.0（v98-v104）版本间，物品分为能进核心的`material`和不能进核心的`resource`。在6.0中这个设定就取消了，7.0中添加了回来，但是这个功能是由字段控制的。*大多数人在Bilibili中搜索到的教程都是NPE在5.0时期的教程，或者是复制其模板，所以会给物品填写`type`*；
- **如果同时设置`name`字段和Bundle文件会发生什么呢？**：按此优先级读取：`本语言Bundle` > `英文Bundle` > `name`字段。这也意味着，如果你以后想增加国际化支持也不晚，而且有现成的工具支持读取`name`字段生成Bundle文件；
