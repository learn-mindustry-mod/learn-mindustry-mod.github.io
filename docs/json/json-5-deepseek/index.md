# 前言（DeepSeek 版）

::: danger
此目录由 DeepSeek 撰写，当前处于骨架阶段，未来会由人工手动扩充和润色
:::

自从Mindustry在v98添加模组系统以来，已经整整六年过去了。六年了，在这样漫长而短暂的六年中，我们一直在原地打转，严重依赖口耳相传，从来没有形成有体系的教程系统。

本篇教程旨在为Json模组初学者提供基本的开发理路，提供一些模板来帮助模组开发，最重要的是，在过程中学会阅读Java程序，通过查阅源代码达到自己想要的效果。

在你阅读本教程之前，你至少需要有如下的知识与素养：

- 基本的算术知识；
- 逐字阅读文章并吸收的能力；
- **一颗常在学习的心**

最终，你将有能力一览复杂模组的能力，甚至可以自己动手写出第二个饱和火力！当然，我说的只是代码层面上。在这个过程中，必不可少的就是实践，但对于Json modder来说，这一般不是难题。

## 本版说明

本目录是同一大纲的第三稿（前两稿为 `json_0_gpt` 与 `json_1_gemini`），与前两稿的关键区别如下：

- **版本基线**：本教程以 `D:\Pyrachan\Mindustry`（v8 主线）与 `D:\Pyrachan\Arc` 的源码为**唯一真值**。正文中出现的每一个字段、类型、默认值与行为，写作前都要回源码核对；凡 v7 世代模组（`minGameVersion` 136~159）的写法与 v8 源码不一致处，一律用 `::: warning` 标注旧值，保证仍在 v7 上做模组的读者也能读懂。
- **参考模组**：以《饱和火力 3.3.2.1》为蓝本。它是 Java 模组，但方块、物品等内容全部由 JSON 定义（存放在自定义路径 `SFcontent/` 下），结构清晰、覆盖面广，是最理想的解剖对象；`sapphirium` 等纯 JSON 模组作补充对照。
- **补齐 0x0B**：前两稿均缺失的原版字段表在本版补齐，按内容域拆分为八个文件（见目录）。

## 源码引用规范

- 源码以 `D:\Pyrachan\Mindustry` 与 `D:\Pyrachan\Arc` 为准，引用时给出相对 `core/src` 的路径，如 `mindustry/type/Item.java`、`arc/audio/Sound.java`；
- 凡引用一个字段或方法，必须能在源码中找到同名字段或方法，不凭印象写；
- 类名、字段、方法、路径、内部名一律进入反引号；新术语首次出现时以**中文加粗**立名并附英文原文（括号）。

## 目录

- **模板库** [Hjson 模板库](../templates/index)
- [工具配置、模组结构、Json语法和`mod.json`](./x01-basic)
- [物品、流体、科技树、贴图和语言文件](./x02-item-and-liquid)
- [工厂、方块通性、消耗器、绘制器](./x03-crafter-and-drawer)
- [生产方块、电力方块](./x04-production-and-power)
- [炮塔、DrawPart](./x05-turret-and-drawpart)
- [状态效果、特效、音效](./x06-status-effect-and-fx)
- [单位、武器、能力、单位工厂](./x07-unit-and-weapon)
- [行星、区块、生成器、环境方块](./x08-planet-and-sector)
- [如何找到自己需要的类和字段](./x09-how-to-find-class-and-field)
- [Java语法初步、`ContentParser`的解析](./x0a-java-and-contentparser)
- 原版所有类型和字段表（翻译版）：
  - [方块（Block）字段表](./x0b-01-block)
  - [物品与流体（Item/Liquid）字段表](./x0b-02-item-liquid)
  - [消耗器与绘制器（Consume/DrawBlock）字段表](./x0b-03-consumer-drawer)
  - [炮塔、子弹与DrawPart字段表](./x0b-04-turret-bullet-drawpart)
  - [状态效果与特效（StatusEffect/Effect）字段表](./x0b-05-status-effect-fx)
  - [单位与武器（UnitType/Weapon）字段表](./x0b-06-unit-weapon-ability)
  - [行星、区块与环境方块（Planet/Sector）字段表](./x0b-07-planet-sector-environment)
  - [天气（Weather）字段表](./x0b-08-weather)
- [过渡到Javascript/Java](./x0c-transition-to-js-java)

## 联系方式

教程QQ群:[L.M.M.无限责任天堂](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=LGT1dGUqX1TAmB00S4AGigWcsjr9yGzY&authKey=w7s9Qr22gRI%2FjkKRPw9yViDZu%2BGaAZwQQ2Fh8DrS2ZiydVYz9aZLS%2FYaW7kL%2FieX&noverify=0&group_code=497913479)
