# 单位、武器、能力、单位工厂

单位是 Mindustry 的另一条“制造链”。JSON 里单位由 `UnitType` 定义，武器由 `Weapon` 定义，能力由 `Ability` 定义，产出单位的建筑则由单位工厂、重构厂和组装厂负责。理解这些结构以后，单位制作会变成“参数组合”的游戏。

## UnitType 的核心字段

单位 JSON 文件位于 `content/units`。`type` 决定单位的实体构造器，也就是“移动与碰撞的底层行为”。可用值包括 `flying`、`mech`、`legs`、`naval`、`payload`、`missile`、`tank`、`hover`、`tether`、`crawl`。例如“星辉”“天垠”属于 `flying`，“战锤”“爬虫”属于 `mech`，“天蝎”“死星”属于 `legs`，“梭鱼”“蛟龙”属于 `naval`，“巨像”“雷霆”“要塞”属于 `payload`，“围护”“征服”属于 `tank`。`type` 只是构造器，真正是否飞行还要看 `flying`、`lowAltitude`、`hovering` 等字段的组合，因此建议先对照原版单位理解差异。

基础运动字段包括 `speed`、`accel`、`drag` 与 `rotateSpeed`。`speed` 决定最大移动速度，`accel` 与 `drag` 决定起步与刹车的手感，`rotateSpeed` 决定转向速度。`hitSize` 影响单位的碰撞体积与受击范围，`health` 与 `armor` 决定生存能力。`range` 通常用于 AI 选择射程范围，如果写成负数会自动根据武器计算；这意味着你只要武器配置合理，`range` 可以不写。

采矿与建造能力由 `mineTier`、`mineSpeed` 与 `buildSpeed` 控制。`mineTier` 对应可开采的硬度等级，`mineSpeed` 决定采矿速度，`buildSpeed` 决定建造与修复速度。`itemCapacity` 决定携带物品的容量，`payloadCapacity` 决定载荷容量，后者常见于“巨像”这类载荷单位。`targetAir` 与 `targetGround` 控制自动索敌类型，`faceTarget` 决定单位是否转向目标，`omniMovement` 则影响是否允许“全向移动”。

视觉与表现方面，`engineOffset` 与 `engineSize` 决定引擎喷口位置和大小，`trailLength` 与 `trailColor` 决定尾迹长度与颜色。声音相关字段包括 `deathSound`、`loopSound`、`moveSound`、`stepSound` 等，用于塑造单位的体感。`drawCell`、`drawShields`、`drawItems` 等字段控制 UI 与渲染细节。

还有一些“规则型”的字段容易被忽略。`logicControllable` 与 `playerControllable` 决定单位能否被处理器或玩家直接控制，`useUnitCap` 决定是否受单位上限限制，`hittable` 与 `targetable` 决定能否被命中或锁定，`allowedInPayloads` 与 `pickupUnits` 则影响载荷交互。这些字段不会直接改变伤害，但会极大改变单位在战役中的定位，比如“不可选中但可伤害”的单位往往用于剧情或特殊机制。

### 一个最小单位示例

```json content/units/tutorial-unit.json
{
	"type": "flying",
	"name": "示例单位",
	"description": "最基础的飞行单位。",
	"speed": 2.6,
	"health": 120,
	"hitSize": 8,
	"flying": true,
	"weapons": [
		{
			"name": "tutorial-weapon",
			"reload": 25,
			"x": 3,
			"y": 1,
			"bullet": {
				"type": "BasicBulletType",
				"speed": 2.5,
				"damage": 9,
				"lifetime": 60
			}
		}
	]
}

```

这个单位选择了 `flying` 构造器，并显式设置 `flying: true`。武器字段直接写在 `weapons` 数组里，`reload` 是装填时间，`x/y` 是武器挂点位置。

## 武器（Weapon）

