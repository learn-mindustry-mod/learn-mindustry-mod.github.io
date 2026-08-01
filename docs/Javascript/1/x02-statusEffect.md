# 状态效果

`StatusEffect` 类代表了游戏中的状态效果，例如“燃烧”、“电击”等。相较于物品和液体，状态效果的扩展性更强，但其基本逻辑与前者类似。

关于如何从 Java 源代码中提取可用于 JSON 的接口，请参考 [从Java源代码中提取json可用接口](../../json/json_gemini/x09-how-to-find-class-and-field.md)，此处不再赘述。

本文主要介绍如何实现 JSON 无法完成的功能，即通过脚本（JavaScript）对状态效果进行深度定制。

---

## 核心方法：`update`

我们先来看最常用的 `update` 方法。原版实现如下：

```java
update(Unit unit, StatusEntry entry){
    if(damage > 0){
        unit.damageContinuousPierce(damage);
    }else if(damage < 0){
        unit.heal(-1f * damage * Time.delta);
    }

    if(intervalDamageTime > 0){
        entry.damageTime += Time.delta;
        if(entry.damageTime >= intervalDamageTime){
            entry.damageTime %= intervalDamageTime;
            if(intervalDamagePierce){
                unit.damagePierce(intervalDamage);
            }else{
                unit.damage(intervalDamage);
            }
        }
    }

    if(!Vars.headless && effect != Fx.none && Mathf.chanceDelta(effectChance) && !unit.inFogTo(Vars.player.team())){
        Tmp.v1.rnd(Mathf.range(unit.type.hitSize/2f));
        effect.at(unit.x + Tmp.v1.x, unit.y + Tmp.v1.y, 0, color, parentizeEffect ? unit : null);
    }
}
```

加上注释后，逻辑一目了然：

```java
update(Unit unit, StatusEntry entry){
    // unit：拥有该状态的单位实体；entry：该状态的实例数据

    if(damage > 0){
        // damage 即 JSON 中配置的持续伤害值
        unit.damageContinuousPierce(damage);   // 持续穿透伤害
    }else if(damage < 0){
        // 负值表示治疗，Time.delta 用于消除帧率影响
        unit.heal(-1f * damage * Time.delta);
    }

    // 间隔伤害
    if(intervalDamageTime > 0){
        entry.damageTime += Time.delta;
        if(entry.damageTime >= intervalDamageTime){
            entry.damageTime %= intervalDamageTime; // 重置计时器
            if(intervalDamagePierce){
                unit.damagePierce(intervalDamage);
            }else{
                unit.damage(intervalDamage);
            }
        }
    }

    // 粒子特效
    if(!Vars.headless && effect != Fx.none && Mathf.chanceDelta(effectChance) && !unit.inFogTo(Vars.player.team())){
        Tmp.v1.rnd(Mathf.range(unit.type.hitSize/2f));
        effect.at(unit.x + Tmp.v1.x, unit.y + Tmp.v1.y, 0, color, parentizeEffect ? unit : null);
    }
}
```

---

## 在 JavaScript 中扩展 `update`

如果你想在 `update` 中添加自定义逻辑，可以使用 `extend` 方法，如下所示：

```javascript
const status1 = extend(StatusEffect, "status1", {
    update(unit, entry) {
        this.super$update(unit, entry);
        // 在此追加你的自定义代码
    }
});
```

这里的关键是 `this.super$update(unit, entry)`。它不是标准的 JavaScript 语法，而是 Mindustry Rhino 环境中 `extend` 提供的“调用父类方法”的专用接口。

- 在上一章的液体示例中，`this.super$update(puddle)` 是因为扩展的是 `Liquid`，其 `update` 方法接收 `puddle` 参数。
- 而 `StatusEffect` 的 `update` 方法接收 `(unit, entry)`，因此这里必须写成 `this.super$update(unit, entry)`。

**如果你不调用 `this.super$update`，就会完全覆盖默认行为**，即基础的持续伤害、间隔伤害和默认粒子特效都不会执行。

实际上，`this.super$update(unit, entry)` 等效于以下代码：

