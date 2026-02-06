# 方块的消耗器（Consumes）及工厂的生产逻辑

消耗器（Consume）是方块系统中一个重要的组件，它负责管理方法的消耗、效率和统计信息，具有必需/可选/加速三种模式。在Mindustry中，无论是对炮弹供弹，使用相位物增强超速投影，还是使用工厂进行生产，制造单位，都离不开消耗器。本章我们将聚焦方块的消耗器系统和工厂的生产逻辑。

在Mindustry中，方块的工作状态并非直接由一个布尔值变量控制，而是通过其效率值来体现。**效率（Efficiency）**是建筑的一个核心状态，其取值范围通常为0到1。当效率值低于一个特定的极小阈值时，该建筑会被**方块状态（BlockStatus）**系统判定为不工作，并在视觉上显示为红色的状态标识。

## 消耗器

### 消耗器的注册

在2.2和2.4中，我们已经了解过普通消耗器和筛选消耗器的声明过程及效果。这里我们重点以最复杂的`consumers`注册系统来厘清方块中各组件的注册过程。

向方块中注册消耗器的方法正是`consume(Consume)`：

``` java
public <T extends Consume> T consume(T consume){
    if(consume instanceof ConsumePower){
        //there can only be one power consumer
        consumeBuilder.removeAll(b -> b instanceof ConsumePower);
        consPower = (ConsumePower)consume;
    }
    consumeBuilder.add(consume);
    return consume;
}
```

可见在`init()`前，添加的消耗器会先进入`consumeBuilder`这个动态的序列当中，方便添加、查找（`findConsumer(Boolf<Consume>)`）和删除（`removeConsumer(Consume)`和`removeConsumer(Boolf<Consume>)`）。而各种简写的方法本质上也是对`consume()`方法的再次封装。

走出构造函数，接下来执行的就是`init()`方法了：

``` java
consumers = consumeBuilder.toArray(Consume.class);
optionalConsumers = consumeBuilder.select(consume -> consume.optional && !consume.ignore()).toArray(Consume.class);
nonOptionalConsumers = consumeBuilder.select(consume -> !consume.optional && !consume.ignore()).toArray(Consume.class);
updateConsumers = consumeBuilder.select(consume -> consume.update && !consume.ignore()).toArray(Consume.class);
hasConsumers = consumers.length > 0;

for(Consume cons : consumers){
    cons.apply(this);
}
```

从此处看出，在初始化期`consumeBuilder`会按照是否可选与是否更新被添加到不同的数组中去，这些数组将会在消耗器更新时发挥作用。并且会执行各个消耗器的`apply(Block)`方法并将自身传递进去。实际上消耗器的`apply(Block)`方法可以认为是对方块的`init()`的扩展。

::: info 当心Seq！
在你以后的代码一定会经常用到Seq的，一定要小心两个坑：
- 用`toArray()`方法输出的数组的实际类型是`Object[]`。不要被它的表观类型骗了，一旦把它赋值给一个类型为`Consume[]`的变量，马上会抛出`ClassCastException`。正确的用法是使用`toArray(Class)`这一方法；
- `filter(Boolf)`是将原来列表中符合判断的值放入一个新的列表并返回，暗含着实例化过程，即可能造成大量新对象生成影响性能；而`retainAll(Boold)`中将原来列表中不符合判断的值全部删除，删除后无法复原。
:::

### 消耗器的定义

消耗器的基类是`mindustry.world.consumers.Consume`，这个类一共定义了以下内容：

