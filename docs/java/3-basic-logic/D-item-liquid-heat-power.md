# 物流/液体/热量/电力的物流传输逻辑

Mindustry中的各种资源从产生到消耗，中间必然会经历传输的过程。传输过程是资源生命周期的重点部分。本节我们将聚焦原版中五种主要资源中四种的传输过程，载荷部分将会放到下一节介绍。

物品传输是流体和载荷传输逻辑的基础。而热量与电力系统机理则完全不同。

## 物品传输

在物品传输系统中，直接操作`items`处理物品逻辑存在局限性。主要原因在于提供方难以准确判断接收方是否能够接受物品。接收方可能因多种原因拒绝物品，例如物品不在接收列表`itemFilter`内，或已达到其容量上限。此外，不同方块对容量的定义和处理逻辑存在差异：存储类方块的容量由`storageCapacity`而非`itemCapacity`决定。这些复杂情况使得由提供方手动判断接收方状态的方案难以实现。此时，采用前文提及的多态机制成为更合适的选择。

在原版中，物品传输遵循“先询问再传输”的原则。负责询问建筑是否可以接受物品的方法是`acceptItem(Building, Item)`。只有实体才可能拥有物品槽，进而可以参与物品传输系统，因此这些方法通常在`Building`中。建筑的默认行为如下，可见这个方法需要负责判断“建筑是否消耗此物品”和“物品槽中此物品的数量是否超过最大数量”。

``` java
public boolean acceptItem(Building source, Item item) {
    return block.consumesItem(item) && items.get(item) < getMaximumAccepted(item);
}
```

而实际传输的方法是`handleItem(Building, Item)`，它默认会委托到`items`中。此处以`Incinerator`为例，作为焚毁炉，最简单的焚毁方式就是直接无视输入：

``` java
@Override
public void handleItem(Building source, Item item){
    if(Mathf.chance(0.3)){
        effect.at(x, y);
    }
}
```

物品在中间环节的传输存在一个封装的方法`moveForward(Item)`，此方法可以将一个物品传输给前方的方块，返回值代表传输是否成功。传输失败的原因可能包括前方无建筑、前方建筑不属于本队伍或前方建筑拒绝接受物品。物品在各物流元件中的运输逻辑通过直接调用`acceptItem()`和`handleItem()`方法实现，未使用此封装方法。

普通建筑的物品输出通常使用单个输出的`dump()`方法或全部输出的`dumpAccumulate()`方法，判断是否可以输出则使用`canDump()`方法。工厂类建筑通常使用`offload()`方法，该方法在`dump()`的基础上调用了`produced()`方法来处理区块的生产资源。此外，`put()`方法也会尝试输出物品，但与`dump()`不同的是，如果输出失败，`put()`会返回false，而`dump()`会将物品保留在建筑的物品槽中。

此外，原版中存在`cdump`变量，用于在物品每次输出时均匀选择不同方向。每次输出时通过`incrementDump`更新此计数器，以在`proximity`周围方块中选择不同的目标。

此外，物流系统中还有`acceptStack()` `handleStack()` `removeStack()`等方法，这些方法与堆叠传送带（StackConveyor）没有关系，实际上是用于单位从建筑拿取或向建筑中放入若干物品的处理。其中`acceptStack()`的返回值指的是接收的物品数量。

## 流体传输

流体的运输与物品大同小异。整体上比物品系统简单很多，原因包括没有条件元件，一格导管仅允许存在一种流体等。

和物品类似，流体也有`acceptLiquid(Building, Liquid)` `handleLiquid(Building, Liquid, float)` `dumpLiquid()` `canDumpLiquid()` `moveLiquid()` `moveLiquidForward()`等方法，同时又比物品多了`getLiquidDestination()` `transferLiquid()` `splashLiquid()`等方法。流体与物品的主要区别在于：

- 流体在泄漏或方块被摧毁后会形成水洼；
- 流体的变化是连续的，而物品的变化是离散的；
- 流体没有分类器，因此需要工厂把某种流体向某个特定方向输出；
- 流体可能会发生反应。

因此，流体的方法也与物品有所不同：

