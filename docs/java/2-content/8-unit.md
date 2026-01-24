# 单位

> ***为什么要塞搬不动海神啊***

Mindustry 不仅是一款自动化与塔防游戏，同时也具备**即时战略（RTS）**游戏的要素。在 RTS 游戏中，**单位（Unit）** 是核心组成部分之一，也是原版中设计复杂度较高的内容类型。本节将简要介绍与单位相关的内容。


## 创建一个 UnitType

在 Mindustry 中，单位被封装成了`mindustry.type.UnitType`这一类型。与以往的类型不同的是，其拥有必需的字段`constructor`，它是用来 **创建一个单位实体（Entity）** 的**提供器（Provider）**，其取值与所需单位实体的种类有关，见于下表：

::: code-group

``` java
new UnitType("tutorial-unit"){{
    constructor = UnitEntity::create;
    EntityMapping.nameMap.put(name, constructor);
}};
```

``` kotlin
UnitType("tutorial-unit").apply{
    constructor = UnitEntity::create
    EntityMapping.nameMap.put(name, constructor)
}
```

:::

- `UnitEntity::create`：普通飞行单位，如 `flare`、`alpha`，*在 JSON 中用 `flying` 表示*；
- `MechUnit::create`：机甲单位，如 `mace`、`crawler`、`nova`，*在 JSON 中用 `mech` 表示*；
- `LegsUnit::create`：多足单位，如 `toxopid`、`corvus`、`collaris`，*在 JSON 中用 `legs` 表示*；
- `UnitWaterMove::create`：海军单位，如 `risso`、`sei`，*在 JSON 中用 `naval` 表示*；
- `PayloadUnit::create`：可载荷单位，如 `mega`、`quad`、`oct`，以及埃里克尔的 `evoke`、`incite`、`emanate`、`quell`、`disrupt`，*在 JSON 中用 `payload` 表示*；
- `TimedKillUnit::create`：导弹单位，如创伤的导弹，*在 JSON 中用 `missile` 表示*；
- `TankUnit::create`：坦克单位，如 `stell`、`vanquish`，*在 JSON 中用 `tank` 表示*；
- `ElevationMoveUnit::create`：悬浮单位，如 `elude`，*在 JSON 中用 `hover` 表示*；
- `BuildingTetherPayloadUnit::create`：建筑绑定单位，如 `manifold`、`assemblyDrone`，*在 JSON 中用 `tether` 表示*；
- `CrawlUnit::create`：爬行单位，如 `latum`、`renale`。爬虫（`crawler`）本身是 `MechUnit`，*在 JSON 中用 `crawl` 表示*。

仅设置`constructor`并不总是足够。`UnitType`初始化时会检查`EntityMapping`：若`name`尚未映射，会自动补到`nameMap`。但如果`constructor`指向自定义的`Unit`实体类，还必须为该类注册`classId`（例如`EntityMapping.register(...)`或重写`classId()`），否则会在校验阶段抛出错误。关于自定义单位实体的详细注册流程，我们将在下一章进行说明。

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

关于 UnitType 各字段的含义如下：

<!--@include: ./reference/8-1-unittype.md-->

## 为单位添加武器

单位武器是单位实现攻击或修复功能的核心组件，其本质是一个可移动的小型炮塔。与建筑武器不同，单位武器在默认游戏规则下无需消耗弹药即可发射；若启用“单位弹药限制”规则，单位则可以从核心或容器中自动获取所需弹药。武器的主要实现类为`Weapon`，此外还存在两个专用子类：`PointDefenseBulletWeapon`用于实现点防御功能，`RepairBeamWeapon`用于实现修复光束功能。

::: code-group

``` java
new UnitType("tutorial-unit"){{
    constructor = UnitEntity::create;
    weapons.add(new Weapon("tutorial-weapon"){{
        bullet = new BasicBulletType(2.5f, 9);
    }});
}};
```

``` kotlin
UnitType("tutorial-unit").apply{
    constructor = UnitEntity::create
    weapons.add(Weapon("tutorial-weapon").apply{
        bullet = BasicBulletType(2.5f, 9)
    })
}
```

:::

关于 Weapon 各字段的含义如下：

<!--@include: ./reference/8-2-weapon.md-->

## 单位的贴图

贴图是模组最重要的外在特征之一，其实现细节会随着深入理解而逐渐显现。本部分将简要介绍单位实际所需的全部贴图，其内在逻辑将在后续章节详细说明。

