# 如何找到自己需要的类和字段

> ***"授人以鱼，不如授人以渔。"***

前八章我都是"直接告诉你字段"，这一章反过来：教你**自己怎么查**。因为 Mindustry 的方块、单位、子弹有上千个字段，没人能全记住——真正的大佬靠的是一套"反查源码"的方法。掌握它，你就能脱离教程，独立写出任何内容。

**本章借鉴**：`docs/java/2-content/a-how-to-find-class.md` 的结论，并结合 JSON 模组的实际流程。

---

## 核心思路：JSON 字段 = Java 字段

这是最根本的一条认知，值得放在最前面：

::: tip JSON 字段就是 Java 类的字段
你写在 JSON 里的每个字段名，本质上都是某个 Java 类的**公开字段（public field）**。`ContentParser` 通过反射，把你 JSON 里的 `"drillTime": 45` 翻译成对 `Drill.drillTime = 45` 的赋值。所以——**只要找到对应的 Java 类，翻它的字段声明，就等于拿到了 JSON 字段表。**
:::

这意味着"查字段"这个任务，被简化成了"查类 → 读字段"两步。下面就是这两步的具体做法。

---

## 第一步：从原版内容反查到类

想造一个"类似原版爆破钻头的东西"，先找到原版爆破钻头的类。

**流程**：

1. **拿到它的内部名（`name`）**。在游戏里，把鼠标悬停或点开方块的统计面板，本地化名称下方通常就是 `name`。比如初代核心是 `core-shard`，机械钻头是 `mechanical-drill`。移动版不显示？就去 `core/assets/bundle/bundle_zh_CN.properties` 里搜中文译名，键名里就藏着 `name`。

2. **在内容加载类里搜这个 `name`**。原版所有被注册的内容，其加载类都在 `mindustry.content` 包下：

| 文件 | 内容 |
|---|---|
| `Blocks.java` | 原版所有方块（含地板、覆盖层） |
| `Items.java` | 原版所有物品 |
| `Liquids.java` | 原版所有流体 |
| `UnitTypes.java` | 原版所有单位 |
| `StatusEffects.java` | 原版所有状态效果 |
| `Fx.java` | 原版大部分特效 |
| `Planets.java` / `SectorPresets.java` | 原版所有行星 / 区块 |
| `Weathers.java` | 原版所有天气 |
| `TechTree.java` | 科技树工具类 |

3. **顺着 `new Xxx("name"){...}` 找到类**。在 `Blocks.java` 里搜 `mechanical-drill`，你会看到类似：

```java
drill = new Drill("mechanical-drill"){{
    requirements(...);
    ...
}};
```

那个 `new Drill(...)` 里的 `Drill`，就是你要找的类。

4. **打开 `Drill.java`，读字段**。它的每个 `public` 字段（`tier`、`drillTime`、`liquidBoostIntensity`……）都能直接写进 JSON。Javadoc（`/** ... */` 注释）就是字段的说明书，大多数字段都有详细解释。

---

## 第二步：读字段的三种"说明书"

找到类之后，怎么知道某个字段是干嘛的？三个渠道：

### 1. Javadoc（首选）

形如 `/** 挖一个矿的耗时 */` 的多行注释。`Block`、`BulletType`、`UnitType` 这些字段大户的 Javadoc 都很详细。没有 Javadoc 的，要么是 Anuke 偷懒，要么字段名已经自解释了（如 `GenericCrafter.ignoreLiquidFullness`，字面就是"忽略流体充满"）。

### 2. 看原版怎么用它

用 IDEA 的"查找用法（Find Usages）"，看原版内容里这个字段被设成了什么值，反推它的作用。比如想知道 `Drill.liquidBoostIntensity` 干嘛的，看原版钻头怎么设它、`updateTile` 里怎么读它，就明白了。

### 3. 看 `load()` 找贴图

字段搞懂了，还要知道**需要哪些贴图**。所有贴图都在 `load()` 里用 `Core.atlas.find(...)` 掏出来，所以直接看 `load()` 就知道要准备哪些 PNG。比如 `LongPowerNode.load()`：

```java
laser = Core.atlas.find(name + "-beam", Core.atlas.find("power-beam"));
laserEnd = Core.atlas.find(name + "-beam-end", Core.atlas.find("power-beam-end"));
```

意思是：加载 `名字-beam` 贴图，找不到就回滚到 `power-beam`。有 drawer 的方块，同理去翻 drawer 的 `load()`。

::: tip @Load 注解
Java 源码里还有 `@Load("@-glow")` 这种注解，能自动加载贴图。`@` 代表方块名，`#` 代表从 1 开始的循环数字。看到它，就知道该准备哪些名字的图了。
:::

---

## 一个完整走查：钻头能不能用液体加速？

把上面的流程串起来，走一遍真实案例：

1. **想造一个"能用液体加速的钻头"**，于是查原版钻头。
2. 在 `Blocks.java` 搜 `mechanical-drill`，定位到 `new Drill("mechanical-drill")`。
3. 打开 `Drill.java`，看到字段 `liquidBoostIntensity = 1.6f`，Javadoc 写着"供液后的加速倍率"。
4. 结论：JSON 里写 `liquidBoostIntensity: 1.6`，再配合 `consumes: { liquid: water/0.1 }`，就能做出液体加速钻头。

整个过程，我们**没看任何教程**，只靠"反查源码"，就独立得出了正确结论。这就是这套方法的价值。

---

## 进阶：JSON 的 `type` 就是类名

还有个顺手的补充：JSON 里那个 `type` 字段，填的就是**类名**（源码 `ContentParser` 会把它解析成具体的类）。所以：

- `type: Drill` → `mindustry.world.blocks.production.Drill`
- `type: ConsumeGenerator` → `mindustry.world.blocks.power.ConsumeGenerator`
- `type: RegionPart` → `mindustry.entities.part.RegionPart`

反过来，你在源码里发现一个感兴趣的类（比如 `Fracker` 钻井塔），只要把它写进 `type`，就能用 JSON 定义它——**类名即 type，字段即 JSON 键**。

---

## 小结

这一章的方法论可以浓缩成一句话：**JSON 字段 = Java 公开字段，`type` = 类名**。查字段的流程是"原版内容 → `name` → `content/*.java` → 类 → 读字段/Javadoc/`load()`"。掌握它，你就从"被喂饭"变成了"会做饭"。

**思考题**：想造一个"太阳发电机"，但不知道它的类名。请说出从"只知道中文名太阳能板"到"找到它的 JSON 字段"的完整步骤（提示：先查 `name`，再去 `Blocks.java`）。

下一章，我们把"反射"这层窗户纸捅破——Java 语法初步，以及 JSON 到底是怎么被 `ContentParser` 翻译成对象的。

---

## 附：本章涉及的源码文件

- `mindustry/content/`（`Blocks`、`Items`、`Liquids`、`UnitTypes`、`StatusEffects`、`Fx`、`Planets`、`SectorPresets`、`Weathers`）
- `mindustry/world/blocks/production/Drill.java`（走查示例）
- `mindustry/mod/ContentParser.java`（`type` → 类名的解析）
