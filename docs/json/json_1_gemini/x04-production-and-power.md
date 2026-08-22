# 0x04 生产机制与电力网络

> ***“每一束电流，都是星际开拓的脉搏。”***

单调的“输入A产出B”工厂显然无法满足一个复杂模组的需求。在这一章中，我们将进一步打破常规，教你如何制作输出多种产物的分离器、从地心榨取资源的采掘机，以及能够支撑起庞大工业体系的各式发电机。

**学习本章需要具备的基础：**
- 熟练掌握 0x03 中方块共通属性和消耗器（`consumes`）的配置。

---

## 多输出工厂：打破单一产出

如果你希望一个工厂能够像原版的分离机（Separator）一样，同时产出多种不同的物品，或者带有一定随机概率产出，你必须抛弃单调的 `outputItem` 字段，改用它的复数形态。

::: tip 生产类型的选择
对于一般的并行多产出工厂，依然可以使用 `type: GenericCrafter`，并通过 `outputItems` 数组来定义。
如果你需要的是**随机产出**（比如原版的矿渣分离机），你需要使用专用的子类 `type: Separator`。
:::

**固定多产出示例 (联合化工厂)：**
```hjson
{
  type: GenericCrafter
  name: 联合化工厂
  size: 3
  craftTime: 120
  
  // 重点：使用数组来定义多个同时生成的产物
  outputItems: [
    silicon/2
    graphite/1
  ]
  
  // 如果同时还要生成流体副产物，可以添加：
  // outputLiquid: slag/0.2
  
  consumes: {
    items: [ coal/3, sand/2 ]
    power: 2.0
  }
}
```

---

## 采掘方块：向大地索取

物品不仅可以通过工厂合成，最原始的来源是大地。挖掘固体矿物的方块使用 `Drill`（钻头），抽取液体资源的方块使用 `Pump`（抽水机）。

**采矿钻头示例：**
```hjson
{
  type: Drill
  size: 2
  
  // 采掘层级 (Tier)：决定了它能挖什么矿。
  // 2代表可以挖铜、铅、钛（钛的 hardness 为 3，钻头 tier 必须 >= hardness）
  // 注意：原版设定中，气动钻头 tier=2，激光钻头 tier=3。
  tier: 3
  
  // 基础挖掘一次所需的时间（Tick）
  drillTime: 300
  
  // 挖掘时产生的液体消耗倍率（如果玩家给它供水）
  liquidBoostIntensity: 1.5
  
  // 设置它在不使用水时，必须消耗别的材料或电力才能工作
  consumes: {
    power: 1.2
  }
}
```

---

## 发电方块：点亮工业帝国

电力是模组的血液。发电机的类型繁多，最常用的有 `ConsumeGenerator`（消耗型发电机，如火力发电机、钍反应堆）和 `ThermalGenerator`（热能发电机）。

在这方面，《饱和火力》模组的“弧裂反应堆”和“大地热能发电机”为我们提供了极佳的学习范本。

### 1. 消耗型发电机 (ConsumeGenerator)

通过燃烧或裂变特定物品/流体来发电。你可以设定非常灵活的消耗规则：

```hjson
{
  type: ConsumeGenerator
  size: 4
  
  // 发电量：每 Tick 产生的电力。550 意味着每秒产电 33000！
  powerProduction: 550
  
  // 每次消耗一组燃料能够维持发电的时间（Tick）
  itemDuration: 19.5
  
  // 发电时冒出的粒子特效名称
  generateEffect: generatespark
  
  // 灵活的消耗器
  consumes: {
    // 基础消耗：以每Tick 0.9 的速度消耗纳米流体
    liquid: my-first-mod-nano-fluid/0.9
    
    // 高级用法：它不指定具体的某种矿物，而是消耗【任何带有放射性】的物品！
    // 只要该物品的 radioactivity > 0 就会被当做燃料吃掉。
    itemRadioactive: {}
    
    // 同理，消耗任何具有爆炸性的物品
    // itemExplode: {}
  }
}
```

### 2. 热能发电机 (ThermalGenerator)

不需要输入特定的燃料，而是依靠被放置在特定环境方块（如岩浆、热结晶岩）上获取热量来发电。

```hjson
{
  type: ThermalGenerator
  size: 3
  
  // 基础发电量
  powerProduction: 3.6
  
  // 依赖的地板属性：必须放置在带有 'heat' (热能) 属性的地板上
  attribute: heat
  
  // 如果你想做一个靠“吸水”发电的潮汐发电机，可以改用：
  // attribute: water
  
  // 悬浮属性：设置为 true 允许它直接建造在岩浆、水等液态地表上
  floating: true
}
```

::: info 发电效率的计算
对于 `ThermalGenerator`，最终的实际发电量 = `powerProduction` × 所覆盖地板的平均 `attribute` 效能。例如，红热岩浆的 `heat` 值很高，发出的电就多；而普通沙地没有 `heat` 值，发电机将完全罢工。
:::

到这里，你已经掌握了生产与电力的核心秘密。利用这些机制，尽情设计你的资源循环链路吧！在接下来的章节中，我们将探索具有毁灭性威力的武装设施——炮塔。