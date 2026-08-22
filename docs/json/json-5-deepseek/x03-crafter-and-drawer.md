# 工厂、方块通性、消耗器、绘制器

> ***"从矿石到成品的魔法，都发生在一个方块里。"***

物品和流体只是躺在仓库里的原材料，真正让世界运转起来的是**方块（Block）**。这一章我们要造出第一个"会干活"的方块——一个自动消耗铜、吐出强化铜的工厂，并在过程中揭开三张隐藏的网：所有方块共享的**通性**、决定"吃什么"的**消耗器**、决定"长什么样"的**绘制器**。

学完这一章，你就能随手捏出任意配方、任意外观的加工厂。

**本章涉及的源码**：`mindustry/world/Block.java`、`mindustry/world/blocks/production/GenericCrafter.java`、`mindustry/world/consumers/`、`mindustry/world/draw/`、`mindustry/mod/ContentParser.java`。

---

## 方块通性：所有方块的公共底盘

在 Mindustry 里，所有方块都继承自同一个基类 `Block`（源码 `world/Block.java`）。这意味着无论你是工厂、炮塔还是传送带，都共享一大批"通性"字段。我们先扫一遍最常用的：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | 字符串 | `Block` | 方块类型，决定它"是什么"。工厂填 `GenericCrafter` |
| `size` | 1~8 整数 | 1 | 占地边长（格） |
| `health` | 整数 | 按配方算 | 血量，默认由建材自动计算 |
| `requirements` | 数组 | `[]` | 建造所需物品，如 `[copper/20]` |
| `category` | 字符串 | `distribution` | 建造菜单里的分类 |
| `solid` | 布尔 | false | 是否阻挡单位与子弹 |
| `destructible` | 布尔 | false | 是否可被摧毁 |
| `hasItems` | 布尔 | false | 是否有物品槽 |
| `hasLiquids` | 布尔 | false | 是否有流体槽 |
| `hasPower` | 布尔 | false | 是否接入电网 |
| `itemCapacity` | 整数 | 10 | 物品槽容量 |
| `liquidCapacity` | 浮点 | -1 | 流体槽容量（-1 表示自动按消耗算） |
| `buildVisibility` | 字符串 | `hidden` | 是否出现在建造菜单（`shown`/`hidden`/`debugOnly`） |
| `rebuildable` | 布尔 | true | 被毁后能否重建 |
| `canOverdrive` | 布尔 | true | 能否被超速装置加速 |
| `configurable` | 布尔 | false | 玩家能否点击配置 |
| `drawArrow` | 布尔 | true | 是否画输入方向箭头 |
| `buildTime` | 浮点 | -1 | 建造时间（-1 表示按造价自动算） |

::: tip 两个自动化的温柔
- 只要写了 `requirements`，方块就会**自动变为可见可建造**（源码在 `ContentParser` 里把 `buildVisibility` 从 `hidden` 抬到 `shown`）。所以初学者常常只写 `requirements` 就够了。
- `health` 和 `buildTime` 不写也行，游戏会按 `requirements` 里的建材自动推算。
:::

---

## 消耗器：决定方块"吃什么"

v8 的消耗系统是一次大改。方块吃的东西——电、物品、流体——不再写成零散的 `consumePower`/`consumeItems` 字段，而是统一塞进一个 **`consumes` 对象**里（源码 `ContentParser.readBlockConsumers`）。

对照《饱和火力》的 `silicon-smelter.json`（它给原版硅炉加了电力消耗）：

```json
{
  "details": "兄弟，借个火？",
  "craftTime": 40,
  "consumes": {
    "power": 0.25
  }
}
```

`consumes` 对象里可用的键：

| 键 | 写法示例 | 含义 |
|---|---|---|
| `power` | `power: 0.25` | 每 tick 消耗的电力（浮点） |
| `items` | `items: [copper/2, lead/1]` | 消耗多种物品 |
| `item` | `item: coal` | 消耗单种物品（默认 1 个/次） |
| `liquids` | `liquids: [water/0.1]` | 消耗多种流体 |
| `liquid` | `liquid: water` | 消耗单种流体 |
| `coolant` | `coolant: { amount: 0.1 }` | 作为冷却液消耗（用于降温方块） |
| `itemsBoost` / `liquidsBoost` | 同 `items`/`liquids` | 消耗后给方块"增益"，而非必需 |
| `powerBuffered` | `powerBuffered: 100` | 消耗"缓冲电力"（蓄电型） |

::: warning v7 → v8 的坑
旧教程教的顶层字段 `consumePower`、`consumeItems`、`consumeLiquid` 在 v8 里**已经不存在了**（源码里只剩一个 `consPower` 内部字段）。如果你照搬旧写法，会收到 "Unknown field" 警告。**统一改用 `consumes: { ... }` 对象**。
:::

---

## 工厂：`GenericCrafter`

现在认识我们的主角——**通用工厂（GenericCrafter）**，源码 `world/blocks/production/GenericCrafter.java`。它做一件事：满足消耗条件后，每隔 `craftTime` 就产出一次东西。

