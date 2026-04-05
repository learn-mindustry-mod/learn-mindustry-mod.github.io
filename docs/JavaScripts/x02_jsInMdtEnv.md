# mdt环境下的js

从这一节开始,我们将介绍在Mindustry中使用JavaScript编写模组时需要注意的一些特殊语法和环境相关的知识。这些内容可能不适用于其他JavaScript环境,但对于编写mdt模组来说是非常重要的。我们将介绍一些mdt特有的全局对象、函数以及一些常见的编程模式和技巧.

## main.js文件和require函数

在mdt中,js文件需要放在`scripts/`目录下,这个目录与json的`content/`目录同级,mdt只会识别和加载你的`main.js`文件,理论上你可以在这个文件中编写所有的代码,但我不建议这样做.
你也可以在`scripts/`目录下创建其他的js文件来组织你的代码,但这些文件需要在`main.js`中通过`require()`函数引入才能使用。

```javascript
// main.js

require('item'); // 引入scripts/item.js文件
require('block/wall'); // 引入scripts/block/wall.js文件

// 上面的写法仅适用于单模组的情形,如果你加载了多个模组,你需要在路径前加上模组name来区分,比如:

require('zerg/item'); // 引入虫族(zerg)的scripts/item.js文件
require('vne/item'); // 引入原版瘤液拓展(vne)的scripts/item.js文件

// 如果你不标注模组name,mdt很可能会加载错误的文件.
```

## exports

在JavaScript中，只有全局变量/方法（例如Mindustry提供的print、extend等）可以跨脚本使用。脚本内定义的变量/方法属于局部变量/方法，不能被其他脚本文件获取。要实现跨脚本调用，必须先将指定的变量/方法导出。在mdt中，导出变量/方法的方式是将它们赋值给exports对象。例如：

```javascript
// item.js
const biomassSteel = new Item("biomass-steel", Color.valueOf("7EA341"));
exports.biomassSteel = biomassSteel;
Object.assign(biomassSteel, {
    cost: 2.5,
    healthScaling: 2.2,
})
```

```javascript
// wall.js
const item = require('vne/item');

const biomassWall = new Wall("biomass-wall");
exports.biomassWall = biomassWall;
Object.assign(biomassWall, {
    health: 1200,
    armor: 20,
    size: 1,
    insulated: true,
    absorbLasers: true,
    schematicPriority: 10,
    buildVisibility: BuildVisibility.shown,
    category: Category.defense,
    requirements: ItemStack.with(
    item.biomassSteel, 6, ),
})

```

在上面的例子中，我们在item.js中定义了一个名为biomassSteel的Item对象，并将其导出。在wall.js中，我们通过require('vne/item')引入了item.js文件，并使用exports.biomassSteel来获取biomassSteel对象。这样，我们就可以在wall.js中使用biomassSteel对象的属性和方法了。
需要注意的是，exports对象是一个普通的JavaScript对象，你可以在其中定义任意数量的属性和方法来导出。只要在其他脚本文件中通过require()函数引入了包含这些属性和方法的脚本，就可以通过exports对象来访问它们。

在声明变量后,就直接使用exports导出是一个很好的习惯,这样可以让代码更清晰,也方便其他脚本文件调用.当然,你也可以在声明变量时直接将它们赋值给exports对象,例如:

```javascript

exports.biomassSteel = new Item("biomass-steel", Color.valueOf("7EA341"));

```

这种写法虽然更简洁,但这样就无法在声明变量后对它进行修改了,也无法在同一个文件中使用,所以我更推荐第一种写法.

## Object.assign()方法

在上面的例子中,我们使用了Object.assign()方法来给biomassSteel对象添加了一些属性.虽然Object.assign()方法是JavaScript中的一个内置方法,而不是mdt特有的语法,但它在mdt中非常常用,因为它可以方便地给对象添加属性和方法,而不需要重复写对象名.例如:

```javascript
//不用Object.assign()
const biomassSteel = new Item("biomass-steel", Color.valueOf("7EA341"));
biomassSteel.cost = 2.5;
biomassSteel.healthScaling = 2.2;

//使用Object.assign()
const biomassSteel = new Item("biomass-steel", Color.valueOf("7EA341"));
Object.assign(biomassSteel, {
    cost: 2.5,
    healthScaling: 2.2,
})
```

