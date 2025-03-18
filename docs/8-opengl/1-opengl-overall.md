# OpenGL概述

Mindustry的图形后端为OpenGL（在安卓上为OpenGL es, 差异我们在后文会展开），OpenGL是跨平台的图形API，它允许我们使用硬件加速来绘制图形。

在你阅读本章节前，建议先阅读另一篇OpenGL教程，那会告诉你OpenGL的几乎所有基本概念，以及一些渲染方法（不过那些渲染方法我们大概不会用到）：

**Learn OpenGL： https://learnopengl-cn.github.io/**

与上述教程不同，本篇重点介绍在Mindustry中的图形绘制方法与技巧，我会避免使用那些复杂的术语和概念，而是直接介绍如何使用OpenGL来绘制图形。

## GL的操作流与工作方式

OpenGL是一个“状态机”，本篇我们并不讨论这个概念，你只需要知道操作OpenGL的流程就是在调用OpenGL的操作函数和GL定义的常量，去设置某些数据和资源，然后将这些资源以某种方式绘制出来而已。

OpenGL的操作函数在Mindustry中由一个单例对象实现，这个单例被存储于`arc.Core`类中的`gl20`和`gl30`字段中，两个字段保存的是同一个对象，但是它们的变量类型不同，分别会记录在OpenGL2.0和OpenGL3.0+上的可用函数与常量值，一般来说你的目标平台都会支持OpenGL3.0的API，但是如果不支持的话，字段`gl30`会为空，请在调用前做好兼容性检查。

但是事实上，多数情况下我们只需要使用一个静态调用的工具类`arc.graphic.Gl`来快速访问**gl20**中的所有行为，`gl30`则需要访问其单例。

一个GL的原始工作流形式是这样的：

```java
void example() {
  Gl.clearColor(0.2f, 0.3f, 0.3f, 1.0f);
  Gl.clear(Gl.colorBufferBit);

  Gl.useProgram(shaderProgram);
  Gl.bindVertexArray(VAO);
  
  Gl.drawElements(Gl.trangles, 6, Gl.unsignedInt, 0);
}
```

在`Gl`内定义了大量的操作函数与常量，这些常量会被作为函数的参数被用于描述某些状态，我们现在还不需要去关心这些函数的具体作用，在你使用Gl的工作流时，代码的形式看起来就是这样一条一条对Gl中操作函数的调用。

## Mindustry中的GL包装

使用原始的Gl工作流是很麻烦的，这会需要管理大量的资源以及令人困惑的整数类型**句柄**，幸运的是在Arc中Gl的常用工作流已经被包装为了更符合Java语言习惯的API，我们可以直接通过这些包装类型来更加方便地使用OpenGL。

这些包装类型大多被存储在`arc.graphics`包中，其中`Shader`、`Texture`
、`FrameBuffer`、`Mesh`等类型，在我们之后的教程中会频繁用到这些类型，它们的具体用途在后文也会详细介绍。

除非你需要进行一些很复杂的操作，否则你将很少能用到Gl的默认工作流，常用的封装已经能够满足大多数需求。

## OpenGL es 兼容

OpenGL es是在安卓上做了针对移动平台性能优化的OpenGL，或者说，它其实是一种“阉割版”的OpenGL。

由于Mindustry的跨平台包含了安卓平台，Arc中的OpenGL API结构是向下兼容了OpenGL es的，这意味着在GL es中被取消的许多API在Arc的GL API中同样被移除了，这会导致你在互联网上查询到的教程与我们在Mindustry中的操作有不同，这些需要考虑如何规避。

Arc GL与普遍能找到的OpenGL教程所描述的主要不同在与：

1. 不支持几何着色器与计算着色器，同时强制提供顶点与片段着色器
2. 完全不支持固定管线
3. 着色器程序需要定义精度（尽管这同样被包装在了`Shader`的预处理工作中，往往只需要添加一个宏`#HIGHP`/`#LOWP`）
4. 很多特殊着色器操作都需要添加扩展声明
5. 很多可能不常用的操作函数被移除

在你查阅其他资料时，请注意检查其中可能存在的被取消的特性。
