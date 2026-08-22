# 方块与建筑 (Block & Building)

从这一章开始，我们将学习 Mindustry 中最重要的部分——方块。

但在深入代码之前，必须先理清两个核心类：`Block`（方块模板）和 `Building`（方块实体）。很多萌新会把它们的用法混淆，导致代码写对了却无法生效。

让我们从一个真实的萌新求助案例开始：**“为什么我的墙体不会回血？”**

```javascript
// 错误示范
const nickelWall = extend(Wall, "nickel-wall", {
    updateTile() { 
        this.heal(0.1); // 每秒恢复6点
    },
    health: 360,
    armor: 1,
    size: 1,
    // ... 其他属性
});
exports.nickelWall = nickelWall;
```

**为什么代码无效？**  
因为 `updateTile` 是 `Building` 类的方法，但萌新却把它写到了 `Block` 类定义中。游戏每 `tick` 调用的只是方块实体（`Building`）的 `updateTile`，而 `Block` 里的 `updateTile` 永远不会被执行。

> **特别注意：** 即使你把 `updateTile` 正确写在了 `Building` 类中，如果你的 `Block` 定义里没有开启更新开关，`updateTile` 依然不会执行。在这里, `Wall` 类的 `update` 默认是 `false`，所以必须在 Block 上声明 `update: true` 才能让方块动起来。

---

## 正确写法与结构

下面是我们修正后的标准写法：

```javascript
const nickelWall = extend(Wall, "nickel-wall", {
    update: true,       // 必须开启更新！
    health: 360,
    armor: 1,
    size: 1,
    // ... 
});

// 定义这个 Block 对应的 Building 实例
nickelWall.buildType = prov(() => extend(Wall.WallBuild, nickelWall, {
    updateTile() {
        this.heal(0.1); // 这里才是真正生效的恢复逻辑
    }
}));

exports.nickelWall = nickelWall;
```

`buildType` 是 Block 类中负责**建造建筑**的工厂字段。当方块在地图被放置时，游戏通过这个工厂创建一个 `Building` 实例，并挂在 `tile` 上。

![基本关系](./imgs/BlockAndBuilding.png)

---

## Block类：静态的“设计图”

`Block` 类是游戏中所有方块的父类。你可以把它看作是**建造菜单里的选项**、**图鉴里的条目**，或者一份**工程图纸**。  
游戏里每种方块**只有一份 `Block` 实例**，它是**只读且共享**的。它记录了“这个方块**是什么**”：

- 尺寸大小、血量上限、贴图纹理
- 建造需求、能否旋转、能否被超速驱动
- 产出/消耗规则、图鉴统计数据
- `update: true` 或 `false` 等静态开关

### 为什么 `updateTile` 不能写在 Block 里？

因为 `Block` 只是图纸，图纸不会自己“动”，只有实际的建筑（实体）才会动。游戏每 `tick` 更新时不会读取 `Block` 的实例方法。而是 `Building` 的实例方法.

---

## Building类：动态的“实体状态”

`Building` 类描述的是**铺在地图上的那一个个实际的方块**。  
它记录了“这个方块**现在怎么样**”：

- 当前血量、当前库存（物品/液体）
- 电力连接情况、生产进度条、所属队伍、朝向
- 每 `tick` 被调用的 `updateTile()`
- 被击中时触发 `damage()`
- 绘制时调用 `draw()`

每一块放置在地图上的方块，都有一个独立的 `Building` 实例。这就是为什么我们之前会强调 **Block 要保存内存中共享的静态数据，而 Building 保存实例独有的动态数据**。这样可以避免大量建筑造成内存浪费（享元模式）。

---

## Block 与 Building 的特殊归属（反常识点）

**新手很容易误认为：** 所有显示类的、绘制类的、UI类的，都应该写在 `Building` 里。**这是不对的。**

有些看似作用于“方块”的方法，实际上属于静态的 `Block` 类：

- `setStats()`：设置图鉴里的数据面板（耗能、产量等）。
- `drawPlace()`：当你拿着方块悬停在地面时，绘制放置预览的效果（比如红/绿区域判定）。

这些方法在 `Block` 里定义，是因为它们是**描述整个方块类型“特性”**的内容，而不是某一个建筑个体的具体状态。不依赖具体某个建筑的特定时刻的具体数据（血量、库存）的静态特性，都应该写在 Block 里。

> `setBar`大概是个例外.它写在Block里,通过特定的方法获取属于这个Block的Building实例的特定参数来完成UI显示.

---

## 两者的桥梁：Tile 和 buildType

方块最终是如何变成实体的？中间靠 `Tile` 网格坐标作为桥梁。

1. 玩家在地图某个坐标放置方块。
2. `tile.setBlock(block)` 被调用。
3. 游戏会执行 `block.newBuilding()`（内部也就是你在 JS 里填写的 `buildType` 工厂函数）。
4. 一个新的 `Building` 实例被创建，存入 `tile.build` 变量中。
5. 这个 `Building` 实例内部又通过 `this.block` 指回它的模板 Block。

四者的关系大概可以形象的理解为: `Block` 是图纸，`buildType` 是施工队，`Building`实例 是盖出来的大楼，`Tile` 是这块地基。

---

## 如何在 Java 源码中找到对应的 Building 类

如果在阅读 Java 源码（例如 `Wall.java`）时，想找到对应方块的 `Building` 子类，它通常是 `Block` 类里的一个内部类。看下面的节选：

```java
public class Wall extends Block {
    // ... Block 属性的定义

    // 下面这个内部类就是它对应的 Building 实体
    public class WallBuild extends Building {
        public float hit;

        @Override
        public void draw() {
            super.draw();
            // ... 绘制逻辑
        }
    }
}
```

在 JavaScript 中继承它时，需要加上外部类的限定名，即使用 `Wall.WallBuild`（如开头代码示例所示）。

---

## 总结：两者关系的架构本质

- 享元模式：`Block` 是享元，被所有同类建筑共享，只存储**静态、不变、只读**的配置数据。
- 实体模式：`Building` 是实体，存储**动态、多变、实例化**的实际状态。
- 非典型“类型-对象”模式：抽象部分由 `Block` 充当类型，具体的 `Building` 充当对象，而 `buildType` 负责两者的桥接与实例化。用一句话总结：**Block 是游戏世界规则的制定者（图纸），Building 是这一规则的执行者和体现者（实体）。**
