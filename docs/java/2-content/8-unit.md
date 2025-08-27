# 单位

> ***为什么要塞搬不动海神啊***

书接上回，Mindustry不仅是自动化游戏，塔防游戏，还是**RTS游戏**，全称**即时战略游戏**，而RTS游戏中的精华就是 **单位（Unit）** 了，单位是原版中设置第二复杂的内容类型。本节将简述单位有关内容。


## 创建一个UnitType

在原版中，`UnitType`是代表一种单位的对象：

::: code-group

```java
new UnitType("tutorial-unit"){{
    constructor = UnitEntity::create;
}};
```

```kotlin
UnitType("tutorial-unit").apply{
    constructor = UnitEntity::create
}
```

:::

这次我们直接把`constructor`介绍出来，它是用来 **创建一个单位实体（Entity）** 的。关于此处的细节暂时不必掌握，我们将在下一章探讨这种关系。至于此字段的值，是由单位的功能确定的，下面是一些可用的值：


- `UnitEntity::create`：普通飞行单位，如星辉、阿尔法，*在json中用`flying`表示*；
- `MechUnit::create`：机甲单位，如战锤、爬虫、新星，*在json中用`mech`表示*；
- `LegsUnit::create`：多足单位，如死星、毒蛛、天守，*在json中用`legs`表示*；
- `UnitWaterMove::create`：海军单位，如梭鱼、潜螺，*在json中用`naval`表示*；
- `PayloadUnit::create`：可荷载单位，如巨像、苏醒、*发散、雷霆、要塞，在json中用`payload`表示*；
- `TimedKillUnit::create`：导弹单位，如创伤的导弹，*在json中用`missile`表示*；
- `TankUnit::create`：坦克单位，如围护、领主，*在json中用`tank`表示*；
- `ElevationMoveUnit::create`：悬浮单位，如挣脱，*在json中用`hover`表示*；
- `BuildingTetherPayloadUnit::create`：建筑绑定单位，*如货运无人机、装配无人机，在json中用`tether`表示*；
- `CrawlUnit::create`：爬虫单位，如Latum、Renale，但爬虫（Crawler）本身只是普通的`MechUnit`，*在json中用`crawl`表示*。

长期以来某些不求甚解的modder认为设置constructor后即可解决问题。但实际上，你应该再去设置一下`EntityMapping`。然而，事情再度反转，在v151后，使用原版`constructor`的单位类型会自动注册`EntityMapping`，而在`constructor`使用自己的`Unit`会使游戏产生新的崩溃并强制要求注册，我们将在下一章详细陈述。

另一方面，`UnitType`也有子类型，不过他们只是在`UnitType`的基础上设置了一些字段，而非增加了什么功能，属于我们之前提到的 **模板（Template）** 类。至于单位的属性，由于所有具体的单位实体都受`UnitType`统辖，所以`UnitType`中的字段既包括所有单位通用的字段，也包括只有某种单位实体会使用的字段。

```properties bundle_zh_CN.properties
unit.tutorial-mod-tutorial-unit.name = 演示单位
unit.tutorial-mod-tutorial-unit.description = 不能攻击，但是会被攻击。
unit.tutorial-mod-tutorial-unit.details = 一无所有
```

```properties bundle.properties
unit.tutorial-mod-tutorial-unit.name = Tutorial Unit
unit.tutorial-mod-tutorial-unit.description = Incapable of attacking, while capable of being attacked.
unit.tutorial-mod-tutorial-unit.details = Nonetheless
```

关于UnitType各字段的含义如下：

（棍母，自己把整个类复制给deepseek就告诉你了）

## 为单位添加武器

没有武器的单位只能当矿机、建造工或者搬运机这些辅助性单位，想对敌人造成伤害或者给友方建筑回血的话，你需要给单位添加武器。单位的武器就一个小炮塔。不同的是，如果不启用“单位弹药限制”规则，单位就无需弹药即可发射，即使启用，也可以直接从核心或容器时自动吸取弹药。单位武器的类型主要是`Weapon`，此外还有`PointDefenseBulletWeapon`点防武器和`RepairBeamWeapon`修复光束武器两个专用类：

::: code-group

```java
new UnitType("tutorial-unit"){{
    constructor = UnitEntity::create;
    weapons.add(new Weapon("tutorial-weapon"){{
        bullet = new BasicBulletType(2.5f, 9);
    }})；
}};
```

```kotlin
UnitType("tutorial-unit").apply{
    constructor = UnitEntity::create
    weapons.add(Weapon("tutorial-weapon").apply{
        bullet = BasicBulletType(2.5f, 9)
    })
}
```

:::

关于Weapon各字段的含义如下：

（棍母，自己把整个类复制给deepseek就告诉你了）