单位武器与炮塔非常相似，但更强调“挂载位置”和“开火方式”。`x/y` 决定武器挂点位置，`shootX/shootY` 决定枪口位置，`mirror` 决定是否左右镜像复制，`rotate` 决定武器是否随单位旋转，`top` 决定绘制层级。射击节奏由 `reload`、`shootCone`、`inaccuracy` 决定，若需要一次多发或延迟开火，可以写 `shoot` 子对象（如 `shots`、`shotDelay`、`firstShotDelay`、`spread`）。

`bullet` 字段决定子弹类型与属性，写法与炮塔完全一致。武器贴图默认使用 `weapon-name.png`，热量贴图为 `-heat`，数据库预览图为 `-preview`。如果你的单位有多门武器，记得给不同武器取不同 `name`，以免贴图冲突。

单位武器还有一组更偏“行为”的字段。`alternate` 控制左右武器是否交替射击，`continuous` 与 `alwaysContinuous` 决定是否持续发射（常用于持续激光或喷流）。`shootStatus` 与 `shootStatusDuration` 可以让单位在开火时给自己施加状态，例如短暂的护盾或加速；`ejectEffect` 与 `parentizeEffects` 则分别控制弹壳特效与特效跟随，让枪口表现更自然。对于高速或持续火力单位，这些字段常常比单纯堆 `damage` 更能体现风格。

武器也支持 `parts`（`DrawPart`）来做局部动画，和炮塔的用法几乎一致。你可以用 `reload`、`warmup`、`recoil` 等进度驱动枪口位移、光效或外壳开合，配合 `shootX/shootY` 微调出射位置。对于多武器单位，每个武器都能独立配置部件动画，这能显著提升“机体层次感”。

## 能力（Ability）

Ability 是单位的“额外技能”，更新频率与单位一致。常见类型包括 `ForceFieldAbility`（护盾）、`RepairFieldAbility`（修复场）、`MoveEffectAbility`（移动特效）、`StatusFieldAbility`（范围状态）、`UnitSpawnAbility`（生成单位）、`ShieldRegenFieldAbility`（范围护盾回复）等。它们通常有自己的半径、回复速率、间隔时间等字段。Ability 不一定改变武器数值，但会改变单位的战场定位，因此比你想象中更“决定风格”。

```json
"abilities": [
	{
		"type": "ForceFieldAbility",
		"radius": 20,
		"regen": 0.2,
		"max": 80
	}
]
```

如果你希望某个单位承担辅助职责，比如“战斗修复”或“范围增益”，Ability 往往比新增武器更合适。

Ability 的参数通常围绕“范围、频率、强度”展开。以 `RepairFieldAbility` 为例，它会有 `range`、`reload` 与 `amount` 来控制修复范围、间隔与数值；`StatusFieldAbility` 则需要 `status` 与 `duration` 来指定范围状态。能力不消耗弹药，但会叠加在单位的“战略定位”上，尤其是支援单位，能力强弱往往比武器伤害更重要。

## 数值与定位的关系

单位设计中最重要的是“定位”。高 `speed` 的单位通常承担侦察或骚扰角色，但它们不一定需要高伤害；高 `health` 与高 `armor` 的单位则更适合抗线与拆建筑。`hitSize` 影响命中概率与碰撞体积，过大的 `hitSize` 会让单位更容易被集火。`range` 与武器射程一致时，AI 会更愿意停在安全距离输出；如果 `range` 过短，单位会更靠近目标，可能导致“高伤害单位冲脸”的意外行为。

`mineRange` 与 `buildRange` 决定采矿与建造距离。对于“独影”“幻型”这类支援单位，合理的 `buildRange` 能显著提升它们的修复效率；对“阿尔法”“贝塔”“伽马”这种核心单位而言，`mineRange` 与 `mineTier` 的匹配更重要，否则会出现“能飞到矿上却挖不动”的问题。

