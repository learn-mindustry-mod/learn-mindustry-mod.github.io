# Java 语法初步与 ContentParser 解析

这一节不是让你“学会 Java”，而是让你看懂源码，并理解 JSON 是如何被解析成游戏内容的。只要你能读懂类、字段与方法，就能推断出 JSON 该怎么写。

## Java 语法速通（只讲必要部分）

Java 里的“内容定义”通常是一个类，字段就是配置项。比如：

```java
public class Drill extends Block{
    public int tier = 1;
    public float drillTime = 300f;
}
```

`public` 表示公开字段，`int`/`float` 是类型，右侧是默认值。JSON 里只要写同名字段即可覆盖默认值。方法是类里的“行为”，例如：

```java
public void updateTile(){
    //每帧逻辑
}
```

构造器名字与类名相同，常用于创建时设定基础值：

```java
public Drill(String name){
    super(name);
}
```

你在 `core/src/mindustry/content/*.java` 里看到的写法，经常是“匿名内部类”初始化：

```java
new GenericCrafter("x"){ {
    craftTime = 60f;
}}
```

这一对大括号的含义就是“创建对象后马上设置字段”。JSON 本质上就是在做这件事。

数组与列表也经常出现。Java 里 `ItemStack[]` 是数组，`Seq<ItemStack>` 是列表。JSON 里通常用数组表示，比如 `"requirements": ["copper/10", "lead/10"]`。

## ContentParser 在做什么

`ContentParser` 是 JSON 解析器，它把 JSON 字段逐个写进 Java 对象。它遵循“字段同名映射”的基本规则：JSON 的键名必须和 Java 字段名一致，类型也要对应。如果类型不一致，游戏会直接报错。

`type` 是最关键的字段之一。方块的 `type` 决定 Java 类（如 `GenericCrafter`、`Drill`、`PowerNode`），单位的 `type` 决定构造器（如 `flying/mech/legs/naval/payload/missile/tank/hover/tether/crawl`），而子类对象（子弹、能力、特效等）也依赖 `type` 指定具体子类。

JSON 引用其他内容时，会先尝试 `modName-内部名`，找不到才查原版内部名，所以内部名冲突会导致覆盖或解析失败。

### 常见的 JSON 简写

`ContentParser` 内置了多种简写语法。例如 `"copper/10"` 会被解析为 `ItemStack`，`"water/0.1"` 会被解析为 `LiquidStack`，载荷堆栈则可以用 `"block-or-unit/amount"` 的形式表示。

这些简写只适合“纯数量”场景，一旦需要额外参数（例如 `booster`、`optional`），就必须改用对象形式。

### consumes 不是普通字段

`consumes` 是特殊语法，它不会直接写进字段，而是被解析成“消耗器”。常见的键包括 `items`、`liquids`、`power`、`itemFlammable`、`itemExplosive`、`coolant` 等。你在 JSON 里写的消耗器最终会变成 `Consume*` 对象，决定方块的效率与输入逻辑。

### 覆盖与模板

如果 JSON 文件名与原版内容内部名相同，且不写 `type`，解析器会认为你是在“覆盖原版”。单位还有一个 `template` 字段，可以用现成单位作为模板，再覆盖少量字段。这些机制能减少重复配置，但也更容易出错，建议熟悉后再使用。

## 常见报错的读法

`No content found with name 'xxx'` 通常是内部名拼写错误或内容解析失败；`Unknown consumption type` 表示 `consumes` 里写了不支持的键；`Invalid unit type` 说明单位 `type` 拼写有误；`Class not found` 则意味着 `type` 指向了不存在的类或类名不完整。

## 小结

只要能看懂 Java 类与字段，就能写对 JSON。`ContentParser` 决定了“哪些写法被允许”，遇到问题时先看报错，再查解析器，效率会比盲猜高得多。
