# 行星和区块

> ***我们的征途是星辰大海！***

Mindustry模组可分为原版拓展和新星球两种类型。添加新星球可以构建独立的模组叙事，不受原版星球设定的影响。行星系统是原版中为数不多的3D内容，其实现基于v6版本后重构的3D渲染模块，与底层图形计算紧密耦合。本部分将介绍行星、区块、天气和队伍的相关机制。

## 创建一个Planet

::: code-group

``` java
new Planet("tutorial-planet", Planets.sun, 1f, 3);
```

``` kotlin
Planet("tutorial-planet", Planets.sun, 1f, 3)
```

:::

构造方法的第一个参数是行星的名称；第二个参数是行星的公转中心，若为null则无公转中心；第三个参数是行星的半径，Serpulo和Erekir的半径均为1；第四个参数是 **星球网格（PlanetGrid）** 的 **细分（Subdivision）** 次数，当细分次数为0时，每个格子的中心是正二十面体的12个顶点，构成正十二面体，之后每次细分都将**顶点（Corner）**转化为六边形**格子（Tile）**。细分次数为1时，星球网格包含12个正五边形和20个正六边形，共32个区块。

行星可以设置渲染图，但通常不是必需功能。也可以设置小图标（`icon`字段），用于星球选择界面和核心数据库的显示。

```properties bundle_zh_CN.properties
planet.tutorial-mod-tutorial-planet.name = 演示行星
planet.tutorial-mod-tutorial-planet.description = 绕着太阳转。原版甚至没有给行星做过描述。
planet.tutorial-mod-tutorial-planet.details = 这里有人生活过。
```

```properties bundle.properties
planet.tutorial-mod-tutorial-planet.name = Tutorial Planet
planet.tutorial-mod-tutorial-planet.description = Orbits the sun. There is no description of a planet in vanilla.
planet.tutorial-mod-tutorial-planet.details = Here are they.
```

关于Planet各字段的含义如下：

`Planet`类定义了游戏中的行星天体，包含其轨道、几何网格、地表分区、生成规则以及战役相关的各种属性，是星系系统、科技树和战役模式的核心组成部分。

