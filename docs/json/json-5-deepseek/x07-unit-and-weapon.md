# 单位、武器、能力、单位工厂

> ***"方块是死的，单位是活的。"***

之前造的一切——工厂、炮塔、钻头——都是**方块**，钉在地上不能动。这一章我们造**单位（Unit）**：会移动、会索敌、会采矿、会建造的"活物"。单位由四件套组成：单位本体（决定跑多快、多能扛）、**武器（Weapon）**（挂在身上的枪）、**能力（Ability）**（额外行为）、**单位工厂（UnitFactory）**（把它们生产出来）。

学完这一章，你能造出会战斗、会采矿、会自爆的机甲和飞机。

**本章涉及的源码**：`mindustry/type/UnitType.java`、`mindustry/type/Weapon.java`、`mindustry/entities/abilities/`、`mindustry/world/blocks/units/UnitFactory.java`、`Reconstructor.java`、`mindustry/mod/ContentParser.java`。

---

## 单位本体（UnitType）：会动的方块

单位定义在 `content/units/` 下，对应源码类 `UnitType`。和方块一样，它也有 `type` 字段，但含义不同——单位的 `type` 决定它的**运动方式**（源码 `ContentParser.unitType`）：

| `type` | 运动方式 |
|---|---|
| （省略） | 地面单位（默认） |
| `flying` | 飞行单位 |
| `mech` / `legs` | 机甲 / 多足机甲 |
| `naval` | 水上单位 |
| `hover` | 悬浮单位 |
| `missile` | 导弹（会自毁） |
| `tank` | 坦克 |
| `payload` | 载荷单位 |
| `tether` / `crawl` | 系留 / 爬行 |

除了 `type`，还有一个 `template` 字段，指定**单位类型模板**（`UnitType` 的子类，如 `MissileUnitType`、`FlyingUnitType`）。普通地面单位两者都可以省略。

对照《饱和火力》的自爆导弹（节选）：

```json
{
  "type": "missile",
  "template": "MissileUnitType",
  "speed": 5,
  "health": 800,
  "hitSize": 18,
  "engineColor": "FFA05C",
  "engineSize": 4,
  "engineOffset": 15
}
```

单位的核心字段（源码 `UnitType.java`）：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `health` | 浮点 | 200 | 血量 |
| `speed` | 浮点 | 1.1 | 移动速度（世界单位/tick） |
| `hitSize` | 浮点 | 6 | 碰撞箱边长 |
| `armor` | 浮点 | 0 | 护甲（直接减伤） |
| `drag` | 浮点 | 0.3 | 移动阻力 |
| `accel` | 浮点 | 0.5 | 加速度（速度的分数） |
| `rotateSpeed` | 浮点 | 5 | 转身速度（度/tick） |
| `lowAltitude` | 布尔 | false | 低空飞行（视觉层更低） |
| `range` | 浮点 | -1 | 攻击距离（-1 自动按武器算） |
| `buildSpeed` | 浮点 | -1 | 建造速度倍率（-1 关闭建造） |
| `mineSpeed` / `mineTier` | 浮点/整数 | 1 / -1 | 采矿速度与能挖的硬度 |
| `itemCapacity` | 整数 | -1 | 携带物品容量 |
| `engineSize` / `engineOffset` | 浮点 | 2.5 / 5 | 尾焰大小与位置 |
| `engineColor` | hex | 队伍色 | 尾焰颜色 |
| `canDrown` | 布尔 | true | 是否会淹死 |
| `weapons` | 数组 | 空 | 挂载的武器列表 |
| `abilities` | 数组 | 空 | 能力列表 |

---

## 武器（Weapon）：挂在身上的枪

单位的武器通过 `weapons` 数组挂载，每个武器对应源码类 `Weapon`：

```hjson
weapons: [
  {
    name: 强化铜炮
    x: 0
    y: 0
    reload: 30
    mirror: true
    alternate: true
    rotate: true
    bullet: {
      damage: 20
      speed: 4
    }
  }
]
```

常用字段：

| 字段 | 说明 |
|---|---|
| `name` | 武器的**贴图区域名**（`sprites/` 里那张炮管图） |
| `bullet` | 发射的子弹（同上一章 `BulletType`） |
| `x` / `y` | 武器在单位身上的位置 |
| `reload` | 射击间隔（tick） |
| `mirror` | 是否镜像出"另一只手"（默认 true，即对称双持） |
| `alternate` | 镜像时是否左右交替开火 |
| `rotate` | 是否独立转向目标 |
| `shootSound` | 开火音效 |
| `recoil` | 后坐力幅度 |

