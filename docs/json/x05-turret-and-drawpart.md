# 炮塔与 DrawPart

炮塔是 Mindustry 战斗系统的核心。无论是吃物品弹药的炮塔，还是用液体或电力驱动的炮塔，本质上都遵循同一套流程：搜敌、对准、装填、开火。你在 JSON 里配置的字段，最终会影响这条流程的每个环节。原版里“冰雹”“蓝瑟”“齐射”“海啸”“熔毁”等属于不同类型的炮塔，但它们的底层字段组织方式高度一致。

## 炮塔的基础流程

炮塔会在 `range` 指定的范围内寻找目标，是否能锁定空中、地面或建筑由 `targetAir`、`targetGround`、`targetBlocks` 决定。`trackingRange` 可以让炮塔更早锁定目标但不立即开火，适合做“预热型”武器。装填节奏由 `reload` 决定（单位是刻），数值越小，射速越高。`shootCone` 是“允许开火的角度偏差”，偏差越大越容易开火但命中率可能更差。`inaccuracy` 与 `velocityRnd` 则用于制造散射，前者是角度误差，后者是速度波动。

对远程或曲射炮塔来说，`minRange` 很关键。它规定了“最小射程”，用于迫击炮或超远程炮塔，避免近距离自伤或误击，同时还能让 AI 产生更合理的站位。配合 `drawMinRange`，你可以在建造预览中显示内圈范围，减少玩家的“误布置”。子弹里也有 `minRangeChange`，它会在 UI 上修正最小射程，适合做“不同弹药不同安全距离”的设计。

`predictTarget` 默认开启，炮塔会根据目标速度提前量射击。如果你给炮塔加了 `shoot.firstShotDelay` 或充能延迟，建议配合 `accurateDelay`，否则炮塔可能会用“当前的位置”去预测“未来的目标”，导致明显的落空。还有一组和充能相关的开关：`moveWhileCharging` 与 `reloadWhileCharging` 控制炮塔在充能时是否允许移动或继续装填，这些细节会直接影响“有蓄力的武器”在实战中的节奏。

射击点位也会影响表现。`shootX`/`shootY` 决定子弹从炮塔贴图的哪个位置出射，`xRand` 会给射击点带来水平随机偏移，配合 `inaccuracy` 能做出“散射武器”。声音方面，`shootSoundVolume` 与 `soundPitchMin/Max` 可以微调射击质感，让高射速武器听起来不至于刺耳。对于多管炮塔，合理设置 `ammoEjectBack` 可以让弹壳喷出位置更合理，减少“弹壳从炮口飞出”的违和感。

目标选择也有细节。`targetBlocks` 控制是否攻击建筑，`targetUnderBlocks` 用来避免把传送带、桥等“下层建筑”当作主要目标；`targetHealing` 会把友方建筑视为修复目标，适合修复类炮塔。更复杂的筛选（如 `unitFilter`、`buildingFilter`）是函数类型，JSON 无法直接写，只能在 JS/Java 里实现。

热量与视觉反馈由 `recoil`、`recoilTime`、`cooldownTime`、`shake` 等字段决定，它们不会直接改变伤害，但会影响“射击手感”。声音相关字段包括 `shootSound`、`chargeSound`、`loopSound`，其中 `chargeSound` 常用于“有首次延迟的武器”，`loopSound` 适合持续开火类炮塔。

## 弹药体系：物品、液体与电力

`ItemTurret` 通过 `ammoTypes` 把物品映射到子弹类型。键是物品内部名，值是子弹对象。每个子弹都带有 `ammoMultiplier`，它决定“消耗一个物品能转化成多少弹药单位”。`maxAmmo` 是弹药容量上限，`ammoPerShot` 是单次射击消耗，`consumeAmmoOnce` 则控制“一次射击是否只消耗一次弹药”（常用于散射型武器）。这些字段组合起来，能精确控制弹药经济。

