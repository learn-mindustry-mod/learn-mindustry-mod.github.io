# 0x06 状态效果、视觉特效与音效

> ***“战争不仅是生死的博弈，也是声与光的艺术。”***

一个优秀的模组，绝不仅仅是枯燥的数值堆砌。当重炮轰击大地时，震耳欲聋的声效、漫天飞舞的火花，以及目标装甲碎裂的负面效果，共同构成了无可替代的沉浸感。

本章我们将学习如何给目标施加定制的 **状态效果 (Status Effect)**，如何直接在 JSON 中手搓炫酷的 **视觉特效 (Effect)**，以及如何引入你自己的 **音效 (Sound)**。

**学习本章需要具备的基础：**
- 知道如何在子弹（BulletType）中配置属性。

---

## 状态效果：削弱与增益

状态效果（Status Effect）可以是子弹击中后施加给敌人的 Debuff，也可以是踩在特定流体上获得的 Buff。
在 `content/status/` 目录下创建一个 `armor-shatter.hjson`（碎甲）：

```hjson
{
  name: 碎甲
  
  // 状态的基础颜色，会显示在受影响单位的身上或界面气泡上
  color: a2a2a2
  
  // 属性乘数：1.0 为正常。这里将护甲降至 50%
  armorMultiplier: 0.5
  
  // 速度乘数：轻微减速
  speedMultiplier: 0.8
  
  // 也可以直接造成持续伤害，数值为每秒受到的伤害点数
  damage: 2.0
  
  // 是否永久存在（通常填 false，然后在子弹里指定持续时间）
  permanent: false
  
  // 附带特效：拥有该状态的单位，每 Tick 会有 5% 的概率产生一个特定粒子
  effectChance: 0.05
  effect: formSmoke
}
```

定义好之后，你可以回到 0x05 中的火炮子弹配置里，加上：
`status: my-first-mod-armor-shatter`
`statusDuration: 180` （持续 3 秒）。

---

## 视觉特效 (Effect)：JSON 手搓的光影魔法

在早期的 Mindustry 模组中，特效只能写原版写死的名称（比如 `shootBig`）。但现在的 v7 版本允许你直接在 JSON 中内联定义非常复杂的特效组合（就像《饱和火力》中“方天”炮塔那华丽的命中效果一样）。

在你的 `BulletType` 中，试着将 `hitEffect`（命中特效）改成下面这样：

```hjson
{
  type: BasicBulletType
  damage: 100
  // ... 其他属性
  
  hitEffect: {
    // MultiEffect 允许你将多个特效叠加在一起同时触发
    type: MultiEffect
    effects: [
      
      // 效果 1：向四周飞溅的火花粒子 (ParticleEffect)
      {
        type: ParticleEffect
        particles: 12            // 粒子数量
        sizeFrom: 8              // 起始大小
        sizeTo: 0                // 结束大小
        length: 50               // 粒子飞行的距离
        lifetime: 40             // 持续时间 (Tick)
        colorFrom: E9665B        // 起始颜色（十六进制，推荐亮色）
        colorTo: 737373          // 结束颜色（通常变成灰色烟雾）
      }
      
      // 效果 2：一个迅速扩张的冲击波圆环 (WaveEffect)
      {
        type: WaveEffect
        sizeFrom: 0              // 起始半径
        sizeTo: 40               // 结束半径（最大扩散到多大）
        strokeFrom: 6            // 起始圆环粗细
        strokeTo: 0              // 结束时逐渐变细消失
        lifetime: 15             // 冲击波通常很快，15 Tick 足矣
        colorFrom: ffffff
        colorTo: E9665B
      }
      
    ]
  }
}
```

::: tip 插值器 (interp)
在 `ParticleEffect` 或 `WaveEffect` 中，你经常会看到大佬们使用 `interp: pow5Out` 或 `sizeInterp: pow10In`。
这是**缓动函数（插值）**，它决定了动画的变化节奏（比如先快后慢、先慢后快）。这能让动画看起来更有张力、不那么死板。
:::

---

## 音效 (Sounds)：让战场轰鸣

加入自定义音效非常简单，只需要按如下步骤操作：

1. 准备你的音频文件。**必须是 `.ogg` 格式**！不要用 mp3 或者 wav 直接改后缀，必须使用格式转换工具（如格式工厂或在线网页）真正的转换它。
2. 将该 `.ogg` 文件放入模组根目录下的 `sounds/` 文件夹中。假设你放了一个 `heavy-shoot.ogg`。
3. 在你的代码中引用它时，**不要加 `.ogg` 后缀**！

在炮塔的 JSON 中：
```hjson
  // 如果在 sounds/ 目录下有 heavy-shoot.ogg，就这样写：
  shootSound: heavy-shoot
```

当玩家造出这门巨炮并开火时，自制的冲击波和震耳欲聋的 `heavy-shoot` 音效，一定会让他们感受到属于工业时代的浪漫！
万事具备，接下来，我们将赋予这些武器以履带和翅膀——让它们主动出击，欢迎来到 0x07 单位与工厂篇。