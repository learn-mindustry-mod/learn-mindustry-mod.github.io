# 如何找到自己需要的类和字段

写JSON模组的尽头就是“查源码”。这一节给出一套常用的检索思路，保证你能快速定位字段与用法。

## 先确定内容类型

- 方块：`content/blocks`，类通常在`mindustry.world.blocks.*`；
- 物品/流体/单位：`mindustry.type.*`；
- 状态/天气/行星/区块：`mindustry.type.*`与`mindustry.maps.*`。

如果不知道类型，先从原版内容名入手。

## 从原版名字反推

- **显示名**在`core/assets/bundles/bundle_zh_CN.properties`里；
- **内部名**就是JSON文件名或Java里的`new Xxx("name")`。

例如：

- “幻型”对应`unit.poly`；
- “机械钻头”对应`block.mechanical-drill`；
- “硅冶炼厂”对应`block.silicon-smelter`。

有了内部名，就能在源码里搜索：

- `core/src/mindustry/content/*`里是原版内容定义；
- `core/src/mindustry/world/blocks/**`里是具体类；
- `core/src/mindustry/type/**`里是物品、流体、单位等类型。

## 看字段的三种方法

1. **查类定义**：直接看字段列表（最可靠）；
2. **查原版内容**：看原版如何设置；
3. **查解析器**：看看JSON到底支持哪些写法（`ContentParser`）。

> 如果字段名直观，多数情况下“按字面理解”就是正确答案。

## 常用检索关键词

- `type`：字段名称和JSON写法；
- `load()`：贴图命名规则；
- `setStats()`：统计面板显示逻辑；
- `updateTile()`：核心工作逻辑；
- `consumes`：消耗器解析与写法。

## JSON里的内部名规则

- `item.xxx` / `liquid.xxx` / `block.xxx` / `unit.xxx` 里的`xxx`就是内部名；
- JSON文件名就是内部名；
- `modName-内部名`是完整内部名（带前缀）。

## 小结

- 找不到字段就看类定义；
- 不确定写法就看原版内容；
- JSON解析逻辑看`ContentParser`。
