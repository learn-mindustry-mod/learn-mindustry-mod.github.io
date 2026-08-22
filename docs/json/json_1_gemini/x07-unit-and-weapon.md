# 0x07 单位、武器与单位工厂

> ***“钢铁洪流，撕裂长空。”***

如果说炮塔是防守的磐石，那么单位（Unit）就是进攻的利剑。在 Mindustry 中，从最弱小的星辉（Flare）到毁天灭地的暗影（Eclipse），全部属于单位的范畴。

本章，我们将以《饱和火力》中强大且复杂的特种单位（如“伊塔”）为参考，教你如何配置单位的基础属性、挂载多路武器（Weapon），并最终搭建一座生产它们的单位工厂。

**学习本章需要具备的基础：**
- 掌握 0x05 中关于子弹和射击的基本配置逻辑。

---

## 飞行与陆地单位基础配置

在 `content/units/` 目录下，新建一个 `phantom-drone.hjson`（幻影无人机）。

决定一个单位是地上爬的还是天上飞的，核心在于 `flying: true/false` 以及它的 `type` 类。

```hjson
{
  // 对于飞行单位，默认 type 是 flying (或者 hovering)
  // 对于陆地单位，通常是 legs (蜘蛛/机甲) 或 treads (履带坦克)
  type: flying
  name: 幻影无人机
  description: 快速的侦察与骚扰单位，装备了轻型激光武器。
  
  // 核心机动属性
  flying: true         // 是否在空中飞行
  speed: 3.5           // 移动速度
  accel: 0.1           // 加速度
  drag: 0.05           // 空气阻力/摩擦力
  rotateSpeed: 5.0     // 转向速度
  
  // 生存属性
  health: 450
  armor: 2             // 护甲：每一点护甲可以抵消固定数值的伤害
  hitSize: 12          // 碰撞箱大小 (决定了它多容易被敌人的子弹打中)
  
  // 引擎表现 (屁股后面的喷火)
  engineOffset: 6      // 引擎距离中心的距离
  engineSize: 2.5      // 引擎火焰的大小
  
  // 死亡时的爆炸特效 (复习一下上节课的 MultiEffect)
  deathExplosionEffect: {
    type: WaveEffect
    sizeFrom: 0
    sizeTo: 40
    colorFrom: ffffff
    colorTo: ff5555
  }
```

---

## 挂载武器 (Weapons)

单位之所以能战斗，是因为身上挂载了武器。武器定义在 `weapons` 这个数组中，你可以给它挂载任意数量的武器！

在上面的文件末尾继续添加：

```hjson
  weapons: [
    {
      name: light-laser-mount  // 武器的贴图名称（如果你画了额外的炮管）
      
      // 武器挂载位置的偏移量
      x: 4                     // 距离单位中心线(中轴)的水平距离。如果是4，游戏会自动为你生成左右对称的两把武器！
      y: 2                     // 偏前或偏后的距离
      
      reload: 30               // 武器的开火间隔
      shootSound: laser        // 射击音效
      
      // 武器转动逻辑
      rotate: true             // 是否允许这把武器独立转动瞄准敌人
      rotateSpeed: 5           // 武器转速
      
      // 子弹定义 (和炮塔中的一模一样！)
      bullet: {
        type: LaserBoltBulletType
        damage: 25
        speed: 6
        lifetime: 40
        frontColor: ffffff
        backColor: ffaaaa
        healPercent: 2         // 如果打到友军，还能顺便奶一口
      }
    }
  ]
}
```

::: warning 对称武器的奥秘
只要你将武器的 `x` 设置为非 0 的正数（例如 `x: 4`），并且没有设置 `mirror: false`，Mindustry 底层就会自动为你生成镜像对称的另一把武器（即一把在 `+4`，一把在 `-4`）。所以你不需要写两次相同的武器代码！
:::

---

## 生产它们：单位工厂 (UnitFactory)

有了单位蓝图，还需要工厂把它们制造出来。
在 `content/blocks/units/` 目录下，创建一个 `drone-factory.hjson`：

```hjson
{
  type: UnitFactory
  name: 无人机工厂
  size: 3
  health: 600
  
  // 生产电力消耗
  consumes: {
    power: 1.5
  }
  
  // 生产计划数组：这个工厂可以生产哪些单位
  plans: [
    {
      // 要生产的单位内部名
      unit: my-first-mod-phantom-drone
      
      // 生产一台需要耗费的时间 (Tick)
      time: 600
      
      // 生产一台需要耗费的材料
      requirements: [
        silicon/30
        lead/20
      ]
    }
    // 如果工厂还可以生产其他单位，在这里继续加大括号添加
  ]
  
  requirements: [
    copper/100
    lead/50
    silicon/50
  ]
  category: units
  research: ground-factory
}
```

::: info 升级单位 (Reconstructor)
如果你做的是 T2、T3 甚至 T5 的庞然大物，你需要用到重构机（`Reconstructor`）。在 JSON 中，重构机并不直接绑定某个特定单位，而是通过 `upgrades` 数组定义一条“升级路线”。例如：`upgrades: [ [dagger, mace], [flare, horizon] ]`。
:::

现在，你拥有了自己绘制的单位、为其搭配了火力，并通过单位工厂将它们送上了战场！
模组开发的 JSON 基础篇到这里就告一段落了。随着你对这些配置愈发熟悉，你可以尝试组合它们，或者前往 0x09 学习如何查阅源代码，以解锁属于你自己的专属定制方块！