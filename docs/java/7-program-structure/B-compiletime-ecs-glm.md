# 编译时 ECS 架构

> ***灵魂拷问：为什么说 Mindustry 的实体系统是编译时的魔法？***

在深入游戏代码之前，首先需要理解 Mindustry 所使用的实体组件系统（ECS）。Anuke 整了个编译时代码生成器，把运行时才能干的事儿全挪到编译期了。这种设计虽然听起来有点奇怪，但在性能瓶颈游戏里是常见操作。

如果你之前接触过 Unity 的 ECS 或者其他游戏引擎的实体系统，可能会觉得 Mindustry 的实现有些"异类"。不过别担心，这其实是一个经过深思熟虑的性能优化决策。

## 什么是 ECS？

ECS 的全称是 Entity-Component-System，即实体-组件-系统。传统的面向对象设计中，你会有一棵巨大的继承树，比如 `Unit` 继承 `MovingObject` 继承 `GameObject`。而 ECS 把这种 inheritance 换成了 composition。

### 传统的继承地狱

想象一下，如果你想做一个游戏里的角色系统：

```
GameObject
├─ Character
│  ├─ Player
│  └─ Enemy
│     ├─ FlyingEnemy
│     └─ WalkingEnemy
├─ Projectile
└─ Item
     ├─ Weapon
     └─ Consumable
```

这种继承结构的问题很快就显现出来：
- **多重继承难题**：`FlyingEnemy` 既是敌人又是飞行单位，但 Java 不允许多重继承
- **代码重复**：`Player` 和 `Enemy` 可能都有相同的移动逻辑，但被分割在继承树的不同层级
- **灵活性差**：想给一个"行走的玩家"添加飞行能力？需要重构整棵继承树

### ECS 的解决方案

ECS 把一个实体拆解成多个组件，像搭积木一样组合：

| Entity | Components |
|--------|------------|
| flying-dagger | PosComp, MovesComp, FlyingComp, KnifeComp |
| player | PosComp, MovesComp, PlayerComp, WeaponsComp |
| crawling-enemy | PosComp, MovesComp, CrawlComp, HealthComp, EnemyComp |
| bullet | PosComp, VecComp, BulletComp, DamageComp |

每个组件都是独立的，专注于单一职责：
- **Position**：存储坐标
- **Health**：管理生命值
- **Weapons**：处理武器系统
- **Flying**：提供飞行逻辑

## Mindustry 的 Component（组件）

组件是数据的最小单元，以 `Comp` 结尾命名。

### 组件的定义位置

所有组件都定义在 `mindustry.entities.comp` 包下：

```java
// 基础组件：EntityComp - 所有实体都有的属性
package mindustry.entities.comp;

@Component
abstract class EntityComp implements Entityc {
    boolean added;
    int id = EntityGroup.nextId();
}

// 位置组件：PosComp - 坐标相关
@Component(base = true)
abstract class PosComp implements Position {
    @SyncField(true) @SyncLocal float x, y;

    void set(float x, float y) {
        this.x = x;
        this.y = y;
    }
}

// 生命组件：HealthComp - 生命值相关
@Component
abstract class HealthComp implements Entityc, Posc {
    float health;
    transient float hitTime;
    transient float maxHealth = 1f;
    transient boolean dead;

    void damage(float amount) {
        health -= amount;
        hitTime = 1f;
        if(health <= 0 && !dead) {
            kill();
        }
    }
}
```

### 组件的注解

| 注解 | 作用 |
|------|------|
| `@Component` | 标记这是一个组件类 |
| `@Component(base = true)` | 标记为基础组件，会生成对应的基类 |
| `@Import` | 标记需要从其他组件导入的字段 |
| `@SyncField` | 标记需要同步的字段 |
| `@ReadOnly` | 标记只读字段 |
| `@Replace` | 标记替换其他组件的方法实现 |
| `@MethodPriority` | 标记方法的执行优先级 |

### 看几个原版的组件

#### EntityComp - 最基础的组件

所有实体都必须有的组件，提供最基本的属性：

```java
@Component
abstract class EntityComp implements Entityc {
    boolean added;       // 是否已添加到世界中
    int id = EntityGroup.nextId();  // 唯一ID
}
```

#### PosComp - 位置组件

几乎所有实体都需要的位置信息，并且会触发网络同步：

```java
@Component(base = true)
abstract class PosComp implements Position {
    // @SyncField(true) 表示这个字段需要网络同步
    // @SyncLocal 表示这个字段只在本地同步，不发送给服务器
    @SyncField(true) @SyncLocal float x, y;

    @Override
    public float getX() {
        return x;
    }

    @Override
    public float getY() {
        return y;
    }
}
```

#### HealthComp - 生命组件

处理生命值和伤害逻辑：

