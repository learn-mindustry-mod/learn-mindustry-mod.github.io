# 状态效果和特效

> ***合金气旋，永远的神***

## 声明一个StatusEffect

和往常一样，又是一种新的内容（ContentType），所以你最好再建立一个新文件里存放它的声明；

::: code-group

```java
new StatusEffect("tutorial-status-effect-1");
```

```kotlin
Item("tutorial-status-effect-2")
```

:::

和往常一样，你需要给它分配贴图和文本。

白板的状态效果没有任何用处，你需要设置一些属性。和以往不同，给状态效果中的某些值赋予负值是有意义的；作为对比，方块的某些值为负值可能代表默认值或忽略属性：

- `damageMultiplier`：单位伤害倍率；
- `healthMultiplier`：单位生命值倍率；
- `sppedMultiplier`：单位速度倍率；
- `reloadMultiplier`：单位开火速度倍率；
- `buildSpeedMultiplier`：单位建造速度倍率；
- `dragMultiplier`：单位运动阻力倍率，原版中没有状态效果使用此属性，但有些方块设置了同名属性，比如“冰”；
- `damage`：大于0是指对单位每帧造成的伤害；**小于0**时指对单位每帧修复的生命值；
- `transitionDamage`：发生状态影响时每秒造成的伤害，理论上只供核心数据库查阅；
- `disarm`：是否使单位缴械，使单位无法使用武器；
- `color`：状态效果的标志色；
- `effect`：状态生效时单位时不时产生的特效。

## 冲突与反应

不过，最好不要用字段来设置状态冲突和反应，因为Anuke已经帮我们封装好了设置它们的方法。也就是`opposite()`和`affinity()`。

::: code-group

``` java
wet = new StatusEffect("wet"){{
    color = Color.royal;
    speedMultiplier = 0.94f;
    effect = Fx.wet;
    effectChance = 0.09f;
    transitionDamage = 14;

    init(() -> {
        affinity(shocked, (unit, result, time) -> {
            unit.damage(transitionDamage);
        });
        opposite(burning, melting);
    });
}};
```

``` kotlin
val wet = StatusEffect("wet").apply {
    color = Color.royal
    speedMultiplier = 0.94f
    effect = Fx.wet
    effectChance = 0.09f
    transitionDamage = 14

    init {
        affinity(shocked) { unit, result, time ->
            unit.damage(transitionDamage)
        }
        opposite(burning, melting)
    }
}

```

:::

我们稍后处理这个init块的问题和不同语言版本的巨大差异，先来看两个方法在Java中的使用方式。显然，`opposite()`是一个变长参数的方法，接收一系列状态效果，然后将它们设置为状态冲突。但`affinity()`的第二个参数是完全没有见过的结构，长得像这样：

```java
(参数列表) -> {函数体}
```

我们把这种表达式称为**Lambda式**，又叫**匿名函数**，关于其含义和背后机制我们以后自会讨论。在这里你可以认为，传递函数其实就是传递“我要干什么”的信息，而`affinity()`方法的含义就是“当本状态效果遇到了第一个参数对应的状态效果时，游戏会帮你自动执行一段你写的代码，同时游戏在这里给你的代码提供三个信息，用unit代表受影响的单位，用time代表第一个参数对应的状态效果的持续时长。在这里我们想让“潮湿”和“电击”在反应时给予单位14伤害，那我们只需要写`unit.damage(transitionDamage);`即可（因为`transitionDamage`在此作用域可见）。*以上内容是理解Mindustry游戏的基础，请务必反复思考理解，不理解也没有关系，到第三章我们再与这种代码打交道，现在你只需要知道状态反应时让单位受到伤害怎么表达即可。*

至于`init`的作用，则是一种**推迟初始化**的做法。由于原版中状态效果的关系错综复杂，并且声明冲突和反应时得保证对应的字段已经加载完毕了，所以没有办法找到一个可行的顺序。于是，我们可以把声明冲突和反应这件事从 **构造器** 推迟到 **init()方法**处。`init()`方法是一个约定俗成在加载完成全部内容（即执行完原版和所有模组的`loadContent`）方法后才执行的方法，在这一阶段设置内容的属性是极为合适的。**你最好只在`loadContent()`时添加内容，但内容的属性何时设定由你决定。**

在Kotlin中，有一种特殊的语法，叫做**尾随Lambda**。当lambda式是方法的最后一个参数时，可以把lambda提到实参列表之外。另外，Koltin支持无参lambda不写出参数列表，所以代码能够更加美观一些。

## 特效

特效（Effect）在原版中极为常见，建造方块时、炮塔开火时、钍豆爆炸时都伴随着特效的出现。由于Effect和Fx的发音相近，因此Fx也是特效的意思。尽管状态效果（Status Effect）也有效果（Effect），但它和特效是完全不同的两个概念。在中文语境下这两件事很容易区别，本教程中效果是状态效果的简称，而特效单指Fx。

原版有很多地方都有特效，单是工厂就有`craftEffect` `updateEffect` `placeEffect` `breakEffect` `destroyEffect`多种，单从名字上就能看出来功能。原版也内置了很多特效，他们集中在`mindustry.content.Fx`这个类中。

你固然可以像json那样用`ExplosionEffect` `ParticleEffect` `SoundEffect` `WaveEffect`去声明一个较为“通用”的特效，但对于Java来说没有必要，你有更高明的手段去新建一个特效。
