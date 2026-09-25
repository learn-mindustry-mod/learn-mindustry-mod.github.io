# 入门及教程阅读指南

欢迎来到 Learn Mindustry Mod！

本教程旨在提供制作Mindustry模组的教程，帮助大家能够独自建立起制作教程的整个体系。

## 语言选择

通常来说，总共有且仅有三类“语言”可以用于Mindustry的模组编写，即JSON/Hjson、Javascript、Java及其他与Java互操作的JVM语言。本教程重点讲解的语言是Java和Kotlin（一门旨在成为“更好的Java”的语言）。关于语言的选择，本教程有以下建议：

- JSON/Hjson：推荐给没有任何编程经验的萌新使用。优点是下限极低，编写简单，无需多余的软件，只需要能读懂教程和源代码；缺点是只能使用原版已有的机制；
- Javascript：推荐给没有电脑者使用。优点是无需编译；缺点是每次启动游戏都要耗费较长的时间编译，在编写期没有任何可用的提示，并且与常用的JS语法有出入；
- Java：推荐给已有编程经验的初学者和追求机制的进阶者使用。优点是上限极高，且有编译期错误揭示；缺点是需要配置编译环境，而且需要学Java语法。也可以尝试Kotlin，语法更加现代。

无论采用哪种语言，均不推荐混合使用。混合使用会导致内容引用变得复杂且不可预测。此外，原版对三种语言的加载顺序是明确的 Java > Javascript > JSON 顺序，排在前面的语言无法获取后面语言中的内容引用。

## 目录结构

- Java：介绍Java/Kotlin环境配置、内容及机制创建、游戏底层概念、渲染与图形学底层、排错等内容，由硫缺铅、Novarc、E.B.Wilson参与编写；
- Javascript：介绍Javascript模组的一般开发方法，由Miner、Pardon参与编写；
- Json：介绍Json模组的几乎全部内容，目前大部分是由AI编写的，可以在三个版本中相互参考；
- 贴图：介绍贴图的绘制方法，由喵子编写；
- Vibe：介绍Vibe Coding在模组制作中的应用，由lldd编写。

## 阅读方式

首先建议阅读《缺失的第一课》，然后学习对应语言的基本语法，最后按顺序细读教程中的每一个字。

## 联系方式

教程QQ群:[L.M.M.无限责任天堂](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=LGT1dGUqX1TAmB00S4AGigWcsjr9yGzY&authKey=w7s9Qr22gRI%2FjkKRPw9yViDZu%2BGaAZwQQ2Fh8DrS2ZiydVYz9aZLS%2FYaW7kL%2FieX&noverify=0&group_code=497913479)

作者邮箱：1164806786@qq.com