- `mesh`：用于渲染行星的网格；客户端专用，在`load()`中创建。
- `cloudMesh`：用于渲染行星云层的网格；若无云层则为`null`。
- `gridMesh`：用于渲染行星网格轮廓的网格；在服务器端或`grid`为`null`时为`null`。
- `position`：行星在全局坐标系中的位置；在宇宙更新前为(0,0,0)。
- `grid`：行星上区块（Sector）使用的网格；若行星不可登陆则为`null`。
- `generator`：生成行星地形的生成器；对于无需登陆的行星可为`null`。
- `sectors`：区块序列；直接映射到网格中的格子（Tile）。
- `orbitSpacing`：与同一行星系的上一颗行星之间的间距。
- `radius`：行星球体的半径（不包含卫星）。
- `camRadius`：摄像机半径偏移。
- `minZoom`：摄像机最小缩放值。
- `maxZoom`：摄像机最大缩放值。
- `drawOrbit`：是否绘制轨道圆环。
- `atmosphereRadIn`：大气层内半径调整参数。
- `atmosphereRadOut`：大气层外半径调整参数。
- `clipRadius`：裁剪半径；小于0时自动计算。
- `totalRadius`：该行星及其所有子行星的总半径。
- `orbitTime`：行星绕太阳公转一周的时间（单位：秒）；即一年。
- `rotateTime`：行星自转一周的时间（单位：秒）；即一天。
- `orbitOffset`：随机轨道角度偏移，防止所有行星初始在一条直线上。
- `sectorApproxRadius`：单个区块的近似半径。
- `tidalLock`：该行星是否相对于其父星体**潮汐锁定**（始终以同一面朝向父星体）。
- `accessible`：该行星是否在行星访问UI中列出。
- `defaultEnv`：该行星上区块的默认环境标志。
- `defaultAttributes`：默认环境属性。
- `updateLighting`：是否模拟昼夜循环。
- `lightSrcFrom`：昼夜循环中光源起始强度。
- `lightSrcTo`：昼夜循环中光源结束强度。
- `lightDstFrom`：昼夜循环中漫射光起始强度。
- `lightDstTo`：昼夜循环中漫射光结束强度。
- `startSector`：默认显示的起始区块索引，用于地图对话框。
- `sectorSeed`：该行星上区块基础生成的种子；-1表示基于ID使用随机种子。
- `launchCapacityMultiplier`：发射时核心物品容量的倍率。
- `bloom`：是否启用泛光（Bloom）渲染效果。
- `visible`：该行星是否显示。
- `landCloudColor`：着陆时显示的云层颜色。
- `lightColor`：（对于恒星）照射其他行星的光的颜色；对子行星无效。
- `atmosphereColor`：（可登陆行星的）大气层颜色。
- `iconColor`：行星列表中显示的图标颜色。
- `hasAtmosphere`：该行星是否有大气层。
- `allowLaunchSchematics`：是否允许用户为该地图指定自定义发射原理图。
- `allowLaunchLoadout`：是否允许用户指定携带到此地图的资源。
- `allowSectorInvasion`：是否模拟来自敌方基地的区块入侵。
- `allowLegacyLaunchPads`：若为`true`，可启用旧版发射台。
- `clearSectorOnLose`：若为`true`，区块失败时清除其存档。
- `enemyBuildSpeedMultiplier`：敌方建造速度倍率；仅应用于战役（非标准规则）。
- `enemyInfiniteItems`：若为`true`，敌方队伍总是拥有无限物品。
- `enemyCoreSpawnReplace`：若为`true`，该行星上的敌方核心被生成点替换（用于入侵）。
- `prebuildBase`：若为`true`，着陆时核心半径内的方块将被移除并以冲击波形式“重建”。
- `allowWaves`：**已废弃。**
- `allowLaunchToNumbered`：若为`false`，玩家无法登陆到该行星的编号区块。
- `allowCampaignRules`：若为`true`，允许玩家在行星UI中更改难度/规则。
- `icon`：在行星选择对话框中显示的图标（字符串，因为在加载时可绘制对象为空）。
- `launchMusic`：在行星对话框中选择此行星时播放的音乐。
- `defaultCore`：发射时默认的核心方块。
- `parent`：该行星绕其公转的父星体；若为`null`，则该行星被视为位于太阳系中心。
- `solarSystem`：该行星所在太阳系的根父行星。
- `children`：围绕此行星运行的所有子行星（按半径升序排列）。
- `techTree`：在此行星打开科技树时显示的默认根节点。
- `launchCandidates`：可从此行星发射到达的行星列表。
- `allowSelfSectorLaunch`：行星际加速器是否可以向该行星表面的“任何”程序化区块发射。
- `autoAssignPlanet`：若为`true`，该行星科技树中的所有内容将把此行星分配给其`shownPlanets`。
- `unlockedOnLand`：在此行星着陆时解锁的内容（通常是行星特定的）。
- `meshLoader`：加载行星网格的提供器（客户端专用）；默认为一个简单的球体网格。
- `cloudMeshLoader`：加载行星云层网格的提供器（客户端专用）；默认为`null`。
- `gridMeshLoader`：加载行星网格轮廓网格的提供器（客户端专用）。
- `updateGroup`：允许与该行星同时更新的行星集合（用于后台计算）。
- `campaignRules`：该行星战役的全局难度/修改器设置。
- `campaignRuleDefaults`：应用于规则的默认值。
- `ruleSetter`：在该行星的任何区块加载游戏时设置规则的Consumer。
- `showRtsAIRule`：若为`true`，可以自定义RTS AI。
- `loadPlanetData`：若为`true`，行星数据从`planets/{name}.json`加载；仅在原版中经过测试/功能正常。

### 行星的绘制

为了使行星被绘制出来，需要设置行星的形状并将其交由显卡渲染。行星的形状本质上是一个多面体，代表行星多面体的对象的基接口是`mindustry.graphic.GenericMesh`（注意与`arc.graphic.Mesh`区分，Arc对3D**没有支持**）。可用的PlanetMesh包括：

- `HexMesh`：首先使用上文的“细分”算法（通常细分度大于星球网格），然后调用 **星球生成器（Generator）** 获取每个格子的高度和颜色。使用此PlanetMesh不需要传入其他参数，但必须为星球设置`generator`；
- `ShaderSphereMesh`：当前版本的默认PlanetMesh（早期版本为HexMesh），需要输入一个**着色器（Shader）**。着色器负责将宇宙三维坐标转换为屏幕二维坐标，并在转换前对坐标和颜色进行处理；
- `NoiseMesh`：使用噪声生成表面高度和颜色变化的星球，可调节的参数包括细分度、**噪声（Noise）** 的基本参数、星球使用的颜色等。此Mesh是JSON行星的默认PlanetMesh；
- `SunMesh`：使用噪声生成表面颜色变化的星球，高度恒为零；
- `MultiMesh`：组合多个PlanetMesh，以实现多层效果。各个PlanetMesh为简单叠加，渲染时仅显示最终多面体的最外层轮廓；
- 小行星：由若干个`NoiseMesh`在随机方向上通过`MultiMesh`组合而成，具体逻辑位于`Planets::makeAsteroid`中。

