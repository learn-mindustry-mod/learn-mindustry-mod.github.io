# 工具配置、模组结构、Json语法和`mod.json`

> ***"工欲善其事，必先利其器。"***

欢迎来到 JSON 模组开发的第一步。在这一章里，我们将从零开始，先给你配好一套舒服的写作环境，再带你把一个模组从里到外拆开看一遍，最后亲手写下模组的"身份证"——`mod.json`。学完这一章，你手里会有一个能被游戏认出来的最小模组骨架，后面所有章节的内容都会往里填。

**学习本章需要具备的基础：**
- 知道怎么对文件和文件夹进行压缩与解压；
- 能完成基本的文件扩展名修改。

本教程以 Mindustry **v8 主线**的源码为唯一依据，凡引用的字段、默认值、行为，都直接来自 `D:\Pyrachan\Mindustry` 与 `D:\Pyrachan\Arc` 的源码，并标注出处。

---

## 工具配置：告别记事本

JSON（JavaScript Object Notation）是一种**标记语言**，它只负责存数据，不包含任何业务逻辑。所以写 JSON 模组不需要装 IDE，一个像样的**文本编辑器**就足够了。

::: warning 注意
**绝对不要**用 Windows 自带的记事本（`notepad.exe`）！它会在文件开头悄悄塞进 BOM 头、又容易搞出编码问题，导致游戏读不懂你的文件而频频报错。
:::

我们真正需要的是三个能力：**代码高亮**、**括号自动补全**、**代码格式化**。按平台推荐：

- **桌面端（Windows/macOS/Linux）**：首推 **Visual Studio Code (VSCode)**，免费、轻量、插件生态强。解压打包推荐 **7-Zip** 或 **Bandizip**。
- **安卓端**：**MT 管理器** 或 **Squircle CE**，自带高亮，还能直接在手机上改 `.zip` 模组包。
- **iOS 端**：**Spec Editor**，衍生自 VSCode，支持查错与格式化。

---

## 模组文件结构：以《饱和火力》为例

一个 JSON 模组，本质上就是一个**按约定组织好的文件夹**，发布时通常打成 `.zip`。游戏启动时会按固定的路径约定去读这些文件夹，从而加载你的内容。这些约定写在源码 `mindustry/mod/Mods.java` 里，不是靠口耳相传。

标准 JSON 模组的目录结构如下，按需创建，不必一次建全：

- `mod.json` 或 `mod.hjson`（**必需**）：模组配置文件，身份信息都在这。
- `content/`：存放所有 JSON 数据的核心文件夹，下面再按内容类型分目录。
- `sprites/`：模组自己的贴图文件夹，放你画的 PNG。
- `sprites-override/`：用来**覆盖原版贴图**的文件夹。
- `bundles/`：多语言翻译文件，放 `bundle*.properties`。
- `scripts/`：JavaScript 脚本，实现 JSON 做不到的特殊逻辑。
- `icon.png` 或 `preview.png`：模组在游戏模组列表里的图标。

用《饱和火力 3.3.2.1》来对照。解压它的安装包，你会看到 `SFcontent/`、`sprites/`、`bundles/`、`mod.json`，还有 `classes.dex`、`kotlin/` 这些 Java 模组才有的东西。它的 `mod.json` 长这样：

```json
{
  "name": "饱和火力",
  "displayName": "Saturation firepower",
  "java": true,
  "main": "sf.SF",
  "author": "Cry0flu1d",
  "version": "3.3.2.1",
  "minGameVersion": "155"
}
```

::: info 进阶拓展：《饱和火力》的特殊结构
注意到两点：一是 `"java": true` 和 `"main": "sf.SF"`，说明它是个 **Java 模组**——`classes.dex` 和 `kotlin/` 就是编译出来的代码；二是它的方块、物品没有放在 `content/`，而是放在了自定义的 `SFcontent/` 下。

这是因为它有 Java 代码撑腰，可以在代码里**自定义内容读取路径**。但对纯 JSON 模组而言，你没有这段代码，**必须**严格遵守原版的 `content/` 约定。我们在后面的章节会专门回来看这个"自定义路径"是怎么做到的。
:::

### `content/` 下的内容目录

游戏按 `mindustry/ctype/ContentType.java` 里登记的**内容类型（ContentType）**来扫描 `content/` 下的子文件夹。v8 的完整对照如下：

