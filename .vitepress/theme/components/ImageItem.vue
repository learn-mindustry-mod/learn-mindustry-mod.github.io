<script setup lang="ts">
import { computed, ref } from "vue"

const props = withDefaults(defineProps<{
  src: string
  caption?: string
  alt?: string
  width?: number
  height?: number
}>(), {
  caption: "",
  alt: "",
  width: 0,
  height: 0,
})

const ratio = ref(1)

function onLoad(e: Event) {
  const img = e.target as HTMLImageElement
  if (img.naturalWidth && img.naturalHeight) {
    ratio.value = img.naturalWidth / img.naturalHeight
  }
}

const imgStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.width) s.width = `${props.width}px`
  if (props.height) s.height = `${props.height}px`
  return s
})

const hasExplicitSize = computed(() => props.width > 0 || props.height > 0)
</script>

<template>
  <figure
    class="image-item"
    :class="{ 'explicit-size': hasExplicitSize }"
    :style="{ flexGrow: hasExplicitSize ? 0 : ratio }"
  >
    <img
      :src="src"
      :alt="alt || caption"
      :style="imgStyle"
      @load="onLoad"
    />
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.image-item {
  margin: 0;
  text-align: center;
  min-width: 100px;
}

.image-item:not(.explicit-size) img {
  width: 100%;
  height: auto;
}

.image-item img {
  display: block;
  border-radius: 4px;
}

.image-item figcaption {
  margin-top: 4px;
  font-size: 0.8em;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}
</style>
