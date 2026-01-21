# 炮塔和子弹

> ***喜欢我石墨雷光吗？***

Mindustry不仅是自动化游戏，还是**塔防（Tower Defense）**游戏。炮塔是防御敌人进攻的重要手段，也是自动化系统资源的消耗端，更是使玩家推进科技树的重要动力。而炮塔发射的子弹类型（BulletType）也是重要的内容，本节将简要介绍炮塔和子弹。

炮塔的基本组成部分包括子弹类型（BulletType）、射击方式（ShootPattern）、炮塔绘制器（Drawer）中的绘制片段（DrawPart）、冷却剂和方块基本属性，下面将分别讲解。

为了方便你学习以下内容，此处先呈现一个模板：

::: code-group

``` java
new ItemTurret("tutorial-item-turret"){{
    requirements(Category.turret, with(Items.copper, 39));
    ammo(Items.copper, new BasicBullet(1.5f,9));
    shoot = new ShootPattern()
    drawer = new DrawTurret(){{
        parts.putAll();
    }};
    consumePower(40f);
    coolant = consumeCoolant(0.1f);
}}；
```

``` kotlin
ItemTurret("tutorial-item-turret").apply{
    requirements(Category.turret, with(Items.copper, 39))
    ammo(Items.copper, BasicBullet(1.5f,9))
    shoot = ShootPattern()
    drawer = DrawTurret().apply{
        parts.putAll()
    }
    consumePower(40f)
    coolant = consumeCoolant(0.1f)
}
```

:::

## 子弹类型（BulletType）

子弹类型规定了子弹的类型、运动、大小、伤害、能力、目标、行为、功能、与其他子弹的交互、绘制和特效等。在此不能全部列举完毕，如果想要完全了解，可参阅源代码。此外，子弹并不一定是“子弹”，比如太空环境下的液体泡（`SpaceLiquidBulletType`），有的炮塔发射出来的东西并非传统意义上的“子弹”，可能干脆是没有贴图的`EmptyBulletType`，或者是激光、水珠、点激光和点方之类的，当然并非炮塔的方块也能发射出子弹，比如质量驱动器的`MassDriverBolt`。整体上来说，“子弹”真正的含义可以说是 **具有确定速度和寿命的、由类炮塔方块发射出来的实体**

要新建一个子弹类型，只需要实例化一个类型为`mindustry.type.BulletType`的对象：

::: code-group

``` java
new BasicBullet(1.5f,9);
```

``` kotlin
BasicBullet(1.5f,9)
```

:::

其中，构造方法的两个参数分别为子弹速度和伤害。在v6以前，子弹类型是独立于炮塔和单位存在的，有自己的一个独立内容类`mindustry.content.BulletType`方便加载，如今此类已经名存实亡了，但子弹类型仍然是一种内容，是`Content`的子类。

`BulletType`是子弹类型的抽象基类，所有具体子弹类型都是从它派生出去的。这意味着你不能直接实例化它。从功能上，它缺少的就是**绘制**自身贴图，只会绘制尾迹（Trail）和炮塔的绘制器。下简要介绍一些重要的字段：

<!--@include: ./reference/7-1-bullet-type-fields.md-->

使用`BulletType`类时需注意字段之间存在固定的搭配规则和互斥关系，需要多次测试以达到预期效果。

对于体积子弹而言，`BulletType`的子类`BasicBulletType`已经足够满足需求，子类型只是做了一些字段的设置。在原版中这样没有重写方法增加功能，而只是预设了一些字段的现象叫做**模板（Template）**。以下是有体积子弹的所有类型：

