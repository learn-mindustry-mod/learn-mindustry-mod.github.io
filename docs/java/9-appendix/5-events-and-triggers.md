# 附.5 事件/触发器速查表及事件时机对照表

本附录集中整理 Mindustry 的事件系统：一部分是 `EventType` 里的事件类（带数据），另一部分是 `EventType.Trigger` 的触发器（无数据、频率高）。你可以把它当成“事件总线的完整导航”，在写 Java 模组或调试逻辑时快速定位“该用哪个事件、在什么时候触发、是否能安全修改世界”。

## 事件系统速览

Mindustry 的事件系统基于 `arc.Events`。**事件类**是“带参数的通知”，需要事件对象；**触发器**是“无参数的信号”，只是一个枚举值。两者都通过 `Events.on(...)` 注册监听，通过 `Events.fire(...)` 触发。

常用写法如下：

```java
import arc.Events;
import mindustry.game.EventType;

// 监听有数据的事件
Events.on(EventType.BlockBuildEndEvent.class, e -> {
    if(!e.breaking){
        // 这里可以安全读取 e.tile / e.team / e.unit / e.config
    }
});

// 监听无数据的触发器
Events.on(EventType.Trigger.update, () -> {
    // 每帧都会执行，慎用重逻辑
});
```

触发器也可以用 `Events.run(Trigger.xxx, runnable)` 来注册，这种写法在原版里非常常见，本质仍是监听回调。需要强调的是：事件回调几乎都在主线程里执行，**不要在事件中做阻塞操作**；若确实需要，应该把耗时工作放入后台线程，或使用 `Core.app.post(...)` 回到主线程更新 UI / 游戏状态。

### 事件对象复用与安全边界

以下事件对象会被复用：`BuildDamageEvent`、`TilePreChangeEvent`、`TileChangeEvent`、`TileFloorChangeEvent`、`TileOverlayChangeEvent`、`BuildTeamChangeEvent`、`UnitDamageEvent`。它们的共同特点是**事件实例被反复塞入新数据**，因此**不要缓存事件对象，也不要延迟使用**。此外，`TilePreChangeEvent` / `TileChangeEvent` 这类事件明确写了警告：**不要在监听里修改格子或触发新的改格操作**，否则容易造成递归或异常。

## 触发器 Trigger 速查表

触发器无参数，适合做统计、成就、提示或轻量逻辑。下表按照原版触发位置与功能归类，尽可能给出“具体发生点”。如果你是做大体量逻辑，应优先用“事件类”，触发器更适合做轻量监听。

