# 编译期 ECS 架构

::: warning
此页面为 MiniMax-M2.1 生成，未来会由人工手动扩充和润色
:::


Mindustry 的实体组件系统（Entity Component System，简称 ECS）并非在源码中直接编写完整的实体类，而是采用「配方 + 工厂」的模式：开发者编写若干组件类（`*Comp`），由注解处理器在编译期将这些组件拼接、合并，最终生成可运行的实体类。

理解这套机制是深入 Mindustry 源码的前提。实体系统的设计直接影响模块加载、网络同步、物理碰撞等核心功能的实现方式。

---

## 1. 问题的起源

在传统的面向对象设计中，若要为游戏中数百种单位、建筑、子弹分别定义实体类，会遇到以下问题：

- **代码冗余**：`x`、`y`、`team` 等字段在单位、建筑、子弹中重复出现。若通过继承复用，会形成深度嵌套的继承链，难以维护。
- **同步逻辑重复**：多人游戏中需要通过网络同步实体状态。若每个实体类都手动编写 `readSync/writeSync`，代码量大且容易遗漏。
- **分组管理分散**：不同类型的实体需要不同的更新策略和查询方式。单位需要空间索引，子弹需要碰撞检测，建筑需要地形绑定——这些逻辑若分散在各类中，修改成本极高。

Mindustry 的解决方案是将「拼装」工作交给编译期。组件负责声明能力，注解处理器负责将这些能力组装成完整的实体类。运行时执行的是生成后的代码，而非组件源码。

---

## 2. 三条核心主线

Mindustry 的 ECS 由三条独立的主线构成，彼此职责明确：

| 主线 | 形式 | 职责 |
|------|------|------|
| **组件** | `@Component` 注解 | 声明实体具备哪些能力（字段定义） |
| **实体定义** | `@EntityDef` 注解 | 指定实体由哪些组件组合而成 |
| **分组** | `@GroupDef` 注解 | 指定实体归属哪个分组，确定更新与查询策略 |

这三条线分别对应组件层、拼装层、分组层，互不干扰，任一层面的修改都不会直接影响其他层面。

---

## 3. 组件详解

### 3.1 基本结构

组件是一个带有 `@Component` 注解的抽象类，用于声明实体应当具备的字段。以下是 Mindustry 源码中的真实示例：

```java
@Component
abstract class HealthComp{
    float health = 1.0f;
    float maxHealth = 1.0f;
    int id = 0;
}
```

组件设计遵循以下约束：

- **字段必须为 `public`**：生成器会统一处理访问修饰符，若字段为 `private` 则无法合并。
- **不能包含普通方法**：组件中只能包含字段、初始化块、带有 `@MethodPriority` 注解的方法。普通方法的逻辑由生成器在合并阶段处理。
- **命名必须以 `Comp` 结尾**：这是注解处理器的硬性规则，不符合则编译失败。

### 3.2 注解参数

`@Component` 注解支持以下参数：

| 参数 | 类型 | 默认值 | 作用 |
|------|------|--------|------|
| `base` | `boolean` | `false` | 若为 `true`，该组件可作为实体的基类来源，影响实体的继承结构 |
| `genInterface` | `boolean` | `true` | 是否生成对应的接口（`*c` 格式） |

### 3.3 可同步字段

组件字段可使用 `@SyncField` 标记为网络同步字段：

```java
@SyncField(true) float x;        // 使用 lerp 插值（线性插值）
@SyncField(false) float angle;   // 使用 slerp 插值（球面插值，适用于角度）
@SyncField(clamped = true) float health; // 插值结果被 clamp 到 [0, max] 范围
```

`@SyncField` 只能用于 `float` 类型字段。生成器会自动添加以下辅助字段：

```java
// 假设原字段为 x，则生成器会添加：
private float x_LAST_ = 0f;
private float x_TARGET_ = 0f;
private transient float x_LASTUPDATE_ = 0f;
```

### 3.4 本地同步控制

`@SyncLocal` 注解用于标记「仅本地有效」的同步字段：

```java
@SyncLocal float mouseX; // 该字段由本地控制，不接受服务端广播
```

该注解不会消除网络流量的读写，但会在读取快照时跳过本地覆盖。其设计目的是减少控制权切换时的视觉抖动。

