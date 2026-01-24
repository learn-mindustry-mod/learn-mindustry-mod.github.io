# 单位、武器、能力、单位工厂

单位是 Mindustry 的另一条“制造链”。JSON 里单位由 `UnitType` 定义，武器由 `Weapon` 定义，能力由 `Ability` 定义，产出单位的建筑则由单位工厂、重构厂和组装厂负责。理解这些结构以后，单位制作会变成“参数组合”的游戏。

## UnitType 的核心字段

单位 JSON 文件位于 `content/units`。`type` 决定单位的实体构造器，也就是“移动与碰撞的底层行为”，可用值包括 `flying`、`mech`、`legs`、`naval`、`payload`、`missile`、`tank`、`hover`、`tether`、`crawl`。例如“星辉”“天垠”属于 `flying`， “战锤”属于 `mech`，“天蝎”“死星”属于 `legs`，“梭鱼”“蛟龙”属于 `naval`，“巨像”“雷霆”“要塞”属于 `payload`，“围护”“征服”属于 `tank`。`type` 只是构造器，真正是否飞行还要看 `flying`、`lowAltitude`、`hovering` 等字段的组合，因此建议先对照原版单位。

基础属性由 `speed`、`accel`、`drag`、`rotateSpeed`、`health`、`armor`、`hitSize` 组成。`speed` 决定最大移动速度，`accel` 与 `drag` 决定“起步与刹车”的手感，`rotateSpeed` 决定转向速度。`hitSize` 影响单位的碰撞与受击范围。`itemCapacity` 决定携带物品的容量，`payloadCapacity` 决定能携带多大的载荷，常用于“巨像”一类单位。

采矿与建造能力由 `mineTier`、`mineSpeed` 与 `buildSpeed` 控制。`mineTier` 对应可开采的硬度等级，`mineSpeed` 决定采矿速度，`buildSpeed` 决定建造速度与修复效率。AI 相关字段通常写 `aiController`，它控制单位默认 AI；若需要固定控制器，可以用 `defaultController`。`immunities` 列表用于声明该单位免疫哪些状态效果。

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

这个单位选择了 `flying` 构造器，并显式设置 `flying: true`。武器字段直接写在 `weapons` 数组里，`reload` 是装填时间，`x/y` 是武器在单位上的相对位置。

## 武器（Weapon）

单位武器和炮塔非常相似，但更强调“挂载位置”和“开火方式”。`x/y` 决定武器挂点位置，`shootX/shootY` 决定枪口位置，`mirror` 决定是否左右镜像复制，`rotate` 决定武器是否随单位旋转，`top` 决定绘制层级。射击节奏由 `reload`、`shootCone`、`inaccuracy` 决定，若需要一次多发或延迟开火，可以写 `shoot` 子对象（`shots`、`shotDelay`、`firstShotDelay`、`spread` 等）。

`bullet` 字段决定子弹类型与属性，写法与炮塔完全一致。武器贴图默认使用 `weapon-name.png`，热量贴图为 `-heat`，数据库预览图为 `-preview`。如果你的单位有多门武器，记得给不同武器取不同 `name`，以免贴图冲突。

## 能力（Ability）

Ability 是单位的“额外技能”，更新频率与单位一致。常见类型包括 `ForceFieldAbility`（护盾）、`RepairFieldAbility`（修复场）、`MoveEffectAbility`（移动特效）、`UnitSpawnAbility`（生成单位）等。它们通常有自己的半径、回复速率、间隔时间等字段。

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

能力的“表现”多半来自 Java 层逻辑，但字段配置仍然可以完整控制数值与范围。

## 单位工厂、重构厂与组装厂

`UnitFactory` 负责“直接生产单位”。每条 `plan` 都包含 `unit`、`time` 与 `requirements`（物品堆栈），工厂从传送带或卸货口取物品，完成后直接出厂。`Reconstructor` 负责“升级单位”，需要指定 `previous` 作为前置单位，并消耗物品与时间来完成升级。`UnitAssembler` 则走“载荷 + 模块”的路线：它需要载荷输入，并常与 `UnitAssemblerModule` 搭配扩展阶级，同时依赖无人机完成组装。

`UnitAssembler` 的 `plans` 是 `AssemblerUnitPlan` 数组，每条计划除了 `unit` 与 `time` 外，还能写 `requirements`（载荷堆栈）、`itemReq`（物品消耗）、`liquidReq`（液体消耗）。`droneType`、`dronesCreated`、`droneConstructTime` 共同决定无人机的构建与装配节奏。相比之下，`UnitFactory` 和 `Reconstructor` 更像“单体方块”，配置更直接；`UnitAssembler` 更像“工厂线”，需要你理解载荷口对齐、模块位置与装配流程。

## 单位文件里的 requirements

在单位 JSON 中写 `requirements` 并不是设置“单位本体材料”，而是把单位挂到某个工厂或重构厂。结构如下：

```json
"requirements": {
	"block": "ground-factory",
	"requirements": ["silicon/10", "lead/10"],
	"time": 900
}
```

`block` 是所属工厂或重构厂的内部名，`requirements` 是该配方的物品消耗，`time` 是制造时间，`previous` 则用于重构厂的升级链。注意：这种 `requirements` 只对 `UnitFactory` 与 `Reconstructor` 生效，无法把单位自动挂到 `UnitAssembler`。

## 小结

`type` 决定单位底层行为，`weapons` 与 `abilities` 决定战斗风格，`requirements` 决定生产链挂载方式。先理解原版“陆军工厂”“空军工厂”“海军工厂”与“数增级单位重构工厂”的规则，再去配置自己的单位，会更顺手。

