import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PlumPedia",
  description: "Mindustry Mod Encyclopedia",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '百科', link: '/教程序' }
    ],

    sidebar: [
      {
        text: 'PlumPedia',
        items: [
          { text: '教程序', link: '/教程序' },
          { text: '必修一 源码与构建', items:[

          ]},
          { text: '必修二 数据与代码', items:[
            
          ]},
          { text: '必修三 贴图与策划', items:[
            
          ]}
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