```java
@Component
abstract class HealthComp implements Entityc, Posc {
    float health;           // 当前生命值
    transient float hitTime; // 受击闪白时间
    transient float maxHealth = 1f;  // 最大生命值
    transient boolean dead; // 是否死亡

    void kill() {
        if(dead) return;
        health = Math.min(health, 0);
        dead = true;
        killed();  // 其他组件可以覆写此方法
        remove();  // 从世界中移除
    }

    void heal(float amount) {
        health += amount;
        clampHealth();  // 限制在 maxHealth 范围内
    }
}
```

## Mindustry 的 Entity（实体）

实体是组件的组合，通过 `@EntityDef` 注解声明。

### 实体的定义

看原版几种主要的实体：

#### UnitComp - 单位实体

```java
@EntityDef({
    Posc.class,       // 位置能力
    Healthc.class,    // 生命能力
    Teamc.class,      // 队伍能力
    Itemsc.class,     // 物品携带能力
    Rotc.class,       // 旋转能力
    Unitc.class,      // 单位能力
    Weaponsc.class,   // 武器能力
    Drawc.class,      // 绘制能力
    Syncc.class,      // 同步能力
    Shieldc.class,    // 护盾能力
    Minerc.class,     // 挖掘能力
    Builderc.class,   // 建造能力
    // ...还有更多
})
@Component(base = true)
abstract class UnitComp implements Healthc, Physicsc, Hitboxc, /*...*/ {
    @Import boolean dead, disarmed;
    @Import float x, y, rotation, maxHealth;
    @Import Team team;
    @Import int id;

    private UnitController controller;
    Ability[] abilities = {};

    // 方法和字段...
}
```

`@EntityDef` 的 value 是一个接口数组，每个接口对应一个组件。编译器会自动找到这些接口对应的组件类，并生成复合实体。

#### BuildingComp - 建筑实体

```java
@EntityDef({
    Posc.class,
    Healthc.class,
    Teamc.class,
    Timerc.class,
    // ...
})
@Component(base = true)
abstract class BuildingComp implements Entityc {
    public transient Block block;
    public transient boolean dead;
    public transient boolean enabled = true;
    public float health;
    public transient int id = EntityGroup.nextId();

    // 建筑特有的方法和字段...
}
```

## 为什么是"编译时"的秘密武器

传统 ECS 的痛点在于：
- **运行时查找组件 = 缓存不命中**
- **反射调用 = 伤天害理的性能损失**
- **面向接口编程 = 总是多一层间接**

### 传统 ECS 的问题

想象一个传统的 ECS 实现：

```java
// 运行时查找组件
Entity e = world.createEntity();
Position pos = e.getComponent(Position.class);

// 这通常意味着：
// 1. 查找组件存储（哈希表、数组等）
// 2. 可能有反射
// 3. 缓存不命中 = 失败
```

在每秒 60 帧的游戏里，如果有几千个实体，每帧都这样查组件，性能会受影响。

### Mindustry 的解决方案

Mindustry 的解决方案是**编译时代码生成**。所有在编译时确定的类型关系，都被 `EntityProcess` 注解处理器硬编码进了生成的类里。

### 生成的类是什么样子？

看 `mindustry/gen/Unit.java`（这是生成后的类，不是源代码）：

```java
@SuppressWarnings("deprecation")
public class Unit extends UnitBase implements Posc, Healthc, /*...*/ {
    // 所有字段都是 public 的，没有 Getter/Setter
    public float x, y;
    public float health, maxHealth;
    public Team team;
    public int id;

    // 生成的 update() 方法会把所有组件的 update() 拼起来
    @Override
    public void update() {
        // PosComp.update() 的代码
        // HealthComp.update() 的代码
        // UnitComp.update() 的代码
        // ...所有组件的 update() 代码
    }

    @Override
    public void remove() {
        if(added) {
            added = false;
            // 从各个组中移除
            Groups.unit.removeIndex(this, index__unit);
            Groups.all.removeIndex(this, index__all);
            // ...
        }
    }
}
```

### EntityProcess 注解处理器

注解处理器位于 `mindustry.annotations.entity.EntityProcess`，它在编译时扫描所有被 `@Component` 和 `@EntityDef` 标记的类，并生成对应的实体类。

```java
@SupportedAnnotationTypes({
"mindustry.annotations.Annotations.EntityDef",
"mindustry.annotations.Annotations.GroupDef",
"mindustry.annotations.Annotations.EntityInterface",
"mindustry.annotations.Annotations.BaseComponent"
})
public class EntityProcess extends BaseProcessor {
    // 三轮编译
    {
        rounds = 3;
    }

    @Override
    public void process(RoundEnvironment env) throws Exception {
        if(round == 1) {
            // 生成组件接口
        } else if(round == 2) {
            // 生成实体定义
        } else {
            // 生成实际类
        }
    }
}
```

## 生成的接口

每个组件会生成一个对应的接口（以 `c` 结尾）。

### 接口的命名规则

| 组件类名 | 生成的接口名 |
|----------|--------------|
| `PosComp` | `Posc` |
| `HealthComp` | `Healthc` |
| `UnitComp` | `Unitc` |
| `BuildingComp` | `Buildingc` |

### 接口的生成

