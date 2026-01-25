# 工厂（GenericCrafter）

在 JSON 模组里，最常见的生产方块就是 `GenericCrafter`。它是“把输入变成输出”的基础模板：消耗物品、液体或电力，经过一段 `craftTime` 后产出物品或液体。原版的“石墨压缩机”“硅冶炼厂”“相织布编织器”“相织布合成机”都属于这一类，所以学会 `GenericCrafter`，基本就掌握了大部分生产链。

## 一个最小示例

先从一个最简单的把“煤炭”压成“石墨”的工厂开始：

```json content/blocks/tutorial-graphite-press.json
{
	"type": "GenericCrafter",
	"name": "示例石墨压制机",
	"description": "把煤炭压成石墨的演示工厂。",
	"size": 2,
	"health": 180,
	"category": "crafting",
	"requirements": [
		"copper/80",
		"lead/40"
	],
	"craftTime": 60,
	"consumes": {
		"items": [
			"coal/2"
		],
		"power": 1.2
	},
	"outputItem": {
		"item": "graphite",
		"amount": 1
	},
	"research": "graphite-press"
}
```

这里的 `craftTime` 单位是刻（tick），`60` 约等于 1 秒。`outputItem` 表示每完成一次制造输出多少物品，输入则写在 `consumes` 里。这个结构就是 `GenericCrafter` 的骨架，其他生产方块只是在这个骨架上添加了更多字段和效果。

## 运转逻辑：进度、效率与消耗

`GenericCrafter` 的核心逻辑是“进度条”。每帧都会按 `efficiency * delta / craftTime` 增加 `progress`，当进度达到 1 时触发一次 `craft()`。`efficiency` 来自消耗器：电力不足、输入缺失时 `efficiency` 会降到 0，进度也就停住。你在数值上看到的只是 `craftTime`，但真正决定产量的是 `craftTime` 和 `efficiency` 的乘积。

`consumes` 是特殊语法，它不只是字段，而是“运行时消耗器”。`items` 和 `liquids` 支持字符串或对象写法，`power` 表示持续耗电（单位仍以刻为基准，面板会按每秒显示）。如果你需要可选消耗或增益输入，就必须用对象形式，例如：

```json
"consumes": {
	"items": [{"item": "sand", "amount": 2}],
	"liquid": {"liquid": "water", "amount": 0.1, "optional": true, "booster": true},
	"power": 2.4
}
```

这种写法能表达“没水也能做，但有水就会被消耗”的可选输入，也能让面板把它显示为加速或辅助输入，避免字符串简写无法表达 `optional` 和 `booster` 的限制。

物品、液体与电力的消耗时机并不一样。`consumes.items` 是“结算式”消耗：进度条走满后才触发 `consume()`，一次性扣掉所需物品，所以输入物品往往会先堆在缓冲里。`consumes.liquid` 与 `consumes.power` 则是“流式”消耗，每帧按 `amount * delta` 扣除，供给不足会把 `efficiency` 拉到 0~1 之间，表现为“速度变慢”而不是直接停机。`optional` 只是把某个消耗从“必须”改成“可选”，它不会让 `GenericCrafter` 变快；如果想要“有水更快”的加速逻辑，需要换成自带加速的方块类型，或在 JS/Java 里自己把 `optionalEfficiency` 乘进进度。

## 输出与缓冲：物品与液体的差异

`outputItem` 和 `outputItems` 是互斥的。写了 `outputItem` 时，系统会在初始化阶段把它转成单元素的 `outputItems`，而 `outputItems` 本身会覆盖 `outputItem`。同理，`outputLiquid` 会被转成 `outputLiquids`，只要 `outputLiquids` 存在，工厂就会被视为“液体输出工厂”。

物品输出发生在 `craft()`：先 `consume()` 消耗输入，再对每个产物调用 `offload()` 尝试向邻接建筑卸载，失败后才进入本机物品缓冲。也就是说，是否停机只取决于“本机缓冲是否还能容纳下一轮产出”，而不是外部传送带是否有空位。

液体输出是“边生产边注入”。每帧根据进度，把 `outputLiquids` 注入本机液体缓冲。`ignoreLiquidFullness` 为 `false` 时，进度会受液体容量约束：`dumpExtraLiquid = false` 表示“任意一种液体满了就停”，`dumpExtraLiquid = true` 表示“只要有一种液体还有空间就继续”。`ignoreLiquidFullness = true` 则完全忽略满格限制，进度照常但液体会被容量上限截断。

