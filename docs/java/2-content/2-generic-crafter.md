
# 工厂

- 创建一个GenericCrafter
- 声明消耗项（Consume） // 引子 - 消耗系统
- 常规产出项
- 绘制器（Drawer） // 引子 - 自定义drawer
- 一些特殊的工厂子类型 // 引子 - 环境与Attribute


> ***游戏的灵魂***

作为一个工厂+塔防+RTS游戏，Mindustry的第一大灵魂一定就是工厂了。广义上来说，工厂就是一个转换器（Transformer），负责把原材料加工成产品。

## 创建一个GenericCrafter

像物品和流体一样，方块也被封装成了一个类型`mindustry.world.Block`。不过，不同方块有着不同的功能，这就需要方块拥有不同的类型。因此，我们在创建一个方块的时候，需要根据需要的功能选择合适的类型。而要创建一个通用工厂，我们需要的类型为`mindustry.world.blocks.production.GenericCrafter`。

```java
new GenericCrafter("tutorial-crafter");
```

```kotlin
GenericCrafter("tutorial-crafter")
```

:::

和上节一样，你可以选择简单地在主类的`loadContent()`里创建这个对象，也可以选择选择新建一个类来存放所有的方块。

## 方块的共性

这一次事情没有这么顺利——你在核心数据库和建造栏中均没有见到这个方块。

事实上这是一个正常现象，原因是你还没有对方块做任何的设置