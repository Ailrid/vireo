<template>
  <div class="window">
    <!-- 图片背景 -->
    <div v-if="tct.theme.mode === 'image'" class="absolute inset-0 z-0 overflow-hidden">
      <Transition name="bg-fade">
        <div
          :key="tct.theme.url"
          class="image-bg absolute inset-0"
          :style="{
            backgroundImage: `url(${tct.theme.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }"
        ></div>
      </Transition>
    </div>
    <div v-if="tct.theme.mode === 'image'" :style="tct.maskStyle" class="image-bg z-1"></div>
    <!-- 上半部分 -->
    <div class="z-10 flex flex-1 overflow-hidden">
      <aside class="side-bar flex w-64 flex-col">
        <TitleBarLeft class="h-12 shrink-0" />
        <div class="flex flex-1 flex-col overflow-hidden">
          <Sidebar class="h-full" />
        </div>
      </aside>
      <main class="bg-background flex flex-1 flex-col overflow-hidden">
        <TitleBarRight class="h-12 shrink-0" />
        <div class="relative flex flex-1 flex-col overflow-hidden">
          <router-view v-slot="{ Component, route }">
            <Transition name="page-slide">
              <component :is="Component" :key="route.fullPath" />
            </Transition>
          </router-view>
        </div>
      </main>
    </div>
    <!-- 底部播放条 -->
    <div class="player h-20 shrink-0">
      <Player />
    </div>
  </div>
</template>
<script setup lang="ts">
import TitleBarLeft from './titlebar/TitleBarLeft.vue'
import TitleBarRight from './titlebar/TitleBarRight.vue'
import Sidebar from '@components/sidebar/SideBar.vue'
import Player from '@/components/player/PlayerBar.vue'
import { useController } from '@virid/vue'
import { SettingThemeController } from '@/ccs/settings'

const tct = useController(SettingThemeController)
</script>

<style scoped>
@reference "@/assets/main.css";
.window {
  @apply flex h-screen w-full flex-col overflow-hidden;
  color: var(--foreground);
}
.image-bg {
  @apply pointer-events-none absolute inset-0;
}
.side-bar {
  @apply bg-sidebar z-10 overflow-hidden border-r border-black/5 shadow-[6px_0_15px_-3px_rgba(0,0,0,0.05)] backdrop-blur-md dark:border-white/10 dark:shadow-none;
}
.player {
  @apply bg-card z-50 border-t border-black/5 shadow-[0_-8px_20px_-6px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-white/10 dark:shadow-none;
}

.page-slide-enter-active,
.page-slide-leave-active {
  transition:
    transform 0.5s cubic-bezier(0.33, 1, 0.68, 1),
    clip-path 0.5s cubic-bezier(0.33, 1, 0.68, 1);
}

.page-slide-enter-from {
  transform: translateX(100%);
  width: 100%;
}

.page-slide-enter-to {
  transform: translateX(0);
  width: 100%;
}
.page-slide-enter-active {
  position: absolute;
  width: 100%;
  z-index: 50;
}

.page-slide-leave-active {
  position: absolute;
  width: 100%;
  z-index: 0;
}

.page-slide-leave-from {
  transform: translateY(0);
  width: 100%;
}

.page-slide-leave-to {
  transform: translateY(100%);
}
.bg-fade-enter-active,
.bg-fade-leave-active {
  transition: opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.bg-fade-leave-active {
  position: absolute;
}

.bg-fade-enter-from,
.bg-fade-leave-to {
  opacity: 0;
}
</style>
