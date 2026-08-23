# 状态效果、特效、音效

> ***"让敌人燃烧，让战场轰鸣。"***

炮塔会开枪了，但光有伤害还不够"有感觉"。这一章我们处理三样"调味料"：**状态效果（StatusEffect）**（燃烧、中毒、减速这些挂在单位身上的持续效果）、**特效（Effect）**（爆炸、火光、粒子这些视觉花活）、**音效（Sound）**（开火、爆炸这些听觉反馈）。

它们让战斗从"数字跳动"变成"可感知的体验"。学完这一章，你能给子弹附上燃烧、给炮塔配上轰鸣、给命中加上绚丽的粒子。

**本章涉及的源码**：`mindustry/type/StatusEffect.java`、`mindustry/entities/effect/Effect.java`、`mindustry/content/Fx.java`、`mindustry/mod/ContentParser.java`（音效与特效的解析）。

---

## 状态效果（StatusEffect）：挂上去的持续 Buff/Debuff

状态效果定义在 `content/statuses/` 文件夹下，对应源码类 `StatusEffect`。它不单独存在，而是被子弹、武器、单位"施加"到目标身上，持续影响目标。

对照《饱和火力》的 `SFcontent/status/corroded.json`：

```json
{
  "damage": 1.88,
  "healthMultiplier": 0.85,
  "effectChance": 0.6,
  "effect": {
    "type": "ParticleEffect",
    "particles": 3,
    "length": 16,
    "lifetime": 250,
    "colorFrom": "a0b46e",
    "colorTo": "a0b46e00"
  }
}
```

核心字段（源码 `StatusEffect.java`）：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `damage` | 浮点 | 0 | 每 tick 的持续伤害；**负数就是治疗** |
| `damageMultiplier` | 浮点 | 1 | 造成的伤害倍率 |
| `healthMultiplier` | 浮点 | 1 | 血量倍率 |
| `speedMultiplier` | 浮点 | 1 | 移动速度倍率 |
| `reloadMultiplier` | 浮点 | 1 | 攻击装填倍率 |
| `buildSpeedMultiplier` | 浮点 | 1 | 建造速度倍率 |
| `disarm` | 布尔 | false | 是否缴械（禁用武器） |
| `effect` | 特效 | 无 | 持续期间随机冒出的粒子 |
| `effectChance` | 浮点 | 0.15 | 上述特效的出现概率 |
| `applyEffect` | 特效 | 无 | 刚被施加时一次性播放的特效 |
| `color` | hex | 白 | 单位染色 |
| `permanent` | 布尔 | false | 是否永不消退 |

### 把状态挂到子弹上

上一章的子弹字段里有个 `status`，就是干这个的。写一个"燃烧弹"：

```hjson
{
  type: ItemTurret
  name: 燃烧炮
  ammoTypes: {
    coal: {
      damage: 8
      speed: 3
      status: burning
      statusDuration: 300
      makeFire: true
    }
  }
}
```

`status: burning` 引用的是**原版燃烧效果**的内部名；`statusDuration` 决定持续多久（tick，300 = 5 秒）。要引用你自己的状态效果，就写它的完整内部名（如 `my-first-mod-corrosion`）。

---

## 特效（Effect）：手搓的光影魔法

特效是纯视觉的粒子/波/闪光。游戏预置了一大堆（都在 `content/Fx.java` 里），比如 `Fx.explosion`、`Fx.fire`、`Fx.hitBulletSmall`、`Fx.shootSmall`——这些直接写名字就能用。

但真正的乐趣在于**手搓一个粒子特效**。最常用的类型是 `ParticleEffect`（源码 `entities/effect/`）。回顾《饱和火力》子弹里那段完整的粒子效果：

```json
{
  "type": "ParticleEffect",
  "particles": 9,
  "line": true,
  "interp": "fastSlow",
  "sizeInterp": "pow3In",
  "strokeFrom": 2,
  "strokeTo": 0,
  "lenFrom": 6,
  "lenTo": 0,
  "lifetime": 30,
  "colorFrom": "FFFFFF",
  "colorTo": "FFE176",
  "cone": 90
}
```

`ParticleEffect` 常用字段：

