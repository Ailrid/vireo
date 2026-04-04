<template>
  <div class="group relative h-full w-full overflow-hidden">
    <div v-if="!isLoaded || !cover" class="bg-primary/5 absolute inset-0 z-0">
      <div class="bg-primary/10 h-full w-full animate-pulse"></div>
    </div>

    <Transition name="fade">
      <img
        v-if="cover"
        :key="cover"
        :src="cover"
        class="absolute inset-0 z-10 h-full w-full object-cover duration-700 ease-out group-hover:scale-110"
        :class="{ 'opacity-0': !isLoaded, 'opacity-100': isLoaded }"
        alt="Cover"
        @load="handleLoad"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  cover: string
}>()

const isLoaded = ref(false)

const handleLoad = () => {
  isLoaded.value = true
}
</script>

<style scoped>
.fade-enter-active {
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
}

/* 硬件加速，防止缩放时抖动 */
img {
  will-change: transform, opacity;
  transform: translateZ(0);
}
</style>