| 内容类型 | 文件夹名 | 存什么 |
|---|---|---|
| `Item` 物品 | `items` | 铜、铅之类 |
| `Block` 方块 | `blocks` | 工厂、炮塔、钻头 |
| `BulletType` 子弹 | `bullets` | 炮塔射出的弹药 |
| `Liquid` 流体 | `liquids` | 水、石油、气体 |
| `StatusEffect` 状态效果 | `status` | 燃烧、冰冻 |
| `UnitType` 单位 | `units` | 机甲、飞机 |
| `Weather` 天气 | `weathers` | 下雨、下孢子 |
| `SectorPreset` 区块 | `sectors` | 战役里的区块预设 |
| `Planet` 星球 | `planets` | 自定义星球 |
| `TeamEntry` 队伍 | `teams` | 自定义队伍 |
| `UnitCommand` 单位指令 | `unitCommands` | 单位逻辑指令 |
| `UnitStance` 单位姿态 | `unitStances` | 单位的 AI 姿态 |

::: tip 一个小坑
- `bundles`、`sprites`、`sprites-override`、`.git` 这几个文件夹被游戏标记为**特殊文件夹**（源码 `Mods.specialFolders`），不会被当成内容扫描，别把 JSON 塞进它们。
:::

---

## JSON 与 Hjson：Mindustry 的方言

嘴上说"写 JSON 模组"，实际上 Mindustry 支持的是更宽松、更好写的方言——**Hjson**（Human JSON）。它省掉了一大堆标点，让人读起来舒服得多。看一组对比：

::: code-group

```json [标准 JSON]
{
  "type": "GenericCrafter",
  "description": "Hello world!",
  "health": 100,
  "hasItems": true,
  "requirements": [
    { "item": "copper", "amount": 10 },
    { "item": "lead", "amount": 10 }
  ],
  "research": {
    "parent": "copper-wall"
  }
}
```

```hjson [Hjson（Mindustry 推荐）]
{
  // 单行注释：定义方块类型
  type: GenericCrafter
  description: Hello world!
  health: 100
  hasItems: true

  /*
    多行注释：定义建造资源需求
  */
  requirements: [
    copper/10
    lead/10
  ]

  research: {
    parent: copper-wall
  }
}
```

:::

**从对比里能看出三处不同：**

1. **省略引号与逗号**：大多数情况下双引号可省，每行结尾的逗号可省。
2. **支持注释**：标准 JSON 不允许注释，但 Hjson 支持 `//` 单行注释和 `/* ... */` 多行注释，方便留备忘。
3. **Mindustry 的缩写糖**：`copper/10` 这个写法，等价于 `{"item": "copper", "amount": 10}`。这不是 Hjson 语法，而是 Mindustry 自己的解析器 `ContentParser` 提供的（源码 `ContentParser.java` 里有专门的 `item/amount`、`liquid/amount`、`payloaditem/amount` 分支）。它的完整原理我们放到讲 `ContentParser` 的章节再拆。

::: warning 最佳实践：标点务必半角
Hjson 给了很大自由，但有一条铁律：**所有标点（冒号 `:`、大括号 `{}`、方括号 `[]`）必须是英文半角符号**。

根据无数前人的血泪，游戏里一半以上的解析报错，都来自误用了中文冒号 `：`，或者漏写了结尾的 `}`。编辑器的高亮和括号匹配，能帮你第一时间发现这些。
:::

---

## 编写 `mod.json`：模组的身份证

理论到此为止，现在动手。在你喜欢的位置新建一个文件夹（比如 `my-first-mod`），在里面新建文本文件 `mod.json`。

