# 编译期ECS架构

::: warning
此页面为 Codex GPT-5.3 生成，未来会由人工手动扩充和润色
:::

> ***“如果一个系统很复杂，那就把复杂度挪到编译期。”***

Mindustry 的实体系统（单位、子弹、玩家、建筑等）并不是“手写一个完整类”，而是：

1. 先把能力拆成 `*Comp` 组件；
2. 再由注解处理器在编译期把这些组件拼成最终实体类。

你平时读到的 `core/src/mindustry/entities/comp/*.java`，本质是“组件配方”；游戏运行时真正实例化的是 `mindustry.gen.*` 下的生成结果。

这一节我们把整套链路展开到“能排错、能推断行为”的粒度。

## 7.2.1 注解处理器与代码生成总体流程

### 入口类

- `annotations/src/main/java/mindustry/annotations/entity/EntityProcess.java`
- `annotations/src/main/java/mindustry/annotations/entity/EntityIO.java`

### 关键构建配置

- `core/build.gradle` 把生成目录并入源码：`$buildDir/generated/sources/annotationProcessor/java/main`；
- 根 `build.gradle` 在 `:core` 中配置：
  - `compileOnly project(":annotations")`
  - `kapt project(":annotations")`
- `preGen` 会执行 `writeProcessors()`，把处理器写入 `META-INF/services/javax.annotation.processing.Processor`。

也就是说，这不是 IDE 魔法，而是标准 APT/KAPT 工作流。

### 三轮处理流程（`rounds = 3`）

1. **Round 1：生成组件接口/基类准备**
   - 扫描 `@Component`；
   - `XxxComp -> Xxxc` 接口；
   - 收集字段初始化器、方法代码块，为后续拼装准备素材；
   - 对 `base = true` 的组件准备基类骨架。

2. **Round 2：实体与分组主生成**
   - 解析 `@EntityDef` 与 `@GroupDef`；
   - 合并字段与方法，注入 `add/remove` 组管理；
   - 生成同步与序列化逻辑（`EntityIO`）；
   - 生成 `Groups` 与 `EntityMapping`。

3. **Round 3：接口实现补全**
   - 最终实体实现全部组件接口；
   - 自动补 getter/setter（前提是组件没提供自定义实现）。

### 典型调用链

`gradle preGen -> compileJava/kapt -> EntityProcess#process(round1/2/3) -> 生成 mindustry.gen.* -> 运行时 create()/Groups/EntityMapping`

### 常见坑

- 只看 `*Comp`，不看生成类，容易误判字段归属和方法覆盖；
- 以为同步/序列化逻辑是手写的，其实大部分由 `EntityIO` 注入；
- 改了组件命名但不符合规则（非 `Comp` 结尾），会直接生成失败。

::: tip 一句话记忆
`entities/comp/*Comp.java` 是“配方”，`mindustry.gen.*` 才是“成品”。
:::

## 7.2.2 组件组合与实体接口的生成规则

这一节是“为什么这个实体会有这些字段/方法”的底层规则。

### 入口类

- `EntityProcess#allComponents(...)`
- `EntityProcess#getDependencies(...)`
- `EntityProcess#interfaceName(...)`

### 关键规则 1：命名映射

- 组件必须是 `*Comp`；
- 接口名自动转成 `*c`：
  - `PosComp -> Posc`
  - `UnitComp -> Unitc`
- `@EntityDef(value = {...})` 里写的是接口，处理器会反查回组件。

### 关键规则 2：依赖递归展开

处理器会做两层展开：

- 组件接口继承链递归展开；
- 非 `@BaseComponent` 组件自动补全“基础组件集合”（比如 `EntityComp` 能力）。

因此很多时候你在 `@EntityDef` 里没显式写某组件接口，实体仍然会拥有对应能力。

### 关键规则 3：字段合并

- 非 `@Import` 字段：参与实体字段生成；
- `@Import` 字段：只声明依赖，不生成实体字段；
- 同名字段冲突：直接报错（不是“后者覆盖前者”）。

### 关键规则 4：方法决议

同签名方法冲突时会排序并选优：

1. `@MethodPriority`（值越高越靠后执行/越优先被选）；
2. `@Replace`（显式替换优先）；
3. 依赖层次（更“深”的实现）。

如果仍然并列，处理器会报“歧义实现”，强制你明确优先级。

### 典型调用链

