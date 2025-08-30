
### 1. 核心逻辑与计时器 (Core Logic & Timers)
这些字段控制炮塔的基础运行逻辑和内部计时。
*   **`logicControlCooldown`** (static final): 一个静态常量。当炮塔被逻辑模块控制后，需要经过这个时间（2秒 * 60帧/秒 = 120帧）才会恢复正常AI。
*   **`timerTarget`**: 一个内部计时器ID，用于“寻找目标”这个动作的冷却。`timers++` 表示它从父类继承了一个计时器数组，并分配了一个新的索引。
*   **`targetInterval`**: 尝试寻找新目标的间隔时间（帧）。即使没有目标，也会定期执行搜索。
*   **`newTargetInterval`**: 当炮塔**已有有效目标**时，尝试寻找**新目标**的间隔时间。如果为 `-1`，则使用 `targetInterval`。

### 2. 弹药系统 (Ammunition System)
控制炮塔如何消耗和存储弹药。
*   **`maxAmmo`**: 炮塔内最大可储存的弹药单位数。
*   **`ammoPerShot`**: 每次射击消耗的弹药单位数。
*   **`consumeAmmoOnce`**: 如果为 `true`，无论一次射击发射多少发子弹（例如散射），都只消耗 `ammoPerShot` 份弹药。如果为 `false`，则每发子弹都会消耗弹药。
*   **`heatRequirement`**: （对于需要热量的炮塔）开火所需的最低热量值。`-1` 表示不需要热量。
*   **`maxHeatEfficiency`**: （对于需要热量的炮塔）最大热量效率乘数。热量越高，效率（通常是伤害或射速）越高，直到这个上限。

### 3. 射击精度与弹道 (Shooting Accuracy & Ballistics)
控制子弹发射时的随机性和行为。
*   **`inaccuracy`**: 子弹的角度随机性（散射），单位是度。
*   **`velocityRnd`**: 子弹速度的随机 fraction。例如 0.1 表示速度会有 ±10% 的随机波动。
*   **`scaleLifetimeOffset`**: 一个 fraction，会乘以某个值然后加到子弹的生命周期上。**(不确定：具体乘以的是子弹的原始生命周期还是另一个值？代码中需确认 `lifeScale` 的计算)**
*   **`shootCone`**: 炮塔开火的容忍角度。如果炮塔当前旋转角度与目标角度之差小于此值，即使未完全对准也会开火。
*   **`shootX`, `shootY`**: 子弹生成的相对坐标（相对于炮塔中心）。`shootY = Float.NEGATIVE_INFINITY` 是一个常见的默认值，通常意味着如果未设置，则会使用炮塔本身的高度或其他逻辑来计算。
*   **`xRand`**: 在X轴（水平轴）上的随机偏移量，用于给子弹生成位置增加随机性。

### 4. 目标选择与范围 (Targeting & Range)
控制炮塔如何寻找和锁定目标。
*   **`drawMinRange`**: 如果为 `true`，在显示炮塔范围时也会绘制最小范围圈。
*   **`trackingRange`**: 跟踪范围。在此范围内的目标会被炮塔发现并跟踪（旋转炮身），但不会开火。必须小于或等于射程。
*   **`minRange`**: 最小射程。在此范围内的目标不会被攻击（主要用于 Artillery- artillery 类武器）。
*   **`targetAir`**, **`targetGround`**: 是否以空中或地面单位为目标。
*   **`targetBlocks`**: 是否以敌方建筑为目标。
*   **`targetHealing`**: 如果为 `true`，此炮塔会以友方（需要治疗的）建筑为目标（例如用于治疗炮塔）。
*   **`targetUnderBlocks`**: 如果为 `false`，则不会以“下层”方块（如下方的传送带）为目标。
*   **`predictTarget`**: 是否预测移动中目标的位置（提前量计算）。
*   **`unitSort`**: 一个排序函数（`Sortf`），用于在多个可用目标中选择优先攻击哪个。`UnitSorts.closest` 是默认的“最近优先”。
*   **`unitFilter`**: 一个过滤函数（`Boolf<Unit>`），用于判断哪些单位可以被攻击。`u -> true` 表示默认所有单位都可以。
*   **`buildingFilter`**: 一个过滤函数（`Boolf<Building>`），用于判断哪些建筑可以被攻击。默认逻辑是：如果 `targetUnderBlocks` 为 `false` 且建筑是“下层子弹”类型，则过滤掉。

