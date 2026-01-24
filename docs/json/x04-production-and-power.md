# 生产方块与电力方块

这一节是“资源从哪里来、能量怎么供”的总览。生产方块负责把**地板资源**或**输入材料**变成可用产出；电力方块负责发电、传输和存储。

## 钻头类

钻头相关的常见类型有：

- `Drill`：普通钻头，代表有“机械钻头”到“冲击钻头”这一条线；
- `BurstDrill`：爆发式钻头，逻辑仍然走钻头，只是`hardnessDrillMultiplier`为0，意味着硬度不再影响钻速；
- `BeamDrill`：光束钻头，挖墙体矿；
- `WallCrafter`：凿墙机，既有钻头输出，也有属性加成。

### 关键字段

- `tier`：可采集的最大硬度；
- `drillTime`：基础钻速（挖出一个物品的基础帧数）；
- `hardnessDrillMultiplier`：硬度对时间的影响系数；
- `liquidBoostIntensity`：液体加速倍率（需要把液体消耗器设成`booster`）；
- `drillMultipliers`：不同物品的**速度倍率**（不是时间倍率）；
- `blockedItems`：禁采物品列表；
- `warmupSpeed`/`rotateSpeed`：动画表现相关。

钻头的实际单物品耗时计算为：

```
( drillTime + hardnessDrillMultiplier * 物品硬度 ) / drillMultipliers[item]
```

### 钻头硬度梯度（原版参考）

| 资源 | 钻头 | 矿机 | 硬度 |
|:---:|:---:|:---:|:---:|
|“沙”、“废料”、“石墨”|||0|
|“铜”、“铅”||“独影”、“阿尔法”、“贝塔”|1|
|“煤”|“机械钻头”|“恒星”、“幻型”、“伽马”|2|
|“钛”、“铍”|“气动钻头”、“等离子钻机”|“耀星”、“巨像”、“苏醒”、“策动”、“发散”|3|
|“钍”|“激光钻头”||4|
|“钨”|“爆破钻头”、“大型等离子钻机”||5|
||“冲击钻头”||6|
||“爆裂钻头”||7|

> 这张表只用于理解梯度关系；实际单位/钻头能力请以原版内容为准。

### 一个简单钻头示例

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

### 钻头贴图要点

多数钻头需要三张贴图：`-rotator`、`-top`、本体。额外效果（如光环、物品显示）会要求`-rim`或`-item`。贴图命名规则与Java教程一致。

## 光束钻头与凿墙机

- `BeamDrill`主要关心`range`、`tier`、`drillTime`和`optionalBoostIntensity`；
- `WallCrafter`兼有钻头与属性工厂特性，既有`output`也可设置`attribute`。

光束钻头贴图至少需要`-top`和`-glow`，其他光束贴图都有默认值。

## 泵类

泵负责把地板液体抽进管道系统，常见类型：

- `Pump`：抽取液体地板；
- `SolidPump`：在固态地板上“产出”液体（如“抽水机”）；
- `Fracker`：对应原版“石油钻井”，是`SolidPump`子类，增加了物品消耗与`itemUseTime`。

### 关键字段

- `pumpAmount`：单位刻的抽取量；
- `result`：`SolidPump`与`Fracker`输出的液体；
- `attribute`/`baseEfficiency`：属性加成与基础效率；
- `itemUseTime`：`Fracker`消耗一次物品的时间。

### 一个固态泵示例

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

## 电力方块概览

电力系统由**发电**、**传输**、**存储**三部分组成：

- 发电：`PowerGenerator`及其子类（如`SolarGenerator`、`ConsumeGenerator`、`ThermalGenerator`、`ImpactReactor`等）；
- 传输：`PowerNode`系列；
- 存储：`Battery`系列。

### 发电机的共同点

- `powerProduction`是基础发电量；
- 实际发电量会乘以效率（例如输入不足、环境属性不足都会降低效率）；
- 消耗型发电机使用`consumes`配置输入，`itemDuration`表示消耗一个物品所需时间。

### 一个消耗发电机示例

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

`itemFlammable`等筛选消耗器会按**物品属性**自动适配燃料（可燃性、放电性、爆炸性等），这类逻辑和Java教程一致，但在JSON里同样通过`consumes`声明。

### 电网基础件

- `PowerNode`/`PowerNodeLarge`：连接电网；
- `Battery`/`BatteryLarge`：储能；
- `powerCapacity`影响储能上限，`range`影响连接范围。

> 原版示例可参考“电力节点”“大型电力节点”“电池”“大型电池”。