## 单位的贴图

贴图是模组最重要的外在特征，但越是深入了解，贴图就有越多的隐性知识，越多的暗坑，和越多许多modder仍然一知半解的细节。本部分将简要介绍单位实际上需要的全部贴图，至于其内在逻辑将会在后续讲解。

单位最基本的贴图是其本体`tutorial-unit.png`和其cell贴图`tutorial-unit-cell.png`。本体在绘制过程中处在最低层。cell贴图的颜色指示单位的队伍，闪烁速度指示单位的血量，使用`#ffffff` `#dcc6c6` `#9d7f7f`分别标记队伍颜色中的亮、中、暗色，使用其他颜色将会“原色绘制”。此外，游戏会自动给所有的贴图做**描边（Outline）** 和 **线性图像滤波（Linear Image Filter）**，作用是做图像显示起来更加边界分明和平滑，两者的具体原理将在后续讲解，在当前版本中，这两者是全自动执行的，不推荐干涉其过程，也没有必要添加outline贴图。

有这两个贴图还不够，你会发现在核心数据库和建造栏上显示的单位与原版相比有一种怪异的感觉。实际上，原版单位在UI中显示的是其full贴图`tutorial-unit-full.png`。在full贴图中，你应该绘制出单位各个贴图组装完毕后的最终样子，包括全部武器（经过描边）和cell，但最外层的描边工作应当交由游戏去完成，并且也没有必要体现`LegsUnit`全部的腿和单位的引擎。

武器的情况大同小异，本体贴图`tutorial-weapon.png`仍然是不可缺少的，但较小的武器可以没有cell贴图。武器还可以拥有过热贴图`tutorial-weapon.png`，只能使用不同透明度的`#ffffff`，一般需要进行高斯模糊以达到最佳视觉效果。你还可以使用预览贴图`tutorial-weapon-preview.png`设置在核心数据库中武器的图标。

如果你的单位是`LegsUnit`，你还得准备`joint-base` `leg` `joint` `foot`贴图，他们分别是近身关节、普通的腿、腿间关节和脚。如果你的单位是`TankUnit`，你还需要准备`trades`履带贴图，并且v151后，你无需再准备更多。

## 单位的能力

单位的能力（Ability）是独立于战斗系统的一套使单位发挥作用的系统，然而在Mindustry中能力系统常常是为战斗系统服务的。它可以控制单位的行为和绘制，也可以在单位出生或死亡时执行一些操作。

原版中的Ability如下：

- `ArmorPlateAbility`：装甲板能力，在射击时减少受到的伤害；
- `EnergyFieldAbility`：能量场能力，对附近的敌人释放电击，或并治疗友方，如“玄武”；
- `ForceFieldAbility`：力墙场能力，投射一个能吸收子弹的力场护盾，如“耀星”；
- `LiquidExplodeAbility`：死亡溢液能力，死亡时释放液体，如Latum；
- `LiquidRegenAbility`：液体吸收能力，吸收液体以治疗自身，如Latum；
- `MoveEffectAbility`：移动特效能力，边移动边产生特效，如创伤导弹；
- `MoveLightningAbility`：闪电助推器能力，移动时释放闪电，*如v5中的Dart*；
- `RegenAbility`：再生能力，随着时间的推移恢复自己的生命值，如“耀星”；
- `RepairFieldAbility`：修复场能力，修复附近的单位，如“新星”；
- `ShieldArcAbility`：弧形护盾能力，投射一个弧形的力场护盾，能吸收子弹，如“天理”；
- `SpawnDeathAbility`：死亡产生单位能力，死亡时释放单位，如Latum；
- `StatusFieldAbility`：状态场能力，对附近的单位施加状态效果，如电鳗；
- `SuppressionFieldAbility`：修复压制场能力，使附近的修复建筑停止工作，如“龙王”；
- `UnitSpawnAbility`：单位生成能力，建造单位，如“海神”。

## 单位命令与姿态

单位命令（UnitCommand）与姿态（UnitStance）是v8中新添加的两种内容类型，应用于RTS系统。单位命令可以更换单位的AI。单位姿态给单位标记**状态（State）**，本身没有功能，只是供单位控制器读取并作出反应。由于与AI的强耦合性，现阶段没有必要注册新的单位命令和姿态。

单位支持的姿态和命令既可以手动指定，也可以让游戏根据单位本身的参数自动添加。

关于单位采矿菜单中没有模组矿物的问题，你只需要注册一个新的`ItemUnitStance`，并给单位添加这个姿态就好了：

``` java
ItemUnitStance item1mine = new ItemUnitStance(ModItems.item1);
UnitTypes.mono.stances.add(item1mine);
//省略若干单位
```