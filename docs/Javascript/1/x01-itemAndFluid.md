# 物品与液体

从这里开始,我们将正式开始制作可用的游戏元素,让我们先从比较简单的`物品(Item)`和`液体(Liquid)`开始.

## 物品(Item)

~~不想用js写物品的可以用json写,然后在js中通过 Vars.content.item("mod-name") 来获取~~.

在mdt中,物品(Item)的构造函数如下

```java

    public Item(String name, Color color){
        super(name);
        this.color = color;
    }

    public Item(String name){
        this(name, new Color(Color.black));
    }
```

因此在js中我们可以通过一下方式来创建一个物品对象

```javascript

const nickel = new Item("nickel", Color.valueOf("b7b7b7"));
//或者
const nickel = extend(Item,"nickel",Color.valueOf("b7b7b7"),{});

```

显然,物品在后续的开发中会多次调用,因此我们可以将其导出,以便在其他文件中使用

```javascript

const nickel = new Item("nickel", Color.valueOf("b7b7b7"));
exports.nickel = nickel;
//或者
const nickel = extend(Item,"nickel",Color.valueOf("b7b7b7"),{});
exports.nickel = nickel;

```

那有同学要问了,我要如何配置物品的属性呢?

> 物品属性列表详见`json`和`Java`教程,或者翻阅`mindustry/type/Item.java`源码,这里不再赘述.

我们可以使用`Object.assign()`方法来给物品对象添加属性,而对于下面一种则更简单,比如

```javascript

const nickel = new Item("nickel", Color.valueOf("b7b7b7"));
exports.nickel = nickel;
Object.assign(nickel,{
    hardness: 3,
    cost: 2,
    flammability: 0.1,
    radioactivity: 0.5,
    explosiveness: 0.2,
})
//或者
const nickel = extend(Item,"nickel",Color.valueOf("b7b7b7"),{
    hardness: 3,
    cost: 2,
    flammability: 0.1,
    radioactivity: 0.5,
    explosiveness: 0.2,
});
exports.nickel = nickel;

```

以下也正确,但没必要

```javascript
//方案1
const nickel = extend(Item,"nickel",Color.valueOf("b7b7b7"),{});
exports.nickel = nickel;
Object.assign(nickel,{
    hardness: 3,
    cost: 2,
    flammability: 0.1,
    radioactivity: 0.5,
    explosiveness: 0.2,
})

//方案2
const nickel = new Item("nickel", Color.valueOf("b7b7b7"));
exports.nickel = nickel;
nickel.hardness= 3;
nickel.cost= 2;
nickel.flammability= 0.1;
nickel.radioactivity= 0.5;
nickel.explosiveness= 0.2;

//方案3
const nickel = extend(Item,"nickel",Color.valueOf("b7b7b7"),{});
exports.nickel = nickel;
nickel.hardness= 3;
nickel.cost= 2;
nickel.flammability= 0.1;
nickel.radioactivity= 0.5;
nickel.explosiveness= 0.2;

```

用js写的物品和json其实差不多,并没有什么差异化的东西.毕竟,物品本身就是一个数据对象,它的属性和方法都是固定的,并没有什么可扩展的地方.不过如果你想装一下的话,可以加入一些`stat`来丰富界面.

```javascript

const stat1 = new Stat("stat1");

const nickel = extend(Item,"nickel",Color.valueOf("b7b7b7"),{
    setStats() {
        this.super$setStats();

        this.stats.add(stat1, 100);
    }
})
```

~~有实践的在这里贴张图,让大家看看效果~~

这样,我们就可以在物品的界面中看到一个名为`stat1`的属性,它的值为100.当然,你也可以添加更多的属性,比如

```javascript

const stat1 = new Stat("stat1");
const stat2 = new Stat("stat2");
//...省略一些

const nickel = extend(Item,"nickel",Color.valueOf("b7b7b7"),{
    setStats() {
        this.super$setStats();

        this.stats.add(stat1, 100);
        this.stats.add(stat2, 200);//平行放上去就可以了
        //...省略一些
    }
})
```

当然stat仅仅是一个界面上的属性,**它并不会对游戏产生任何影响**,如果你想让stat有实际的效果,那就需要在游戏逻辑中去实现了.

## 液体(Liquid)

> 虽然叫“液体”，但这样命名的原因是v7前游戏没有原生的气体，而在v7中Anuke简单地把气体实现为不会产生水洼的液体。所以`Liquid`类的正确译名应当是流体。

液体的构造函数如下,和Item有几分相似

```java

    public Liquid(String name, Color color){
        super(name);
        this.color = new Color(color);
    }

    /** For modding only.*/
    public Liquid(String name){
        this(name, new Color(Color.black));
    }

```

因此创建一个液体对象和创建一个物品对象类似,我们可以通过以下方式来创建一个液体对象