采矿单位还要关注 `mineSpeed` 与 `itemCapacity` 的配合。`mineSpeed` 决定单位采一件矿的速度，但如果 `itemCapacity` 很小，单位会频繁往返核心，实际效率反而下降。设计时可以先确定“预期的运输半径”，再决定 `mineSpeed` 与容量，让玩家感觉“这台单位就是为某种矿而生”。

视觉与声音字段虽然不影响数值，但会影响玩家判断。例如 `engineSize` 很小的飞行单位会显得“轻量”，`trailLength` 较长的单位更容易被玩家注意到。你可以把这些作为“风格刻画”的工具，而不是简单的装饰。

## 单位的弹药与资源

单位也可以有弹药系统。`ammoType` 决定单位使用的弹药类型，`ammoCapacity` 决定弹药容量，`ammoType` 可以是物品或电力。许多“重装单位”会用物品弹药以限制持续火力，而“支援单位”则更倾向于电力弹药以减少物流压力。`itemCapacity` 与 `payloadCapacity` 决定单位能携带多少物品或载荷，这会直接影响它在战场上的“后勤价值”。例如大载荷单位不仅能搬运方块，还能承担“机动建造”的角色。

如果你希望单位有明显的“供给需求”，就把 `ammoType` 指向某种稀缺物品，并给它较大的 `ammoCapacity`。这样单位的持续作战能力就会依赖你的运输体系，而不是单纯的数值堆叠。

## 模组示例：饱和火力 3.3.0 的“雷鸣”

“雷鸣”是一个使用电力弹药的飞行单位，它把 `ammoType` 写成对象形式，并在武器上使用 `shootWarmupSpeed` 与 `minWarmup` 做出“预热开火”的节奏，同时用 `shootStatus` 给自己短暂加成：

```json
{
	"type": "flying",
	"name": "雷鸣",
	"ammoType": {
		"type": "PowerAmmoType",
		"totalPower": 8000
	},
	"ammoCapacity": 60,
	"weapons": [
		{
			"name": "雷鸣1",
			"shootWarmupSpeed": 0.13,
			"minWarmup": 0.9,
			"shootStatus": "shielded",
			"shootStatusDuration": 50
		}
	]
}
```

这个片段说明了两件事：一是电力弹药适合做“高持续但后勤轻量”的单位；二是预热与自我状态可以让单位的输出节奏更有层次，而不是单纯堆数值。

需要注意的是，电力弹药本质上仍依赖电网或能源补给，战役中断电时这类单位会明显“掉火力”，设计时要预留补能途径。

## AI 与行为控制

`aiController` 可以指定单位的默认 AI 控制器，它通常是一个类名，例如 `FlyingAI` 或 `GroundAI`。`defaultController` 则用于覆盖更底层的控制器选择。实际运行时，单位会根据是否可被玩家控制、是否属于 AI 队伍等条件决定最终控制器，因此你在 JSON 里指定的 AI 只是“默认策略”。如果你需要完全自定义的行为，就必须转向 Java。

如果你把 `playerControllable` 设为 `false`，单位将无法被玩家直接控制；`logicControllable` 设为 `false` 则会阻止处理器接管。对剧情单位或 Boss 来说，这能避免玩家“抢走”单位，但也意味着 AI 表现必须足够可靠。

## 单位工厂、重构厂与组装厂

`UnitFactory` 负责“直接生产单位”。每条 `plan` 都包含 `unit`、`time` 与 `requirements`（物品堆栈），工厂从传送带或卸货口取物品，完成后直接出厂。`Reconstructor` 负责“升级单位”，需要指定 `previous` 作为前置单位，并消耗物品与时间来完成升级。`UnitAssembler` 则走“载荷 + 模块”的路线：它需要载荷输入，并常与 `UnitAssemblerModule` 搭配扩展阶级，同时依赖无人机完成组装。

