# 内容补丁

内容补丁（Content Patches），是在地图或服务器级上，修改方块、单位和物品属性的有力工具。此功能可以用于修改平衡性，自定义游戏模式、或是模拟科技升级。

内容补丁**可以**做到：

- 增加或减少工厂的输入；
- 改变方块的建造需求；
- 完全改变某单位的武器和子弹；
- 改变单位工厂的配方；
- 把方块或单位的贴图改成游戏内其他纹理；
- 改变任意方块的建造速度、生命值、或装甲等等；
- 改变单位的类型，如从陆军变为空军。

内容补丁**无法**做到：

- 向游戏中添加新纹理或资源文件；
- 添加原版没有的新机制；
- 改变方块的类型，如把墙变成炮塔；
- 添加新内容，如方块、单位等；

内容补丁*不是*模组的替代器（译者注：指一般性的内容模组），它只能更改已有的内容。


# 写一个简单的内容补丁

内容补丁通常是使用JSON或HJSON语言（JSON的超集）所写的。你需要一个文本编辑器，因为暂时还没有游戏内的编辑器。（译者注，此处可参见[JSON模组第一步](../json/x01-basic.md)了解更多）。

出于简洁的理由，本教程只会展示如何使用HJSON写内容补丁；

首先，创造一个文本文件，名为`mypatch.hjson`，填入以下内容：

```hjson
//命名是可有可无的，但是有名称利于在UI中管理
name: My Patch

//使“传送带”最大生命值变为50
block.conveyor.health: 50
```

# 应用内容补丁

## 在地图中应用

打开地图编辑器，然后打开左上方的菜单键（在桌面端按下ESC），转到 * 地图信息（Map Info） -> 内容补丁（Content Patches） -> 添加（Add）* ，然后填入上一步保存的文件。按下⚠️ 可以看到产生的所有错误，按下🔁可以重新加载文件。

## 在服务器上应用

打开服务器文件夹（里面有plugins/ maps/ saves/之类的文件夹），找到`patches/`文件夹，把文件放在里面。补丁文件必须是`hjson/json/json5`拓展名才能被加载。这些内容补丁将会在地图补丁**之后**被应用。（译者注：意在强调服务器补丁优先级高于地图补丁）

如果以上步骤无误，服务器会输出启动后加载补丁的日志。错误和警告会打印到控制台中。如果想到重新加载补丁，需要使用`reloadpatches`命令。

# 内容补丁基础

内容补丁遵循一定的层次体系。在第一层中，你需要定义你想要更改的内容的类型，例如`block`、 `liquid`、 `item`、 `unit`、 `weather`等。

在第二层，你需要定义你想要更改的内容的内部名称，例如`conveyor` `copper` `copper-wall-large`。这些名称是**大小写敏感的**，并且这些名称会在核心数据库中在名称下显示出来（需要启用控制台）。（译者注，可参考[JSON模组物品与液体](../json/x02-item-and-fluid.md)了解更多与内部名称有关的内容。）

在第三层，你需要定义你想要更改的属性，和相应的值。例如：

```hjson

block: {
  conveyor: {
    health: 50
    //传送带的其他属性在此
  }
  //其他方块在此
}
//其他内容的内容在此

```

相应地，如果你更改一条属性，使用缩写语法会更快一些：

```hjson
block.conveyor.health: 50
```

## 查看内容的所有字段

