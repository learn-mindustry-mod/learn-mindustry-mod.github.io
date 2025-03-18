# 使用Android端开发 Mindustry Mod开发教程
写于 **2025-03-01**  
**<font style="color:red;">需要编程基础</font>**

**<font style="color:red;">需要编程基础</font>**

**<font style="color:red;">需要编程基础</font>**

**<font style="color:red;">不要指望AI能写MDT Mod</font>**

**<font style="color:red;">不要指望AI能写MDT Mod</font>**

**<font style="color:red;">不要指望AI能写MDT Mod</font>**

本教程包含  
![](https://skillicons.dev/icons?i=java,js,ts,lua&theme=light)  
![](https://skillicons.dev/icons?i=git,github,neovim&theme=light)

## 预览


![](https://cdn.nlark.com/yuque/0/2025/jpeg/53987275/1740926809488-b88416c7-9c99-424c-a753-ae62bb845d2e.jpeg)![](https://cdn.nlark.com/yuque/0/2025/jpeg/53987275/1740926809571-e37533b1-eda0-4be6-a41c-c5618e04e2d7.jpeg)



## **前言**
当你观看该教程就说明你将使用**Android端** 进行**Mindustry Mod**的开发  
请不用太过担心 只需拥有一定技术 **Android**上进行开发也可以比较顺利

> **Novarc**主要使用**Android**端开发
>

本教程支持以下语言

| 支持性 | 语言 | 介绍 | 本教程实现 | 注意事项 |  |
| --- | --- | --- | --- | --- | --- |
| ✅ | **Java** | 写Mindustry Mod的最佳选择 需要一定的基础 | 基于**Jdtls**和**openjdk-17**进行开发 |  |  |
| ✅ | **JavaScript** | **js**一直处于一个尴尬的地位 其**rhino**运行效率极其低下 比**V8**慢多了 而且有条件的一般选择**java**.**js**则是很多**android**端开发者的无奈之举 基本上都是直接写的 不使用ide | 本教程将基于[Mindustry-types](https://github.com/EmmmM9O/mindustry-types)和**Nodejs** **Prettier** **Eslint**实现了一个使用现代ide进行的js开发 支持类型,代码补全,格式化,语法检查 部分类型 以及使用js生成mod.json和content和bundles | 不推荐使用 建议转java/lua |  |
| ✅ | **TypeScript** | **ts**将是部分不愿转入其他语言的j**s**开发者的一个好的选择 ~~尽管可能变成~~~~**AnyScript**~~ 不过**Ts**开发将拥有强大的类型补全 | 本教程基于[TSMod](https://github.com/EmmmM9O/MindustryTSModTemplate)和上面JS的内容进行开发加入**typescript**相关lsp | 存在部分问题 |  |
| 🚧 | **Lua** | 还在施工的 经过**astro-lua**的测试**Mindustry**拥有使用**LuaJIT**的潜能 可以拥有无与伦比的性能 与C相媲美 和 简单的语法 并且得益于强大的**lua lsp**可以实现顺畅的开发体验 | **lua**相关的Mdt类型文件还在制作中… 全面的**Lua** Mod加载器还在制作中… 本教程将会配置lua lsp并且安装类型文件 | 还在制作 |  |
| ❎ | **Kotlin** | 你是否已经厌倦了Java语法的沟槽？加入KT吧 极致的语法 最漂亮的语言！ | **OH NO** Neovim对kt lsp的支持并不完善 又或许是我不会配置的问题 不支持 但是你其实可以试试用idea 只要你跑的动 |  |  |
| ❓ | **C++** | 脑子抽了才会用这东西写Mod 不但要给各个架构 系统编译 还要用Ndk 以及JNI | 别想了 不教 |  |  |


## **要求**
| 条目 | 需求 |
| --- | --- |
| 运行内存 | 4GB以上 |
| 剩余存储空间 | 1GB以上 |
| linux基础 | 会基础指令 比如文件什么的 |
| vim基础 | 会使用vim基础内容 编辑 |
| lua基础 | lua基础语法 用于配置neovim |
| github | github账号 |
| git | 基本使用 至少会clone commit |


## **关于Github访问和下载镜像问题**
推荐使用[github文件加速](https://github.akams.cn/)  
并且之后的neovim安装包都是从github上安装  
需要修改源

## **1.Termux 安装**
对于新人推荐安装**ZeroTermux** 下载链接:[IXCM工作室](https://od.ixcmstudio.cn/repository/main/ZeroTermux/)  
    对于原版**Termux**前往[github](https://github.com/termux/termux-app/releases/tag/v0.118.1)  
下面是**ZeroTermux**的一些优点

1. 添加一些实用功能
2. 一键换源
3. 美化 改背景板 ~~狂喜~~  
当然 本教程也考虑你使用**Termux**的情况  
 批注内容为使用**Termux**的情况下操作  
记住Termux与linux有区别  
本教程不会安装容器 而是直接在ternux里面操作  
如果有容器也可以在容器里面操作  
安装后先换源 左菜单选择  
`切换源`  
  Termux使用清华源

```shell
sed -i 's@^\(deb.*stable main\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/apt/termux-main stable main@' $PREFIX/etc/apt/sources.list
apt update && apt upgrade
```

 关于字体 推荐使用含有Nerd的  
 比如FiraCode Nerd,Jetbrains等等  
 字体安装可以通过左菜单的字体设置  
 或者修改 ~/.termux/font.ttf  
 小键盘请修改 ~/.termux/termux.properties  
 termux和文件系统之间的互通在于 ~/storage  
 ~/storage/downloads直通/storage/emulated/0/Download/

## **1.1 ZSH美化 (可选)**
这里使用MOE工具进行美化  
~~尽管他原本是来管理linux容器的~~  
从左往右滑打开左菜单  
选择 `MOE全能` 来安装  
    [moe](https://gitee.com/mo2/linux/tree/master/)  
安装后以后要打开**moe**就通过`tmoe`  
启动moe后选择  
`Configure zsh美化终端`  
然后操作 颜色风格自选 终端风格推荐 p10k

## **基础环境安装**
![](https://skillicons.dev/icons?i=git,github,vim,neovim,python&theme=light)  
安装git vim neovim

```shell
apt install git vim neovim python
```

给git配置github ssh和用户信息

[https://blog.csdn.net/weixin_42310154/article/details/118340458](https://blog.csdn.net/weixin_42310154/article/details/118340458)  
并且clone自己的项目

本教程使用neovim(需要一定vim操作基础 一定lua语法 不会配置没关系)

对于vscode(code server) idea(配置要求高 需要容器)

因为没有容器环境 以及图形界面不好操作 性能较低 本教程并不推荐

使用neovim你可以方便的配置环境 并且熟练使用vim后即使是手机端 操作速度也可以(可以试试外接键盘？)

## **开发环境配置**
### **Java**
![](https://skillicons.dev/icons?i=java&theme=light)  
``

```shell
apt install openjdk-17
```

### **JS/TS**
![](https://skillicons.dev/icons?i=js,nodejs,npm,ts&theme=light)

```shell
apt isntall nodejs
```

### **Lua**
![](https://skillicons.dev/icons?i=lua&theme=light)

```shell
apt install stylua lua-language-server
```

## **Neovim配置**
本教程推荐使用**AstroNvim**

```shell
git clone --depth 1 https://github.com/AstroNvim/template ~/.config/nvim
rm -rf ~/.config/nvim/.git
```

修改**Lazy**的源

```shell
vim ~/.config/nvim/init.lua #修改下载lazy的镜像
```

```lua
…
vim.fn.system({ "git", "clone", "--filter=blob:none", "镜像/https://github.com/folke/lazy.nvim.git", "--branch=stable", lazypath })
--比如 https://gh.llkk.cc/https://github.com/folke/lazy.nvim.git
…
```

保存

```shell
vim ~/.config/nvim/lua/lazy_setup.lua #修改lazy下载的包的镜像
```

```lua
require("lazy").setup({…},{
…
install = { colorscheme = { "喜欢的主题" } },
-- 比如 tokyonight
git = { url_format = "镜像/https://github.com/%s.git" },
-- 比如 https://gh.llkk.cc/https://github.com/%s.git
…
})
```

保存

```shell
ls ~/.config/nvim/lua/plugins/
vim ~/.config/nvim/lua/plugins/xxx #依次修改每个文件 删除其首行那个if true来激活每个文件
```

安装插件

```shell
vim ~/.config/nvim/lua/community.lua
```

```lua
return {
…

--[[ 
插件从https://github.com/AstroNvim/astrocommunity查看
另外里面的pack其实大多termux都用不了 lua的除外？
推荐一些插件
{ import = "astrocommunity.colorscheme.tokyonight-nvim" },
这个是tokyonight主题 也可以用自己喜欢的主题
记得去~/.config/nvim/lua/plugins/astroui.lua
{ import = "astrocommunity.color.transparent-nvim" },
这个是 背景透明化 用:TransparentToggle 激活
{ import = "astrocommunity.editing-support.neogen" },
这个是 注解生成 使用:Neogen
  { import = "astrocommunity.editing-support.rainbow-delimiters-nvim"},
  这个是彩虹括号
  也可以参考我的配置：https://gitee.com/novarc/nvim
]]
}
```

```shell
vim ~/.config/nvim/lua/plugins/mason.lua #修改一些默认安装的东西 删除你不需要的 推荐保留lua相关的 之后可以用nvim修改配置
```

启动neovim等等安装

```shell
nvim
```

启动并且安装完成后可以依次运行  
记得Mason这里不会常用因为一些兼容问  
下面为一些常用的命令

```plain
:TSInstall <xxx> 为需要的语言比如java js 安装高亮
:LspInfo lsp状态
:ToggleTerm 启动终端
```

**AstroNvim**的键位请看[Mappings](https://docs.astronvim.com/mappings)

## **开发**
在配置完上面内容后就可以正式开始开发了

### **Java**
#### Jdtls配置
由于Mason下载速度问题以及版本(高版本使用jdk17有问题)问题 Jdtls只能我们自己配置  
从这个链接下载[jdtls](https://download.eclipse.org/justj/?file=jdtls/milestones/1.39.0)  
移动到termux里面  
找个合适位置比如~/jdtls  
解压  
下面我们假设jdtls放在了~/jdtls/  
并且 ~/jdtls/下面有bin/

```shell
vim ~/.local/share/nvim/lazy/nvim-lspconfig/lua/lspconfig/configs/jdtls.lua
```

修改  
然后

```shell
vim ~/.local/share/nvim/lazy/nvim-lspconfig/lua/lspconfig/configs/jdtls.lua
```

修改为

```lua
…
return {
  default_config = {
    cmd = {
      'python3',
      '/data/data/com.termux/files/home/jdtls/bin/jdtls',
      '-configuration',--这行没变
      …
    }
  }
}
…
```

  
配置好后

```shell
mkdir ~/.local/share/nvim/mason/packages/jdtls #假装jdtls安装了
```

~~邪门~~

#### **D8的配置**
```shell
apt install d8
```

#### **基础操作**
参考先有java mod开发教程  
下面给出一点常用东西  
gradle镜像修改:

```shell
vim ./gradle/wrapper/gradle-wrapper.properties
```

修改`distributionUrl=`那一个  
修改为`distributionUrl=https://mirrors.cloud.tencent.com/gradle/gradle-xxx-bin.zip`  
仓库镜像配置:

```shell
vim ~/.gradle/init.gradle
```

写入

```groovy
allprojects {
    repositories {
        maven {
            url "https://maven.aliyun.com/repository/public"
        }
    }
}
```

修改获取mdt的镜像

```shell
vim build.gradle
```

```groovy
allprojects {
…
    repositories {
        …
        maven{ url "镜像/https://raw.github.com/Zlaux/MindustryRepo/master/repository" }
        //比如 https://github.tbedu.top/https://raw.github.com/Zelaux/MindustryRepo/master/repository
    }
}
```

启动gradle

```shell
./gradlew #安装gradle 如果感觉慢可以换镜像
./gradlew build #编译Desktop版
./gradlew deploy #编译android版 记得配置d8
```

这使用使用nvim打开你java代码 等待jdtls启动  
下面就可以进行JAVA开发了

### **TS配置**
使用[TSTemplate](https://github.com/EmmmM9O/MindustryTSModTemplate)为模板创建一个ts mod并且clone  
推荐使用yarn

```shell
npm install -g yarn
#进入项目
yarn install
# 编译
yarn dist
```

有点复杂先咕咕咕了

```shell
cd ~
mkdir language
cd language
yarn init
yarn add vscode-langservers-extracted
```

vim ~/.local/share/nvim/lazy/nvim-lspconfig/lua/lspconfig/configs/eslint.lua

修改cmd = { 'node','/data/data/com.termux/files/home/langauge/node_modules/vscode-langservers-extracted/lib/eslint-

language-server/languageDefaults.js', '--stdio' },

mkdir ~/.local/share/nvim/mason/packages/eslint-lsp/

打开neovim

运行 Mason安装prettier

