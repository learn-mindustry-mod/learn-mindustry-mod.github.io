## 引言
本文主要介绍 如何使用 Anuken 提供的 Mod 开发模板 在 IntelliJ IDEA 上构建 mod开发环境

您可能在此过程中需要外国网站，请确保您拥有此能力或合理使用网络辅助工具，此后，本文默认您能正常访问相关网站。

更多信息可以访问官方wiki：[https://mindustrygame.github.io/wiki/modding/1-modding/#content](https://mindustrygame.github.io/wiki/modding/1-modding/#content)

## 下载
Mindustry 主要作者 Anuken 在 Github 上提供了 Mod 开发环境的模板，该模板已经为您**大致**配置好了Mod开发需要的依赖与库。

下载地址：[https://github.com/Anuken/MindustryJavaModTemplate](https://github.com/Anuken/MindustryJavaModTemplate)

打开上述地址，点击 "Code" 然后 点击 "Download ZIP"，将代码作为 zip压缩文件 的形式下载下来。**如果您会使用 Github，可以使用 git clone 或 Github 的 "Use this template" 功能。**

![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648273169352-b386aeb0-5618-4745-8a49-1f76963304ed.png)

## 构建
然后解压该压缩包。之后，双击点击 "build.gradle"文件，如果您的 IDEA 在安装时使用默认设置的话，会自动为您把 ".gradle"拓展名 的文件的打开方式设置为 IDEA的。如若不是，请手动使用右键菜单，将文件的打开方式设置为 IntelliJ IDEA。

注：如果您在这步上依然存在问题，请查阅本文中 手动创建项目 一章

![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648273915951-28f43c5c-5ad4-4e31-8309-a22c7a5afac5.png)

之后，IDEA 会自动为您构建 Gradle 项目，联网下载必要的依赖库(例如 Mindustry 的核心库 Core)。如果您的网络状态良好，且一直保持畅通，那么会在等待一段时间后完毕。

**此时要格外注意：若**`mindustryVersion`**变量的值不是最新的，请手动改为当前版本，只有这样，IDEA才能为您正确配置最新版本的功能。如果你不明白，请参见下方错误编号B更改。**

如果您在构建过程中出现错误(或即使没有报错)，还**<font style="color:#DF2A3F;">请您先检查项目的 JDK 版本有没有正确设置（特别重要，因为已经有人踩坑了）</font>**。请打开：

FIle >> Project Structure（文件>>项目结构）

![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648274275813-53388818-0c94-49fd-8e51-1e4ae9a296a1.png)

然后在弹出的窗口中选择 Project（项目） 子标签页，检查是否使用了正确的 Java SDK。

新版本建议直接采用 Java 17 版本（~~_由E.B.Wilson_~~推荐 GraalVM_ ）_Language Level（语言级别）推荐保持默认。

（图中，普冷姆使用的是 Java 1.8 和 使用了 Language Level 8。）

![您可以使用您喜欢的 Java 版本](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648274135355-734b3468-5da7-46e5-a262-0d2e3484d769.png)

现在，我们的Gradle环境已经构建好了。![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648274674928-e3f4f651-2b01-4489-af47-2e4f0c026cd3.png)

如图所示，该模板为您提供了 作为mod所需的 一些基础的 文件和配置，图中红色线框部分为 您需要重点关注的几个文件，普冷姆会在稍后的章节为您介绍这些文件的含义与作用。

## 尝试生成 Jar 包
此步的目的并非是教学"如何导出 Jar 包供以游玩"，而是"测试您的环境是否正常，是否还需要根据不同的设备或情形进行修改"。

默认可以在 IDEA 窗口的侧边栏中找到 Gradle 图标，单击打开后找到 TutorialMod >> Tasks >> build >> jar 任务，然后双击运行。

![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648274985369-ee46c439-0f95-4ec5-9c4f-046ad3eef2ee.png)



此时，您的底边栏的 Run 标签 会自动弹出，在控制台中打印出运行情况与报错信息(如果有的话)。

介于您是第一次构建项目，这一步可能需要一些时间，请您耐心等待。如果耗时过长，也可能是在编译过程中出现了一些错误。此时需要您手动停止 Task ，并再次运行。

如果您在运行 Task 过程中出现了红色的报错提示或其他异常信息，请与下节的**错误处理**进行核对查阅，否则可以跳过下节。

## 错误处理
#### 错误编号A
运行 Jar 任务时报错：

> **<font style="color:#F5222D;">invalid flag: --release</font>**
>

![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648275685880-712b9779-b834-4337-ad4e-fb1922c28801.png)

解决路线：

因为您可能使用了 Java 8 SDK 进行开发，所以请在FIle >> Project Structure >> SDK（文件>>项目结构>>SDK）中下载 JDK 17。

#### 错误编号B
> Could not find flabel-v146.jar (com.github.Anuken.Arc:flabel:v146).
>
> Searched in the following locations:
>
>     [https://www.jitpack.io/com/github/Anuken/Arc/flabel/v146/flabel-v146.jar](https://www.jitpack.io/com/github/Anuken/Arc/flabel/v146/flabel-v146.jar)
>
> 
>
> Possible solution:
>
>  - Declare repository providing the artifact, see the documentation at [https://docs.gradle.org/current/userguide/declaring_repositories.html](https://docs.gradle.org/current/userguide/declaring_repositories.html)
>

即使您的网络一切正常，此错误也是不可避免的，因为这出自Anuke的错误。请在build.gradle找到如下内容

```groovy
dependencies{
    compileOnly "com.github.Anuken.Arc:arc-core:$mindustryVersion"
    compileOnly "com.github.Anuken.Mindustry:core:$mindustryVersion"

    annotationProcessor "com.github.Anuken:jabel:$jabelVersion"
}
```

然后改为

```groovy
dependencies{
    compileOnly "com.github.Anuken.Arc:arc-core:$mindustryVersion"
    compileOnly ("com.github.Anuken.Mindustry:core:$mindustryVersion"){
        exclude group: 'com.github.Anuken.Arc', module: 'flabel'
    }

    annotationProcessor "com.github.Anuken:jabel:$jabelVersion"
}
```

#### 错误编号J
![](https://cdn.nlark.com/yuque/0/2025/png/32523625/1739760411319-3e8ae4a6-0829-48f5-8b33-8fb65e725004.png)解决路线：检查源代码，您是不是更改了以下内容：

```plain
//java 8 backwards compatibility flag
allprojects{
    tasks.withType(JavaCompile){
        options.compilerArgs.addAll(['--release', '8'])
        options.compilerArgs.addAll(['--release', '17'])
    }
}
```

那我问你，你有没有老老实实地按照上文检查**<font style="color:#DF2A3F;"> </font>****<font style="color:#DF2A3F;">JDK 版本</font>****。**

实际上开发过程中，你会使用一些Java 9及以上版本的语法，所以你会尝试更改此项。但这是没有必要的，你只需要确保**<font style="color:#DF2A3F;">Jabel</font>**的正确安装和**<font style="color:#DF2A3F;"> </font>****<font style="color:#DF2A3F;">JDK 版本</font>**的正确设置即可。

关于jabel的安装，参见原版build.gradle。（请练习ctrl-F）

#### 错误编号N
> **<font style="color:#DF2A3F;">Connect timed out</font>**
>

> <font style="color:#DF2A3F;">Unknown host 'services.gradle.org'.</font>
>
> 
>
> Please ensure the host name is correct. If you are behind an HTTP proxy, please configure the proxy settings either in IDE or Gradle.
>

> Execution failed for task ':compileJava'.
>
> > <font style="color:#DF2A3F;">Could not resolve all files for configuration ':compileClasspath'.</font>
>
>    > Could not download arc-core-v146.jar (com.github.Anuken.Arc:arc-core:v146)
>
>       > Could not get resource '[https://www.jitpack.io/com/github/Anuken/Arc/arc-core/v146/arc-core-v146.jar'.](https://www.jitpack.io/com/github/Anuken/Arc/arc-core/v146/arc-core-v146.jar'.)
>
>          > Could not GET '[https://www.jitpack.io/com/github/Anuken/Arc/arc-core/v146/arc-core-v146.jar'.](https://www.jitpack.io/com/github/Anuken/Arc/arc-core/v146/arc-core-v146.jar'.)
>
>             > The server may not support the client's requested TLS protocol versions: (TLSv1.2, TLSv1.3). You may need to configure the client to allow other protocols to be used. See: [https://docs.gradle.org/7.5.1/userguide/build_environment.html#gradle_system_properties](https://docs.gradle.org/7.5.1/userguide/build_environment.html#gradle_system_properties)
>
>                > Remote host terminated the handshake
>

如果出现以上问题，你应当考虑检查你的网络设置，或者采取一些措施改善网络连接。





#### 


### 本地依赖
**如果上述方法均无法使用：**

**<font style="color:#DF2A3F;">警告：在某些原教旨主义者眼中这是一种</font>****<font style="color:#DF2A3F;">歪门邪道</font>****<font style="color:#DF2A3F;">，但是它确实不影响任何二进制兼容性，只是</font>****<font style="color:#DF2A3F;">无法使用</font>****<font style="color:#DF2A3F;">后文的方法直接在模组项目的查询源代码中的Javadoc（即注释），因此在网络恢复后推荐撤消此操作，恢复网络依赖。</font>**

如果你实在无法采取任何网络措施，可以考虑采用本地依赖方法。

1. 首先，你应该获取一个原版的 Mindustry 游戏。
2. 然后，检查你的游戏版本：如果你是使用.jar文件启动的，直接使用为个文件；如果你是使用.exe格式启动的（或者您不知道你是什么方式启动的不过如果这样的话还是建议你先去了解一下）请在exe同名目录下寻找bin/desktop.jar并使用之。；如果你是macOS或者Linux用户，请直接殴打作者并报警（macOS需要在app处右键-显示包内容，然后在Contents/Resources下）
3. 再然后，在项目文件夹下新建libs文件夹，把你的jar文件复制到其中
4. 最后，打开build.gradle文件，找到如下内容：

```groovy
dependencies{
    compileOnly "com.github.Anuken.Arc:arc-core:$mindustryVersion"
    compileOnly "com.github.Anuken.Mindustry:core:$mindustryVersion"

    annotationProcessor "com.github.Anuken:jabel:$jabelVersion"
}
```

    改成

```groovy
dependencies{
    compileOnly fileTree(dir: 'libs', include: ['*.jar'])
    
    annotationProcessor "com.github.Anuken:jabel:$jabelVersion"
}
```

## 检查生成的 Jar 包
当您在控制台中看到如下的结果 (<尖括号>内的是普冷姆进行额外的解释，并非控制台内的真实内容)，和 "**BUILD SUCCESSFUL**"，即代表您成功生成了 Jar 包。

> <您的时间>: Executing 'jar <额外参数>'...
>
> Task :compileJava  
Task :processResources NO-SOURCE  
Task :classes  
Task :jar UP-TO-DATE  
**<font style="color:#2A4200;">BUILD SUCCESSFUL</font>** in <运行 Task 所花费的时间>  
2 actionable tasks: 1 executed, 1 up-to-date
>

之后，您就可以在 项目的根目录下的`build/libs/`里找到 对应的文件了——文件的默认命名是**您的项目所在根目录**的文件夹。

![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648276634245-e9ac97fb-524c-4c69-af67-9735049ef5d7.png)

接下来，您可以使用 资源管理器(Explorer) 打开其所在的文件夹，然后使用 压缩工具 进行解压缩 或 直接查看文件内容，正常情况时应该如下。

![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648277575204-17b26b26-10fb-4163-99b4-8661a7c51368.png)

之后，您就可以打开游戏，导入刚刚构建好的 Jar 包啦。

熟悉安装Mod的读者，应该会对此步骤比较熟悉，普冷姆再次会再介绍一遍。

在 Mods 对话框中选择 "Import Mod"（导入模组）

![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648278026836-c40916f3-744d-4c9e-83fe-ddd8be70966b.png)

然后选择 "Import File"（从文件导入）

![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648278068967-678c623e-a346-4e0d-b750-6d478b6b6ffa.png)

之后，找到您项目的位置，在 根目录下 build/libs 中，您也可以放在任何您喜欢的位置。点击Load（加载）后，需要重启游戏。

![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648277869365-4d367467-5330-42e3-aa70-bc06fca62eba.png)

重启之后，您就能看到自己的 mod 出现在 Mod 列表中了，这里的名称是 Java Mod Template。至于如何修改 Mod 名称，会在下一章节中介绍。![](https://cdn.nlark.com/yuque/0/2022/png/26678008/1648278220576-b9efd6e8-f19a-4417-b31d-8b09750afd95.png)

## 祝贺自己！ Congratulations!
至此，您已经成功搭建了 Mindustry 的  Mod 开发环境，普冷姆将在下一章节介绍更多关于 Modding 的知识与内容，请您继续阅读。

## 更多信息与帮助 Info
在此向您推荐 普冷姆主要参与开发的mod —— Cyber IO

开源项目地址 [https://github.com/liplum/CyberIO](https://github.com/liplum/CyberIO)，如果这个教程能帮到您，请您别忘了为我的项目点个Star哟qwq。

欢迎加入售后群：1148036147<font style="color:rgba(255, 255, 255, 0.9);">111148036147480361471148036147</font>

