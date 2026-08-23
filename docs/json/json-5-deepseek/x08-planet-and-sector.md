# 行星、区块、生成器、环境方块

> ***"方块组成基地，环境组成世界，行星组成宇宙。"***

前七章我们都在"造东西"，这一章我们"造世界"：**环境方块**（地面、矿石、墙——地图的砖瓦）、**行星（Planet）**（那个在太空里转的球）、**区块（SectorPreset）**（行星上的一块战区）、**生成器（Generator）**（怎么把空地生成成地图）。

学完这一章，你就能定义自己的地面、矿脉和行星，甚至挂一块专属战区。

**本章涉及的源码**：`mindustry/world/blocks/environment/`（`Floor`、`OreBlock`、`StaticWall`）、`mindustry/type/Planet.java`、`mindustry/type/SectorPreset.java`、`mindustry/maps/generators/`、`mindustry/mod/ContentParser.java`。

---

## 环境方块：地图的砖瓦

环境方块和普通方块一样是 `Block`，但它们**不是建筑**，而是组成地图地表的东西。最常见三类：

### 地表（Floor）

`type: Floor`，定义一种可以踩、可以走的地面（源码 `Floor.java`）：

```hjson
{
  type: Floor
  name: 强化沙地
  speedMultiplier: 0.8
  dragMultiplier: 1.1
  walkEffect: sandSmoke
  status: burning
  statusDuration: 60
}
```

常用字段：

| 字段 | 说明 |
|---|---|
| `speedMultiplier` / `dragMultiplier` | 走过时的速度/阻力倍率 |
| `damageTaken` | 站在上面每 tick 受到的伤害 |
| `drownTime` | 淹死所需时间（0 关闭） |
| `status` / `statusDuration` | 站在上面施加的状态 |
| `liquidDrop` | 可被泵抽取的流体（上一章泵的地面来源） |
| `isLiquid` | 是否为液体地表 |
| `walkEffect` / `walkSound` | 走上去的特效/音效 |
| `edge` | 边缘接缝用的地表名 |

### 矿石（OreBlock）

`type: OreBlock`，一种覆盖在地表上的矿脉，被钻头挖出物品（源码 `OreBlock.java`）：

```hjson
{
  type: OreBlock
  name: 强化铜矿
  itemDrop: my-first-mod-enriched-copper
  variants: 3
}
```

`itemDrop` 就是钻头挖出来的物品，`variants` 是矿石贴图的变体数量（自动找 `<name>1`、`<name>2`……）。

### 墙（Wall / StaticWall）

`type: Wall`（或 `StaticWall`），天然的障碍物：

```hjson
{
  type: Wall
  name: 强化岩墙
  size: 2
  variants: 2
}
```

`variants` 用于多张随机纹理，让自然景观不那么重复。这类方块通常还会配一个 `type: TreeBlock` 的装饰物（树、岩石），玩法类似，不再赘述。

::: tip 环境方块不参与科技
环境方块默认 `destructible = false`、不在科技树里，它们是"世界的底色"，不是"玩家的建筑"。所以不需要 `requirements`，也不需要 `research`。
:::

---

## 行星（Planet）：会转的球

行星定义在 `content/planets/` 下，对应源码类 `Planet`。一个最小示例：

```hjson
{
  type: Planet
  name: 强化星
  radius: 1.2
  generator: {
    type: AsteroidGenerator
  }
  rotateTime: 60
}
```

关键字段（源码 `Planet.java` + `ContentParser`）：

| 字段 | 说明 |
|---|---|
| `parent` | 母行星/太阳的名字（绕谁转），空则绕太阳 |
| `radius` | 星球半径（默认 1） |
| `sectorSize` | 区块网格的边长（生成区块用） |
| `generator` | 地形生成器（见下一节） |
| `rotateTime` | 自转周期（秒），决定昼夜 |
| `defaultEnv` | 默认环境标志（`terrestrial`、`oxygen`…） |
| `defaultAttributes` | 默认地块属性（`heat`、`spores`…） |
| `accessible` | 是否在行星列表里显示 |
| `atmosphereColor` / `iconColor` | 大气层/图标颜色 |

注意 `radius` 和 `sectorSize` 是 `ContentParser` 里的构造参数，会先被取出再读剩余字段。

---

## 区块（SectorPreset）：一块战区

区块定义在 `content/sectors/` 下，是行星上的一块**可游玩地图**。它引用一个地图文件（`.msav`），并挂到行星的某个格子上：

```hjson
{
  type: SectorPreset
  name: 强化前线
  planet: 强化星
  sector: 15
  captureWave: 20
  difficulty: 5
  rules: {
    attackMode: true
  }
}
```

- `planet`：挂到哪个行星（内部名）；
- `sector`：行星上的**格子编号**（必填，源码会检查必须是数字）；
- `captureWave`：占领此区块需要守住的波次；
- `difficulty`：难度 0–10；
- `rules`：一整个自定义规则的 JSON 对象（`attackMode`、`waveTime`…）。

::: tip 区块需要一个地图文件
`SectorPreset` 默认用一个 `FileMapGenerator` 去读**同名 `.msav` 地图文件**（放在模组的 `maps/` 目录）。所以一个完整的自定义战区 = `content/sectors/xxx.json` + `maps/xxx.msav`。
:::

---

## 生成器（Generator）：空地的魔法

行星的 `generator` 决定"落在行星上时，地形长什么样"。这里有个重要的现实：**纯 JSON 只能用一个现成的基础生成器 `AsteroidGenerator`**（源码 `ContentParser` 里 `PlanetGenerator` 的解析写死了它）：

```hjson
generator: {
  type: AsteroidGenerator
}
```

想做"像塞普罗那样有水域、有矿脉、有山脉"的自定义生成器，就得**写 Java**——这正好是我们 x0C 要讲的主题。JSON 的能力边界到这里就画上了一条线：环境方块和行星外壳能 JSON 定义，但**复杂地形生成需要 Java 介入**。

---

## 效果验证

加上环境方块后，`content/blocks/`（环境方块也放这里）多了地表、矿石、墙。进沙盒地图，用地形编辑器刷几块你的自定义地面和矿脉，再用行星视图看看你的自定义星球。

---

## 小结

这一章我们造出了"世界的骨架"：**环境方块**（`Floor`/`OreBlock`/`Wall`，地图的砖瓦）、**行星**（`Planet`，会转的球）、**区块**（`SectorPreset`，一块战区）、**生成器**（`generator`，地形来源）。同时我们也摸到了 JSON 的天花板：**复杂生成器必须靠 Java**——这是自然的过渡，下一站就是代码。

**思考题**：想造一种"走上去会着火、还能被泵抽水"的地表，`Floor` 需要哪两个字段？想让行星上出现一个需要守 30 波才能占领的战区，`SectorPreset` 需要哪个字段？

下一章，我们换一种学法——不再逐类讲解，而是教你**怎么自己找到**任何类的字段。

---

## 附：本章涉及的源码文件

- `mindustry/world/blocks/environment/Floor.java`
- `mindustry/world/blocks/environment/OreBlock.java`
- `mindustry/world/blocks/environment/StaticWall.java`
- `mindustry/type/Planet.java`
- `mindustry/type/SectorPreset.java`
- `mindustry/maps/generators/AsteroidGenerator.java`
- `mindustry/mod/ContentParser.java`
