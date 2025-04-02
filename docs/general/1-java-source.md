Mindustry中的一切，可以说，都是由源代码决定的，这其中也就包括模组的解析，字段的名称与如何被使用，如何显现出其作用，都是如此。这也就意味着，想写好模组，必须以读好源代码为目标。

## 下载源代码
**<font style="color:#d64444;">字多不看懒人版：https://ui.ghproxy.cc/https://github.com/Anuken/Mindustry/archive/master.zip。</font>**

**<font style="color:#d64444;background-color:#36CFC9;">温馨提示：懒是要付出代价的！！！！！</font>**

**<font style="color:#d64444;background-color:#36CFC9;"></font>**

<font style="color:rgb(3, 8, 26);">下载源代码的方法——使用Github下载。</font>  
**<font style="color:rgb(3, 8, 26);">重申一遍</font>**<font style="color:rgb(3, 8, 26);">，解压或反编译apk文件的，解压jar文件的，解压exe/dmg/Linux二进制的，都不是源代码，重申一遍，都不是源代码！</font>  
<font style="color:rgb(3, 8, 26);">Github是一个源代码托管平台，通俗来说就是放源代码的，Mindustry的代码正是托管于Github，所以我们可以直接从Github下载源代码。</font>  
<font style="color:rgb(3, 8, 26);">首先，我们打开网址</font><u><font style="color:blue;">https://github.com/Anuken/Mindustry</font></u><font style="color:rgb(3, 8, 26);"> ，这就是Mindustry项目的网址，接下来，直接点击大大的“Code”，然后点击“Download Zip”即可。</font>  
<font style="color:rgb(3, 8, 26);">如果你是手机端，或是压根打不开Github，则可以使用直链下载：</font><u><font style="color:blue;">https://github.com/Anuken/Mindustry/archive/master.zip</font></u><font style="color:rgb(3, 8, 26);">。</font>

<font style="color:rgb(3, 8, 26);">正常来说你还是打不开，这时我们则需要加速，打开ui.ghproxy.cc，将上文直链复制进去，应该就可以下载了。</font>

<font style="color:rgb(3, 8, 26);">如果你还想下载特定版本的源代码，把master换成你要的版本号即可。</font>

## <font style="color:rgb(3, 8, 26);">找到源代码</font>
下载之后的源代码是一个压缩文件，解压即可。但随即的几千文件，使你就像刘姥姥进大观园，眼花缭乱找不到你要的东西。所以接下来我们的重点就是怎么能找到需要的文件，以及如何看懂它。

打开根目录后，你首先看到的是11个文件夹和16个文件，但实际上，对你而言有用的只有一个——`core/`，其他的并非无用，但你绝对用不上，如果你执意要看剩下十个文件夹是什么，请阅下表：

```plain
.github/ 放置github文件用，即issue模板，Action自动编译
android/ 安卓端编译文件，有安卓启动器和rhino
annotation/ 注解生成器，处理注解并生成正常代码
desktop/ 桌面端编译文件，有桌面启动器和Steam相关代码
fastlane/ 放置一些用于Steam和Google Play的简介
gradle/ 放一个gradle用于编译
ios/ iOS端编译文件，有roboVM文件
server/ 服务器端编译文件，也有服务器的控制文件
tests/ Mindustry的测试用例
tools/ 负责在编译过程中打包贴图，生成实体代码
```



而在core/下，又有三个文件夹，这三个的用处很多：

