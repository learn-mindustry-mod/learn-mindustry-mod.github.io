import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({

  title: "Learn Mindustry Mod",
  description: "Mindustry Mod Encyclopedia",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    nav: [
      { text: 'Java', link: '/' }
    ],

    sidebar: [
      {
        text: 'Learn Mindustry Mod',
        items: [
          { text: 'Java教程序', link: '/' },
          { text: '模组开发环境与部署', items:[
            {text: '使用Android端开发Mod', link:'1-environment/4-build-on-android'}
          ]},
          { text: '创建游戏内容', items:[
            
          ]},
          { text: '调试', items:[
            
          ]},
          { text: '绘图与动画', items:[
            
          ]},
          { text: '图形用户操作界面编程（GUI）', items:[
            
          ]},
          { text: '程序架构', items:[
            
          ]},
          { text: '高级图形效果', items:[
            { text: 'OpenGL概述', link: '/8-opengl/1-opengl-overall' },
            { text: '图像是如何被渲染到屏幕上的？', link: '/8-opengl/2-how-images-rendered' },
            { text: '着色器（Shader）', link: '/8-opengl/3-about-shader' },
            { text: '纹理，纹理区域与Pixmap', link: '/8-opengl/4-texture-and-pixmap' },
            { text: '变换，投影与摄像机（Camera）', link: '/8-opengl/5-transformation-projection-and-camera' }
          ]}
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
