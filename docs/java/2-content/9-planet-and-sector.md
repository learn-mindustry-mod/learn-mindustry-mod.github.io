# 行星和区块

> ***我们的征途是星辰大海！***

通常来说，Mindustry的模组可以分为两种：原版拓展和新星球。如果不希望模组的叙事受到原版两个星球的影响，那么我们可以添加一个新的星球来从头构建整个模组的策划。同时，行星也是原版中少有的3D内容，而Anuke在刚创作Mindustry特意删去了LibGDX中**所有**3D的内容，但在v6时又不得不在Mindustry中复原一部分`g3d`代码，这使得行星与3D渲染运算高度耦合。本部分我们会介绍行星和区块相关知识，并且介绍天气和队伍的用法。

## 创建一个Planet

::: code-group

```java
new Planet("tutorial-planet", Planets.sun, 1f, 3);
```

```kotlin
Planet("tutorial-planet", Planets.sun, 1f, 3)
```

:::

构造方法的第一个参数是行星的名称；第二个参数是行星的公转中心，如果为null就没有公转中心，可以算作恒星；第三个参数是星球的半径，Serpulo和Erekir的半径均为1；第四个参数是 **星球网格（PlanetGrid）** 的 **细分（Subdivision）** 次数，当细分次数为0时，每个格子的中心是正二十面体的12个顶点，构成正十二面体，之后每次细分都把**顶点（Corner）**转化成六边形**格子（Tile）**，因此，细分次数为1时，星球是足球形，有12个正五边形和20个正六边形，共32个区块。

你可以给你的行星放一张渲染图，不过短时间内你也用不上。还可以画一张小图标，设置给`icon`，在星球选单和核心数据库中使用。

```properties bundle_zh_CN.properties
planet.tutorial-mod-tutorial-planet.name = 演示行星
planet.tutorial-mod-tutorial-planet.description = 绕着太阳转。原版甚至没有给状态效果做过描述。
planet.tutorial-mod-tutorial-planet.details = 这里有人生活过。
```

```properties bundle.properties
planet.tutorial-mod-tutorial-planet.name = Tutorial Planet
planet.tutorial-mod-tutorial-planet.description = Orbits the sun. There is no description of a status effect in vanilla.
planet.tutorial-mod-tutorial-planet.details = Here lives.
```

关于Planet各字段的含义如下：

（棍母，自己把整个类复制给deepseek就告诉你了）

### 行星的绘制

为了使行星被绘制出来，我们需要设置行星的形状并将其交给显卡渲染，而行星的形状本质上就是一个多面体，而代表行星多面体的对象的基接口是`mindustry.graphic.GenericMesh`（不要和`arc.graphic.Mesh`搞混，原生Arc对3D支持极为有限）。能用的PlanetMesh包括：

- `HexMesh`：先使用上文的“细分”算法，一般细分度比星球网格要大，再调用 **星球生成器（Generator）** 获取每个格子的高度和颜色，使用此PlanetMesh不需要传入其他参数，但是一定要给星球设置`generator`；
- `ShaderSphereMesh`：现版本的默认PlanetMesh（但以前是HexMesh），需要输入一个**着色器（Shader）**，现阶段只需要知道shader负责把宇宙三维坐标转化成屏幕二维坐标，并在转化前对坐标和颜色再作一些处理。请不要关注它的实际效果；
- `NoiseMesh`：使用噪声形成一个表面高度和颜色富有变化的星球，可调节的参数包括细分度、**噪声（Noise）** 的基本参数、星球用到的颜色等，这也是json星的默认PlanetMesh；
- `SunMesh`：使用噪声形成一个表面颜色富有变化的星球，高度恒为零；
- `MultiMesh`：组合以上的PlanetMesh，以达成多层的效果。各个PlanetMesh是简单叠加的，显示的时候只显示最终多面体的最外层轮廓；
- 小行星：实际上是若干个`NoiseMesh`在随机方向上用`MultiMesh`的组合，具体逻辑在`Planets::makeAsteroid中`。

