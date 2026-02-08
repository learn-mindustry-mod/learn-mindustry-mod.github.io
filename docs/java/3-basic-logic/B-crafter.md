# 方块的消耗器（Consumes）及工厂的生产逻辑

消耗器（Consume）是方块系统中一个重要的组件，它负责管理方法的消耗、效率和统计信息，具有必需/可选/加速三种模式。在Mindustry中，无论是对炮弹供弹，使用相位物增强超速投影，还是使用工厂进行生产，制造单位，都离不开消耗器。本章我们将聚焦方块的消耗器系统和工厂的生产逻辑。

在Mindustry中，方块的工作状态并非直接由一个布尔值变量控制，而是通过其效率值来体现。**效率（Efficiency）** 是建筑的一个核心状态，其取值范围通常为0到1。当效率值低于一个特定的极小阈值时，该建筑会被 **方块状态（BlockStatus）** 系统判定为不工作，并在视觉上显示为红色的状态标识。

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

``` java {2,10,16}
public void updateConsumption() {
    //无消耗器或无限火力模式下的路径
    if (!block.hasConsumers || cheating()) {
        potentialEfficiency = enabled && productionValid() ? 1.0F : 0.0F;
        efficiency = optionalEfficiency = shouldConsume() ? potentialEfficiency : 0.0F;
        shouldConsumePower = true;
        updateEfficiencyMultiplier();
        return;
    }
    //未启用时的路径
    if (!enabled) {
        potentialEfficiency = efficiency = optionalEfficiency = 0.0F;
        shouldConsumePower = false;
        return;
    }
    //有消耗器且启用的路径
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

从这里可以看出，在非无限火力时，`efficiency`存储了必需消耗器中最低的效率，`optionalEfficiency`存储了非必需消耗器中最低的效率，并且基础最大值为1，在`updateEfficiencyMultiplier()`会将其再乘以`efficiencyScale()`，而后者在某些方块中会委托给`efficiencyMultiplier`，但并不总是。而`potentialEfficiency`存放的是无倍率时的潜在效率。这三种效率的状态变量中，`efficiency`在核心逻辑中被使用，另两种在特定方块的逻辑中发挥作用。

值得注意的是，原版中电力的消耗始终是单独被拿出来考虑的。因此方块非电力消耗器的效率可以影响电力的消耗量。

## 工厂的更新

书接上回，渲染和更新是方块实体最重要的两个功能。对于工厂来说，其更新逻辑是非常值得研究的。

``` java
@Override
public void updateTile(){
    if(efficiency > 0){

        progress += getProgressIncrease(craftTime);
        warmup = Mathf.approachDelta(warmup, warmupTarget(), warmupSpeed);

        //continuously output based on efficiency
        if(outputLiquids != null){
            float inc = getProgressIncrease(1f);
            for(var output : outputLiquids){
                handleLiquid(this, output.liquid, Math.min(output.amount * inc, liquidCapacity - liquids.get(output.liquid)));
            }
        }

        if(wasVisible && Mathf.chanceDelta(updateEffectChance)){
            updateEffect.at(x + Mathf.range(size * updateEffectSpread), y + Mathf.range(size * updateEffectSpread));
        }
    }else{
        warmup = Mathf.approachDelta(warmup, 0f, warmupSpeed);
    }

    //TODO may look bad, revert to edelta() if so
    totalProgress += warmup * Time.delta;

    if(progress >= 1f){
        craft();
    }

    dumpOutputs();
}
```

如果刚才那个有点复杂，可以看这个去除绘制功能的版本：

``` java
@Override
public void updateTile(){
    if(efficiency > 0){
        //增加进度
        progress += getProgressIncrease(craftTime);
        //不间断地输出流体
        if(outputLiquids != null){
            float inc = getProgressIncrease(1f);
            for(var output : outputLiquids){
                handleLiquid(this, output.liquid, Math.min(output.amount * inc, liquidCapacity - liquids.get(output.liquid)));
            }
        }
    }
    //判断进度是否达到1
    if(progress >= 1f) craft();
    //输出产品
    dumpOutputs();
}

