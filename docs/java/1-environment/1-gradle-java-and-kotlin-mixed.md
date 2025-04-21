<!-- 这个是ebw版1.1和硫缺铅版1.1的杂交版，同时重走一遍流程也让我看到了一些问题 -->
<!-- 实际上在这里浪费时间是非常不负责任的，不过我同意折中一下咱俩的意见，当然， -->
<!-- 现在也有一些应该更新的东西了，而且这一篇教程不提模板，何时提模板呢？。 -->
<!-- 有几个小疑问：1. JDK是必装的吗？ -->
# Gradle 环境与 Java/Kotlin

> ***"万丈高楼平地起。"***

::: info 
**该节需要你拥有电脑，或者至少已经在Android设备上部署了Linux环境。有关安卓部署开发环境请跳至第四节 _如果你只有安卓设备_。**
:::

Mindustry是一个Java游戏项目，尽管其具备JavaScript mod接口，但是我们仍然更加建议使用性能更优，可维护性更强的java进行开发。

本篇教程也只会给出Java与Kotlin语言的演示程序与片段，如果你仍然决定使用JavaScript进行开发，可跳过本节阅读下一节：*“javaScript/typeScript开发环境”*。

> 本篇教程会提供一个快速部署开发环境的模板，在进行较高级的操作之前你只需要对其有一定了解即可，不过迟早你需要充分了解整个脚本的。

## 安装JDK（Java Development Kit）

无论您做什么，基本的运行环境————Java是不可或缺的。`JDK`即为Java开发的基础套件，它包含了Java编译器（`javac`）、Java运行时环境（`JRE`）等工具。

<!-- time-limited -->
对于将使用到的JDK版本，你可以在`JDK 8`及以上自由选择java版本，一般来说我们建议使用最新的长期支持版本（LTS），目前最新的LTS版本为JDK 21，本教程的 Java 模组开发也是基于**Java 21**的。如果您曾经安装过Java，也不要高兴的太早；如果不用确定版本，仍然推荐您重新安装。

需要指出的是，`JDK`只是功能上的描述，实际上有多个厂商的JDK发行版可供选择，一般来说被广泛使用的有OracleJDK、Adoptium及GraalVM等。

本教程推荐在`Windows`或`macOS`尽量使用OracleJDK，因为其安装最简单。在`Linux`平台上，OracleJDK是安装包直装的，如果想要更高的性能，可以考虑使用`GraalVM`。


[**OracleJDK**](https://www.oracle.com/java/technologies/javase-jdk21-downloads.html)的安装方式较为简单，它为Windows平台及Linux平台都提供了快速安装的发行包。

::: info **Windows**

通过上述链接前往Oracle官网，一般来说Oracle只会提供最新的两个LTS版本和最新版本的下载链接，选择最新的LTS版本，点击下载链接，选择Windows x64 Installer（.exe）进行下载：

![download-oracle](./imgs/download-oracle.png)

下载完成后，右键点击安装包，选择“以管理员身份运行”，你不需要做什么额外的设置，一路按照默认设置点击【下一步】直到安装完成即可。

:::

::: info **Linux**

Oracle同样为Linux提供了`deb`和`rpm`软件包和，找到符合你系统架构的软件包，下载完成后打开终端，执行以下命令安装：

```bash
sudo dpkg -i 你下载的文件.deb
```

或者

```bash
sudo rpm -i 你下载的文件.rpm
```

:::

无论你通过哪一个方式安装完成JDK，在安装成功后均可通过以下命令检查JDK的安装情况：

```bash
java -version
```

如果你看到类似如下的输出，则说明JDK安装成功：

```
java version "21.0.6" 2025-01-21 LTS
Java(TM) SE Runtime Environment Oracle 21.0.6+8.1 (build 21.0.6+8-LTS-jvmci-23.1-b55)
Java HotSpot(TM) 64-Bit Server VM Oracle 21.0.6+8.1 (build 21.0.6+8-LTS-jvmci-23.1-b55, mixed mode, sharing)
```

## IDEA

安装完Java之后，可以说你的开发环境已经配置完了————至少你现在可以去控制台执行`<gradlew> jar`了。不过，除非你以前是个资深vim程序员，否则不会喜欢在命令行环境下开发的。这时你就需要一个**IDE（集成开发环境）**了。和Java一样，IDE也有许多种，此处我们只探讨 **IntelliJ IDEA** 。

毫无疑问，每一个人都会说**IDEA是Java开发的神**。关于其安装教程并不值得本教程赘述，相关教程网络上已经有很多，请自行百度或选择以下外链观看。不过，有两点注意事项:

+ Mindustry Mod开发只需要**社区版**功能，所以不必费时费力**甚至是费钱**去破解旗舰版；
+ 目前IDEA已经内置中文翻译包，不需要手动下载了。

::: details 外链
+ Windows端：[https://blog.csdn.net/m0_37220730/article/details/107589690]
+ macOS端：[https://blog.csdn.net/jackson_lingua/article/details/145177226]
+ Linux端：[https://blog.csdn.net/qq_43646721/article/details/108152206]
:::

下载完 IDEA 后，推荐您对IDEA的默认设置进行一些调优，避免写出和已有的模组代码风格相违背的代码。调优内容包括插件的安装和错误提示的调整。

<!-- TODO:整理一下，应该就是unused和final最好改一下，不过有待我测试 -->

## Android SDK

**Android SDK**是使模组能够在安卓设备上运行的重要手段。只有正确地配置，才能让编译出来的模组能在安卓设备上运行。

当然，这并不是唯一手段，如果你的电脑硬盘捉襟见肘，也可以考虑使用 **Github Action** 进行在线CI编译，这需要一定使用Github的基础。

由于网络上的安装教程与模组开发所需内容不太相符，并且谷歌已经删除了独立的Android SDK Tools，所以下面我们将介绍其安装方式。

- 首先，访问[此站](https://www.androiddevtools.cn/)，实际上这并非官网，但是这是目前唯一比较快速的的方式了；
- 找到`SDK Tools`，并下载对应操作系统的版本。下载并解压或安装。

## Gradle和Kotlin

::: info
在正常的模组开发过程中，其实没有必要安装这两者。不过，安装这两者可能更有利于在命令行中进行开发。下面介绍这两个工具。
:::

### Gradle
Gradle是一个现代Java构建工具，它可以帮助我们自动化构建、测试和发布Java/Kotlin项目。在我们会用到的Mod项目模板里已经打包并配置了Gradle Wrapper，因此我们无需安装Gradle。

Gradle的构建逻辑通过**构建脚本**定义，即项目文件下的文件`build.gradle`中编写的内容，在模板项目中同样已经为我们配置好了Gradle的构建脚本。

我们一般不需要配置太多关于Gradle的操作，如果对有关gradle的具体内容有兴趣，可以**前往Gradle网站：https://gradle.org/**

### Kotlin

Kotlin是Java的延伸，你可以使用Kotlin来无缝编写运行在jvm上的项目，并与Java项目可以无缝衔接。

我们会比较建议你使用Kotlin进行开发，更加现代化的语法特性能较大程度的改善你的开发体验。

在Windows上，一般建议伴随IDE环境共同安装Kotlin，`IntelliJ IDEA`会内置Kotlin。在Linux上则可以安装`kotlin`命令行工具，Kotlin的安装会相当方便。

::: code-group

```Debian/Ubuntu
sudo apt install kotlin
```

```Arch
sudo pacman -S kotlin
```

```sdkman
curl -s https://get.sdkman.io | bash
sdk install kotlin
```

:::