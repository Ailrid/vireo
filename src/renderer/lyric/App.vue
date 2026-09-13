<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-transparent">
    <Lyric></Lyric>
  </div>
</template>
<script setup lang="ts">
import Lyric from './components/Lyric.vue'
</script>

<style lang="css">
html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  user-select: none;
  background: none;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  display: none;
}

::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--primary), transparent 70%);

  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: 10px;
}
</style>
