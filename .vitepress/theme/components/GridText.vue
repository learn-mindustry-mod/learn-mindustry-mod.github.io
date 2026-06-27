<script setup lang="ts">
import { computed } from "vue"
import MarkdownIt from "markdown-it"

const props = withDefaults(defineProps<{
  text?: string
}>(), {
  text: "",
})

const md = new MarkdownIt({ html: true })

const rendered = computed(() => (props.text ? md.render(props.text) : ""))
</script>

<template>
  <div class="grid-text">
    <div v-if="rendered" v-html="rendered" />
    <slot v-else />
  </div>
</template>

<style scoped>
.grid-text {
  margin: 0;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  font-size: 0.9em;
  line-height: 1.6;
  min-width: 150px;
}

.grid-text :deep(p) {
  margin: 0 0 0.5em;
}

.grid-text :deep(p:last-child) {
  margin-bottom: 0;
}

.grid-text :deep(code) {
  font-size: 0.875em;
}

.grid-text :deep(ul),
.grid-text :deep(ol) {
  padding-left: 1.2em;
  margin: 0;
}

.grid-text :deep(li) {
  margin: 0.2em 0;
}
</style>