`LiquidTurret` 的逻辑与 `ItemTurret` 相似，只是弹药来源变成液体。容量字段是 `liquidCapacity`，它决定液体缓冲上限。液体弹药的消耗以“当前液体”计算，并按子弹的 `ammoMultiplier` 换算：如果 `ammoMultiplier = 2`，每次射击只消耗 `1/2` 单位液体。`extinguish` 决定是否优先灭火，这也是液体炮塔经常“打火不打人”的原因。

`PowerTurret` 不需要弹药，直接通过 `shootType` 指定固定子弹。耗电写在 `consumes.power` 或 `consumes.powerBuffered` 中，前者表示持续耗电，后者表示从电力缓冲中抽取。若你想让炮塔有明显“充能感”，可以用 `shoot.firstShotDelay` 配合 `chargeSound` 与子弹的 `chargeEffect`。

弹药相关的视觉反馈也可以调。`ammoUseEffect` 控制“消耗弹药时”的特效，`ammoEjectBack` 会影响弹壳喷出的位置；如果你做的是“重炮”或“炮塔机枪”，这类细节能让手感更有区分度。`displayAmmoMultiplier` 决定数据库面板是否显示弹药倍率，对新手向模组来说很重要，能避免玩家误解“同一炮塔为什么弹药效率差这么多”。

下面是一个最小的物品炮塔示例：

```json content/blocks/tutorial-turret.json
{
	"type": "ItemTurret",
	"name": "示例炮塔",
	"description": "使用铜和石墨作为弹药。",
	"size": 2,
	"range": 120,
	"reload": 30,
	"rotateSpeed": 8,
	"requirements": [
		"copper/90",
		"lead/60"
	],
	"ammoTypes": {
		"copper": {
			"type": "BasicBulletType",
			"speed": 2.5,
			"damage": 10,
			"lifetime": 60
		},
		"graphite": {
			"type": "BasicBulletType",
			"speed": 3.2,
			"damage": 20,
			"lifetime": 55,
			"ammoMultiplier": 4
		}
	}
}

```

这个例子里，“铜”使用默认 `ammoMultiplier`，而“石墨”设置为 4，意味着同样的物品数量能提供更多弹药单位。`range` 与子弹的 `speed * lifetime` 共同决定最终射程，如果子弹寿命太短，即使 `range` 很大也打不到那么远。

## 子弹类型的关键字段

`BulletType` 决定了“这一发子弹如何表现”。`speed` 与 `lifetime` 决定飞行距离，`damage` 是基础伤害，`splashDamage` 与 `splashDamageRadius` 用于范围伤害。`pierce` 与 `pierceCap` 控制穿透，`knockback` 影响击退。`status` 与 `statusDuration` 用于附加状态效果（如“燃烧”“电击”），需要与你在状态章节里定义的状态名对应。

如果需要导弹、激光或持续伤害，可以把 `type` 改成 `MissileBulletType`、`LaserBulletType`、`ContinuousLaserBulletType` 等子类。导弹常用 `homingPower` 与 `weaveMag`，激光则常用 `length`、`width`、`colors`，持续激光还会使用 `chargeEffect` 与 `smokeEffect` 来塑造表现。配置时建议先从原版炮塔中抄一个相近的子弹，再逐步调整参数。

子弹还有一些“影响炮塔数值”的字段，例如 `rangeChange` 会在统计面板中改变炮塔的显示射程，`ammoMultiplier` 会改变弹药效率。这些字段不仅影响战斗表现，也会影响玩家对炮塔的理解，所以需要和炮塔的定位保持一致。

## 开火节奏与射击模式

除了基础的 `reload`，炮塔的开火节奏还受 `shoot` 子对象影响。`shoot` 本质上是 `ShootPattern`，它决定“一次射击”到底发射几发、间隔多久、散布多宽。最常用的字段是 `shots`（单次射击的发数）、`shotDelay`（连发之间的间隔）、`firstShotDelay`（首发延迟）与 `spread`（散射角度）。你可以用它来做“短促爆发”或“延迟蓄力”型炮塔，而不用修改子弹本身。

