# 图形化页面 UI

UI 用于向玩家展示信息（数据库、小地图等），提供交互入口（选择建造的建筑、修改建筑配置、蓝图管理等）

<ImageGrid cols="2" gap=40>
  <ImageItem height=200 src="./imgs/database.png" caption="展示信息" />
  <ImageItem height=200 src="./imgs/config.png" caption="提供交互入口" />
</ImageGrid>

# Hello World - 入门 UI

我们暂时先不追究原理，先在 `main.js` 中手动敲入以下代码：

```js
Events.on(ClientLoadEvent, (e) => {
  const dialog = new BaseDialog("Learn Mindustry UI")
  dialog.cont.add("Hello World!")
  dialog.addCloseButton()
  dialog.show()
})
```

保存后打开游戏，运行正常时，你会看到如下页面：

<ImageItem src="./imgs/hello-world.png"></ImageItem>

这样，我们就写出了第一份页面，之后的教程也将以此页面为基础，一步一步的引入更多UI的内容。

# My First Page - 初识页面

我们先修改 BaseDialog 的参数，看看页面会有什么不同：

```js
Events.on(ClientLoadEvent, (e) => {
  const dialog = new BaseDialog("Learn Mindustry UI") // [!code --]
  const dialog = new BaseDialog("My First Page") // [!code ++]
  dialog.cont.add("Hello World!")
  dialog.addCloseButton()
  dialog.show()
})
```

进入游戏后注意观察页面顶部，可以发现，页面顶部的标题发生了变动。

没错，BaseDialog 的第一个参数正是页面的**标题(title)**。

<ImageGrid cols="2" gap=40>
    <ImageItem width=200 src="./imgs/title-before.png" caption="修改前" />
    <ImageItem width=200 src="./imgs/title-after.png" caption="修改后" />
</ImageGrid>

---

同样，你也可以试试修改 `"Hello World!"` 看看页面会发生什么变化：

```js
Events.on(ClientLoadEvent, (e) => {
  const dialog = new BaseDialog("My First Page")
  dialog.cont.add("Hello World!") // [!code --]
  dialog.cont.add("Welcome to my first page!") // [!code ++]
  dialog.addCloseButton()
  dialog.show()
})
```

可以看到，页面中央的 **文本(Text)** 发生了变化：

<ImageGrid cols="2" gap=40>
    <ImageItem width=200 src="./imgs/cont-text-before.png" caption="修改前" />
    <ImageItem width=200 src="./imgs/cont-text-after.png" caption="修改后" />
</ImageGrid>

---

有了上述的探索，你应该能感受到下面部分代码的作用：

1. 我们是先创建了一个**标题**为 `My First Page` 的**页面**
2. 往页面上添加了**文本** `Welcome to my first page!`
3. 向页面添加了返回**按钮(Button)**
4. 把页面显示出来

```js
Events.on(ClientLoadEvent, (e) => {
  const dialog = new BaseDialog("My First Page") // 创建页面
  dialog.cont.add("Welcome to my first page!") // 添加文本
  dialog.addCloseButton() // 添加返回按钮
  dialog.show() // 显示页面
})
```

经过上述解释，现在你应该已经了解了一个页面的创建和显示过程。

现在你肯定还有一些疑惑：

1.  为什么我要写 `Events.on(ClientLoadEvent, (e) => {...})`，这是必须的吗？
    - 对，这是**必须**的。不过至于为什么，我们先按住不表，后续会给出解释，我们先按照已给出的代码，一步一步学习。

---

# Label & Image - 初识文本、图片

现在，我们进一步添加新的内容：

```js
Events.on(ClientLoadEvent, (e) => {
  const dialog = new BaseDialog("My First Page")
  dialog.cont.add("Welcome to my first page!")
  dialog.cont.add("Mono is mining") // [!code ++]
  dialog.cont.image(Items.copper.uiIcon) // [!code ++]
  dialog.addCloseButton()
  dialog.show()
})
```

1. 调用 `add`，添加新文本
2. 调用 `image`，并传入图片，添加**图片元素(Image)**

