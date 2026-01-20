# 状态效果和特效

> ***合金气旋，已逝的神***

## 声明一个StatusEffect

状态效果，在其他游戏可能被称为buff，是一种可以应用在单位上，使单位获得增益或减益效果的一种内容类型（Content Type）。你可以按照先前的组织架构，为状态效果新建一个存储文件：

::: code-group

```java
new StatusEffect("tutorial-status-effect-1");
```

```kotlin
StatusEffect("tutorial-status-effect-1")
```

:::

和往常一样，你需要给它分配贴图和文本。

```properties bundle_zh_CN.properties
status.tutorial-mod-tutorial-status-effect-1.name = 演示状态效果1
status.tutorial-mod-tutorial-status-effect-1.description = 原版甚至没有给状态效果做过描述。
status.tutorial-mod-tutorial-status-effect-1.details = 
```

```properties bundle.properties
status.tutorial-mod-tutorial-status-effect-1.name = Tutorial Status Effect 1
status.tutorial-mod-tutorial-status-effect-1.description = There is no description of a status effect in vanilla.
status.tutorial-mod-tutorial-status-effect-1.details = 
```

状态效果有很多属性可以设置，给状态效果中的某些属性赋予负值是有意义的；作为对比，方块的某些属性为负值可能代表忽略该属性：

- `damageMultiplier`：单位伤害倍率；
- `healthMultiplier`：单位生命值倍率；
- `sppedMultiplier`：单位速度倍率；
- `reloadMultiplier`：单位开火速度倍率；
- `buildSpeedMultiplier`：单位建造速度倍率；
- `dragMultiplier`：单位运动阻力倍率，原版中没有状态效果使用此属性，但有些方块设置了同名属性，比如“冰”；
- `damage`：大于0是指对单位每帧造成的伤害；**小于0**时指对单位每帧修复的生命值；
- `transitionDamage`：发生状态影响时每秒造成的伤害，只供核心数据库显示；
- `disarm`：是否使单位无法使用武器；
- `color`：状态效果的颜色；
- `effect`：状态生效时单位产生的特效。

## 冲突与反应

StatusEffect类中有`opposite`和`affinity`字段。不过，这些字段的类型并不是简单的数组或`Seq`，而是`ObjectSet`，一种对象的“集合”类型，并且，这个字段只是用于显示，没有实际的冲突或反应功能。若想要设置冲突或反应功能，需要如下的语法：

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

先来看两个方法在Java中的使用方式。`opposite()`是一个拥有变长参数的方法，接收一系列状态效果，然后将它们设置为与本状态效果冲突。`affinity()`的第一个参数是另一个状态效果，而第二个参数是完全没有见过的结构，有如下的形式：

```java
(参数列表) -> {函数体}
```

我们把这种表达式称为**Lambda表达式**，又叫**匿名函数**。在这里你可以认为，传递函数其实就是传递“我要干什么”的信息。`affinity()`方法的含义是，“当本状态效果遇到了第一个参数对应的状态效果时，游戏会帮你执行一段你写的代码，同时游戏在这里给你的代码提供三条信息，用unit代表受影响的单位，用time代表第一个参数对应的状态效果的持续时长。在这里我们想让“潮湿”和“电击”在反应时给予单位14伤害，那我们只需要写`unit.damage(transitionDamage);`即可（因为在此作用域中`transitionDamage`是可见的）。

`init` 方法的作用是实现一种**延迟初始化**机制。由于原版游戏中的状态效果之间关系复杂，且在声明冲突和反应时必须确保所引用的字段已加载完成，因此很难找到一个绝对安全的初始化顺序。为解决这一问题，可以将冲突与反应等属性的设置从**构造函数**推迟到专门的 **`init()` 方法**中执行。`init()` 方法是一个约定俗成的执行节点，它会在所有内容（即原版及所有模组的 `loadContent()` 方法）完全加载完毕后被调用。在这个阶段，所有内容都已注册并存于内容管理器中，因此在此设置内容之间的相互引用和关系属性是非常合适的。**总结来说：建议在 `loadContent()` 阶段只完成内容（物品、方块等）的注册声明，而将内容属性的设置（尤其是涉及相互引用的部分）安排在 `init()` 阶段进行。**