这意味着：输出物品工厂更容易被“缓冲满”卡死，而输出液体工厂更容易被“管网满”拖慢。设计时要把 `itemCapacity` 和 `liquidCapacity` 当作稳定器，容量越大，越能平滑短时堵塞。

还有一点容易被忽略：物品产量与 `craftTime` 强绑定，而液体产量与 `craftTime` 没有直接关系。物品是“合成一次产出一次”，所以单位时间产量约等于 `outputItems.amount * 60 / craftTime`；液体是“每刻注入”，所以把 `craftTime` 调得更长并不会降低液体流量。想改液体产速，需要调 `outputLiquid` 的 `amount`，或让效率受输入限制。

物品输出还有一个节奏字段 `dumpTime`。`craft()` 结束时只会 `offload()` 一次，后续则由 `dumpOutputs()` 按 `dumpTime` 定时 `dump()`，默认值是 5（每 5 刻尝试一次）。高产量工厂如果出口少，就会出现“内部堆满、传送带上断断续续”的表现。这时可以适当降低 `dumpTime`，或增大 `itemCapacity` 给物流更多缓冲。

输入侧也需要考虑缓冲。`itemCapacity` 决定了工厂能够提前囤多少物品，它直接影响“断供多久才会停机”。如果你希望工厂在物流波动时仍能稳定运转，就应该把 `itemCapacity` 设为能覆盖至少一到两轮合成的物品量；反之，如果你希望它对输入更敏感，让玩家必须精确供给，就把容量压小。

多输入配方还要注意“最稀缺物品”的占比。如果某个物品供应断断续续，它会让其他物品在缓冲里越堆越多，最终反向堵住工厂，所以容量设置要考虑最慢输入的节奏。尤其是高消耗配方，输入波动会被放大，越晚期越明显。

## 方向与液体排放

当你同时输出多种液体时，需要用 `liquidOutputDirections` 指定排放方向。方向是相对方块旋转的：0 表示右（东），1 表示上（北），2 表示左（西），3 表示下（南），`-1` 表示任意方向。如果数组长度短于 `outputLiquids`，超出的部分默认按 `-1` 处理。方向写对了，建造预览里会显示对应液体图标，这能让玩家一眼看出管道该怎么接。

当你使用 `outputLiquids` 输出多种液体时，系统会把第一项写回 `outputLiquid`，主要用于逻辑传感器（如 `totalLiquids`）的读取，所以顺序也会影响传感器结果。`GenericCrafter` 还会根据输出自动打开 `hasItems`/`hasLiquids`，`consumes` 里的物品和电力也会自动启用 `acceptsItems` 与 `hasPower`，因此很多模组里写的 `hasItems`、`hasLiquids`、`outputsLiquid` 只是冗余提示，除非你要做特殊逻辑，否则可以省略。

## 简写与对象的选择

`outputItem`/`outputLiquid` 支持字符串简写，例如 `"graphite/2"`、`"cryofluid/0.3"`。简写很快，但当你需要更清晰的语义或要配合工具生成文档时，对象写法更稳。下面是“硝化反应器”的核心字段，它用字符串写法直接表达液体流量，同时在 `drawer` 里指定 `drawLiquid` 让液体颜色更醒目：

```json
{
	"type": "GenericCrafter",
	"name": "硝化反应器",
	"outputLiquid": "硝化重油/0.3",
	"craftTime": 60,
	"liquidCapacity": 30,
	"consumes": {
		"power": 5,
		"items": ["spore-pod/1"],
		"liquid": "oil/0.3"
	},
	"drawer": {
		"type": "DrawMulti",
		"drawers": [
			{"type": "DrawRegion", "suffix": "-bottom"},
			{"type": "DrawLiquidTile", "drawLiquid": "硝化重油"},
			"DrawDefault"
		]
	}
}
```

简写与对象写法在功能上等价，关键是保持一致。对于大型模组，建议在同一章节里尽量使用同一种风格，避免读者在不同写法之间频繁切换。

## 视觉与声音

