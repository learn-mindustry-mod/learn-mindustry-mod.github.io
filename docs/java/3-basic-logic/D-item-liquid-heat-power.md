# 物流/液体/热量/电力的物流传输逻辑

Mindustry中的各种资源从产生到消耗，中间必然会经历传输的过程。传输过程是资源生命周期的重点部分。本节我们将聚焦原版中五种主要资源中四种的传输过程与相关元件的机理，载荷部分将会放到下一节介绍。

物品传输是流体和载荷传输逻辑的基础。而热量与电力系统机理则完全不同。

## 物品传输

### 物品的传输过程

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

物品在中间环节的传输存在一个封装的方法`moveForward(Item)`，此方法可以将一个物品传输给前方的方块，返回值代表传输是否成功。传输失败的原因可能包括前方无建筑、前方建筑不属于本队伍或前方建筑拒绝接受物品。物品在各物流元件中的运输逻辑是直接调用`acceptItem`和`handleItem`方法实现的，并未使用此封装方法。

普通建筑的物品输出通常使用单个输出的`dump()`方法或全部输出的`dumpAccumulate()`方法，判断是否可以输出则使用`canDump()`方法。工厂类建筑则通常使用`offload()`方法，该方法在`dump()`的基础上还调用了`produced()`方法来处理区块的生产资源。此外，`put()`方法也会尝试输出物品，但与`dump()`不同的是，如果输出失败，`put()`会返回false，而`dump()`会将物品保留在建筑的物品槽中。

此外，原版为了做到物品每次输出时都能均匀向各个方向输出，还使用了`cdump`这一变量。并在每次输出的时候`incrementDump`更新这一计数器，以每次都选择`proximity`周围方块中不同的一个。