| 字段 | 说明 |
|---|---|
| `particles` | 粒子数量 |
| `lifetime` | 存活时间（tick） |
| `line` | 是否拉成"线条"状粒子 |
| `length` / `baseLength` | 线条长度 / 起始长度 |
| `lenFrom` / `lenTo` | 线条长度随时间的起止变化 |
| `sizeFrom` / `sizeTo` | 尺寸随时间的起止变化 |
| `strokeFrom` / `strokeTo` | 线宽起止 |
| `colorFrom` / `colorTo` | 颜色起止（hex，末两位可带透明度） |
| `interp` / `sizeInterp` | 位置/尺寸的插值曲线（`fastSlow`、`pow3In`…） |
| `cone` | 散布锥角（度），360 为全向 |
| `region` | 指定贴图（否则用默认圆点） |
| `spin` | 粒子自旋 |

### 组合特效：`MultiEffect`

一个特效不够？用 `MultiEffect` 把多个特效叠起来（《饱和火力》的"莱普合金"子弹就叠了四个粒子效果 + 一个现成特效）：

```json
{
  "type": "MultiEffect",
  "effects": [
    { "type": "WaveEffect", "lifetime": 10, "sizeFrom": 0, "sizeTo": 40, "colorFrom": "FFFFFF70", "colorTo": "FFFFFF00" },
    "hitBulletColor"
  ]
}
```

`effects` 数组里既能写对象，也能混写现成特效的名字（如 `hitBulletColor`）。

---

## 音效（Sound）：让战场轰鸣

音效分两种用法：**用原版的**、**用你自己的**。

**用原版**：直接写名字即可，预置音效在 `Sounds` 类里（如 `Sounds.shoot`、`Sounds.explosion`、`Sounds.none`）。字段里凡是 `Sound` 类型的（比如炮塔的 `shootSound`、子弹的 `hitSound`），填字符串就行：

```hjson
shootSound: shootBig
```

**用你自己的**：把音频文件（`.ogg` 或 `.mp3`）放进模组的 `sounds/` 文件夹，引用时写**文件名（可带或不带扩展名）**。源码 `ContentParser` 解析音效时会依次尝试 `名字`、`名字.ogg`、`名字.mp3`，最后从文件树里加载。

```
my-first-mod/
└─ sounds/
   └─ my-boom.ogg
```

```hjson
shootSound: my-boom
```

::: tip 音效字段到处都有
`shootSound`（开火）、`hitSound`（命中）、`despawnSound`（消散）、`explodeSound`（爆炸）、`ambientSound`（环境音）……凡是名字里带 `Sound` 的字段，规则都一样。
:::

---

## 效果验证

把三样东西串起来，做一个"燃烧炮"：子弹命中后点燃地面、挂上**原版**燃烧状态、爆炸时播自定义音效。相关文件新增 `sounds/`（自定义音效）；状态则直接引用原版的 `burning`，无需新建——如果你想做自定义状态，再往 `content/status/` 里加文件（文件名同样别撞原版，如别叫 `burning.json`）。

进游戏试射，你应该看到：开火有声、子弹拖着火光、命中后敌人着火、地面被点燃。到这一步，你的模组已经"有声有色"。

---

## 小结

这一章我们补齐了"体感"三件套：**状态效果**（挂到单位身上的持续 Buff/Debuff，通过 `status` 字段施加）、**特效**（`ParticleEffect`/`MultiEffect`，纯视觉粒子）、**音效**（原版名或 `sounds/` 自定义文件）。它们的共同点是：**都是"被引用"的内容**——状态被子弹引用，特效被子弹/状态引用，音效被几乎所有东西引用。

**思考题**：一个"冰冻减速"状态，至少需要哪个字段实现减速？如果还想让它每秒扣血，再加哪个字段？

下一章，我们造会动的家伙——单位，以及它们手里的武器、身上的能力和生产它们的工厂。

---

## 附：本章涉及的源码文件

- `mindustry/type/StatusEffect.java`
- `mindustry/entities/effect/Effect.java`（及其子类 `ParticleEffect`、`WaveEffect`、`MultiEffect`）
- `mindustry/content/Fx.java`（预置特效）
- `mindustry/mod/ContentParser.java`（`Sound`/`Music`/`Effect` 的解析）
