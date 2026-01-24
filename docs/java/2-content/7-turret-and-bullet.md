# 炮塔和子弹

> ***喜欢我石墨雷光吗？***

Mindustry 包含自动化与塔防（Tower Defense）元素。炮塔是防御体系的核心组件，也是自动化系统的资源消耗节点，并作为科技树推进的重要环节。炮塔发射的子弹类型（BulletType）是内容系统的重要组成部分，本节将介绍炮塔与子弹的相关机制。

炮塔的基本构成包括子弹类型（BulletType）、射击方式（ShootPattern）、炮塔绘制器（Drawer）中的绘制部件（DrawPart）、冷却剂系统以及方块基础属性，下文将逐一说明。
为了方便理解以下内容，这里提供一个最小模板：

::: code-group

``` java
new ItemTurret("tutorial-item-turret"){{
    requirements(Category.turret, with(Items.copper, 39));
    ammo(Items.copper, new BasicBulletType(1.5f, 9));
    shoot = new ShootPattern();
    drawer = new DrawTurret(){{
        parts.add(new RegionPart("-barrel"));
    }};
    consumePower(40f);
    coolant = consumeCoolant(0.1f);
}};
```

``` kotlin
ItemTurret("tutorial-item-turret").apply {
    requirements(Category.turret, with(Items.copper, 39))
    ammo(Items.copper, BasicBulletType(1.5f, 9))
    shoot = ShootPattern()
    drawer = DrawTurret().apply{
        parts.add(RegionPart("-barrel"))
    }
    consumePower(40f)
    coolant = consumeCoolant(0.1f)
}
```

:::

## 子弹类型（BulletType）

子弹类型规定了子弹的类型、运动、大小、伤害、能力、目标、行为、功能、与其他子弹的交互、绘制和特效等。在此无法全部列举，如需完整了解可参阅源代码。子弹并不局限于传统意义的金属子弹，例如太空环境下的液体泡（`SpaceLiquidBulletType`），或没有贴图的 `EmptyBulletType`，以及激光、水珠、点激光等。非炮塔方块也能发射子弹，例如质量驱动器的 `MassDriverBolt`。整体而言，子弹是具有确定速度和寿命、由类炮塔方块发射的实体。

要新建一个子弹类型，只需要实例化一个 `BulletType` 的具体子类：

::: code-group

``` java
new BasicBulletType(1.5f, 9);
```

``` kotlin
BasicBulletType(1.5f, 9)
```

:::

其中构造方法的两个参数分别为子弹速度和伤害。在 v6 版本之前，子弹类型作为独立的内容类（`mindustry.content.BulletType`）进行加载。当前版本中，该类虽已不再承担原有的加载功能，但子弹类型仍属于内容体系，是 `Content` 的子类。

`BulletType` 是子弹类型的抽象基类，所有具体子弹类型都从它派生。这意味着不能直接实例化 `BulletType` 本身。从功能上看，它自身不具备绘制贴图的能力，仅负责绘制尾迹（Trail）和配合炮塔绘制器工作。以下简要介绍一些重要字段：

<!--@include: ./reference/7-1-bullet-type-fields.md-->

`BulletType`类的字段之间存在特定的搭配规则和互斥关系，需要通过测试来验证其实际效果。

关于代码内部的距离单位，有的是格，有的是世界单位，它们之间的换算关系是`1格=8世界单位=32方块贴图像素`。

对于具有实体体积的子弹，`BulletType`的子类`BasicBulletType`通常已能满足基本需求，其他子类主要是在此基础上预设了不同的字段值。在原版中，这种不重写方法而仅通过预设字段来定义不同行为的方式称为**模板（Template）**。以下是一些常见的实体子弹类型：

