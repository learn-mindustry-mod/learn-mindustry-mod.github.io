# DP 教程：数据补丁入门与模板库对照

> 本篇把“数据补丁（Data Patches / DP）”从零讲清楚。你不需要先会写 JSON 模组，只要会复制粘贴、改数字，就能开始改原版内容。

::: tip 一句话直觉
数据补丁就是“给现有内容打补丁”的 Hjson/JSON 文件。它不新建一整套模组，而是直接修改原版或已有模组里某个方块、单位、物品、液体、状态、天气等对象的字段。
:::

## DP 能做什么、不能做什么

数据补丁（旧称 Content Patches，v159 后更名为 Data Patches）非常适合做：

- 平衡补丁：改伤害、血量、造价、生产时间；
- 自定义游戏模式：改单位武器、工厂配方、炮塔弹药；
- 地图/服务器专属规则：同一张图在不同服务器可以有不同的数值；
- 修改贴图引用、显示名称、图标、隐藏内容等。

它 **不能** 做到：

- 添加原版没有的全新机制；
- 改变方块的类型，例如把墙变成炮塔；
- 直接重写 Java 层面的初始化逻辑；
- 部分依赖其他字段自动计算的值不会跟着更新（后面踩坑里细说）。

::: warning 注意
DP 的能力看起来接近 JSON 模组，但它不是 JSON 模组的替代品。如果你要做一个完整的新内容模组、新科技树、复杂逻辑，仍然应该写 JSON/Java 模组。
:::

## 文件放哪里

- **地图**：在地图编辑器里打开地图，按 `ESC` 打开菜单，进入 **地图信息（Map Info）-> 数据补丁（Data Patches）-> 添加（Add）**，选择你的 `.hjson` / `.json` / `.json5` 文件。
- **服务器**：把补丁文件放进服务器目录下的 `patches/` 文件夹。补丁扩展名必须是 `hjson`、`json` 或 `json5`，加载时会自动应用，并且会**排在地图自带补丁之后**。
- **重载**：服务器运行时用 `/reloadpatches` 重新加载补丁。

补丁文件里的 `name` 字段是可选的，但建议写上，方便在游戏 UI 里认出这是哪个补丁。

```hjson
// 最简单的补丁：让所有传送带血量变成 50
name: My Patch

block.conveyor.health: 50
```

## DP 基础语法

### 三层结构

数据补丁遵循固定的层级：

1. **第一层**：内容类型，如 `block`、`item`、`liquid`、`unit`、`weather`、`status`、`sector`、`planet`；
2. **第二层**：内容的内部名称，如 `conveyor`、`copper`、`dagger`。这些名称**区分大小写**；
3. **第三层**：要修改的字段和值，例如 `health: 50`。

写成嵌套对象：

```hjson
block: {
  conveyor: {
    health: 50
    // 这里可以继续写传送带的其他字段
  }
  // 这里可以写其他方块
}
// 这里可以写其他内容类型
```

如果只改一个字段，用点号简写更舒服：

```hjson
block.conveyor.health: 50
```

### 数组与序列

数组/序列（`T[]`、`Seq<T>`、`ObjectSet`）有三种常见操作：

- 按下标修改：`weapons.0.x`
- 追加元素：`weapons.+`
- 整体覆盖：`weapons: [...]`

```hjson
// 把尖刀第一把武器（下标 0）的 x 偏移改成 100
unit.dagger.weapons.0.x: 100

// 给星辉追加一把激光炮，原有武器保留
unit.flare.weapons.+: {
  x: 0
  y: 0
  reload: 10
  bullet: {
    type: LaserBulletType
    damage: 100
  }
}

// 让星辉只剩这一把武器：整体覆盖数组
unit.flare.weapons: [
  {
    x: 0
    y: 0
    reload: 10
    bullet: {
      type: LaserBulletType
      damage: 100
    }
  }
]
```

### 对象映射（Map）

有些字段是映射表，比如炮塔的 `ammoTypes`、钻头的 `drillMultipliers`。你可以直接修改某个键，或用 `"-"` 删除键：