给物品添加属性时,效率差距可能不大,但如果你需要给一个对象添加很多属性和方法,使用Object.assign()就可以大大减少代码量,尤其是你想修改一个已经声明的对象的变量名时,使用Object.assign()就可以避免重复写对象名,让代码更简洁.
因此,对于Object.assign()方法,我们直接给到夯完了,王中王,不接受任何反驳.

## extend()函数

在mdt中,extend()函数是一个非常重要的函数,它可以用来创建一个新的对象,这个对象继承自一个已有的对象,并且可以添加新的属性和方法.
不过,extend()函数的使用方法可能和你在其他JavaScript环境中使用的继承方式不太一样,所以我们需要专门介绍一下它的用法.
例如:

```javascript

const acid = extend(Liquid,"acid",Color.valueOf("84a94b"),{
    update(puddle){
        if(puddle.tile != null && puddle.tile.build != null){
            puddle.tile.build.damage(0.2)
            
            puddle.amount -= 0.2
            
            if(Mathf.chanceDelta(0.05)){
                Fx.mineSmall.at(puddle.x,puddle.y)
            }
        }
    },
    effect: StatusEffects.corroded,
    viscosity: 0.8,
    heatCapacity: 0.2,
    temperature: 0.54,
    flammability: 0,
    capPuddles: false,
    coolant: false
});

```

在上面的例子中,我们使用extend()函数创建了一个新的Liquid对象acid,这个对象继承自Liquid类,并且添加了一些新的属性和方法.其中,update()方法是一个特殊的方法,它会在每个游戏tick更新时被调用,我们可以在这个方法中编写一些逻辑来实现液体的特殊效果.
需要注意的是,extend()函数的参数数量是可变的,但第一个参数必须是一个mdt(或者其他java模组)中的java类,最后一个参数必须是一个对象字面量,这个对象字面量中定义了新对象的属性和方法.其余的参数顺序参考java类的构造函数参数顺序.

举个例子:

``` java
// Block类的构造函数
public Block(String name){}

```

于是你的extend()函数的调用就应该是:

```javascript

const biomassWall = extend(Block,"name",{})

```

而对于bullet类,它的构造函数是:

``` java

public BulletType(float speed, float damage){
    this.speed = speed;
    this.damage = damage;
}

public BulletType(){}

```

```javascript
// 因此下面两种写法都是正确的,但第一种写法更简洁,第二种写法更清晰,你可以根据自己的喜好选择使用哪一种写法.
const acidBullet = extend(BulletType,0.8,20,{
    // 这里是属性和方法
})

const acidBullet = extend(BulletType,{
    speed: 0.8,
    damage: 20,
    // 这里是属性和方法
})

```

而对于某些参数较多的类,比如ShieldRegenFieldAbility,它的构造函数是:

``` java
public ShieldRegenFieldAbility(){}

public ShieldRegenFieldAbility(float amount, float max, float reload, float range){
    this.amount = amount;
    this.max = max;
    this.reload = reload;
    this.range = range;
}

```

```javascript

//我推荐你使用下面的写法,这样可以让代码更清晰,也更容易修改参数.
//毕竟ShieldRegenFieldAbility的参数比较多,还都是float类型,我猜除了上帝没有人能记住每个参数的顺序和含义.
const shieldRegenField = extend(ShieldRegenFieldAbility,{
    amount: 0.8,
    max: 20,
    reload: 60,
    range: 40
})

```

## 小结

在mdt环境下编写js时,我们需要注意一些特殊的语法和环境相关的知识.我们需要使用exports对象来导出变量和方法,使用require()函数来引入其他脚本文件,使用Object.assign()方法来给对象添加属性和方法,使用extend()函数来创建新的对象并继承已有的对象.掌握这些知识可以帮助你更好地编写mdt模组,让你的代码更清晰、更简洁、更高效.
从下一节开始,我将带你拆解一个简单的但是非常有参考价值的js模组,顺带介绍一些mdt中常用的全局对象和函数.

课后练习: 以js语言写一个简单的模组,至少包含一个物品和一个方块,并且方块要使用你新建的物品作为建造材料.记得提交你的作业,否则学分不予以发放,你就等着被退学吧.（开玩笑的,但真的欢迎你来群里交流讨论你的作业,我会尽力解答你的问题的.）