### 3.5 跳过同步

`@NoSync` 注解用于标记完全不参与同步的字段：

```java
@NoSync float clientCache; // 仅客户端使用，不参与网络传输
```

---

## 4. 实体定义详解

### 4.1 基本结构

实体定义使用 `@EntityDef` 注解，指定实体由哪些组件组合而成：

```java
@EntityDef({Unitc.class, Flyerc.class})
abstract class MyUnitDef{}
```

此处 `Unitc`、`Flyerc` 为组件对应的接口。接口名由生成器自动转换：`XxxComp` -> `Xxxc`。

### 4.2 注解参数

`@EntityDef` 支持以下参数：

| 参数 | 类型 | 默认值 | 作用 |
|------|------|--------|------|
| `value` | `Class<?>[]` | 无 | 组件接口数组，指定实体由哪些组件组成 |
| `pooled` | `boolean` | `false` | 是否启用对象池复用 |
| `serialize` | `boolean` | `true` | 是否参与存档序列化 |
| `genio` | `boolean` | `true` | 是否生成网络同步代码 |
| `isFinal` | `boolean` | `true` | 是否为最终类型（影响 Group 解析） |
| `legacy` | `boolean` | `false` | 是否使用兼容模式（结构与旧版兼容） |

### 4.3 生成流程

当注解处理器解析 `@EntityDef` 时，执行以下步骤：

1. **接口转组件**：根据接口名反查对应的组件类（如 `Unitc` -> `UnitComp`）。
2. **依赖递归展开**：遍历组件的 `@Import` 声明，递归收集所有依赖组件。
3. **字段合并**：将所有非 `@Import` 字段加入实体。若存在字段名冲突（即使类型相同），编译报错。
4. **方法合并**：收集所有组件中的方法定义，按签名去重。若存在同签名不同实现，优先级顺序为：`@MethodPriority(值越大越优先)` > `@Replace` > 更深层次的组件依赖。
5. **代码注入**：注入同步读写、插值、组管理、池化等代码。

---

## 5. 依赖与导入

### 5.1 `@Import` 机制

组件可通过 `@Import` 声明对其他组件字段的依赖，但不生成对应字段：

```java
@Component abstract class UnitComp{
    float speed;
}

@Component abstract class HealComp{
    @Import float speed;  // 引用 UnitComp 的 speed，不生成字段
    float healAmount;
}
```

该机制的目的是避免字段复制。若 `HealComp` 需要使用其他组件的字段，只需声明依赖，无需重写字段定义。

### 5.2 依赖收集规则

依赖收集遵循以下规则：

- `@Import` 字段**不参与**实体字段生成。
- 被导入的字段类型必须与提供方完全匹配（基本类型不可隐式转换）。
- 若提供方字段被移除或重命名，导入方的编译会报错。

### 5.3 常见错误

```java
@Component abstract class A{ float value; }
@Component abstract class B{
    @Import int value;  // 类型不匹配，编译报错
}
```

---

## 6. 方法合并与优先级

### 6.1 方法冲突处理

当多个组件定义了同名同参数的方法时，生成器按以下优先级选择最终实现：

| 优先级 | 注解/条件 | 说明 |
|--------|----------|------|
| 1 | 无注解 | 根据组件依赖层次，深度优先 |
| 2 | `@MethodPriority(n)` | 数值越大，优先级越高 |
| 3 | `@Replace` | 标记为替换的方法优先 |

### 6.2 使用示例

```java
@Component abstract class UnitComp{
    void update(){
        // 基础更新逻辑
    }
}

@Component abstract class Flyerc{
    @MethodPriority(10)
    void update(){
        // 飞行单位的更新逻辑应覆盖基础逻辑
        // 因优先级更高而被选中
    }
}
```

### 6.3 无法解決的冲突

若优先级相同且均为显式声明，生成器会抛出编译错误，强制开发者手动解决冲突。

---

## 7. 对象池机制

### 7.1 池化实体

对于生命周期短暂的实体（如子弹），可设置 `pooled = true` 以启用对象池：

```java
@EntityDef({Bulletc.class}, pooled = true, serialize = false)
```

### 7.2 生命周期

池化实体的生命周期如下：

