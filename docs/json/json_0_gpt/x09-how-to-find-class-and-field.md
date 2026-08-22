# 如何找到自己需要的类和字段

写 JSON 模组的尽头就是“查源码”。这是因为 JSON 的字段并不是凭空存在的，它们都来自 Java 类中的字段定义。只要你能准确找到“原版是怎么写的”，就能知道某个字段是否存在、应该怎么写、具体起到什么作用。更重要的是，源码能帮你避免“教程过时”的坑：很多老教程基于旧版本，字段早已改名或被废弃，只有源码才是当前版本的最终答案。

## 从显示名反推内部名

第一步永远是找到内部名。原版的显示名在 `core/assets/bundles/bundle_zh_CN.properties` 里，例如“幻型”对应 `unit.poly`，“机械钻头”对应 `block.mechanical-drill`，“石墨压缩机”对应 `block.graphite-press`。内部名就是 JSON 文件名，或者 Java 里 `new Xxx("name")` 的 `name`。拿到内部名，你就能精准搜索源码。

更实际的做法是“先搜中文名，再看键名”。例如你知道“机械钻头”，就直接在 `bundle_zh_CN.properties` 里搜索它，会得到 `block.mechanical-drill.name = 机械钻头`。这个键名里的 `block.mechanical-drill` 就是你要找的内部名。如果你看到多个匹配项，就看前缀：`block.`、`unit.`、`item.`、`liquid.` 会告诉你内容类型。

```bash
rg -n "机械钻头" core/assets/bundles/bundle_zh_CN.properties
```

如果你要核对英文名或其他语言包，同目录下还有 `bundle.properties` 与其他语言文件。模组也可以提供自己的 `bundle_zh_CN.properties` 来添加翻译。记住：翻译文件只影响“显示名”，真正的内部名还是由内容文件或 Java 里 `new Xxx("name")` 决定。

如果你不知道该内容属于哪一类，先看内部名前缀：`unit.*`、`block.*`、`item.*`、`liquid.*`。然后去对应的内容定义文件查它的“原版配置”。原版内容大多在 `core/src/mindustry/content/` 目录下，比如 `Blocks.java`、`UnitTypes.java`、`Items.java`、`Liquids.java`。这些文件的作用是“把内容从类变成具体实例”，所以它们是学习字段组合的最好入口。

如果连中文名都找不到，直接看内容文件名也是办法。JSON 文件名通常就是内部名，例如 `content/blocks/xxx.json` 的 `xxx` 就是内部名。对模组而言，`content/` 目录比语言包更直观，因为它不受翻译影响。

## 先看原版配置，再看类定义

拿到内部名后，先在 `core/src/mindustry/content/` 里搜索它是怎么被配置的。这样你能看到最典型的字段组合。例如你搜索 `graphite-press`，就能看到“石墨压缩机”是 `GenericCrafter`，并且它设置了 `craftTime`、`outputItem` 与消耗项。原版配置告诉你“最常见的写法是什么”。

再比如你搜索 `mechanical-drill`，会看到它是 `Drill` 类型，并且只改了 `tier`、`drillTime` 等少量字段。这种“只改关键字段”的写法其实最值得学习，因为它能让你理解“哪些字段是必须写的，哪些可以沿用默认值”。如果你一开始就把所有字段都写满，反而很难判断哪些值真正生效。

涉及研究树时，可以顺便看看 `core/src/mindustry/content/TechTree.java` 和 `Objectives` 相关类。很多 `research` 的 `objectives` 类型都在这里定义，理解它们能让你更准确地写解锁条件，避免“研究树显示了但无法解锁”的问题。

接下来再去类定义文件中查看字段与逻辑。方块类通常在 `core/src/mindustry/world/blocks/**`，单位与物品类在 `core/src/mindustry/type/**`。阅读类定义可以回答两个关键问题：这个字段是什么类型？这个字段在什么时候被使用？你会发现很多字段只影响 UI 或统计面板，而真正影响逻辑的字段往往集中在 `updateTile()` 与 `init()`。

别忽略内部类。很多方块会有 `Build` 子类（比如 `DrillBuild`、`GenericCrafterBuild`），里面保存的是“运行时状态”，例如当前进度、缓冲物品、液体等。这些字段不应该写在 JSON 里，但它们决定了“字段为什么这样生效”。当你理解了 `Build` 的逻辑，就能更准确判断哪些字段是真正影响产量或行为的。