`@EntityDef(value={Unitc,...}) -> interfaceToComp(Unitc->UnitComp) -> getDependencies() -> 字段/方法合并 -> 生成实体类`

### 最小示例（伪代码）

```java
@Component abstract class HealthComp{ float health; }
@Component abstract class PosComp{ float x, y; }

@EntityDef({Healthc.class, Posc.class})
class DemoDef{}
```

编译后会得到一个“同时实现 `Healthc` 和 `Posc`”的实体，并携带 `health/x/y` 字段。

### 常见坑

- 在两个组件里定义相同字段名（哪怕类型相同）也会报错；
- 想“覆盖”别的组件方法但没加 `@Replace`/优先级，结果被别的实现抢走。

## 7.2.3 `@Component` 与 `@EntityDef` 的真实含义

这两个注解不是装饰品，而是“生成策略开关”。

### `@Component`

#### 入口类

- `mindustry.annotations.Annotations.Component`
- `EntityProcess` 中 round1/round2 的组件处理分支

#### 关键参数

- `base = true`：允许这个组件成为实体主基类来源；
- `genInterface = true/false`：是否完整生成组件接口声明。

#### 关键行为

- 带 `base = true` 的组件会影响实体继承结构；
- 如果组件自身也带 `@EntityDef`，处理器会走“该实体即基类”的特殊路径。

### `@EntityDef`

#### 入口类

- `mindustry.annotations.Annotations.EntityDef`
- `EntityProcess` round2 实体生成主循环

#### 关键参数

- `value`：组件接口组合；
- `pooled`：是否池化；
- `serialize`：是否参与存档序列化；
- `genio`：是否生成 IO（含网络同步）代码；
- `isFinal`/`legacy`：结构与兼容策略。

#### 典型原版例子

- `BulletComp`：`pooled = true, serialize = false`
- `BuildingComp`：`genio = false, serialize = false`
- `PlayerComp`：`serialize = false`

### 最小示例

```java
@EntityDef(value = {Decalc.class}, pooled = true, serialize = false)
@Component(base = true)
abstract class DecalComp{}
```

这会让实体具备：

- 对象池生命周期；
- 不写入存档；
- 由组件驱动的最终类生成。

### 常见坑

- `serialize = false` 并不代表“没有 read/write 方法”，生成器仍可能为了流程一致性生成相关壳逻辑；
- 乱开 `legacy` 会让结构进入兼容分支，排错成本明显变高。

## 7.2.4 同步字段与插值：`@SyncField`、`@SyncLocal`、`@NoSync`

这是多人联机最容易“看似玄学，实则规则明确”的部分。

### 入口类

- `EntityProcess`：给 `readSync/writeSync/interpolate/snap*` 注入代码
- `EntityIO#writeSync(...)`
- `EntityIO#writeInterpolate(...)`

### 三个注解的行为差异

- `@SyncField(...)`
  - 只能标在 `float` 字段上；
  - 自动生成 `xxx_TARGET_` 与 `xxx_LAST_`；
  - `true -> lerp`，`false -> slerp`；
  - `clamped = true` 会额外 `clamp`。

- `@SyncLocal`
  - 本地控制对象读取快照时“不覆盖本地值”；
  - 但仍要消费网络数据，保证流读取不偏移；
  - 同时维护同步缓冲字段，减少控制权切换抖动。

- `@NoSync`
  - 该字段在 `writeSync/readSync` 中直接跳过；
  - 常用于客户端局部状态或不应广播的数据。

### 插值主公式

生成逻辑核心是：

```java
alpha = min(timeSinceUpdate / updateSpacing, 2f)
current = lerp_or_slerp(last, target, alpha)
```

并配有 `snapSync/snapInterpolation` 让实体在首次同步或控制切换时不出现巨大跳变。

### 典型调用链

`readSync -> 更新 lastUpdated/updateSpacing -> 写入 TARGET/LAST -> afterSync -> update 中调用 interpolate`

### 常见坑

- 把非 `float` 字段加 `@SyncField`（会在生成期报错）；
- 角度字段误用 `@SyncField(true)` 导致跨 0/360 时旋转方向异常；
- 把本地控制字段忘记 `@SyncLocal`，表现为“手感被网络抢回去”。

## 7.2.5 实体池化、复用与生命周期

### 入口类

- `EntityProcess` 对 `pooled = true` 的分支
- 生成的 `create()/reset()`
- 生成的 `Groups.queueFree(...)`