::: details JSON下的小行星
如果你不是JSON用户，你只需要强行使用`Planet#makeAsteroid()`方法就可以了，它会给你自动用噪声组装一个`mesh`，但如果使用JSON就没有这么多好事了，不过你仍然可以自己组装合适的`MultiMesh`，下摘取`gier`的`mesh`以供参考：

<<< ./reference/9-1-asteroid.json

:::

此处需要介绍 **噪声（Noise）** 这一概念。噪声是一种算法，能够在给定输入（如坐标）时产生伪随机但连续变化的输出值。其特性包括：对于相同的输入，噪声总是返回相同的值；当使用相同种子时，对于邻近的输入，返回值会平滑过渡；而不同种子则会产生完全不同的输出序列。由于这些特性，噪声常被用于程序化生成地形等场景。此外，在某些游戏机制中，需要一种在时间和空间上看似随机，但在不同客户端和服务器之间保持确定性的伪随机值，例如多变体环境方块的变体，噪声也可用于此类需求。

Mindustry主要使用Simplex噪声算法。噪声算法通常定义了一个多维（二至四维）的数值空间，通过调整参数来控制输出值的特征。以下是Simplex噪声中一些常用参数的含义：

| 名称 | 用途 |
|----|---|
|种子（Seed）|不同的种子能让生成的噪声空间完全不同|
|比例（Scale，`scl`）|调节噪声值中随空间的变化率。**注意，Arc和Unity正好相反，Arc中的Scale实际上应该取倒数，因此实际上对应的是Unity中的频率（Frequency）**。<br>`scl`越大变化越平滑，越小变化越崎岖|
|倍频（Octave，`oct`）|调节噪声的叠加次数。越大边缘越陡峭|
|持久（Persistence，`per`）|调节噪声的叠加强度。越小边缘越陡峭|
|阈值（Thresh）|超过此值才执行某动作。噪声值是非负的。不要让`scl`超过`thresh`！|
至于星球的云层，通常使用`HexSkyMesh`，其构造器参数与前述内容一致。需要说明的是，云层的实际渲染半径为星球的`radius`加上`HexSkyMesh`构造器指定的`radius`，与星球`mesh`的`radius`无关。

在定义所需的mesh后，应设置`meshLoader`和`cloudMeshLoader`，而非直接赋值给`mesh`和`cloudMesh`。`meshLoader`是一个类型为`Prov<GenericMesh>`的lambda表达式，通常按以下方式编写：

``` java
meshLoader = () -> new HexMesh(this, 6);
```

### 数字区块的生成

如果希望行星可登陆，需要为区块添加**预设地图（SectorPreset）**，或为行星设置**生成器（Generator）**。若需与Serpulo或Erekir的生成方式保持一致，可直接使用`SerpuloPlanetGenerator`与`ErekirPlanetGenerator`；小行星则可选用`AsteroidGenerator`。Serpulo的生成器参数固定，Erekir与小行星生成器允许调整与矿物生成相关的噪声阈值及概率参数。需要注意的是，若需在生成器中包含自定义矿物，通常需要参考现有生成器逻辑进行相应扩展。

星球生成器的实现较为复杂，与行星相关的类之间存在较高的耦合度。因此，本阶段建议调用原版中已有的生成器。

## 环境方块

在新星球上需要配置新的环境方块，所有环境方块都位于`mindustry.world.blocks.environment`包中。常用的环境方块类型包括静态墙`StaticWall`、环境摆件`Prop`、地板`Floor`、矿物`OreBlock`等。以`Remove`开头的类通常用于地图编辑器功能，不属于常规的环境方块。

环境方块的主要特性是静态性。它们没有实体，不参与游戏逻辑更新，且渲染结果会被缓存。环境方块所需的贴图资源应放置在`sprites/blocks/environment`目录下，否则会显示为`Wrong Texture Folder`贴图，这与1-2节中提到的图集页机制有关。此外，由于错误贴图（内部标识为`error`）位于`main`图集页，当环境方块找不到对应贴图时，也会渲染出`Wrong Texture Folder`。

## 创建一个SectorPreset

::: code-group

``` java
new SectorPreset("testSector", Planets.serpulo, 15);
```

``` kotlin
SectorPreset("testSector", Planets.serpulo, 15)
```

:::

```properties bundle_zh_CN.properties
sector.tutorial-mod-testSector.name = 演示区块
sector.tutorial-mod-testSector.description = 旅程的起点。
sector.tutorial-mod-testSector.details = 旅起最佳。
```

```properties bundle.properties
sector.tutorial-mod-testSector.name = Turorial Sector
sector.tutorial-mod-testSector.description = The commence of our tutorial.
sector.tutorial-mod-testSector.details = 
```