| Trigger | 触发时机与来源 | 典型用途/备注 |
| --- | --- | --- |
| `shock` | “潮湿”与“电击”状态产生联动时触发 | 常用于成就统计；只在敌方波次单位触发 |
| `blastFreeze` | “爆裂”与“冻结”状态产生联动时触发 | 成就统计；只在敌方波次单位触发 |
| `cannotUpgrade` | 重构器尝试升级但失败时触发 | 提示或统计“升级失败” |
| `openConsole` | 打开控制台（Console）时触发 | 统计或埋点 |
| `impactPower` | “冲击反应堆”进入满输出阶段时触发 | 用于高功率开始的提示或成就 |
| `blastGenerator` | 使用 `ConsumeItemExplode` 的方块发生爆炸时触发 | 与“反应堆爆炸”规则相关 |
| `shockwaveTowerUse` | “震爆塔”使用时触发 | 与波次统计或提示相关 |
| `forceProjectorBreak` | “力墙投影”因过热而破裂时触发 | 统计防御失效 |
| `thoriumReactorOverheat` | “钍反应堆”过热时触发 | 反应堆安全提示 |
| `neoplasmReact` | “瘤液”与其它液体发生扩散反应时触发 | 瘤液生态相关逻辑 |
| `fireExtinguish` | 火焰被扑灭时触发 | 统计灭火或触发提示 |
| `acceleratorUse` | “行星际加速器”启动时触发 | 战役进度或提示 |
| `newGame` | 新局或新战役开始时触发（原版多个入口都会发） | 初始化阶段逻辑 |
| `tutorialComplete` | 教程完成时触发 | 教程统计；原版暂未广泛使用 |
| `flameAmmo` | 炮塔收到“硫化物”弹药时触发 | 提示“火焰弹药”被使用 |
| `resupplyTurret` | 炮塔从“无弹药”到“有弹药”的首次补给时触发 | 用于提示“已补给” |
| `turretCool` | 炮塔首次接受冷却液时触发 | 用于教程或统计冷却 |
| `enablePixelation` | 开启像素化渲染时触发 | UI / 视觉设置 |
| `exclusionDeath` | 玩家单位被超高伤害瞬杀时触发 | 多用于成就或统计 |
| `suicideBomb` | 单位自爆时触发 | 成就或提示 |
| `openWiki` | 点击“Wiki”链接时触发 | 埋点或引导 |
| `teamCoreDamage` | 核心受到伤害时触发 | 核心警报提示 |
| `socketConfigChanged` | 服务器 socket 配置变更时触发 | 仅服务器环境 |
| `unitCommandChange` | 玩家单位指令发生变化时触发 | RTS 指令 UI |
| `unitCommandPosition` | RTS 位置指令发出时触发 | RTS 指令 UI |
| `unitCommandAttack` | RTS 攻击指令发出时触发 | RTS 指令 UI |
| `importMod` | 导入模组完成时触发 | 模组管理相关 |
| `update` | 每帧更新开始时触发 | 频率极高，慎用 |
| `beforeGameUpdate` | 游戏进行中且未暂停时，逻辑更新开始前触发 | 频率极高，适合轻逻辑 |
| `afterGameUpdate` | 游戏进行中且未暂停时，逻辑更新结束后触发 | 常用于“更新后再做一次”的逻辑 |
| `preDraw` | 渲染流程开始前触发 | 仅客户端，渲染前准备 |
| `draw` | 渲染流程中段触发（大部分世界绘制前） | 常用于插入绘制 |
| `drawOver` | 世界与 UI 部分绘制后触发 | 适合做覆盖层绘制 |
| `postDraw` | 渲染流程末尾触发 | 渲染收尾处理 |
| `uiDrawBegin` | UI 绘制开始时触发 | UI 注入绘制 |
| `uiDrawEnd` | UI 绘制结束时触发 | UI 收尾 |
| `universeDrawBegin` | 星图背景绘制开始前触发 | 仅在行星渲染时触发 |
| `universeDraw` | 星图行星绘制阶段触发 | 可用于改写星图特效 |
| `universeDrawEnd` | 星图绘制结束后触发 | 星图后处理 |

## 事件 EventType 速查表

事件类是“带数据的通知”。你在回调中可以读取事件字段，常用于触发逻辑、统计数据、重建缓存或做调试记录。下面按功能分组给出完整事件列表。

### 1. 启动、加载与生命周期事件

| 事件 | 字段 | 触发时机与说明 |
| --- | --- | --- |
| `ClientCreateEvent` | 无 | 客户端启动早期，客户端实例创建后触发 |
| `ClientLoadEvent` | 无 | 客户端资源加载完成后触发，常用于注册 UI / 纹理 |
| `ServerLoadEvent` | 无 | 独立服务器加载完成后触发 |
| `PlayEvent` | 无 | 游戏开始（进入一局）时触发 |
| `ResetEvent` | 无 | 游戏状态被重置时触发（返回菜单、重新载入等） |
| `HostEvent` | 无 | 创建房间/主机时触发 |
| `DisposeEvent` | 无 | 渲染器销毁时触发，适合释放资源 |
| `ResizeEvent` | 无 | 客户端窗口尺寸改变后触发 |
| `StateChangeEvent` | `State from`, `State to` | 游戏状态切换（菜单、进行中、编辑器等） |
| `ContentInitEvent` | 无 | 所有内容初始化完成后触发 |
| `ModContentLoadEvent` | 无 | 模组内容加载完成但尚未初始化时触发 |
| `AtlasPackEvent` | 无 | 贴图打包完成后触发，像素仍未释放 |
| `FileTreeInitEvent` | 无 | 所有模组文件加入 `Vars.tree` 后触发 |
| `MusicRegisterEvent` | 无 | `SoundControl` 注册音乐后触发 |

### 2. 世界加载与存档相关

