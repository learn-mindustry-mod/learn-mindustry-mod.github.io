# javaScript/typeScript开发环境

> [!NOTE]
> 能写Java/Kt就写Java/Kt\
> javaScript/typeScript没有前途没有优势


# Quick Start
## 环境
::: info
正常环境下mdt js开发就没有类型补全\
大多数mdt js开发者进行的javaScript就是纯文本编辑器盲写\
甚至没有格式化器
:::

所以进行MDT JS Mod开发的门槛非常低\
你可以使用任何文本编辑器开始\
不过为了舒适性 推荐使用下面IDE
> 如果你是安卓要么看[第四节](./4-build-on-android.md)来安装对应IDE 要么还是直接用文本编辑器手写吧
- vscode
- neovim

> [!NOTE]
> TypeScript 通过为 JavaScript 添加类型系统，扩展了这门语言。它能在代码运行前捕获错误并提供修复方案，从而显著提升开发效率。\
> 下面夹一点私货
> <GitHubCard repo="EmmmM9O/MindustryTSModTemplate" />
> 使用`mindustry-types`提供类型补全的TS Mod模板\
> 使用TS进行mdt开发系另一个工作流了\
> 查看[中文文档](https://github.com/EmmmM9O/MindustryTSModTemplate/blob/master/README_CN.md)了解\
> 不过你都能用上lsp了为什么不直接写java去

## js mod目录架构
以下为Mindustry模组的目录结构：

- mod.(h)json (必须) 是你模组的配置数据,
- scripts/ 目录是Javascript文件,
  - main.js js mod入口
  - ...
- content/ 目录是JSON代码,
- maps/ 目录是游戏内地图,
- bundles/ 目录是语言文件,
- sounds/ 目录是音效文件,
- schematics/ 目录是蓝图文件,
- sprites-override/ 目录是**覆盖原版**的贴图文件,
- sprites/ 目录是模组的贴图文件

## 模块
::: info
Mindustry使用的是**CommonJS**模块\
ES5(或许吧)规范
:::
使用`require("xxx")`导入其他模块\
需要注意`require("xxx")`
xxx需要是不带"./"的相对路径
比如
- scripts/
  - main.js
  - foo/
    - bar.js
    - foo2/
      - bar2.js
在`main.js`使用`require("foo/bar.js")`
在`foo/bar.js`使用`require("foo/foo2/bar2.js")`

```js
module.exports = {
...
}
```
导出
## 注意事项
下面有一些Rhino Js不能使用的特性
- `const` 这个有bug
- `new Function()` 不支持
- 模板字符串即\`xxxx\`不支持

## 内置函数
从`core/assets/scripts/global.js`我们可以知道Anuke设置的内部函数
```js
const log = (context, obj) => Vars.mods.scripts.log(context, String(obj))//日志
const print = text => log(modName + "/" + scriptName, text)//打印

const newFloats = cap => Vars.mods.getScripts().newFloats(cap);
//从Lambda表达式获得arc.func下的接口
const run = method => new java.lang.Runnable(){run: method}
const boolf = method => new Boolf(){get: method}
const boolp = method => new Boolp(){get: method}
const floatf = method => new Floatf(){get: method}
const floatp = method => new Floatp(){get: method}
const cons = method => new Cons(){get: method}
const prov = method => new Prov(){get: method}
const func = method => new Func(){get: method}
//新建效果
const newEffect = (lifetime, renderer) => new Effect.Effect(lifetime, new Effect.EffectRenderer({render: renderer}))
//js 'extend(Base, ..., {})' = java 'new Base(...) {}'
function extend(/*Base, ..., def*/){}
//相当于Java代码 new Base(...){}
//获得的是对象而非类
```
## 技巧
如果想要导入其他Java Mod中的类 使用下面
```js
const loader = Vars.mods.mainLoader();
const scripts = Vars.mods.scripts;
const NativeJavaClass = Packages.rhino.NativeJavaClass;
function getClass(name) {
  return NativeJavaClass(scripts.scope, loader.loadClass(name));
}
const xxx = getClass("xxxx");
//导入其他Java Mod的类
```
虽然说使用的是ES5标准\
但是可以通过function实现class
```js
var testM = /** @class */(function(){
  function testM(foo){
    this.foo = foo
  }
  testM.prototype.test = function () {
    Log.info("test")
  }
  return testM
}())
let u = new testM()
u.test()
```

# Rhino 介绍

:::: info
JavaScript 是一种高级的、解释执行的编程语言\
Mindustry使用Rhino作为JS引擎\
(为了支持Android 不然早用其他的了)

<GitHubCard repo="mozilla/rhino"/>
Auken fork的rhino\
使用的是`73a812444ac388ac2d94013b5cadc8f70b7ea027`
<GitHubCard repo="Anuken/rhino"/>
Rhino性能非常低\
不过因为纯Java实现调用Java函数时候性能反而高？

> Auken曾经想过用GraalJS 此事在GraalJS issue里有记载\
> 不过因为不兼容安卓而放弃

::: details 对比
> 更加全面的测速还在制作

## 不同语言对于
> LuaJit使用的是LuaJava的\
> 目测lua调用java方法经过了jni调用一个java的static函数F\
> F再反射调用对应方法\
> 为了对安卓的兼容ReflectASM和ByteBuddy
> 来实现更高效的调用都不会使用


### 纯For循环

#### JavaScript

```js
for (let i = 0; i <= 1000000; i++) {}
```

用时`254ms`

#### Lua Jit

```lua
for i=1,1000000 do end
```

用时`3.6ms`

### 调用方法

#### JavaScript

```js
for (let i = 0; i <= 100000; i++) {
  Vars.world.tiles.get(10, 10).setBlock(Blocks.copperWall)
}
```

用时`2059ms`

#### Lua Jit

```lua
for i=1,1000000 do
  Vars.world.tiles:get(10,10):setBlock(Blocks.copperWall)
end
```

用时`3725.6ms`

## 不同JS引擎对比

<GitHubCard repo="innershows/JavascriptEngineSpeedTest"/>

纯For循环

> 1万

| JS引擎 | 1万(ms) | 100万(ms) | 1亿(ms) |
| :----: | :-----: | :-------: | :-----: |
| JSCore |   12    |   22.4    |   273   |
|   V8   |  81.2   |   85.2    |   301   |
| Rhino  |  86.4   |   7180    |  超时   |

调用Java函数

| JS引擎 | 1万(ms) | 1亿(ms) | 检测1(ms) | 检测2(ms) |
| :----: | :-----: | :-----: | :-------: | :-------: |
| JSCore |   366   |  超时   |    420    |   26462   |
|   V8   |   293   |  超时   |    131    |   5275    |
| Rhino  |   193   |  超时   |    48     |   2967    |
:::
所以非常非常不建议使用JS/TS
::::

# 进阶环境
## NodeJS
下面将介绍如何搭建一个有语法检测和格式化的JS/TS开发环境
<GitHubCard repo="nodejs/node" />
> [!NOTE]
> Node.js® 是一个免费、开源、跨平台的 JavaScript 运行时环境, 它让开发人员能够创建服务器 Web 应用、命令行工具和脚本。

需要NodeJS环境
[官网](https://nodejs.org/zh-cn)

:::: tabs :options="{ storageKey: 'system' }"

::: tab "Windows" id="windows"
[官网下载](https://nodejs.org/zh-cn/download)
自行下载安装
::: 

::: tab "Debian/Ubuntu" id="debian"
```shell
sudo apt install nodejs npm -y
```
::: 

::: tab "ArchLinux" id="arch"
```shell
sudo pacman -S nodejs npm
```
::: 

::: tab "Termux" id="termux"
```shell
pkg install nodejs
```
::: 

::::


因为npm有时候会有bug\
尤其是在Termux和Termux跑的容器里面\
推荐使用yarn或pnpm

:::: tabs :options="{ storageKey: 'node' }"

::: tab npm
没有呢
:::
::: tab yarn
<GitHubCard repo="yarnpkg/yarn" />
```shell
npm install -g yarn
```
:::

::: tab pnpm
<GitHubCard repo="pnpm/pnpm" />
```shell
npm install -g pnpm
```
:::

::::
## Prettier
> [!NOTE]
> 一个“有态度”的代码格式化工具\
> 支持大量编程语言\
> 已集成到大多数编辑器中\
> 几乎不需要设置参数 

[官方文档](https://www.prettier.cn/)
### 安装
:::: tabs :options="{ storageKey: 'node' }"

::: tab npm
```shell
npm install -g prettier
```
:::
::: tab yarn
```shell
yarn global add prettier
```
:::

::: tab pnpm
```shell
pnpm add -g prettier
```
:::

::::
### 使用
```shell
prettier xxxx --write
```
## LSP配置
:::: tabs :options="{ storageKey: 'ide' }"

::: tab "IDEA" id="idea"
什么 都用IDEA了还不写Java\
Idea无法配置
::: 

::: tab "Vscode" id="vsc"
安装下面插件
- ESLint
- Prettier
::: 

::: tab "Neovim" id="nvim"
通过`Mason`安装下面LSP
- typescript-language-server
- prettier
- eslint-lsp
::: 

::::