另一组容易被忽略的节奏字段是 `shootWarmupSpeed`、`minWarmup`、`warmupMaintainTime` 与 `linearWarmup`。它们控制“预热条”的上升速度、最低开火阈值与保持时间，适合做“越打越快”的持续火力或“必须蓄满才能开火”的高能武器。预热值不仅影响射击，还会驱动 DrawPart 的 `warmup` 进度，因此如果你的炮塔有明显的充能动画，记得让预热参数与动画节奏一致。

射程也不仅仅由 `range` 决定。炮塔会以 `range` 作为搜索与锁定的上限，但子弹能否飞到目标还取决于 `speed * lifetime`。如果你遇到“显示射程很远但打不到”的情况，优先检查子弹寿命；如果“显示射程很短但实际打得很远”，可能是子弹的 `rangeChange` 或 `lifetime` 与 `speed` 组合过高。

在原版中，“冰雹”“齐射”属于典型的物品炮塔，“海啸”是液体炮塔，“蓝瑟”“熔毁”则是电力炮塔。你可以把这些作为参考：物品炮塔更强调弹药经济，液体炮塔更强调持续供给，电力炮塔则更依赖电网稳定性。

## 弹药与物流的实际影响

很多玩家低估了弹药系统对生产链的影响。`maxAmmo` 决定炮塔的“弹药缓冲”，它直接影响你需要多快补给；`ammoPerShot` 决定单次射击的成本；`ammoMultiplier` 则决定“单个物品到底能提供多少弹药单位”。这些字段加在一起，决定了“一个传送带是否能喂饱炮塔”。如果你希望炮塔更像“持续火力”，就应当提高 `ammoMultiplier` 或降低 `ammoPerShot`；如果你希望它成为“高爆发、低持续”，就可以反过来设置。

液体炮塔在物流上更复杂，因为液体的管网容易堵塞，也更容易因为混液导致效率下降。设计液体炮塔时，建议明确输入液体类型，并通过 `ammoTypes` 限制可用液体，这样玩家的管道布局会更清晰。电力炮塔的难点则是“能量峰值”：高 `reload` 的炮塔更像“持续耗电”，低 `reload` 且高伤害的炮塔则会产生“瞬时耗电峰值”，需要更多电池来平滑波动。

## 模组示例：饱和火力 3.3.0 的电力炮塔

“饱和火力 3.3.0”里的“丁达尔”是一门典型的 `PowerTurret`。它使用 `shoot` 的 `ShootBarrel` 模式来模拟多管齐射，`shootType` 则直接定义子弹类型，并在子弹上配置了 `hitEffect`、`despawnEffect` 与 `trail`。下面是该炮塔的部分字段节选，你可以看到 `shoot` 与 `shootType` 的组合方式：

```json
{
	"type": "PowerTurret",
	"name": "丁达尔",
	"reload": 12,
	"shoot": {
		"type": "ShootBarrel",
		"shots": 12,
		"shotDelay": 4,
		"barrels": [
			5.5, 22.25, 0,
			-5.5, 22.25, 0,
			16, 21.25, 0,
			-16, 21.25, 0
		]
	},
	"shootType": {
		"type": "BasicBulletType",
		"damage": 106,
		"speed": 22,
		"lifetime": 25,
		"pierce": true,
		"trailLength": 50
	},
	"consumes": {
		"power": 80,
		"coolant": {
			"amount": 2,
			"optional": true
		}
	}
}
```

这个例子体现了“电力炮塔 + 冷却液”的常见组合：电力是主输入，冷却液作为可选加速。对于高射速、多发数的炮塔来说，这种配置能在不强制液体管网的前提下提供上限提升。

## 模组示例：饱和火力 3.3.0 的物品炮塔

“电极”是一门 `ItemTurret`，它通过 `ammoTypes` 定义不同弹药对应的 `EmpBulletType`。你会发现它不仅设置了伤害与速度，还在子弹里塞入了 `chargeEffect` 与 `status`，这让“弹药类型”同时影响表现与附加状态。下面是其中一段节选：

```json
{
	"type": "ItemTurret",
	"name": "电极",
	"ammoPerShot": 2,
	"shoot": {
		"type": "ShootPattern",
		"firstShotDelay": 20
	},
	"ammoTypes": {
		"copper": {
			"type": "EmpBulletType",
			"speed": 14,
			"lifetime": 18,
			"status": "阳电",
			"statusDuration": 180,
			"chargeEffect": {
				"type": "MultiEffect",
				"effects": [
					{"type": "ParticleEffect", "particles": 13},
					{"type": "ParticleEffect", "particles": 1}
				]
			}
		}
	}
}
```

