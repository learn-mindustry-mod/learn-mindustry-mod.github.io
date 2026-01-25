# 行星、区块、生成器、环境方块

这一节负责“战役与世界”的部分：行星、区块、天气与环境方块。JSON 能做的事情不少，但行星生成器和复杂规则仍建议以原版为参考，尤其是跨行星玩法与地图生成逻辑。

## 行星（Planet）

行星文件位于 `content/planets`。行星负责定义“战役大地图”的形态与规则入口。基础字段包括 `parent`（父天体）、`radius`（行星半径）、`orbitTime`/`rotateTime`（公转/自转周期）、`atmosphereColor`/`lightColor`（大气与光照颜色）以及 `defaultEnv`（默认环境标志）。其中 `defaultEnv` 影响区块默认环境，例如是否允许氧气、是否启用孢子环境等。

除了视觉参数，行星还有一些影响战役体验的规则字段。`startSector` 可以指定玩家初始的区块编号；`launchCapacityMultiplier` 会影响发射时核心携带物资上限；`allowLaunchSchematics` 和 `allowLaunchLoadout` 决定玩家是否可以选择发射蓝图与携带物品。它们不会改变地图生成，但会显著影响“进入战役时的节奏”。

行星还决定“默认环境”。`defaultEnv` 是一组环境标记，会影响氧气、孢子、地面油水等规则是否启用；`defaultAttributes` 则提供地形属性的基线值。视觉层面上，`hasAtmosphere` 与 `updateLighting` 控制是否有大气与昼夜变化，`atmosphereRadIn/Out` 决定大气层厚度。玩法层面上，`clearSectorOnLose`、`allowSectorInvasion`、`enemyInfiniteItems` 等字段会改变战役难度与节奏，这些都属于“行星级规则”，比单独区块的参数更“宏观”。

需要注意的是，JSON 里目前只会把 `generator` 反序列化成 `AsteroidGenerator`。写 `SerpuloPlanetGenerator` 或 `ErekirPlanetGenerator` 并不会生效。如果你想复用“塞普罗”或“埃里克尔”的生成器，需要用 Java 或 JavaScript 接管生成器字段。

“饱和火力 3.3.0”就是用脚本来解决生成器限制的。它在 `scripts/planets/泰伯利亚.js` 中手动创建行星并指定生成器，例如：

```js
const TBLY = new Planet("泰伯利亚", Planets.sun, 1, 3.3);
TBLY.generator = extend(SerpuloPlanetGenerator, {
	getDefaultLoadout() {
		return Schematics.readBase64("bXNjaAF4nA3JMQ6AIBAAwQXFRr9i4XuMBR5XkCAYkP9LphwcbmLO/lHMwRq0SY3vF0sGluRvTQ17XoZNStU9d0na20gDduAHAc0Org==");
	}
});
```

这个片段说明了“行星生成器只能靠脚本”这一点：JSON 负责静态字段，生成器与规则则由 JS 或 Java 接管。

```json content/planets/tutorial-planet.json
{
	"name": "示例行星",
	"parent": "sun",
	"radius": 1,
	"orbitTime": 60,
	"rotateTime": 30,
	"atmosphereColor": "7db6ff",
	"lightColor": "ffd37f"
}

```

这个例子只设置了最基本的轨道与颜色参数，适合快速验证行星是否能被正确加载。

## 行星与科技树关系

行星不仅是“背景”，还决定战役科技树的展示与解锁方式。`techTree` 与 `autoAssignPlanet` 让原版内容在不同星球下有不同的解锁顺序。你在 JSON 里新增的方块或单位，如果没有明确指定研究位置，可能会跟随默认行星显示，导致玩家在不合适的阶段就能解锁。解决办法要么是在内容上设置合适的 `research`，要么在行星层面控制哪些内容在该星球可用。

还有一些与发射相关的字段，例如 `allowLaunchSchematics` 和 `allowLaunchLoadout`，它们决定玩家是否可以带蓝图与物资进入区块。对战役节奏影响很大：允许蓝图会让玩家更快建立基地，禁止蓝图则会强化“开局规划”的重要性。你可以把它当作一种“难度调节器”。

行星的“可见性与入口”也值得关注。`visible` 与 `accessible` 决定它是否出现在行星列表中，`iconColor` 与 `launchMusic` 影响 UI 体验；`defaultCore` 会影响发射时默认核心类型，`allowCampaignRules` 决定玩家能否在行星界面调整规则。这些字段偏 UI 与流程，但对战役体验影响很直接。

## 区块（SectorPreset）

区块文件位于 `content/sectors`。每个区块必须指定 `sector` 编号，`planet` 可选。区块对应的地图文件必须放在 `maps/<name>.msav`，文件名要和 JSON 文件名一致，否则区块不会生成地图。原版的“零号地区”“冰冻森林”“盐碱荒滩”等都是 `SectorPreset` 的实例。

