# 科技树

在json中，我们有Anuke神佑，赐予我们`research`之力；在js中，我们有传世`lib.js`庇护，赐予我们`addToResearchTree`之力，然而，在Java中，我们没有如此便捷的手段把物品添加到科技树上，只能依靠自己……

## 创建新的科技树

把自己的科技放到一棵新的树上或许是个好主意，你只需要创建一个新的**根节点**就可以了。

::: code-group

``` java
nodeRoot("tutorial", ModItems.tutorialItem, () -> {});
```

``` kotlin
nodeRoot("tutorial", ModItems.tutorialItem) {

}
```

:::

这样你就创建了一颗新的科技树，然后不要忘记给他分配名称。至于贴图，会自动使用根节点的：

```properties
techtree.tutorial = 演示科技树
```

接下来，你可以把别的节点也挂到这棵新树下，新节点的声明和挂载操作如下：

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

新的节点可以用带尾随lambda的重载来继续嵌套，也可以用不带尾随lambda的重载，在Java下更加美观一些。

此外，你每一次使用node方法都会创造一个新的节点；并且，内容是否解锁这一信息存储在内容里而非节点里。这意味着，你可以给同一个内容添加很多个节点，但是他们只要有一个被解锁就会全部解锁。节点的加载顺序决定了节点的绘制顺序，但预测绘制顺序过于复杂。

node方法有许多不同的重载:
- 最简易的版本`node(UnlockbaleContent,Runnable)`只支持方块和单位，消耗若干量物品；
- 如果想添加一些额外的解锁需求，比如占领或着陆某区块，则应该用`node(UnlockbaleContent,Seq<Objective>,Runnable)`；
- 如果想自定义消耗的物品量，用`node(UnlockbaleContent,ItemStack[],Runnable)`或`node(UnlockbaleContent,ItemStack[],Seq<Objective>,Runnable)`；
- 如果是物品或流体，一般解锁需求就是生产出此物品，则应该用`nodeProduce`代替`node`。

比如我们从原版中摘取一些例子：
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

把你的节点挂在原版某个节点上有几步？

- 先找到节点
- 然后挂上去

想找节点很容易，首先我们要先获得节点对应的内容，我们可以直接从`mindustry.content`这个包内获取。获得内容后，如果内容只出现在一棵树上，那么`techNode`字段就是节点了，但如果是像巨浪合金这种挂在两棵树上的，`techNode`获取的是最后一棵树上的，也就是埃里克尔上的节点，如果想要巨浪合金在赛普罗上的节点，我们只好直接从树上获取。

``` java
TechNode[] tmp = new TechNode[]{null};
Planets.serpulo.techTree.each(node -> if(node.content == Items.surgeAlloy) tmp[0] = node);
TechNode surgeAlloyN = tmp[0];
```

接下来，我们需要自己建立一个节点，然后设置新节点的`parent`和父节点的`children`即可：

``` java
TechNode fexAlloyN = nodeProduce(ModItems.fexAlloy, ()-{});
fexAlloyN.parent = surgeAlloyN;
surgeAlloyN.children.add(fexAlloyN);
```