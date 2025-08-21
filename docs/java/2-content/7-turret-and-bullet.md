# 炮塔和子弹

> ***喜欢我石墨雷光吗？***

Mindustry不仅是自动化游戏，还是**塔防（Tower Defense）**游戏，全称**炮塔（Turret）防御**。炮塔是防御敌人的重要手段，是自动化资源的消耗端，更是科技树推进的重要动力。而炮塔发射的子弹（Bullet）在v7更新前也是重要的内容类型，本节将简要介绍炮塔和子弹。

炮塔的基本组成部分包括子弹类型（BulletType）、射击方式（ShootPattern）、炮塔绘制器（Drawer）中的绘制片段（DrawPart）、冷却剂和方块基本属性，下面将分别讲解。

2.6 炮台（Turret）与子弹（BulletType）
- 创建子弹类型（BulletType）// 引子 - 子弹的原理与自定义
- 各类炮塔（Turret）与创建方式
- 弹药声明（Ammo）
- 炮塔的绘制器（TurretDrawer）

为了方便测试，这里送给你一个模板：

::: code-group

``` java
new ItemTurret("tutorial-item-turret"){{
    requirements(Category.turret, with(Items.copper, 39));
    ammo(Items.copper, new BasicBullet(1.5f,9));
    shoot = new ShootPattern()
    drawer = new DrawTurret(){{
        parts.putAll();
    }};
    consumePower(40f);
    coolant = consumeCoolant(0.1f);
}}；
```

``` kotlin
ItemTurret("tutorial-item-turret").apply{
    requirements(Category.turret, with(Items.copper, 39))
    ammo(Items.copper, BasicBullet(1.5f,9))
    shoot = ShootPattern()
    drawer = DrawTurret().apply{
        parts.putAll()
    }
    consumePower(40f)
    coolant = consumeCoolant(0.1f)
}
```

:::

## 子弹类型（BulletType）

子弹类型规定了子弹的类型、运动、大小、伤害、能力、目标、行为、功能、与其他子弹的交互、绘制和特效等。在此不能全部列举完毕，如果想要完全了解，可参阅源代码。此外，子弹并不一定是“子弹”，比如太空环境下的液体泡（`SpaceLiquidBulletType`），有的炮塔发射出来的东西并非传统意义上的“子弹”，可能干脆是没有贴图的`EmptyBulletType`，或者是激光、水珠、点激光和点方之类的，当然并非炮塔的方块也能发射出子弹，比如质量驱动器的`MassDriverBolt`。整体上来说，“子弹”真正的含义可以说是** “具有确定速度和寿命的、由类炮塔方块发射出来的实体” **

要新建一个子弹类型：

::: code-group

``` java
new BasicBullet(1.5f,9);
```

``` kotlin
BasicBullet(1.5f,9)
```

:::

其中，构造方法的两个参数分别为子弹速度和伤害。在v6以前，子弹类型是独立于炮塔和单位存在的，有自己的一个独立内容类`mindustry.content.BulletType`方便加载，如今此类已经名存实亡了，但子弹类型由此成为一种内容，是`Content`的子类。

`BulletType`是抽象基类，所有子弹类型都是从这里派生出去的，这意味着你不能直接实例化它。从功能上，它唯一缺少的就是**绘制**自身贴图，只会绘制尾迹（Trail）和炮塔的绘制器。下简要介绍一些重要的字段：

### 1. 核心属性 (Core Properties)
这些是定义一个子弹最基本行为的字段。
*  `lifetime`: 子弹的生命周期，单位是游戏刻（ticks）。超过这个时间，子弹会自然消失（触发 `despawn`）。
*  `lifeScaleRandMin`, `lifeScaleRandMax`: 子弹生成时，其生命周期会乘以一个在这两个值之间随机选取的系数，用于增加随机性。
*  `speed`: 子弹的初始速度（单位/刻）。
*  `velocityScaleRandMin`, `velocityScaleRandMax`: 子弹生成时，其速度会乘以一个在这两个值之间随机选取的系数。
*  `damage`: 子弹的直接撞击伤害。
*  `hitSize`: 子弹的碰撞箱（Hitbox）大小，用于检测与实体（单位、建筑）的碰撞。
*  `drawSize`: 子弹的绘制大小和世界裁剪范围。如果子弹超出视口这个范围，就不会被绘制。
*  `angleOffset`, `randomAngleOffset`: `angleOffset` 是固定的角度偏移，`randomAngleOffset` 是随机的角度偏移范围。两者都会在子弹生成时加到其初始角度上。
*  `drag`: 子弹的拖拽/阻力系数。每帧速度会乘以 `(1 - drag)`，使其逐渐减慢。
*  `accel`: 子弹的加速度（单位/刻²）。每帧速度会增加这个值。
*  `layer`: 子弹绘制的Z层（层级），用于控制渲染顺序（例如在单位上方还是下方）。
*  `setDefaults`: 如果为 `true`，引擎会自动设置一些合理的默认值（例如，如果有闪电效果，则默认状态效果为“电击”）。