先看游戏**实际读取哪些字段**。`mod.json` 会被 `Mods.findMeta` 读进一个 `ModMeta` 对象（源码 `Mods.java` 内 `ModMeta` 类），v8 的完整字段如下：

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `name` | 字符串 | 无（必填） | **内部名称**，模组的唯一标识。游戏会把它转小写、空格换成连字符，得到 `internalName` |
| `displayName` | 字符串 | 等于 `name` | 玩家在模组列表看到的显示名，可任意用中文 |
| `description` | 字符串 | 无 | 详细介绍，支持换行与颜色标签 |
| `subtitle` | 字符串 | 无 | 一句话副标题 |
| `author` | 字符串 | 无 | 作者名 |
| `version` | 字符串 | `"0"` | 模组版本号 |
| `minGameVersion` | 字符串 | `"0"` | 最低游戏版本（build 号） |
| `java` | 布尔 | `false` | 是否为 Java 模组 |
| `main` | 字符串 | 无 | Java 模组的主类，如 `sf.SF` |
| `iosCompatible` | 布尔 | `false` | 纯脚本模组是否兼容 iOS |
| `repo` | 字符串 | 无 | GitHub 仓库 `作者/仓库名`，用于游戏内更新 |
| `dependencies` | 字符串数组 | 空 | 强依赖的其他模组名 |
| `softDependencies` | 字符串数组 | 空 | 软依赖（没有也能跑） |
| `hidden` | 布尔 | `false` | 隐藏模组，只在服务器端/客户端生效，不能加内容 |
| `texturescale` | 浮点 | `1.0` | 贴图缩放，值为"1x1 方块贴图的像素边长" |
| `pregenerated` | 布尔 | `false` | 贴图已预处理，跳过渗色与图标生成 |
| `contentOrder` | 字符串数组 | 无 | 指定内容加载顺序 |
| `legacyCompatible` | 布尔 | `false` | 来自旧大版本、但仍兼容新版 |

对纯 JSON 模组，我们只需要最基础的一小撮。请打开编辑器，输入：

```json
{
  "name": "my-first-mod",
  "displayName": "我的第一个模组",
  "author": "你的名字",
  "description": "这是我跟着教程制作的第一个 Mindustry 模组。",
  "version": "1.0",
  "minGameVersion": "155"
}
```

逐项解释：

- `name`：**内部名称**，最重要的一个字段。游戏会把它转成小写、空格转连字符——源码 `ModMeta.cleanup` 里 `internalName = name.toLowerCase().replace(" ", "-")`。后续引用你自己的贴图、物品时，到处都要用到这个名字，**强烈建议只用小写英文字母和连字符**，从源头避免麻烦。
- `displayName`：玩家看到的显示名，随便中文。
- `author` 与 `description`：你的大名和模组介绍。
- `minGameVersion`：**最低游戏版本**。它的格式是"build 号"或"build.修订号"（源码 `Version.isAtLeast` 按 `.` 拆成整数比较）。游戏里显示的版本号就是你该填的依据。

::: tip 版本号从哪来？
- **v7 稳定期**的 build 号大致是 `136`~`146`；**v8** 从 `147` 开始往后。源码里 `Vars.minModGameVersion = 136`、`Vars.minJavaModGameVersion = 154`，即：JSON 模组最早支持到 136，Java 模组最早到 154。
- 上面的例子填 `155`，正是《饱和火力》用的 v8 build 号。**实践时填你自己实测过的最低版本**，别照抄。
:::

---

## 效果验证

写完保存。选中 `mod.json`（以后有了 `content/` 等文件夹，就一并全选），**直接压缩成 `.zip`**。

::: fatal 常见错误：多套了一层文件夹
压缩时请**直接全选文件**再压缩，保证打开压缩包第一眼看到的就是 `mod.json`。

如果打开压缩包先看到一个文件夹（比如 `my-first-mod/`），点进去才有 `mod.json`，游戏会报 `No mod.json found`，拒绝加载。
:::

::: info 进阶：v8 对"多套一层"的宽容
v8 的源码在 `Mods.resolveRoot` 里做了个小优化：如果压缩包根目录下**只有唯一一个文件夹**，它会自动钻进去找 `mod.json`。所以"恰好只套一层"现在也能加载了。

但别因此养成坏习惯——一旦压缩包里除了那个文件夹之外还有别的文件，这个宽容就失效。**永远直接全选文件打包**，最省心。
:::

把 `.zip` 放进游戏的 `mods` 目录（游戏内"模组"界面可以一键打开这个目录），在模组列表里启用它，看到显示名"我的第一个模组"亮起，就说明你的第一张身份证办下来了。

---

## 小结

这一章我们做了三件事：配好了写作工具，摸清了模组的目录骨架（`content/` + 一堆特殊文件夹），并写下了能被游戏识别的 `mod.json`。其中 `name` 内部名和 `minGameVersion` 版本号是两个最容易踩坑、也最常被后来引用的概念。

**思考题**：`content/` 下放物品的文件夹叫 `items`，放状态效果的文件夹，正式名是什么？为什么 `statuses` 和 `status` 两个名字都能用？

下一章，我们往 `content/items/` 里写下第一个真正属于你自己的内容——物品，并让它有名字、有贴图、能被科技树研究出来。
