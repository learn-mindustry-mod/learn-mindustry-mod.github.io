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
::: details 对比

## 不同语言对于

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

::::
