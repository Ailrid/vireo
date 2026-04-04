<template>
  <div class="window" :style="tct.rootStyle" :class="{ border: tct.theme.mode !== 'image' }">
    <div
      v-if="tct.theme.mode === 'image'"
      class="image-bg z-0"
      style="background-image: var(--bg-image); background-size: cover; background-position: center"
    ></div>
    <!-- <div v-if="tct.theme.mode === 'image'" :style="tct.maskStyle" class="image-bg z-1"></div> -->
    <Layout></Layout>
    <!-- 弹窗的坑 -->
    <div id="dialog"></div>
  </div>
</template>
<script setup lang="ts">
import Layout from '@/layouts/Layout.vue'
import { useController } from '@virid/vue'
import { SettingThemeController } from '@/ccs/settings'
const tct = useController(SettingThemeController)
</script>

<style lang="css">
@reference "@/assets/main.css";
.window {
  @apply bg-card flex h-screen w-full flex-col overflow-hidden;
  color: var(--foreground);
}
.image-bg {
  @apply pointer-events-none absolute inset-0;
}
html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  user-select: none;
}
/* 滚动条整体轨道 */
::-webkit-scrollbar {
  width: 8px; /* 稍微窄一点更精致 */
  height: 8px;
}
/* 滚动条轨道 */
::-webkit-scrollbar-track {
  display: none;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--primary), transparent 70%);

  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: 10px;
  /* @apply transition-all duration-300; */
}

/* ::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--primary), transparent 40%);
} */

</style>