在 Kotlin 语言中，提供了一项称为**尾随 Lambda** 的语法特性。当一个函数的最后一个参数是 Lambda 表达式时，可以将其移至函数调用的小括号**外部**。此外，如果该 Lambda 表达式没有参数，则可以省略其参数声明，使代码更加简洁直观。

## 特效

特效（Effect）是一些短而简单的、可在任意时刻绘制的小片段。建造方块时、炮塔开火时、钍反应堆爆炸时都伴随着特效的出现。Effect又名Fx，因为两者读音接近。尽管状态效果（StatusEffect）这一单词中也有Effect，但它和特效是完全不同的两个概念。

原版有很多地方都有特效，例如工厂就有`craftEffect` `updateEffect` `placeEffect` `breakEffect` `destroyEffect`多种特效。各个特效字段的名称通常反映了其应用时机，如`craftEffect`为生产后可能产生的特效。原版内置的所有音效都存储在`mindustry.content.Fx`这个类中，例如`Fx.pulverizeMedium`等。

在Java模组中，我们一般会直接使用Effect的基类构造方法：

``` java
pulverizeMedium = new Effect(30, e -> {
    randLenVectors(e.id, 5, 3f + e.fin() * 8f, (x, y) -> {
        color(Pal.stoneGray);
        Fill.square(e.x + x, e.y + y, e.fout() + 0.5f, 45);
    });
})
```

这个构造方法的第一个参数是特效的寿命，第二个参数也是一个Lambda表达式，用于放置具体的绘制方法。我们将在第五章深入介绍各种绘制方法的使用。

Effect有一些模板化的子类，如`ExplosionEffect` `ParticleEffect` `SoundEffect` `WaveEffect`。这些子类的初衷是为了方便JSON模组创建特效的，但在Java模组中也可以使用：

``` java
despawnEffect = hitEffect = new ExplosionEffect(){{
    waveColor = Pal.surge;
    smokeColor = Color.gray;
    sparkColor = Pal.sap;
    waveStroke = 4f;
    waveRad = 40f;
}};
```

以下是对各个模板化子类的字段介绍：

<!--@include: ./reference/5-1-particle-effect.md-->

## 音效与音乐

音效（Sound）与特效所处的地位类似。音效是一段较短的、起提示作用的音频。原版中音效应用也比较广泛，如`placeSound` `breakSound` `destroySound`等。和特效一样，这些音频的作用时机也可以从字段名称上看出。

原版中所有可用的音频都存放在`mindustry.gen.Sounds`。这个类位于`mindustry.gen`这个包中，说明这个类是在编译过程中由程序自动生成，而非手写由程序员编写的。如果你查阅的源代码使用的是Mindustry项目本身，则你必须运行过一次编译流程才会在`core/build/generated/source/kapt/main/mindustry/gen/`文件夹下找到这个类的“原件”。如果你是通过IDEA的依赖管理查阅源代码，那么直接就可以在IDEA的依赖项中找到这个类。这个类中的字段是根据`core/build/assets/sounds`文件夹下的文件名生成的。

要想加载你自己的音效文件，你需要将后缀名为`ogg`或`mp3`的音效文件放入你的项目中的`assets/sounds/`文件夹下，然后在你想要加载位置填入以下内容，括号里不用填入文件的路径和后缀名：

``` java
Vars.tree.loadSound("example-sound")
```

Sound还有一个子类`RandomSound`，拥有一个`sounds`属性，可以接受一个`Sound`的列表。在播放此音效时，会在`sounds`中随机选择一个音效进行播放。

音乐（Music）与音效的加载过程是类似的，只需要把`loadSound`变为`loadMusic`即可
