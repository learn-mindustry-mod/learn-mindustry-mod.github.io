# 炮塔与 DrawPart

炮塔是 Mindustry 战斗系统的核心。无论是吃物品弹药的炮塔，还是用液体或电力驱动的炮塔，本质上都遵循同一套流程：搜敌、对准、装填、开火。你在 JSON 里配置的字段，最终会影响这条流程的每个环节。

## 炮塔的基础逻辑

炮塔的射程由 `range` 控制，它决定了目标搜索与锁定的范围，但实际“打得多远”仍取决于子弹本身的寿命与速度。`reload` 表示装填时间（单位是刻），数值越小，射速越高。`shootCone` 控制允许开火的角度偏差，`inaccuracy` 与 `velocityRnd` 则制造散射与速度随机性，适合霰弹或火箭类效果。

与射击节奏相关的字段还有 `shootWarmupSpeed`、`minWarmup`、`shoot.firstShotDelay` 等：前者控制预热速度，后者控制第一次开火前的蓄力延迟。炮塔的视觉反馈由 `recoil`、`recoilTime`、`shake`、`cooldownTime` 等字段决定，配合 `shootSound`、`chargeSound`、`loopSound` 可以让炮塔“听起来更有力量”。目标类型由 `targetAir`、`targetGround`、`targetBlocks` 三个开关控制。

## 弹药体系：物品、液体与电力

`ItemTurret` 通过 `ammoTypes` 把物品映射到子弹类型。键是物品内部名，值是子弹对象。每个子弹都带有 `ammoMultiplier`，它决定“消耗一个物品能转化成多少弹药单位”。配合 `maxAmmo`（最大弹药容量）、`ammoPerShot`（单次射击消耗）和 `consumeAmmoOnce`（一次射击只消耗一次弹药）可以精确控制弹药经济。

`LiquidTurret` 的逻辑与 `ItemTurret` 类似，只是弹药来源变成液体，容量字段是 `liquidCapacity`。液体弹药的消耗以“当前液体”计算，并按子弹的 `ammoMultiplier` 换算，例如 `ammoMultiplier = 2` 时，每次射击只消耗 `1/2` 单位液体。

`PowerTurret` 不需要弹药，直接通过 `shootType` 指定固定子弹。电力消耗写在 `consumes.power` 或 `consumes.powerBuffered` 里，前者表示持续耗电，后者表示从缓冲中抽取电力。高阶炮塔常用 `shoot.firstShotDelay` 来制造“充能感”，并搭配 `chargeSound` 和 `chargeEffect`。

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

在这个例子里，“铜”的 `ammoMultiplier` 默认是 2（来自 `BulletType` 默认值），而“石墨”设置为 4，意味着同样的物品数量能提供更多弹药单位。`range` 与 `lifetime * speed` 共同决定最终射程，如果子弹寿命太短，即使 `range` 很大也打不到那么远。

## 子弹类型的关键字段

`BulletType` 决定了“这一发子弹如何表现”。`speed` 与 `lifetime` 的乘积决定了基础飞行距离，`damage` 是基础伤害，`splashDamage` 与 `splashDamageRadius` 用于范围伤害。`pierce` 与 `pierceCap` 控制穿透，`knockback` 影响击退。`status` 与 `statusDuration` 用于附加状态效果（例如“燃烧”“电击”），需要与你在状态章节里定义的状态名对应。

如果需要导弹、激光或持续伤害，可以把 `type` 改成 `MissileBulletType`、`LaserBulletType`、`ContinuousLaserBulletType` 等子类。不同子类会支持额外字段，例如导弹常用 `homingPower` 与 `weaveMag`，激光则常用 `length`、`width`、`colors` 等。配置时建议先从原版炮塔中抄一个相近的子弹，再逐步调整。

## DrawPart 与炮塔绘制

炮塔的绘制由 `drawer` 控制，默认是 `DrawTurret`。如果你需要更复杂的动画或多层结构，可以在 `drawer` 里使用 `parts` 配置 `DrawPart`。最常用的是 `RegionPart`，它会在原炮塔基础上叠加一张贴图，并根据进度位移或旋转。

`RegionPart` 的关键字段包括 `suffix`（贴图后缀）、`moveX`/`moveY`/`moveRot`（位移与旋转）、`mirror`（左右镜像）、`heatColor`/`heatProgress`（热量颜色与进度）。`progress` 决定动画的驱动来源，例如 `warmup`、`recoil`、`reload` 等，内部其实是 `PartProgress` 系统，可以在 JSON 里用字符串直接引用常量。

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

如果你发现部件位置不对，优先检查贴图命名是否正确，再调整 `moveX`/`moveY` 的偏移。DrawPart 的组合能力很强，但也最容易“走形”，建议先复刻原版，再做个性化修改。