### 5. 射击控制与冷却 (Firing Control & Cooldown)
控制炮塔的射击节奏、预热和冷却。
*   **`minWarmup`**: 最低预热值。只有当炮塔的 `warmup` 值（从0到1）达到或超过此值时，才能开火。
*   **`accurateDelay`**: 如果为 `true`，炮塔在具有 `firstShotDelay` 的情况下，会精确计算延迟以命中移动目标。
*   **`moveWhileCharging`**: （`firstShotDelay` > 0 时）如果为 `false`，炮塔在充能/准备射击时无法旋转。
*   **`reloadWhileCharging`**: （`firstShotDelay` > 0 时）如果为 `false`，炮塔在充能/准备射击时无法装填弹药。
*   **`warmupMaintainTime`**: 停止射击后，预热值保持不衰减的时间。
*   **`shoot`**: 一个 `ShootPattern` 对象，定义了射击模式（例如单发、散射、脉冲等）。这是控制多子弹发射的核心。
*   **`alwaysShooting`**: 如果为 `true`，只要炮塔有弹药，它就会一直射击，无视范围内是否有目标或任何控制信号。常用于装饰性或特殊效果的炮塔。
*   **`cooldownTime`**: 视觉上的“热量区域”冷却所需的时间（帧）。

### 6. 玩家控制与显示 (Player Control & Display)
与玩家交互和UI显示相关的设置。
*   **`playerControllable`**: 玩家是否可以直接手动控制这个炮塔（例如点击并攻击特定目标）。
*   **`displayAmmoMultiplier`**: 是否在炮塔的UI状态中显示弹药效率乘数（对于某些不直接使用弹药的炮塔可能不相关）。

### 7. 效果与音效 (Effects & Sounds)
控制炮塔射击时的视听反馈。
*   **`heatColor`**: 炮塔过热时绘制的热量区域的颜色。
*   **`shootEffect`**, **`smokeEffect`**: 射击效果和烟雾效果的**覆盖**。如果为 `null`，则使用子弹类型中定义的效果。
*   **`ammoUseEffect`**: **必定播放**的效果，在消耗弹药时触发。
*   **`shootSound`**: 发射单发子弹时的声音。
*   **`chargeSound`**: 当 `shoot.firstShotDelay` > 0 时，开始充能/准备时播放的声音。
*   **`loopSound`**: 炮塔处于活动状态时（例如预热值 > 0）循环播放的声音。**应谨慎使用，避免性能问题**。
*   **`loopSoundVolume`**: 活动循环音效的基础音量。
*   **`soundPitchMin`**, **`soundPitchMax`**: 射击音效音高的随机范围，用于增加变化。
*   **`ammoEjectBack`**: 弹药弹出效果在Y轴（向下）方向的偏移量，模拟弹壳向后抛出。

### 8. 视觉与动画 (Visuals & Animation)
控制炮塔的视觉表现，如后坐力、震动等。
*   **`shootWarmupSpeed`**: 预热值增加或减少的插值速度。
*   **`linearWarmup`**: 预热值的增长是线性的（`true`）还是遵循某种曲线（`false`）。
*   **`recoil`**: 每次射击时，炮身向后移动的视觉距离。
*   **`recoils`**: 额外的后坐力计数器数量。`-1` 通常表示使用默认值（可能是1）。**(不确定：具体如何影响视觉效果？可能是为多个炮管独立设置后坐力)**
*   **`recoilTime`**: 后坐力动画恢复原状所需的时间（帧）。如果为 `-1`，则使用装填时间（`reload`）。
*   **`recoilPow`**: 应用于后坐力动画的幂曲线，控制运动的效果（例如先快后慢）。
*   **`elevation`**: 炮塔阴影的视觉高度（Elevation）。`-1` 表示使用默认值。
*   **`shake`**: 每次射击时造成的屏幕震动强度。
*   **`drawer`**: 一个 `DrawBlock` 对象，负责处理这个炮塔的所有绘制逻辑。`DrawTurret()` 是标准的炮塔绘制器。