- `BasicBulletType`：常规子弹，例如“双管”使用的子弹；
- `BombBulletType`：轰炸弹，例如“天垠”使用的子弹，命中后停留并造成范围伤害；
- `MissileBulletType`：导弹，例如“蜂群”使用的子弹，会生成尾迹效果；
- `ArtilleryBulletType`：炮弹，例如“冰雹”使用的子弹，可提前结束生命周期并带有尾迹特效；
- `FlakBulletType`：高射炮弹，例如“分裂”使用的子弹，可在目标附近爆炸，无需直接命中；
- `LaserBoltBulletType`：激光弹，例如“新星”使用的子弹，在基础贴图上叠加绘制两条彩色光线；
- `InterceptorBulletType`：拦截弹，与`PointDefenseBulletWeapon`配合使用，当前版本中未实际应用；
- `EmpBulletType`：电磁脉冲弹，例如“龙王”使用的子弹，可降低敌方建筑速度并对范围内单位与建筑造成伤害；
- `MassDriverBolt`：质量驱动器抛射物，由质量驱动器发射，可造成伤害。其内容物会影响伤害值。在`v149`版本中，Anuke添加了使用质量驱动器击杀敌人的成就。

综上所述，`BulletType`系统虽然核心是为有实体、有弹道的抛射物（如炮弹、子弹）设计的，但其灵活的设计也允许它服务于另一类特殊的攻击形式。`BulletType`类的这种特殊用法称为“虚拟子弹”或“空子弹”模式，适用于需要子弹系统管理生命周期和触发逻辑，但不需要实际弹道运动的情况。通过将`speed`设为0、`collide`设为`false`，可以创建一个静止的子弹实体，然后通过其`draw`和`update`方法实现远程绘制和伤害效果，常用于激光武器、持续光束、区域效果等非弹道型攻击。

- `PointLaserBulletType`：用于采矿激光，例如“光辉”，其视觉效果与钻头光束类似；
- `PointBulletType`：用于点防御激光，例如“裂解”，表现为绘制一条线段并消除命中的子弹；
- `LightningBulletType`：用于释放闪电链，例如“电弧”；
- `ShrapnelBulletType`：用于发射激光尖刺，例如“雷光”；
- `LaserBulletType`：用于发射激光束，例如“蓝瑟”；
- `LiquidBulletType`：用于发射液体球体，例如“波浪”；
- `RailBulletType`：用于模拟轨道炮攻击，例如“厄兆”，表现为瞬间命中目标；
- `ExplosionBulletType`：用于创建爆炸效果，例如“遏止”主炮的终结攻击；
- `SapBulletType`：用于施加抑制效果，例如“血蛭”，表现为绘制紫色线条并施加状态效果；
- `ContinuousLaserBulletType`：用于持续激光武器，例如“熔毁”，开火后可维持一段时间；
- `ContinuousLiquidBulletType`：用于持续液体喷射武器，例如“升华”，开火后可无限期维持；
- `MultiBulletType`：用于组合上述多种子弹类型的效果。

以上就是原版中的主要子弹类型了。未来你也可以自己定制子弹类型，并进一步理解子弹的生命周期与背后的 ECS（Entity-Component-System）思想。

## 射击方式（ShootPattern）

- `ShootPattern`：定义了发数`shots`、首发延迟`firstShotDelay`和间发延迟`shotDelay`。该模式为默认射击方式，通常设置为单发，也存在如“天灾”设置为两发的实例；
- `ShootBarrel`：所有炮管依次发射，通过`barrels`设置炮管的x、y坐标和方向，例如“蜂群”。受炮塔结构限制，其炮管无法像单位的武器那样独立运作；
- `ShootAlternate`：多个间距相等、沿x轴排列的炮管依次发射，通过`barrels`设置炮管数量，`spread`设置炮管间距。例如“双管”，以及多管炮塔如四管的“发散”和五管的“天谴”；
- `ShootSpread`：多个间隔角度相等的子弹同时发射，通过`spread`设置间隔角度（角度制），例如“雷光”；
- `ShootSine`：多个发射角度呈正弦周期变化的子弹同时发射，原版内容中未使用此模式；
- `ShootHelix`：使发射出的子弹按正弦曲线运动，例如“天谴”；
- `ShootSummon`：在一定区域范围内发射角度随机的子弹，例如“魔灵”；
- `ShootMulti`：可组合上述多种射击模式。

上述“依次发射”是指，当`shots`设定的子弹数量大于炮管数量时，子弹会按炮管顺序循环发射。例如“蜂群”有三个炮管，若设置`shots=4`，则每次射击会依次使用三个炮管发射共四发子弹。