- `BasicBulletType`：常规子弹，例如“双管”；
- `BombBulletType`：轰炸弹，例如“天垠”，原地不动并造成溅射伤害；
- `MissileBulletType`：导弹，例如“蜂群”，会有概率绘制一些尾迹；
- `ArtilleryBulletType`：炮弹，例如“冰雹”，可提前结束寿命，并绘制尾迹特效；
- `FlakBulletType`：高射炮，例如“分裂”，可在单位附近爆炸造成伤害而不需要直接击中；
- `LaserBoltBulletType`：激光弹，例如“新星”，在贴图之上绘制两条带有颜色的线；
- `InterceptorBulletType`：点防弹，与`PointDefenseBulletWeapon`捆绑使用，目前没有使用，推测是为瘤液更新准备的；
- `EmpBulletType`：电磁屏蔽弹，例如“龙王”，降低敌方建筑速度，并在范围内伤害敌方单位与建筑；
- `MassDriverBolt`：质量驱动弹，由质量驱动器发射，也可造成伤害。内容物可以影响子弹的伤害。在`v149`Anuke添加了使用质驱杀死敌人的成就。

综上所述，`BulletType`系统虽然核心是为有实体、有弹道的抛射物（如炮弹、子弹）设计的，但其灵活的设计也允许它服务于另一类特殊的攻击形式。`BulletType`类的这种特殊用法称为“虚拟子弹”或“空子弹”模式，适用于需要子弹系统管理生命周期和触发逻辑，但不需要实际弹道运动的情况。通过将`speed`设为0、`collide`设为`false`，可以创建一个静止的子弹实体，然后通过其`draw`和`update`方法实现远程绘制和伤害效果，常用于激光武器、持续光束、区域效果等非弹道型攻击。

- `PointLaserBulletType`：采矿激光，例如“光辉”，长得像钻头光束一样；
- `PointBulletType`：点防激光，例如“裂解”，画一条线然后消灭掉子弹；
- `LightningBulletType`：闪电，例如“电弧”，释放一道闪电；
- `ShrapnelBulletType`：激光尖，例如“雷光”，释放一道激光尖刺；
- `LaserBulletType`：激光，例如“蓝瑟”，释放一道激光；
- `LiquidBulletType`：液体球，例如“波浪”，发射液体球；
- `RailBulletType`：轨道炮，例如“厄兆”，瞬间击中目标；
- `ExplosionBulletType`：爆炸，例如“遏止”主炮的尾杀，瞬间造成爆炸；
- `SapBulletType`：抑制，例如“血蛭”，绘制一根紫线并给予状态效果。
- `ContinuousLaserBulletType`：连续激光，例如“熔毁”，一旦开火可以保持一段时间；
- `ContinuousLiquidBulletType`：连续液体激光，例如“升华”，一旦开火可以无限长时间保持；
- `MultiBulletType`：组合以上子弹类型。

以上就是原版中的全部子弹类型了。在未来你也可以自己定制一个子弹类型，并了解到子弹的整个生命周期和背后的ECS（Entity-Component-System）思想。

## 射击方式（ShootType）

射击方式决定了子弹何时、何处被射出，原版共有以下几种：

- `ShootPattern`：定义了发数`shots`，首发延迟`firstShotDelay`和间发延迟`shotDelay`。是默认的射击方式，默认设置为单发，也有像“天灾”一样设置成两发的；
- `ShootBarrel`：所有炮管依次发射，用`barrels`设置炮管的x、y和方向，例如“蜂群”。炮塔的构造导致炮管不能像单位的武器那样独立；
- `ShootAlternate`：多个间距相等、排列在x轴上的炮管依次发射，用`barrels`设置炮管数，`spread`设置按距离的间距。例如“双管”，多管的，如四管的“发散”和五管的“天谴”；
- `ShootSpread`：多个间隔角度相等的子弹同时发射，用`spread`设置间隔的角度（角度制），例如“雷光”。
- `ShootSine`：多个角度成正弦周期变化的子弹同时发射，原版未使用；
- `ShootHelix`：使发射出的子弹按正弦曲线运动，例如“天谴”；
- `ShootSummon`：在一定区域范围内发射角度随机的子弹，例如“魔灵”；
- `ShootMulti`：组合以上ShootPattern。

以上所说的`依次发射`，是`shots`发子弹依次在每个炮管上发射。例如蜂群有三个炮管，但`shots`为4，则会在每次发射时依次从三个炮管中发射四发子弹。

