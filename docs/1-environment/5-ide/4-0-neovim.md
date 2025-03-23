# Neovim

> [!IMPORTANT]
> 需要Lua基础和vim基础

2025-03-22 Novarc

<GitHubCard repo="neovim/neovim"/>
![Neovim](./imgs/logos/neovim-logo.svg)
Neovim 是一款现代化、高效且功能丰富的编辑器，完全兼容 Vim。它支持插件、图形界面、语言服务器协议（LSP）、Lua 编程语言等功能。

::: details 预览

:::

# 命令行安装
Nvim安装需要很多辅助的库
git gcc ripgrep fd unzip tree-sitter luarocks
安装Neovim
:::: tabs

::: tab "Windows" id="windows"
## 使用安装包
[stable版本位置](https://github.com/neovim/neovim/releases/tag/stable)
下面选择zip/msi安装
### Zip
[镜像下载地址](https://github.tbedu.top/https://github.com/neovim/neovim/releases/download/stable/nvim-win64.zip)
自行解压
### MSI
[镜像下载地址](https://github.tbedu.top/https://github.com/neovim/neovim/releases/download/stable/nvim-win64.msi)
自行运行

## 从包管理工具安装
关于包管理工具请看前面教程
环境安装
### 使用Scoop
```shell
scoop install git gcc ripgrep fd unzip tree-sitter luarocks
```
```shell
scoop install neovim
```

### 使用Winget
```shell
winget install Neovim.Neovim
```
> [!NOTE]
> **自行添加进环境变量**
:::

::: tab "Debian/Ubuntu" id="debian"
```shell
sudo apt install neovim
```
:::

::: tab "Arch Linux" id="arch"
```shell
sudo pacman -S neovim
```
:::

::: tab "Termux" id="termux"
```shell
pkg install neovim
```
:::

::::


> [!TIP]
> 长期在图形化界面使用**neovim**非常非常推荐安装**GUI客户端**
> Termux无容器不支持GUI!
> 安卓上运行的Linux也不建议使用**GUI**

# GUI安装
有非常多Neovim GUI客户端
下面给出一些
## nvim-qt
## neovide
> [!NOTE]
> neovide需要neovim `0.10`及以上

<GitHubCard repo="neovide/neovide"/>
:::: tabs

::: tab "Windows" id="windows"

> [!NOTE]
> **自行添加进环境变量**
:::

::: tab "Debian/Ubuntu" id="debian"
```shell
sudo apt install neovim
```
:::

::: tab "Arch Linux" id="arch"
```shell
sudo pacman -S neovide
```
如果需要在X11下运行 还需要`libxkbcommon-x11`
```shell
sudo pacman -S libxkbcommon-x11
```
:::

::: tab "Termux" id="termux"
无容器Termux无GUI不支持
:::

::::

# 配置
Neovim配置比较复杂
下面有一些常用的第三方配置
## AstroNvim
[AstroNvim](./4-1-astro-nvim.md)
