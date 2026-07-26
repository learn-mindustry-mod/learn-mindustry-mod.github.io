<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(defineProps<{
    caption?: string
    width?: number
    height?: number
}>(), {
    caption: "",
    width: 0,
    height: 0,
})

const figureVars = computed(() => {
    const v: Record<string, string> = {}
    if (props.width) v["--gi-w"] = `${props.width}px`
    if (props.height) v["--gi-h"] = `${props.height}px`
    return v
})
</script>

<template>
    <figure class="image-item" :style="figureVars">
        <slot />
        <figcaption v-if="caption">{{ caption }}</figcaption>
    </figure>
</template>

<style scoped>
.image-item {
    margin: 0;
    text-align: center;
    min-width: 100px;
    width: fit-content;
}

.image-item :deep(img) {
    width: var(--gi-w, auto);
    height: var(--gi-h, auto);
    border-radius: 4px;
}

.image-item :deep(p) {
    margin: 0;
}

.image-item figcaption {
    margin-top: 4px;
    font-size: 0.8em;
    color: var(--vp-c-text-2);
    line-height: 1.4;
}
</style>