它继承 `Block` 的所有通性，再追加下面这些字段：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `craftTime` | 浮点 | 80 | 单次生产耗时（tick，60 tick = 1 秒） |
| `outputItem` / `outputItems` | 栈/数组 | 无 | 产出的物品（单/多） |
| `outputLiquid` / `outputLiquids` | 栈/数组 | 无 | 产出的流体（单/多） |
| `liquidOutputDirections` | 整数数组 | `[-1]` | 流体出口方向，-1 表示任意 |
| `craftEffect` | 特效名 | 无 | 完成生产时播放的特效 |
| `updateEffect` | 特效名 | 无 | 生产过程中偶尔冒的特效 |
| `warmupSpeed` | 浮点 | 0.019 | 启动/停机过渡速度 |
| `drawer` | 绘制器 | `DrawDefault` | 控制外观，下一节讲 |

`GenericCrafter` 在构造器里已经帮你开好了 `solid`、`hasItems`、`update` 等开关（源码构造器），所以写工厂时这些都不用重复声明。

### 第一个完整工厂

把前面学的串起来，写一个"强化铜炉"：每 2 秒消耗 2 个铜和少量电，产出 1 个上一章做的强化铜。文件 `content/blocks/better-copper-furnace.json`：

```hjson
{
  type: GenericCrafter
  name: 强化铜炉
  description: 把普通铜升级成强化铜。
  size: 2
  health: 120
  requirements: [
    copper/60
    lead/30
  ]
  category: crafting
  research: copper-wall

  craftTime: 120
  consumes: {
    power: 0.5
    items: [
      copper/2
    ]
  }
  outputItems: [
    my-first-mod-copper/1
  ]
}
```

逐段解释：

- `type: GenericCrafter`：声明这是一个工厂方块。
- `name`/`description`：显示名和描述，同上一章，可直接写或放 `bundles/`。
- `size: 2`：占 2×2 格，所以需要更大的贴图。
- `requirements: [copper/60, lead/30]`：建造材料，用了 `item/amount` 缩写糖。
- `category: crafting`：放进"制造"分类，和原版工厂挤在一起。
- `research: copper-wall`：挂在铜墙科技节点下（上一章讲过）。
- `craftTime: 120`：2 秒生产一次。
- `consumes: { power: 0.5, items: [copper/2] }`：每次生产吃 2 铜 + 0.5 电力。
- `outputItems: [my-first-mod-copper/1]`：产出 1 个你自己的强化铜——注意这里写的是**完整内部名**（`my-first-mod-copper`），不是 `copper`。

---

## 绘制器：决定方块"长什么样"

最后一个问题：方块怎么画？答案在 `drawer` 字段上，它接受三种写法（源码 `ContentParser` 的 `DrawBlock` 解析）：

**写法一：字符串（直接点名一个绘制器）**

```hjson
drawer: DrawDefault
```

`DrawDefault` 是最朴素的绘制器：只画方块的**主贴图**（内部名对应的那张图）。绝大多数简单方块用它就够了，甚至不写 `drawer` 也默认是它。

**写法二：对象（指定类型 + 参数）**

```hjson
drawer: {
  type: DrawRegion
  suffix: -glow
  rotateSpeed: 2
}
```

`DrawRegion` 会**额外画一张后缀贴图**：内部名 + `suffix`，比如这里会找 `my-first-mod-better-copper-furnace-glow` 这张图。它支持旋转、偏移、变色等一堆参数，常用来给方块加一个转动的风扇或发光的炉心。

**写法三：数组（多绘制器叠加 = `DrawMulti`）**

```hjson
drawer: [
  DrawDefault
  { type: DrawRegion, suffix: -glow, color: "ffd37f" }
]
```

数组会合成一个 `DrawMulti`，把里面的绘制器**按顺序叠画**。这是给方块"叠图层"的标准手段——先画底座，再画会转的部件，再画发光的特效。

::: tip 贴图命名跟着绘制器走
- `DrawDefault` → 用内部名那张图（`my-first-mod-方块名.png`）；
- `DrawRegion` + `suffix: -glow` → 用内部名 + `-glow` 那张图；
- 所有贴图仍按上一章的规则，放进 `sprites/` 自动加模组名前缀。
:::

---

## 效果验证

这一章之后，我们的模组长这样：

```
my-first-mod/
├─ mod.json
├─ content/
│  ├─ items/copper.json
│  ├─ liquids/hot-water.json
│  └─ blocks/better-copper-furnace.json
├─ sprites/
│  ├─ copper.png
│  └─ better-copper-furnace.png
└─ bundles/
   └─ bundle_zh_CN.properties
```

打包启用后，你应该能在"制造"分类里看到强化铜炉，摆一个，接上电、喂上铜，亲眼看着它每两秒吐出一个强化铜。到这一步，你已经拥有了"定义原料 → 定义产物 → 定义外观"的完整能力。

---

## 小结

这一章我们造出了第一个工厂，并理清了方块的三个维度：**通性**（`Block` 基类的公共字段）、**消耗**（`consumes` 对象）、**外观**（`drawer` 绘制器）。记住一个关键变化：v8 的消耗统一走 `consumes: {}`，别再写旧的 `consumePower` 字段了。

**思考题**：如果想让强化铜炉"既不耗电、只耗铜"，并且外观是"底座 + 一个会转的黄色圆盘"，`consumes` 和 `drawer` 分别该怎么写？

下一章，我们走出加工厂，去看两类"向大地要资源"的方块——钻头与泵，以及点亮整个工业帝国的发电机。
