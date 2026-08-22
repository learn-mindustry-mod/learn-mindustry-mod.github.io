# 0x09 如何找到自己需要的类和字段

> ***“授人以鱼，不如授人以渔。”***

一路走来，你或许会产生一个巨大的疑问：“教程里列出了 `health`、`craftTime`、`speed` 这些属性，**可如果我想写一个教程里没提到的东西，我怎么知道该填什么单词呢？**”

如果你只会抄别人的代码，那你永远只能做别人做过的模组。要成为真正的 Modder，你必须学会**直接查阅原版源码**。本章，我们将教你这门最重要的“破壁”手艺。

**学习本章需要具备的基础：**
- 知道如何访问 Mindustry 的 GitHub 开源仓库 (https://github.com/Anuken/Mindustry)。

---

## 为什么要看 Java 源码？

Mindustry 是由 Java 编写的。你所写的 JSON（或者 Hjson）文件，其实并不是“代码”，它们只是**数据配置单**。
游戏在启动时，会读取你的 JSON 单子，然后根据里面的 `type` 去 Java 源码里找对应的类，把单子上的数据填进去。

例如：
当你写下 `type: GenericCrafter` 和 `craftTime: 80` 时。游戏会去 Java 源码里找到 `GenericCrafter.java` 这个文件，看看里面有没有一个叫 `craftTime` 的变量。如果有，就把 80 赋给它。

这就意味着：**Java 源码里写了什么，你在 JSON 里就能填什么！**

---

## 去哪里找字段？

打开 Mindustry 的 GitHub 仓库，导航到核心逻辑目录：`core/src/mindustry/`。这里有几个你必须眼熟的文件夹：

- `world/blocks/`：所有方块的源码都在这里（如 `production`, `defense`, `power`）。
- `type/`：物品 (Item)、流体 (Liquid)、单位 (UnitType)、子弹 (BulletType) 的源码。
- `gen/`：包含一些自动生成的底层逻辑（如特效声音引用）。

### 实战演示：寻找炮塔的属性

假设我们想做一个炮塔，但想知道它还有没有除了 `reload` 以外的属性。
1. 在仓库里找到 `core/src/mindustry/world/blocks/defense/turrets/ItemTurret.java`。
2. 打开文件，在顶部你会看到类的定义和一大排变量声明：
```java
public class ItemTurret extends Turret {
    // ...
    public float ammoPerShot = 1f;
    public int maxAmmo = 30;
    // ...
}
```
**看！** 这里写着 `public int maxAmmo = 30;`。这意味着你可以在你的 JSON 里写 `maxAmmo: 50` 来修改这个炮塔的最大弹药装载量！原版默认是 30。

::: tip 继承与通性 (Inheritance)
你可能会发现 `ItemTurret.java` 里找不到 `health` 或者 `size`！为什么？
注意看它类的开头：`class ItemTurret extends Turret`（ItemTurret 继承自 Turret）。
这意味着它不仅有自己的字段，还**全盘继承**了 `Turret` 的字段。
顺藤摸瓜：`Turret` 又继承自 `Block`。
所以，去 `Block.java` 里，你就能找到 `health`、`size` 这些所有方块共有的属性了！
:::

---

## 去哪里找内部名？(Internal Names)

在编写 `requirements` 或是 `parent` 时，我们经常需要填原版物品或方块的**内部英文名**（比如塑钢是 `plastanium`）。但是中文翻译往往让人猜不透英文名是什么，去哪找呢？

在 Mindustry 源码仓库中，有两个地方可以找：
1. **原版数据的定义处**：`core/src/mindustry/content/` 目录下（例如 `Items.java`, `Blocks.java`）。在这里你能看到所有原版元素的正式注册名称。
2. **多语言文件**：`core/assets/bundles/bundle_zh_CN.properties`。如果你用 Ctrl+F 搜索“塑钢”，你就能直接看到 `item.plastanium.name=塑钢`，瞬间就能明白它的内部名是 `plastanium`。

::: info 获取官方源码包
如果你觉得每次都在网页上翻 GitHub 太慢，强烈建议在项目主页点击绿色的 `Code -> Download ZIP`，将原版源码下载到本地。使用 VSCode 打开这个文件夹，利用它的**全局搜索功能**，你的开发效率将提升十倍！
:::

当你掌握了查阅源码的技巧，你就再也不需要等待别人写教程了。整个 Mindustry 浩瀚的属性库已经向你敞开。接下来，让我们更进一步，看看游戏底层究竟是如何将 JSON 翻译成 Java 的。