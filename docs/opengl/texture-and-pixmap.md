# 纹理，纹理区域与Pixmap

在先前章节的学习中，我们已经成功在屏幕上画出了一个三角形，但是我们需要的往往是更加复杂的图案与形状，而不仅仅是简单的几何图形。

这就需要向GL传递图像数据，利用图像来绘制复杂的图案。

## 纹理

**纹理（Texture）** 是OpenGL对图像数据的一种抽象，它可以从文件加载，也可以由GL生成。

创建或者加载一个纹理在GL的工作流在Arc中纹理被封装为了一个java类型`arc.graphic.Texture`。要创建一个纹理，只需要调用`Texture`的多个构造函数之一：

```java
void example(){
  Texture tex1 = new Texture(new Fi("..."));  // 从文件加载纹理
  Texture tex2 = new Texture(pixmap);         // 从Pixmap创建纹理
  Texture tex3 = new Texture(
      new Fi("..."),
      true//useMipmaps
  );  // 从文件加载纹理并启用mipmap
  
  Texture tex4 = new Texture(textureData);    // 从纹理数据创建纹理
}
```

其中出现的**pixmap**在本节的后面会介绍，而**textureData**是一个纹理模型，具体来说这是接口`arc.graphic.TextureData`的实例。

`TextureData`对象则存储了纹理的图像数据，包括图像内容，图像的宽高，以及图像的颜色格式，对于不同类型的Texture会具有不同类型的`TextureData`。

我们上面给出的实例化范例除指定纹理数据的方式以外，通过文件创建的纹理数据对象为`arc.graphic.gl.FileTextureData`，它表示这个纹理的信息来自图像文件。

而从Pixmap创建纹理的数据对象则为`arc.graphic.gl.PixmapTextureData`，它表示这个纹理的信息被存储在一张`Pixmap`中。

以下是Arc内置的纹理数据类型：

- `arc.graphic.gl.FileTextureData` 来自文件的纹理数据
- `arc.graphic.gl.PixmapTextureData` 图像存储在`Pixmap`上的内存纹理数据
- `arc.graphic.gl.FloatTextureData` 图像存储在`FloatBuffer`上的内存纹理数据
- `arc.graphic.gl.GLOnlyTextureData` 在GL内部生成的纹理数据，图像数据被存储在GPU显存内
- `arc.graphic.gl.MipMapTextureData` 特殊的纹理数据，用于存储多个mipmap级别的其他纹理数据

而多数情况下我们只需要使用`Texture`本身的构造器就足够了，各类纹理数据对象往往会在需要使用的地方已经由工具进行创建，很少会需要从手动创建的纹理数据中构造纹理对象。

例如，我们用这样一张图片去创建一个纹理（是的，这是我头像）：

![avatar](/imgs/advanceGraphic/ava.png)

把这张图片保存为文件`texture.png`，然后放入到mod目录下的任意子目录中（不要放在sprites目录下，之后的章节我会解释为什么），例如，我们将这个图片放到mod的根目录下，然后我们可以这样去手动加载这个纹理：

```java
void example(){
  Fi modRoot = Vars.mods.getMod("example-mod").root;
  Texture tex = new Texture(modRoot.child("texture.png"));
}
```

`Vars.mods.getMod`可以获取具有给定内部名称的模组元属性对象，`root`为这个mod的根目录路径。这里我们就已经对这个图像创建了它的纹理对象，接下来我们就可以在着色器中使用这个纹理了。

## 采样器

在我们创建好纹理对象之后，就需要将它提供给片段着色器用于给片段染色了。

在着色器中，会使用**采样器（Sampler）** 来表示一个纹理对象，它可以通过特定的采样函数来从纹理内读取颜色。

采样器在glsl中由`uniform`定义的对应纹理类型的`sampler`变量接收：

```glsl
uniform sampler2D u_texture;
uniform sampler3D u_block;
uniform samplerCube u_cubemap;
```

此处我们先只讨论最常用的2D纹理`sampler2D`，采样器可以通过采样函数`texture2D()`从纹理中读取指定位置的颜色，例如我们编写这样一个片段着色器：

```glsl
uniform sampler2D u_texture;

varying vec2 v_texCoord;

void main() {
    gl_FragColor = texture2D(u_texture, v_texCoord);
}
```