::: tip 武器贴图命名
`name` 指向的是 `sprites/` 里的一张图，命名规则同前（`模组名-文件名`）。武器会自动找 `<name>-heat`、`<name>-outline` 等衍生图。
:::

---

## 能力（Ability）：额外的行为

能力通过 `abilities` 数组挂载，给单位附加被动效果——喷尾焰、回血、护盾……《饱和火力》的导弹用了一个 `MoveEffectAbility`（移动时拖粒子）：

```json
{
  "abilities": [
    {
      "type": "MoveEffectAbility",
      "effect": {
        "type": "ParticleEffect",
        "particles": 3,
        "lifetime": 93,
        "colorFrom": "FFA05C88",
        "colorTo": "FFA05C48"
      },
      "interval": 2,
      "y": -16
    }
  ]
}
```

能力家族很大（源码 `entities/abilities/` 目录），常用几个：`MoveEffectAbility`（移动特效）、`RepairFieldAbility`（修理光环）、`StatusFieldAbility`（状态光环）、`ForceFieldAbility`（力场护盾）、`ShieldRegenFieldAbility`（护盾再生）。它们都通过 `type` 指定，字段各异，但套路一致：**写 `type`，再填这个能力自己的字段**。

---

## 单位工厂：把它们生产出来

最后一步：怎么把单位"造"出来？答案是 `UnitFactory`（源码 `world/blocks/units/UnitFactory.java`）。它的核心字段是 `plans`——一个"生产计划"列表：

```hjson
{
  type: UnitFactory
  name: 强化铜机甲厂
  size: 3
  requirements: [
    copper/100
    lead/80
    silicon/60
  ]
  research: ground-factory
  consumes: {
    power: 2
  }
  plans: [
    {
      unit: my-first-mod-miner
      time: 600
    }
  ]
}
```

- `plans` 每一项：`unit` 是要生产的单位内部名，`time` 是生产耗时（tick）；
- 一个工厂可以列多个 `plans`，玩家点击切换生产目标；
- `UnitFactory` 构造器已开好 `hasPower`、`hasItems`、`configurable` 等开关。

### 进阶：用 `Reconstructor` 升级单位

想实现"从低级单位升级到高级单位"，用 `Reconstructor`：

```hjson
{
  type: Reconstructor
  name: 强化升级器
  size: 3
  constructTime: 120
  requirements: [
    copper/80
    silicon/50
  ]
  research: additive-reconstructor
  upgrades: [
    [my-first-mod-miner, my-first-mod-miner-plus]
  ]
}
```

`upgrades` 是"从哪升级到哪"的数组：`[低级单位, 高级单位]`。`constructTime` 是升级耗时。

---

## 效果验证

加上单位后，模组的 `content/` 多了 `units/` 目录，`sprites/` 多了单位贴图和武器贴图。进游戏摆一个单位工厂，点选生产，看着机甲从工厂里走出来、跑去采矿或战斗——这一刻，你的模组"活了"。

---

## 小结

这一章我们造出了会动的单位，理清了它的四件套：**本体**（`type` 定运动方式、`health`/`speed` 定属性）、**武器**（`weapons` 数组，`bullet` 复用上一章的子弹）、**能力**（`abilities` 数组，`type` 指定行为）、**工厂**（`UnitFactory.plans` 生产、`Reconstructor.upgrades` 升级）。单位是所有内容里最"立体"的一种，但每一件套的套路都和前面完全一致。

**思考题**：想造一个"会采矿、会建造、能带 20 个物品"的地面单位，`mineTier`、`buildSpeed`、`itemCapacity` 分别应该设成什么？

下一章，我们把视野拉远——行星、区块与环境方块，看一个"世界"是怎么被定义出来的。

---

## 附：本章涉及的源码文件

- `mindustry/type/UnitType.java`
- `mindustry/type/Weapon.java`
- `mindustry/entities/abilities/`（能力族）
- `mindustry/world/blocks/units/UnitFactory.java`
- `mindustry/world/blocks/units/Reconstructor.java`
- `mindustry/mod/ContentParser.java`（`unitType` 映射）
