<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(defineProps<{
  gap?: number
}>(), {
  gap: 8,
})

const containerStyle = computed(() => ({
  display: "flex",
  flexWrap: "wrap",
  gap: `${props.gap}px`,
  alignItems: "flex-start",
}))
</script>

<template>
  <div class="image-grid" :style="containerStyle">
    <slot />
  </div>
</template>

<style scoped>
.image-grid {
  margin: 16px 0;
}

.image-grid::after {
  content: "";
  flex-grow: 999999999;
}
</style>