- 大部分方法都接受一个`Building`参数作为传输的目标，这个目标不一定要和当前方块的相邻的；
- `dumpLiquid()`多出一个`int`参数表示输出的方向；
- `moveLiquid()` `moveLiquidForward()`的返回值标志实际输出成功的流体数量，而`transferLiquid()`会尽可能多地向前输出；
- 以上三个物品都会在试图输出流体的同时判定要输出的流体和下一个方块含有的流体是否可能反应，原版的反应性的先决条件是流体`blockReactive`和方块`blockReactive`都同意发生反应，包括两种情形：
  - 其中一者的可燃性大于0.3，另一者的温度大于0.7，则会两个建筑造成火焰伤害；
  - 其中一者的温度小于0.55。另一者的温度大于0.7，则会消耗“输入进来的流体”，并产生蒸汽特效。
- `moveLiquidForward`接受一个`boolean`参数，决定前方没有建筑时是否要泄漏；
- `getLiquidDestination()`会使“流体交叉器”拥有光传特性，因为流体交叉器总是把这个方法的返回值确定为前方建筑该方块的返回值。对于一条流体交叉器链，这样的委托机制会导致从链头输入的流体会“直接”会传输给链尾前方的方块。

## 电力传输

在讲解电力的传输过程之前，我们先了解几个基本事实：

- 电力的传输过程中没有物质发生传递；
- 同一张电网里有各种发电机发出生的电没有什么本质区别，它们都只是数字；
- 用电器的理论用电量与实际用电量没有关系。

Mindustry中的发电机和用电器均不能缓存电量，因此电量的传输只需要做好“发电机”/“用电器”/“电池”三种方块角色之间的平衡即可，即统计每一刻总发电量、总理论用电量和总缓存电量，然后计算出此刻应给所有用电器实际供电多少，而在同一张电网中**供给百分比**（即`建筑实际用电量/建筑理论用电量`）都是几乎相同的，用`status`表示。

