# 单位、武器、能力、单位工厂

单位是Mindustry的另一条“制造链”。JSON里单位由`UnitType`定义，武器由`Weapon`定义，能力由`Ability`定义，产出单位的建筑则由单位工厂/重构厂/组装厂负责。

## UnitType 的核心写法

JSON单位文件位于`content/units`，核心字段包括：

- `type`：决定单位实体类型（即构造器）；
- `speed`/`health`/`armor`/`hitSize`：基础属性；
- `weapons`：武器列表；
- `abilities`：能力列表；
- `aiController`：AI 控制器；
- `mineTier`/`mineSpeed`/`buildSpeed`：采矿与建造能力。

### `type`取值（构造器映射）

- `flying`：飞行单位，如“星辉”“天垠”；
- `mech`：机甲单位，如“战锤”“爬虫”；
- `legs`：多足单位，如“天蝎”“死星”；
- `naval`：海军单位，如“梭鱼”“蛟龙”；
- `payload`：载荷单位，如“巨像”“雷霆”“要塞”；
- `missile`：导弹单位；
- `tank`：坦克单位，如“围护”“征服”；
- `hover`：悬浮单位；
- `tether`：绑定建筑单位（如“装配无人机”）；
- `crawl`：爬行单位。

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

## 武器（Weapon）

单位武器字段与炮塔相似，常见字段有：

- `reload`/`inaccuracy`/`shootCone`；
- `x`/`y`/`shootX`/`shootY`；
- `mirror`/`rotate`；
- `bullet`：子弹类型。

武器贴图默认使用`weapon-name.png`，热量贴图为`-heat`，数据库预览图为`-preview`。

## 能力（Ability）

Ability是单位的“额外技能”，常见类型：

- `ForceFieldAbility`：护盾；
- `RepairFieldAbility`：修复场；
- `MoveEffectAbility`：移动特效；
- `UnitSpawnAbility`：生成单位。

JSON里通过`abilities`数组配置，`type`决定能力子类。

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

## 单位工厂与重构厂

### UnitFactory

`UnitFactory`根据`plans`生产单位，每条`plan`就是一个`UnitPlan`，包含`unit`、`time`和`requirements`（物品堆栈）。输入走传送带/卸货口，产出单位直接出厂。

### Reconstructor

重构厂用于升级单位：在`requirements`里指定`previous`，并配置消耗与时间，完成后产出新单位。

### UnitAssembler

组装厂走“载荷+模块”路线，需要载荷输入，常与`UnitAssemblerModule`搭配扩展阶级。`plans`是`AssemblerUnitPlan`数组，除`unit`与`time`外，还能写`requirements`（载荷堆栈）、`itemReq`和`liquidReq`。`droneType`、`dronesCreated`、`droneConstructTime`控制无人机建造流程。

## UnitAssembler 与 UnitFactory 的区别

- 输入：`UnitFactory`/重构厂=物品；`UnitAssembler`=载荷（可选物品/液体）；
- 配方来源：前者可用单位文件`requirements`自动挂载；后者必须手写`plans`；
- 架构：前者单体方块产出；后者依赖模块与无人机，且需要对齐载荷口。

## 单位文件里的`requirements`特殊用法

在JSON单位文件中，`requirements`并不是“单位自身建造材料”，而是**自动挂载到工厂或重构厂**的配置：

```json
"requirements": {
	"block": "ground-factory",
	"requirements": ["silicon/10", "lead/10"],
	"time": 900
}
```

- `block`：单位所属工厂或重构厂；
- `requirements`：该工厂配方所需物品；
- `time`：生产时间；
- `previous`：若用于重构厂，则表示上一级单位。
- 注意：`requirements`只对`UnitFactory`/`Reconstructor`生效，不能把单位自动挂到`UnitAssembler`。

## 小结

- `type`决定构造器；
- `weapons`与`abilities`决定战斗风格；
- 单位生产链在JSON里通过`requirements`“挂载”到工厂/重构厂。
