# 物品、流体、科技树、贴图和语言文件

> ***"万物始于铜。"***

上一章我们办好了一张空白的身份证，这一章开始往里填"户口"。我们要创建游戏世界里最基础的两类东西——**物品**和**流体**，并解决伴随它们的三个问题：怎么给它起名、怎么让它有图、怎么让玩家在科技树里把它研究出来。

学完这一章，你会有一个能自己造物品、造流体的模组，并且彻底搞懂"内部名"这条贯穿整个 Mindustry 模组开发的暗线。

**本章涉及的源码**：`mindustry/type/Item.java`、`mindustry/type/Liquid.java`、`mindustry/ctype/UnlockableContent.java`、`mindustry/mod/ContentParser.java`、`mindustry/mod/Mods.java`。

---

## 内部名：先把这条暗线讲透

在动手之前，有一件事必须想清楚，否则后面会处处踩坑：**游戏里每一个内容对象都有一个唯一的"内部名"（internal name）**。

规则极其简单，由源码 `ContentParser` 决定——当它解析 `content/items/` 下的文件时：

```
内容内部名 = 模组内部名 + "-" + 文件名（不含扩展名）
```

其中"模组内部名"就是 `mod.json` 里 `name` 转小写、空格换连字符的结果（上一章讲过）。举例：

- 你的 `mod.json` 写了 `"name": "my-first-mod"`；
- 你在 `content/items/copper.json` 里定义了一个物品；
- 那么它的内部名就是 `my-first-mod-copper`。

这个内部名会被用在三个地方，请牢牢记住：

1. **贴图**：`sprites/` 里放一张 `copper.png`，打包后它的贴图名自动变成 `my-first-mod-copper`，恰好和物品内部名对上，于是自动挂载。
2. **语言文件**：`bundles/` 里的键是 `item.my-first-mod-copper.name`。
3. **互相引用**：后面方块要消耗这个物品时，写 `my-first-mod-copper`，而不是 `copper`。

::: warning 注意
文件名就是内部名的一部分，所以**内容文件的文件名请只用小写英文字母和连字符**。像《饱和火力》那样给物品文件取中文名（`水桶.json`）虽然也能跑，但会让内部名变得奇怪，徒增麻烦。初学者别学这个。
:::

---

## 物品（Item）：工业的基石

物品是 Mindustry 里最单纯的内容之一，它只回答一个问题："这是什么东西，有什么属性。"对应源码类 `mindustry.type.Item`。

让我们参考《饱和火力》里的一个物品 `SFcontent/items/水桶.json`：

```json
{
  "name": "水桶",
  "color": "596ab8",
  "alwaysUnlocked": false,
  "radioactivity": 0,
  "explosiveness": 0,
  "flammability": 0,
  "research": "water"
}
```

照着它，我们在 `content/items/copper.json` 里写下自己的第一个物品：

```hjson
{
  // 显示名：直接写在这里，会被自动登记进语言文件
  name: 强化铜
  description: 一种看起来更贵的铜。
  color: "596ab8"
}
```

逐项解释：

- `name` 和 `description`：**显示名**与**描述**。注意，这两项可以**直接写在 JSON 里**——源码 `ContentParser.readBundle` 会把它们自动搬进语言系统，等价于在 `bundles/` 里写了对应条目。这是《饱和火力》的写法，图省事时很好用，但只支持一种语言（后面讲语言文件时我们再权衡）。
- `color`：物品颜色，用 **hex 字符串**表示，6 位是 `RRGGBB`（如 `596ab8`），8 位是 `RRGGBBAA` 带上透明度（如 `7CF389FF`）。**务必加引号**写成字符串，否则 Hjson 可能把它当数字解析（源码里有专门的警告）。

### 物品的完整属性

`Item` 类的字段（源码 `Item.java`）映射到 JSON 就是下面这些，我们按"用得最多 → 很少用"排序讲解：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `color` | hex 字符串 | 黑 | 物品颜色，管线、图标底色都用它 |
| `explosiveness` | 0~1 | 0 | 爆炸性，1 约等于核弹级别 |
| `flammability` | 0~1 | 0 | 可燃性，**大于 0.3** 才能进"物品燃烧发电机"当燃料 |
| `radioactivity` | 0~1 | 0 | 放射性 |
| `charge` | 0~1 | 0 | 导电性，用于"电荷"相关机制 |
| `hardness` | 整数 | 0 | 挖掘硬度，决定什么钻头挖得动 |
| `cost` | 浮点 | 1 | 基础造价，1 点 = 建造时多花 1 tick |
| `healthScaling` | 浮点 | 0 | 用此物做建材时，按比例加方块血量 |
| `lowPriority` | 布尔 | false | 设为 true 后，钻头会优先挖别的矿 |
| `buildable` | 布尔 | true | 是否属于建材；false 的会在某些核心里被烧掉 |
| `hidden` | 布尔 | false | 是否在大多数界面隐藏 |

