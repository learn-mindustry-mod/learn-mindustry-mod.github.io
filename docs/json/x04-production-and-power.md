# 生产方块与电力方块

这一节把“资源从哪里来、能量怎么供”讲清楚。生产方块负责把地板资源或输入材料变成可用产出；电力方块负责发电、传输和存储。JSON 可以完整配置字段，但具体工作逻辑仍以 Java 实现为准，所以看到字段时要理解它们在运行时的含义。

## 钻头与开采逻辑

`Drill` 是最常见的钻头类型，像“机械钻头”“气动钻头”“激光钻头”“爆破钻头”这一条线都属于它。钻头的核心逻辑是“确定主矿 → 累积进度 → 产出并尝试卸载”。当钻头覆盖多个矿物时，它会统计占地范围内每种矿物的数量，选出“主矿”，并把该矿的数量记为 `dominantItems`。这个数量会被乘入速度计算，所以 2x2、3x3 钻头在不同地形上实际产速会不同。

钻速由 `drillTime`、`hardnessDrillMultiplier` 和 `drillMultipliers` 决定。`drillTime` 是“基础挖出一个物品所需的刻数”，`hardnessDrillMultiplier` 把矿物硬度叠加到耗时上，`drillMultipliers` 则是“按物品类型的速度倍率”。它们一起决定单个物品的基础耗时：

```
( drillTime + hardnessDrillMultiplier * 物品硬度 ) / drillMultipliers[item]
```

`tier` 决定最大可采硬度，`blockedItem`/`blockedItems` 可以禁采指定物品。如果主矿硬度超过 `tier` 或在禁采列表里，`dominantItem` 会为空，钻头就不会工作。`itemCapacity` 决定内部缓冲容量，`items.total()` 满了就会停机，即使外部传送带仍有空间也不会继续挖。钻头会定期尝试 `dump()` 把主矿卸到相邻建筑或传送带上，所以传送带堵住时你会看到钻头“停在满格”。

液体加速由 `liquidBoostIntensity` 与消耗器上的 `booster` 配合决定。如果你在 `consumes` 里写了液体消耗器并标记为 `booster`，钻头会按 `optionalEfficiency` 把速度从 1 线性插值到 `liquidBoostIntensity`。若再配合 `optional: true`，就能做到“没有液体也能挖，但更慢”的效果。这个机制非常适合做“可选加速”而不是“必须液体”。

`BurstDrill` 是“爆发式钻头”，它依然继承 `Drill`，但把 `hardnessDrillMultiplier` 设为 0 并使用独立的速度曲线，所以硬度不再影响速度，进度会呈现“蓄力→爆发”的节奏。`BeamDrill` 用于挖墙体矿，例如“等离子钻机”“大型等离子钻机”就是这一类；其关键字段是 `range`、`tier`、`drillTime` 与 `optionalBoostIntensity`。`WallCrafter` 则是“凿墙机”，兼具钻头输出与属性加成，适合做“固定产出”的墙体采集方块。

为了帮助你理解硬度梯度，这里给出原版的粗略对照（仅用于理解关系，实际数值以原版为准）：

| 资源 | 钻头 | 矿机 | 硬度 |
|:---:|:---:|:---:|:---:|
|“沙”、“废料”、“石墨”|||0|
|“铜”、“铅”||“独影”、“阿尔法”、“贝塔”|1|
|“煤炭”|“机械钻头”|“恒星”、“幻型”、“伽马”|2|
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

钻头贴图方面，多数钻头需要三张贴图：`-rotator`、`-top`、本体。额外效果（如光环、物品显示）会要求 `-rim` 或 `-item`。贴图命名规则与 Java 教程一致，建议先复刻原版的贴图结构再做改动。

钻头还有一组更偏“表现”的字段。`drillEffect` 会在产出物品时触发，`updateEffect`/`updateEffectChance` 控制运转时的粒子与频率，`rotateSpeed` 与 `warmupSpeed` 只影响动画速率，不直接改变真实产量。这些字段的意义是“让玩家感受到强度差异”，尤其是高阶钻头，哪怕数值已经很快了，如果缺少足够的视觉节奏，也会显得“像普通钻头”。

## 模组示例：饱和火力 3.3.0 的钻头

“饱和火力 3.3.0”里的“离子钻头”是一个很典型的“高阶钻头”示例。它把 `hardnessDrillMultiplier` 拉低、`drillTime` 拉短，同时用 `consumes.liquid` 配置了可选加速液体。你可以看到它把液体消耗写成对象，并开启了 `optional` 与 `booster`，这意味着没水也能挖，有水更快：

```json
{
	"type": "Drill",
	"name": "离子钻头",
	"size": 3,
	"tier": 8,
	"drillTime": 50,
	"hardnessDrillMultiplier": 40,
	"liquidBoostIntensity": 1.6,
	"consumes": {
		"power": 3,
		"liquid": {
			"liquid": "water",
			"amount": 0.11,
			"booster": true,
			"optional": true
		}
	}
}
```