### 2. 穿透与碰撞 (Piercing & Collision)
控制子弹如何与场景中的其他实体交互。
*  `pierce`: 子弹是否可以穿透单位。
*  `pierceBuilding`: 子弹是否可以穿透建筑。
*  `pierceCap`: 子弹最多可以穿透多少个实体。`-1` 表示无限穿透。
*  `pierceDamageFactor`: 子弹每穿透一个实体后，其伤害减少的系数。伤害减少值为 `初始生命值 * pierceDamageFactor`。
*  `removeAfterPierce`: 如果为 `true`，当子弹伤害因穿透降至0或以下时，子弹会被移除。如果为 `false`，即使伤害为0也会继续飞行。
*  `maxDamageFraction`: 对单个目标的伤害上限。伤害不会超过 `目标最大生命值 * maxDamageFraction`。
*  `laserAbsorb`: （通常用于穿透激光）是否可以被塑钢墙（Plastanium Wall）吸收。
*  `optimalLifeFract`: 生命百分比（0到1之间），在此时间点子弹处于最佳状态（用于连续武器的计算）。
*  `collidesTiles`: 是否与地形块（Tile）碰撞。
*  `collidesTeam`: 是否与同队（相同队伍）的实体碰撞。
*  `collidesAir`,`collidesGround`: 是否与空中或地面单位碰撞。
*  `collides`: 总开关，是否与任何东西发生碰撞。如果为 `false`，则忽略其他碰撞设置。
*  `collideFloor`: 是否与非表面的地板（如深水）碰撞。
*  `collideTerrain`: 是否与静态墙壁（如山脉）碰撞。
*  `hittable`: 该子弹是否可以被防御塔（Point Defense）击中。
*  `reflectable`: 该子弹是否可以被反射（例如被盾牌反射）。
*  `absorbable`: 该子弹是否可以被护盾吸收。
*  `sticky`: 子弹是否会“粘”在碰撞到的第一个实体上，并停止运动。
*  `stickyExtraLifetime`: 子弹粘附后，其生命周期会增加的时间。

### 3. 效果与音效 (Effects & Sounds)
控制子弹创建、命中、消失时的视听效果。
*  `hitEffect`: 子弹击中某个目标时播放的效果（Effect）。
*  `despawnEffect`: 子弹生命周期结束时播放的效果。
*  `shootEffect`: 子弹被发射时播放的效果。
*  `chargeEffect`: （通常用于单发武器）开始充能时播放的效果。
*  `smokeEffect`: 发射时产生的额外烟雾效果。
*  `hitSound`,`despawnSound`: 击中目标和自然消失时播放的音效。
*  `hitSoundPitch`,`hitSoundVolume`: 击中音效的音调和音量。
*  `hitColor`: 用于命中（hit）和消失（despawn）效果的颜色。
*  `hitShake`,`despawnShake`: 击中目标和自然消失时造成的屏幕震动强度。

### 4. 发射器与武器属性 (Turret/Weapon Properties)
这些属性主要影响发射该子弹的武器（如炮塔）的行为。
*  `inaccuracy`: 发射时的额外不准确度（散射），单位是角度。
*  `ammoMultiplier`: 每份弹药（物品/液体）能发射多少颗这种子弹。
*  `reloadMultiplier`: 乘以炮塔的装填速度，得到最终的发射速率。
*  `buildingDamageMultiplier`: 对建筑造成的伤害倍率（乘以 `damage`）。
*  `shieldDamageMultiplier`: 对护盾造成的伤害倍率。
*  `recoil`: 发射时施加给发射者的后坐力。
*  `killShooter`: 发射这颗子弹是否会杀死发射者（用于自杀式攻击）。
*  `targetBlocks`,`targetMissiles`: （炮塔AI用）是否以区块和导弹为目标。
*  `keepVelocity`: 子弹的初始速度是否继承发射者的速度。
*  `scaleLife`: 是否根据到目标的距离缩放生命周期（用于 artillery 类武器）。
*  `ignoreSpawnAngle`: 如果为 `true`，创建子弹时传入的角度参数将被忽略（通常用于效果子弹，其角度由其他因素决定）。
*  `createChance`: 子弹被成功创建的概率（0到1之间）。
*  `range`: （由 `calculateRange()` 计算得出）子弹的理论最大射程。
*  `maxRange`,`rangeOverride`,`rangeChange`,`extraRangeMargin`,`minRangeChange`: 一系列复杂参数，用于覆盖、调整和计算炮塔的实际攻击范围。