当你需要理解“运行时逻辑”时，重点看 `load()`（贴图命名规则）、`setStats()`（数据库面板如何显示）、`updateTile()`（方块每帧逻辑）、`init()`（初始化与额外配置）以及 `consumes` 相关方法（输入的解析与生效条件）。这些位置往往直接揭示“字段如何生效”。

如果你关心 UI 表现，别忽略 `setBars()`：很多“效率条”“液体条”就是在这里配置的。你还会看到一些字段只用于 `setStats()` 或 `setBars()`，它们不会改变逻辑，但会改变玩家对方块强度的判断。理解这一点很重要，因为你可以通过调整展示字段来引导玩家，而不用改动真正的数值机制。

## 用 ContentParser 验证 JSON 支持

即使类里有字段，也不代表 JSON 一定能写。`ContentParser` 是 JSON 解析器，它决定了哪些写法是合法的。比如 `consumes` 并不是普通字段，而是被 `ContentParser` 专门解析的“消耗器语法”；`Effect`、`BulletType`、`DrawPart` 等复杂对象也有专门的解析逻辑。如果你看到字段在类里存在，但写在 JSON 里没效果，就要怀疑解析器是否支持。

当你怀疑“字段写了但没生效”，优先查 `core/src/mindustry/mod/ContentParser.java`：看看它是否读取了该字段，是否对类型做了特殊处理。很多“JSON 写法不对”的问题，都能在这里找到答案。例如 `BulletType` 支持字符串（引用原版子弹）、数组（组合为 `MultiBulletType`）、对象（通过 `type` 指定子类），这些差异都写在解析器里。

同样的逻辑也适用于 `drawer`、`parts`、`research` 等复杂对象。如果解析器没有对应的分支，你在 JSON 里写再多也不会生效。最典型的例子是 `type`：当你省略 `type` 时，解析器会使用默认类；当你写了 `type`，它才会去实例化对应子类。这一点在 `Effect`、`DrawPart`、`ShootPattern` 等对象上尤其明显。

还要注意“字段类型是否可序列化”。像 `Boolf`、`Func` 这种函数类型，或 `UnitSorts.closest` 这样的静态方法，JSON 是写不进去的，除非解析器提供了特殊语法。你在类里看到这些字段时，要先判断“它是不是一个普通值”；如果不是，就需要 JS/Java 来接管。

解析器通常只会写入 `public` 字段，`private`、`protected` 或标注为运行时状态的字段不会被 JSON 读取。即使字段是 `public`，如果它被 `transient` 或特殊逻辑覆盖，也可能“写了看不到效果”。这就是为什么“看类定义 + 看解析器”这两步缺一不可。

## 理解字段类型，才能写对 JSON

字段的类型决定写法。`int`、`float`、`boolean` 这类基础类型很好理解，直接写数字或 true/false 即可。复杂类型则需要特别注意：`ItemStack` 可以写成 `"copper/10"`，也可以写成 `{ "item": "copper", "amount": 10 }`；`LiquidStack` 也支持 `"water/0.1"` 的简写。`Seq` 或数组通常写成 JSON 数组。`Effect` 可以用字符串或对象，`BulletType` 可以用字符串或对象。

枚举也是常见类型，例如 `category`、`env` 或一些开关状态。枚举字段通常用字符串写（大小写要和源码一致），如果字段是“多个标志组合”，解析器可能支持数组或位运算。遇到这类字段时，最稳妥的方式还是去 `ContentParser` 看具体支持哪种写法。

内容引用字段（`Item`、`Liquid`、`Block`、`UnitType` 等）一定要写内部名，而不是显示名。你在 JSON 里写“铜”并不会被自动识别成 `copper`，必须使用内部名 `copper`。如果你忘了内部名，就回到 `bundle_zh_CN.properties` 查键名，这是最稳妥的来源。

内部名的拼写也要注意，原版大量使用连字符（例如 `mechanical-drill`），模组也常用统一前缀。最稳妥的做法是用 `rg --files` 列出 `content/` 目录的文件名，再复制粘贴进 JSON，避免拼写错误导致解析失败。

如果你看到字段类型是 `Seq<ItemStack>` 或 `ItemStack[]`，就应该优先考虑数组写法；如果字段类型是 `ObjectMap`，通常会在 JSON 里写成“键值映射”。这些规律可以在解析器里得到验证。