```hjson
block.fuse.ammoTypes: {
  // 删除钛弹药
  titanium: "-"

  // 给巨浪合金换成激光弹药
  surge-alloy: {
    type: LaserBulletType
    ammoMultiplier: 1
    reloadMultiplier: 0.5
    damage: 100
    colors: ["000000", "ff0000", "ffffff"]
  }
}
```

### 物品/液体堆叠

表示“某物品/液体 + 数量”时，使用 `内部名称/数量`：

```hjson
// 让双管炮造价为 5 钛 + 20 巨浪合金
block.duo.requirements: [titanium/5, surge-alloy/20]
```

### 常用单位

- **时间**：一般用“刻（tick）”，1 秒 = 60 刻；
- **距离/尺寸**：一般用“世界单位”，1 格 = 8 世界单位；
- **颜色**：十六进制字符串，如 `"FFD580"`；
- **消耗速率**：一般写作“每刻多少单位”。

## 踩坑提示

这些坑都是实际改 DP 时最容易撞上的，先记住能省很多时间。

::: danger 最优先记住
1. **方块大小（`size`）不能改**。改了会严重破坏存档，而且很多物流方块变大后根本没法用。
2. **`mirror: true` 对武器无效**。镜像武器是在单位初始化时生成的，DP 不会重新初始化。你需要手动把 `x`、`shootX`、`flipSprite` 镜像好。
3. **单位射程不会自动重算**。只改子弹 `lifetime` / `speed` 后，`range` 和 `maxRange` 不会更新，需要手动一起改。
4. **`clipSize` 不会自动更新**。让单位/方块画更大的贴图时，记得手动调 `clipSize`。
5. **改类型不会自动更新派生字段**。例如把陆军单位改成海军单位，它仍然会溺水。
:::

其他高频坑：

- **贴图不会在补丁应用后重新加载**。例如改 `DrawRegion` 的 `name`、`suffix` 通常没反应。
- **环境静态方块只能用环境图集页里的贴图**。你可以让草地用雪地贴图，但不能让草地用路由器贴图，否则显示错误纹理。
- **提高最大生命值不会回满已有建筑/单位的血**。降低最大生命值则会立刻造成伤害，所以会看到建筑“受损”。
- **修改依赖值不会联动**。例如改了物品造价，建造时间不会自动按新造价重新计算。
- **数组“追加”和“覆盖”不一样**。追加用 `.+`，覆盖必须给整个数组 `[]`，不要混。
- **未知字段会警告而不是崩掉**。所以字段名打错时，可能只是悄悄没生效，记得看补丁的警告。
- **补丁可以炸游戏**。生成九万亿颗子弹然后报 bug 是没人理的，请保持合理。
- **重复应用补丁不会叠加**。游戏每次应用前会先撤销旧补丁。

## 顺带一提：v159 后的 DP 新增内容

v159 之后，数据补丁系统还可以在“地图/服务器”里新增内容，而不只是修改已有内容。这个新增内容系统和普通 JSON 模组格式相同，但有一些限制：

- 所有素材和内容都会带 `dp-` 前缀；
- 不支持行星、区块、科技树的新增/修改；
- 不能使用字段选择器（如 `weapons.+`），一次只能直接赋值一个字段；
- 贴图按内容名称自动加载，不能像普通补丁那样随意指定 `uiIcon`。

所以“新增内容”适合快速往地图里塞一个带前缀的新物品/方块/单位，但复杂内容仍然建议做正式模组。

## JSON 模板库 DP 对照示例

下面把 `docs/json/templates/` 里已有的内容模板逐个给出一条最小 DP 示例。它们演示的是“这个模板对应的类型/字段用 DP 怎么改”，不是唯一写法。

`common/` 下的 `mod.hjson` 和 `bundle.properties` 是模组配置与语言文件，不属于游戏内容，DP 不处理它们。

### 物品 items

#### `items/item-minimal.hjson`

```hjson
// 最小物品模板：改原版铜的颜色
item.copper.color: "FFC0CB"
```

#### `items/item-full.hjson`

```hjson
// 常用物品字段模板：一次改铜的多个属性
item.copper: {
  cost: 2
  hardness: 2
  healthScaling: 0.8
}
```

### 液体 liquids

