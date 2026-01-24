# 炮塔与DrawPart

炮塔是Mindustry战斗系统的核心。JSON里最常见的炮塔类型分为三类：

- `ItemTurret`：吃物品当弹药；
- `LiquidTurret`：吃液体当弹药；
- `PowerTurret`：用电直接发射指定子弹。

> 原版示例包括“双管”“分裂”“冰雹”“蓝瑟”“齐射”“蜂群”“气旋”“幽灵”“熔毁”“厄兆”等。

## 一个最小的物品炮塔示例

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

`ammoTypes`的键是物品内部名，值是子弹类型对象。`ammoMultiplier`会影响弹药单位数与消耗效率。

## 关键字段速览

### 炮塔通用

- `range`：射程；
- `reload`：装填时间（刻）；
- `inaccuracy`/`velocityRnd`：散射与速度随机性；
- `shootCone`：允许开火的角度偏差；
- `targetAir`/`targetGround`/`targetBlocks`：目标类型开关；
- `recoil`/`recoilTime`/`shake`：后坐力与屏幕抖动；
- `shootSound`/`chargeSound`/`loopSound`：射击与充能音效；
- `drawer`：绘制器，通常为`DrawTurret`。

### ItemTurret

- `ammoTypes`：物品→子弹的映射；
- `maxAmmo`/`ammoPerShot`：弹药容量与单次消耗；
- `consumeAmmoOnce`：一次射击是否只消耗一次弹药（散射型常用）。

### LiquidTurret

- `ammoTypes`：液体→子弹的映射；
- `liquidCapacity`：液体容量；
- `coolantMultiplier`：冷却倍数（若使用冷却液）。

### PowerTurret

- `shootType`：固定子弹类型；
- `consumes`里的`power`：耗电配置。

## 子弹类型（BulletType）要点

常用子弹类包括：

- `BasicBulletType`：最基础子弹；
- `LaserBulletType`/`ContinuousLaserBulletType`：激光；
- `ArtilleryBulletType`：抛射弹；
- `MissileBulletType`：导弹；
- `LightningBulletType`：闪电。

常用字段：

- `speed`：速度；
- `damage`：伤害；
- `lifetime`：寿命（刻），与速度共同决定射程；
- `hitEffect`/`despawnEffect`：命中/消失特效；
- `status`/`statusDuration`：附加状态效果；
- `fragBullet`/`fragBullets`：子弹分裂；
- `pierce`/`pierceCap`：穿透。

## DrawPart 与炮塔细节

`DrawPart`是绘制部件系统，用于给炮塔或单位增加独立运动的零件。JSON里最常见的是`RegionPart`。

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

常见字段：

- `suffix`：贴图后缀，最终贴图名=方块名+后缀；
- `moveX`/`moveY`/`moveRot`：随进度移动/旋转；
- `progress`：进度来源（如`warmup`/`recoil`/`reload`）；
- `mirror`：是否左右镜像；
- `heatColor`/`heatProgress`：热量贴图效果。

> `DrawPart`功能很强，但配置也容易失真。建议先模仿原版，再逐步调整。