除了看原版，还可以从成熟模组里“反推写法”。例如“饱和火力 3.3.0”的“离子钻头”同时使用 `consumes.power` 与 `consumes.liquid`，并把液体消耗写成对象形式来支持 `optional` 与 `booster`。这种配置方式在 `ContentParser` 里是明确支持的，因此你完全可以把它当成“真实可用的模板”，再根据自己的平衡做改动。

## 常用检索方式

如果你习惯命令行，可以直接用 `rg` 搜索内部名或字段。例如：

```bash
rg "graphite-press" core/src/mindustry/content -n
rg "class GenericCrafter" core/src/mindustry/world/blocks -n
```

第一条会定位原版内容配置，第二条会定位类定义。这样一来，你就能把“字段长什么样”与“字段怎么运行”串起来看。很多复杂字段其实只是“从原版抄一个，再改数值”的问题。

查字段时别只盯着当前类。很多基础字段其实来自父类，比如 `Block`、`PowerBlock`、`LiquidBlock`，或者 `UnitType` 的上层接口。你在子类里找不到字段时，可以沿着 `extends` 往上找，或者直接搜索字段名（如 `rg -n "drillTime" core/src/mindustry/world`）。这一步很关键，因为 JSON 能写的字段往往分散在继承链上。

同样地，`*Build` 内部类也很重要。方块的“运行时逻辑”很多写在 `updateTile()` 的 `Build` 版本里，字段有时只在 `Build` 中使用。理解这一点后，你会更容易区分“配置字段”和“运行时状态”。

如果你想追踪某个字段是如何显示在数据库面板上的，可以用 `rg -n "setStats" core/src/mindustry/world/blocks` 查找统计展示，再配合 `Stat.*` 字段定位具体显示名。对 UI 相关问题（比如某个数值显示不对）来说，这一步比盲目试数值更有效。

另外，很多“是否生效”取决于开关字段，比如 `hasPower`、`hasLiquids`、`hasItems`、`update`、`sync` 等。这些字段往往在 `init()` 里被检查，如果没开启，对应系统就不会工作。遇到“字段写了但不动”的情况，先确认这些开关是否被设置。

如果你想了解“原版成本与产量的常见比例”，可以在 `Blocks.java` 里搜索 `requirements` 和 `outputItem` 的组合。这样做比凭感觉调整更稳，尤其是当你想让模组与原版难度保持一致时。

很多老问题其实是“字段记不住”。建议你在熟悉后做一份自己的速查表，把常用字段的用途和默认值记下来。这样比反复翻源码更高效，也能避免“同一个坑踩很多次”。

最后提醒一点：数据库面板显示的数值不一定就是运行时的真实值。很多数值是 `setStats()` 按“理论值”计算出来的，而运行时会受到效率、输入与环境影响。查源码时把 `setStats()` 与 `updateTile()` 对照起来看，才能判断“显示值”和“实际值”的差距。

## 内部名与冲突

JSON 引用内容时，会先尝试 `modName-内部名`，找不到才去找原版内部名。因此，若你的内部名与原版冲突，会出现覆盖或解析失败。最安全的做法是给自定义内容起一个“有前缀”的内部名，或者在 `mod.json` 中使用独特的 `name`，避免与其他模组冲突。

这里的 `modName` 指的是 `mod.json` 里的 `name` 字段，而不是 `displayName`。这意味着两个模组即使显示名不同，只要 `name` 相同，就会产生前缀冲突。引用其他模组内容时，也要使用对方的 `modName-内部名`，否则解析器会优先解析为当前模组或原版内容。

如果你要覆盖原版内容，文件名必须与原版内部名一致，并且清楚自己会影响哪些玩法。覆盖往往是“全局生效”的，一旦修改了产量或伤害，所有地图都会受到影响。除非你真的想重写原版，否则更推荐用新内部名创建“并存内容”。

## 小结

找到字段的流程很简单：先找内部名，再看原版配置，然后看类定义，最后用 `ContentParser` 验证 JSON 写法。熟练之后，你会发现“查源码”其实比找模板更快，也更稳。把源码、解析器与模组配置对照起来，几乎所有字段问题都能被定位。每次查一次，就会积累一套自己的检索习惯，最后形成稳定的排查流程，效率也会越来越高，实践越多越熟，也更稳妥、更安心。