::: details JSON下的小行星
如果你不是JSON用户，你只需要强行使用`Planet#makeAsteroid()`方法就可以了，它会给你自动用噪声组装一个`mesh`，但如果使用JSON就没有这么多好事了，不过你仍然可以自己组装合适的`MultiMesh`，下摘取`gier`的`mesh`以供参考：

<<< ./reference/9-1-asteroid.json

:::

此处不得不提及 **噪声（Noise）** 这一概念。噪声是随机性和确定性的矛盾统一体：确定性体现在，对于相同的输入，噪声总是返回相同的值，种子相同时，对于数值相近的输入，返回值也会平滑地发生变化；随机性体现在，其输入和输出之间的联系是令人费解的，种子不同时，返回值也大相径庭。由于其特殊的性质，噪声常被应用于地形生成上。此外，在某些场合上，我们想要一个随机的值，在时间和空间尺度上不可预测，但在游戏层面上 **幂等** ，比如，“分离机”的输出结果在地图不同位置和不同时间的结果是不可预测的，但我们希望同一个分离机在不同玩家的客户端和服务端中的输出时刻保持一致。

噪声的实现较多，Minecraft中偏好使用Berlin噪声，而Mindustry中偏好使用Simplex噪声，关于不同噪声的优劣大多时候并不重要。噪声实现会产生一个空间，可能是二到四维的，使用时，把噪声空间的参数设置好后，直接取一个点获取其对应的噪声值。此处介绍Simplex噪声空间的一些参数：

| 名称 | 用途 |
|----|---|
|种子（Seed）|不同的种子能让生成的噪声空间完全不同|
|比例（Scale，`scl`）|调节噪声值中随空间的变化率。**注意，Arc和Unity正好相反，Arc中的Scale实际上应该取倒数，因此实际上对应的是Unity中的频率（Frequency）**。<br>`scl`越大变化越平滑，越小变化越崎岖|
|倍频（Octave，`oct`）|调节噪声的叠加次数。越大边缘越陡峭|
|持久（Persistence，`per`）|调节噪声的叠加强度。越小边缘越陡峭|
|阈值（Thresh）|字面意思，超过此值才执行某动作。噪声值是非负的。不要让`scl`超过`thresh`！|

至于星球的云层，你最好只用`HexSkyMesh`，其构造器所有参数我们都已经讲过了。需要提及的是半径问题，云层的实际半径是，其`radius`加上星球的`radius`，和`mesh`的`radius`是没有关系的。

在写完想要的mesh后，请去设置`meshLoader`和`cloudMeshLoader`，而非`mesh`和`cloudMesh`。`meshLoader`是一个lambda，类型是`Prov<GenericMesh>`，现在你可能还比较费解，不过你只需要这么写：

``` java
meshLoader = () -> new HexMesh(this, 6);
```

### 数字区块的生成

如果想让行星可以登陆，我们要么给区块添加**预设地图（SectorPreset）**，要么给行星添加**生成器（Generator）**，如果你只想和Serpulo或Erekir保持一致，你可以直接使用`SerpuloPlanetGenerator`和`ErekirPlanetGenerator`，小行星可以使用`AsteroidGenerator`生成。Serpulo的生成器没有参数可改，Erekir和小行星生成器可以更改一些与矿物生成有关的噪声阈值和几率。不过，你没有办法在不照抄一遍代码的情况下**让星球生成你的矿物**。

星球生成器背后的原理极为复杂。与行星有关的类耦合程度都非常高。可以说，行星生成器是游戏本体代码中的珠穆朗玛峰了。

## 创建一个SectorPreset

::: code-group

```java
new SectorPreset("testSector", Planets.serpulo, 15);
```

```kotlin
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
sector.tutorial-mod-testSector.details = INITIATION DOCTRINAE
```

你有注意到区块的`name`是小驼峰命名吗？

现版本区块也有自己的图标了，像之前一样添加贴图即可。

接下来，你只需要在`assets/maps`目录下面添加一张名为`testSector.msav`的地图文件就可以了。

## 创建一个Weather