这个片段能很好地说明“可选加速”的写法。如果你希望玩家在早期也能用钻头，但在中后期通过管网提升效率，这种配置非常合适。

## 泵与液体产出

泵类方块负责把液体“从地板抽进管网”。`Pump` 直接读取地板的 `liquidDrop`，适合放在“水”“矿渣”等液体地面上。`SolidPump` 则是在固态地板上“产出”指定液体，对应原版的“抽水机”。`Fracker` 对应原版“石油钻井”，本质上是 `SolidPump` 的子类，但增加了物品消耗与 `itemUseTime`，即“每消耗一次物品，可维持产出一段时间”。

泵的关键字段通常是 `pumpAmount`（每刻抽取量）、`result`（输出的液体类型）、`attribute` 与 `baseEfficiency`（属性加成与基础效率）。如果泵需要物品或电力，仍然通过 `consumes` 来配置。地板本身也会影响泵的产出，例如液体地板的 `liquidMultiplier` 会影响抽取量，深水地面通常比浅水更高效。

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

这个例子里，`pumpAmount` 是每刻产液量，`result` 指向产出的液体，`consumes.power` 让它成为用电设备。若你想让地形属性影响效率，给 `attribute` 与 `baseEfficiency` 赋值即可。

## 模组示例：饱和火力 3.3.0 的泵

“潮汐泵”是一个典型的高吞吐液体泵。它把 `pumpAmount` 设得很高，并给了极大的 `liquidCapacity`，适合做“集中供液”节点。它还使用了自定义 `DrawMulti` 绘制器来叠加液体与本体，体现了“产量大但体积也大”的定位。

```json
{
	"type": "Pump",
	"name": "潮汐泵",
	"size": 4,
	"liquidCapacity": 800,
	"pumpAmount": 1,
	"consumes": {
		"power": 12
	}
}
```

这个片段的关键是 `liquidCapacity` 与 `pumpAmount` 的组合。前者决定缓冲，后者决定流量，若你只提升流量却不提升容量，泵会更容易“满溢停机”。

高吞吐泵还有一个常见误区：`pumpAmount` 增长得太快，而 `liquidCapacity` 和管网带宽跟不上，会导致“满了就停、停了就满”的节奏抖动，实际平均流量反而不高。设计时最好把“泵本体容量”和“管道最大流量”一并考虑，避免玩家在布局上被迫堆很多缓冲罐来补救。

## 模组示例：饱和火力 3.3.0 的石油深井

“石油深井”使用 `SolidPump` 并明确指定了 `attribute` 和 `baseEfficiency`，用来强调“地形属性决定效率”的机制。它在含油属性的地形上更高效，而在普通地面上仍能维持一定产出：

```json
{
	"type": "SolidPump",
	"name": "石油深井",
	"pumpAmount": 0.201,
	"result": "oil",
	"attribute": "oil",
	"baseEfficiency": 0.75,
	"consumes": {
		"power": 6.5
	}
}
```

这个配置能直观体现“选址”的价值：地形好坏并不会决定能不能用，而是决定“值不值得用”。这也是生产方块平衡里最常见的设计思路之一。

## 属性系统与效率

属性（`Attribute`）是生产方块的重要基础机制。它用于描述地形对生产效率的影响，例如“热能”属性影响“热能发电机”，水属性影响某些生产方块。`AttributeCrafter`、`SolidPump`、`ThermalGenerator` 等方块都会读取 `attribute` 与 `baseEfficiency` 来计算最终效率。若 `baseEfficiency` 为 0，方块几乎完全依赖属性；若 `baseEfficiency` 较高，则地形只起到加成作用。这个机制常用于做“特定地形更高效”的方块，也用于提醒玩家选址。

## 电力系统与发电逻辑

电力系统由发电、传输、存储三部分构成。发电方块大多继承自 `PowerGenerator`，核心字段是 `powerProduction`。实际发电量会乘以 `productionEfficiency`，而效率会受到输入不足、环境属性不足等因素影响。`ConsumeGenerator` 是最常见的消耗型发电机，它用 `itemDuration` 表示“一个物品能维持多少刻的发电”。因此 `itemDuration` 越大，单个燃料持续时间越长，发电越稳定。

`itemFlammable`、`itemExplosive`、`itemRadioactive` 等筛选消耗器会根据物品属性自动评估效率。例如“火力发电机”会偏好高可燃性物品，“RTG 发电机”则看重放射性。`itemDurationMultipliers` 可以对某些物品做额外倍率调整，适合做“特殊燃料”。`ConsumeGenerator` 还支持 `outputLiquid` 与 `explodeOnFull`，可以在发电的同时产出液体，或者在液体堆满时爆炸（比如用来模拟高压风险）。

如果你希望发电机“有副产物”，`outputLiquid` 是最直接的做法。它会把液体写进发电机的内部储罐，并像普通液体方块一样尝试向外输出。当外部管网堵塞，发电机会因为液体满而降效甚至停机，这点和生产方块的“物品缓冲”非常相似。设计时要么加大 `liquidCapacity` 来缓冲，要么把 `outputLiquid` 设得较小，以免发电机在战斗或波次高峰时因为管网挤压而掉电。