::: tip 属性从哪看？
物品的属性在游戏里点开就有"爆炸性/可燃性/放射性/电荷"四条百分比（源码 `Item.setStats`）。`explosiveness`、`flammability`、`radioactivity`、`charge` 就是这四条。
:::

### 让物品动起来

`Item` 还支持**动画贴图**：当 `frames > 0` 时，物品图标会按帧循环。相关字段：

- `frames`：总帧数；
- `frameTime`：每帧间隔的 tick 数（默认 5）；
- `transitionFrames`：帧与帧之间自动生成的过渡帧数。

贴图命名规则随之变化：帧图依次叫 `<内部名>1.png`、`<内部名>2.png`……有过渡帧时中间帧叫 `<内部名>-t<序号>.png`。这块属于进阶内容，先了解有这回事即可。

---

## 流体（Liquid）：管道里的生命线

流体和物品是孪生兄弟，对应源码类 `mindustry.type.Liquid`。它多了一层"物理属性"——温度、粘稠度、比热容，这些决定它流得快不快、能不能灭火、会不会沸腾。

参考《饱和火力》的 `SFcontent/liquids/纳米流体.json`：

```json
{
  "name": "纳米流体",
  "alwaysUnlocked": false,
  "lightColor": "7CF38970",
  "color": "7CF389FF",
  "effect": "拆解",
  "temperature": 0.3,
  "heatCapacity": 1.45,
  "viscosity": 0.3,
  "research": "cryofluid"
}
```

我们写一个自己的 `content/liquids/hot-water.json`：

```hjson
{
  name: 热乎水
  description: 比普通水稍微热那么一点。
  color: "5a7ce0"
  temperature: 0.7
  heatCapacity: 0.4
  viscosity: 0.4
  research: water
}
```

流体的核心字段（源码 `Liquid.java`）：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `color` | hex | 黑 | 管道和地面上的颜色 |
| `gas` | 布尔 | false | 是否气体；气体不形成水坑、默认"永远沸腾" |
| `temperature` | 浮点 | 0.5 | 温度，**0.5 是室温**，0 极冷，1 熔融 |
| `heatCapacity` | 浮点 | 0.5 | 比热容，**0.4 约为水**，越低越不适合降温 |
| `viscosity` | 浮点 | 0.5 | 粘稠度，**0.5 约为水**，越大流得越慢 |
| `flammability` | 0~1 | 0 | 可燃性 |
| `explosiveness` | 0~1 | 0 | 受热爆炸倾向 |
| `effect` | 状态名 | 无 | 接触时施加的状态效果（本章不展开，后面有专章） |
| `coolant` | 布尔 | true | 能否当冷却液 |
| `blockReactive` | 布尔 | true | 是否参与方块反应（如熔渣遇水） |
| `boilPoint` | 浮点 | 2 | 沸腾温度阈值 |
| `hidden` | 布尔 | false | 是否在大多数界面隐藏 |

::: tip 直觉对比
`temperature`、`heatCapacity`、`viscosity` 三个值都以**水**为参照（0.5 / 0.4 / 0.5）。想做"更好的冷却液"，就把 `heatCapacity` 调高、`viscosity` 调低；想做"滚烫的岩浆"，就把 `temperature` 拉到接近 1。改之前先在脑子里想清楚你要的是"更像水"还是"更不像水"。
:::

---

## 贴图：赋予它形象

给物品/流体配图极其简单，因为内部名机制已经把路铺好了。

规则（源码 `Mods.packSprites`）：`sprites/` 文件夹里的每一张 PNG，打包后的贴图名 = `模组内部名-文件名`。所以：

- 你在 `sprites/` 放一张 `copper.png`；
- 打包后它叫 `my-first-mod-copper`；
- 而你的物品内部名恰好是 `my-first-mod-copper`；
- 游戏在 `UnlockableContent.loadIcon` 里按内部名去找这张图，**自动对上**。