单位的基本贴图包括本体贴图`tutorial-unit.png`和队伍色贴图`tutorial-unit-cell.png`。本体贴图在绘制时位于最底层。队伍色贴图用于指示单位的所属队伍，其颜色闪烁速度与单位生命值相关。该贴图使用`#ffffff`、`#dcc6c6`、`#9d7f7f`三种颜色分别标记队伍颜色中的亮部、中部和暗部区域，使用其他颜色将导致该区域被原样绘制。此外，游戏会自动为所有单位贴图应用**描边（Outline）**和**线性图像滤波（Linear Image Filter）**处理，以使图像边界更清晰、显示更平滑。这两项处理的具体原理将在后续章节说明。在当前版本中，该过程为全自动执行，通常无需干预，也无须额外提供描边贴图。

仅有上述两种贴图可能不足以满足所有显示需求。例如，在核心数据库和建造栏中，单位图标若仅使用本体贴图，其视觉效果可能与原版单位存在差异。原版单位在这些界面中通常使用完整预览贴图`tutorial-unit-full.png`。在绘制完整预览贴图时，应呈现单位组装完成后的最终外观，包括所有武器（含描边效果）和队伍色区域。但最外层的最终描边应由游戏自动处理，且无需绘制`LegsUnit`的全部腿部细节或单位的推进器效果。

武器贴图的处理原则类似。武器本体贴图`tutorial-weapon.png`是必需的，但尺寸较小的武器可以不提供队伍色贴图。武器还可以拥有过热效果贴图`tutorial-weapon-heat.png`，该贴图仅能使用不同透明度的`#ffffff`白色，通常经过高斯模糊处理以达到最佳视觉效果。此外，可通过预览贴图`tutorial-weapon-preview.png`来设置在核心数据库中显示的武器图标。

对于`LegsUnit`（多足单位），还需准备以下贴图：`joint-base`（近身关节）、`leg`（腿部）、`joint`（腿部关节）和`foot`（足部）。对于`TankUnit`（坦克单位），需要准备履带贴图。自版本 v151 起，通常只需提供一张`-tread`贴图，游戏即可自动生成内部所需的其他相关贴图。

## 单位的能力

单位的能力（Ability）是独立于战斗系统的一套使单位发挥作用的系统，在 Mindustry 中，能力系统常与战斗系统结合使用。它可以控制单位的行为和绘制，也可以在单位出生或死亡时执行特定操作。

原版中的 Ability 如下：

- `ArmorPlateAbility`：装甲板能力，在射击时减少受到的伤害；
- `EnergyFieldAbility`：能量场能力，对附近的敌人释放电击，或治疗友方，如“玄武”；
- `ForceFieldAbility`：力墙场能力，投射一个能吸收子弹的力场护盾，如“耀星”；
- `LiquidExplodeAbility`：死亡溢液能力，死亡时释放液体，如 Latum；
- `LiquidRegenAbility`：液体吸收能力，吸收液体以治疗自身，如 Latum；
- `MoveEffectAbility`：移动特效能力，边移动边产生特效，如创伤导弹；
- `MoveLightningAbility`：闪电助推器能力，移动时释放闪电，*如 v5 中的 Dart*；
- `RegenAbility`：再生能力，随着时间的推移恢复自己的生命值，如“耀星”；
- `RepairFieldAbility`：修复场能力，修复附近的单位，如“新星”；
- `ShieldArcAbility`：弧形护盾能力，投射一个弧形的力场护盾，能吸收子弹，如“天理”；
- `SpawnDeathAbility`：死亡产生单位能力，死亡时释放单位，如 Latum；
- `StatusFieldAbility`：状态场能力，对附近的单位施加状态效果，如电鳗；
- `SuppressionFieldAbility`：修复压制场能力，使附近的修复建筑停止工作，如“龙王”；
- `UnitSpawnAbility`：单位生成能力，建造单位，如“海神”。

## 单位命令与姿态

单位命令（UnitCommand）与姿态（UnitStance）是 v8 中新添加的两种内容类型，应用于 RTS 系统。单位命令可以更换单位的 AI。单位姿态给单位标记**状态（State）**，本身没有功能，只是供单位 AI 读取并作出反应。由于与 AI 的强耦合性，现阶段没有必要注册新的单位命令和姿态。

单位支持的姿态和命令既可以手动指定，也可以让游戏根据单位本身的参数自动添加。

关于单位采矿菜单中缺少模组矿物的问题，可通过注册新的`ItemUnitStance`并将其添加至单位姿态列表来解决：

``` java
ItemUnitStance item1mine = new ItemUnitStance(ModItems.item1);
UnitTypes.mono.stances.add(item1mine);
//省略若干单位
```

## 单位 AI

单位 AI 是控制单位行为的逻辑系统，当单位处于非玩家队伍或无玩家控制时，由 AI 接管其决策与行动。玩家队伍的单位则由`CommandAI`管理，其行为受单位指令系统调控。