```javascript

const acid = extend(Liquid,"acid",Color.valueOf("84a94b"),{
    effect: StatusEffects.corroded,
    viscosity: 0.8,
    heatCapacity: 0.2,
    temperature: 0.54,
    flammability: 0,
    capPuddles: false,
    coolant: false
});
exports.acid = acid;

```

物品部分中展示的其他写法这里通用适用,因篇幅原因,就不一一展示了.

当然液体也可以使用`stat`来丰富界面,比如

```javascript

const stat1 = new Stat("stat1");

const acid = extend(Liquid,"acid",Color.valueOf("84a94b"),{
    effect: StatusEffects.corroded,
    viscosity: 0.8,
    heatCapacity: 0.2,
    temperature: 0.54,
    flammability: 0,
    capPuddles: false,
    coolant: false,

    setStats() {
        this.super$setStats();

        this.stats.add(stat1, 100);
    }
});

```

不过液体的扩展空间比物品大一些,毕竟液体会溅落到地板上,从而产生更丰富的交互效果.

我们可以通过`update(puddle)`来拓展溅落液体的行为,比如以下就是一个溅落在建筑上会造成伤害的案例:

```javascript

const acid = extend(Liquid,"acid",Color.valueOf("84a94b"),{
    update(puddle) {

        this.super$update(puddle);//表示继承母类的逻辑,大多数情况下需要

        if (puddle.tile != null && puddle.tile.build != null) {
            puddle.tile.build.damage(0.2)

            puddle.amount -= 0.2

            if (Mathf.chanceDelta(0.05)) {
                Fx.mineSmall.at(puddle.x, puddle.y)
            }
        }
    },
})
```

其中的代码如果有部分方法看不懂也没有关系,我们会在后续的学习中深入了解.

## 补充内容

与json不同,一个文件可以定义多个对象,液体和物品也可以混装在同一个文件中,像下面这样:

```javascript
//这是同一个文件

const protein = new Item("protein", Color.valueOf("d6dbe7"));
exports.protein = protein;
Object.assign(protein, {
    flammability: 0.95
})

const salt = new Item("salt",Color.valueOf("c3c1bb"));
exports.salt = salt;
Object.assign(salt,{})

const cyanide = new Item("cyanide",Color.valueOf("89e8b6"));
exports.cyanide = cyanide;
Object.assign(cyanide,{
    explosiveness: 0.4
})

//省略一些物品

const brine = new Liquid("brine", Color.valueOf("7c92ac"));
exports.brine = brine;
Object.assign(brine, {
    //省略具体属性
})

const acid = extend(Liquid, "acid", Color.valueOf("84a94b"), {
    //省略具体属性
});
exports.acid = acid;

const venous = extend(CellLiquid, "venous", Color.valueOf("9e172c"), {
    //省略具体属性
})
exports.venous = venous;

//省略一些液体
```

> 以上代码节选自`原版瘤液拓展(vne)`模组

### 赋予名称和描述及贴图

**物品**的本地化名称,描述和细节文本分别被表示为语言文件中的几个固定格式的键值对：

- `item.[modName]-[物品名称].name` 物品的本地化名称
- `item.[modName]-[物品名称].description` 物品的描述文本
- `item.[modName]-[物品名称].details` 物品的细节文本

其中`modName`填写你在`mod.json`中所写的`name`,而`物品名称`即在你创建物品对象时构造方法的参数(即第一个`name`参数).

**液体**与物品类似,不过item要换成liquid,即

- `liquid.[modName]-[液体名称].name`
- `liquid.[modName]-[液体名称].description`
- `liquid.[modName]-[液体名称].details`

对于我们刚刚创建的名为`nickel`的物品,其参数为`nickel`,我们例子中的演示mod内部名称为`tutorial-mod`，那么在bundle中的键值对键名就应当填写为`tutorial-mod-nickel`,让我们将如下信息填写到`bundle_zh_CN.properties`中

```properties bundle_zh_CN.properties
item.tutorial-mod-nickel.name = 镍
item.tutorial-mod-nickel.description = 随处可见的金属,各方面性能均衡,用途广泛.
item.tutorial-mod-nickel.details = 你看不见我看不见我看不见我
```

贴图也是内容的重要组成部分之一,需要我们在mod的`sprites`目录中给物品提供.你只需要为物品绘制一张贴图,并把这张图片命名为你构造方法中写下的那个字符串,然后将它放入到`sprites`目录中。

最后,不要忘记在`main.js`中引入你的物品液体文件,来保证游戏正常调用.

## 小结

这节课我们了解了物品和液体对象创建的方法,这种方法对于其他的对象也同样适用.

基本作业:
试着在同一个文件中写多个物品和液体,并让它们正常运行

进阶作业:
设计一个有特殊机制的液体
