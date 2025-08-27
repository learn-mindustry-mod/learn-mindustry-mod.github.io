# 模组安装包结构

::: warning 注意
请把此节内容与 **“Java项目的文件结构”** 区分开，本节讲的是游戏可以运行的模组文件的内部结构。
:::

## 目录结构

一个模组是怎样被加载的？或者是问，游戏如何在不提前知道你的模组内容的情况下却能加载你的模组呢？答案很简单———你的模组安装包必须遵循一定的结构。通过这些结构，游戏就能识别出你的模组中的内容。

以下为Mindustry模组的目录结构：

  * mod.(h)json (必须) 是你模组的配置数据,
  * content/ 目录是JSON代码,
  * maps/ 目录是游戏内地图,
  * bundles/ 目录是语言文件,
  * sounds/ 目录是音效文件,
  * schematics/ 目录是蓝图文件,
  * scripts/ 目录是Javascript文件,
  * sprites-override/ 目录是**覆盖原版**的贴图文件,
  * sprites/ 目录是模组的贴图文件

如果你写的是Java/Kotlin模组，应该知晓`jar`文件就是`zip`文件，`class`文件会按照包路径安置。

并不是所有目录都是必须的，可以按需创建。

## `mod.hjson`

`mod.hjson`，是模组的配置文件，其中包含了游戏的信息，如下例：
``` hjson
displayName: "Tutorial Mod"
name: "turorial-mod"
author: "LEARN-MINDUSTRY-MOD"
main: "turorial.TurorialMod"
description: "A Mindustry mod for tutorial."
version: 1.0
minGameVersion: 151.1
java: true
```
  * `name` 名称：将用于引用你的模组，所以请小心命名，**只能** 包含英文数字及连字符。游戏会自动将大写字母转成小写，空格转为连字符。**我们将用`modName`指称此项**；
  * `displayName` 显示名称：将用于在界面上显示你的模组的名字 ，支持任何Unicode字符；
  * `author` 作者：填写作者的名字；
  * `version` 版本：是一个字符串，填写模组版本。 **由于是字符串，所以不支持比较大小**；
  * `description` 描述：会出现在游戏内模组管理器中，所以务必简明扼要；
  * `dependencies` 依赖项：标记此模组以某模组的加载为先决条件，以确保此模组加载时依赖的模组已经被加载了；
  * `minGameVersion` 最低版本：是模组可以被加载的最低版本，Java模组目前为146；
  * `hidden` 隐藏：影响模组能否用于多人游戏，默认为 false，语言包，js 插件等不影响游戏内容的模组，应为 true；
  * `java` 用于标记本模组是Java模组；
  * `main` **主类的全限定名**，见于第五节。