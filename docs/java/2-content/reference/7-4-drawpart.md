### `DrawPart`

`mindustry.entities.part.DrawPart` 是可独立运动的绘制部件抽象基类，`DrawTurret` 渲染时会为每个部件填充一组 `PartParams`（位置、旋转、热量、装填进度等）。你可以把它理解为“把炮塔贴图拆成多块，然后按开火过程驱动它们运动”的系统。

**DrawPart 基础字段（所有部件通用）**
| 字段 | 说明 |
| --- | --- |
| `params` | 全局复用的 `PartParams` 实例，供渲染流程临时写入数据。 |
| `turretShading` | 是否使用炮塔阴影/着色，通常由引擎自动设置。 |
| `under` | 是否绘制在炮塔本体下层。 |
| `weaponIndex` | 单位武器部件索引，影响进度来源。 |
| `recoilIndex` | 使用哪一个后坐力计数器，`<0` 表示基础后坐。 |

**PartParams（绘制参数）字段一览**
| 字段 | 说明 |
| --- | --- |
| `warmup` | 持续开火的升温进度（0~1）。 |
| `reload` | 装填进度（刚开火为 1，装填完成为 0）。 |
| `smoothReload` | 平滑后的装填进度。 |
| `heat` | 发射后热量进度（1→0）。 |
| `recoil` | 原始后坐力值。 |
| `life` | 生命周期进度（仅部分弹体/单位部件使用）。 |
| `charge` | 蓄能进度（0→1）。 |
| `x` | 绘制坐标 X。 |
| `y` | 绘制坐标 Y。 |
| `rotation` | 绘制旋转角度。 |
| `sideOverride` | 强制使用某一侧的渲染索引，`-1` 为默认。 |
| `sideMultiplier` | 侧向渲染倍率（常用于镜像）。 |

**PartMove（额外位移片段）字段一览**
| 字段 | 说明 |
| --- | --- |
| `progress` | 位移片段跟随的进度。 |
| `x` | 额外平移 X。 |
| `y` | 额外平移 Y。 |
| `gx` | 额外缩放 X。 |
| `gy` | 额外缩放 Y。 |
| `rot` | 额外旋转。 |

#### `RegionPart`
用于绘制贴图区域，是最常用的 DrawPart，适合炮管、装甲、炮口等“真实贴图”部件。  
贴图命名：默认拼接 `炮塔名 + suffix`，并自动读取 `-outline`、`-heat`、`-light`；若 `mirror=true`，则读取 `-r/-l` 与 `-r-outline/-l-outline`。

**RegionPart 字段一览**
| 字段 | 说明 |
| --- | --- |
| `suffix` | 贴图名后缀（默认拼接在炮塔名后）。 |
| `name` | 完整贴图名，设置后会覆盖默认拼接。 |
| `heat` | 热量贴图区域（`-heat`）。 |
| `light` | 发光贴图区域（`-light`）。 |
| `regions` | 主贴图区域数组。 |
| `outlines` | 描边贴图区域数组（`-outline`）。 |
| `mirror` | 是否左右镜像（需 `-l/-r` 贴图）。 |
| `outline` | 是否绘制描边。 |
| `replaceOutline` | 是否用原贴图替换描边（原版用法）。 |
| `drawRegion` | 是否绘制主贴图（可用于仅热量效果）。 |
| `heatLight` | 热量贴图是否产生光照。 |
| `clampProgress` | 是否把进度夹在 0~1。 |
| `progress` | 位置/旋转跟随的进度。 |
| `growProgress` | 缩放跟随的进度。 |
| `heatProgress` | 热量透明度跟随的进度。 |
| `blending` | 贴图混合模式。 |
| `layer` | 绘制层级。 |
| `layerOffset` | 层级偏移。 |
| `heatLayerOffset` | 热量层级偏移。 |
| `turretHeatLayer` | 使用炮塔热量层时的层级。 |
| `outlineLayerOffset` | 描边层级偏移。 |
| `x` | 基础位置 X。 |
| `y` | 基础位置 Y。 |
| `xScl` | 基础缩放 X。 |
| `yScl` | 基础缩放 Y。 |
| `rotation` | 基础旋转角度。 |
| `originX` | 旋转原点 X 偏移。 |
| `originY` | 旋转原点 Y 偏移。 |
| `moveX` | 随进度平移 X。 |
| `moveY` | 随进度平移 Y。 |
| `growX` | 随进度缩放 X。 |
| `growY` | 随进度缩放 Y。 |
| `moveRot` | 随进度旋转角度。 |
| `heatLightOpacity` | 热量光照强度。 |
| `color` | 主贴图颜色。 |
| `colorTo` | 主贴图渐变目标色。 |
| `mixColor` | 混色颜色。 |
| `mixColorTo` | 混色渐变目标色。 |
| `heatColor` | 热量贴图颜色。 |
| `children` | 子部件序列。 |
| `moves` | 额外位移片段序列。 |