比较熟悉Java，你可以直接查阅源代码，比如直接查[Block.java](https://github.com/Anuken/Mindustry/blob/master/core/src/mindustry/world/Block.java)来获取方块共性的字段。

如果你不懂Java，你需要在游戏设置中启用控制台，然后点击某个方块或物品详细页的 **查看内容字段（View Content Fields）**

注意，这个页面只会显示**本类定义**的字段，它还有超类的字段，点击*extends*后的页面来访问超类的字段。

例如，[传送带类](https://mindustrygame.github.io/wiki/Modding%20Classes/Conveyor/)有本类定义的字段，也有[方块类](https://mindustrygame.github.io/wiki/Modding%20Classes/Block/)超类中的字段。

## 访问数组或列表

如果需要访问数组（形如T[]，其中T指任何类型），或者是一个列表（形如Seq< T >），你可以这样做：

```hjson
//极大地使尖刀的左炮偏移了原来的位置
unit.dagger.weapons.0.x: 100
```

注意，修改*镜像*武器的子弹会同时影响两侧武器，因为它们本来就共用同一个子弹：

```hjson
//这会使两侧武器子弹伤害*均*为55
unit.dagger.weapons.0.bullet.damage: 55
```

## 添加或覆盖数组或列表

有时，我们需要向列表中*添加*内容，而不是覆盖它：

```hjson
//给“星辉”加一下有趣的激光炮，而其它武器完好无损
//注意此处的.+，这是用来添加项目的
//也要注意，添加的是一个对象，而不能添加一数组对象！
unit.flare.weapons.+: {
  x: 0
  y: 0
  reload: 10
  bullet: {
    type: LaserBulletType
    damage: 100
  }
}
```

相应地，你也可以覆盖列表：

```hjson
//“星辉”现在只有这个炮塔了，原来的炮塔被覆盖了
//也要注意，因为是*覆盖*，所以你需要提供一整个数组，注意此处的[]
unit.flare.weapons: [
  {
    x: 0
    y: 0
    reload: 10
    bullet: {
      type: LaserBulletType
      damage: 100
    }
  }
]
```

此语法可用于`T[]` `Seq< T >`  `ObjectSet`。

# 通识

- 时间通常是使用*刻*衡量的，有时也叫做*帧*，是1/60秒，1秒=60刻。如果某个字段代表一段时长，很有可能是按刻计算的。如果一个字段代表速率，很有可能也是“每刻消耗量”；
- 距离、位置和尺寸通常是使用“世界单位”衡量的，一世界单位是1/8格。这是因为Mindustry过去每格贴图是8x8像素的，以前一世界单位确实是一像素。这很不符合直觉，但历史遗留已然如此；
- 逻辑处理器处理坐标时，在*内部*就有向世界单位的转换。但补丁是直接作用的，没有这个待遇；
- 物品和液体组可以写成`名称/数量`的形式，例如，一个`ItemStack`可以是`thorium/100`.

# 警告与限制

- 给单位武器赋值`mirror: true`并没有用。因为创建镜像武器是在单位初始化时做的，应用内容补丁并不会初始化单位。你需要手动做mirror的工作，比如自己镜像`x/shootX/flipSprite`；
- 单位的`range`和`maxRange`不会自动更新，即使你设置lifetime和speed提高了武器子弹的射程。你需要手动更新；
- 类似地，单位更改了类型后，字段也不会自动赋值，比如把尖刀变成海军默认仍然会被淹死；
- 方块和单位的`clipSize`也不会更新，即使你扩大了它们的渲染范围。手动赋值之；
- 很多消耗器在不支持的方块上不会工作。通常来说，如果原版没有类似设计，则可能支持不会很好；
- 不可重新设置方块的尺寸，否则会崩溃存档。并且大部分物流方块变大并没有意义；
- 有依赖关系的值统统不会自动重设。例如，更改方块的建筑需要并不会更新它的建造时间；（译者注：原版方块建造时间是根据需要物品算出来的，而不是自己设置的）
- 环境静态方块不可使用非环境页的纹理。换而言之，你可以让草地使用雪地的贴图，但是不能使用路由器的贴图，否则会显示错误；（译者注：根据渲染时如何更新，原版贴图分为五个页表，分别为`main` `environment` `editor` `ui` `rubble`，在不同渲染阶段只能使用一张页表。所以渲染环境方块的时候不能使用主页表里的贴图，反之也不可以）
- 应用补丁后不会加载贴图。例如，你修改了`DrawRegion`的`name`·，会没有任何效果，因为游戏不会再加载贴图了；
- 提高单位或方块的最大生命值不会提升已有实体的生命值，但降低确实可以立即造成伤害；
- 补丁很有可能会炸端或卡死。如果发生请立即报告，但要记住我不会什么都修的——别太离谱，像是说“我生成了九十亿的子弹然后游戏卡死了”。

# Extra Examples

## '双管生万物'

```hjson
//再说一遍，命名可有可无，但方便在补丁页面查看
name: Duofication

item: {
  //“裂变产物是个没有用的物品，所以用它作演示
  fissile-matter: {
    //把显示名字改成Duo
    localizedName: Duo
    //取消它的隐藏
    hidden: false
    //把游戏里围标改成'duo-preview'，是双管使用的
    fullIcon: duo-preview
    //把UI图标改成'block-duo-ui'，这也是双管使用的
    uiIcon: block-duo-ui
  }
}

block: {
  //编辑“粉碎机”
  pulverizer: {
    //改名字
    localizedName: Duo Factory
    //重写消耗器
    consumes: {
      //删除先前所有消耗器，如果不写，还是会消耗废料
      //你可以通过`remove: 某物品`来只删除某物品（译者注：此处不明是填字符串还是列表）
      remove: all
      //每次消耗一个铜
      item: copper
    }
    //更改UI图标
    uiIcon: block-duo-ui
    //更改贴图
    region: block-duo-full
    //输出一个“裂变产物”虽然之前已经命名成Duo了
    //注意outputItems是一个列表
    outputItems: [fissile-matter/1]
    //定义绘制器
    drawer: [
      {
        //第一步就是简单的DrawRegion，画了一张'block-1'贴图，这是1x1炮塔的底座
        type: DrawRegion
        name: block-1
      }
      {
        //再画一张速度为1旋转的'duo-preview'
        type: DrawRegion
        rotateSpeed: 1
        name: duo-preview
      }
    ]
  }

}

unit: {
  //修改“尖刀”
  dagger: {
    //把身体主体改成duo-preview
    region: duo-preview
    //重定义武器，这会删除所有原来的武器
    weapons: [
      //每个武器自己是一个对象，所以分别用{}括上
      {
        //武器居中
        x: 0
        y: 0
        //CD为20刻，即1/3秒
        reload: 20
        //3.5世界单位长度间隔的两个炮管交替射击
        shoot: {
          type: ShootAlternate
          spread: 3.5
        }

        //定义武器发射的子弹
        bullet: {
          //贴图的尺寸，仍然以世界单位计算
          width: 7
          height: 9
          //子弹寿命，1秒
          lifetime: 60
          //子弹颜色，使用十六进制色
          frontColor: eac1a8
          backColor: d39169
        }
      }
    ]
  }
}
```

## 修改炮塔子弹

```hjson
block.fuse.ammoTypes: {
  //移除此项，使用"-"
  titanium: "-"
  //添加发射激光的巨浪合金
  surge-alloy: {
    type: LaserBulletType
    //每次射击消耗1物品
    ammoMultiplier: 1
    //CD减少一半
    reloadMultiplier: 0.5
    damage: 100
    //让颜色看起来很吓人
    colors: ["000000", "ff0000", "ffffff"]
  }
}
```

## 添加单位能力

```hjson
//给“恒星”添加新能力，注意.+
unit.pulsar.abilities.+: [
  {
    type: ForceFieldAbility
    //盾量最大1000
    max: 1000
  }
]

```

## Adding Unit Plans

```hjson
//让陆军工厂生产星辉
block.ground-factory.plans.+: {
  unit: flare
  //需要十个巨浪合金
  requirements: [surge-alloy/10]
  //需要100刻
  time: 100
}
```

## 修改单位工厂配方

```hjson
//让尖刀，也就是第一个配方（Java中从0开始数）的生产时间为1秒
block.ground-factory.plans.0.time: 60
```

## 修改方块造价

```hjson
//让双管炮造价为5个钛和20个巨浪合金
block.duo.requirements: [titanium/5, surge-alloy/20]
```