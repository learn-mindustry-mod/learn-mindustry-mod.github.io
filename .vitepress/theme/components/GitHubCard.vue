<script setup lang="ts">
// https://anmolgautam.com/repo-card/repo-card.js
import { computed, CSSProperties, onMounted, ref, reactive } from "vue"
import { useData } from "vitepress"
import colors from "./LanguageColor"
const { isDark } = useData()
const props = defineProps({
  repo: { type: String, required: true },
})
const CACHE_TIMEOUT = 60000
async function get(url: string) {
  const now = new Date().getTime()
  const prevResp = JSON.parse(localStorage.getItem(url))
  if (prevResp && Math.abs(now - prevResp.time) < CACHE_TIMEOUT) {
    return prevResp.data
  }
  const resp = await fetch(url)
  const json = await resp.json()
  localStorage.setItem(url, JSON.stringify({ time: now, data: json }))
  return json
}

const data = ref<any>();
const name = ref<string>("Loading")
const description = ref<string>("Loading")
const language = ref<string>("")
const stargazers_count = ref(0)
const forks = ref(0)
onMounted(() => {
  get(`https://api.github.com/repos/${props.repo}`).then((res) => {
    data.value = res
    name.value = res.name
    description.value = res.description
    language.value = res.language
    if (language.value == null) language.value = ""
    stargazers_count.value = res.stargazers_count
    forks.value = res.forks
  })
})
const theme = computed(() =>
  isDark.value
    ? {
      background: "rgba(0,0,0,0.3)",
      borderColor: "rgb(48, 54, 61)",
      color: "rgb(139, 148, 158)",
      linkColor: "rgb(88, 166, 255)",
      fontColor: "#dfdfd6"
    }
    : {
      background: "rgba(255,255,255,0.3)",
      borderColor: "#e1e4e8",
      color: "#586069",
      linkColor: "#0366d6",
      fontColor: "#1b1b1f"
    },
)
const base_style = reactive<CSSProperties>({
  'border': `1px solid ${theme.value.borderColor}`,
  "border-radius": "6px",
  'padding': "16px",
  "line-height": "1.5",
  'color': theme.value.fontColor,
  "font-size": "14px",
})
const svg_style = reactive<CSSProperties>({
  'fill': theme.value.color,
  "margin-right": "8px"
})
</script>
<template>
  <div :style="[base_style, theme]">
    <div style="display: flex; align-items: center">
      <svg :style="svg_style" viewBox="0 0 16 16" version="1.1" width="24" height="24" aria-hidden="true">
        <path fill-rule="evenodd"
          d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z">
        </path>
      </svg>
      <span :style="{ 'font-weight': 1000, 'color': theme.linkColor, 'font-size': '18px' }">
        <a style="text-decoration: none; color: inherit"
          :href="`${data == undefined ? 'https://github.com' : data.html_url}`">
          {{ name }}
        </a>
      </span>
    </div>
    <div :style="{ 'font-size': '12px', 'margin-bottom': '16px', 'margin-top': '8px', 'color': theme.fontColor }">{{
      description }}</div>
    <div :style="{ 'font-size': '12px', 'color': theme.fontColor, 'display': 'flex' }">
      <div :style="language.length != 0 ? { 'margin-right': '16px' } : { 'display': 'none', 'margin-right': '16px' }">
        <span
          :style="{ 'width': '12px', 'height': '12px', 'border-radius': '100%', 'background-color': language.length != 0 ? (colors[language] ? colors[language].color : 'white') : '', 'display': 'inline-block', 'top': '1px', 'position': 'relative', 'margin-right': '3px' }"></span>
        <span>{{ language }}</span>
      </div>
      <div :style="{ 'display': 'flex', 'align-items': 'center', 'margin-right': '16px' }">
        <svg :style="{ 'fill': theme.color }" aria-label="stars" viewBox="0 0 16 16" version="1.1" width="16"
          height="16" role="img">
          <path fill-rule="evenodd"
            d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z">
          </path>
        </svg>
        &nbsp; <span>{{ stargazers_count }}</span>
      </div>
      <div :style="{ 'display': forks === 0 ? 'none' : 'flex', 'align-items': 'center' }">
        <svg :style="{ 'fill': theme.color }" aria-label="fork" viewBox="0 0 16 16" version="1.1" width="16" height="16"
          role="img">
          <path fill-rule="evenodd"
            d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z">
          </path>
        </svg>
        &nbsp; <span>{{ forks }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