## 炮塔绘制器

炮塔和工厂一样拥有`drawer`字段，常与炮塔搭配的drawer就是`DrawTurret`，用于将炮塔的完整贴图分解为多个可独立运动的`DrawPart`（绘制部件），通过控制每个部件的位移、旋转等参数，实现复杂的动态视觉效果，如原版“魔灵”炮塔的分块动画。

首先介绍`DrawTurret`所需的贴图。`DrawTurret`需要的贴图全部都是可选的，包括大小预览贴图`-preview`、液体层贴图`-liquid`、顶层贴图`-top`、热量贴图`-heat`和基座贴图`-base`。这些贴图只有在找到的时候才会被绘制，不会产生“ohno”贴图。对于流体层贴图，你还需要指定`liquidDraw`来设置要绘制的流体。

### `DrawPart`

正如上文所说，`mindustry.entities.part.DrawPart`是可独立运动的绘制部件的抽象基类，有六个派生类可以执行具体的操作。

#### `RegionPart`

#### `ShapePart`

#### `HaloPart`

#### `FlarePart`

#### `EffectSpawnerPart`

### `PartProgress`

此处我们以魔灵为例，结合代码解析以上内容：

<!--@include: ./reference/7-3-malign.md-->

## 创建一个Turret

有了这些东西，是时候创建一个炮塔了。

::: code-group

``` java
new ItemTurret("tutorial-item-turret"){{
    requirements(Category.turret, with(Items.copper, 39));
    ammo(Items.copper, new BasicBullet(1.5f,9));
    shoot = new ShootPattern()
    drawer = new DrawTurret(){{
        parts.putAll();
    }};
    consumePower(40f);
    coolant = consumeCoolant(0.1f);
}}；
```

``` kotlin
ItemTurret("tutorial-item-turret").apply{
    requirements(Category.turret, with(Items.copper, 39))
    ammo(Items.copper, BasicBullet(1.5f,9))
    shoot = ShootPattern()
    drawer = DrawTurret().apply{
        parts.putAll()
    }
    consumePower(40f)
    coolant = consumeCoolant(0.1f)
}
```

:::

虽然炮塔经过组件化改写，但炮塔类型专用性仍然很强，归根结底是由于不同类型的子弹处理方式差异巨大。

炮塔的基类是`BaseTurret`、`ReloadTurret`和`Turret`，主要承担的功能包括设置射程`range`（单位是像素，1格=8像素），冷却时间`reload`，子弹容量`maxAmmo`，以及上方在BulletType中已经涉及的部分字段。

如果你想要的是一个“炮塔”：
- `ItemTurret`：物品炮塔，使用`ammo(...)`设置弹药和子弹类型；
- `LiquidTurret`：流体炮塔，使用`ammo(...)`设置弹药和子弹类型；
- `PowerTurret`：电力炮塔，使用consumePower设置耗电，使用`shootType`字段设置子弹类型；
- `LaserTurret`：激光炮塔，指的是“熔毁”而不是“蓝瑟”，最好只使用`ContinuousLaserBulletType`作为子弹类型，通过shootDuration设置时长；
- `ContinuousTurret`：连续炮塔，一旦开炮可以永不停火，如“光辉”，需要有连续的子弹类型与之配套；
- `ContinuousLiquidTurret`：连续流体炮塔，如“升华”使用`ammo(...)`设置弹药和子弹类型，需要有连续的子弹类型与之配套；

有的东西并非炮塔，但在建造栏里和炮塔是在一起的：
- `TractorBeamTurret`：差扰光束类
- `PointDefenseTurret`：点防类
- `BuildTurret`：建造塔类

使用ammo声明子弹的方式如下：

``` java
ammo(Items.copper,  new BasicBulletType(3.5f, 18),
     Items.lead, new FlakBulletType(4.2f, 3))
```

在炮塔建筑中，当物品进入炮塔的一瞬间就会变成弹药。

炮塔类的部分字段如下：

<!--@include: ./reference/7-2-turret-fields.md-->