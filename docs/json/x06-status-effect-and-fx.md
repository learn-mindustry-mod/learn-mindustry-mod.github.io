# 状态效果、特效、音效

这一节把“战斗表现”拆成三层：状态效果负责数值变化，特效负责视觉反馈，音效负责声音反馈。JSON 可以配置大部分表层效果，但真正的反应联动仍需要 Java 支持。

## 状态效果（StatusEffect）

状态效果会附着在单位身上并持续生效。它可能来自子弹、液体、天气或某些方块。`damage` 是每刻伤害（60 刻约等于 1 秒），因此 `damage = 0.1` 表示每秒约 6 点伤害。`intervalDamage` 与 `intervalDamageTime` 则提供“间隔伤害”，更适合爆发式的毒素或电击节奏。

倍率类字段决定单位属性的缩放：`speedMultiplier` 影响移动速度，`reloadMultiplier` 影响射速，`buildSpeedMultiplier` 影响建造速度，`damageMultiplier` 与 `healthMultiplier` 则分别影响输出与血量。`disarm` 可以禁用武器，`dragMultiplier` 影响移动阻力。视觉方面，`color` 决定单位的染色，`effect` 是持续播放的特效，`applyEffect` 是刚被施加时的瞬间特效，`effectChance` 决定持续特效的出现频率。

`show` 控制状态是否出现在数据库里，`outline` 控制图标描边。`permanent` 会让状态一直存在，通常用于“被动能力”，不建议随意开启。单位是否免疫状态由 `UnitType` 的 `immunities` 列表控制。

需要注意的是，JSON 里写 `affinities` 或 `opposites` 只会影响数据库展示，不会触发真正的反应逻辑。原版中“潮湿”遇到“电击”的连锁反应，是在 Java 里通过 `affinity`/`opposite`/`trans` 注册的，JSON 目前无法配置这部分逻辑。

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

上面的例子把速度降到 0.7，并附加少量持续伤害。`effect` 引用了原版的 `Fx.wet`，因此会出现“潮湿”的粒子表现。

## 特效（Effect / Fx）

特效是短时视觉片段，常见于炮塔开火、方块建造、生产完成、单位死亡等。JSON 里可以直接写原版 `Fx` 的名字（字符串），也可以写一个对象并指定 `type` 来创建自定义特效。若对象里不写 `type`，默认会当成 `ParticleEffect` 解析。你还可以用数组写多个效果，解析器会自动合成为 `MultiEffect`。

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

粒子类特效最常用的字段是 `particles`、`lifetime`、`length` 与 `sizeFrom/sizeTo`，颜色一般用 `colorFrom/colorTo` 做渐变。波纹类效果会用 `waveRad` 与 `waveStroke`，拖尾类效果会用 `trailLength` 与 `trailWidth`。特效字段非常多，实用策略是先对照原版效果再修改。

## 音效（Sound）

音效来源于 `core/assets/sounds`，在 JSON 中通常直接引用 `Sounds` 里的字段名。常见的音效字段包括 `shootSound`、`chargeSound`、`placeSound`、`breakSound`、`destroySound`、`ambientSound` 等。若你自带音效，把 `ogg` 或 `mp3` 放进 `sounds/` 目录，文件名就是你要引用的名字。

音效的体验很依赖搭配：比如充能类炮塔应同时设置 `chargeSound` 与 `shootSound`，环境类方块则适合用 `ambientSound` 提升氛围。

## 小结

状态效果偏数值、特效与音效偏表现。JSON 能完成绝大多数“视觉与数值”配置，但需要复杂联动时仍建议转向 Java。

