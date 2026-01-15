# 模组安装包结构

::: warning 注意
请把此节内容与 **“Java项目的文件结构”** 区分开，本节讲的是游戏可以运行的模组文件的内部结构。
:::

## 目录结构

你的模组安装包必须遵循一定的结构，经由这些结构，游戏才能识别出你的模组中的内容。

以下为Mindustry中JSON及Javascript模组的目录结构：

  * mod.(h)json (必需) 是模组的配置数据；
  * bundles/ 目录是语言文件；
  * content/ 目录是JSON代码；
  * maps/ 目录是地图文件；
  * musics/ 目录是音乐文件；
  * sounds/ 目录是音效文件；
  * schematics/ 目录是蓝图文件；
  * scripts/ 目录是Javascript文件；
  * sprites-override/ 目录是**覆盖原版**的贴图文件；
  * sprites/ 目录是模组的贴图文件。
  
只有`mod.(h)json`是模组的必需文件，其他目录都可以按需创建。

此外，对于Java（Kotlin）模组而言，编译出的`jar`文件的实质是`zip`文件，以上内容在`jar`模组中结构相同，不同之处在于`jar`文件通常会携带`class`文件和`classes.dex`，以让游戏加载其中的Java代码。

## `mod.hjson`

`mod.hjson`是模组的配置文件，其中包含了模组的基本信息：

``` hjson
displayName: "示例模组"
name: "turorial-mod"
author: "LEARN-MINDUSTRY-MOD"
main: "turorial.TurorialMod"
description: "A Mindustry mod for tutorial."
version: 1.0
minGameVersion: 154
java: true
```

* `name` 内部名称：将用于引用你的模组，所以请小心命名，**只能** 包含英文数字及连字符。**游戏会自动将大写字母转成小写，空格转为连字符。以接下来的篇章中我们将用`modName`指称此项**；
* `displayName` 显示名称：将用于在界面上显示你的模组的名字 ，支持任何Unicode字符。目前原版没有多语言的功能；
* `author` 作者：填写作者的名字；
* `version` 版本：是一个字符串，填写模组版本。 **由于是字符串，所以不支持比较大小**；
* `description` 描述：会出现在游戏内模组管理器中，同样不支持多语言；
* `dependencies` 依赖项：标记此模组以某模组的加载为先决条件，以确保此模组加载时依赖的模组已经被加载了；
* `minGameVersion` 最低版本：是模组可以被加载的最低版本，Java模组目前为146；
* `hidden` 是否隐藏：影响模组能否用于多人游戏，默认为 false；
* `java` ：用于标记本模组是Java模组；
* `main` ：**主类的全限定名**，见于第二节。

`mod.hjson`并不是只有这些内容可以填写，对于初学者不太实用的部分将会到第七章时解析源代码时揭晓。

## 其他文件夹

对于`maps/` `schematics/` `sounds/` `musics/`这四个文件夹，你只需要在对应文件夹里放上对应格式的文件即可。

对于`bundles/`文件夹，其中的文件都是`properties`格式。作为语言文件，不同的文件名代表着不同的语言。例如，`bundle.properties`代表英文，而`bundle_zh_CN.properties`代表中文。

对于`contents/`文件夹，是JSON模组的文件。对于`scripts/`文件夹，是Javascript模组的文件。游戏本身没有禁止模组使用多种编程语言。

对于`sprites/`和`sprites-override/`两个文件夹，它们有两个不同点：

- `sprites/`可以认为是你模组的贴图，而`sprites-override/`用于覆盖原版贴图；
- `sprites/`中的贴图在引用时需要加上你的`modName`前缀，而`sprites-override/`不需要。
  
实际上，游戏中所有贴图都被打包进入同一个**图集册（Atlas）**。在图集册中，又根据使用频率的不同，将贴图分为四个不同的**分页类型（PageType）**，即主页（main）、环境页（environment）、UI页（ui）和水洼页（rubble），是根据贴图路径进行划分的。如果出现了跨页，如绘制地板时用的贴图在主页，会产生一张“Wrong Texture Place”的贴图。此机制的影响将在后方展开。