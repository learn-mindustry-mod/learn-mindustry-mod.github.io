更多信息可以访问官方wiki：[https://mindustrygame.github.io/wiki/modding/1-modding/#content](https://mindustrygame.github.io/wiki/modding/1-modding/#content)

## mod.hjson 文件
在项目的根目录下，"mod.hjson" 文件 是用于表示 mod 的 元信息 (meta data) 的。由 Anuken 的模板提供的默认 mod.hjson 如下：

```python
#the mod name as displayed in-game 显示游戏中的mod名称
displayName: "Java Mod Template"

#the internal name of your mod 您的mod的ID
name: "example-java-mod"

#your name 您 (作者) 的名称
author: "You"

#the fully qualified main class of the mod 您mod的主类的全限定名
main: "example.ExampleJavaMod"

#the mod description as seen in the mod dialog 您的mod的介绍
description: "A Mindustry Java mod template."

#the mod version 您的mod的版本
version: 1.0

#the minimum game build required to run this mod 您mod最低要求游戏版本
minGameVersion: 146

#this is a java mod 这是否为Java mod
java: true
```

#### 背景信息 Background
先介绍一些基本的 Background，如果您已经了解过，可以跳过这部分。

1. **hjson** 是一种基于 json 的人话对象表示语言，并且所有合法的 json 语句在 hjson 里都是合法的。因此，如果您不会使用 hjson 的话，可以直接将 mod.hjson 的内容写上 json  (但不建议修改文件拓展名)。
2. 在 hjson 中可以使用 **注释(Comments)**：
+ 单行注释—— 井号# 或 双斜杠// 表示
+ 多行注释—— 使用 /* 内容 */ 表示

以上 hjson.mod 与如下的 json 语句块等价，如果您不会使用 hjson，可以直接使用如下的代码：

```json
{
  "displayName": "Java Mod Template",
  "name": "example-java-mod",
  "author": "You",
  "main": "example.ExampleJavaMod",
  "description": "A Mindustry Java mod template.",
  "version": 1.0,
  "minGameVersion": 136,
  "java": true
}
```

更多具体关于 hjson 的信息，您可以查阅 hjson 的官网：[https://hjson.github.io](https://hjson.github.io/)

3. **全限定名 (fully qualified name)** 是用来确定一个类的，它在运行期和编译期是独一无二的完整名称。

组成方式 = **<font style="color:#E8323C;">包名</font>**** + ****<font style="color:#E8323C;">类名</font>**

例如，这里 Anuken 提供的模板中，包(package) 名为 example，类名为 ExampleJavaMod，那么它的全限定名为：example.ExampleJavaMod，并将其填入 mod.hjson 的以 "main"为**键(key)**的**键值对(key-value pair)**的**值(value)** 中去。

全限定名在 mod 中的作用是：告诉 Mindustry 本体，本 mod 的入口是什么，供以使用 **反射(refleaction) 实例化(instantiate)** mod 的主类。因此，我们需要将一个 **继承(extends)** 了 Mod类 (全限定名为mindustry.mod.Mod) 的一个类的全限定名放入 mod.hjson 供以 Mindustry 本体识别

正如 Anuken 提供的模板中的文件 **src/example/ExampleJavaMod.java** 中一样：

```java
package example;
import mindustry.mod.Mod;

public class ExampleJavaMod extends Mod {
    
    public ExampleJavaMod() {    }
}
```

#### 注意事项：
1. 在mod.hjson中，**name** 即 **ModID**，请全部使用 **小写英文字母**，请将** 空格 **替换为 **连字符(hyphen，即-)**。
2. 请严格保证全限定名和实际文件路径的对应关系，具体来说，如果手动压缩，请不要压缩文件夹，而是选中文件夹中所有文件并压缩，否则会找不到你的主类。

以上，就是对于 mod.hjson 的解释了，您可以根据自己的需求，自行填写。

## src 文件夹
位于根目录下的 src 文件夹内包含着用于 **编译(Compile) **成 class字节码 文件的所有类。

**<font style="color:#E8323C;">注：从现在起，本篇教程中任何与 Java 代码有关的文件，在没有特殊说明的情形下，均在 src 目录 或其 子目录 下。</font>**

位于 **example **包中的 **ExampleJavaMod.java** 文件，是模板提供的默认的 mod 主类。具体内容如下，您可以通过 IDEA 打开本文件。

```java
package example;

import arc.Core;
import arc.Events;
import arc.util.Log;
import arc.util.Time;
import mindustry.game.EventType.ClientLoadEvent;
import mindustry.mod.Mod;
import mindustry.ui.dialogs.BaseDialog;

public class ExampleJavaMod extends Mod {

    public ExampleJavaMod() {
        Log.info("Loaded ExampleJavaMod constructor.");

        //listen for game load event
        Events.on(ClientLoadEvent.class, e -> {
            //show dialog upon startup
            Time.runTask(10f, () -> {
                BaseDialog dialog = new BaseDialog("frog");
                dialog.cont.add("behold").row();
                //mod sprites are prefixed with the mod name (this mod is called 'example-java-mod' in its config)
                dialog.cont.image(Core.atlas.find("example-java-mod-frog")).pad(20f).row();
                dialog.cont.button("I see", dialog::hide).size(100f, 50f);
                dialog.show();
            });
        });
    }

    @Override
    public void loadContent() {
        Log.info("Loading some example content.");
    }

}
```

这个类 **继承(extends)** 了 Mod 类，该类的全限定名需填入 mod.hjson 中的 "main" 键值对 中。

如果您需要使用自定义的主类，**请记得**：

1. 使其继承 Mod 类
2. 在 mod.hjson 的 "main" 里填入对应的全限定名。

## assets 文件夹
位于根目录下的 **assets** 文件夹内，包含着用于打包进入 **Jar** 包的所有资源文件。注意，此文件夹下所有文件**<font style="color:#DF2A3F;">都会原封不动</font>**添加到模组文件内，因此你也可以考虑把mod.hjson放到assets/下。

### sprites
其中位于 **assets/sprites** 文件夹 (若该文件夹不存在，请创建) 下的所有png文件，都会以贴图的形式加载入游戏中，您可以在代码中使用以下方式进行访问：

```java
TextureRegion texture = Core.atlas.find("贴图名称(无需加上.png)");
```

为[物品](https://www.yuque.com/liplum/nncx8g/gq89hy#lbf37)、方块、实体等添加的贴图都需要放在这里，用以让 Gradle Task 打包入最终 mod 的 Jar 里。

### bundles
可以在 **assets/bundles **文件夹 (若该文件夹不存在，请创建) 放入关于 **i18n (Internaltionization 国际化) **相关的**语言文件**，用以进行 **本地化(Localization)**。

**<font style="color:#E8323C;">注：因为是 本地化文件 本身就旨在提供 多语言服务，请您务必提前将 该类 文件 的 编码格式 改为 UTF-8，以防出现 乱码 或 无法识别的字符——导致游戏无法读取的，在游戏中表现为 ??????</font>**

**<font style="color:#E8323C;">且一定要注意，如果您已经使用其他编码格式编写过 本地化文件，请先尝试复制文本内容，然后再修改编码格式——防止已有的 本地化文件内容 全部变成 乱码。</font>**

可以使用如下方式在代码中访问：

```java
String text = Core.bundle.get("这是在Bundles里的key");
String text = Core.bundle.format("这是在Bundles里的key","这是可变长度的额外的参数");
```

关于 assets 的更多信息，会在[之后的章节](https://www.yuque.com/liplum/nncx8g/gq89hy#qUGmo)进行介绍

## build.gradle 文件
Mod 项目本质上是一个 Gradle 项目，所以您使用 build.gradle 来管理项目是必要的。

此文件可以用于管理 Gradle 项目/库 间的依赖关系，作为自动化脚本等。

这个文件非常重要，如果您之前未接触过 Java 或 Gradle，请不要随意改变该文件的内容。之后，本教程会按照需要对该文件进行必要地修改。