“热能发电机”属于 `ThermalGenerator`，它会读取地板属性（默认是热量）并计算 `productionEfficiency`。`minEfficiency` 控制最低可放置要求，`displayEfficiency` 与 `displayEfficiencyScale` 决定建造时显示的效率文本。类似的还有“太阳能板”（`SolarGenerator`），它的输出会受到光照强度影响。

电网传输依赖 `PowerNode` 系列方块，`laserRange` 决定连接范围，`maxNodes` 决定最多能连多少个节点，`autolink` 控制是否自动连线。存储则由 `Battery` 系列方块承担，`powerCapacity` 决定储能上限。原版中常见的例子包括“电力节点”“大型电力节点”“电池”“大型电池”。如果你发现发电充足但设备仍提示缺电，多半是电网断开或储能不足导致的能量“波动”。

## 模组示例：饱和火力 3.3.0 的发电机

“增压励磁发电站”使用了 `ConsumeGenerator` 并同时消耗可燃物与液体。它把 `itemDuration` 设得很短，强调高频消耗、高峰值输出，并通过 `DrawMulti` 叠加多个旋转贴图来表现高速运转。下面是其核心字段节选：

```json
{
	"type": "ConsumeGenerator",
	"name": "增压励磁发电站",
	"size": 3,
	"itemDuration": 15,
	"powerProduction": 38.5,
	"consumes": {
		"itemFlammable": {},
		"itemExplode": {},
		"liquid": "water/0.6"
	}
}
```

这个例子展示了“多种筛选消耗器 + 液体输入”的组合。对于想做“高风险高收益”发电机的设计者来说，它提供了一个很好的参考模板。

## 模组示例：饱和火力 3.3.0 的弧形裂变堆

“弧形裂变堆”展示了“高能燃料 + 高级液体”的组合思路。它使用 `itemRadioactive` 与 `itemExplode` 来筛选燃料，再用液体维持稳定输出，同时在 `drawer` 里用多层 `DrawArcSmelt` 叠加出高能反应的视觉效果：

```json
{
	"type": "ConsumeGenerator",
	"name": "弧形裂变堆",
	"itemDuration": 19.5,
	"powerProduction": 550,
	"consumes": {
		"itemRadioactive": {},
		"itemExplode": {},
		"liquid": "纳米流体/0.9"
	},
	"generateEffect": "generatespark"
}
```

它的意义不是“又一个发电机”，而是提供“高风险燃料 + 高级液体”的经济消耗路线。如果你的模组有稀缺液体或高阶燃料，类似设计能让这些资源有明确的战略价值。

## 产量、节奏与平衡的直觉

设计生产方块时，最容易忽略的是“节奏感”。`drillTime`、`itemDuration`、`craftTime` 等字段不仅决定效率，还决定玩家对这条生产线的体感节奏。比如“爆破钻头”和“冲击钻头”就属于明显“慢—快—慢”的节奏，这会迫使玩家建立更大的缓冲与运输。相反，像“机械钻头”这种稳定输出更适合做“基础供给”。当你为模组设计新钻头时，不妨先想清楚它要服务哪一类生产链，再决定输出节奏。

电力也有类似的节奏。`powerProduction` 的单位是“每刻发电量”，游戏面板会按每秒显示，因此一个 `powerProduction = 1` 的发电机，在面板上会看到 60 的发电速率。发电机与耗电设备之间的“峰值错位”往往来自储能不足，而不是发电不足。如果你的系统在启动时经常掉电，可能需要的是更多“电池”而不是更多发电机。

消耗型发电机的平衡点在于“燃料密度”。`itemDuration` 越长，单个物品的发电时间越久，但这也会让玩家更依赖高价值燃料；`itemDuration` 越短，发电更“灵敏”，但运输压力更大。你可以通过 `itemDurationMultipliers` 做“特殊燃料”，让某些物品成为“高能燃料”，同时保持普通燃料的基础效率，这样既能控制经济，又能让玩家有明确的升级目标。

属性型方块的平衡点在于“选址与收益”。如果 `baseEfficiency` 设得太高，属性加成就毫无意义，玩家也不会在意地形；如果设得太低，方块在非特定地形几乎无法使用，玩法会被强行限制。原版的“热能发电机”与“抽水机”就是典型案例，它们既鼓励选址，又不会完全“锁死”。

如果你在设计“高阶产物的生产链”，还可以把生产与发电绑定：例如某个工厂需要大量电力，但它的副产物恰好是发电燃料；或者某个发电机产生的液体正是下一步生产的冷却液。这样的闭环能让玩家觉得“体系在运转”，比单纯堆数值更有成就感。

## 小结

生产链的稳定性来自三个因素：资源地形、输入补给与输出畅通。钻头与泵决定“资源是否稳定产出”，工厂决定“资源如何转化”，发电与传输决定“系统是否有能量”。理解这些字段在运行时的角色后，JSON 配置就不仅是“写参数”，而是“设计生产线”。