## 炮塔绘制器

炮塔和工厂一样拥有`drawer`字段，常与炮塔搭配的drawer是`DrawTurret`，用于将炮塔的完整贴图分解为多个可独立运动的`DrawPart`（绘制部件），通过控制每个部件的位移、旋转等参数，实现动态视觉效果，例如原版“魔灵”炮塔的分块动画。

首先介绍`DrawTurret`所需的贴图。`DrawTurret`使用的贴图均为可选，包括大小预览贴图`-preview`、液体层贴图`-liquid`、顶层贴图`-top`、热量贴图`-heat`和基座贴图`-base`。这些贴图仅在找到时被绘制，不会产生“ohno”贴图。对于流体层贴图，还需要指定`liquidDraw`来设置要绘制的流体。

<!--@include: ./reference/7-4-drawpart.md-->

示例：让炮管在开火后回缩，并在末段加一点呼吸抖动：

``` java
var part = new RegionPart("-barrel");
part.progress = PartProgress.recoil;
part.moveY = -3f;
part.moves.add(new PartMove(PartProgress.recoil.delay(0.6f), 0f, -0.6f, 0f));
```

此处我们以魔灵为例，结合代码解析以上内容：

<!--@include: ./reference/7-3-malign.md-->

## 创建一个Turret

有了这些东西，是时候创建一个炮塔了。

::: code-group

``` java
new ItemTurret("tutorial-item-turret"){{
    requirements(Category.turret, with(Items.copper, 39));
    ammo(Items.copper, new BasicBulletType(1.5f, 9));
    shoot = new ShootPattern();
    drawer = new DrawTurret(){{
        parts.add(new RegionPart("-barrel"));
    }};
    consumePower(40f);
    coolant = consumeCoolant(0.1f);
}};
```

``` kotlin
ItemTurret("tutorial-item-turret").apply {
    requirements(Category.turret, with(Items.copper, 39))
    ammo(Items.copper, BasicBulletType(1.5f, 9))
    shoot = ShootPattern()
    drawer = DrawTurret().apply{
        parts.add(RegionPart("-barrel"))
    }
    consumePower(40f)
    coolant = consumeCoolant(0.1f)
}
```

:::

炮塔类型具有明确的专用性，这主要源于不同子弹类型在功能实现上的显著差异。
炮塔的基类包括`BaseTurret`、`ReloadTurret`和`Turret`，其主要功能涵盖射程`range`（单位为像素，1格=8像素）、冷却时间`reload`、子弹容量`maxAmmo`的设置，以及上文在`BulletType`中已提及的部分字段。

常见的炮塔类型包括：
- `ItemTurret`：物品炮塔，使用`ammo(...)`方法设置弹药与子弹类型；
- `LiquidTurret`：流体炮塔，使用`ammo(...)`方法设置弹药与子弹类型；
- `PowerTurret`：电力炮塔，使用`consumePower`方法设置电力消耗，通过`shootType`字段设置子弹类型；
- `LaserTurret`：激光炮塔（例如“熔毁”而非“蓝瑟”），通常建议使用`ContinuousLaserBulletType`作为子弹类型，并通过`shootDuration`字段设置持续时间；
- `ContinuousTurret`：连续炮塔（例如“光辉”），开火后可持续射击，需配合具有连续效果的子弹类型；
- `ContinuousLiquidTurret`：连续流体炮塔（例如“升华”），使用`ammo(...)`方法设置弹药与子弹类型，需配合具有连续效果的子弹类型。

部分方块虽归类于炮塔建造栏，但其功能与常规炮塔存在差异：
- `TractorBeamTurret`：牵引光束类
- `PointDefenseTurret`：点防御类
- `BuildTurret`：建造塔类

使用 `ammo` 方法声明子弹类型的示例如下：

``` java
ammo(Items.copper,  new BasicBulletType(3.5f, 18),
     Items.lead, new FlakBulletType(4.2f, 3))
```

在炮塔建筑中，当物品进入炮塔的一瞬间就会变成弹药。

炮塔类的部分字段如下：

<!--@include: ./reference/7-2-turret-fields.md-->