这样，我们的页面就新增了文本和图片：
<ImageItem src="./imgs/text-image.png" caption="新增文本和图片" />

图片的来源非常广泛，在我们的代码里，通过 `Items.copper.uiIcon` 获取到了铜的图标。

- 任何`UnlockableContent`都有`uiIcon`的图标字段，因此你也可以试着把铜改成单位、建筑、液体等，来获取它们的图标。

- 除了获取内容的图标，你还可以获取游戏内的其他图标，这些图标都被放在了编译时生成的类`Icon`中。你可以在 LMM 群文件找到 `Icon` 文件。

- 当然你还可以添加自己模组的图片，这里我们先不演示，后续深入时再演示。

接下来我们就在代码里演示这些图片来源：

```js
Events.on(ClientLoadEvent, (e) => {
  const dialog = new BaseDialog("My First Page")
  dialog.cont.add("Welcome to my first page!")
  dialog.cont.add("Mono is mining")
  dialog.cont.image(Items.copper.uiIcon)

  dialog.cont.image(UnitTypes.flare.uiIcon) // [!code ++]
  dialog.cont.image(Blocks.duo.uiIcon) // [!code ++]
  dialog.cont.image(Liquids.water.uiIcon) // [!code ++]
  dialog.cont.image(Icon.upload) // [!code ++]
  dialog.cont.image(Icon.cancel) // [!code ++]

  dialog.addCloseButton()
  dialog.show()
})
```

<ImageItem src="./imgs/more-image.png" caption="新增更多图片!" />

# Table - 初识表格

目前，我们的 **UI元素(Element)** 还只能在一行摆放，如果希望实现换行，调整元素大小、间距，我们就必须引入一些专门用于 **布局(Layout)** 的元素。

在 Mindustry 的UI引擎里，最常用的布局元素就是 **表格(Table)**，相对应的布局方式就是 **表格布局(Table Layout)**。

- 我们先修改一下代码，给页面添加一个表格，再把图片元素放到表格内：

```js
Events.on(ClientLoadEvent, (e) => {
  const dialog = new BaseDialog("My First Page")
  dialog.cont.add("Welcome to my first page!")
  dialog.cont.add("Mono is mining")
  dialog.cont.image(Items.copper.uiIcon)

  // [!code --:5]
  dialog.cont.image(UnitTypes.flare.uiIcon)
  dialog.cont.image(Blocks.duo.uiIcon)
  dialog.cont.image(Liquids.water.uiIcon)
  dialog.cont.image(Icon.upload)
  dialog.cont.image(Icon.cancel)

  // [!code ++:7]
  dialog.cont.table(null, (table) => {
    table.image(UnitTypes.flare.uiIcon)
    table.image(Blocks.duo.uiIcon)
    table.image(Liquids.water.uiIcon)
    table.image(Icon.upload)
    table.image(Icon.cancel)
  })

  dialog.addCloseButton()
  dialog.show()
})
```

页面上的图标 **间距(Padding)** 变紧凑了，而且似乎没有其他变化。

<ImageGrid cols="2" gap=40>
    <ImageItem src="./imgs/more-image.png" caption="修改前" />
    <ImageItem src="./imgs/table-1.png" caption="修改后" />
</ImageGrid>

- 那么继续修改代码，把间距加回来：

```js
Events.on(ClientLoadEvent, (e) => {
  const dialog = new BaseDialog("My First Page")
  dialog.cont.add("Welcome to my first page!")
  dialog.cont.add("Mono is mining")
  dialog.cont.image(Items.copper.uiIcon)

  // [!code focus:8]
  dialog.cont.table(null, (table) => {
    // [!code ++:5]
    table.image(UnitTypes.flare.uiIcon).pad(4)
    table.image(Blocks.duo.uiIcon).pad(4)
    table.image(Liquids.water.uiIcon).pad(4)
    table.image(Icon.upload).pad(4)
    table.image(Icon.cancel).pad(4)
  })

  dialog.addCloseButton()
  dialog.show()
})
```