| 事件 | 字段 | 触发时机与说明 |
| --- | --- | --- |
| `WorldLoadBeginEvent` | 无 | 世界开始加载时触发，`generating = true` |
| `WorldLoadEndEvent` | 无 | 格子初始化完成、即将更新邻接与物理时触发 |
| `WorldLoadEvent` | 无 | 世界加载完成时触发；实体尚未完全加载 |
| `SaveWriteEvent` | 无 | 保存写入时触发 |
| `SaveLoadEvent` | `boolean isMap` | 保存读取完成时触发，`isMap` 表示是否为地图保存 |
| `ContentPatchLoadEvent` | `Seq<String> patches` | 读取存档补丁时触发，可修改 `patches` 列表 |

### 3. 战役、区块与波次

| 事件 | 字段 | 触发时机与说明 |
| --- | --- | --- |
| `WaveEvent` | 无 | 波次开始时触发，服务器与客户端均可能收到 |
| `TurnEvent` | 无 | 战役回合推进时触发（Universe 逻辑） |
| `SectorCaptureEvent` | `Sector sector`, `boolean initialCapture` | 区块被占领时触发，`initialCapture` 为首次占领 |
| `SectorLoseEvent` | `Sector sector` | 离线状态下区块被波次摧毁时触发 |
| `SectorInvasionEvent` | `Sector sector` | 区块发生入侵事件时触发 |
| `SectorLaunchEvent` | `Sector sector` | 发射到新区块时触发 |
| `SectorLaunchLoadoutEvent` | `Sector sector`, `Sector from`, `Schematic loadout` | 发射载荷生成时触发 |
| `LaunchItemEvent` | `ItemStack stack` | “发射台（旧版）”发射物品时触发 |

### 4. 地图与蓝图

| 事件 | 字段 | 触发时机与说明 |
| --- | --- | --- |
| `MapMakeEvent` | 无 | 创建地图时触发（编辑器） |
| `MapPublishEvent` | 无 | 发布地图时触发 |
| `SchematicCreateEvent` | `Schematic schematic` | 生成新蓝图时触发 |

### 5. 输入与界面

| 事件 | 字段 | 触发时机与说明 |
| --- | --- | --- |
| `TapEvent` | `Player player`, `Tile tile` | 玩家点击/触碰格子时触发 |
| `LineConfirmEvent` | 无 | 玩家确认一条铺设线时触发（桌面/移动） |
| `BlockInfoEvent` | 无 | 打开某个方块信息面板时触发 |
| `MenuOptionChooseEvent` | `Player player`, `int menuId`, `int option` | 菜单选项被选择时触发（已不推荐直接使用） |
| `TextInputEvent` | `Player player`, `int textInputId`, `String text` | 文本输入结束时触发，`text` 可能为 `null` |
| `ClientChatEvent` | `String message` | 客户端发送聊天消息时触发，仅客户端 |
| `PlayerChatEvent` | `Player player`, `String message` | 玩家聊天消息到达服务器时触发 |

### 6. 建造与方块相关

| 事件 | 字段 | 触发时机与说明 |
| --- | --- | --- |
| `BuildSelectEvent` | `Tile tile`, `Team team`, `Unit builder`, `boolean breaking` | 开始建造或拆除时触发（选择阶段） |
| `BlockBuildBeginEvent` | `Tile tile`, `Team team`, `Unit unit`, `boolean breaking` | 构建开始时触发，`unit` 可能为 `null` |
| `BlockBuildEndEvent` | `Tile tile`, `Team team`, `Unit unit`, `boolean breaking`, `Object config` | 构建结束时触发，`config` 可能为 `null` |
| `BuildRotateEvent` | `Building build`, `Unit unit`, `int previous` | 建筑旋转后触发，`unit` 可能为 `null` |
| `ConfigEvent` | `Building tile`, `Player player`, `Object value` | 配置发生变化时触发，`player` 可能为 `null` |
| `BlockDestroyEvent` | `Tile tile` | 方块即将被摧毁时触发 |
| `BuildDamageEvent` | `Building build`, `Bullet source` | 子弹对建筑造成伤害时触发（对象复用，不保证覆盖全部伤害场景） |
| `BuildingBulletDestroyEvent` | `Building build`, `Bullet bullet` | 建筑被子弹直接击毁时触发（不保证全部场景） |
| `GeneratorPressureExplodeEvent` | `Building build` | 压力型反应堆爆炸时触发 |
| `BuildTeamChangeEvent` | `Team previous`, `Building build` | 建筑队伍变更后触发（对象复用） |
| `CoreChangeEvent` | `CoreBuild core` | 核心放置/移除/换队伍时触发 |
| `WithdrawEvent` | `Building tile`, `Player player`, `Item item`, `int amount` | 玩家从建筑中取出物品 |
| `DepositEvent` | `Building tile`, `Player player`, `Item item`, `int amount` | 玩家向建筑存入物品 |
| `TilePreChangeEvent` | `Tile tile` | 格子即将发生变化（对象复用，禁止改格） |
| `TileChangeEvent` | `Tile tile` | 格子已发生变化（对象复用，禁止改格） |
| `TileFloorChangeEvent` | `Tile tile`, `Floor previous`, `Floor floor` | 地板变化事件（对象复用） |
| `TileOverlayChangeEvent` | `Tile tile`, `Floor previous`, `Floor overlay` | 覆盖层变化事件（对象复用） |

