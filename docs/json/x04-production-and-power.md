# 生产方块与电力方块

这一节把“资源从哪里来、能量怎么供”讲清楚。生产方块负责把地板资源或输入材料变成可用产出；电力方块负责发电、传输和存储。JSON 可以完整配置字段，但具体工作逻辑仍以 Java 实现为准，所以看到字段时要理解它们在运行时的含义。

## 钻头体系

`Drill` 是最常见的钻头类型，像“机械钻头”“气动钻头”“激光钻头”“爆破钻头”这一条线都属于它。钻头只会采集地板上的矿物（`Floor`/`OreBlock` 的 `itemDrop`），如果覆盖范围里有多种矿物，它会挑一个“主矿”进行开采：通常是硬度更高的那一种，并记下该矿在占地里的数量。这个数量会参与速度计算，因此 2x2、3x3 钻头在不同地形上会表现出不同的产速。

钻速的核心由 `drillTime`、`hardnessDrillMultiplier` 和 `drillMultipliers` 决定。`drillTime` 是“基础挖出一个物品需要的刻数”，`hardnessDrillMultiplier` 把矿物硬度叠加到耗时上，而 `drillMultipliers` 则是“按物品类型的速度倍率”（注意它是速度倍率，不是时间倍率）。它们一起决定了单个物品的基础耗时：

```
( drillTime + hardnessDrillMultiplier * 物品硬度 ) / drillMultipliers[item]
```

除此之外，`tier` 决定能挖到的最高硬度；`blockedItem`/`blockedItems` 可以直接禁止某些矿物；`itemCapacity` 决定内部缓冲容量，满了就会停机。动画相关的 `warmupSpeed`、`rotateSpeed`、`updateEffect`、`drillEffect` 主要影响表现，但也会让你在游戏里更容易判断钻头是否在工作。

如果你想让钻头吃液体加速，需要在 `consumes` 里写入液体消耗器，并把它标记为 `booster`，这样 `liquidBoostIntensity` 才会参与加速。没有 `booster` 的液体消耗只会当作输入，不会额外提速。

`BurstDrill` 是“爆发式钻头”，逻辑仍然是钻头，但它把输出集中到爆发节点上，因此会看到“蓄力→爆发”的节奏；在 Java 里它把 `hardnessDrillMultiplier` 设为 0，并使用独立的速度曲线，所以硬度不再影响速度。`BeamDrill` 负责挖墙体矿，核心字段是 `range`、`tier`、`drillTime` 以及 `optionalBoostIntensity`。`WallCrafter` 则是“凿墙机”，兼具钻头输出与属性加成，配置上更接近 `AttributeCrafter`。

为了帮助你理解硬度梯度，这里给出原版的粗略对照（仅用于理解关系，实际数值以原版为准）：

| 资源 | 钻头 | 矿机 | 硬度 |
|:---:|:---:|:---:|:---:|
|“沙”、“废料”、“石墨”|||0|
|“铜”、“铅”||“独影”、“阿尔法”、“贝塔”|1|
|“煤”|“机械钻头”|“恒星”、“幻型”、“伽马”|2|
|“钛”、“铍”|“气动钻头”、“等离子钻机”|“耀星”、“巨像”、“苏醒”、“策动”、“发散”|3|
|“钍”|“激光钻头”||4|
|“钨”|“爆破钻头”、“大型等离子钻机”||5|
| |“冲击钻头”||6|
| |“爆裂钻头”||7|

下面是一个最小的钻头示例。它使用 `Drill` 类型，设置 `tier` 与 `drillTime`，并通过 `consumes.liquid` 让“水”作为加速液体使用：

```json content/blocks/tutorial-drill.json
{
	"type": "Drill",
	"name": "示例钻头",
	"description": "慢速钻头，用于演示。",
	"size": 2,
	"tier": 2,
	"drillTime": 300,
	"liquidBoostIntensity": 1.6,
	"requirements": [
		"copper/50",
		"lead/30"
	],
	"consumes": {
		"liquid": {
			"liquid": "water",
			"amount": 0.05,
			"booster": true
		}
	}
}

```

这个例子中，`drillTime` 决定基础耗时，`tier` 决定可采硬度，`liquidBoostIntensity` 与 `booster` 组合决定加速效果。实际速度还会受到被采矿物硬度与 `drillMultipliers` 的影响。

钻头贴图方面，多数钻头需要三张贴图：`-rotator`、`-top`、本体。额外效果（如光环、物品显示）会要求 `-rim` 或 `-item`。贴图命名规则与 Java 教程一致。

## 泵与液体产出

泵类方块负责把液体“从地板抽进管网”。`Pump` 直接读取地板的 `liquidDrop`，适合放在“水”“矿渣”等液体地面上。`SolidPump` 则是在固态地板上“产出”指定液体，对应原版的“抽水机”。`Fracker` 对应原版“石油钻井”，本质上是 `SolidPump` 的子类，但增加了物品消耗与 `itemUseTime`，即“每消耗一次物品，可维持产出一段时间”。

泵的关键字段通常是 `pumpAmount`（每刻抽取量）、`result`（输出的液体类型）、`attribute` 与 `baseEfficiency`（属性加成与基础效率）。如果泵需要物品或电力，仍然通过 `consumes` 来配置。下面是一个固态泵示例：

```json content/blocks/tutorial-solid-pump.json
{
	"type": "SolidPump",
	"name": "示例抽水机",
	"description": "在固态地面产出水。",
	"size": 2,
	"result": "water",
	"pumpAmount": 0.12,
	"requirements": [
		"copper/60",
		"lead/40"
	],
	"consumes": {
		"power": 1.1
	}
}

```

在这个例子里，`pumpAmount` 是每刻的产液量，`result` 指向产出的液体，`consumes.power` 让它成为用电设备。若你想让地形属性影响效率，给 `attribute` 与 `baseEfficiency` 赋值即可。

## 电力系统

电力系统由发电、传输、存储三部分构成。发电方块大多继承自 `PowerGenerator`，核心字段是 `powerProduction`（基础发电量）；实际发电会乘以效率，效率会受到输入不足、环境属性不足等因素影响。`ConsumeGenerator` 是最常见的消耗型发电机，它用 `itemDuration` 表示“一个物品可以维持多少刻的发电”，再结合 `consumes` 里的物品或液体消耗器工作。像 `itemFlammable` 这类筛选消耗器会根据物品属性（可燃性、爆炸性、放电性等）自动计算效率，因此“燃料不同，发电效率不同”。

```json content/blocks/tutorial-generator.json
{
	"type": "ConsumeGenerator",
	"name": "示例火力发电机",
	"description": "消耗可燃物发电。",
	"size": 2,
	"powerProduction": 4.5,
	"itemDuration": 90,
	"requirements": [
		"copper/35",
		"lead/30"
	],
	"consumes": {
		"itemFlammable": {
			"amount": 1
		}
	}
}

```

这个发电机每消耗 1 个可燃物就能维持 `itemDuration` 刻的发电，`powerProduction` 是满效率时的发电量。若输入不足或燃料属性较差，效率会降低。

电网传输依赖 `PowerNode` 系列方块，`laserRange` 决定连接范围，`maxNodes` 决定最多能连多少个节点，`autolink` 控制是否自动连线。储能则由 `Battery` 系列方块承担，`powerCapacity` 决定存储上限。原版中常见的例子包括“电力节点”“大型电力节点”“电池”“大型电池”。
