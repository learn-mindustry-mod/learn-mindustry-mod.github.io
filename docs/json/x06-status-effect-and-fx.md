# 状态效果、特效、音效

本节把“战斗表现”拆成三层：

1. **状态效果**：改变单位属性或施加持续伤害；
2. **特效**：视觉短效果（Fx/Effect）；
3. **音效**：声音反馈（Sounds）。

## 状态效果（StatusEffect）

状态效果用于对单位施加增益或减益。原版里常见的有“燃烧”“潮湿”“冻结”“电击”“熔化”“过载”等。

### 常用字段

- `damageMultiplier`/`healthMultiplier`/`speedMultiplier`/`reloadMultiplier`/`buildSpeedMultiplier`：倍率类；
- `damage`：每刻伤害（可以为负值表示治疗）；
- `intervalDamage`/`intervalDamageTime`：间隔伤害；
- `disarm`：禁用武器；
- `color`：状态颜色；
- `effect`/`applyEffect`：持续特效/施加瞬间特效；
- `show`：是否在数据库中显示。

### 一个简单状态效果示例

```json content/statuses/tutorial-slow.json
{
	"name": "示例迟缓",
	"description": "让单位减速并轻微受伤。",
	"color": "7db6ff",
	"speedMultiplier": 0.7,
	"damage": 0.02,
	"effect": "wet"
}

```

> 注意：JSON里写`affinities`/`opposites`只影响数据库展示；反应逻辑需要在Java里用`affinity`/`opposite`/`trans`定义，JSON无法配置，所以“潮湿”+“电击”之类的反应仍需代码支持。

## 特效（Effect / Fx）

特效是短时视觉片段，常见于：炮塔开火、方块建造、生产完成、单位死亡等。

JSON里可以直接引用原版`Fx`里的特效名，也可以用模板化子类（如`ParticleEffect`、`WaveEffect`）自定义。

### 一个粒子特效示例

```json
"craftEffect": {
	"type": "ParticleEffect",
	"particles": 6,
	"lifetime": 30,
	"length": 6,
	"sizeFrom": 2,
	"sizeTo": 0,
	"colorFrom": "ffffff",
	"colorTo": "a0b4ff"
}
```

常见字段：

- `lifetime`：持续时间；
- `particles`：粒子数；
- `sizeFrom`/`sizeTo`：大小变化；
- `colorFrom`/`colorTo`：颜色变化；
- `waveStroke`/`waveRad`：波纹类效果；
- `trailLength`/`trailWidth`：拖尾类效果。

## 音效（Sound）

音效来源于`core/assets/sounds`，在JSON里通常直接引用`Sounds`里的字段名，或用字符串绑定资源名。

常见字段示例：

- `shootSound`：射击音效；
- `placeSound`/`breakSound`/`destroySound`：建造、拆除、摧毁；
- `ambientSound`：持续环境音。

如果你自带音效，把`ogg`或`mp3`放进`sounds/`目录，文件名就是你要引用的名字。

## 小结

- 状态效果更偏“数值”；
- 特效和音效负责“表现”；
- JSON能做大多数表层效果，但复杂联动仍需要Java层支持。