### 5. 特殊效果与行为 (Special Effects & Behaviors)
子弹除了直接撞击外可以触发的其他效果。
*  `splashDamage`: 范围溅射伤害。
*  `scaledSplashDamage`: 溅射伤害是否根据单位碰撞箱大小进行“正确”的缩放。
*  `splashDamageRadius`: 溅射伤害的半径。
*  `splashDamagePierce`: 溅射伤害是否穿透地形。
*  `knockback`: 击中单位时造成的击退力。
*  `impact`: 击退方向是否遵循子弹的方向（`true`），而不是碰撞点与单位中心的方向（`false`）。
*  `status`,`statusDuration`: 击中时施加的状态效果及其持续时间。
*  `healPercent`,`healAmount`: 如果子弹是治疗弹，这两个参数决定治疗量（基于最大生命值的百分比和固定值）。
*  `healColor`,`healEffect`: 治疗时效果的颜色和效果类型。
*  `lifesteal`: 造成伤害后，治疗发射者的比例。
*  `makeFire`: 是否在击中点生成火焰。
*  `instantDisappear`: 子弹生成后是否立即消失（用于实现某些瞬时效果）。
*  `despawnHit`: 子弹自然消失时是否也播放命中效果（`hit`）。如果子弹有碎片、溅射等效果，此值会自动设为 `true`。

### 6. 分裂子弹 (Fragmentation)
子弹在命中或消失时产生其他子弹。
*  `fragBullet`: 分裂出的子弹类型。
*  `delayFrags`: 是否将分裂子弹的创建延迟到下一帧（用于解决穿透子弹的复杂伤害计算问题）。
*  `fragOnHit`: 是否在击中时产生分裂子弹。
*  `fragOnAbsorb`: 是否在被护盾吸收时产生分裂子弹。
*  `fragRandomSpread`: 分裂子弹的随机角度扩散范围。
*  `fragSpread`: 分裂子弹之间的均匀角度间隔。
*  `fragAngle`: 分裂子弹的基础角度偏移。
*  `fragBullets`: 产生的分裂子弹数量。
*  `fragVelocityMin`,`fragVelocityMax`: 分裂子弹速度的随机范围（乘以基础速度）。
*  `fragLifeMin`,`fragLifeMax`: 分裂子弹生命周期的随机范围（乘以基础生命周期）。
*  `fragOffsetMin`,`fragOffsetMax`: 分裂子弹生成位置距离父子弹的随机偏移量。
*  `pierceFragCap`: 如果子弹可以穿透，它最多可以释放多少次分裂子弹。

### 7. 间隔子弹 (Interval Bullets)
子弹在飞行过程中定期发射其他子弹。
*  `intervalBullet`: 定期发射的子弹类型。
*  `bulletInterval`: 发射间隔时间（刻）。
*  `intervalBullets`: 每次间隔发射的子弹数量。
*  `intervalRandomSpread`: 间隔子弹的随机角度扩散。
*  `intervalSpread`: 多个间隔子弹之间的角度间隔。
*  `intervalAngle`: 间隔子弹的角度偏移。
*  `intervalDelay`: 开始发射间隔子弹前的初始延迟。

### 8. 生成单位 (Spawning Units)
子弹本身可以生成一个单位（如导弹），或在命中/消失时生成单位。
*  `spawnUnit`: 子弹**本身**被替换成的单位类型（例如，发射器射出的其实是一个导弹单位）。
*  `despawnUnit`: 在命中或消失时生成的单位类型。
*  `despawnUnitChance`: 生成该单位的概率。
*  `despawnUnitCount`: 生成单位的数量。
*  `despawnUnitRadius`: 生成单位位置相对于子弹的随机偏移半径。
*  `faceOutwards`: 生成的单位是否面朝外（远离子弹中心），而不是面朝子弹的方向。