#### `liquids/liquid-minimal.hjson`

```hjson
// 最小流体模板：改水颜色
liquid.water.color: "00BFFF"
```

#### `liquids/liquid-full.hjson`

```hjson
// 常用流体字段模板：把水调得更“像冷却液”
liquid.water: {
  heatCapacity: 0.6
  viscosity: 0.4
  coolant: true
}
```

### 方块：生产与工厂

#### `blocks/generic-crafter.hjson`

```hjson
// 通用工厂：缩短石墨压机制作时间
block.graphite-press.craftTime: 45
```

#### `blocks/drill.hjson`

```hjson
// 钻头：让机械钻头采得更快（数值越小越快）
block.mechanical-drill.drillTime: 150
```

#### `blocks/pump.hjson`

```hjson
// 液体泵：提高机械泵的抽水速率
block.mechanical-pump.pumpAmount: 0.5
```

#### `blocks/unit-factory.hjson`

```hjson
// 单位工厂：给陆军工厂追加一个生产星辉的配方
block.ground-factory.plans.+: {
  unit: flare
  requirements: [surge-alloy/10]
  time: 100
}
```

#### `blocks/separator.hjson`

```hjson
// 离心分离器：缩短分离时间
block.separator.craftTime: 40
```

#### `blocks/incinerator.hjson`

```hjson
// 焚化炉：换个火焰颜色
block.incinerator.flameColor: "FF4500"
```

### 方块：物流与分发

#### `blocks/conveyor.hjson`

```hjson
// 传送带：加快物品移动速度
block.conveyor.speed: 0.05
```

#### `blocks/router.hjson`

```hjson
// 物品路由器：加快分发速度
block.router.speed: 0.08
```

#### `blocks/junction.hjson`

```hjson
// 物品交汇点：增加缓冲容量
block.junction.capacity: 8
```

#### `blocks/sorter.hjson`

```hjson
// 物品分类器：改为反向过滤
block.sorter.invert: true
```

#### `blocks/distributor.hjson`

```hjson
// 大型分发器：加快分发速度
block.distributor.speed: 0.08
```

#### `blocks/conduit.hjson`

```hjson
// 液体管道：增加液体缓冲容量
block.conduit.liquidCapacity: 12
```

#### `blocks/liquid-router.hjson`

```hjson
// 液体路由器：增加液体缓冲容量
block.liquid-router.liquidCapacity: 30
```

#### `blocks/liquid-junction.hjson`

```hjson
// 液体交汇点：增加液体缓冲容量
block.liquid-junction.liquidCapacity: 10
```

#### `blocks/unloader.hjson`

```hjson
// 物品卸载器：提高卸载速度
block.unloader.speed: 0.25
```

#### `blocks/payload-conveyor.hjson`

```hjson
// 载荷传送带：缩短载荷移动所需时间（刻）
block.payload-conveyor.moveTime: 30
```

### 方块：存储

#### `blocks/container.hjson`

```hjson
// 小型存储箱：提高物品容量
block.container.itemCapacity: 500
```

#### `blocks/vault.hjson`

```hjson
// 大型仓库：提高物品容量
block.vault.itemCapacity: 3000
```

### 方块：电力

#### `blocks/power-generator.hjson`

```hjson
// 通用发电机：提高燃烧发电机的发电量
block.combustion-generator.powerProduction: 5
```

#### `blocks/solar-generator.hjson`

```hjson
// 太阳能发电机：提高发电量
block.solar-panel.powerProduction: 0.4
```

#### `blocks/thermal-generator.hjson`

```hjson
// 热能发电机：提高发电量
block.thermal-generator.powerProduction: 2.5
```

#### `blocks/consume-generator.hjson`

```hjson
// 消耗型发电机：延长一份燃料的发电时间
block.combustion-generator.itemDuration: 90
```

#### `blocks/power-node.hjson`

```hjson
// 电力节点：提高可连接节点数量
block.power-node.maxNodes: 20
```

#### `blocks/power-consumer.hjson`

```hjson
// 电池模板：改生命值是最安全的示例
block.battery.health: 400
```

### 方块：防御

#### `blocks/wall.hjson`