区块的命名遵循小驼峰（camelCase）规范，这有助于在代码中保持标识符的一致性。现版本中，区块已支持自定义图标，你可通过添加相应贴图资源来实现。具体操作方式与先前其他内容的贴图添加流程一致。此外，要使预设区块生效，还需在 `assets/maps` 目录下提供对应的地图文件。例如，对于名为 `testSector` 的区块，应准备一个名为 `testSector.msav` 的地图存档文件。

## 创建一个Weather

天气是一种环境效果，会在屏幕上显示粒子或雨滴，对单位施加状态效果或位移，或降低环境亮度。

::: code-group

``` java
new RainWeather("hailing");
new ParticleWeather("gray-pall");
```

``` kotlin
RainWeather("hailing")
ParticleWeather("gray-pall")
```

:::

```properties bundle_zh_CN.properties
weather.tutorial-mod-hailing.name = 冰雹
weather.tutorial-mod-gray-pall.name = 灰棘迷雾
```

```properties bundle.properties
weather.tutorial-mod-hailing.name = Hail
weather.tutorial-mod-gray-pall.name = Gray Pall
```

## 获取一个Team

队伍是原版内容之一，原版已注册全部256个队伍，且其构造方法已隐藏，因此使用时直接获取现有队伍即可，**不建议通过反射构造新的队伍**。此外，Team的实例位于`mindustry.game`包中，其结构类似于枚举类。
| 名称 | 用途 |
|----|---|
|`Team.derelict`|废墟队伍|
|`Team.sharded`|玩家队伍|
|`Team.crux`|Serpulo的敌方队伍|
|`Team.malis`|Erekir的敌方队伍|
|`Team.neoplastic`|瘤液敌方队伍|

`TeamEntry`用于在核心数据库中显示队伍信息，当前版本未在其他场景中使用。

## ContentType总结

到这里我们已经遇到了原版基本所有内容类型了，列表如下：

| 字段名 | 说明 |
|---|---|
| item | 以`Item`为基类，代表物品，当前版本无子类，属于可解锁内容 |
| block | 以`Block`为基类，代表方块，功能主要通过子类方法实现，也包含`drawer`等组件，属于可解锁内容 |
| mech_UNUSED | 已废止，代表机甲，在v6版本中机甲机制被移除 |
| bullet | 以`BulletType`为基类，代表子弹类型，功能主要通过子类方法实现，在v7版本中移除了自身的`load()`方法，独立性降低，不支持按名称索引 |
| liquid | 以`Liquid`为基类，代表流体，在v7版本前仅表示液体，但名称沿用至今，属于可解锁内容 |
| status | 以`StatusEffect`为基类，代表状态效果，当前版本无子类，属于可解锁内容 |
| unit | 以`UnitType`为基类，代表单位，当前版本的子类仅作为模板使用，属于可解锁内容 |
| weather | 以`Weather`为基类，代表天气，功能主要通过子类方法实现，属于可解锁内容 |
| effect_UNUSED | 已废止，代表特效，在classic版本中已被移除 |
| sector | 以`SectorPreset`为基类，代表预设区块，当前版本无子类，属于可解锁内容<br><del>*在v5版本中此项名为`zone`，代表区域，属于可解锁内容*</del> |
| loadout_UNUSED | 已废止，并非当前的装载蓝图或物资，在classic版本中已被移除 |
| typeid_UNUSED | 已废止，代表实体类型，旧的实体系统在v6版本中被移除 |
| error | 以`ErrorContent`为基类，代表错误内容 |
| planet | 以`Planet`为基类，代表行星，当前版本无子类，属于可解锁内容 |
| ammo_UNUSED | 已废止，代表弹药类型，在v127（v6.5）版本中将`AmmoType`由类改为接口后删除 |
| team | 以`TeamEntry`为基类，代表队伍，当前版本无子类，属于可解锁内容 |
| unitCommand | 以`UnitCommand`为基类，代表单位命令，v8版本添加，当前版本无子类，支持按名称索引 |
| unitStance | 以`UnitStance`为基类，v8版本添加，代表单位姿态，支持按名称索引 |

需要注意的是，虽然该类从创建之初便标注“不得重排”，但其内部顺序在v6版本前至少经历了五次调整。实际上，该类中各值的顺序与源代码中部分自动生成的文件高度耦合，这导致当前版本已无法轻易删除其中的废止项。

上文提到的“可解锁”“可索引”直接对应内容系统的基类：

- `Content`：游戏“内容”的基类。提供`short`类型的`id`，并自动向`Vars.content`中注册，可以通过id索引。
- `MappableContent`：可映射内容。提供包含`modName`前缀的唯一名称`name`，可以在`Vars.content`中通过名称索引。
- `UnlockableContent`：可解锁内容。提供`localizedName`、`description`和`details`，支持Bundle；支持完整图标和emoji；可在核心数据库中添加统计信息；拥有解锁状态，可以添加到科技树中，也可以绑定到星球。