```
Xxx.create()
  -> Pools.obtain()          // 从池中获取或新建
  -> add()                   // 加入对应分组
  -> update()                // 逐帧更新
  -> remove()                // 标记为待移除
  -> queueFree()             // 进入待回收队列
  -> next Groups.update()    -> Pools.free() // 真正回收
```

关键点在于 `remove()` 不会立即回收对象。这是因为移除操作可能发生在分组遍历过程中，若当场回收会破坏迭代器。Mindustry 选择在下一帧的 `Groups.update()` 开头统一回收。

### 7.3 `reset()` 方法

生成器为池化实体自动生成 `reset()` 方法：

```java
// 生成器自动生成类似代码
void reset(){
    this.health = 1.0f;         // 字段初始化值
    this.x = 0f;                // 基本类型归零
    this.target = null;         // 引用类型置 null
}
```

设计 `reset()` 语义时应注意：

- 基本类型回到默认值（字段指定的值或零值）。
- 引用类型置 `null`。
- 静态字段和 `final` 字段不参与重置。

---

## 8. 分组系统

### 8.1 `@GroupDef` 注解

分组系统用于管理实体的更新策略和查询方式：

```java
@GroupDef(spatial = true, mapping = true, collide = true)
```

### 8.2 参数说明

| 参数 | 类型 | 默认值 | 作用 |
|------|------|--------|------|
| `spatial` | `boolean` | `false` | 启用空间四叉树查询，支持 `getByID` |
| `mapping` | `boolean` | `true` | 生成 ID 到实体的映射表 |
| `collide` | `boolean` | `false` | 在 `update()` 末尾执行碰撞计算 |

### 8.3 原版分组定义

Mindustry 源码中定义的分组示例（`GroupDefs.java`）：

```java
@GroupDef(spatial = true, collide = true, mapping = true)
class Bullet{}
@GroupDef(spatial = true, collide = true, mapping = true)
class Unit{}
@GroupDef(spatial = true, mapping = true)
class Building{}
@GroupDef(spatial = true)
class Laser{}
@GroupDef(spatial = false, mapping = true)
class Effect{}
@GroupDef(spatial = true)
class Payload{}
```

### 8.4 `Groups.update()` 执行顺序

每帧更新时，`Groups.update()` 按以下顺序执行：

1. **回收对象**：释放 `freeQueue` 中的待回收池对象。
2. **物理更新**：对 `spatial = true` 的分组执行物理查询（如位置更新）。
3. **常规更新**：遍历所有实体调用 `update()` 方法。
4. **碰撞结算**：对 `collide = true` 的分组执行碰撞检测。

这一顺序决定了物理位置更新优先于逻辑更新，逻辑更新优先于碰撞结算。

---

## 9. 代码生成物位置

编译完成后，生成物位于以下目录：

```
build/generated/sources/annotationProcessor/java/main/mindustry/gen/
```

主要生成文件：

| 文件 | 作用 |
|------|------|
| `Groups.java` | 所有分组的静态实例定义及 `update()` 循环 |
| `EntityMapping.java` | 实体 ID 到实体类的映射表 |
| `*c夏.java` | 实体类的具体实现（实际代码量大） |

调试时建议直接查看生成代码，而非猜测生成逻辑。

---

## 10. 注解处理器入口

对于需要深入理解生成机制的读者，以下是注解处理器的关键入口类：

| 类 | 位置 | 职责 |
|----|------|------|
| `EntityProcess` | `annotations/src/.../entity/EntityProcess.java` | 注解处理器主入口 |
| `EntityIO` | `annotations/src/.../entity/EntityIO.java` | 生成同步读写代码 |
| `Annotations` | `annotations/src/.../Annotations.java` | 所有注解的定义 |

---

## 11. 小结

Mindustry 的编译期 ECS 架构可归纳为以下流程：

1. **组件层**：开发者编写 `*Comp` 类，声明字段与行为。
2. **拼装层**：`@EntityDef` 指定组件组合，注解处理器执行字段合并、方法合并。
3. **代码生成层**：注入同步逻辑、组管理、池化机制。
4. **运行时**：执行生成后的实体类的 `update()` 方法。

该架构将重复性的拼接工作自动化，使源码结构清晰、修改成本低。理解其设计原则后，阅读实体相关源码将更加顺畅。