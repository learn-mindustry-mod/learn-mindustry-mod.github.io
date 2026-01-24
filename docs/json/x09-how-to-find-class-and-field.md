# 如何找到自己需要的类和字段

写 JSON 模组的尽头就是“查源码”。这一节给出一套稳定的检索思路，让你能快速定位字段与用法，并理解 JSON 到底支持什么写法。

## 从名字反推内部名

第一步永远是找到内部名。原版的显示名在 `core/assets/bundles/bundle_zh_CN.properties` 里，例如“幻型”对应 `unit.poly`，“机械钻头”对应 `block.mechanical-drill`，“石墨压缩机”对应 `block.graphite-press`。内部名就是 JSON 文件名，或者 Java 里 `new Xxx("name")` 的 `name`。拿到内部名，你就能准确搜索源码。

如果你不知道该内容属于哪一类，先看内部名的前缀：`unit.*`、`block.*`、`item.*`、`liquid.*`。然后去对应的内容定义文件查它的“原版配置”。原版内容大多在 `core/src/mindustry/content/` 目录下，比如 `Blocks.java`、`UnitTypes.java`、`Items.java`、`Liquids.java`。

## 先看原版内容，再看类定义

拿到内部名后，先在 `core/src/mindustry/content/` 里搜索它是怎么被配置的。这样你能看到最典型的字段组合。例如你搜索 `graphite-press`，就能看到“石墨压缩机”是 `GenericCrafter`，并且它设置了 `craftTime`、`outputItem` 与消耗项。

接下来再去类定义文件中查看字段与逻辑。方块类通常在 `core/src/mindustry/world/blocks/**`，单位与物品类在 `core/src/mindustry/type/**`。阅读类定义可以回答两个关键问题：这个字段是什么类型？这个字段在什么时候被使用？

当你需要理解“运行时逻辑”时，重点看 `load()`（贴图命名规则）、`setStats()`（数据库面板如何显示）、`updateTile()`（方块每帧逻辑）、`init()`（初始化与额外配置）以及 `consumes` 相关方法（输入的解析与生效条件）。这些位置往往直接揭示“字段如何生效”。

## 用 ContentParser 验证 JSON 支持

即使类里有字段，也不代表 JSON 一定能写。`ContentParser` 是 JSON 解析器，它决定了哪些写法是合法的。比如 `consumes` 并不是普通字段，而是被 `ContentParser` 专门解析的“消耗器语法”；`Effect`、`BulletType`、`DrawPart` 等复杂对象也有专门的解析逻辑。

当你怀疑“字段写了但没生效”，优先查 `core/src/mindustry/mod/ContentParser.java`：看看它是否读取了该字段，是否对类型做了特殊处理。很多“JSON 写法不对”的问题，都能在这里找到答案。

## 常用检索方式

如果你习惯命令行，可以直接用 `rg` 搜索内部名或字段。例如：

```bash
rg "graphite-press" core/src/mindustry/content -n
rg "class GenericCrafter" core/src/mindustry/world/blocks -n
```

第一条会定位原版内容配置，第二条会定位类定义。这样一来，你就能把“字段长什么样”与“字段怎么运行”串起来看。

## 内部名与冲突

JSON 引用内容时，会先尝试 `modName-内部名`，找不到才去找原版内部名。因此，若你的内部名与原版冲突，会出现覆盖或解析失败。最安全的做法是给自定义内容起一个“有前缀”的内部名，或者在 `mod.json` 中使用独特的 `name`。

## 小结

找到字段的流程很简单：先找内部名，再看原版配置，然后看类定义，最后用 `ContentParser` 验证 JSON 写法。熟练之后，你会发现“查源码”其实比找模板更快，也更稳。

