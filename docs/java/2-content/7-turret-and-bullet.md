# 炮塔和子弹

> ***喜欢我石墨雷光吗？***

Mindustry不仅是自动化游戏，还是**塔防（Tower Defense）**游戏，全称**炮塔（Turret）防御**。炮塔是防御敌人的重要手段，是自动化资源的消耗端，更是科技树推进的重要动力。而炮塔发射的子弹（Bullet）在v7更新前也是重要的内容类型，本节将简要介绍炮塔和子弹。

炮塔的基本组成部分包括子弹类型（BulletType）、设计方式（ShootPattern）、炮塔绘制器（Drawer）中的绘制片段（DrawPart）、冷却剂和方块基本属性，下面将分别讲解。

2.6 炮台（Turret）与子弹（BulletType）
- 创建子弹类型（BulletType）// 引子 - 子弹的原理与自定义
- 各类炮塔（Turret）与创建方式
- 弹药声明（Ammo）
- 炮塔的绘制器（TurretDrawer）

## 子弹类型（BulletType）

子弹类型规定了子弹的类型、运动、大小、伤害、能力、目标、行为、功能、与其他子弹的交互、绘制和特效等。在此不能全部列举完毕，如果想要完全了解子弹的功能可参阅源代码。此外，子弹并不一定是“子弹”，比如太空环境下的液体泡（`SpaceLiquidBulletType`），有的炮塔发射出来的东西并非传统意义上的“子弹”，可能干脆是没有贴图的`EmptyBulletType`，或者是激光、水珠、点激光和点方之类的，当然并非炮塔的方块也能发射出子弹，比如质量驱动器的`MassDriverBolt`。整体上来说，“子弹”真正的含义可以说是** “具有确定速度和寿命的、由类炮塔方块发射出来的实体” **

### 抽象基类`BulletType`

首先它是抽象类，这意味着你不能直接实例化它。从功能上，它唯一缺少的就是**绘制**自身贴图，只会绘制尾迹（Trail）和炮塔的绘制器。下简要介绍一些重要的字段：

- 类型组：`laserAbsorb`标记激光伤害，从而可以被塑钢墙吸收；而`reflectable`决定能否被相位墙反弹，`absorbable`决定能否被护盾吸收，`hittable`决定能否被点防；
- 运动组：`lifetime`和`speed`分别是子弹的存在时间和速度，这两个属性还可以用`xxRandMin/Max`组使其值在一定的范围内。注意，设置`range`射程是没有用的，因为最终`range`由`lifetime`和`speed`计算得出。不过你也可以用`rangeOverride`强制缩小射程。而`accel`和`drag`是加速度和阻力的“减速度”，用于计算子弹实际的运动情况；`keepVelocity`可以决定子弹初速度是否继承发射者速度；`scaleLife`允许单位寿命提前到达，就像打空的冰雹；
- 伤害组：`damage`是伤害，还可以像厄兆打蚊子一样设置最高百分比`maxDamageFraction`，；还有其他各类的伤害，如`splashDamage`是溅射伤害，`healPercent`是治疗，`lifesteal`是生命值窃取；
- 尺寸组：`hitSize`是**碰撞箱体积**，在计算物理碰撞时使用；`drawSize`则应**设置**成贴图的半径，以便游戏计算子弹离开屏幕边缘多少像素后可以停止渲染，此项性质在方块中名为`clipSize`；
- 自身能力组：`pierce`可以设置是否有穿透能力，是否能穿透建筑`pierceBuilding`，穿透上限`pierceCap`（-1时无上限），穿透伤害每次衰减`pierceDamageFactor`，`pierceArmor`能穿甲，`killShooter`是自爆卡车；`instantDisappear`让子弹一被创建就立即消失；`createChance`让子弹的生成具有概率性；`spawnBullets`能伴生子弹，而`spawnUnit`和`despawnUnit`在子弹创建和消失时生成单位，还可设置概率和数量；
- 特效组：`hitEffect` `despawnEffect` `shootEffect` `chargeEffect` `smokeEffect` `healEffect`分别对应击中、坠毁、发射、充能、冒烟和治疗特效，`hitSound`和`despawnSound`可以设置击中和坠毁时的音效，此外还能设置音高和音量；
- 行为组：`inaccuracy`是不精确度，`ammoMultiplier`是每物品供弹数量，`reloadMultiplier`可以设置冷却时间倍率，`buildingDamageMultiplier`和`shieldDamageMultiplier`是对建筑伤害倍率和对盾伤害倍率；
- 对外能力组：`knockback`设置对单位击退，但也可以是“击进”；`status`可以给单位施加状态效果；
- 目标组：`targetBlocks`对方块 `targetMissiles`对导弹 `collides`能否攻击到外界 `collidesTiles`与地面碰撞 `collidesTeam`与友军碰撞 `collidesAir`与空军碰撞 `collidesGround`与非空军碰撞 `collideFloor`与地板碰撞 `collideTerrain`与自然环境方块碰撞；
- 还有溅射、周期、拖尾、点火、悬浮、抑制场、闪电、水坑、光亮等功能均可设置；此外还有几个字段没有讲到，不代表不能用，除了那些明确标着`internal`的。

从上面可以看出，原版的子弹系统其实是非常复杂的，有成百个字段可以设置。但需要注意，这些字段中存在着**约定俗成**的固定搭配和固定不搭配，在使用时可以多试几次以达到最好效果。

### 其他类型

上面讲的这套逻辑基本都是针对于有实体子弹的，但是那些没有明确实体、但又想通过子弹系统调控的“子弹”怎么办？在这个问题上，原版采取的方法是，在炮塔原地生成一个不动（`speed = 0f`），不会交互（`collide = false`）的空子弹，然后让空子弹“隔空”绘制表面上的样子和造成应有的伤害。

- `PointLaserBulletType`：点激光，例如“光辉”，长得像钻头光束一样；
- `PointBulletType`：点防，例如“裂解”，画一条线然后消灭掉子弹；
- `LightningBulletType`：闪电，例如“电弧”，释放一道闪电；
- `ShrapnelBulletType`：破片，例如“雷光”，释放三道激光；
- `LaserBulletType`：激光，例如“蓝瑟”，释放一道激光；
- `LiquidBulletType`：液体球，例如“波浪”，发射液体球；
- `RailBulletType`：抛射，例如“冰雹”，绘制一连串尾迹；
- `ExplosionBulletType`：爆炸，例如“遏止”主炮的尾杀，瞬间造成爆炸；
- `SapBulletType`：抑制，例如“血蛭”，绘制一根紫线并给予状态效果。
- `ContinuousLaserBulletType`：连续激光，例如“熔毁”，一旦开火可以保持一段时间；
- `ContinuousLiquidBulletType`：连续液体激光，例如“升华”，一旦开火可以无限保持；

至于实体子弹