public void craft(){
    //调用Consume#trigger
    consume();

    if(outputItems != null){
        for(var output : outputItems){
            for(int i = 0; i < output.amount; i++){
                offload(output.item);
            }
        }
    }

    if(wasVisible){
        craftEffect.at(x, y);
    }
    progress %= 1f;
}
```

方块的更新方法`updateTile()`是每一帧都会被执行的方法。凡是每时每刻都要变化的功能，都要放在方块的更新方法内。

工厂的`updateTile()`中，主要做了4+1+1件事：

- 若工厂正常工作（`efficiency > 0`），增加工作进度`progress`，提高炉温`warmup`，根据效率不间断地输出流体，并在可见时生成特效`updateEffect`；若不工作，则缓慢降低`warmup`；
- 判断进度是否达到1，达到则触发一次生产`craft()`；
- 主动输出产品，包括物品和流体；
  
可见，工厂本身的工作逻辑是：每刻根据效率增加一些进度，在进度达到1时手动触发一次`craft()`以便触发消耗器的`trigger()`和产出物品。工厂的逻辑非常重要，它是以后你工厂类似方块的基础。

但是，工厂的更新中蕴含的不只是工厂的生产逻辑那么简单。你还需要从中学到Mindustry对一些问题的惯用处理方法。

### 绘制接口与平滑变化

在完整的代码中，我们会看到`warmup`（炉温）和`totalProgress`（总进度）两个字段，这两个字段对工厂本身的工作没有任何作用，唯一的作用是供给`drawer`读取并绘制出对应的显示效果。

`warmup`是一个表示炉温的状态变量，在工厂长时间不工作时，炉温自然为0；在工厂开始进行工作后，炉温会逐渐平滑升高到1，并在工作过程中维持在1；在工厂中止工作后，炉温又会逐渐平滑落回0。例如，在原版的`DrawBubbles`中，气泡的透明度与`warmup`正相关，在完全不工作时不产生气泡，在开始工作时逐渐出现并最终维持在一定水平。

而使`warmup`能够平滑变化的，正是`Mathf`下的插值函数，定义如下：

``` java
/** Approaches a value at linear speed. */
public static float approach(float from, float to, float speed){
    return from + Mathf.clamp(to - from, -speed, speed);
}

/** Approaches a value at linear speed. Multiplied by the delta. */
public static float approachDelta(float from, float to, float speed){
    return approach(from, to, Time.delta * speed);
}

/** Linearly interpolates between fromValue to toValue on progress position. */
public static float lerp(float fromValue, float toValue, float progress){
    return fromValue + (toValue - fromValue) * progress;
}

