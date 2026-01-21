# 科技树

在Java中添加科技树没有在JSON或Javascript模组中那样简单，你需要手动操作每一个节点才能创建一棵科技树，但这也赋予了你更大的自定义空间。本节我们将介绍如何创建新的科技树，以及如何将内容添加到原版科技树上。

## 创建新的科技树

若想创建一棵新的科技树，只需要创建一个新的**根节点**。

::: code-group

``` java
nodeRoot("tutorial", ModItems.tutorialItem, () -> {});
```

``` kotlin
nodeRoot("tutorial", ModItems.tutorialItem) {

}
```

:::

这样你就创建了一颗新的科技树。不要忘记给他分配名称。至于在战役科技界面的图标，则默认是根节点内容的贴图：

```properties bundle_zh_CN.properties
techtree.tutorial = 演示科技树
```

接下来，你可以把别的节点也挂载到这棵新树下，新节点的声明和挂载操作如下：

::: code-group

``` java
nodeRoot("tutorial", ModItems.tutorialItem, () -> {
    nodeProduce(ModLiquids.tutorialLiquid);
    node(ModBlocks.tutorialCrafter, () ->{});
});
```

``` kotlin
nodeRoot("tutorial", ModItems.tutorialItem) {
    nodeProduce(ModLiquids.tutorialLiquid)
    node(ModBlocks.tutorialCrafter) {

    }
}
```

:::

在Kotlin中新的节点可以用带尾随lambda的重载来继续嵌套。在叶子节点（即没有子节点的节点）也可以用不带尾随lambda的重载。

每次使用node方法都会创造一个新的节点。并且，“内容是否已经解锁”这一信息存储在内容本身而非其节点。这意味着，你可以给同一个内容添加很多个节点，但是只要有一个被解锁，所有相同内容的节点就会被解锁。节点的加载顺序决定了节点的绘制顺序。

`node`方法有许多不同的重载:
- 最简易的版本`node(UnlockbaleContent,Runnable)`只支持方块和单位，按照内容的`researchRequirements()`消耗若干量物品，对于方块而言这个方法又可以被`researchCost`和`researchCostMultiplier`，如果没有用这两个字段控制，则默认为 `建筑消耗^1.1 * 20`，取整到十位；
- 如果想添加一些额外的解锁需求，比如占领或着陆某区块，则应该用`node(UnlockbaleContent,Seq<Objective>,Runnable)`，`mindustry.game.Objectives.Objective`类代表的是解锁条件，其实现类包括：研究内容`Research`、生产资源`Produce`、占领区块`SectorComplete`，着落区块`OnSector`、登陆行星`OnPlanet`。详情可以参见各类的构造方法参数；
- 如果想在节点级别自定义消耗的物品量，用`node(UnlockbaleContent,ItemStack[],Runnable)`或`node(UnlockbaleContent,ItemStack[],Seq<Objective>,Runnable)`；
- 如果是物品或流体，且解锁需求就是生产出此资源，则应该用`nodeProduce`。

以原版部分代码为例：

``` java
Planets.serpulo.techTree = nodeRoot("serpulo", coreShard, () -> {
    node(router, () -> {
        node(advancedLaunchPad, Seq.with(new SectorComplete(extractionOutpost)), () -> {
            node(landingPad, () -> {
                node(interplanetaryAccelerator, Seq.with(new SectorComplete(planetaryTerminal)));
            });
        });
        node(distributor);
    });
    node(groundZero, () -> {
        node(frozenForest, Seq.with(
            new SectorComplete(groundZero),
            new Research(junction),
            new Research(router)
            ), () -> {
                node(craters, Seq.with(
                new SectorComplete(frozenForest),
                new Research(mender),
                new Research(combustionGenerator)));
            });
    });
    nodeProduce(Items.copper, () -> {
        nodeProduce(Liquids.water)
    });
});

```

## 挂载原版科技树

把你的科技树节点挂在原版某个节点之下分为两步：先获取那个节点的引用，再把自己的节点添加为其子节点。

为了获取科技树节点的引用，首先需要获得该节点对应的游戏内容（如物品或方块）的引用。接下来，根据内容所属的科技树情况，有以下两种获取方式：

1.  **内容仅属于一棵科技树**：此时该内容对象的 `techNode` 字段即直接指向其唯一的节点引用。
2.  **内容属于多棵科技树**（例如“巨浪合金”同时出现在“埃里克尔”和“赛普罗”两棵科技树中）：`techNode` 字段默认指向其**最后被注册**到的那棵树上的节点。若需获取其在另一棵特定树上的节点，则不能依赖此字段，而需要**直接通过该科技树对象进行查询获取**。

::: code-group

``` java
TechNode[] tmp = new TechNode[]{null};
//隐式final规则
Planets.serpulo.techTree.each(node -> if(node.content == Items.surgeAlloy) tmp[0] = node);
TechNode surgeAlloyN = tmp[0];
```

```kotlin
var surgeAlloyN: TechNode? = null
Planets.serpulo.techTree.each { node ->
    if (node.content == Items.surgeAlloy) {
        surgeAlloyN = node
    }
}
```

:::

接下来，我们需要自己建立一个节点，然后设置新节点的`parent`和父节点的`children`即可：

::: code-group

``` java
TechNode fexAlloyN = nodeProduce(ModItems.fexAlloy, ()->{});
fexAlloyN.parent = surgeAlloyN;
surgeAlloyN.children.add(fexAlloyN);
```

```kotlin
// 确保节点已找到
surgeAlloyN?.let { parentNode ->
    val fexAlloyN = nodeProduce(ModItems.fexAlloy) { }
    fexAlloyN.parent = parentNode
    parentNode.children.add(fexAlloyN)
}
```

:::

## 行星资源消耗

在Mindustry中，科技树中节点的解锁需要消耗星球区块核心内的资源。而一颗科技树可以使用哪些星球是由星球的`techTree`字段和节点的`planet`字段决定的，具体来说，可以使用节点`planet`属性引用的星球，和`techTree`属性被设置为此科技树根节点的星球。此外，如果根节点是一个核心方块，那么游戏会试图寻找`defaultCore`为此核心方块的星球。如果无法寻找到符合要求的星球，则默认会消耗赛普罗的资源。