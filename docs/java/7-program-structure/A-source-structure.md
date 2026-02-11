# 游戏编译流程及贴图生成机制

平台特有组：
- `android/`：安卓平台的构建代码、资源文件、多语言支持、图标、以及安卓端的启动器，此外，在安卓平台上还有其特有的`rhino`->`dex`实现；
- `desktop/`：桌面端的构建代码、启动器、以及与Steam交互的代码，包括成就、统计信息、房间、创意工坊；
- `ios/`：iOS端的构建代码、资源文件、多语言支持（尽管没有）、图标、和启动器。iOS端的Mindustry是通过**RoboVM**构建的，该工具可以把Java字节码编译成机器码，可以反射但是没有动态加载类的能力，符合App Store的规范因此可以上架；
- `server/`：服务器端的构建代码、启动器、以及一个启动的示例；
- `fastlane/`：Fastlane是一种自动在Google Play和App Store发布程序的工具，在 Mindustry 中还负责Google Play、App Store和Steam上的描述文本的多语言；
- `jitpack.yml`：JitPack是一种允许开发者自由发布依赖的网站，也就是你的模组依赖的地址，

源代码组：
- `assets/`：原版的资产文件（也可以叫资源文件），包括很多内容；
- `annotations/`：原版所有用到的注解，主要包括网络同步和实体组件的代码生成，也有像`@Load`这样的小功能注解；
- `core/`：原版的核心游戏逻辑代码；
- `tests/`：游戏的测试代码，由于需要测试的代码已经几百万年没有更新了，并且模组测试依赖的三个模组全部停更了，所以暂时没有用处；
- `tools/`：贴图和控制台上文的生成器，在贴图生成方面有巨大作用；
- `servers_v6.json` `servers_v7.json` `servers_be.json`：各个版本的服务器列表，即游戏中社区服务器。
  
构建组：
- `.github/`：Issue和Pull Request示例、Github Action配置、IDEA格式化器配置的存储位置；
- `gradle/`：Gradle Wrapper的存在位置，也就是Gradle的下载器；
- `build.gradle` `settings.gradle` `gradle.properties`：构建脚本；
- `gradlew` `gradlew.bat`：Gradle的可执行文件；

Mindustry采用 **GPLv3** 协议。

此外，还有 `CONTRIBUTING.md` `ISSUES.md` `README.md` `SERVERLIST.md` `TRANSLATING.md` 五个规范性文件，下给出其中英对应版