import { defineConfig, UserConfig } from "vitepress"
import { generateSidebar, withSidebar } from "vitepress-sidebar"
import tabsPlugin from "@red-asuka/vitepress-plugin-tabs"
import { VitePressSidebarOptions } from "vitepress-sidebar/types"

// https://vitepress.dev/reference/site-config
const viteConfig: UserConfig = {
  markdown: {
    math: true,
    config: (md) => {
      tabsPlugin(md)
    },
  },

  title: "LearnMindustryMod",
  description: "Mindustry Mod 百科全书",

  srcDir: "docs",
  lastUpdated: true,

  rewrites: {
    "java/0-introduction/index.md": "java/index.md",
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Java", link: "/java" },
      { text: "通识",link: "/general"}
    ],
  
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/learn-mindustry-mod/learn-mindustry-mod.github.io",
      },
    ],
    editLink: {
      pattern:
        "https://github.com/learn-mindustry-mod/learn-mindustry-mod.github.io/edit/master/docs/:path",
    },
  },
}
function generateNav(name:string):VitePressSidebarOptions{
  return{
  documentRootPath: 'docs',
  scanStartPath: name,
  resolvePath: '/'+name+'/',
  useTitleFromFileHeading: true,
  useFolderTitleFromIndexFile: true,
  includeEmptyFolder: true,
  excludePattern: ["imgs", "readme","guideline"],
  }
}
export default defineConfig(withSidebar(viteConfig,
  [
    generateNav("java"),
    generateNav("general")
  ])
)
