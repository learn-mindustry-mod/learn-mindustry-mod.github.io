# 工厂（GenericCrafter）

在JSON模组中，最常见的生产方块就是`GenericCrafter`。它是“把输入变成输出”的基础模板：消耗物品/液体/电力，在经过`craftTime`后产出新的物品或液体。原版中的“硅冶炼厂”“相织布编织器”“相织布合成机”等都属于这个体系。

## 一个最小示例

先从一个最简单的把“煤”压成“石墨”的工厂开始：

```json content/blocks/tutorial-graphite-press.json
{
	"type": "GenericCrafter",
	"name": "示例石墨压制机",
	"description": "把煤压成石墨的演示工厂。",
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

`craftTime`的单位是刻（Tick），`60`就是1秒。`outputItem`表示每次完成一次制造时输出的物品数量。输入则写在`consumes`里。

## 常用字段速览

- `type`：固定写`GenericCrafter`；
- `requirements`：建造花费；
- `category`：建造分类，例如`crafting`、`production`；
- `size`/`health`：方块大小和生命值；
- `craftTime`：单次制造时间（单位为刻）；
- `consumes`：消耗器，常用子项为`items`、`liquids`、`power`；
- `outputItem`/`outputItems`：输出物品，二选一；
- `outputLiquid`/`outputLiquids`：输出流体，二选一；
- `liquidOutputDirections`：液体输出方向，和`outputLiquids`顺序对应，`-1`表示任意方向；
- `itemCapacity`/`liquidCapacity`：内部缓冲上限；
- `dumpExtraLiquid`/`ignoreLiquidFullness`：是否允许在液体输出接近满格时继续进度；
- `craftEffect`/`updateEffect`/`updateEffectChance`：合成与工作特效；
- `drawer`：绘制器，控制贴图叠层与动态效果。

## 多输出与配方组织

如果需要一次产出多种物品，使用`outputItems`：

```json
"outputItems": [
	{"item": "graphite", "amount": 1},
	{"item": "sand", "amount": 2}
]
```

注意：`outputItem`与`outputItems`是互斥的，两个都写时以`outputItems`为准。

## 关于输出流体

如果你的工厂要输出液体，可以写成这样：

```json
"outputLiquid": {"liquid": "water", "amount": 0.2}
```

`amount`表示每次合成周期的产出量，但它会随着进度持续产生，不是瞬间喷出。如果同时输出多种液体，使用`outputLiquids`数组，并用`liquidOutputDirections`指定方向。

```json
"outputLiquids": [
	{"liquid": "water", "amount": 0.15},
	{"liquid": "oil", "amount": 0.05}
],
"liquidOutputDirections": [0, 2]
```

方向按顺时针递增：0=右（东）、1=上（北）、2=左（西）、3=下（南）。实际方向会叠加方块自身旋转，可理解为`(方块旋转 + 方向值) % 4`，`-1`表示任意方向。

## 输入写法小贴士

- 物品输入可以写成字符串形式`"coal/2"`，也可以写成对象形式`{"item": "coal", "amount": 2}`；
- 液体输入更推荐对象形式，例如`{"liquid": "water", "amount": 0.1}`，因为字符串简写只能表达`water/0.1`，无法配置`booster`/`optional`等附加项；
- 只要在`consumes`里写了对应输入，`GenericCrafter`会自动按需消耗。

## 容量与停机逻辑

- 物品输出发生在`craft()`里：先`consume()`消耗，再对每个产出调用`offload()`尝试向邻接建筑卸载，失败才进入本机物品缓冲；
- 停机判断只看**本机物品缓冲**是否还能容纳下一次产出：当`items.get(输出物品) + 输出数量 > itemCapacity`时，`shouldConsume()`返回`false`，进度直接停住；
- 这与输入堆满无关；即使外部有空位，如果本机缓冲已满到放不下下一次产出，也会停机，直到被`dump()`或邻接建筑取走；
- 液体输出是“边生产边流出”：每帧按进度把`outputLiquid(s)`注入本机液体缓冲；
- 当`ignoreLiquidFullness = false`时，进度会按液体缓冲空间缩放：`dumpExtraLiquid = false`表示**任意一种液体满了就卡住**，`dumpExtraLiquid = true`表示**只要有一种液体还有空间就继续**；
- `ignoreLiquidFullness = true`时完全忽略液体满格，进度照常，但液体会被容量上限截断。

## 进度与速度

- `progress`按`getProgressIncrease(craftTime)`增长，本质是`efficiency * delta / craftTime`，效率越低越慢；
- `efficiency`由消耗器决定：电力不足或缺少输入会把效率降到0，从而停机；
- `progress`达到1触发一次`craft()`，并重置到0附近开始下一轮。


## 绘制与特效

- `craftEffect`：完成一次合成时触发；
- `updateEffect`与`updateEffectChance`：工作中按概率触发；
- `drawer`：绘制器决定贴图叠层，常见用法是换成`DrawMulti`或`DrawFlame`等，以获得更复杂的动画效果。

## 常见问题

- **为什么没有输出？**：检查输出口是否连接了运输线路/管道，缓冲满会停机。
- **为什么一直不动？**：检查`consumes`是否写对、输入是否满足、电力是否足够。
- **为什么液体喷不出来？**：确认`outputLiquids`与`liquidOutputDirections`数量一致，或用`-1`允许任意方向排放。