#### `ShapePart`
用于绘制几何图形（多边形/圆形/线框），常用于能量护环、魔法阵、简化装饰。

**ShapePart 字段一览**
| 字段 | 说明 |
| --- | --- |
| `circle` | 是否绘制圆形。 |
| `hollow` | 是否绘制空心（线框）。 |
| `sides` | 多边形边数。 |
| `radius` | 基础半径。 |
| `radiusTo` | 目标半径（插值）。 |
| `stroke` | 基础描边宽度。 |
| `strokeTo` | 目标描边宽度（插值）。 |
| `x` | 基础位置 X。 |
| `y` | 基础位置 Y。 |
| `rotation` | 基础旋转角度。 |
| `moveX` | 随进度平移 X。 |
| `moveY` | 随进度平移 Y。 |
| `moveRot` | 随进度旋转角度。 |
| `rotateSpeed` | 自转速度。 |
| `color` | 基础颜色。 |
| `colorTo` | 目标颜色（渐变）。 |
| `mirror` | 是否镜像绘制。 |
| `clampProgress` | 是否把进度夹在 0~1。 |
| `progress` | 进度来源。 |
| `layer` | 绘制层级。 |
| `layerOffset` | 层级偏移。 |

#### `HaloPart`
用于绘制“环绕式”图形：多个形状围绕中心旋转，常见于仪式感或科技感炮塔。

**HaloPart 字段一览**
| 字段 | 说明 |
| --- | --- |
| `hollow` | 是否空心。 |
| `tri` | 是否使用三角光片模式。 |
| `shapes` | 围绕形状数量。 |
| `sides` | 单个形状边数。 |
| `radius` | 单个形状半径。 |
| `radiusTo` | 目标半径（插值）。 |
| `stroke` | 描边宽度。 |
| `strokeTo` | 目标描边宽度（插值）。 |
| `triLength` | 三角光片长度。 |
| `triLengthTo` | 目标三角长度（插值）。 |
| `haloRadius` | 环半径。 |
| `haloRadiusTo` | 目标环半径（插值）。 |
| `x` | 基础位置 X。 |
| `y` | 基础位置 Y。 |
| `shapeRotation` | 单个形状基础旋转。 |
| `moveX` | 随进度平移 X。 |
| `moveY` | 随进度平移 Y。 |
| `shapeMoveRot` | 随进度形状旋转。 |
| `haloRotateSpeed` | 环自转速度。 |
| `haloRotation` | 环基础旋转角度。 |
| `rotateSpeed` | 单个形状自转速度。 |
| `color` | 基础颜色。 |
| `colorTo` | 目标颜色（渐变）。 |
| `mirror` | 是否镜像绘制。 |
| `clampProgress` | 是否把进度夹在 0~1。 |
| `progress` | 进度来源。 |
| `layer` | 绘制层级。 |
| `layerOffset` | 层级偏移。 |

#### `FlarePart`
用于绘制“光芒/星芒”效果，由多组三角形叠加构成，适合充能、激发类视觉。

**FlarePart 字段一览**
| 字段 | 说明 |
| --- | --- |
| `sides` | 光芒数量。 |
| `radius` | 基础长度。 |
| `radiusTo` | 目标长度（插值）。 |
| `stroke` | 光芒宽度。 |
| `innerScl` | 内层光芒缩放。 |
| `innerRadScl` | 内层光芒长度缩放。 |
| `x` | 基础位置 X。 |
| `y` | 基础位置 Y。 |
| `rotation` | 基础旋转。 |
| `rotMove` | 随进度旋转。 |
| `spinSpeed` | 自旋速度。 |
| `followRotation` | 是否跟随炮塔旋转。 |
| `color1` | 外层颜色。 |
| `color2` | 内层颜色。 |
| `clampProgress` | 是否把进度夹在 0~1。 |
| `progress` | 进度来源。 |
| `layer` | 绘制层级。 |