现在，页面上图标间的间距就回来了。

<ImageGrid cols="2" gap=40>
    <ImageItem src="./imgs/table-1.png" caption="修改前" />
    <ImageItem src="./imgs/table-2-pad.png" caption="修改后" />
</ImageGrid>

- 继续修改代码，让表格在水的图标的前面换行：

```js
Events.on(ClientLoadEvent, (e) => {
  const dialog = new BaseDialog("My First Page")
  dialog.cont.add("Welcome to my first page!")
  dialog.cont.add("Mono is mining")
  dialog.cont.image(Items.copper.uiIcon)

  // [!code focus:8]
  dialog.cont.table(null, (table) => {
    table.image(UnitTypes.flare.uiIcon).pad(4)
    table.image(Blocks.duo.uiIcon).pad(4)
    table.row() // [!code ++]
    table.image(Liquids.water.uiIcon).pad(4)
    table.image(Icon.upload).pad(4)
    table.image(Icon.cancel).pad(4)
  })

  dialog.addCloseButton()
  dialog.show()
})
```

<ImageItem src="./imgs/table-3-row.png" caption="表格换行" />

- 只有图标还是有些单调，我们给表格加一些文字：

```js
Events.on(ClientLoadEvent, (e) => {
  const dialog = new BaseDialog("My First Page")
  dialog.cont.add("Welcome to my first page!")
  dialog.cont.add("Mono is mining")
  dialog.cont.image(Items.copper.uiIcon)

  // [!code focus:8]
  dialog.cont.table(null, (table) => {
    table.add("星辉和双管炮：") // [!code ++]
    table.image(UnitTypes.flare.uiIcon).pad(4)
    table.image(Blocks.duo.uiIcon).pad(4)
    table.row()
    table.add("水和图标：") // [!code ++]
    table.image(Liquids.water.uiIcon).pad(4)
    table.image(Icon.upload).pad(4)
    table.image(Icon.cancel).pad(4)
  })

  dialog.addCloseButton()
  dialog.show()
})
```

现在文本 `星辉和双管炮：` 和 `水和图标：` 在同一**列(Column)** 并且 **居中对齐(Center Alignment)**。图标也各自居中对齐。

<ImageItem src="./imgs/table-4-text.png" caption="表格文本" />

- 经过上面的探索，你会发现表格添加文本和图片的方式，和之前在页面上添加文本和图片的方式完全一致。这是因为，`dialog.cont` 其实就是一个 **表格(Table)**。

- 而且你可以看到，我们通过 `dialog.cont.table(...)` 向页面添加表格，`dialog.cont`本身也是个表格，这就说明，**表格是可以嵌套的**——这是表格布局的基础。

- 现在你对 **表格(Table)** 应该有了一定的理解，不过同样有些代码没有做解释：

1.  为什么在添加表格的时候，第一个参数是 `null`，这是必须的吗?

<GridText>

**这不是必须的。**

如果你省去 `null`：

```js
dialog.cont.table((table) => {})
```

你会发现游戏会报错：<ImageItem height=200 src="./imgs/table-param-1-error.png" caption="报错" />

这是因为添加表格元素的函数有很多种，而它们的参数类型各不相同。JS 引擎会尝试根据你传入的类型，去匹配同名函数，上面的写法第一个参数类型是`Function`，引擎无法根据 `Function` 区分开 `table(Cons)` 和 `table(Drawable)` 函数。如果要写成单参数，正确的写法如下：

```js
dialog.cont.table(cons((table) => {}))
```

但这种写法会显得很啰嗦，而且容易漏掉一对小括号，或者漏掉大括号，不推荐。

</GridText>

<ImageItem height=150 src="./imgs/table-param-1.png" caption="添加表格的所有函数" />

2. `table.add` 和 `table.image` 函数的返回值是什么，为什么调用返回值`pad`函数就能调整间距?
   - 这将在下一章 **表格布局(Table Layout)** 里深入讲解。

# Cell - 表格布局

> 施工中...

# Button - 按钮交互世界

> 施工中...
