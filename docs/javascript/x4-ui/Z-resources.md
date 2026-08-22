# 相关资源

## 章节代码

所有章节的代码都存放在了仓库：[Learn Mdt UI JS]()

<GitHubCard repo="Dustdustry/LearnMdtUI-JS"/>

## 工具函数

- 可视化表格布局函数：

::: details 点击查看完整工具函数代码

```js
/** 可视化表格布局的情况
 * @param {Table} table
 * @param {{
 *  drawTableBounds?: boolean
 *  drawCellBounds?: boolean
 *  drawElementBounds?: boolean
 *  drawMargin?: boolean
 *  drawPadding?: boolean
 * }} options
 */
function mountDebugElement(table, options) {
  const element = extend(Element, {
    draw() {
      this.super$draw()

      const { x, y } = this
      const drawTableBounds = options.drawTableBounds || false
      const drawCellBounds = options.drawCellBounds || false
      const drawElementBounds = options.drawElementBounds || false
      const drawMargin = options.drawMargin || false
      const drawPadding = options.drawPadding || false

      const mTop = table.getMarginTop()
      const mLeft = table.getMarginLeft()
      const mBottom = table.getMarginBottom()
      const mRight = table.getMarginRight()
      const tW = table.getWidth()
      const tH = table.getHeight()

      const contentX = x + mLeft
      const contentY = y + mBottom

      // table margin
      if (drawMargin) {
        const tMidCX = (mLeft + tW - mRight) / 2

        Draw.color(Color.green, 0.5)
        Fill.rect(x + mLeft / 2, y + tH / 2, mLeft, tH)
        Fill.rect(x + tW - mRight / 2, y + tH / 2, mRight, tH)
        Fill.rect(x + tMidCX, y + tH - mTop / 2, tW - mLeft - mRight, mTop)
        Fill.rect(x + tMidCX, y + mBottom / 2, tW - mLeft - mRight, mBottom)
      }

      // table bound
      if (drawTableBounds) {
        Lines.stroke(1)
        Draw.color(Pal.lightishGray, 0.8)
        Lines.rect(x, y, tW, tH)
        Draw.reset()
      }

      if (drawPadding || drawElementBounds) {
        table.getCells().each(
          cons((c) => {
            const e = c.get()
            if (e == this) return

            if (drawPadding) {
              const padTop = Reflect.get(c, "computedPadTop") || 0
              const padLeft = Reflect.get(c, "computedPadLeft") || 0
              const padBottom = Reflect.get(c, "computedPadBottom") || 0
              const padRight = Reflect.get(c, "computedPadRight") || 0

              const padX = x + e.x - padLeft
              const padY = y + e.y - padTop
              const padW = e.getWidth() + padLeft + padRight
              const padH = e.getHeight() + padTop + padBottom

              const padCX = padX + padW / 2
              const padMidCY = padY + padTop + (padH - padTop - padBottom) / 2
              const padRightCX = padX + padW - padRight / 2

              // padding (blue)
              Draw.color(Color.sky, 0.5)
              Fill.rect(padCX, padY + padTop / 2, padW, padTop)
              Fill.rect(padCX, padY + padH - padBottom / 2, padW, padBottom)
              Fill.rect(
                padX + padLeft / 2,
                padMidCY,
                padLeft,
                padH - padTop - padBottom,
              )
              Fill.rect(
                padRightCX,
                padMidCY,
                padRight,
                padH - padTop - padBottom,
              )
            }

            // element bound
            if (drawElementBounds) {
              Lines.stroke(1)
              Draw.color(Pal.accent, 0.8)
              Drawf.dashRectBasic(x + e.x, y + e.y, e.getWidth(), e.getHeight())
              Draw.reset()
            }
          }),
        )
      }

      // cell bound
      if (drawCellBounds) {
        const rows = table.getRows()
        const columns = table.getColumns()
        Lines.stroke(1)

        let cellX = 0,
          cellY = 0
        for (let rowIndex = rows - 1; rowIndex >= 0; rowIndex--) {
          let rowHeight = table.getRowHeight(rowIndex)

          drawText(
            Strings.autoFixed(rowHeight, 1),
            contentX + cellX - 8,
            contentY + cellY + rowHeight / 2,
            {
              color: Pal.lightishGray,
              scale: 0.8,
              align: Align.left,
            },
          )

          for (let colIndex = 0; colIndex < columns; colIndex++) {
            let columnWidth = table.getColumnWidth(colIndex)
            Draw.color(Pal.lightishGray, 0.6)
            Drawf.dashRectBasic(
              contentX + cellX,
              contentY + cellY,
              columnWidth,
              rowHeight,
            )

            if (rowIndex == 0) {
              drawText(
                Strings.autoFixed(columnWidth, 1),
                contentX + cellX + columnWidth / 2,
                contentY + cellY + rowHeight + 8,
                {
                  color: Pal.lightishGray,
                  scale: 0.8,
                  align: Align.bottom,
                },
              )
            }

            cellX += columnWidth
          }

          cellY += rowHeight
          cellX = 0
        }
      }
      Draw.reset()
    },
  })

  element.setFillParent(true)
  element.touchable = Touchable.disabled

  table.addChild(element)

  /**
   *
   * @param {{
   *  scale?: number
   *  align?: number
   *  outline?: boolean
   *  color?: Color
   * }} options
   */
  function drawText(text, x, y, options) {
    options = options || {}
    const scale = options.scale || 1
    const align = options.align || Align.center
    const outline = options.outline || false
    const color = options.color || Color.white

    let font = outline ? Fonts.outline : Fonts.def
    const layout = Pools.obtain(GlyphLayout, () => GlyphLayout)

    const ints = font.usesIntegerPositions()
    const lastScaleX = font.data.scaleX,
      lastScaleY = font.data.scaleY
    font.setUseIntegerPositions(false)
    font.data.setScale(scale)
    layout.setText(font, text)

    // 初始坐标是子框的左上角，把子框中心移到(x,y)
    x -= layout.width / 2
    y += layout.height / 2

    if (Align.isBottom(align)) {
      y += layout.height / 2
    } else if (Align.isTop(align)) {
      y -= layout.height / 2
    }

    if (Align.isLeft(align)) {
      x -= layout.width / 2
    } else if (Align.isRight(align)) {
      x += layout.width / 2
    }

    font.setColor(color)
    font.draw(text, x, y, layout.width, Align.center, false)

    Draw.reset()
    Pools.free(layout)

    font.setColor(Color.white)
    font.data.setScale(lastScaleX, lastScaleY)
    font.setUseIntegerPositions(ints)
  }
}
```
