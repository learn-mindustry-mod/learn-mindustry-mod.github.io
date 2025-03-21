import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: { math: true },

  title: "Mindustry Mod教程",
  description: "Mindustry Mod 百科全书",

  srcDir: "docs",
  lastUpdated: true,

  rewrites: {
    '0-introduction/index.md': 'index.md',
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Java', link: '/' }
    ],
    sidebar: generateSidebar({
      documentRootPath: 'docs',
      useTitleFromFileHeading: true,
      useFolderTitleFromIndexFile: true,
      includeEmptyFolder: true,
      excludePattern: ['imgs', 'readme'],
    }),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/learn-mindustry-mod/learn-mindustry-mod.github.io' }
    ],
    editLink: {
      pattern: 'https://github.com/learn-mindustry-mod/learn-mindustry-mod.github.io/edit/master/docs/:path'
    }
  },
})