看生成后的 `Posc.java`：

```java
/**
 * Interface for {@link mindustry.entities.comp.PosComp}
 */
@EntityInterface
@SuppressWarnings({"deprecation"})
public interface Posc extends Entityc {
    float x();

    float y();

    void x(float x);

    void y(float y);

    void set(float x, float y);

    void trns(float x, float y);

    @Override
    default float getX() {
        return x();
    }

    @Override
    default float getY() {
        return y();
    }
}
```

### `@EntityInterface` 注解

这个注解标记一个接口是组件接口，注解处理器会识别它并生成对应的 getter/setter 方法。

## 组件依赖

组件之间可以声明依赖关系，通过 `implements` 来指定。

### 依赖的定义

```java
@Component
abstract class DamageComp implements Healthc {
    // DamageComp 依赖 Healthc，意味着任何拥有 DamageComp 的实体也必须拥有 HealthComp
}

@Component
abstract class PosComp implements Position {
    // PosComp 依赖于 Position 接口（Arc 框架的接口）
}
```

### 依赖的作用

当一个组件依赖于另一个组件时：
1. 任何包含该组件的实体**必须**也包含被依赖的组件
2. 组件的字段会被合并到实体类中
3. 组件的方法会被合并到实体类中

### BaseComponent

所有组件默认都会自动继承 `BaseComponent` 里定义的属性。

```java
@BaseComponent
abstract class Base {
    boolean added;
    int id = EntityGroup.nextId();

    boolean isAdded() {
        return added;
    }
}
```

这意味着任何组件都会自动拥有 `added` 和 `id` 字段，除非被标记为不需要基础组件。

## 字段的导入

### `@Import` 注解

`@Import` 注解用于标记需要从其他组件导入的字段。

```java
@Component
abstract class HealthComp implements Entityc, Posc {
    @Import boolean dead, disarmed;  // 从其他组件导入

    void damage(float amount) {
        // 可以直接使用 imported 的字段
        if(dead) return;
        health -= amount;
    }
}
```

### 为什么需要 `@Import`？

在编译时合并组件时，字段会被"注入"到实体类中。但是组件类本身并不知道这些字段的存在，所以需要 `@Import` 来告诉注解处理器这些字段是外部导入的。

## 方法的融合

当多个组件实现了同名方法时，冲突如何解决？

### 冲突解决规则

Mindustry 的冲突解决规则是：

1. **只有一个非 `abstract` 实现**：直接用那个
2. **有多个实现**：根据 `@MethodPriority` 挑优
3. **有 `@Replace` 标记的方法**：优先级最高

### 优先级比较

```java
// 最高优先级
@Replace
void update() {
    // 这个实现会被使用，替换其他所有
}

// 中等优先级
@Override
@MethodPriority(5f)
void update() {
    // 这个排在前面
}

// 默认优先级
@Override
void update() {
    // 这个排在后面
}
```

### 方法融合的输出

当有多个组件实现了同名方法时，生成的代码会把它们按优先级排序，并组合成一个方法：

```java
@Override
public void update() {
    // PosComp 的 update()
    {
        // ...PosComp.update() 的代码
    }

    // HealthComp 的 update()
    {
        // ...HealthComp.update() 的代码
    }

    // ...其他组件的 update()
}
```

## `@ReadOnly` 注解

标记字段为只读，生成的接口只有 getter 没有 setter。

```java
@Component
abstract class PosComp {
    @ReadOnly
    float x;
}
```

生成的接口：

```java
float x();  // 只有 getter

// 没有 setter
// void x(float x);  // 这行不会被生成
```

## `@Replace` 注解

标记用本组件的实现替换其他组件的实现。

```java
@Component
abstract class MyComp {
    @Replace
    void draw() {
        // 用这个实现把其他组件的 draw() 顶掉
    }
}
```

## `@SyncField` 注解

标记字段需要网络同步。

```java
@Component
abstract class PosComp {
    @SyncField(true)   // true 表示需要立即同步
    @SyncLocal         // local 表示只在本地同步，不发给服务器
    float x, y;
}
```

生成的字段：

```java
// 原始字段
public float x, y;

// 同步相关字段（transient，不会存档）
private transient float x__target;  // 目标值
private transient float x__last;    // 上一次的值
```

## 总结

Mindustry 的 ECS 架构是一个独特的"编译时 ECS"设计：

| 特性 | 传统 ECS | Mindustry ECS |
|------|----------|---------------|
| 组件查找 | 运行时哈希查找 | 编译时直接访问 |
| 字段访问 | 通过 getter/setter | 直接 public 字段 |
| 方法调用 | 接口调用 | 直接编译到类中 |
| 性能 | 有开销 | 最优化 |
| 灵活性 | 高 | 中等 |
| 实现难度 | 简单 | 复杂 |

这种设计非常适合性能敏感的游戏，尤其是在实体数量庞大、每帧都需要高频更新的场景下。虽然编译时生成的代码会让代码库看起来有些奇怪，但换来的是顶级的运行时性能。
