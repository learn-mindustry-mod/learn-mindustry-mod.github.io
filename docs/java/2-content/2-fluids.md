# 流体

> ***为时已晚***

在上一节中我们已经学习了物品的写法，实际上流体的写法和物品大部分是大同小异的，不过，你也会见识到不一样的东西。

首先辨析两个概念——流体（Fluid）和液体（Liquid）。在 v7 版本前，Mindustry里还只有赛普罗上的四种液体，当时的游戏还没有气体的概念，`Liquid`类表示的也正是液体，只有一些模组自创了气体这一ContentType。在 v7 更新后，游戏添加了气体系统。美中不足之处在于，它是在`Liquid`类的基础上添加的，导致一个叫做“液体”的类，却干了气体+液体的活，所以Anuke才会在这个类里写道：“为时已晚”。本教程为了严谨性，将现在的`Liquid`类称做流体。

## 添加一个流体

### 代码部分

和上一节一样，流体需要自己成立一个类，所以我们仿照着建立一个`LMMLiquids`的类。

接下来我们添加如下的代码：
::: code-group

```java
public class LMMLiquids{
    public static Liquid chlorine, sodiumFluid;
    public static void load(){
        chlorine = new Liquid("chlorine", Color.valueOf("b2b530")){{
            gas = true;
            flammability = 0.3f;
            effect = StatusEffects.corroded;
        }};
        sodiumFluid = new Liquid("sodium-fluid", Color.valueOf("eeeeee")){{
            flammability = 0.9f;
            heatCapacity = 0.1f;
            explosiveness = 0.9f;
            effect = StatusEffects.melting;
        }};
    }
}

```

```kotlin
object LMMLiquids {
    lateinit var chlorine: Liquid
    lateinit var sodiumFluid: Liquid
    fun load() {
        chlorine = Liquid("chlorine", Color.valueOf("b2b530")).apply{
                gas = true
                flammability = 0.3f
                effect = StatusEffects.corroded
        }
        sodiumFluid = Liquid("sodium-fluid", Color.valueOf("eeeeee")).apply{
                flammability = 0.9f
                heatCapacity = 0.1f
                explosiveness = 0.9f
                effect = StatusEffects.melting
        }
    }
}
```
:::

### 语言部分