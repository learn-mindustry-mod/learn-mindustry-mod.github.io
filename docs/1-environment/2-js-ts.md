# javaScript/typeScript开发环境

> [!NOTE]
> 能写Java/Kt就写Java/Kt\
> javaScript/typeScript没有前途没有优势

# JavaScript

:::: info
JavaScript 是一种高级的、解释执行的编程语言\
Mindustry使用Rhino作为JS引擎\
(为了支持Android 不然早用其他的了)

<GitHubCard repo="mozilla/rhino"/>

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

下面将介绍如何搭建一个有类型补全和格式化的JS/TS开发环境
# 环境安装
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


::::::: tabs :options="{ storageKey: 'language' }"

::: tab "JavaScript" id="js"
模板还未编写
:::

:::::: tab "TypeScript" id="ts"
> [!NOTE]
> TypeScript 通过为 JavaScript 添加类型系统，扩展了这门语言。它能在代码运行前捕获错误并提供修复方案，从而显著提升开发效率。

我们使用`mindustry-types`提供类型补全
<GitHubCard repo="EmmmM9O/mindustry-types" />
使用我的模板`MindustryTSModTemplate`
<GitHubCard repo="EmmmM9O/MindustryTSModTemplate" />
使用该模板 clone到本地
::::: tabs :options="{ storageKey: 'node' }"

:::: tab npm
```shell
npm install
npm format #格式化
npm fix #ESlint fix
npm raw #编译raw文件夹
npm tools #编译tools
npm main #编译main
npm dist
```
记得修改`raw/dist.config.ts`
修改里面`buildCommand`
:::: 

:::: tab yarn
```shell
yarn install
yarn format #格式化
yarn fix #ESlint fix
yarn raw #编译raw文件夹
yarn tools #编译tools
yarn main #编译main
yarn dist
```
:::: 

:::: tab pnpm
```shell
pnpm install
pnpm format #格式化
pnpm fix #ESlint fix
pnpm raw #编译raw文件夹
pnpm tools #编译tools
pnpm main #编译main
pnpm dist
```
记得修改`raw/dist.config.ts`
修改里面`buildCommand`
:::: 

:::::
文件目录架构
- project/
  - eslint.config.mjs ESLint配置
  - prettier.config.mjs Prettier配置
  - package.json node配置
  - main/
    - assets/ 资源文件
      - sprites/ 图片
        - ...其他
    - src/
      - main.ts 主程序
      - ... 其他
    - tsconfig.json TS配置
  - raw/ 内容辅助json生成器
    - bundle.config.ts bundle生成配置
    - content.config.ts content生成配置
    - dist.config.ts dist构建配置
    - mod.config.ts **Mod信息配置**
    - src
      - index.ts 构造调用入口 可以自行修改部分
      - bundles/
        - index.ts bundle生成器入口
        - meta.ts 配置bundle的类型 类似于基本模板
        - languages.ts bundle的具体内容
      - content/ content生成器类型还未完成
        - index.ts content生成器入口
        - block.ts 方块
    - tsconfig.json TS配置
  - tools/ 生成器的实现 无需修改 除非需要添加功能和类型

> [!IMPORTANT]
> 不要使用import "./module" 使用 import "module"\
> 不要用class继承java类型\
> 使用extend函数替代\
> 只有对应名称的extend函数有对应补全 比如`extend__Table`


::::::

:::::::

# LSP配置
:::: tabs :options="{ storageKey: 'idea' }"

::: tab "IDEA" id="idea"
什么 都用IDEA了还不写Java\
Idea无法配置
::: 

::: tab "Vscode" id="vsc"

::: 

::: tab "Neovim" id="nvim"

::: 

::::
