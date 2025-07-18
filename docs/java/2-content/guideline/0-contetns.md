2.1 物品（Item）与流体（Liquid）
- 创建一个Item
- 为物品赋予名字和描述
- 为物品分配图像
- 物品的属性
- 整理并列表
- 流体（Liquid）

几个小问题
- `new Item("sampleItem");`这个构造方法有必要提出来吗？
- `sprite` `image` `texture`统一一下译名


2.2 工厂方块（GenericCrafter）
- 创建一个GenericCrafter
- 声明消耗项（Consume） // 引子 - 消耗系统
- 常规产出项
- 绘制器（Drawer） // 引子 - 自定义drawer
- 一些特殊的工厂子类型 // 引子 - 环境与Attribute

2.3 钻头（Dirll）与泵（Pump）
- 创建一个Dirll
- 钻头的消耗项声明
- 创建一个Pump
- 共性

2.4 电力方块 // 引子 - PowerGraph
- 各类发电机（Generator）
- 创建电力节点（PowerNode）
- 电池（Battery）

2.5 状态效果（StatusEffect）
- 创建一个状态
- 状态的视觉效果 // 引子 - 特效Fx

2.6 炮台（Turret）与子弹（BulletType）
- 创建子弹类型（BulletType）// 引子 - 子弹的原理与自定义
- 各类炮塔（Turret）与创建方式
- 弹药声明（Ammo）
- 炮塔的绘制器（TurretDrawer）

2.7 单位（Unit）
- 创建一个单位（Unit）
- 为单位添加武器（Weapon）
- 单位的一般贴图文件构成
- 添加单位的能力（Ability） // 引子 - 自定义能力

2.8 如何查找自己需要的类型