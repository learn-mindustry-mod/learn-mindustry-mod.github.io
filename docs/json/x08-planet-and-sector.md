# 行星、区块、生成器、环境方块

这一节负责“战役与世界”的部分：行星、区块、天气与环境方块。JSON 能做的事情不少，但行星生成器和复杂规则仍建议以原版为参考。

## 行星（Planet）

行星文件位于 `content/planets`。行星主要负责“世界观层”的参数，例如绕行关系、颜色、环境标志与战役设置。常用字段包括 `parent`（父天体）、`radius`（行星半径）、`orbitTime`/`rotateTime`（公转/自转周期）、`atmosphereColor`/`lightColor`（大气与光照颜色）以及 `defaultEnv`（默认环境标志）。如果你希望该星球上的区块默认启用某些环境效果，`defaultEnv` 是最关键的一项。

还有一些与战役体验相关的字段也很实用，例如 `startSector`（默认起始区块）、`launchCapacityMultiplier`（发射时核心容量倍率）、`allowLaunchSchematics` 与 `allowLaunchLoadout`（是否允许玩家选择发射蓝图与携带物品）。这些字段不影响星球的地形生成，却直接影响玩家进入战役时的规则感受。

需要注意的是，JSON 里目前只会把 `generator` 反序列化成 `AsteroidGenerator`，写 `SerpuloPlanetGenerator` 或 `ErekirPlanetGenerator` 并不会生效。如果你想复用“塞普罗”或“埃里克尔”的生成器，需要通过 Java 或 JavaScript 进行扩展。

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

## 区块（SectorPreset）

区块文件位于 `content/sectors`。每个区块必须指定 `sector` 编号，`planet` 可选。区块对应的地图文件必须放在 `maps/<name>.msav`，文件名要和 JSON 文件名一致，否则区块不会生成地图。

`SectorPreset` 常用字段包括 `difficulty`（难度 0-10）、`captureWave`（达到多少波算占领）、`startWaveTimeMultiplier`（开局波次时间倍率）、`addStartingItems`（是否给初始物资）、`noLighting`（禁用光照）、`requireUnlock`（是否需要解锁才能登陆）、`isLastSector`（是否为最终区块）。如果你想控制玩家的发射行为，还可以用 `allowLaunchSchematics` 与 `allowLaunchLoadout`，或者用 `overrideLaunchDefaults` 强制使用区块内配置。

```json content/sectors/tutorial-sector.json
{
	"name": "示例区块",
	"planet": "serpulo",
	"sector": 15
}

```

原版的“零号地区”“冰冻森林”“盐碱荒滩”等都是 `SectorPreset` 的实例。它们大多通过 `rules` 与地图脚本控制玩法细节，JSON 只提供基础的入口。

## 天气（Weather）

天气文件位于 `content/weathers`。常见类型包括 `RainWeather`、`ParticleWeather`、`MagneticStorm`、`SolarFlare` 等。`status` 与 `statusDuration` 决定天气给单位附加什么状态，以及持续多久；`color` 与 `opacity` 决定屏幕覆盖色；`sound` 与 `soundVol` 决定环境音效；`duration` 与 `chance` 决定天气持续时间与出现概率。天气是最容易“过强”的系统之一，建议先小幅度调节再逐步加量。

## 环境方块（Environment）

环境方块通常位于 `content/blocks/environment`，常见类型包括 `Floor`（地板）、`OreBlock`（矿物）、`StaticWall`（环境墙）和 `Prop`（装饰物）。它们的贴图必须放在 `sprites/blocks/environment/`，否则会触发 `Wrong Texture Folder`。

`OreBlock` 的核心字段是 `itemDrop` 与 `variants`，前者决定掉落物，后者决定贴图变体数量。若需要控制生成密度，`oreThreshold` 与 `oreScale` 是最常用的参数。`Floor` 常见字段包括 `speedMultiplier`（移动速度倍率）、`liquidDrop`（地板液体）、`status`（踩上去触发的状态）与 `attributes`（地形属性）。`StaticWall` 和 `Prop` 则更关注 `variants`、`breakSound`、`health` 等表现参数。

```json content/blocks/environment/tutorial-ore.json
{
	"type": "OreBlock",
	"name": "示例矿",
	"itemDrop": "copper",
	"variants": 3
}

```

## 生成器（Generator）

行星生成器决定地形、矿物与噪声分布。原版中常见的生成器有 `SerpuloPlanetGenerator`、`ErekirPlanetGenerator`、`AsteroidGenerator`，但 JSON 目前只能反序列化出 `AsteroidGenerator`。如果你想在 JSON 里“复用原版生成器”，需要用 JS/Java 接管生成器字段，再回到 JSON 配置行星或区块。

## 小结

行星和区块决定战役的“大地图”，天气与环境方块决定“战场体验”。当你想做更复杂的生成逻辑时，优先参照 Java 教程，再回到 JSON 实现，会少走很多弯路。

