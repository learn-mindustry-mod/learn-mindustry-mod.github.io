# 使用JS自定义方块

本章节将通过一个例子介绍如何通过JavaScript实现自定义逻辑的方块。

## 方块（Block）与建筑（Building）的区别

在开始之前，确保你清楚方块（Block）与建筑（Building）的区别，参见[方块与建筑](/docs/java/3-basic-logic/A-block-and-building.md)：
- 方块定义了通用的行为，方块的属性是所有同类建筑共用的。
- 建筑是方块在世界中的具体实例，每个建筑的属性都是独立的，即使它们属于同一个方块。

## 明确js可以与json混用

使用js定义了方块以后，依然能在json中定义该方块的属性。因此我们可以通过js定义方块实例，再通过json设定诸如`requirements`之类的属性。

本例中的方块对应的json文件：

``` json
{
    "name": "双传路由器",
    "health": 90,
    "speed": 3,
    "floating": true,
    "hasLiquids": true,
    "liquidCapacity": 30,
    "requirements": [
        "metaglass/3",
        "plastanium/1",
        "surge-alloy/1"
    ],
    "category": "distribution",
    "research": "双传交叉器"
}
```

::: warning 注意
同时使用js和json时，二者对应的文件名要相同，且json中不能添加`"type"`字段，否则会报错
:::

## 创建方块对象

创建任何一种新方块之前，先明确自己的需求，确定新方块要实现什么功能，明确要继承自哪个对象。

在本例中，我们希望实现一个能同时传输物品和流体的路由器，命名为"双传路由器"。我们将通过改写原版路由器来实现对应功能，因此继承自原版的`Router`。

在`scripts`目录下创建一个新的js文件并添加代码：

``` javascript
    const ILrouter = extend(Router, "双传路由器", {});
```

## 修改方块中的方法

我们可以通过添加/覆写方块中的方法来实现自己想要的效果，具体的方法可以查阅Java源代码。在本例中，我们希望双传路由器能够替换能够替换液体方块，并且像液体储罐一样绘制。可以看到源码中对应的方法：

``` java
//允许替换方块
    public boolean canReplace(Block other){
        //具体实现...
    }

//加载贴图
    public static void load(){
        //具体实现...
    }

//放置贴图预览
    public void drawPlanRegion(BuildPlan plan, Eachable<BuildPlan> list){
        //具体实现...
    }

//方块图标
    protected TextureRegion[] icons(){
        //具体实现...
    }

```

通过js在方块中重写对应的方法，使用`this.super$method();`来调用父类方法：

``` javascript
    var bottomRegion; //这是个全局变量,所有方块的bottomRegion都相同
    const ILrouter = extend(Router, "双传路由器", {
        //加载自定义贴图
        load(){
            this.super$load();
            bottomRegion = Core.atlas.find(this.name + "-bottom");
        },

        //允许替换液体建筑
        canReplace(other){ 
            if(other.alwaysReplace) return true;
            if(other.privileged) return false;
            return other.replaceable && (other != this) && ((this.group != BlockGroup.none && (other.group == this.group || other.group == BlockGroup.liquids))) &&
                (this.size == other.size || (this.size >= other.size && ((this.subclass != null && this.subclass == other.subclass) || group.anyReplace)));
        },

        //自定义建造预览
        drawPlanRegion(plan, list){
            Draw.rect(bottomRegion, plan.drawx(), plan.drawy());
            Draw.rect(this.region,plan.drawx(), plan.drawy());
        },

        //自定义图标
        icon(){
            return [bottomRegion, this.region];
        }
    });
```

## 根据需要添加对应的贴图

你需要根据自己的需求，在`sprites`目录下添加需要加载的贴图，并确保命名正确。在本例中，我们添加了`双传路由器-bottom`作为其底部贴图。

## 创建建筑实例

在JavaScript中，我们通过以下的方式创建方块对应的建筑实例：

``` javascript
    ILrouter.buildType = (() => {
        return extend(Router.RouterBuild, ILrouter, {});
    });
```

`ILrouter`对应方块实例，`Router.RouterBuild`对应要继承的建筑类。

## 修改建筑中的方法

与修改方法类似，建筑中的方法也可以通过js进行修改，达到自定义的效果。在本例中，我们希望双传路由器能够像液体路由器一样接受并分配液体，并且绘制对应液体。因此我们要修改`Router.RouterBuild`中对应的方法：

