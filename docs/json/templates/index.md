# JSON 模板库

> ***“授人以鱼，不如授人以渔；授人以模板，不如授人以带注释的模板。”***

这里是 JSON 模组开发的模板库。所有模板统一使用 **Hjson** 格式，并在字段上方添加了翻译后的 Javadoc 风格注释，方便你理解每个字段的含义。

📖 [查看全部模板内容](./showcase)

::: tip 使用方法
1. 根据你要创建的内容类型，进入对应分类目录；
2. 复制 `.hjson` 文件到你的模组 `content/` 对应目录；
3. Mindustry 支持 Hjson，因此**保留注释也可以直接使用**；
4. 如果保存为严格 `.json`，需要删除注释并把未加引号的键补上双引号；
5. 根据注释调整字段和数值；
6. 导入游戏验证效果。
:::

::: warning 注意
Mindustry 原生支持 `.hjson` 文件，模板中的注释不会影响加载。若你最终需要发布严格 JSON 版本，请再转换为 `.json`。
:::

## 目录

### common

- `common/mod.hjson`：模组配置文件 `mod.json` 模板
- `common/bundle.properties`：多语言文件模板

### items

- `items/item-minimal.hjson`：最小物品模板
- `items/item-full.hjson`：常用物品字段模板

### liquids

- `liquids/liquid-minimal.hjson`：最小流体模板
- `liquids/liquid-full.hjson`：常用流体字段模板

### blocks

#### 生产与工厂

- `blocks/generic-crafter.hjson`：通用工厂
- `blocks/drill.hjson`：钻头
- `blocks/pump.hjson`：液体泵
- `blocks/unit-factory.hjson`：单位工厂
- `blocks/separator.hjson`：离心分离器
- `blocks/incinerator.hjson`：焚化炉

#### 物流与分发

- `blocks/conveyor.hjson`：传送带
- `blocks/router.hjson`：物品路由器
- `blocks/junction.hjson`：物品交汇点
- `blocks/sorter.hjson`：物品分类器
- `blocks/distributor.hjson`：大型分发器
- `blocks/conduit.hjson`：液体管道
- `blocks/liquid-router.hjson`：液体路由器
- `blocks/liquid-junction.hjson`：液体交汇点
- `blocks/unloader.hjson`：物品卸载器
- `blocks/payload-conveyor.hjson`：载荷传送带

#### 存储

- `blocks/container.hjson`：小型存储箱
- `blocks/vault.hjson`：大型仓库

#### 电力

- `blocks/power-generator.hjson`：通用发电机
- `blocks/solar-generator.hjson`：太阳能发电机
- `blocks/thermal-generator.hjson`：热能发电机
- `blocks/consume-generator.hjson`：消耗型发电机
- `blocks/power-node.hjson`：电力节点
- `blocks/power-consumer.hjson`：电力消耗/电池方块

#### 防御

- `blocks/wall.hjson`：墙壁
- `blocks/door.hjson`：门
- `blocks/force-projector.hjson`：力场投影仪
- `blocks/mend-projector.hjson`：修复投影仪

#### 炮塔

- `blocks/turret.hjson`：物品弹药炮塔
- `blocks/turret-bullet.hjson`：带自定义子弹的炮塔
- `blocks/power-turret.hjson`：电力炮塔
- `blocks/point-defense-turret.hjson`：点防御炮塔

#### 环境与逻辑

- `blocks/floor.hjson`：地板
- `blocks/ore-block.hjson`：矿物地板
- `blocks/environment-wall.hjson`：环境墙
- `blocks/logic-block.hjson`：逻辑处理器

### units

- `units/unit-minimal.hjson`：最小单位模板
- `units/unit-weapon.hjson`：带武器的单位模板

### statuses

- `statuses/status-effect.hjson`：状态效果模板

### planets

- `planets/planet-minimal.hjson`：行星模板
- `planets/sector-minimal.hjson`：区块模板

### weathers

- `weathers/weather-minimal.hjson`：天气模板

### effects

- `effects/effect-minimal.hjson`：特效/粒子效果模板

## 维护约定

- 所有模板只提供 `.hjson` 版本；
- 所有内容模板均包含 `name`、`description`、`details` 三大字段；
- 每个字段上方使用 `//` 添加翻译后的 Javadoc 注释；
- 注释应说明字段作用、单位、可选性、默认值；
- 模板中的示例内容统一使用原版内部名称；
- 模板应保持“最小可运行”和“常用字段”两个层次。