`SectorPreset` 的常见字段包括 `difficulty`（难度 0-10）、`captureWave`（达到多少波算占领）、`startWaveTimeMultiplier`（开局波次时间倍率）、`addStartingItems`（是否提供初始物资）、`noLighting`（禁用光照）、`requireUnlock`（是否需要解锁才能登陆）、`isLastSector`（是否为最终区块）、`attackAfterWaves`（波次结束后进入攻击模式）。这些字段大多是“规则开关”，不会影响地图本身，但会影响玩家进入后的玩法节奏。

如果你希望某个区块“独立于行星规则”，可以用 `overrideLaunchDefaults` 并在区块里单独设定 `allowLaunchSchematics` 与 `allowLaunchLoadout`。`showHidden` 控制隐藏区块是否显示名字与图标，适合做彩蛋或剧情节点。`requireUnlock` 与 `shieldSectors`（在 JS/Java 中常用）用于限制登陆顺序，避免玩家过早进入高难区块。区块本身无法写复杂 `rules`，但你可以在 JS/Java 里通过 `rules` 回调做深度定制。

```json content/sectors/tutorial-sector.json
{
	"name": "示例区块",
	"planet": "serpulo",
	"sector": 15
}

```

如果你希望写复杂的波次、敌人行为或特殊胜负条件，通常需要地图脚本或 Java/JS 来实现，JSON 只负责基础的入口与一些通用开关。

## 区块与地图文件的配合

区块本身只是“入口”，真正的地图形态由 `.msav` 文件决定。你可以把区块理解为“战役菜单里的按钮”，而地图文件则是“战场本体”。这也意味着区块的 `name` 与地图文件名必须严格一致，否则区块会显示但无法进入。若你想做自定义战役，建议先把地图在编辑器里跑通，再回到 JSON 里配置区块参数。

地图文件里还包含波次、规则与脚本等信息，它们对战斗节奏影响比 `SectorPreset` 更直接。`SectorPreset` 主要管“能不能进入、入口怎么显示”，而 `.msav` 才是真正的“关卡设计”。因此当你发现区块规则写了但不生效，优先检查地图本身是否覆盖了规则。

在原版中，很多区块还会设置 `requireUnlock` 或 `showHidden`，用于控制玩家在战役地图上看到哪些区域。即使你不写这些字段，默认规则也会生效，但写清楚可以避免“解锁顺序混乱”。

## 天气（Weather）

天气文件位于 `content/weathers`。`Weather` 的核心字段包括 `duration`（持续时间，单位为刻）、`opacityMultiplier`（覆盖层不透明度）、`sound`/`soundVol`（音效与音量）、`status`/`statusDuration`（施加的状态与持续时间）以及 `statusAir`/`statusGround`（作用对象）。这些字段决定天气的“强度与范围”。

不同天气子类会有自己的表现参数，例如 `RainWeather` 关注雨线速度、密度与颜色，`ParticleWeather` 会关心粒子大小与飘动。大多数情况下，你可以先复刻原版天气，再逐步替换颜色与状态，以保证效果不会过强或过于杂乱。

## 模组示例：饱和火力 3.3.0 的天气

“电离层异常”是一个 `ParticleWeather`，它把 `statusGround` 设为 `false`，表示只影响空中单位，同时通过 `sound` 与 `soundVol` 强化氛围感：

```json
{
	"name": "电离层异常",
	"type": "ParticleWeather",
	"particleRegion": "circle-small",
	"color": "c0ecff",
	"density": 5000,
	"statusGround": false,
	"sound": "shootArc",
	"soundVol": 4,
	"statusDuration": 3,
	"status": "unmoving"
}
```

“腐蚀性尘降风”则展示了 `attrs` 对地形属性的影响，它通过削弱孢子属性来改变生产环境，同时施加状态：

```json
{
	"name": "腐蚀性尘降风",
	"type": "ParticleWeather",
	"attrs": {"spores": -0.5},
	"color": "a0b46e",
	"density": 3000,
	"opacityMultiplier": 0.4,
	"statusDuration": 10,
	"status": "corroded"
}
```

这两个例子分别强调了“作用对象”和“属性联动”，也说明天气不仅是视觉特效，更是战役节奏的控制器。

## 天气与状态的联动

天气的 `status` 与 `statusDuration` 会周期性施加在单位上，且可以区分空中与地面（`statusAir`/`statusGround`）。这会导致某些单位“天然吃亏”，例如纯地面单位在持续减速天气里会明显受限，而飞行单位可能几乎不受影响。你在设计天气时需要考虑这一点，否则战役的难度会出现“对某类单位极不友好”的偏差。

天气的 `attrs` 还可以影响地形属性，例如降低或增加某些属性值，从而间接影响生产方块的效率。虽然这类设计较少见，但在特殊关卡中很有表现力。

另外，`opacityMultiplier` 会影响覆盖层的可见度，数值太高会让地图过暗、视线压抑；`duration` 则控制天气维持时间，过短会显得“像闪一下”，过长又会让玩家觉得被强制压制。天气是“节奏控制器”，不是单纯装饰，建议配合波次设计一起调。

## 环境方块（Environment）

环境方块通常位于 `content/blocks/environment`，常见类型包括 `Floor`（地板）、`OreBlock`（矿物）、`StaticWall`（环境墙）和 `Prop`（装饰物）。它们的贴图必须放在 `sprites/blocks/environment/`，否则会触发 `Wrong Texture Folder`。