也就是说：**给物品配图，只需把 PNG 命名为和内容文件同名**，放进 `sprites/` 即可。流体同理。

至于 `sprites-override/`，它是用来**覆盖原版贴图**的：里面的文件名必须和某个**已存在的原版贴图名**完全一致，游戏才会替换；对不上会收到一条"attempts to override a non-existent sprite"的警告。

---

## 语言文件：本地化与显示名

前面说 `name` 和 `description` 可以直接写在 JSON 里，那为什么还要 `bundles/`？

因为 JSON 里的 `name` 只有一种语言。想让模组同时有中文名和英文名，就要用语言文件。它是一堆 `key = value` 的纯文本，存放在 `bundles/` 下，文件名按语言后缀区分：

- `bundles/bundle.properties` —— 默认语言（英语兜底）；
- `bundles/bundle_zh_CN.properties` —— 简体中文。

键的格式（源码 `UnlockableContent` 构造器）：`<类型>.<内部名>.name` 与 `.description`。其中 `<类型>` 是内容类型的枚举名：物品是 `item`，流体是 `liquid`，方块是 `block`，单位是 `unit`……

例如给 `my-first-mod-copper` 写语言条目：

```properties
# bundle_zh_CN.properties
item.my-first-mod-copper.name = 强化铜
item.my-first-mod-copper.description = 一种看起来更贵的铜。
liquid.my-first-mod-hot-water.name = 热乎水
```

::: tip 两种写法怎么选？
- **只做中文、图省事**：把 `name`/`description` 直接写进内容 JSON（《饱和火力》就这么干）。
- **想正规、想多语言**：内容 JSON 里**不写** `name`/`description`，统一放进 `bundles/`。这样同一份内容，配两套语言文件就能切语言。

本教程后续章节的示例，为了演示"正规"做法，会优先用 `bundles/`。
:::

---

## 科技树（Tech Tree）：点亮科技之光

最后一个问题：玩家怎么"研究"出你的东西？

答案在内容的 `research` 字段上。它由 `ContentParser` 专门处理（源码 1337 行往后），有两种写法。

**写法一：字符串（挂到某个父节点下面）**

```hjson
{
  color: "596ab8"
  research: copper-wall
}
```

`copper-wall` 是原版铜墙的内部名。这行表示：我的物品会挂在"铜墙"科技节点的子节点下，研究完铜墙就能研究它。父节点既可以是**原版内部名**，也可以是**你自己的内容的内部名**（源码会自动在两种拼写里找）。

**写法二：对象（附带自定义条件）**

```hjson
{
  color: "596ab8"
  research: {
    parent: copper-wall
    requirements: [
      copper/100
    ]
  }
}
```

`parent` 同写法一；`requirements` 可以覆盖默认的研究花费（`copper/100` 就是上一章学的缩写糖）。更进阶的还有 `objectives`（研究目标）、`planet`（指定星球）、`root: true`（把本内容设为科技树的根节点）。

::: info 物品/流体的"默认目标"
源码给物品和流体自动加了一条 `Produce` 目标——也就是"必须先生产出它，才能研究它"。所以哪怕你只写了 `research: copper-wall`，玩家也得先实际产出一个才能继续研究。别觉得是 bug。
:::

---

## 效果验证

把这一章的成果整理进模组目录，现在的结构应该是：

```
my-first-mod/
├─ mod.json
├─ content/
│  ├─ items/copper.json
│  └─ liquids/hot-water.json
├─ sprites/
│  └─ copper.png
└─ bundles/
   └─ bundle_zh_CN.properties
```

打包启用后，进游戏到"物品"分类，应该能看到"强化铜"带着你的贴图和颜色；到科技树里，它乖乖躺在铜墙下面等着被研究。

---

## 小结

这一章我们创建了物品和流体，并把四件事串成了一条线：**内部名**（`模组名-文件名`）是枢纽，它一头连着 `sprites/` 里的贴图，一头连着 `bundles/` 里的语言键，还决定了科技树里怎么引用。抓住这条线，后面所有内容类型都是同一套套路。

**思考题**：如果你的模组内部名是 `my-first-mod`，文件叫 `copper.json`，那么它的贴图文件名应该叫什么？语言键应该是什么？

下一章，我们进入方块的世界——用 `GenericCrafter` 造出第一个能自动生产的工厂，并顺便揭开"方块通性"和"消耗器"这两张隐藏的网。