/** Linearly interpolates between fromValue to toValue on progress position. Multiplied by Time.delta().*/
public static float lerpDelta(float fromValue, float toValue, float progress){
    return lerp(fromValue, toValue, clamp(progress * Time.delta));
}
```

`approach`方法通过限制单次变化的幅度来实现平滑过渡。以从0变化到1为例，若不限制变化速率，数值会在一帧内直接变为1，只有将近0.02秒的变化时间，导致视觉上的突变。而使用原版默认的速率`0.019f`时，从0到1至少需要53帧（约1秒），在人眼的视觉暂留效应下，就能呈现出连续平滑的变化效果。

至于`Time.delta`，则是代表上一帧到这一帧的时间间隔，通常为1/60秒（0.0167秒）。在Mindustry中，所有与时间相关的数值变化都应乘以`Time.delta`，以确保在**不同帧率下游戏行为保持一致**。例如，工厂的进度增加量`getProgressIncrease(craftTime)`就包含了`Time.delta`的计算，因此无论帧率高低，完成一次生产所需的时间都是固定的。

至于下文的`lerp`方法，是用来计算定比分点的利器。该方法会给出起点到终点某个比例时的值。

调用以上两个方法的时候都要注意，调用方法的结果不会自动存储到第一个参数，你需要接受这个方法的返回值。

### 物品槽和流体槽

在工厂输出物品和液体时，分别使用`offload()`和`handleLiquid()`方法，前者又包含对`handleItem()`的委托。这两个handle方法的默认行为是委托给`items`和`liquids`方法，这二者即前方提到的物品槽（`ItemModule`）和流体槽（`LiquidModule`），是方块存放物品和流体的组件。

这两种槽常用的方法包括`has()`（是否包含）、`get()`（获取某种资源的量）、`add()`（添加若干某种资源）、`remove()`（删除若干某种资源）。部分方法在`LiquidModule`没有声明，需要你手动从`ItemModule`抄过来实现。`add()`和`remove()`没有越界检查，你可以让资源超过方块容量或低于0。

虽然这两个槽是`public`的，但是直接操纵它们须谨慎。具体来说，当操作无条件时，直接操作槽是比较明智的。当可能出现超过容量时，最好先使用`acceptItem()`/`acceptLiquid()`判断是否可行，再使用`handleItem()`/`handleLiquid()`进行操作。此外，如果想让方块生产的资源可以算作区块的出产，则必须调用`produce()`方法，这时调用`offload()`就比较明智，因为它封装了出产、输出、产生三大功能。

### 无法输出

以上的代码只涉及正常工作和无输入时的工厂状态，在原版中工厂还存在“无法输出”的状态。这一状态是由`shouldConsume()`控制的。

``` java
@Override
public boolean shouldConsume(){
    if(outputItems != null){
        for(var output : outputItems){
            if(items.get(output.item) + output.amount > itemCapacity){
                return false;
            }
        }
    }
    if(outputLiquids != null && !ignoreLiquidFullness){
        boolean allFull = true;
        for(var output : outputLiquids){
            if(liquids.get(output.liquid) >= liquidCapacity - 0.001f){
                if(!dumpExtraLiquid){
                    return false;
                }
            }else{
                //if there's still space left, it's not full for all liquids
                allFull = false;
            }
        }

        //if there is no space left for any liquid, it can't reproduce
        if(allFull){
            return false;
        }
    }

    return enabled;
}
```

这个方法虽然长，但是读起来并不难，因此其实现并不是重点。重点在于这个方法控制着生产流程的启停，其返回的`noOutput`状态需要被正确理解和使用。例如，在你自己实现一种新的消耗器的时候，应该通过`effciency`去控制由于原料缺少造成的启停，而不是这个方法。

## 接入drawer

工厂采用drawer这一组件进行渲染，因此需要在代码层面上接入`drawer`。为了接入，需要把一些方法委托给`drawer`：

- `drawer.load(Block)` -> `Block#load`：加载贴图；
- `drawer.getRegionsToOutline(Block, Seq<TextureRegion>)` -> `Block#getRegionsToOutline`：向游戏提交需要被描边的贴图，提交后游戏会在`createIcons()`时自动为你描边，并添加`-outline`放回atlas；
- `drawer.finalIcons(Block)` -> `Block#icons`：方块所有用到的贴图；
- `drawer.drawPlan(Block, BuildPlan, Eachable<BuildPlan>)` -> `Block#drawPlan`：绘制作为建造计划时的方块；
- `drawer.draw(Building)` -> `Building#draw`：实体的绘制；
- `drawer.drawLight(Building)` -> `Building#drawLight`：实体光亮的绘制。

除此之外，如果想正常使用某些与炉温或进度有关的drawer的话，需要正确的重写接口：

- `warmupTarget()`：炉温目标值，用来做分母；
- `warmup()`：炉温，用来做分子；
- `totalProgress`：总进度。

方块还有一些与物品/流体逻辑和逻辑处理器相关的代码，我们分别会在3.5和7.10介绍。

## 总结

以上我们讨论了消耗器系统与建筑的效率之间的关系，以及工厂的一些方法。如果你想自己实现一种新的能源，推荐接入原版的消耗器系统控制，即使不接入，也要遵守原版对`efficiency`的约定，避免犯把`shouldConsume`当成停产信号的错误。

## 思考题

如何只用原版的类实现一个最基础的多合成？（提示：想想单位工厂）





