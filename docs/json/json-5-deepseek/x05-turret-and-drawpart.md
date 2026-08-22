# 炮塔、DrawPart

> ***"最好的防御，是把敌人轰成灰。"***

生产体系建好了，敌人也快来了。这一章我们造**炮塔（Turret）**——会瞄准、会开火、能反击的方块。炮塔是 JSON 模组里最"好玩"也最复杂的一类内容，因为它由三件套组成：炮塔本体（决定打多远、打多快）、**子弹（BulletType）**（决定打出去的是什么）、**DrawPart**（决定炮管怎么动）。

学完这一章，你就能造出带旋转炮管、多弹药、带溅射伤害的炮塔。

**本章涉及的源码**：`world/blocks/defense/turrets/`（`BaseTurret`、`ReloadTurret`、`Turret`、`ItemTurret`、`PowerTurret`）、`entities/bullet/BulletType.java`、`entities/part/DrawPart.java`、`world/draw/DrawTurret.java`。

---

## 炮塔通性：从 `range` 到 `recoil`

所有炮塔都继承自 `Turret`（其上是 `ReloadTurret` → `BaseTurret` → `Block`）。除了上一章说的方块通性，炮塔家族追加的字段如下：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `range` | 浮点 | 80 | 射程（格子，1 格 = 8 单位） |
| `reload` | 浮点 | 10 | 两发之间的间隔（tick），越小射速越快 |
| `rotateSpeed` | 浮点 | 5 | 炮管转向速度 |
| `inaccuracy` | 浮点 | 0 | 散布（度），子弹随机偏角 |
| `targetAir` / `targetGround` | 布尔 | true | 能否打空中 / 地面单位 |
| `shootSound` | 音效名 | `shootDuo` | 开火音效 |
| `recoil` | 浮点 | 1 | 后坐力幅度 |
| `ammoPerShot` | 整数 | 1 | 每发消耗的弹药数 |
| `maxAmmo` | 整数 | 30 | 最大备弹量 |
| `coolantMultiplier` | 浮点 | 5 | 冷却液对射速的加速倍率 |
| `size` | 整数 | 2 | 占地边长 |

::: tip 射程与冷却
`range` 的单位是"格"，一格等于 8 个世界单位。想让炮塔**射速更快**，就调小 `reload`；想让炮塔**被冷却液加速**，加一句 `consumes: { coolant: { amount: 0.1 } }`，射速会按 `coolantMultiplier` 提升。
:::

---

## 物品炮塔（ItemTurret）：换弹药换打法

最经典的炮塔是 `ItemTurret`——它吃物品当弹药，**每种弹药可以是一种完全不同的子弹**。核心字段只有一个：

- `ammoTypes`：一个"物品 → 子弹"的映射。

对照《饱和火力》给原版 `duo` 炮塔改的 `ammoTypes`（节选）：

```json
{
  "ammoTypes": {
    "copper": {
      "type": "BasicBulletType",
      "speed": 2.5,
      "lifetime": 68,
      "damage": 9,
      "ammoMultiplier": 2
    },
    "graphite": {
      "speed": 3.5,
      "damage": 18,
      "rangeChange": 16,
      "ammoMultiplier": 4
    }
  }
}
```

解读：

- `ammoTypes` 的每个**键**是物品内部名（`copper`、`graphite`），每个**值**是一个子弹对象。
- 子弹对象的 `type` 默认是 `BasicBulletType`，不写也行（上面 `graphite` 就没写）。
- `ammoMultiplier`：这种弹药一个能折算成多少"备弹量"（`maxAmmo` 的上限单位）。

---

## 能量炮塔（PowerTurret）：只射一种子弹

`PowerTurret` 不换弹药，用电力驱动，永远只射**一种**子弹。字段只有：

- `shootType`：唯一的子弹对象。

```hjson
{
  type: PowerTurret
  name: 强化兰瑟
  range: 160
  reload: 30
  shootType: {
    type: LaserBulletType
    damage: 40
    length: 160
  }
  requirements: [
    silicon/30
    copper/40
  ]
  research: lancer
  consumes: {
    power: 3
  }
}
```

`PowerTurret` 构造器里自动开了 `hasPower`，所以不用重复声明。

---

## 子弹（BulletType）：打出去的是什么

子弹决定了伤害、飞行、特效、命中效果，是炮塔的灵魂。常用字段（源码 `entities/bullet/BulletType.java`）：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | 字符串 | `BasicBulletType` | 子弹类型（`LaserBulletType`/`MissileBulletType`/`ArtilleryBulletType`…） |
| `damage` | 浮点 | 1 | 单发伤害 |
| `speed` | 浮点 | 1 | 飞行速度 |
| `lifetime` | 浮点 | 40 | 存活时间（tick），决定射程 |
| `splashDamage` / `splashDamageRadius` | 浮点 | 0 / -1 | 溅射伤害与半径 |
| `pierce` / `pierceCap` | 布尔/整数 | false / -1 | 穿透能力与穿透上限 |
| `knockback` | 浮点 | 0 | 击退力度 |
| `status` | 状态名 | 无 | 命中施加的状态效果 |
| `statusDuration` | 整数 | — | 状态持续时间 |
| `homingRange` / `homingPower` | 浮点 | 50 / — | 追踪距离与强度 |
| `ammoMultiplier` | 浮点 | 2 | 折算备弹量 |
| `reloadMultiplier` | 浮点 | 1 | 对射速的倍率 |
| `rangeChange` | 浮点 | 0 | 对炮塔射程的修正 |
| `hitEffect` / `despawnEffect` | 特效名 | `hitBulletSmall` | 命中/消散特效 |
| `makeFire` | 布尔 | false | 命中后点燃地面 |

