# Java语法初步与ContentParser解析

这一节不是让你“学会Java”，而是让你**看得懂源码**，并明白JSON是如何被解析成游戏内容的。

## Java语法速通（只讲必要部分）

### 1. 类与字段

```java
public class Drill extends Block{
    public int tier = 1;
}
```

- `class Drill`：类名；
- `extends Block`：继承；
- `public int tier`：字段，JSON里同名字段即可赋值。

### 2. 方法与构造器

```java
public Drill(String name){
    super(name);
}

public void updateTile(){
    //每帧逻辑
}
```

- 构造器名字与类名相同；
- `updateTile()`通常是核心逻辑入口。

### 3. new 与匿名内部类

```java
new GenericCrafter("x"){ {
    craftTime = 60f;
}}
```

这是一种“创建并立即配置”的写法，JSON等价于设置字段。

### 4. 数组与列表

- Java数组：`ItemStack[]`；
- JSON里通常写成`["copper/10", "lead/10"]`。

## ContentParser做了什么

`ContentParser`是JSON解析器，它把JSON字段逐个写进Java对象。

### 1. 字段映射规则

- JSON里的键名对应Java字段名；
- 字段类型决定你能写什么（数值/字符串/数组/对象）；
- 如果写错类型，会直接报错。

### 2. `type`的含义

- **方块**：`type`决定Java类（如`GenericCrafter`、`Drill`、`PowerNode`）；
- **单位**：`type`决定构造器（如`flying/mech/legs/naval/payload/missile/tank/hover/tether/crawl`）；
- **子类对象**（子弹、能力、特效等）：`type`决定具体子类。

### 3. 内容引用与内部名

- 引用物品/方块/液体时，用内部名（JSON文件名）；
- 解析时会优先尝试`modName-内部名`，找不到再找原版；
- 所以**内部名冲突**会导致覆盖或解析失败。

### 4. `consumes`是特殊语法

`consumes`不会直接写进字段，而是被解析为消耗器：

- `items` / `liquids` / `power`：普通消耗器；
- `itemFlammable` / `itemExplosive` / `liquidFlammable`：筛选消耗器；
- `coolant`：冷却液消耗器。

### 5. 单位文件里的`requirements`

JSON单位文件的`requirements`不是“单位本体材料”，而是自动挂载到工厂或重构厂的配方结构。

## 常见报错的读法

- `No content found with name 'xxx'`：内部名写错；
- `Unknown consumption type`：`consumes`写错了键；
- `Invalid unit type`：单位`type`写错或拼写错误。

## 小结

- 看懂Java字段，就能写对JSON；
- `ContentParser`决定了JSON的“合法语法”；
- 遇到问题，先读报错，再查源码。
