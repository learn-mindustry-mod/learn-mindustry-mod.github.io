# 行星、区块、生成器、环境方块

这一节负责“战役与世界”的部分：行星、区块、天气与环境方块。JSON能做的事情不少，但行星生成器和复杂规则仍然建议以原版为参考。

## 行星（Planet）

行星文件位于`content/planets`。在JSON里通常会设置：

- `parent`：绕行的父天体；
- `radius`：行星半径（原版“塞普罗”“埃里克尔”都是1）；
- `orbitTime`/`rotateTime`：公转/自转周期；
- `atmosphereColor`/`lightColor`：大气与光照颜色；
- `defaultEnv`：默认环境标志；
- `generator`：行星生成器（JSON里目前只会解析为`AsteroidGenerator`，想复用“塞普罗”/“埃里克尔”那套需Java/JS）。

> 原版行星包括“塞普罗”“埃里克尔”。

### 一个最小行星示例

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

## 区块（SectorPreset）

区块文件位于`content/sectors`。JSON里创建区块时必须指定`sector`编号，`planet`可选。

```json content/sectors/tutorial-sector.json
{
	"name": "示例区块",
	"planet": "serpulo",
	"sector": 15
}

```

要让区块可用，还需要提供同名地图文件：`maps/tutorial-sector.msav`。

> 原版区块示例包括“零号地区”“冰冻森林”“盐碱荒滩”等。

## 天气（Weather）

天气文件位于`content/weathers`，类型常见有：

- `RainWeather`：雨类；
- `ParticleWeather`：粒子类；
- `MagneticStorm`：磁暴；
- `SolarFlare`：太阳耀斑。

常用字段：

- `status`/`statusDuration`：给予的状态效果与持续时间；
- `sound`/`soundVol`：音效；
- `color`/`opacity`：颜色与透明度；
- `duration`/`chance`：持续时间与出现概率。

## 环境方块（Environment）

环境方块通常位于`content/blocks/environment`，常见类型包括：

- `Floor`：地板；
- `OreBlock`：矿物；
- `StaticWall`：环境墙；
- `Prop`：装饰物。

### 贴图规则（重要）

环境方块贴图必须放在`sprites/blocks/environment/`。放错目录会出现`Wrong Texture Folder`。

### 一个简单矿物示例

```json content/blocks/environment/tutorial-ore.json
{
	"type": "OreBlock",
	"name": "示例矿",
	"itemDrop": "copper",
	"variants": 3
}

```

## 生成器（Generator）

行星生成器决定地形、矿物与噪声分布。原版常用生成器包括：

- `SerpuloPlanetGenerator`
- `ErekirPlanetGenerator`
- `AsteroidGenerator`

JSON侧目前只能反序列化出`AsteroidGenerator`（`ContentParser`里写死了），写`SerpuloPlanetGenerator`或`ErekirPlanetGenerator`也不会生效；想复用原版生成器需要Java/JS支持。

## 小结

- 行星和区块决定战役的“大地图”；
- 天气与环境方块决定“战场体验”；
- 复杂生成逻辑建议先看Java教程，再回到JSON实现。