```javascript
if(this.damage > 0){
    unit.damageContinuousPierce(this.damage);
}else if(this.damage < 0){
    unit.heal(-1 * this.damage * Time.delta);
}

if(this.intervalDamageTime > 0){
    entry.damageTime += Time.delta;
    if(entry.damageTime >= this.intervalDamageTime){
        entry.damageTime %= this.intervalDamageTime;
        if(this.intervalDamagePierce){
            unit.damagePierce(this.intervalDamage);
        }else{
            unit.damage(this.intervalDamage);
        }
    }
}

if(!Vars.headless && this.effect != Fx.none && Mathf.chanceDelta(this.effectChance) && !unit.inFogTo(Vars.player.team())){
    Tmp.v1.rnd(Mathf.range(unit.type.hitSize/2f));
    effect.at(unit.x + Tmp.v1.x, unit.y + Tmp.v1.y, 0, this.color, this.parentizeEffect ? unit : null);
}
```

**使用建议**：

- **保留默认逻辑并追加新功能**：调用 `this.super$update`，然后编写自己的代码。
- **完全替换默认逻辑**：省略 `this.super$update`，但需要自行处理伤害、特效等所有逻辑。

例如，为一个单位持续恢复护盾，可以这样写：

```javascript
const status1 = extend(StatusEffect, "status1", {
    update(unit, entry) {
        this.super$update(unit, entry);
        unit.shield += 1 * Time.delta;
    }
});
```

---

## 其他常用函数与完整示例

除了 `update`，`StatusEffect` 还提供了其他可重写的函数，例如：

- `init()`：在状态效果初始化时执行，适合注册亲和/反应逻辑。
- `applied(unit, time, extend)`：状态被施加时触发。
- `onRemoved(unit)`：状态被移除时触发。
- `draw(unit, time)`：自定义绘制逻辑。

> 判定一个函数是否可重写,你可以查看前面的标识,为`public`即可重写

下面是一个综合示例，展示了常见写法：

```javascript
const myStatus = extend(StatusEffect, "my-status", {
    damage: 0.05,
    speedMultiplier: 0.8,
    effect: Fx.spark,
    effectChance: 0.12,
    color: Color.valueOf("aaffaa"),

    init() {
        // 注册与“潮湿”状态的亲和反应
        this.affinity(StatusEffects.wet, (unit, result, time) => {
            unit.damagePierce(this.transitionDamage);
            result.set(StatusEffects.wet, Math.min(time + result.time, 30));
        });
    },

    update(unit, entry) {
        // 先执行原版逻辑
        this.super$update(unit, entry);

        // 追加自定义逻辑：当生命值低于25%时附加“电击”状态
        if (unit.health / unit.maxHealth < 0.25) {
            unit.apply(StatusEffects.shocked, 60);
        }
    },

    onRemoved(unit) {
        // 状态移除时播放小型击中特效
        Fx.hitSmall.at(unit.x, unit.y);
    }
});

exports.myStatus = myStatus;
```

---

## 关于 `super$update` 的总结

| 场景 | 是否调用 `this.super$update` |
| ------ | ----------------------------- |
| 在原有效果基础上增加额外行为 | **必须调用**，确保基础逻辑执行 |
| 完全自定义状态效果，不依赖原版逻辑 | 可省略，但需自行实现所有效果 |

---

## 课后练习

你已经理解了 `super` 的基本用法。以下为 `UnitType` 的 `drawMining` 方法源码：

```java
public void drawMining(Unit unit){
    if(drawMineBeam){
        float focusLen = mineBeamOffset + Mathf.absin(Time.time, 1.1f, 0.5f);
        float px = unit.x + Angles.trnsx(unit.rotation, focusLen);
        float py = unit.y + Angles.trnsy(unit.rotation, focusLen);

        drawMiningBeam(unit, px, py);
    }
}
```

请推断，在下面的 JavaScript 代码中，`this.super$drawMining(unit)` 等效的代码是什么？

```javascript
const myUnit = extend(UnitType, "my-unit", {
    constructor: () => new UnitEntity.create(), // 单位构造器将在后续章节详解
    drawMining(unit) {
        this.super$drawMining(unit);
    }
});
```

**答案**（等效代码）：

```javascript
if(this.drawMineBeam){
    let focusLen = this.mineBeamOffset + Mathf.absin(Time.time, 1.1, 0.5);
    let px = unit.x + Angles.trnsx(unit.rotation, focusLen);
    let py = unit.y + Angles.trnsy(unit.rotation, focusLen);

    this.drawMiningBeam(unit, px, py);
}
```

---

希望这份文档能帮助你更灵活地创建自定义状态效果。如有疑问，欢迎查阅更多源码或社区资源。