这个片段展示了“弹药类型改变武器效果”的思路。你可以把它理解为“同一门炮塔，弹药决定玩法”，这在设计多用途炮塔时非常有效。

## 冷却与效率

很多炮塔都可以通过冷却液提升射速。JSON 中通常写 `consumes: { coolant: { liquid: "water", amount: 0.1 } }`，这会被解析成 `ConsumeCoolant`。`coolantMultiplier` 决定冷却的加速效率，数值越大，冷却效果越明显。需要注意的是，冷却并不是“无限叠加”，它只是加速装填或降低热量，因此在极高射速下仍会被 `reload` 的下限限制。

如果你把 `coolantMultiplier` 设得非常高，又把 `cooldownTime` 设得很短，炮塔可能会出现“热量几乎不显示”的情况，玩家对射击节奏的感知会变弱。适当保留一点热量衰减时间，反而能让武器更有存在感。

部分炮塔还会使用热量机制（`heatRequirement`、`maxHeatEfficiency`），这类炮塔通常需要与热源或热能方块配合。JSON 可以写这些字段，但实际热量来源大多来自特定方块或环境，所以没有配套系统时写了也不会起效。

## DrawPart 与炮塔绘制

炮塔的绘制由 `drawer` 控制，默认是 `DrawTurret`。如果你需要更复杂的动画或多层结构，可以在 `drawer` 里使用 `parts` 配置 `DrawPart`。最常用的是 `RegionPart`，它会在原炮塔基础上叠加一张贴图，并根据进度位移或旋转。

`RegionPart` 的关键字段包括 `suffix`（贴图后缀）、`moveX`/`moveY`/`moveRot`（位移与旋转）、`mirror`（左右镜像）、`heatColor`/`heatProgress`（热量颜色与进度）。`progress` 决定动画驱动来源，例如 `warmup`、`recoil`、`reload` 等。`PartProgress` 还支持简单运算组合，例如用 `mul` 让某个部件动作幅度更小，用 `add` 把两个进度叠加成“复合动画”。

示例：给炮塔加一个会随预热移动的部件。

```json
"parts": [
	{
		"type": "RegionPart",
		"suffix": "-barrel",
		"moveY": -1.5,
		"progress": "warmup"
	}
]
```

“饱和火力 3.3.0”的“扩散轨道炮”展示了更复杂的部件组合。它让一个部件跟随 `recoil` 回弹，另一个用 `warmup` 做“充能核心”，再用 `HaloPart` 把 `reload` 变成“几何光环”。你可以在自己的炮塔上复用这种“多进度驱动”的思路：

```json
"drawer": {
	"type": "DrawTurret",
	"parts": [
		{
			"type": "RegionPart",
			"suffix": "-中",
			"progress": "recoil",
			"heatProgress": "recoil",
			"moveY": -10,
			"under": true
		},
		{
			"type": "ShapePart",
			"progress": "warmup",
			"y": -24,
			"circle": true,
			"radiusTo": 6
		},
		{
			"type": "HaloPart",
			"progress": "reload",
			"y": -24,
			"radius": 10,
			"radiusTo": 0,
			"strokeTo": 0.1
		}
	]
}
```

这类组合的关键不是“堆特效”，而是让不同的战斗节奏对应不同的视觉反馈：回弹、充能、装填，各自有各自的动画驱动，玩家才能一眼读懂炮塔状态。

如果你发现部件位置不对，优先检查贴图命名是否正确，再调整 `moveX`/`moveY` 的偏移。DrawPart 的组合能力很强，但也最容易“走形”，建议先复刻原版，再做个性化修改。

## 小结

炮塔配置的核心在于“射程与节奏”“弹药与效率”“表现与手感”。当这些层面都匹配时，即使是最简单的 `BasicBulletType` 也能做出很有个性的炮塔。