### 7. 单位、载荷与战斗

| 事件 | 字段 | 触发时机与说明 |
| --- | --- | --- |
| `UnitControlEvent` | `Player player`, `Unit unit` | 玩家开始/结束控制某单位时触发，`unit` 可能为 `null` |
| `UnitChangeEvent` | `Player player`, `Unit unit` | 玩家切换单位时触发 |
| `UnitCreateEvent` | `Unit unit`, `Building spawner`, `Unit spawnerUnit` | 单位由工厂/重构器/单位生成时触发，后两者可为 `null` |
| `UnitSpawnEvent` | `Unit unit` | 波次刷出单位时触发 |
| `UnitUnloadEvent` | `Unit unit` | 单位被载荷建筑弹出时触发 |
| `PickupEvent` | `Unit carrier`, `Unit unit`, `Building build` | 载荷拾取，`unit/build` 二选一 |
| `PayloadDropEvent` | `Unit carrier`, `Unit unit`, `Building build` | 载荷投放，`unit/build` 二选一 |
| `UnitDamageEvent` | `Unit unit`, `Bullet bullet` | 子弹命中单位（对象复用） |
| `UnitDestroyEvent` | `Unit unit` | 单位被摧毁时触发 |
| `UnitBulletDestroyEvent` | `Unit unit`, `Bullet bullet` | 单位被子弹直接击毁时触发（不保证覆盖全部死亡场景） |
| `UnitDrownEvent` | `Unit unit` | 单位溺水或被液体摧毁时触发 |
| `GameOverEvent` | `Team winner` | 游戏结束时触发（逻辑层） |
| `WinEvent` | 无 | 玩家胜利时触发（UI 层） |
| `LoseEvent` | 无 | 玩家失败时触发（UI 层） |

### 8. 玩家、网络与管理

| 事件 | 字段 | 触发时机与说明 |
| --- | --- | --- |
| `ConnectionEvent` | `NetConnection connection` | 客户端建立连接时触发 |
| `ConnectPacketEvent` | `NetConnection connection`, `ConnectPacket packet` | 收到连接包时触发 |
| `PlayerConnect` | `Player player` | 玩家连接但尚未加入游戏 |
| `PlayerConnectionConfirmed` | `Player player` | 玩家确认已接收世界数据 |
| `PlayerJoin` | `Player player` | 玩家正式进入游戏，仅首次触发 |
| `PlayerLeave` | `Player player` | 玩家离开游戏 |
| `PlayerBanEvent` | `Player player`, `String uuid` | 玩家被封禁时触发，`player` 可为空 |
| `PlayerUnbanEvent` | `Player player`, `String uuid` | 玩家解禁时触发，`player` 可为空 |
| `PlayerIpBanEvent` | `String ip` | IP 被封禁时触发 |
| `PlayerIpUnbanEvent` | `String ip` | IP 解禁时触发 |
| `AdminRequestEvent` | `Player player`, `Player other`, `AdminAction action` | 管理员指令请求 |

### 9. 解锁与研究

| 事件 | 字段 | 触发时机与说明 |
| --- | --- | --- |
| `UnlockEvent` | `UnlockableContent content` | 内容解锁时触发（远程同步也会触发） |
| `ResearchEvent` | `UnlockableContent content` | 研究完成时触发（研究面板） |

## 事件时机对照表