天气是会在屏幕上显示粒子效果或者雨滴，并给单位施加状态效果和位移，并且降低环境亮度。

::: code-group

```java
new RainWeather("hailing");
new ParticleWeather("gray-pall");
```

```kotlin
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

队伍也是原版内容之一，但是原版已经注册完了256个队伍，并且把构造方法隐藏了起来，因此你需要用的时候直接获取就好，**不建议用反射构造新的队伍！**。此外，Team的实例并不在`mindustry.content`或`mindustry.type`包里，而是在`mindustry.game`里，形成了一个类似枚举的类。

| 名称 | 用途 |
|----|---|
|`Team.derelict`|废墟的队伍|
|`Team.sharded`|玩家的队伍|
|`Team.crux`|Serpulo的敌人队伍|
|`Team.malis`|Erekir的敌人队伍|
|`Team.neoplastic`|瘤液敌人队伍|

而`TeamEntry`是用来在核心数据库中显示队伍信息的类，现版本他处没有使用到此类。

## ContentType总结

到这里我们已经遇到了原版基本所有内容类型了，列表如下：

| 字段名 | 说明 |
|---|---|
| item | 以`Item`为基类，代表物品，现版本没有子类，可解锁 |
| block | 以`Block`为基类，代表方块，功能实现基本靠子类方法，也有drawer这样的组件，可解锁 |
| mech_UNUSED | 已废止，代表机甲，在v6时机甲机制被删除 |
| bullet | 以`BulletType`为基类，代表子弹类型，功能实现基本靠子类方法，在v7时失去了自己的`load()`方法，独立性变弱，不可按名索引 |
| liquid | 以`Liquid`为基类，代表流体，v7前只是液体，但是名称已经积重难返，可解锁|
| status | 以`StatusEffect`为基类，代表状态效果，现版本没有子类，可解锁 |
| unit | 以`UnitType`为基类，代表单位，现版本子类都只是模板，可解锁 |
| weather | 以`Weather`为基类，代表天气，功能实现基本靠子类方法，**可解锁** |
| effect_UNUSED | 已废止，代表特效，在classic版本就已经被移除了 |
| sector | 以`SectorPreset`为基类，代表预设区块，现版本没有子类，可解锁<br><del>*在v5时此项叫作`zone`，代表区域，可解锁*</del> |
| loadout_UNUSED | 已废止，并不是现在的装载蓝图或物资，在classic版本就已经被移除了 |
| typeid_UNUSED | 已废止，代表实体类型，旧的实体系统在v6中被移除 |
| error | 以`ErrorContent`为基类，代表错误内容 |
| planet | 以`Planet`为基类，代表行星，现版本没有子类，可解锁 |
| ammo_UNUSED | 已废止，代表弹药类型，随着v127（v6.5）将`AmmoType`由类变为接口被删除 |
| team | 以`TeamEntry`为基类，代表队伍，现版本没有子类，可解锁 |
| unitCommand | 以`UnitCommand`为基类，代表单位命令，v8添加，现版本没有子类，可按名索引 |
| unitStance | 以`UnitStance`为基类，v8添加，代表单位姿态，可按名索引 |

讽刺的是，虽然这个类从存在开始就标着“不得重排”，但是在v6前重排了至少五次，<del>因此合理猜测Anuke当时在学习有机化学的时候被重排搞疯了</del>。实际上这个类中各个值的顺序与源代码中某些自动生成的文件是高度耦合的，导致现在Anuke也没有办法删去废止项了。

上文提到的“可解锁”“可索引”直接表示内容系统的基类：

- `Content`：一切游戏“内容”的基类。提供short类型的`id`，并且自动向`Vars.content`中注册，可以用id索引；
- `MappableContent`：可映射内容。提供唯一名称`name`，包括`modName`前缀，可以在`Vars.content`中用名称索引；
- `UnlockableContent`：可解锁内容。提供`localizedName`、`description`和`details`，提供Bundle支持；支持full图标和emoji；在核心数据库中可以添加统计信息；拥有是否解锁的状态，可以添加到科技树中，可以绑定星球。


