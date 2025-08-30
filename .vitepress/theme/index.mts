import { Theme } from "vitepress"
import DefaultTheme from "vitepress/theme"
import { Tab, Tabs } from "vue3-tabs-component"
import GitHubCard from "./components/GitHubCard.vue"
import "@red-asuka/vitepress-plugin-tabs/dist/style.css"
import { defineComponent } from "vue"
import './style/var.css'


export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("Tab", Tab)
    app.component("Tabs", Tabs)
    app.component("GitHubCard", GitHubCard)
  },
} as Theme
