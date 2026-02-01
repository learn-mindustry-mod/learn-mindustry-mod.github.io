出于各种原因，本教程现在将Java版本迁回17。在此处保留21/25的安装方法，如果后人决定全圈升级到25，可以直接复制此处的。


本教程推荐在`Windows`或`macOS`尽量使用OracleJDK，因为其安装最简单。在`Linux`平台上，OracleJDK是安装包直装的，如果想要更高的性能，可以考虑使用`GraalVM`。


[**OracleJDK**](https://www.oracle.com/java/technologies/javase-jdk17-downloads.html)的安装方式较为简单，它为Windows平台及Linux平台都提供了快速安装的发行包。

::: info **Windows**

通过上述链接前往Oracle官网，一般来说Oracle只会提供最新的两个LTS版本和最新版本的下载链接，选择最新的LTS版本，点击下载链接，先选择系统，再选择`Windows x64 Installer（.exe）`进行下载：

![download-oracle](../imgs/download-oracle.png)

下载完成后，右键点击安装包，选择“以管理员身份运行”，你不需要做什么额外的设置，一路按照默认设置点击【下一步】直到安装完成即可。

:::

::: info **macOS**

通过上述链接前往Oracle官网，一般来说Oracle只会提供最新的两个LTS版本和最新版本的下载链接，选择最新的LTS版本，点击下载链接，先选择系统，再选择`ARM64 DMG Installer`或`x64 DMG Installer`（根据机型）进行下载：

![download-oracle](../imgs/download-oracle.png)

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