`GenericCrafter` 的视觉表现由 `craftEffect`、`updateEffect`、`updateEffectChance` 和 `drawer` 共同决定。`craftEffect` 在每次合成完成时触发，`updateEffect` 则在运转时按概率触发。`updateEffectChance` 是“每帧概率”，值太大容易堆效果，值太小又看不出工作状态。

`drawer` 决定贴图叠层与动画形式，常见的组合是 `DrawMulti`，再叠加 `DrawFlame`、`DrawWeave`、`DrawLiquidTile` 等。`warmupSpeed` 只影响动画进度，不直接改变产量，但它会驱动 `DrawPart` 的 `warmup` 进度，因此会改变“看起来的节奏”。`ambientSound` 与 `ambientSoundVolume` 则负责“运转中的持续声”，适合让高能工厂有明显存在感。

动画相关的三个进度值也值得理解：`progress` 是 0~1 的合成进度，完成后会归零；`totalProgress` 会随 `warmup` 持续累积，适合驱动持续旋转或循环效果；`warmup` 是平滑后的运转热度，用来避免动画忽快忽慢。很多 `DrawBlock`（如 `DrawWeave`、`DrawSmelt`）默认使用这些值，所以你在自定义 `DrawPart` 时可以按“短周期用 `progress`、长周期用 `totalProgress`、节奏用 `warmup`”的思路选择驱动量。

## 产量与平衡的直觉

`GenericCrafter` 的平衡点通常由“每秒产量”和“每秒消耗”决定。假设效率为 1，那么每秒产量大约等于 `60 / craftTime * 输出数量`，每秒物品消耗也按同样比例计算。电力消耗是持续性的，所以 `consumes.power` 越大，电网压力越明显。如果你的工厂设计为“高爆发低持续”，可以把 `craftTime` 拉长、`outputItem.amount` 拉高；如果想要“稳定持续”，就缩短 `craftTime` 并减少单次产量。

除了产量本身，`requirements`、`category` 与 `research` 也决定了玩家实际感受到的强度。高输出工厂如果仍然放在 “crafting” 分类且造价便宜，会直接掐断原版进度；相反，把成本拉高、把 `research` 指向更晚的节点，就能让它成为真正的“科技升级”。`research` 既可以是字符串（引用父节点内部名），也可以是对象，附带额外的解锁条件，这对大型模组尤其重要。

## 模组示例：饱和火力 3.3.0 的“归中编织器”

“归中编织器”是一个典型的高阶物品工厂。它通过 `DrawMulti` 叠加 `DrawWeave`，同时把 `outputItem` 的产量拉高，让玩家感觉到“这是更快更强的相织布生产线”

```json
{
	"type": "GenericCrafter",
	"name": "归中编织器",
	"outputItem": {"item": "phase-fabric", "amount": 4},
	"craftTime": 60,
	"consumes": {
		"power": 8.75,
		"items": {"items": ["thorium/4", "sand/20", "裂位能/1"]}
	},
	"drawer": {
		"type": "DrawMulti",
		"drawers": ["DrawWeave", "DrawDefault"]
	}
}
```

这个片段展示了“高产量 + 高消耗 + 高视觉”的组合方式，适合用来做中后期升级版本。

## 模组示例：饱和火力 3.3.0 的“激活液化器”

“激活液化器”展示了 `outputLiquid` 与多输入的组合。它同时消耗物品与液体，并持续输出更高级的液体，同时用 `DrawLiquidTile` 与旋转贴图强化“液体工厂”的视觉特征：

```json
{
	"type": "GenericCrafter",
	"name": "激活液化器",
	"outputLiquid": "纳米流体/0.9",
	"craftTime": 120,
	"liquidCapacity": 120,
	"consumes": {
		"power": 24,
		"items": ["纳米核/9"],
		"liquid": "water/1.2"
	},
	"drawer": {
		"type": "DrawMulti",
		"drawers": ["DrawLiquidTile", "DrawDefault"]
	}
}
```

这类结构非常适合做“液体升级链”，同时也能很好地考验玩家的管道与电网布局。

## 模组示例：多物品输出的写法

“激发放射塔”使用了 `outputItems`，一次合成会同时产出两种物品。这类写法常用于“副产物”设计，让生产线既输出主产物，也输出少量附带资源：

```json
{
	"type": "GenericCrafter",
	"name": "激发放射塔",
	"outputItems": ["thorium/2", "裂位能/12"],
	"craftTime": 60
}
```

