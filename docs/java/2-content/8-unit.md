# 单位

> ***为什么要塞搬不动海神啊***

Mindustry不仅是一款自动化与塔防游戏，同时也具备**即时战略（RTS）** 游戏的要素。在RTS游戏中，**单位（Unit）** 是核心组成部分之一，也是原版中设计复杂度较高的内容类型。本节将简要介绍与单位相关的内容。


## 创建一个UnitType

在Mindustry中，单位被封装成了`mindustry.type.UnitType`这一类型。与以往的类型不同的是，其拥有必需的字段`constructor`，它是用来 **创建一个单位实体（Entity）** 的**提供器（Provider）**，其取值与所需单位实体的种类有关，见于下表：

::: code-group

```java
new UnitType("tutorial-unit"){{
    constructor = UnitEntity::create;
    EntityMapping.nameMap.put(name, constructor)
}};
```

```kotlin
UnitType("tutorial-unit").apply{
    constructor = UnitEntity::create
    EntityMapping.nameMap.put(name, constructor)
}
```

:::

- `UnitEntity::create`：普通飞行单位，如星辉、阿尔法，*在json中用`flying`表示*；
- `MechUnit::create`：机甲单位，如战锤、爬虫、新星，*在json中用`mech`表示*；
- `LegsUnit::create`：多足单位，如死星、毒蛛、天守，*在json中用`legs`表示*；
- `UnitWaterMove::create`：海军单位，如梭鱼、潜螺，*在json中用`naval`表示*；
- `PayloadUnit::create`：可荷载单位，如巨像、苏醒，*发散、雷霆、要塞，在json中用`payload`表示*；
- `TimedKillUnit::create`：导弹单位，如创伤的导弹，*在json中用`missile`表示*；
- `TankUnit::create`：坦克单位，如围护、领主，*在json中用`tank`表示*；
- `ElevationMoveUnit::create`：悬浮单位，如挣脱，*在json中用`hover`表示*；
- `BuildingTetherPayloadUnit::create`：建筑绑定单位，*如货运无人机、装配无人机，在json中用`tether`表示*；
- `CrawlUnit::create`：爬虫单位，如Latum、Renale。但爬虫（Crawler）本身只是普通的`MechUnit`，*在json中用`crawl`表示*。

仅设置constructor可能不足以完成单位的完整注册。实际上，通常还需要在`EntityMapping`中进行相应的映射配置。不过，当使用原版提供的标准`constructor`时，相关的`EntityMapping`注册通常会自动完成。而如果`constructor`指向自定义的`Unit`实体类，则必须手动进行`EntityMapping`的注册，否则游戏会直接抛出错误。关于自定义单位实体的详细注册流程，我们将在下一章进行说明。

另一方面，`UnitType`也存在子类型，但这些子类型主要是在`UnitType`的基础上预设了部分字段值，并未引入新的功能，属于之前提到的 **模板（Template）** 类。关于单位的属性，由于所有具体的单位实体均由`UnitType`统一管理，因此`UnitType`中的字段既包含了所有单位通用的属性，也包含了仅特定单位实体才会使用的属性。

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

<!--@include: ./reference/8-1-unittype.md-->

## 为单位添加武器

单位武器是单位实现攻击或修复功能的核心组件，其本质是一个可移动的小型炮塔。与建筑武器不同，单位武器在默认游戏规则下无需消耗弹药即可发射；若启用“单位弹药限制”规则，单位则可以从核心或容器中自动获取所需弹药。武器的主要实现类为`Weapon`，此外还存在两个专用子类：`PointDefenseBulletWeapon`用于实现点防御功能，`RepairBeamWeapon`用于实现修复光束功能。

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

<!--@include: ./reference/8-2-weapon.md-->

## 单位的贴图

贴图是模组最重要的外在特征之一，其实现细节会随着深入理解而逐渐显现。本部分将简要介绍单位实际所需的全部贴图，其内在逻辑将在后续章节详细说明。