在上一章中没有用上的那个`v_texCoord`在这里派上了用场！它表示的是在纹理上进行采样的**纹理空间坐标（Texture Space Coord）**，通常记作`u`和`v`，顶点上记录它们在纹理上进行采样的位置，通过varying插值后传递给片段着色器即可简单的实现将片段关联到纹理空间坐标。

纹理空间坐标**uv**是**归一化**的，纹理坐标也被缩放到了0到1之间，以图像的左下角为原点（0, 0），右上角为（1, 1）。

![textureCoord](/imgs/advanceGraphic/textureCoord.png)

现在，我们为片段着色器补充顶点着色器，并构造一个四边形的`Mesh`，用与上一章相同的方法将这个图像绘制到屏幕上：

`顶点着色器`
```glsl
attribute vec2 a_position;
attribute vec2 a_texCoord0;

varying vec2 v_texCoord;

void main() {
    v_texCoord = a_texCoord0;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
```

`片段着色器`
```glsl
uniform sampler2D u_texture;

varying vec2 v_texCoord;

void main() {
    gl_FragColor = texture2D(u_texture, v_texCoord);
}
```

```java
class Example{
  Mesh mesh = new Mesh(true, 4, 6,
      VertexAttribute.position,
      VertexAttribute.texCoords
  );
  Texture tex = new Texture(
      Vars.mods.getMod("example-mod").root.child("texture.png")
  );
  Shader shader = new Shader(vertexShaderFi, fragmentShaderFi);

  {
    mesh.setVertices(new float[]{
       //顶点坐标       纹理坐标
        -0.5f, -0.5f,  0f, 0f,
         0.5f, -0.5f,  1f, 0f,
         0.5f,  0.5f,  1f, 1f,
        -0.5f,  0.5f,  0f, 1f,
    });
    mesh.setIndices(new short[]{
        0, 1, 2, //第一个三角形
        0, 2, 3  //第二个三角形
    });
  }
  
  void draw(){
    shader.bind();
    tex.bind();   // 绑定纹理
    mesh.render(shader, Gl.triangles);
  }
}
```

不出意外你将会得到一张上下颠倒的渲染图像：

![img.png](/imgs/advanceGraphic/example-4.png)

图像会被颠倒是因为计算机上存储图像时，往往是从左上角开始为（0, 0），至图像的右下角为（1，1）。OpenGL并不关注图像的存储方式，当文件被加载到OpenGL纹理后，它始终认为纹理坐标的原点为左下角，因此直接使用OpenGL的纹理坐标采样会使得图像被颠倒。

![flip](/imgs/advanceGraphic/flip.png)

要解决这个问题也很简单，只需要将纹理坐标的v值取反即可，修改顶点坐标如下：

```java
void example(){
  //...
  mesh.setVertices(new float[]{
     //顶点坐标       纹理坐标
      -0.5f, -0.5f,  0f, 1f,
       0.5f, -0.5f,  1f, 1f,
       0.5f,  0.5f,  1f, 0f,
      -0.5f,  0.5f,  0f, 0f,
  });
  //...
}
```

这样就可以得到正确的渲染图像了：

![img.png](/imgs/advanceGraphic/example-5.png)

> 特意强调图像的翻转问题并非多此一举，因为纹理坐标的翻转在后续的纹理区域上被记录，其`v`正是翻转过后的。

## 环绕

前面我们说到，纹理空间的坐标是被缩放到了0-1之间的，这就有可能会存在超出范围外的数据，对于超出范围外的采样操作，OpenGL提供了三种环绕模式来决定如何处理越界的采样：

- `GL.clampToEdge`：超出范围外的采样点会被截断到纹理边缘的颜色
- `GL.repeat`：超出范围外的采样点会被重复采样
- `GL.mirroredRepeat`：超出范围外的采样点会被镜像采样

而Arc将这三种环绕模式封装成了枚举类`Texture.TextureWrap`，我们可以通过`setWrap`方法来设置纹理的环绕模式：

```java
void example(Texture tex) {
  tex.setWrap(Texture.TextureWrap.clampToEdge);
  tex.setWrap(Texture.TextureWrap.repeat);
  tex.setWrap(Texture.TextureWrap.mirroredRepeat);
}
```

三种环绕方式的效果：
