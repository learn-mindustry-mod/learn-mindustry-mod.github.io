import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({

  title: "PlumPedia",
  description: "Mindustry Mod Encyclopedia",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    nav: [
      { text: '百科', link: '/' }
    ],

    sidebar: [
      {
        text: 'PlumPedia',
        items: [
          { text: '教程序', link: '/' },
          { text: '必修一 源码与构建', items:[
            {text: '使用Android端开发Mod', link:'/building/build-on-android'}
          ]},
          { text: '必修二 数据与代码', items:[
            
          ]},
          { text: '必修三 贴图与策划', items:[
            
          ]},
          { text: '选修二 图形学', items:[
            { text: 'OpenGL概述', link: '/opengl/opengl-overall' },
            { text: '图像是如何被渲染到屏幕上的？', link: '/opengl/how-images-rendered' },
            { text: '着色器（Shader）', link: '/opengl/about-shader' }
          ]}
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