原版中的 AI 存放于`mindustry.ai.types`包内，包含以下几种类型。部分 AI 的使用需要满足特定条件：

- **GroundAI**：地面单位 AI，用于控制地面移动的单位，如尖刀、战锤等
- **FlyingAI**：飞行单位 AI，用于控制飞行单位，如星辉、天垠等
- **MinerAI**：采矿 AI，用于控制采矿单位，如独影等
- **BuilderAI**：建造 AI，用于控制建造单位，如幻型、阿尔法等
- **SuicideAI**：自杀式攻击 AI，用于控制自爆单位，如爬虫等
- **MissileAI**：导弹 AI，用于控制导弹单位，如创伤的导弹
- **FlyingFollowAI**：跟随型飞行 AI，常见于需要跟随目标的飞行单位
- **BoostAI**：助推飞行 AI，用于可升空单位的起降逻辑
- **RepairAI**：修复 AI，用于靠近并修复友方单位/建筑
- **DefenderAI**：防御 AI，用于以防守为主的单位
- **CargoAI**：运输 AI，用于物流单位的运输任务
- **PrebuildAI**：预建 AI，用于处理预建任务的单位
- **AssemblerAI**：组装 AI，用于单位组装厂的装配无人机
- **HugAI**：贴身 AI，用于近身黏附型单位（如 `latum`、`renale`）
- **LogicAI**：逻辑 AI，用于逻辑控制的单位
- **CommandAI**：指挥 AI，用于玩家队伍的单位指令系统

在给单位的`aiController`字段赋值时，需要提供一个`Prov`类型的值，例如`GroundAI::new`。`controller`用于根据队伍与可控性选择 AI（默认玩家队伍使用`CommandAI`，AI 队伍使用`aiController`），因此一般不建议直接替换`controller`，除非你同时处理玩家/AI 的分支逻辑。

## 单位工厂与重构厂

原版中与单位配套的重要建筑是单位工厂和单位重构厂，以及埃里克尔中使用的单位组装厂。

单位工厂类型是`mindustry.world.blocks.units.UnitFactory`，它继承自`mindustry.world.blocks.units.UnitBlock`（而`UnitBlock`又继承自`mindustry.world.blocks.payloads.PayloadBlock`）。`PayloadBlock`是所有载荷方块的基类，定义了载荷移动速度`payloadSpeed`和载荷转弯速度`payloadRotateSpeed`两个属性，并要求加载`-top`、`-out`、`-in`三张贴图。

单位工厂的主要设置项是其`plans`字段，这个字段接收一个包含`UnitPlan`的`Seq`。`UnitPlan`的构造接受三个参数，分别为制造单位、生产时间和物品消耗。

::: code-group

``` java
groundFactory = new UnitFactory("ground-factory"){{
    requirements(Category.units, with(Items.copper, 50, Items.lead, 120, Items.silicon, 80));
    plans = Seq.with(
        new UnitPlan(UnitTypes.dagger, 60f * 15, with(Items.silicon, 10, Items.lead, 10)),
        new UnitPlan(UnitTypes.crawler, 60f * 10, with(Items.silicon, 8, Items.coal, 10)),
        new UnitPlan(UnitTypes.nova, 60f * 40, with(Items.silicon, 30, Items.lead, 20, Items.titanium, 20))
    );
    size = 3;
    consumePower(1.2f);
    researchCostMultiplier = 0.5f;
}};
```

``` kotlin
val groundFactory = UnitFactory("ground-factory").apply {
    requirements(Category.units, with(Items.copper, 50, Items.lead, 120, Items.silicon, 80))
    plans = Seq.with(
        UnitPlan(UnitTypes.dagger, 60f * 15, with(Items.silicon, 10, Items.lead, 10)),
        UnitPlan(UnitTypes.crawler, 60f * 10, with(Items.silicon, 8, Items.coal, 10)),
        UnitPlan(UnitTypes.nova, 60f * 40, with(Items.silicon, 30, Items.lead, 20, Items.titanium, 20))
    )
    size = 3
    consumePower(1.2f)
    researchCostMultiplier = 0.5f
}
```
:::

单位重构厂的类型为`mindustry.world.blocks.units.Reconstructor`。在 Mindustry 中，单位重构厂的消耗通过消耗器系统实现，其重构时间由`constructTime`字段控制，单位的升级路径则由`upgrades`字段定义。

::: code-group

