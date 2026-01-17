# Gradle 环境与 Java/Kotlin

> ***万丈高楼平地起。***

::: info 
**该节需要你拥有电脑，或者至少已经在Android设备上部署了Linux环境。有关纯安卓设备部署开发环境请参阅第四节 [如果你只有安卓设备](4-build-on-android) 。**
:::

Mindustry是一个Java游戏项目，尽管其搭载了JavaScript引擎 *rhino*，但是我们仍然更加建议使用性能更优、可维护性更强的Java或Kotlin进行开发。

从零开始生成一个可用的模组文件较为复杂，因此，本章将会提供一个开箱即用的 **模板（Template）** ，帮助你跳过生成项目这一步。 

## 安装JDK（Java Development Kit）

无论您做什么，基本的运行环境————Java是不可或缺的。`JDK`即为Java开发的基础套件，它包含了Java编译器（`javac`）、Java运行时环境（`JRE`）等工具。

对于将使用到的JDK版本，你可以在`JDK 8`及以上自由选择java版本，一般来说我们建议使用最新的长期支持版本（LTS），目前最新的LTS版本为JDK 25，本教程的 Java 模组开发也是基于**Java 25**的。

需要指出的是，`JDK`只是功能上的描述，实际上有多个厂商的JDK发行版可供选择，一般来说被广泛使用的有OracleJDK、Adoptium及GraalVM等。

本教程推荐在`Windows`或`macOS`尽量使用OracleJDK，因为其安装最简单。在`Linux`平台上，OracleJDK是安装包直装的，如果想要更高的性能，可以考虑使用`GraalVM`。


[**OracleJDK**](https://www.oracle.com/java/technologies/javase-jdk21-downloads.html)的安装方式较为简单，它为Windows平台及Linux平台都提供了快速安装的发行包。

::: info **Windows**

通过上述链接前往Oracle官网，一般来说Oracle只会提供最新的两个LTS版本和最新版本的下载链接，选择最新的LTS版本，点击下载链接，先选择系统，再选择`Windows x64 Installer（.exe）`进行下载：

![download-oracle](./imgs/download-oracle.png)

下载完成后，右键点击安装包，选择“以管理员身份运行”，你不需要做什么额外的设置，一路按照默认设置点击【下一步】直到安装完成即可。

:::

::: info **macOS**

通过上述链接前往Oracle官网，一般来说Oracle只会提供最新的两个LTS版本和最新版本的下载链接，选择最新的LTS版本，点击下载链接，先选择系统，再选择`ARM64 DMG Installer`或`x64 DMG Installer`（根据机型）进行下载：

![download-oracle](./imgs/download-oracle.png)

下载完成后，打开`.dmg`文件，运行其中的`.pkg`文件，一路按照默认设置点击【下一步】直到安装完成即可。

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
java version "25.0.1" 2025-10-21 LTS
Java(TM) SE Runtime Environment (build 25.0.1+8-LTS-27)
Java HotSpot(TM) 64-Bit Server VM (build 25.0.1+8-LTS-27, mixed mode, sharing)
```

## IDEA

接下来，你还需要安装 **IntelliJ IDEA** 这一软件，它是一款**IDE（集成开发环境）软件**，包括高亮、语法纠错、代码跳转等记事本不具备的高级功能，在各种体验上均优于其他IDE，**毫无疑问，每个人都会说IDEA是Java开发的神** 。

关于其安装方法，本教程将不再赘述，请自行百度或访问以下外链：

+ [Windows端](https://blog.csdn.net/m0_37220730/article/details/107589690)
+ [macOS端](https://blog.csdn.net/m0_37220730/article/details/107589690)
+ [Linux端](https://blog.csdn.net/m0_37220730/article/details/107589690)

**如果你是Windows系统，下载之后的第一件事，是在设置中转到“编辑器-文件编码”，将“文件编码”、“项目编码”、和“属性文件的默认编码”全都改成“UTF-8”，否则你的模组将无法正常显示中文。**

## Android SDK

只有正确地配置Android SDK，你才能在本地编译出可以运行在安卓设备上的模组。

当然，这并不是唯一让模组能在安卓设备上运行的方法。你也可以考虑使用 **Github Action** 进行在线编译，见于[后文](./2-anuke-template.md)。

我们将采用安装Android Studio的方式安装Android SDK：

- 首先，访问[Google官网](https://developer.android.com/studio?hl=zh-cn)，下载最新的Android Studio；
- 安装Android Studio，但不要安装`Android Virtual Device`（对Mindustry模组开发没有用处）；
- 静待其安装完毕，找到Android Studio的设置（与IDEA类似），`Languages & Frameworks -> Android SDK`，记下`Android SDK Location`；
- 访问`Android SDK Location`/build-tools，记下里面最新的版本号；
- 然后，你需要设置环境变量（请自行百度）。**请注意！**Mindustry所需的安卓环境变量和常规有所不同，你需要将`ANDROID_HOME`（而不是ANDROID_SDK_HOME）设置为刚才的`Android SDK Location`。对于`PATH`，你需要追加`%ANDROID_HOME%\build-tools\刚才记下的版本号\`（Windows）或`$ANDROID_SDK_HOME/build-tools/刚才记下的版本号/`。

## Gradle和Kotlin

::: info
在正常的模组开发过程中，其实没有必要安装这两者。不过，安装这两者可能更有利于在命令行中进行开发。下面介绍这两个工具。
:::

### Gradle
Gradle是一个现代Java构建工具，它可以帮助我们自动化构建、测试和发布Java/Kotlin项目。在我们会用到的Mod项目模板里已经打包并配置了Gradle Wrapper，因此我们无需安装Gradle。

Gradle的构建逻辑通过**构建脚本**定义，即项目文件下的文件`build.gradle`中编写的内容，在模板项目中同样已经为我们配置好了Gradle的构建脚本。

我们一般不需要配置太多关于Gradle的操作，如果对有关gradle的具体内容有兴趣，可以前往Gradle网站：[https://gradle.org/](https://gradle.org/)

### Kotlin

Kotlin是Java的延伸，你可以使用Kotlin来无缝编写运行在JVM上的项目，并与Java项目可以无缝衔接。

我们会比较建议你使用Kotlin进行开发，更加现代化的语法特性能较大程度的改善你的开发体验。

在Windows上，一般建议伴随IDE环境共同安装Kotlin，`IntelliJ IDEA`会内置Kotlin。在Linux上则可以安装`kotlin`命令行工具，Kotlin的安装会相当方便。

```bash
#Debian或Ubuntu
sudo apt install kotlin
```
```bash
#Arch Linux
sudo pacman -S kotlin
```
```bash
#使用Sdkman
curl -s https://get.sdkman.io | bash
sdk install kotlin
```
