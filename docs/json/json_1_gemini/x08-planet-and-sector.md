# 0x08 行星、区块、生成器与环境方块

> ***“踏足新的星辰，书写你的创世史诗。”***

当地面上的工厂和炮塔已经无法满足你的野心时，是时候将目光投向深空了。Mindustry v6 引入了战役星图系统，允许玩家征服一个个区块，甚至跨越行星。

本章，我们将教你如何铺设地表（环境方块）、创造一个全新的行星（Planet），并为其分配战役区块（Sector）。

**学习本章需要具备的基础：**
- 熟练掌握之前的 JSON 语法。
- 了解 Mindustry 战役模式的基本概念。

---

## 环境方块：构筑世界的地基

在创造星球之前，我们需要新的地表元素。环境方块主要分为三种：地板（Floor）、矿物（OreBlock）和环境墙（StaticWall）。
它们必须放置在 `content/blocks/environment/` 目录下！

::: fatal 贴图放置警告
环境方块的贴图与普通方块不同，**必须**放在模组根目录下的 `sprites/blocks/environment/` 文件夹中。如果没有按照这个路径放置，你的地形将显示为粉黑相间的错误方块！
:::

**1. 地板与矿物 (Floor / OreBlock)**

```hjson
{
  // 基础地板
  type: Floor
  name: 金属废墟地板
  
  // 变体数量。如果你有 metal-floor1.png 到 metal-floor3.png，这里就填 3
  // 游戏在生成地图时会随机拼接这些贴图，避免地形看起来过于重复
  variants: 3
  
  // 玩家踩在上面时的速度惩罚或加成 (1.0 为正常)
  speedMultiplier: 0.9
  
  // 是否是液体（如果填 true，陆地单位走上去会淹死，海军可以通行）
  isLiquid: false
  
  // 覆盖在上面的物体被摧毁或采掘后，掉落什么物品（通常用于矿物方块）
  itemDrop: scrap
}
```

**2. 环境墙 (StaticWall)**
不可跨越、遮挡视野的自然墙体。
```hjson
{
  type: StaticWall
  name: 金属废墟高墙
  variants: 2
}
```

---

## 创造星球：Planet

在 `content/planets/` 目录下新建 `my-planet.hjson`。

```hjson
{
  // 星球的内部名称，建议和文件名一致
  // name: my-first-mod-my-planet
  
  // 星球显示的本地化名称（推荐在 bundles 里配，这里也可以直接写）
  localizedName: 废土星
  
  // 它的父星体。可以是太阳 (sun)，也可以是塞普罗 (serpulo) 作为它的卫星
  parent: sun
  
  // 轨道半径：距离父星体的距离
  orbitRadius: 25
  
  // 星球生成器：JSON 模组的局限
  generator: AsteroidGenerator
  
  // 星球的光环或大气层颜色
  atmosphereColor: 7595D2
  atmosphereRadIn: 0.02
  atmosphereRadOut: 0.3
  
  // 星球的可用起始物品
  hiddenItems: [
    copper, lead
  ]
  
  // 网格生成器：决定了星球在外太空看来的地形地貌
  mesh: {
    type: NoiseMesh
    planet: my-first-mod-my-planet
    seed: 123
    divisions: 4
    color1: 7595D2
    color2: 3a4c73
    radius: 1.2
    octaves: 3
    persistence: 0.8
  }
}
```

::: warning 关于生成器 (Generator) 的局限性
在 Java 模组（如《饱和火力》或《创世神》）中，开发者可以编写复杂的 Java 代码来生成独特的地形生成器逻辑（比如哪里生成高山、哪里生成湖泊）。
**但是，纯 JSON 模组无法编写代码！** 因此，你在 `generator` 字段只能调用原版已有的生成器类（如 `PlanetGenerator`, `AsteroidGenerator`）。这是 JSON 模组在战役设计上最大的短板。
:::

---

## 分配区块：Sector

有了星球，接下来要在它上面划分战役节点。
首先，你需要在游戏内的地图编辑器里画一张地图，并将其导出（或保存在 `maps/` 文件夹下）。然后在 `content/sectors/` 目录下创建 `ruin-base.hjson`：

```hjson
{
  // 这个区块对应的地图文件名称（不需要加 .msav 后缀）
  // 必须保证你的 maps/ 目录下有对应的地图！
  // name: ruin-base-map
  
  // 归属的星球
  planet: my-first-mod-my-planet
  
  // 占据该星球的第几号区块（数字范围通常是 0 到 200+）
  sector: 15
  
  // 难度等级：1是简单，5是极难
  difficulty: 3
  
  // 战役描述
  description: "侦测到大量废弃的金属反应堆。降落并回收这些资源。"
  
  // 解锁条件：必须先通关 groundZero (零号地区) 才能看到这个区块
  research: groundZero
}
```

现在，打包你的模组，打开战役星图，你就会在璀璨的星河中看到属于你自己的那一颗“废土星”了！但是，如果我们想要做原版里没有的东西，该去哪里查属性呢？请翻开下一章：0x09 授人以渔。