我们在前文讲过，表示一张电网的类型是`PowerGraph`。每个有电的建筑放置下来后都会拥有一张自己的电网。如果想把两个建筑接入同一个电网，要么是方块具有`conductPower`属性且相邻，要么是使用电力节点连续起来。前者会在建筑换队或周围有新建筑添加时执行，后者是由电力节点主动调用的。无论是哪种方式，都会使用[BFS算法](https://developer.aliyun.com/article/756316)来合并，同时，由于电力连接关系可能是有环的，所以还维护了一个`closedSet`来避免循环。

当建筑被添加到电网中时，电网会立刻给建筑分配角色：

``` java
  if(build.block.outputsPower && build.block.consumesPower && !build.block.consPower.buffered){
      producers.add(build);
      consumers.add(build);
  }else if(build.block.outputsPower && build.block.consumesPower){
      batteries.add(build);
  }else if(build.block.outputsPower){
      producers.add(build);
  }else if(build.block.consumesPower && build.block.consPower != null){
      consumers.add(build);
  }
```

此外，电网还需要一个类型实体的角色来时刻更新它，这个实体即`PowerGraphUpdater`。此实体会在电网创建时被创建，电网消失时被销毁，负责在游戏更新实体时更新电网。

``` java
public void update(){
    if(!consumers.isEmpty() && consumers.first().cheating()){
        //when cheating, just set status to 1
        for(Building tile : consumers){
            tile.power.status = 1f;
        }

        lastPowerNeeded = lastPowerProduced = 1f;
        return;
    }

    float powerNeeded = getPowerNeeded();
    float powerProduced = getPowerProduced();

    lastPowerNeeded = powerNeeded;
    lastPowerProduced = powerProduced;

    lastScaledPowerIn = (powerProduced + energyDelta) / Time.delta;
    lastScaledPowerOut = powerNeeded / Time.delta;
    lastCapacity = getTotalBatteryCapacity();
    lastPowerStored = getBatteryStored();

    powerBalance.add((lastPowerProduced - lastPowerNeeded + energyDelta) / Time.delta);
    energyDelta = 0f;

    if(!(consumers.size == 0 && producers.size == 0 && batteries.size == 0)){
        boolean charged = false;

        if(!Mathf.equal(powerNeeded, powerProduced)){
            if(powerNeeded > powerProduced){
                float powerBatteryUsed = useBatteries(powerNeeded - powerProduced);
                powerProduced += powerBatteryUsed;
                lastPowerProduced += powerBatteryUsed;
            }else if(powerProduced > powerNeeded){
                charged = true;
                powerProduced -= chargeBatteries(powerProduced - powerNeeded);
            }
        }

        distributePower(powerNeeded, powerProduced, charged);
    }
}
```

方法大致可以分为三步：

- 判断是否为无限火力，若为无限火力，给所有方块都供满电力；
- 计算此刻的实际产电量、电力需要量、电池容量、电池储电量，并把它们根据帧数重整化；
- 判断要存电还是放电，最后分配电量。

``` java
public void distributePower(float needed, float produced, boolean charged){
    //distribute even if not needed. this is because some might be requiring power but not using it; it updates consumers
    float coverage = Mathf.zero(needed) && Mathf.zero(produced) && !charged && Mathf.zero(lastPowerStored) ? 0f : Mathf.zero(needed) ? 1f : Math.min(1, produced / needed);
    var items = consumers.items;
    for(int i = 0; i < consumers.size; i++){
        var consumer = items[i];
        //TODO how would it even be null
        var cons = consumer.block.consPower;
        if(cons.buffered){
            if(!Mathf.zero(cons.capacity)){
                // Add an equal percentage of power to all buffers, based on the global power coverage in this graph
                float maximumRate = cons.requestedPower(consumer) * coverage * consumer.delta();
                consumer.power.status = Mathf.clamp(consumer.power.status + maximumRate / cons.capacity);
            }
        }else{
            //valid consumers get power as usual
            if(consumer.shouldConsumePower){
                consumer.power.status = coverage;
            }else{ //invalid consumers get an estimate, if they were to activate
                consumer.power.status = Math.min(1, produced / (needed + cons.usage * consumer.delta()));
                //just in case
                if(Float.isNaN(consumer.power.status)){
                    consumer.power.status = 0f;
                }
            }
        }
    }
}
```

实际上最后也就是让用电器的`status`变成`produced / needed`，而`status`会作为电力消耗器的委托。

电池在整个流程中的处理是类似的：

``` java
public float chargeBatteries(float excess){
    float capacity = getBatteryCapacity();
    //how much of the missing in each battery % is charged
    float chargedPercent = Math.min(excess/capacity, 1f);
    if(Mathf.equal(capacity, 0f)) return 0f;

    var items = batteries.items;
    for(int i = 0; i < batteries.size; i++){
        var battery = items[i];
        //TODO why would it be 0
        if(battery.enabled && battery.block.consPower.capacity > 0f){
            battery.power.status += (1f - battery.power.status) * chargedPercent;
        }
    }
    return Math.min(excess, capacity);
}
```

从这里可以看出，电网中所有电池会被一个整体。

为了使电力节点显示电力情况的数值更加平滑，电网还有一个 **窗口均值（WindowMean）** ，可以储存上60刻的电力情况，最终输出的实际上是这60刻的平均值。

电网的一些实用方法如下：
- `getBalanced()`：电网的电力情况；
- `getSatisfaction`：电网的满足百分比；
- `getTotalBatteryCapacity()`：电池的总容量；
- `getBatteryCapacity()`：电池的总空余量。

从以上的代码也能看出，实际上方块的唯一一个ConsumePower（唯一性证明见于`init()`）也就是建筑的电力槽。

## 热量传输

热量的传输与物品传输类似，需要相邻方块面对面进行；同时热量传输与电力传输相似，没有具体的物质被传递，甚至不像电力一样存在真正的消耗过程；并且热量系统足够简单，方块的传输情况没有太多特例；最后，热量也是五种资源中添加最晚的一个。因此，原版中的热量传输系统采用了基于匹配的实现，而不是像其他资源一样利用的多态。所谓基于匹配，是指热量的传输完全是由热量的接受者主动去尝试从周围建筑中获取热量数值。

首先是热量的产生者，即`HeatBlock`接口的实现者，这个接口需要实现`heat()`来标记热量产生，用`heatFrac()`标记热量比例。原版中实现HeatBlock接口的包括`HeatProducerBuild`（电热器）、`HeaterGeneratorBuild`（瘤堆）、`NuclearReactorBuild`（钍堆）、`HeatConductor`。

然后是热量的消耗者，即`HeatConsumer`接口的实现者，这个接口需要实现`sideHeat[]()`和`heatRequirement()`前者是各方向的热量入量，后者显然是热量需求了。

以上四个接口暴露的内容实际上都是方块的状态，因此你需要做的就是像原版一样用一个同名变量来实现它。在语法层面上，Java中的方法可以重载，但字段却无法重载，这就是这些接口存在的原因。以上接口的是`heatFrac()`和`sideHeat[]()`在原版中只用于绘制而没有用于运行逻辑。

对于热量的消耗者而言，`sideHeat[]`的更新以及基于此计算方块实际可用热量的过程，可以在同一个方法`calculateHeat(float[])`中完成。由于`sideHeat[]`是一个对象引用，在方法内部修改其元素值会直接影响外部的数组状态。

``` java
public float calculateHeat(float[] sideHeat, IntSet cameFrom) {
    Arrays.fill(sideHeat, 0.0F);
    if (cameFrom != null) cameFrom.clear();
    float heat = 0.0F;
    for (var build : proximity) {
        if (build != null && build.team == team && build instanceof HeatBlock heater) {
            boolean split = build.block instanceof HeatConductor cond && cond.splitHeat;
            if (!build.block.rotate || (!split && (relativeTo(build) + 2) % 4 == build.rotation) || (split && relativeTo(build) != build.rotation)) {
                if (!(build instanceof HeatConductorBuild hc && hc.cameFrom.contains(id()))) {
                    float diff = (Math.min(Math.abs(build.x - x), Math.abs(build.y - y)) / tilesize);
                    int contactPoints = Math.min((int)(block.size / 2.0F + build.block.size / 2.0F - diff), Math.min(build.block.size, block.size));
                    float add = heater.heat() / build.block.size * contactPoints;
                    if (split) {
                        add /= 3.0F;
                    }
                    sideHeat[Mathf.mod(relativeTo(build), 4)] += add;
                    heat += add;
                }
                if (cameFrom != null) {
                    cameFrom.add(build.id);
                    if (build instanceof HeatConductorBuild hc) {
                        cameFrom.addAll(hc.cameFrom);
                    }
                }
                if (heater instanceof HeatConductorBuild cond) {
                    cond.updateHeat();
                }
            }
        }
    }
    return heat;
}
```

::: info 反编译
你如果使用IDEA自带的反编译的话，可能看到的源代码并不长成这样，但是两者是等效的。
:::

这段代码原来并不长这样，在添加热量路由器后Anuke禁止热量传输成环才改成这样的。我们可以先把其中的`cameFrom`去掉再观察它的逻辑：

``` java
public float calculateHeat(float[] sideHeat) {
    Arrays.fill(sideHeat, 0.0F);
    float heat = 0.0F;
    for (var build : proximity) {
        if (build != null && build.team == team && build instanceof HeatBlock heater) {
            boolean split = build.block instanceof HeatConductor cond && cond.splitHeat;
            if (!build.block.rotate || (!split && (relativeTo(build) + 2) % 4 == build.rotation) || (split && relativeTo(build) != build.rotation)) {
                float diff = (Math.min(Math.abs(build.x - x), Math.abs(build.y - y)) / tilesize);
                int contactPoints = Math.min((int)(block.size / 2.0F + build.block.size / 2.0F - diff), Math.min(build.block.size, block.size));
                float add = heater.heat() / build.block.size * contactPoints;
                if (split) {
                    add /= 3.0F;
                }
                sideHeat[Mathf.mod(relativeTo(build), 4)] += add;
                heat += add;
                if (heater instanceof HeatConductorBuild cond) {
                    cond.updateHeat();
                }
            }
        }
    }
    return heat;
}
```

这段代码遍历了周围所有的方块，并筛选出其中本队的`HeatBlock`，再筛选中其中的不可旋转者（如钍堆）、面朝自己的热量传输机和不面朝自己的热量路由器，计算相邻面占其边长的比例，最后按比例添加到`sideHeat[]`和`heat`中，如果输入热量的建筑是热量传输机或热量路由器就再执行其的`updateHeat`方法。

至于`comeFrom`，是用来处理成环问题的，如果检测此热量传输机或热量路由器要向其入度传输，就直接把整个建筑废弃掉。
