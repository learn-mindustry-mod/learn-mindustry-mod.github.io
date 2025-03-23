# 常用IDE介绍

开发Mindustry Java Mod需要的IDE
下面介绍一些常用IDE

下面是一个对比表格
| IDE | 介绍 | 特征 | 建议 |
| ------- | :---: | :------: | :-----: |
| **IDEA** | 由JetBrains开发的专业Java/Kt IDE | 强大的功能 简单的配置 | 开发Java/Kt mod的最佳选择 |
| **vscode** | 免费开源的多语音IDE | 需要安装插件配置 较为复杂 | 都能跑vsc了给我用idea去 |
| **Neovim** | Vim的升级版本 | 需要复杂的配置 当然可以使用一些现有配置 | Termux无容器用户的必然选择 Linux命令行用户的选择 低配android跑linux的选择 |
| **AndroidIDE** | 安卓平台上的Java Ide | 本质上是内置了一个Termux 外面提供GUI | 推荐意见暂不清楚 |

> [!TIP]
> 对于无容器的Termux仅能使用Neovim
> 对于安装linux容器的Termux(需要安装桌面)
> 如果配置好可以使用IDEA 6GB运存能基本使用了
> 追求便利/现代可以使用Vscode/code-server
> code-server网页操作上可能有点问题
> 屏幕太小不好操控
> 追求性能和操作可以使用Neovim

# IDEA
![Idea](https://www.jetbrains.com/idea/img/overview-heading-screenshot.png)
**IntelliJ IDEA**
[官网](https://www.jetbrains.com/zh-cn/idea/)
## 介绍
面向专业开发的 IDE
适用于 Java 和 Kotlin
- 卓越的 Java 和 Kotlin 体验 
- 深度代码理解 在每个上下文中提供相关建议，实现极快的导航和智能体验。 
- 开箱即用的无缝体验

> [!NOTE]
> IDEA分为Ultimate(专业版)/Community(社区版)
> 专业版需要付费 功能更加强大
> 但是对于mdt mod开发人员来讲社区版完全够用
> 当然你可以通过education白嫖

## 系统要求
- 64 位 Windows 10 1809 及更高版本，或 Windows Server 2019 及更高版本
- 最低 2 GB 可用 RAM 和 8 GB 系统总 RAM
- 3.5 GB 硬盘空间，推荐 SSD
- 最低屏幕分辨率 1024x768

[IDEA](./2-idea.md)
# Neovim
> [!NOTE]
> neovim配置复杂
> 不推荐新人使用Neovim 
> 如果想要使用neovim的键位
> IDEA有neovim插件 Vscode也有neovim插件

![Neovim](./imgs/logos/neovim-logo.svg)
Neovim 是一款现代化、高效且功能丰富的编辑器，完全兼容 Vim。它支持插件、图形界面、语言服务器协议（LSP）、Lua 编程语言等功能。
Neovim配置主要使用Lua

vim/neovim的优势在于
- 只用键盘很舒服
- 高度可定制性
- 一些高效功能
- 轻量

>[!NOTE]
> 需要注意的是使用vim/neovim能提高部分码字速度
> 但对于大部分人来讲不能提高实际编码速度
> 对于真正熟练的大佬才行
> 编程的大部分时间在思考而非码字
> 纯键盘化操作能带来舒适 繁琐操作鼠标会有一定麻烦

neovim的配置比较繁琐
一些问题也需要自己解决
对于新人还是更适合VSC/IDEA

使用Neovim开发Java Mod使用
`eclipse-jdtls`作为Java的LSP

<GitHubCard repo="eclipse-jdtls/eclipse.jdt.ls"/>

> --Kt 开发环境我还不会配置--

[Neovim](./4-0-neovim.md)