`Floor` 的字段很丰富。`speedMultiplier` 与 `dragMultiplier` 会改变单位移动手感，`damageTaken` 会造成持续伤害，`status` 与 `statusDuration` 能让地板“踩上去就中状态”，`liquidDrop` 与 `liquidMultiplier` 决定泵类方块的抽取效率。若地板是液体，还会用到 `isLiquid` 与 `overlayAlpha` 控制显示效果。`variants` 决定贴图变体数量，`oreScale` 与 `oreThreshold` 则用于矿物的地图生成参数。

除了数值字段，`Floor` 还有不少“观感型”参数。`walkEffect` 与 `walkSound` 可以塑造“踩上去的反馈”，`walkSoundPitchMin/Max` 用于随机音高避免机械重复；`drownTime` 会影响单位在深液体中的生存；`blendGroup` 影响与其他地板的边缘过渡；`supportsOverlay` 与 `needsSurface` 则决定能否叠加覆盖层或放置特殊装饰。这些字段不一定提高强度，但会让地形更“有存在感”。

`OreBlock` 的核心字段是 `itemDrop` 与 `variants`，前者决定掉落物，后者决定贴图变体数量。若你需要控制矿物生成密度，通常会调整 `oreScale` 与 `oreThreshold`，并结合 `oreDefault` 来决定是否参与地图默认生成。`StaticWall` 更关注 `health`、`variants` 与破坏音效；`Prop` 则多用于纯装饰。

```json content/blocks/environment/tutorial-ore.json
{
	"type": "OreBlock",
	"name": "示例矿",
	"itemDrop": "copper",
	"variants": 3
}

```

## 模组示例：饱和火力 3.3.0 的环境方块

“铬”矿展示了 `oreDefault`、`oreScale` 与 `oreThreshold` 的组合用法，同时用 `playerUnmineable` 禁止玩家手动开采，避免早期获取高阶资源：

```json
{
	"type": "OreBlock",
	"name": "铬",
	"itemDrop": "铬",
	"playerUnmineable": true,
	"oreDefault": true,
	"oreThreshold": 0.9,
	"oreScale": 20
}
```

“雪沙”则是一个带属性的地板，它在 `attributes` 里增加油与水属性，让这类地形在生产效率上更有意义：

```json
{
	"type": "floor",
	"name": "雪沙",
	"itemDrop": "sand",
	"speedMultiplier": 0.95,
	"attributes": {"oil": 0.5, "water": 0.2},
	"variants": 2,
	"playerUnmineable": true
}
```

这两个例子说明了“环境方块并非只有装饰用途”，它们也可以直接参与生产与战役节奏的塑造。

如果你希望玩家“走上去就能感觉到地形差异”，可以配合 `walkEffect` 或 `walkSound`，让移动反馈成为环境设计的一部分。

## 环境方块与地图生成

环境方块的 `oreScale` 与 `oreThreshold` 并不会直接“生成矿物”，它们只是告诉地图生成器在什么情况下使用该矿。真正的生成逻辑由生成器决定，因此你在 JSON 里设置这些字段之后，只有在对应生成器中引用了该矿，地图里才会出现它。这也是为什么很多自定义矿物“写了却不生成”的原因。

`oreDefault` 是一个很重要的开关：它决定该矿物是否参与“默认矿物池”。如果你希望它只出现在特定地图，`oreDefault` 就应该设为 `false`，然后在地图脚本或生成器里手动引用；否则它可能会在所有地图里随机出现，破坏战役节奏。类似的还有 `wallOre`，它允许矿物生成在墙体上，常用于“墙矿”或特殊地形，但玩家视角会更难察觉，需要配合明显的贴图。

对于液体地面，`liquidDrop` 与 `liquidMultiplier` 会影响泵类方块的效率，也会影响“水洼”扩散。若你希望某种液体地面更有威胁，可以提高 `damageTaken` 或直接设置 `status`。这些字段结合起来，能让地面从“背景”变成“机制”。

## 生成器（Generator）

行星生成器决定地形、矿物与噪声分布。原版中常见的生成器有 `SerpuloPlanetGenerator`、`ErekirPlanetGenerator`、`AsteroidGenerator`，但 JSON 目前只能反序列化出 `AsteroidGenerator`。如果你想在 JSON 里“复用原版生成器”，需要用 JS/Java 接管生成器字段，再回到 JSON 配置行星或区块。

区块的生成器则是 `FileMapGenerator`，它直接读取 `.msav` 地图文件。因此当你使用自定义区块时，真正影响地形与矿物的是地图文件本身，而不是 JSON 字段。理解这点有助于避免“在 JSON 里调矿物密度却不生效”的困惑。

## 小结

行星和区块决定战役的“大地图”，天气与环境方块决定“战场体验”。当你想做更复杂的生成逻辑时，优先参照 Java 教程，再回到 JSON 实现，会少走很多弯路。

如果目标已经超出 JSON 能力，比如自定义生成器或复杂规则，就该直接转向脚本或 Java。

合理使用天气和环境，还能把战役“讲得更像一个世界”。
