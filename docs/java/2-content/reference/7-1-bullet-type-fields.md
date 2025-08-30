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