- `optional`：如果为`true`，则不会因为此消耗器效率为0使方块罢工；
- `booster`：如果为`true`，那么在统计信息中作为“增强项”显示；
- `update`：如果为`false`，则不会在建筑的默认行为中被更新，即不影响方块的效率。例如炮塔的冷却就是由炮塔自己控制的；
- `multiplier`：一个在运行时动态为物品和流体增加倍率的SAM，原版的所有消耗器都有面向其的代码。例如地图规则中的单位造价倍率就是靠这个字段实现的；
- `ignore()`：是否忽略这个消耗器。只有`ConsumePowerBuffered`这个硬加入消耗器系统的消耗器用到了这人字段
- `optional()` `boost()` `update()`：方便初始化的实用方法，用于设置对应的三个字段；
- `apply(Block)`：对方块`init()`方法的扩展，可以设置方块的一些字段。例如设置方块的`hasItems`和`itemFilter`（默认行为中允许进入的物品列表）；
- `build(Building, Table)`：构造方块在建造栏的显示信息，例如`ConsumeItems`会显示所需的物品和是否满足；
- `trigger(Building)`：需要手动触发的方法。一般对于工厂而言就是在完成一次生产后触发一次，例如物品的消耗；
- `update(Building)`：每时每刻都在被更新的方法。例如流体和电力的消耗；
- `efficiency(Building)`：此消耗器的效率，介于0~1之间。
- `efficiencyMultiplier(Building)`：此消耗器的效率倍率，通常不生效，只有`ConsumerGenerator`用到了它，用于根据物品的属性加强效果。

*从这里也能看出，对一种方块来说同一个消耗器只有一个，并不是每个建筑都有自己的消耗器。这说明消耗器是一个无状态（Stateless）的组件，这对应的实际上是ECS架构中的系统（System）。在此处你只需要知道，每次建筑与消耗器交互时都需要把自身作为参数传递进去。相比较之下，3.4中要介绍的单位能力与武器都是有状态的组件，一种单位类型有一个武器，但是每个单位实体都具有自己的武器托架（WeaponMount），我们又把这些有状态的组件的公共部分和实体部分叫做享元-实体（Flyweight-Entity）对。可以说`Block`-`Building` `UnitType`-`Unit` `Weapon`-`WeaponMount` `Ability`-`Ability`构成了享元实体关系，而`Consume`找不到对应的实体。*

消耗器的逻辑可分为普通消耗器（消耗固定的资源）、筛选消耗器（消耗特定的一类资源）和动态消耗器（动态决定消耗的资源），消耗的资源包括物品、流体、电力、载荷。特别地，消耗电力并不是由消耗器直接执行，而是计算出实际耗电量再由电网图（PowerGraph）进行消耗。

### 消耗器的更新

上文提到，所有方块的效率都是根据消耗器计算的，奠定了这个组件的基本地位。更新消耗器效率的代码就在`updateConsumption()`中：

``` java
public void updateConsumption() {
    if (!block.hasConsumers || cheating()) {
        potentialEfficiency = enabled && productionValid() ? 1.0F : 0.0F;
        efficiency = optionalEfficiency = shouldConsume() ? potentialEfficiency : 0.0F;
        shouldConsumePower = true;
        updateEfficiencyMultiplier();
        return;
    }
    if (!enabled) {
        potentialEfficiency = efficiency = optionalEfficiency = 0.0F;
        shouldConsumePower = false;
        return;
    }
    boolean update = shouldConsume() && productionValid();
    float minEfficiency = 1.0F;
    efficiency = optionalEfficiency = 1.0F;
    shouldConsumePower = true;
    for (var cons : block.nonOptionalConsumers) {
        float result = cons.efficiency(this);
        if (cons != block.consPower && result <= 1.0E-7F) {
            shouldConsumePower = false;
        }
        minEfficiency = Math.min(minEfficiency, result);
    }
    for (var cons : block.optionalConsumers) {
        optionalEfficiency = Math.min(optionalEfficiency, cons.efficiency(this));
    }
    efficiency = minEfficiency;
    optionalEfficiency = Math.min(optionalEfficiency, minEfficiency);
    potentialEfficiency = efficiency;
    if (!update) {
        efficiency = optionalEfficiency = 0.0F;
    }
    updateEfficiencyMultiplier();
    if (update && efficiency > 0) {
        for (var cons : block.updateConsumers) {
            cons.update(this);
        }
    }
}

public void updateEfficiencyMultiplier() {
    float scale = efficiencyScale();
    efficiency *= scale;
    optionalEfficiency *= scale;
}
```