这一部分给出“宏观时序”，用来帮助你把事件放在正确的时间点使用。

### 启动与加载阶段（典型顺序）

大致顺序如下（不同平台和模式略有差异，但核心流程一致）：

1. `ClientCreateEvent` / `ServerLoadEvent`：客户端或服务器启动完成。
2. `FileTreeInitEvent`：模组文件树完成注册。
3. `ModContentLoadEvent`：模组内容加载完成，但尚未初始化。
4. `ContentInitEvent`：内容初始化完成。
5. `AtlasPackEvent`：贴图打包完成，像素仍在内存里。
6. `MusicRegisterEvent`：音乐注册完成。
7. `ClientLoadEvent`：客户端资源完全就绪。

如果你要“改内容、改贴图、加成就”，通常应分别选择 `ModContentLoadEvent`、`ContentInitEvent`、`AtlasPackEvent` 或 `ClientLoadEvent`。

### 世界加载阶段（地图/存档）

- `WorldLoadBeginEvent`：开始加载地图，`generating = true`。
- `WorldLoadEndEvent`：格子初始化完毕，准备更新邻接和物理。
- `WorldLoadEvent`：世界加载完成，`generating = false`。

特别提醒：有时 `WorldLoadEvent` 可能会出现重复触发（原版代码中对此有注释），如果你在这里做缓存初始化，需要注意去重。

### 主循环更新阶段（逻辑）

在 `Logic.update()` 中，每帧会触发：

- `Trigger.update`：无论是否在游戏内都会触发。
- `Trigger.beforeGameUpdate`：游戏进行中且未暂停时触发。
- 逻辑更新（单位、天气、波次、任务等）。
- `Trigger.afterGameUpdate`：逻辑更新结束后触发。

所以如果你要“每帧做轻量处理”，用 `Trigger.update`；如果你要“只在对局中生效”，用 `beforeGameUpdate` / `afterGameUpdate`。

### 渲染阶段（客户端）

在 `Renderer.draw()` 中顺序为：

- `Trigger.preDraw`：渲染开始前。
- `Trigger.draw`：世界绘制前后交界处。
- 主要世界与特效绘制。
- `Trigger.drawOver`：世界绘制结束后。
- `Trigger.postDraw`：渲染末尾。

如果需要对 UI 做插入，使用 `Trigger.uiDrawBegin` 与 `Trigger.uiDrawEnd`。如果你要修改星图渲染，使用 `Trigger.universeDrawBegin` / `Trigger.universeDraw` / `Trigger.universeDrawEnd`。

### 建造与战斗阶段（高频但可控）

- 建造：`BuildSelectEvent` → `BlockBuildBeginEvent` → `BlockBuildEndEvent`，拆除时 `breaking = true`。
- 伤害：`BuildDamageEvent` / `UnitDamageEvent` 高频触发，注意对象复用。
- 击毁：`BuildingBulletDestroyEvent` / `UnitBulletDestroyEvent` 只在“被子弹直接击毁”时触发，**不保证覆盖所有死亡场景**。

如果你需要稳定地统计死亡或销毁，请同时监听 `UnitDestroyEvent` 和 `BlockDestroyEvent`。

## 实战建议与常见误区

- **高频触发器不要做重逻辑**。`Trigger.update` 与 `Trigger.draw` 每帧都会触发，建议只做轻量处理或计时器逻辑。
- **不要在 Tile 变更类事件里改 Tile**。`TilePreChangeEvent` / `TileChangeEvent` / `TileFloorChangeEvent` / `TileOverlayChangeEvent` 都明确禁止在回调里再次修改格子。
- **复用事件不要缓存**。遇到“事件被复用”的类型，只能在当前回调内使用。
- **客户端与服务器事件不同步**。如 `ClientChatEvent` 只在客户端触发，`ServerLoadEvent` 只在服务器触发，写逻辑时要注意环境判断。
- **以事件为准而不是 UI**。`WinEvent` / `LoseEvent` 更贴近 UI，逻辑判定请用 `GameOverEvent` 或规则检查。

这一份附录覆盖了 `EventType` 中现有的全部事件与触发器。随着版本更新，事件集合可能变化；当你发现某个事件不存在或行为变化时，最稳妥的方式仍是直接查看 `core/src/mindustry/game/EventType.java` 与事件触发处的代码。