+ assets/ 下放置一切不是贴图的媒体文件，包括多语言文件（bundles）、音效（sounds）、音乐（music）、地图（maps）等，以及一些不是贴图却被丢进sprites/的东西
+ assets-raw/ 下放置真正的贴图，内有三个文件夹：fontgen/是字体，也就是可爱的alpha娘所在的位置；icons/是游戏内区块的一大堆图标；而sprites/**就是真正的贴图了，看看看看看，一会有大用。**
+ src/mindusry下就是狭义的源代码——只包括java代码——接下来所说的代码文件夹就是这个（core/src/mindustry/）

再详尽介绍`core/src/mindustry/`其实没什么意义了，但我还是想说一下重点：

+ ai/ AI相关代码都在这里，对json模组有用的也就是`ai/types/`里就是能用的AI类型
+ **content/ 内容！超级重要！所有的方块、物品、液体都在这里定义！**
+ ctype/ 全游戏最基本的type，都是_抽象类（Abstract Class）_，所有的type一律继承于此
+ graphics/ 图形，里面的Pal.java或许有点用
+ maps/ 生成器，包括行星的
+ mod/ 模组解析源代码的位置，有能力读明白是再好不过的了
+ type/ **除了方块所有的type**
+ world/ **方块的type所在**

至此对源代码粗略的介绍就完毕了，接下来我们应该整点实用的了。

## 查找源代码
刚才的这些东西，你看不懂也没有关系，因为这不是本文的重点，而接下来的这些，才是前无古人后无来者的狠活。



为什么你要来查源代码呢？我想你的答案多半是别人叫你来的，所以，查源代码到底有什么功用和目的呢，我认为，无非以下几个方面：

+ 想写一个功能与原版方块相同的方块；
+ 想了解字段是怎么作用于type的；
+ 想对你模组内的内容进行一些调整；
+ 想知道自己能调整多少东西，也就是一个type有多少字段；
+ ……



在开始之前，请容许我先讲一些Java中的名词，也就是术语，使用好了这些术语可以让沟通事半功倍：

+ _字段_：也可叫作_变量，_非正式叫法还有_api_，_接口_等(但实际上这两个词的意义并不是这个)。用通俗的话来讲，就是每一个**冒号前面的东西**，也就是_键名_。它是模组内容的属性中用来让你自定义的东西，例如：requirements，health，hasPower等。**你会发现，字段的用处就是，给字段赋值，****<font style="color:#d64444;">然后在方块上面体现出来一些功能</font>****。**
+ _类_：也叫作_类型_，英文解作_Class_，在Mindustry中又有了_Type_的名称。顾名思义，就是你给方块和单位的type字段填写的值。**你会发现，类的用处就是，给方块的type赋完值后，****<font style="color:#d64444;">方块就能执行一定的行为</font>****(**_**比如想合成物品就要GenericCrafter，想要发射物品子弹就要ItemTurret，而液体子弹就要LiquidTurret**_**)，并且，如果type有错误的值(**_**例如给工厂搞来一个ItemTurret**_**)，就不能让方块用你想要的方式去运行。**
+ 继承：要想让类发挥作用，写代码是不可避免的，但是，有的代码被多次使用，这个时候，你让时间就是生命的程序员去重复工作就不可能的，于是，继承就被发明出来了。所谓继承，其实就是让一个功能在多个类里生效，为了这种继承，我们需要在定义类的时候说明白要继承哪一个类，然后，我们再定义**<font style="color:#df2a3f;">被继承的叫基类，而要偷懒的类叫子类</font>****。在定义子类的时候，我们要用形如extends Class这样的咒语。**当然，继承的原因和方式是次要的，而结果才是主要的。

## Vars.content.find()
我们都知道，所有的方块的json文件都有一个字段，就是_type_ 。类的重要意义在上方己有提及，下面就是关于如何找到原版某个方块的类的教学。

### Core.bundle.getByValue(铜墙)
**路径：**`**core/assets/bundles/bundle_zh_CN.properties**`

+ 如果你不知道什么是bundle，请先参见（以后填坑）
+ 首先，你得找到这个文件（废话），如果你找不到，请往文章上看看你用的是不是源代码。
+ 其次，打开你编辑器的搜索功能，一般来说，在桌面端，快捷键为`Ctrl+F`（macOS请用`Command+F`），而在手机端，这个功能有一个放大镜🔍的图标，如果您的编辑器没有这样的功能，请考虑更换。
+ 搜索你想要的方块的中文名，请务必确保每一个字都是正确的，不然就搜不到。然后，定位到形如以下的代码：

```properties
block.copper-wall.name = 铜墙
block.copper-wall-large.name = 大型铜墙
gz.walls = [accent]墙[]可以防止建筑受到伤害。\n在炮塔周围放置一些\uf8ae[accent]铜墙[]。
```

+ 有的搜索，会像铜墙一样搜到一些不是方块名的结果，这些结果可以直接忽略。同时，在这个例子中，铜墙和大型铜墙的 `type` 是一样的，但是其他的字段会有所不同。
+ 经过筛选后，你可以定位到唯一的一行代码，本例中即为 `block.copper-wall.name` 这一行，这里我们只需要看到等号之前的部分。
+ 这行代码是Mindustry多语言的格式，这里粗略处理，只需要看两个**点号**之间的内容，即是你要找的方块的 `name`（交流中可称之为英文名）

### Vars.content.block("copper-wall")
**路径：**`**core/src/mindustry/content/Blocks.java**`

+ 首先，我们要打开这个文件，所有的 Java 代码文件都是纯文本，使用类似 MT管理器的软件都可以直接打开。
+ 再次使用你的搜索功能，搜索上一步获得的 name，你就可以定位到以下几行：

```java
copperWall = new Wall("copper-wall"){{

copperWallLarge = new Wall("copper-wall-large"){{
```

+ 当然，这里的 copperWallLarge 还是对你的干扰项，忽略不计。
+ 要获得方块的 type，仅看这一行就是足够的了。**此方块的**`**type**`**就是跟在 **`**new**`** 的后面，第一个小括号之前的一串英国字，****<font style="color:#df2a3f;">注意大小写。</font>****<font style="color:#262626;">此处就是 Wall 了</font>**

### 附录
当你要搜索一个只由一个词构成的name的时候，你还可能搜到这么一行：（以 duo 为例）

```java
//turrets
duo, scatter, scorch, hail, arc, wave, lancer, swarmer, salvo, fuse, ripple, cyclone, foreshadow, spectre, meltdown, segment, parallax, tsunami,
```

当然你现在可以忽略它，不过这里是 Java 的一个重要组成部分，并且如果你懒得去看bundle可以来这里碰碰运气。不过，这一部分的名称不同于你刚才找的那些，它们**没有连字符，并且每一个单词之间用大写区分**，这种命名方法叫**驼峰命名法**。用驼峰法命名的**方块****实例变量名**在 json 中并没有用。_尽管在 js/java 中直接引用原版内容要用这个东西。_

## copperWall.getFields()
光知道一个方块类是什么，显然是不足以复制出来一个一模一样的方块或加以借鉴的。因为方块还有一堆字段需要设置。

+ 书接上回，我们来到上次查类名的位置：

```java

int wallHealthMultiplier = 4;

copperWall = new Wall("copper-wall"){{
    requirements(Category.defense, with(Items.copper, 6));
    health = 80 * wallHealthMultiplier;
    researchCostMultiplier = 0.1f;
    envDisabled |= Env.scorching;
}};
```

+ 这是除了炮塔以外比较难以分析的一个方块了，所以我们可以逐条讲解。
+ requirements() 是一个较为特殊的方法，主要由三个部分构成。第一部分是 `Category`，这是方块在十个选择栏中的位置，如果你要使用的话，只需把 `Category`. 之后的东西拿去用即可**。一般来说，Java中凡是点号之前的东西一律可以无视。写 json 的时候不要抄进去**。
+ 第二个部分就是`requirements`，一般照着都能看明白，但是不要忘记了json中`requirements`的格式，你可以抄的是其中的数值。
+ 第三个部分可以不出现，如果出现了一般是BuildVisibility.开头，这时需要把点号之后的内给buildVisibility:。
+ 还有一个叫`consumes`的东西，这个在json中的格式也与java中不同，注意理解语义。
+ 对于一般的字段，等号左面的是键名，比如此处的health，此时右侧的值可以直接抄去。
+ 但是，末尾有有f的除外，抄的时候要把f删去。

## content.Fx.load()
此处本应继续说类里面的注释与字段的，但是还有一个重要的需求我没有说动，那就是没有name的一些内容我们也需要，但是版本的变动常常会导致这部分内容的更改，所以我们就需要授人以渔，自己去从最新的源代码中查找这部分信息。

