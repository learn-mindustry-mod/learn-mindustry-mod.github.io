# 生产方块、电力方块

> ***"先有矿，再有电；有了电，才有工业化。"***

工厂能把 A 变成 B，但 A 从哪来？这一章我们解决"源头"问题：用**钻头（Drill）**从地里挖矿，用**泵（Pump）**从地面抽流体，再用**发电机（Power Generator）**把它们烧成电。这三类方块共同构成了工业帝国的地基——没有它们，上一章的工厂只是个摆设。

学完这一章，你就能自给自足地搭出一条"挖矿 → 发电 → 加工"的完整生产线。

**本章涉及的源码**：`mindustry/world/blocks/production/Drill.java`、`Pump.java`、`mindustry/world/blocks/power/PowerGenerator.java`、`ConsumeGenerator.java`、`SolarGenerator.java`、`ThermalGenerator.java`。

---

## 钻头（Drill）：向大地索取

钻头（源码 `Drill.java`）做的事很简单：放在矿地上，每 `drillTime` 时间挖出一个矿物。它继承 `Block` 的通性，并追加：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `tier` | 整数 | 0 | 能挖的矿物**最大硬度等级**，对应物品的 `hardness` |
| `drillTime` | 浮点 | 300 | 挖一个矿的基准耗时（tick） |
| `size` | 整数 | 2 | 占地边长，同时决定能挖多大范围 |
| `liquidBoostIntensity` | 浮点 | 1.6 | 供液后的加速倍率 |
| `warmupSpeed` | 浮点 | 0.015 | 启动加速节奏 |
| `drawMineItem` | 布尔 | true | 是否在钻头里画出正在挖的物品 |
| `rotateSpeed` | 浮点 | 2 | 钻头旋转速度 |
| `hardnessDrillMultiplier` | 浮点 | 50 | 硬度对速度的影响系数 |

::: tip 硬度决定一切
物品有个 `hardness` 属性（第二章讲过）。钻头的 `tier` 必须 **≥** 矿物的 `hardness` 才能挖。想挖高级矿？先把 `tier` 调上去。
:::

### 一个钻头示例

```hjson
{
  type: Drill
  name: 强化钻头
  size: 2
  tier: 4
  drillTime: 240
  requirements: [
    copper/30
    lead/20
  ]
  research: mechanical-drill
  consumes: {
    power: 1.0
  }
}
```

- `tier: 4`：能挖硬度 4 及以下的矿。
- `consumes: { power: 1.0 }`：每 tick 耗 1 电。钻头**可以不耗电**（纯手动），但接上电会更高效。
- 想让钻头**用流体加速**？加一行 `consumes: { liquid: water/0.1 }`，速度会乘上 `liquidBoostIntensity`。

### 进阶：像《饱和火力》那样"改"原版方块

《饱和火力》的 `钻头/blast-drill.json` 只有几行：

```json
{
  "itemCapacity": 30,
  "drillEffect": "mineHuge",
  "drillTime": 45,
  "consumes": { "power": 4.5 },
  "requirements": [ "copper/120", "titanium/60", "silicon/80", "thorium/90" ]
}
```

它没有 `type` 字段。这就是 Mindustry 的**打补丁（patch）机制**：当你的内容文件名和某个原版内容**同名**、且不写 `type` 时，游戏不会新建方块，而是把你写的字段**覆盖到原版方块上**（源码 `ContentParser` 里 `locate` 命中原版就直接改它）。所以这份文件是在给原版"爆破钻头"提速、改配方。

::: warning 补丁的两个规则
- **文件名必须和原版内部名一致**（`blast-drill.json` ↔ 原版 `blast-drill`），且**不能写 `type`**，否则会被当成全新方块（并收到一条警告）。
- 补丁只能改字段，**不能改原版的 `type`**（类型一旦确定不可变）。
:::

---

## 泵（Pump）：抽取地表流体

泵（源码 `Pump.java`）和钻头是亲戚：钻头抽矿，泵抽水。它放在有流体的地面上（水、石油、熔渣……），把地表流体抽进管道。

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `pumpAmount` | 浮点 | 0.2 | 每格每 tick 的抽取量 |
| `size` | 整数 | — | 占地边长，抽取面积 = `size × size` |
| `consumeTime` | 浮点 | 300 | 消耗间隔（如果有消耗的话） |

```hjson
{
  type: Pump
  name: 大水泵
  size: 2
  pumpAmount: 0.35
  requirements: [
    copper/20
    lead/15
  ]
  research: mechanical-pump
}
```

泵**不需要**你指定抽什么流体——它自动抽脚下地面的 `liquidDrop`。所以它抽什么，取决于你把它放在哪片地上。