``` java
tetrativeReconstructor = new Reconstructor("tetrative-reconstructor"){{
    requirements(Category.units, with(Items.lead, 4000, Items.silicon, 3000, Items.thorium, 1000, Items.plastanium, 600, Items.phaseFabric, 600, Items.surgeAlloy, 800));

    size = 9;
    consumePower(25f);
    consumeItems(with(Items.silicon, 1000, Items.plastanium, 600, Items.surgeAlloy, 500, Items.phaseFabric, 350));
    consumeLiquid(Liquids.cryofluid, 3f);

    constructTime = 60f * 60f * 4;
    createSound = Sounds.unitCreateBig;

    upgrades.addAll(
        new UnitType[]{UnitTypes.antumbra, UnitTypes.eclipse},
        new UnitType[]{UnitTypes.arkyid, UnitTypes.toxopid},
        new UnitType[]{UnitTypes.scepter, UnitTypes.reign},
        new UnitType[]{UnitTypes.sei, UnitTypes.omura},
        new UnitType[]{UnitTypes.quad, UnitTypes.oct},
        new UnitType[]{UnitTypes.vela, UnitTypes.corvus},
        new UnitType[]{UnitTypes.aegires, UnitTypes.navanax}
    );
}};
```

``` kotlin
val tetrativeReconstructor = Reconstructor("tetrative-reconstructor").apply {
    requirements(Category.units, with(Items.lead, 4000, Items.silicon, 3000, Items.thorium, 1000, Items.plastanium, 600, Items.phaseFabric, 600, Items.surgeAlloy, 800))

    size = 9
    consumePower(25f)
    consumeItems(with(Items.silicon, 1000, Items.plastanium, 600, Items.surgeAlloy, 500, Items.phaseFabric, 350))
    consumeLiquid(Liquids.cryofluid, 3f)

    constructTime = 60f * 60f * 4
    createSound = Sounds.unitCreateBig

    upgrades.addAll(
        arrayOf(UnitTypes.antumbra, UnitTypes.eclipse),
        arrayOf(UnitTypes.arkyid, UnitTypes.toxopid),
        arrayOf(UnitTypes.scepter, UnitTypes.reign),
        arrayOf(UnitTypes.sei, UnitTypes.omura),
        arrayOf(UnitTypes.quad, UnitTypes.oct),
        arrayOf(UnitTypes.vela, UnitTypes.corvus),
        arrayOf(UnitTypes.aegires, UnitTypes.navanax)
    )
}
```

:::

单位组装厂的类型为`mindustry.world.blocks.units.UnitAssembler`。该类型会生成若干无人机作为组装的先决条件，随后接收配方要求的载荷/物品/液体输入，并在指定区域内生成新的单位。与其他载荷方块不同，此类型将载荷视为可消耗物资，并统一纳入消耗器系统进行管理。可设置的参数包括无人机单位类型`droneType`、无人机数量`dronesCreated`以及制造无人机所需时间`droneConstructTime`。其配方`plans`的设置方式与前述类型相似。配方的序号对应模块等级：第一个配方无需模块，第二个配方需要至少一个`tier=1`模块，第三个配方需要`tier=1`与`tier=2`连续覆盖，以此类推：

::: code-group

``` java
tankAssembler = new UnitAssembler("tank-assembler"){{
    requirements(Category.units, with(Items.thorium, 500, Items.oxide, 150, Items.carbide, 80, Items.silicon, 650));
    regionSuffix = "-dark";
    size = 5;
    plans.add(
    new AssemblerUnitPlan(UnitTypes.vanquish, 60f * 50f, PayloadStack.list(UnitTypes.stell, 4, Blocks.tungstenWallLarge, 10)),
    new AssemblerUnitPlan(UnitTypes.conquer, 60f * 60f * 3f, PayloadStack.list(UnitTypes.locus, 6, Blocks.carbideWallLarge, 20))
    );
    areaSize = 13;
    researchCostMultiplier = 0.4f;

    consumePower(2.5f);
    consumeLiquid(Liquids.cyanogen, 9f / 60f);
}};
```

``` kotlin
val tankAssembler = UnitAssembler("tank-assembler").apply {
    requirements(Category.units, with(Items.thorium, 500, Items.oxide, 150, Items.carbide, 80, Items.silicon, 650))
    regionSuffix = "-dark"
    size = 5
            plans.add(
        AssemblerUnitPlan(UnitTypes.vanquish, 60f * 50f, PayloadStack.list(UnitTypes.stell, 4, Blocks.tungstenWallLarge, 10)),
        AssemblerUnitPlan(UnitTypes.conquer, 60f * 60f * 3f, PayloadStack.list(UnitTypes.locus, 6, Blocks.carbideWallLarge, 20))
    )
    areaSize = 13
    researchCostMultiplier = 0.4f

    consumePower(2.5f)
    consumeLiquid(Liquids.cyanogen, 9f / 60f)
}
```

:::