单位的基本贴图包括本体贴图`tutorial-unit.png`和队伍色贴图`tutorial-unit-cell.png`。本体贴图在绘制时位于最底层。队伍色贴图用于指示单位的所属队伍，其颜色闪烁速度与单位生命值相关。该贴图使用`#ffffff`、`#dcc6c6`、`#9d7f7f`三种颜色分别标记队伍颜色中的亮部、中部和暗部区域，使用其他颜色将导致该区域被原样绘制。此外，游戏会自动为所有单位贴图应用**描边（Outline）**和**线性图像滤波（Linear Image Filter）**处理，以使图像边界更清晰、显示更平滑。这两项处理的具体原理将在后续章节说明。在当前版本中，该过程为全自动执行，通常无需干预，也无须额外提供描边贴图。

仅有上述两种贴图可能不足以满足所有显示需求。例如，在核心数据库和建造栏中，单位图标若仅使用本体贴图，其视觉效果可能与原版单位存在差异。原版单位在这些界面中通常使用完整预览贴图`tutorial-unit-full.png`。在绘制完整预览贴图时，应呈现单位组装完成后的最终外观，包括所有武器（含描边效果）和队伍色区域。但最外层的最终描边应由游戏自动处理，且无需绘制`LegsUnit`的全部腿部细节或单位的推进器效果。

武器贴图的处理原则类似。武器本体贴图`tutorial-weapon.png`是必需的，但尺寸较小的武器可以不提供队伍色贴图。武器还可以拥有过热效果贴图`tutorial-weapon-heat.png`，该贴图仅能使用不同透明度的`#ffffff`白色，通常经过高斯模糊处理以达到最佳视觉效果。此外，可通过预览贴图`tutorial-weapon-preview.png`来设置在核心数据库中显示的武器图标。

对于`LegsUnit`（多足单位），还需准备以下贴图：`joint-base`（近身关节）、`leg`（腿部）、`joint`（腿部关节）和`foot`（足部）。对于`TankUnit`（坦克单位），需要准备履带贴图。自版本v151起，通常只需提供一张`-tread`贴图，游戏即可自动生成内部所需的其他相关贴图。

## 单位的能力

单位的能力（Ability）是独立于战斗系统的一套使单位发挥作用的系统，在Mindustry中能力系统常与战斗系统结合使用。它可以控制单位的行为和绘制，也可以在单位出生或死亡时执行特定操作。

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

单位命令（UnitCommand）与姿态（UnitStance）是v8中新添加的两种内容类型，应用于RTS系统。单位命令可以更换单位的AI。单位姿态给单位标记**状态（State）**，本身没有功能，只是供单位AI读取并作出反应。由于与AI的强耦合性，现阶段没有必要注册新的单位命令和姿态。

单位支持的姿态和命令既可以手动指定，也可以让游戏根据单位本身的参数自动添加。

关于单位采矿菜单中缺少模组矿物的问题，可通过注册新的`ItemUnitStance`并将其添加至单位姿态列表来解决：

``` java
ItemUnitStance item1mine = new ItemUnitStance(ModItems.item1);
UnitTypes.mono.stances.add(item1mine);
//省略若干单位
```

## 单位AI

单位AI是控制单位行为的逻辑系统，当单位处于非玩家队伍或无玩家控制时，由AI接管其决策与行动。玩家队伍的单位则由`CommandAI`管理，其行为受单位指令系统调控。

原版中的AI存放于`mindustry.ai.type`包内，包含以下几种类型。部分AI的使用需要满足特定条件：

（WIP）

在给单位的`aiController`字段赋值时，需要提供一个`Prov`类型的值。例如，可以直接填入`GroundAI::new`这样的表达式。通常不建议直接为`controller`字段赋值，因为该字段用于根据单位命令类型判断单位是使用无玩家队伍的AI，还是使用玩家队伍的`CommandAI`。

## 单位工厂与重构厂