```hjson
// 墙壁：提高铜墙血量
block.copper-wall.health: 500
```

#### `blocks/door.hjson`

```hjson
// 门：提高血量
block.door.health: 400
```

#### `blocks/force-projector.hjson`

```hjson
// 力场投影仪：扩大护盾半径
block.force-projector.radius: 100
```

#### `blocks/mend-projector.hjson`

```hjson
// 修复投影仪：扩大修复范围
block.mend-projector.range: 90
```

### 方块：炮塔

#### `blocks/turret.hjson`

```hjson
// 物品弹药炮塔：直接改双管造价，顺便复习 ItemStack 写法
block.duo.requirements: [titanium/5, surge-alloy/20]
```

#### `blocks/turret-bullet.hjson`

```hjson
// 带自定义子弹的炮塔：给散射炮的 graphite 弹药换参数
block.scatter.ammoTypes: {
  graphite: {
    speed: 4
    damage: 12
    reloadMultiplier: 0.8
  }
}
```

#### `blocks/power-turret.hjson`

```hjson
// 电力炮塔：缩短长枪的装填时间
block.lancer.reload: 50
```

#### `blocks/point-defense-turret.hjson`

```hjson
// 点防御炮塔：扩大拦截范围
block.parallax.range: 120
```

### 方块：环境与逻辑

#### `blocks/floor.hjson`

```hjson
// 地板：让沙地减速效果变弱
block.sand.speedMultiplier: 0.8
```

#### `blocks/ore-block.hjson`

```hjson
// 矿物地板：增加钛矿贴图变体
block.ore-titanium.variants: 4
```

#### `blocks/environment-wall.hjson`

```hjson
// 环境墙：增加沙墙贴图变体
block.sand-wall.variants: 3
```

#### `blocks/logic-block.hjson`

```hjson
// 逻辑处理器：提高每刻可执行指令数
block.logic-processor.instructionsPerTick: 2
```

### 单位 units

#### `units/unit-minimal.hjson`

```hjson
// 最小单位模板：提高尖刀血量
unit.dagger.health: 400
```

#### `units/unit-weapon.hjson`

```hjson
// 带武器的单位模板：给尖刀追加一把激光武器
unit.dagger.weapons.+: {
  reload: 20
  bullet: {
    type: LaserBulletType
    damage: 100
  }
}
```

### 状态效果 statuses

#### `statuses/status-effect.hjson`

```hjson
// 状态效果：让“缓慢”减速更狠
status.slow.speedMultiplier: 0.5
```

### 行星与区块 planets / sectors

#### `planets/planet-minimal.hjson`

```hjson
// 行星模板：把塞普罗半径调大（注意联动字段可能不会自动更新）
planet.serpulo.radius: 2.5
```

#### `planets/sector-minimal.hjson`

```hjson
// 区块模板：调整起始区块难度
sector.ground-zero.difficulty: 1
```

### 天气 weathers

#### `weathers/weather-minimal.hjson`

```hjson
// 天气模板：让雨天持续时间更长
weather.rain.duration: 7200
```

### 特效 effects

`effects/effect-minimal.hjson` 比较特殊：当前游戏没有 `effect` 这个可独立加载的内容类型，所以不能写 `effect.xxx` 去“改一个特效”。模板里的粒子参数一般用于其他内容里的 `effect` 字段。DP 里可以这样把某个已有特效替换成另一个已有特效：

```hjson
// 把尖刀武器子弹的命中特效换成爆炸
unit.dagger.weapons.0.bullet.hitEffect: "explosion"
```

## 小结

DP 的套路其实很固定：

1. 确定你要改的内容类型：`block`、`item`、`liquid`、`unit`……；
2. 确定内容内部名称；
3. 确定字段路径；
4. 如果是数组要分清下标修改、`.+` 追加、`[]` 覆盖；
5. 看游戏内“查看内容字段”或 Java 源码确认字段名和类型。

配合上面模板库的对照示例，你已经可以快速把模板里的 JSON 字段翻译成 DP 补丁了。下一节可以继续看 [Hjson 模板库](./templates/index)，把 DP 和正式 JSON 模组放在一起对比学习。