### 9. 视觉部件与轨迹 (Visual Parts & Trail)
控制子弹的自定义外观。
*  `parts`: 一个 `DrawPart` 序列，用于为子弹添加复杂的自定义绘制部件。
*  `trailColor`: 轨迹的颜色。
*  `trailChance`: 每帧产生轨迹效果的概率。
*  `trailInterval`: 产生轨迹效果的固定间隔时间（刻）。如果 >0，则优先于 `trailChance`。
*  `trailMinVelocity`: 产生轨迹效果所需的最小速度。
*  `trailEffect`: 产生的轨迹效果（通常是粒子效果）。
*  `trailSpread`: 轨迹效果的随机位置偏移。
*  `trailParam`: 传递给轨迹效果的参数（通常控制大小）。
*  `trailRotation`: `trailParam` 参数是否使用子弹的旋转角度。
*  `trailLength`: 轨迹网格的长度（渲染为一条带）。如果 >0，会启用**另一种**连续的轨迹渲染方式。
*  `trailWidth`: 轨迹网格的宽度。
*  `trailSinMag`,`trailSinScl`: 轨迹宽度的正弦波波动幅度和 scale。
*  `trailInterp`: 轨迹宽度随子弹生命周期变化的插值方式。

### 10. 运动模式 (Movement Patterns)
特殊的子弹运动行为。
*  `circleShooter`: 子弹是否尝试环绕发射者飞行。
*  `circleShooterRadius`: 环绕的目标半径。
*  `circleShooterRadiusSmooth`: 环绕时转向的平滑过渡系数
*  `circleShooterRotateSpeed`: 环绕旋转的速度乘数。
*  `homingPower`: 追踪目标的能力强度（转向速度）。
*  `homingRange`: 追踪传感器的范围。
*  `homingDelay`: 开始追踪前的延迟时间。
*  `followAimSpeed`: 子弹跟随发射者准星的速度（用于玩家控制的单位）。
*  `weaveScale`,`weaveMag`,`weaveRandom`: 控制子弹“蛇形”运动的参数（Scale，幅度，是否随机初始方向）。
*  `rotateSpeed`: 子弹速度向量自身的旋转速度（度/刻）。

### 11. 其他效果 (Other Effects)
*  `lightning`: 击中时产生的闪电链数量。
*  `lightningColor`: 闪电颜色。
*  `lightningLength`,`lightningLengthRand`: 闪电基础长度和随机额外长度。
*  `lightningDamage`: 闪电造成的伤害（如果为负数，则使用子弹的 `damage`）。
*  `lightningCone`,`lightningAngle`: 闪电的扩散锥形角度和基础角度偏移。
*  `lightningType`: 在闪电端点创建的子弹类型（用于二次攻击）。
*  `incendAmount`,`incendSpread`,`incendChance`: 生成火焰的数量、扩散范围、概率。
*  `puddles`,`puddleRange`,`puddleAmount`,`puddleLiquid`: 生成液体坑的数量、位置范围、液体量、液体类型。
*  `suppressionRange`,`suppressionDuration`,`suppressionEffectChance`,`suppressColor`: 抑制敌人方块回复的效果范围、持续时间、生效几率、效果颜色。
*  `lightRadius`,`lightOpacity`,`lightColor`: 子弹发出的动态光照的半径、透明度、颜色。

### 12. 杂项与内部字段 (Misc & Internal)
*  `underwater`: **(高度实验性)** 是否在水下渲染。
*  `spawnBullets`: 与此子弹**同时**创建的其他子弹（用于视觉效果，如枪口的多发子弹）。
*  `spawnBulletRandomSpread`: 上述同时创建的子弹的随机角度扩散。
*  `displayAmmoMultiplier`: 是否在游戏内统计信息中显示弹药倍率。
*  `statLiquidConsumed`: 如果 >0，这个值（除以 `ammoMultiplier`）会显示在统计信息中，用于液体弹药。
*  `cachedDps`: 内部缓存字段，用于存储估计的每秒伤害值（DPS），避免重复计算。

从上面可以看出，原版的子弹系统其实是非常复杂的，有成百个字段可以设置。但需要注意，这些字段中存在着**约定俗成**的固定搭配和固定不搭配，在使用时多试几次以达到最好效果。

对于有实体的子弹，一般`BulletType`的子类`BasicBulletType`已经足够满足需求，子类型只是做了一些字段的设置，在原版中这样的现象叫做**模板（Template）**，在单位中你会再一次看到这种现象。以下是有实体炮弹：

