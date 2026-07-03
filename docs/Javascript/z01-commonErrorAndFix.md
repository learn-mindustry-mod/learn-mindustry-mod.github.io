# 常见报错及修复方法

mdt中错误可以大致分为两类: **编译错误** 和 **运行错误**;前者是在模组加载阶段发生的错误,会在`last-log.txt`文件中报告错误,后者是模组加载完成后游戏运行时发生的错误,通常会导致游戏崩溃,会在`crash/`目录下产生一个新的`crash_xxxx.txt`.

本篇教程会截取这两种日志的关键部分来讲解如何辨别与修复它们.

## 常见编译错误

编译错误大部分是语法错误,因此可以通过使用带有语法高亮的编辑器来避免.

但如果你习惯使用纯文本编辑器,那么你就需要学会如何从日志中辨别错误的类型和位置了.下面是一些常见的编译错误及其修复方法.

### 缺少括号

``` txt

[I] Loading mod: vne
[E] rhino.EvaluatorException: missing ) after argument list (vne/factory.js#932)

```

这个错误提示说在`vne/factory.js`文件的932行附近缺少一个右括号,但其实大部分时候这个错误并不是因为真的缺少了一个括号,而是因为在使用某个方法或者定义某个对象时,在属性列表的某个属性后面忘记加逗号了,导致解析器误认为后面的代码是括号内的参数列表,从而报出这个错误.

``` javascript

//以下为vne/factory.js文件932行附近的代码

const desalination = new GenericCrafter("desalination");
exports.desalination = desalination;
Object.assign(desalination,{
    craftEffect: Fx.none,
    outputItem: new ItemStack(item.salt, 1),
    outputLiquid: new LiquidStack(Liquids.water, 20 / 60)     //这里少了逗号,这但行为931行
    craftTime: 120, //这里才是932行
    size: 2,
    hasItems: true,
    hasLiquids: true,
    drawer: new DrawMulti(
    new DrawRegion("-bottom"),
    new DrawLiquidTile(liquid.brine, 1),
    new DrawLiquidTile(Liquids.water, 1),
    new DrawDefault(),
    ),
    buildVisibility: BuildVisibility.shown,
    category: Category.crafting,
    requirements: ItemStack.with(
        Items.graphite, 10,
        Items.silicon, 20,
        item.nickel, 25,
    )
})

```

需要注意的是,这个错误提示的行数并不一定就是实际出错的行数,它可能是出错行的下一行或者更后面的某一行.

正确的代码应该是这样的:

```javascript

const desalination = new GenericCrafter("desalination");
exports.desalination = desalination;
Object.assign(desalination,{
    craftEffect: Fx.none,
    outputItem: new ItemStack(item.salt, 1),
    outputLiquid: new LiquidStack(Liquids.water, 20 / 60),     //这里加上逗号
    craftTime: 120,
    size: 2,
    hasItems: true,
    hasLiquids: true,
    drawer: new DrawMulti(
    new DrawRegion("-bottom"),
    new DrawLiquidTile(liquid.brine, 1),
    new DrawLiquidTile(Liquids.water, 1),
    new DrawDefault(),
    ),
    buildVisibility: BuildVisibility.shown,
    category: Category.crafting,
    requirements: ItemStack.with(
        Items.graphite, 10,
        Items.silicon, 20,
        item.nickel, 25,
    )
})

```

### 重复定义属性

``` txt

[I] Loading mod: vne
[E] rhino.EvaluatorException: Property "hasPower" already defined in this object literal. (vne/distribution.js#173)

```

这个错误提示说在`vne/distribution.js`文件的173行附近,在一个对象字面量中重复定义了`hasPower`属性.这通常是因为在使用Object.assign()方法给对象添加属性时,不小心重复定义了同一个属性.

```javascript

//以下为vne/distribution.js文件173行附近的代码

const nickelBridge = new ItemBridge("nickel-bridge");
exports.nickelBridge = nickelBridge;
Object.assign(nickelBridge, {
    fadeIn: false,
    moveArrows: false,
    consumesPower: false,//这里已经定义了hasPower属性
    range: 6,
    arrowSpacing: 6,
    transportTime: 10,
    buildVisibility: BuildVisibility.shown,
    category: Category.distribution,
    requirements: ItemStack.with(
        Items.copper, 15,
        item.nickel, 10,
    ),
    solid: false,
 
    hasPower: true,//173行,这里重复定义了hasPower属性
    consumesPower: true,
    outputsPower: true,
    conductivePower: true,
})

```

注意到,报错的是后面那个`hasPower`属性,而不是前面那个,所以我们只需要删除后面那个重复定义的属性,对吗?

这样改语法上是没错了,但往往来说后面的才是我们期望的属性值,所以我们应该删除前面那个重复定义的属性(也就是`consumesPower: false`)

总之,我们需要保证在一个对象字面量中,同一个属性只能定义一次.

## 常见运行错误

相比于编译错误,运行错误难以在运行前就被发现,而是在游戏运行时才会发生.当游戏崩溃时,我们可以在`crash/`目录下找到一个新的`crash_xxxx.txt`文件,这个文件中包含了游戏崩溃时的堆栈信息,我们可以通过分析这些信息来定位问题.

### 变量未定义

这是最常见的运行错误之一,尤其是在mdt的js模组制作过程中.一方面,js不会在编译阶段检查变量是否定义,另一方面,复制而来的java代码中可能会有一些变量在js中并没有直接定义(通常要在前面加上Vars.或者this.才能使用),因此很容易出现变量未定义的情况.

下面看个典型案例

> 施工中...
> 有谁看到了就整一个上去,我暂时还没有典型案例--pardon

``` txt 

```