::: tip 子弹颜色
子弹外观常由 `frontColor`、`backColor`、`trailColor`、`hitColor` 四个 hex 颜色控制（见《饱和火力》示例）。想做一个"拖着蓝尾巴的红子弹"，改 `frontColor` 和 `trailColor` 即可。
:::

---

## DrawPart：让炮管动起来

最后一个进阶主题：**DrawPart**。在 v8 里，炮塔的动态部件（旋转的炮管、后坐的炮身）不再写在顶层 `parts` 字段，而是搬进了默认绘制器 **`DrawTurret`** 里（源码 `world/draw/DrawTurret.java`）。

`DrawTurret` 自带一套区域命名约定，贴图按后缀自动查找：

| 后缀 | 区域 | 用途 |
|---|---|---|
| `-base` | 底座 | 固定的地基 |
| `-preview` | 预览 | 建造预览时画的炮管 |
| `-top` | 顶层 | 会随炮管旋转的主体 |
| `-heat` | 发热层 | 开火时叠加的泛光 |
| `-liquid` | 液体层 | 内部液体的显示 |
| `-outline` | 描边 | 部件下的描边 |

而动态部件通过 `drawer.parts` 数组添加，每个部件用 `RegionPart`（源码 `entities/part/RegionPart.java`）：

```hjson
{
  type: ItemTurret
  name: 强化双炮
  range: 120
  reload: 12
  ammoTypes: {
    copper: {
      damage: 12
      speed: 3
    }
  }
  drawer: {
    type: DrawTurret
    parts: [
      {
        type: RegionPart
        suffix: -barrel
        x: 3
        y: 0
        progress: recoil
        moveY: -2
      }
    ]
  }
}
```

- `parts` 里的 `RegionPart` 会找 `内部名-barrel` 这张贴图；
- `progress: recoil` 让炮管随着**后坐力**（`recoil`）前后移动，`moveY: -2` 控制后移距离；
- 部件可以叠加多个、可以有子部件（`children`），还能用 `mirror: true` 做左右镜像（需提供 `-1`、`-2` 两张图）。

`DrawTurret` 还有一个按弹药区分的 `ammoParts`，可以做到"不同弹药显示不同炮管"，属于高阶玩法，这里先留个印象。

---

## 效果验证

加一个炮塔后，模组多了这些文件：

```
my-first-mod/
├─ content/
│  ├─ items/copper.json
│  ├─ liquids/hot-water.json
│  ├─ blocks/better-copper-furnace.json
│  ├─ blocks/better-drill.json
│  ├─ blocks/better-burner.json
│  └─ blocks/better-turret.json
├─ sprites/
│  ├─ ...（之前的）
│  ├─ better-turret-base.png
│  ├─ better-turret-preview.png
│  ├─ better-turret-top.png
│  └─ better-turret-barrel.png
└─ bundles/
   └─ bundle_zh_CN.properties
```

进游戏摆一个，喂上铜，看它自动索敌、转炮管、开火，命中时炸出你写的特效。到这一步，你的基地已经"攻守兼备"。

---

## 小结

这一章我们拆解了炮塔的三件套：**本体**（`range`/`reload`/`targetAir`…）、**子弹**（`damage`/`splashDamage`/`status`…，通过 `ammoTypes` 或 `shootType` 挂载）、**DrawPart**（`drawer.parts` 里的 `RegionPart`，负责动态炮管）。记住 v8 的一个变化：炮塔的动态部件搬到了 `DrawTurret` 绘制器里，不再是顶层 `parts` 字段。

**思考题**：想让一个 `ItemTurret` 用"铜打单体、用硅打溅射"，`ammoTypes` 里两个子弹对象分别需要哪些字段？溅射那一发至少要有哪两个 `splash` 字段？

下一章，我们给战场加点"状态"——燃烧、冰冻、中毒，以及它们背后的特效与音效。

---

## 附：本章涉及的源码文件

- `mindustry/world/blocks/defense/turrets/BaseTurret.java`
- `mindustry/world/blocks/defense/turrets/ReloadTurret.java`
- `mindustry/world/blocks/defense/turrets/Turret.java`
- `mindustry/world/blocks/defense/turrets/ItemTurret.java`
- `mindustry/world/blocks/defense/turrets/PowerTurret.java`
- `mindustry/entities/bullet/BulletType.java`
- `mindustry/entities/part/DrawPart.java`、`RegionPart.java`
- `mindustry/world/draw/DrawTurret.java`