- `BasicBulletType`：常规子弹，例如“双管”；
- `BombBulletType`：轰炸弹，例如“天垠”，原地不动并造成溅射伤害；
- `MissileBulletType`：导弹，例如“蜂群”，会有概率绘制一些尾迹；
- `ArtilleryBulletType`：炮弹，例如“冰雹”，可提前结束寿命，并绘制尾迹特效；
- `FlakBulletType`：高射炮，例如“分裂”，可在单位附近爆炸造成伤害而不需要直接击中；
- `LaserBoltBulletType`：激光弹，例如“新星”，在贴图之上绘制两条彩色线；
- `InterceptorBulletType`：点防弹，与`PointDefenseBulletWeapon`捆绑使用，目前没有使用，推测是为瘤液更新准备的；
- `EmpBulletType`：电磁屏蔽弹，例如“龙王”，降低敌方建筑速度，并在范围内伤害敌方一切；
- `MassDriverBolt`：质量驱动弹，由质量驱动器发射，也可造成伤害。`v149`添加了使用质驱杀死敌人的成就，并且内容物可以影响子弹的伤害。

上面讲的这套逻辑基本都是针对于有实体子弹的，但是那些没有明确实体、但又想通过子弹系统调控的“子弹”怎么办？在这个问题上，原版采取的方法是，在炮塔原地生成一个不动（`speed = 0f`），不会交互（`collide = false`）的空子弹，然后让空子弹“隔空”绘制应有的样子和造成应有的伤害。

- `PointLaserBulletType`：采矿激光，例如“光辉”，长得像钻头光束一样；
- `PointBulletType`：点防激光，例如“裂解”，画一条线然后消灭掉子弹；
- `LightningBulletType`：闪电，例如“电弧”，释放一道闪电；
- `ShrapnelBulletType`：激光尖，例如“雷光”，释放一道激光尖；
- `LaserBulletType`：激光，例如“蓝瑟”，释放一道激光；
- `LiquidBulletType`：液体球，例如“波浪”，发射液体球；
- `RailBulletType`：轨道炮，例如“厄兆”，瞬间击中目标；
- `ExplosionBulletType`：爆炸，例如“遏止”主炮的尾杀，瞬间造成爆炸；
- `SapBulletType`：抑制，例如“血蛭”，绘制一根紫线并给予状态效果。
- `ContinuousLaserBulletType`：连续激光，例如“熔毁”，一旦开火可以保持一段时间；
- `ContinuousLiquidBulletType`：连续液体激光，例如“升华”，一旦开火可以无限保持；
- `MultiBulletType`：组合以上子弹类型。

以上就是原版中的全部子弹类型了。在未来你也可以自己定制一个子弹类型，并了解到子弹的整个生命周期和背后的ECS（Entity-Component-System）思想。

## 射击方式（ShootType）

射击方式决定了子弹何时何处被射出，原版共有以下几种：

- `ShootPattern`：基类，只定义了`shots`发数，`firstShotDelay`首发延迟和`shotDelay`间发延迟。是默认的射击方式，默认设置为单发，也有像“天灾”一样设置成两发的；
- `ShootBarrel`：所有炮管依次发射，用`barrels`设置炮管的x、y和方向，例如“蜂群”。炮塔的构造导致炮管不能像单位的武器那样独立；
- `ShootAlternate`：多个间距相等、排列在x轴上的炮管依次发射，用`barrels`设置炮管数，`spread`设置按距离的间距。例如“双管”，多管的，如四管的“发散”和五管的“天谴”；
- `ShootSpread`：多个间隔角度相等的子弹同时发射，用`spread`设置间隔的角度（角度制），例如“雷光”。
- `ShootSine`：多个角度成正弦周期变化的子弹同时发射，原版未使用；
- `ShootHelix`：使发射出的子弹按正弦曲线运动，例如“天谴”；
- `ShootSummon`：在一定区域范围内发射角度随机的子弹，例如“魔灵”；
- `ShootMulti`：组合以上ShootPattern。

以上所说的`依次发射`，是`shots`发子弹依次在每个炮管上发射，而非子弹一发发地发射，原版并无实现后者的类。例如蜂群有三个炮管，但`shots`为4。

## 炮塔绘制器

炮塔的drawer与工厂的有较大不同，一般炮塔只有一个drawer，即`DrawTurret`，并且其目的也是单一的——**把炮塔的贴图拆成一个个碎片，以使他们可以运动或产生特效。**

仔细观察原版中的“魔灵”，你会发现它的贴图是分块的。在代码中，这些片段被称作`DrawPart`

TODO 因为我不会写这些东西