### 生命周期链路

对于池化实体，主链路是：

`Xxx.create() -> Pools.obtain(...) -> add() -> update()... -> remove() -> Groups.queueFree(this) -> Groups.update() 开头统一 Pools.free -> 下次 obtain 复用`

### 为什么不是 remove 里立刻 free？

因为 `remove()` 很可能发生在组遍历过程中，若立即回收会污染当前迭代状态。Mindustry 选择“下一帧统一 free”来避免并发修改式问题。

### `reset()` 的语义

生成器会为池对象生成 `reset()`：

- 基本类型回到默认值（或字段初始化值）；
- 引用类型通常置 `null`；
- 静态/最终字段不参与重置。

### 常见坑

- 以为 `remove()` 后对象立刻不可见并已回收；
- 在组件里保存池对象的外部强引用，导致“复用后旧引用污染”；
- 把需要跨生命周期的数据放在未持久化字段里，结果复用时丢失。

## 7.2.6 组件之间的依赖与 `@Import` 的作用

### 入口类

- `EntityProcess` 字段收集阶段：`select(f -> !f.has(Import.class))`

### `@Import` 的本质

`@Import` 表示：

> 这个组件需要使用某字段，但字段定义不在本组件里。

它只做“声明依赖”，不做“字段落地”。

### 示例

在 `UnitComp` 里你会看到：

```java
@Import float x, y, rotation;
@Import Team team;
```

这些字段通常由 `PosComp`、`TeamComp` 等组件提供。

### 典型调用链

`@EntityDef(...) -> allComponents() 收集组件 -> 仅非 @Import 字段进入实体 -> @Import 字段在代码块中直接使用`

### 常见坑

- 误把 `@Import` 当“快捷定义字段”，导致最终实体缺字段；
- 提供方字段被改名/移除后，使用方组件仍在引用，生成或编译会报错；
- 两侧类型不一致（例如提供方 `float`，使用方 `int`），会在后续编译阶段暴露为类型冲突。

::: warning 常见误区
`@Import` 是“我依赖你”，不是“我声明你”。
:::

## 7.2.7 `GroupDef` 与实体分组的更新策略

分组系统决定了实体“在哪里被更新、怎么被检索、是否参与碰撞”。

### 入口类

- `core/src/mindustry/entities/GroupDefs.java`
- `EntityProcess` round2 的 `@GroupDef` 解析分支
- `core/src/mindustry/entities/EntityGroup.java`

### `@GroupDef` 的三个关键开关

- `spatial = true`：启用 `QuadTree`，支持空间查询与物理更新；
- `mapping = true`：启用 `id -> entity` 映射（`getByID`）；
- `collide = true`：在统一更新里执行 `group.collide()`。

### 生成时发生了什么

处理器会生成 `mindustry.gen.Groups`：

- 为每个组创建 `EntityGroup<T>` 静态字段；
- 生成 `init()/clear()/resize()/update()`；
- 给实体自动注入 `index__group` 字段与索引维护逻辑；
- 在 `add/remove` 注入组注册/反注册代码。

### `Groups.update()` 关键顺序

1. 释放 `freeQueue` 中待回收池对象；
2. 对 `spatial` 组执行 `updatePhysics()`；
3. 执行 `all.update()`（实体常规更新）；
4. 对 `collide` 组执行 `collide()`。

这套顺序直接影响“物理位置更新 -> 逻辑更新 -> 碰撞结算”的先后。

### 常见坑

- 新增组时忘了 `mapping = true`，后续 `getByID` 直接抛错；
- 对非 spatial 组调用空间查询能力；
- 在错误时机手动改组内容，和自动注入的 `add/remove` 打架。

## 小结：如何用这套知识排错

当你遇到下面问题时，排查顺序建议如下：

- **“字段明明写了，实体里没有”**：先查是否误用了 `@Import`；
- **“同步有抖动/回弹”**：查 `@SyncField` 插值类型和 `@SyncLocal`；
- **“remove 后状态怪异”**：查是否理解了 `queueFree -> next update free`；
- **“实体不在预期组里”**：查 `@GroupDef` 条件与 `add/remove` 注入逻辑。

把 Mindustry 的 ECS 想成“编译期拼装 + 运行时执行生成代码”，你会发现很多看似神秘的问题其实都有固定入口和固定调用链。