当你需要“输出两种物品但只算一次合成周期”时，`outputItems` 是最直接的工具。

## 模组示例：饱和火力 3.3.0 的“大型冷冻机”

“大型冷冻机”可以看作是原版“冷冻液混合器”的强化版本。它用 `outputLiquid` 的对象写法输出“冷冻液”，并把 `updateEffect` 设为 `freezing` 来强化冰冷感。由于液体是连续产出，它还把 `liquidCapacity` 拉高，保证短时间堵管不至于直接停机。下面是字段节选：

```json
{
	"type": "GenericCrafter",
	"name": "大型冷冻机",
	"outputLiquid": {"liquid": "cryofluid", "amount": 0.61},
	"craftTime": 60,
	"liquidCapacity": 60,
	"updateEffect": "freezing",
	"consumes": {
		"power": 4,
		"items": ["titanium/1"],
		"liquid": "water/0.61"
	},
	"drawer": {
		"type": "DrawMulti",
		"drawers": [
			{"type": "DrawRegion", "suffix": "-bottom"},
			{"type": "DrawLiquidTile", "drawLiquid": "cryofluid"},
			"DrawDefault"
		]
	}
}
```

这个例子强调了“流量式液体输出”的直觉：工厂不靠 `craftTime` 控制流量，而是直接通过 `outputLiquid.amount` 来调节产速。

## 模组示例：饱和火力 3.3.0 的“爆破冲压炉”

“爆破冲压炉”主打高产量与强反馈。它一次性产出大量“硅”，`craftTime` 很短，但 `consumes.power` 与物品消耗极高，同时用 `craftEffect` 叠加粒子与波纹，再配上 `ambientSound` 形成持续压迫感。下面只摘取和节奏相关的字段：

```json
{
	"type": "GenericCrafter",
	"name": "爆破冲压炉",
	"outputItem": {"item": "silicon", "amount": 10},
	"craftTime": 30,
	"consumes": {
		"power": 10,
		"items": ["blast-compound/1", "sand/10"]
	},
	"craftEffect": {
		"type": "MultiEffect",
		"effects": [
			{"type": "ParticleEffect", "particles": 8, "sizeFrom": 8, "sizeTo": 0, "length": 35, "lifetime": 35},
			{"type": "WaveEffect", "lifetime": 10, "sizeFrom": 0, "sizeTo": 45, "strokeFrom": 3, "strokeTo": 0}
		]
	},
	"ambientSound": "explosion",
	"ambientSoundVolume": 0.5
}
```

这个配置展示了“数值 + 反馈一起拉满”的思路：如果你的工厂定位是“高强度、高风险”，就要用视觉和音效把它的强度表现出来。

## 模组示例：饱和火力 3.3.0 的“纳米打印机”

“纳米打印机”展示了 `outputItem` 的字符串简写和 `research` 的对象写法。它把产物直接写成 `"纳米核/1"`，并在 `research` 里附加解锁条件，用来限制玩家必须完成某些战役内容后才可建造。对于大型模组来说，这种做法比单纯挂在某个父节点更精细。

```json
{
	"type": "GenericCrafter",
	"name": "纳米打印机",
	"outputItem": "纳米核/1",
	"craftTime": 20,
	"consumes": {
		"power": 15,
		"items": ["titanium/1", "silicon/1"]
	},
	"research": {
		"parent": "纳米组装机",
		"objectives": [
			{"type": "SectorComplete", "preset": "火山岛"}
		]
	}
}
```

## 常见问题的理解方式

如果工厂没有输出，优先检查“输出口是否通畅 + 本机缓冲是否已满”。如果一直不动，通常是 `consumes` 写错、输入不足或电力不够。如果液体排不出去，除了管道问题，还要检查 `outputLiquids` 和 `liquidOutputDirections` 的数量是否匹配，以及是否把方向写成了绝对方向而不是相对方向。理解这些机制后，排错就会变得很快。

如果工厂能动但速度忽快忽慢，先看 `consumes.liquid` 和 `consumes.power`。它们是按帧扣除的，液体或电力不足会把 `efficiency` 压低，所以看起来像“产线抖动”。另一个容易误判的点是 `dumpTime`：即便已经完成合成，物品也可能因为 `dumpTime` 的节奏而间歇式输出，这种“断续”并不一定是停机。