`UnitAssembler` 的 `plans` 是 `AssemblerUnitPlan` 数组，每条计划除了 `unit` 与 `time` 外，还能写 `requirements`（载荷堆栈）、`itemReq`（物品消耗）、`liquidReq`（液体消耗）。`droneType`、`dronesCreated`、`droneConstructTime` 共同决定无人机的构建与装配节奏。相比之下，`UnitFactory` 与 `Reconstructor` 更像“单体方块”，配置直观；`UnitAssembler` 更像“工厂线”，需要你理解载荷口对齐、模块位置与装配流程。

## 生产链的设计思路

单位生产链并不只是“做一个工厂就结束”。如果你把单位的 `requirements` 写得过于昂贵，就会导致它们只能在后期登场；写得过于廉价，则会让战役或生存失衡。原版的“陆军工厂”“空军工厂”“海军工厂”提供的是“基础单位”，而“数增级单位重构工厂”等重构厂负责“阶级跃迁”。这套结构实际上在引导玩家逐步升级单位强度，同时也在限制战场单位的数量。

设计自定义单位时，可以先决定它处于哪一层：是基础单位、重构升级单位，还是装配厂产物。基础单位应该成本可控、数量可量产；重构单位可以更强但应有明显投入；装配单位则适合“高价值、高稀有度”。这样设计出的单位链条更容易被玩家理解。

## 模组示例：饱和火力 3.3.0 的重构链

“反击”是一台 `tank` 单位，它通过 `requirements` 挂在重构厂上，并指定了 `previous`。这意味着它不是基础工厂直接生产的单位，而是由前一阶单位升级而来。下面是该单位的节选：

```json
{
	"type": "tank",
	"name": "反击",
	"health": 25600,
	"armor": 30,
	"ammoType": "surge-alloy",
	"ammoCapacity": 120,
	"immunities": ["burning", "shocked"],
	"requirements": {
		"block": "exponential-reconstructor",
		"previous": "陆3"
	}
}
```

这个例子体现了“单位强度靠重构链提升”的思路。通过 `previous` 串联，你可以清晰地控制升级路径，而不用让高阶单位直接出现在基础工厂里。

## 模组示例：饱和火力 3.3.0 的组装厂计划

“悬浮战争工厂”是一个 `UnitAssembler`，它在 `plans` 中同时使用 `requirements` 与 `liquidReq`，并通过 `droneType` 指定组装无人机。这个结构展示了“载荷 + 液体”双输入的写法：

```json
{
	"type": "UnitAssembler",
	"name": "悬浮战争工厂",
	"plans": [
		{
			"unit": "竭泽",
			"time": 4200,
			"requirements": ["饱和火力-基础收容块/6"],
			"liquidReq": ["cryofluid/0.6"]
		}
	],
	"droneType": "组装机"
}
```

在这种结构里，`requirements` 不再是物品，而是载荷堆栈。你需要确保载荷输入方向与装配口一致，否则装配会一直卡住。对比 `UnitFactory` 的“传送带输入”，组装厂更强调布局和物流规划。

## 单位文件里的 requirements

在单位 JSON 中写 `requirements` 并不是设置“单位本体材料”，而是把单位挂到某个工厂或重构厂。结构如下：

```json
"requirements": {
	"block": "ground-factory",
	"requirements": ["silicon/10", "lead/10"],
	"time": 900
}
```

`block` 是所属工厂或重构厂的内部名，`requirements` 是该配方的物品消耗，`time` 是制造时间，`previous` 则用于重构厂的升级链。注意：这种 `requirements` 只对 `UnitFactory` 与 `Reconstructor` 生效，无法把单位自动挂到 `UnitAssembler`。原版中“陆军工厂”“空军工厂”“海军工厂”与“数增级单位重构工厂”是最典型的参考对象。

## 小结

`type` 决定单位底层行为，`weapons` 与 `abilities` 决定战斗风格，`requirements` 决定生产链挂载方式。先理解原版单位与工厂的规则，再去配置自己的单位，会顺手很多。