---

## 发电机：点亮工业帝国

发电机统一继承 `PowerGenerator`（源码 `power/PowerGenerator.java`），最核心的字段只有一个：

- `powerProduction`：**满效率时每 tick 的发电量**。游戏界面显示的是"每秒"，所以会乘 60（源码 `setStats` 里 `powerProduction * 60`）。

围绕"电从哪来"，有三种主流发电机，区别只在**能量来源**：

### 1. 消耗型发电机（ConsumeGenerator）

烧物品或流体来发电，对应原版的"燃烧发电机""蒸汽发电机"。它多一个字段 `itemDuration`：**一个物品能烧多久**（tick，默认 120）。

```hjson
{
  type: ConsumeGenerator
  name: 强化燃烧炉
  size: 2
  powerProduction: 5
  itemDuration: 150
  requirements: [
    copper/40
    lead/30
  ]
  research: combustion-generator
  consumes: {
    item: coal
  }
}
```

- `powerProduction: 5`：满负荷时每秒约 300 电（5 × 60）。
- `itemDuration: 150`：一块煤烧 2.5 秒，烧完自动吃下一块。
- `consumes: { item: coal }`：燃料是煤。

《饱和火力》的 `steam-generator.json` 更极端——它只写了一个 `powerProduction: 6`，把原版蒸汽发电机的功率直接抬到 6。

### 2. 太阳能发电机（SolarGenerator）

不烧任何东西，靠**环境光照**发电，白天满、夜晚空。写法最简单，只有 `powerProduction`：

```hjson
{
  type: SolarGenerator
  name: 大号太阳能板
  powerProduction: 1.5
  requirements: [
    silicon/30
  ]
  research: solar-panel
}
```

### 3. 热能发电机（ThermalGenerator）

靠**地面热量属性**发电（放在岩浆、热岩上），源码里多了个 `attribute` 字段（默认 `heat`）：

```hjson
{
  type: ThermalGenerator
  name: 强化地热
  powerProduction: 2.5
  attribute: heat
  outputLiquid: water/0.05
  requirements: [
    copper/50
    lead/40
  ]
  research: thermal-generator
}
```

`outputLiquid` 表示它在发电时顺带产出副产物（这里假装产出少量水）。真正的地热发电机放在热地块上，效率随地块热量浮动。

::: tip 三类发电机怎么选？
- **要稳定可控** → `ConsumeGenerator`（燃料给足就满发）；
- **要零成本** → `SolarGenerator`（但受昼夜限制）；
- **要利用地形** → `ThermalGenerator`（放在特殊地块上才有输出）。

它们共享同一个 `powerProduction` 字段，差别只在"能量从哪来"。
:::

---

## 效果验证

加上这一章的内容，模组已经能跑通一条小流水线了：

```
my-first-mod/
├─ mod.json
├─ content/
│  ├─ items/copper.json
│  ├─ liquids/hot-water.json
│  ├─ blocks/better-copper-furnace.json
│  ├─ blocks/better-drill.json
│  └─ blocks/better-burner.json
├─ sprites/
│  ├─ copper.png
│  ├─ better-copper-furnace.png
│  ├─ better-drill.png
│  └─ better-burner.png
└─ bundles/
   └─ bundle_zh_CN.properties
```

进游戏摆一圈：强化钻头挖铜 → 强化燃烧炉烧煤发电 → 强化铜炉耗电把铜升级成强化铜。到这一步，你已经能搭建一个自洽的、有输入有输出的小工业体系了。

---

## 小结

这一章我们补上了工业链条的上下游：钻头（`Drill`）和泵（`Pump`）负责"开采"，三类发电机（`ConsumeGenerator`/`SolarGenerator`/`ThermalGenerator`）负责"供能"。它们都建立在上一章的方块通性之上，新增字段各自寥寥几个，却决定了各自的玩法。顺带我们还摸到了**打补丁**这个高级技巧——用同名文件、不写 `type`，就能微调原版方块。

**思考题**：`ConsumeGenerator` 的 `itemDuration` 越大，意味着燃料烧得越慢还是越快？如果把它改成 60，发电节奏会发生什么变化？

下一章，我们进入战场——炮塔与它的弹药，看一个方块如何"反击"。

---

## 附：本章涉及的源码文件

- `mindustry/world/blocks/production/Drill.java`
- `mindustry/world/blocks/production/Pump.java`
- `mindustry/world/blocks/power/PowerGenerator.java`
- `mindustry/world/blocks/power/ConsumeGenerator.java`
- `mindustry/world/blocks/power/SolarGenerator.java`
- `mindustry/world/blocks/power/ThermalGenerator.java`
