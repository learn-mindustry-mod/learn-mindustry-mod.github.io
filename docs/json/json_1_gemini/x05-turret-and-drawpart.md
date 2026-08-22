# 0x05 炮塔、弹药与 DrawPart

> ***“口径即是正义，射程即是真理。”***

没有强大的防御火力，你辛辛苦苦建立的硅钢生产线迟早会被敌人的炮火撕碎。在 Mindustry 中，炮塔（Turret）是保护核心的最重要屏障。

本章，我们将以《饱和火力》中的经典武装为灵感，学习如何制作使用物品作为弹药的物理火炮，以及消耗电力的能量武器，并深入研究 v7 版本赋予炮塔动态灵魂的 **DrawPart** 系统。

**学习本章需要具备的基础：**
- 理解方块共通属性（如 `size`, `health`, `requirements`）。

---

## 炮塔分类与基础弹药：ItemTurret

使用物品作为弹药的炮塔称为 `ItemTurret`。它的精髓在于：**填入不同的子弹，打出不同的效果**。

在 `content/blocks/turrets/` 目录下创建一个 `heavy-cannon.hjson`（重型火炮）：

```hjson
{
  type: ItemTurret
  name: 重型火炮
  description: 发射大口径穿甲弹，对单体目标造成毁灭性打击。
  size: 3
  health: 1200
  
  // 射击属性
  reload: 60           // 装填时间（60 Tick = 1 秒）
  range: 240           // 射程（1 像素 = 1/8 方块，240 大约是 30 个方块的距离）
  recoil: 3            // 开火时的整体后坐力（炮管向后退的像素）
  shootCone: 15        // 射击锥角，只有目标进入炮口正前方 15 度范围内才会开火
  inaccuracy: 2        // 精准度误差（度数），数值越大越马枪
  
  // 转速与声音
  rotateSpeed: 2.5
  shootSound: bang     // 原版射击音效
  
  // 核心：弹药类型配置
  ammoTypes: {
    // 放入铜时发射的子弹
    copper: {
      type: BasicBulletType
      damage: 45
      speed: 5
      lifetime: 48     // speed * lifetime = 240，刚好等于炮塔射程
      width: 9
      height: 12
      ammoMultiplier: 2 // 1个铜可以转化为2发子弹
    }
    
    // 放入我们在 0x02 做的硅钢时，发射更强的穿甲弹
    my-first-mod-silicon-steel: {
      type: BasicBulletType
      damage: 120
      pierce: true     // 穿透效果
      pierceCap: 3     // 最多穿透 3 个目标
      speed: 8
      lifetime: 30     // 8 * 30 = 240
      width: 11
      height: 18
      frontColor: ffffff
      backColor: 7595D2
      ammoMultiplier: 1
      shootEffect: shootTitan // 开火时的原版特效
      smokeEffect: shootBigSmoke
    }
  }
  
  requirements: [
    copper/200
    lead/100
    graphite/50
  ]
  category: turret
}
```

---

## 能量武器与动态炮管：PowerTurret 与 DrawPart

除了消耗弹药，你还可以制作直接消耗电力的 `PowerTurret`。
更重要的是，在 v7 时代，炮塔有了 **DrawTurret** 和 **DrawPart** 系统。这就意味着，你可以让你的炮塔拥有独立伸缩的炮管、发光的散热片，甚至是旋转的雷达！

创建一个 `laser-blaster.hjson`（光束发生器）：

```hjson
{
  type: PowerTurret
  name: 光束发生器
  size: 2
  health: 600
  reload: 40
  range: 180
  
  // 能量武器无需 ammoTypes，直接定义 shootType
  shootType: {
    type: LaserBulletType
    damage: 90
    length: 180
    colors: [7595D266, 7595D2, ffffff]
  }
  
  // 电力消耗：每Tick消耗 2 点（每秒 120）
  consumes: {
    power: 2.0
  }
  
  // 高级多部件绘制系统
  drawer: {
    type: DrawTurret
    // basePrefix 决定了炮塔底座的贴图，默认是 block-
    basePrefix: reinforced-
    
    // 活动部件列表
    parts: [
      {
        // 声明一个区域图层部件（需要额外画一张 laser-blaster-barrel.png）
        type: RegionPart
        suffix: -barrel     // 寻找以 '-barrel' 结尾的贴图
        mirror: false       // 是否镜像对称（如果炮管在中间就填 false，双管填 true）
        under: false        // 是否绘制在炮塔主体下方
        
        // 动画触发器：recoil 表示跟随开火后坐力动作
        progress: recoil
        
        // 动作表现：触发后坐力时，这个部件在 Y 轴（炮塔朝向）上向后退 2 像素
        moveY: -2.0
      }
    ]
  }
  
  requirements: [
    lead/50
    silicon/30
  ]
  category: turret
}
```

::: info 进阶动作 (progress)
除了 `recoil`（后坐力），`progress` 还可以是 `warmup`（预热，只要有目标就会上升）、`charge`（蓄力，跟随射击蓄力阶段）、`heat`（枪管发热）等。通过组合不同的部件和进度，你可以做出如同《饱和火力》中“先驱”炮塔那样机械感十足的动态火炮！
:::

在设计了强大的炮塔之后，接下来我们该让这些子弹打在敌人身上时，产生更加震撼的视听反馈了。请看下一章：0x06 状态效果与特效。