#### `EffectSpawnerPart`
用于在一个矩形范围内刷出粒子/特效，适合火花、能量溢散等效果。

**EffectSpawnerPart 字段一览**
| 字段 | 说明 |
| --- | --- |
| `x` | 生成区域中心 X。 |
| `y` | 生成区域中心 Y。 |
| `width` | 生成区域宽度。 |
| `height` | 生成区域高度。 |
| `rotation` | 生成区域旋转角度。 |
| `mirror` | 是否镜像生成。 |
| `effectChance` | 生成概率。 |
| `effectRot` | 固定旋转角度。 |
| `effectRandRot` | 随机旋转幅度。 |
| `effect` | 特效类型。 |
| `effectColor` | 特效颜色。 |
| `useProgress` | 是否让概率随进度变化。 |
| `progress` | 进度来源。 |
| `debugDraw` | 是否绘制调试红框。 |

#### `HoverPart`
用于绘制“悬浮环/扫描圈”一类的脉动线框效果，常用于支撑感与能量感装饰。

**HoverPart 字段一览**
| 字段 | 说明 |
| --- | --- |
| `radius` | 环半径。 |
| `x` | 基础位置 X。 |
| `y` | 基础位置 Y。 |
| `rotation` | 基础旋转角度。 |
| `phase` | 脉动周期。 |
| `stroke` | 最大线宽。 |
| `minStroke` | 最小线宽。 |
| `circles` | 环数量。 |
| `sides` | 多边形边数。 |
| `color` | 颜色。 |
| `mirror` | 是否镜像绘制。 |
| `layer` | 绘制层级。 |
| `layerOffset` | 层级偏移。 |

### `PartProgress`
`PartProgress` 是“进度驱动器”，决定部件随什么参数变化。下面表格列出全部可用项。

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `reload` | 内置进度 | 刚开火为 1，装填完成为 0。 |
| `smoothReload` | 内置进度 | 平滑后的装填进度。 |
| `warmup` | 内置进度 | 持续开火时升到 1，停火后回落。 |
| `charge` | 内置进度 | 蓄能进度（0→1）。 |
| `recoil` | 内置进度 | 原始后坐力值。 |
| `heat` | 内置进度 | 发射后升温，再冷却回 0。 |
| `life` | 内置进度 | 生命周期进度（仅部分弹体/单位部件使用）。 |
| `time` | 内置进度 | 当前 `Time.time` 值。 |
| `constant(value)` | 工具方法 | 固定进度值。 |
| `get(p)` | 接口方法 | 取进度值，通常由引擎调用。 |
| `getClamp(p)` | 工具方法 | 获取并夹到 0~1（默认夹取）。 |
| `getClamp(p, clamp)` | 工具方法 | 可选择是否夹取。 |
| `inv()` | 链式方法 | 取反（1 - 值）。 |
| `slope()` | 链式方法 | 斜率形状（`Mathf.slope`）。 |
| `clamp()` | 链式方法 | 强制夹到 0~1。 |
| `add(amount)` | 链式方法 | 加上常数。 |
| `add(other)` | 链式方法 | 与另一个进度相加。 |
| `delay(amount)` | 链式方法 | 延迟开始。 |
| `curve(offset, duration)` | 链式方法 | 指定区间映射。 |
| `sustain(offset, grow, sustain)` | 链式方法 | 生长-维持-衰减曲线。 |
| `shorten(amount)` | 链式方法 | 压缩时长。 |
| `compress(start, end)` | 链式方法 | 在指定区间内压缩。 |
| `blend(other, amount)` | 链式方法 | 与另一个进度线性混合。 |
| `mul(other)` | 链式方法 | 与另一个进度相乘。 |
| `mul(amount)` | 链式方法 | 乘以常数。 |
| `min(other)` | 链式方法 | 取较小值。 |
| `sin(offset, scl, mag)` | 链式方法 | 正弦叠加（带偏移）。 |
| `sin(scl, mag)` | 链式方法 | 正弦叠加。 |
| `absin(scl, mag)` | 链式方法 | 绝对正弦叠加。 |
| `mod(amount)` | 链式方法 | 取模循环。 |
| `loop(time)` | 链式方法 | 按时间循环到 0~1。 |
| `apply(other, func)` | 链式方法 | 用 `PartFunc` 组合两个进度。 |
| `curve(interp)` | 链式方法 | 应用插值函数。 |