``` javascript
    ILrouter.buildType = (() => {
        return extend(Router.RouterBuild, ILrouter, {
            //实现接受液体
            acceptLiquid(source,liquid){
                if(this.liquids == null) return false;
                return (this.liquids.current() == liquid || this.liquids.currentAmount() < 0.2);
            },
            //绘制建筑
            draw(){
                Draw.rect(bottomRegion, this.x, this.y);
                this.drawLiquid();
                Draw.rect(this.block.egion, this.x, this.y);
            },
            //添加自定义方法：绘制液体
            drawLiquid(){
                if(this.liquids != null && this.liquids.currentAmount() > 0.001){
                    let lq = Vars.renderer.fluidFrames[this.liquids.current().gas ? 1 : 0][this.liquids.current().getAnimationFrame()];
                    let liquidRegion = Tmp.tr1;
                    liquidRegion.set(lq);
                    Drawf.liquid(liquidRegion, this.x, this.y, this.liquids.currentAmount() / this.block.liquidCapacity * 1.0, this.liquids.current().color);
                }
            },
            //建筑的更新：添加液体倾倒
            updateTile(){
                if(this.liquids != null && this.liquids.currentAmount() > 0.0001){
                    this.dumpLiquid(this.liquids.current());
                }
                this.super$updateTile();
            }
        });
    });
```

我们不希望双传路由器像普通路由器一样可被玩家控制，因此再修改掉`RouterBuild`中的`canControl()`方法：

``` javascript
    ILrouter.buildType = (() => {
        return extend(Router.RouterBuild, ILrouter, {
            //禁止玩家控制
            canControl(){
                return false;
            },

            //其他方法...
        });
    });
```

## 总结

一般来说，通过js编写一个新的方块的流程大致如下：
- 选择合适的继承类，创建方块对象
- 根据需要覆写/添加方块中的方法
- 创建对应方块的建筑实例
- 根据需要覆写/添加建筑中的方法
- 设定方块对应属性(可在json实现)

例子中"双传路由器"的完整实现如下：

``` json
{
    "name": "双传路由器",
    "health": 90,
    "speed": 3,
    "floating": true,
    "hasLiquids": true,
    "liquidCapacity": 30,
    "requirements": [
        "metaglass/3",
        "plastanium/1",
        "surge-alloy/1"
    ],
    "category": "distribution",
    "research": "双传交叉器"
}
```

``` javascript
    var bottomRegion;
const ILrouter = extend(Router, "双传路由器", {
    load(){
        this.super$load();
        bottomRegion = Core.atlas.find(this.name + "-bottom");
    },
    canReplace(other){ 
        if(other.alwaysReplace) return true;
        if(other.privileged) return false;
        return other.replaceable && (other != this) && ((this.group != BlockGroup.none && (other.group == this.group || other.group == BlockGroup.liquids))) &&
            (this.size == other.size || (this.size >= other.size && ((this.subclass != null && this.subclass == other.subclass) || group.anyReplace)));
    },
    drawPlanRegion(plan, list){
        Draw.rect(bottomRegion, plan.drawx(), plan.drawy());
        Draw.rect(this.region,plan.drawx(), plan.drawy());
    },
    icon(){
        return [bottomRegion, this.region];
    }
});

ILrouter.buildType = (() => {
    return extend(Router.RouterBuild, ILrouter, {
        acceptLiquid(source,liquid){
            if(this.liquids.current() == null) return false;
            return (this.liquids.current() == liquid || this.liquids.currentAmount() < 0.2);
        },
        canControl(){
            return false;
        },
        draw(){
            Draw.rect(bottomRegion, this.x, this.y);
            if(this.liquids.current() != null && this.liquids.currentAmount() > 0.001){
                this.drawLiquid();
            }
            Draw.rect(this.block.egion, this.x, this.y);
        },
        drawLiquid(){
            let lq = Vars.renderer.fluidFrames[this.liquids.current().gas ? 1 : 0][this.liquids.current().getAnimationFrame()];
            let liquidRegion = Tmp.tr1;
            liquidRegion.set(lq);
            Drawf.liquid(liquidRegion, this.x, this.y, this.liquids.currentAmount() / this.block.liquidCapacity * 1.0, this.liquids.current().color.write(Tmp.c1));
        },
        updateTile(){
            if(this.liquids != null && this.liquids.currentAmount() > 0.0001){
                this.dumpLiquid(this.liquids.current());
            }
            this.super$updateTile();
        }
    });
});
```
