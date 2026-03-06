<template>
  <div
    class="flex h-screen w-full flex-col overflow-hidden border"
    :class="stc.themeClasses"
    :style="stc.rootStyle"
  >
    <!-- 图片背景 -->
    <div
      v-if="stc.setting.theme.mode === 'image'"
      class="absolute inset-0 z-0 pointer-events-none"
      style="background-image: var(--bg-image); background-size: cover; background-position: center"
    ></div>
    <!-- 图片背景的遮罩，处理模糊程度和透明度 -->
    <div
      v-if="stc.setting.theme.mode === 'image'"
      :style="stc.maskStyle"
      class="inset-0 z-1 absolute pointer-events-none"
    ></div>
    <!-- 侧边栏 -->
    <div class="flex flex-1 overflow-hidden z-10">
      <aside
        class="bg-sidebar backdrop-blur-xl flex w-64 flex-col overflow-hidden z-10 border-r border-black/5 dark:border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-none"
      >
        <TitleBarLeft class="h-12 shrink-0" />
        <div class="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </aside>
      <!-- 主体内容 -->
      <main class="flex flex-1 flex-col overflow-hidden transition-colors bg-background">
        <TitleBarRight class="h-12 shrink-0" />
        <div class="flex-1 overflow-y-auto">
          <RouterView />
        </div>
      </main>
    </div>
    <!-- 底部播放条 -->
    <div
      class="bg-card backdrop-blur-xl h-20 overflow-hidden shrink-0 z-50 border-t border-black/5 dark:border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] dark:shadow-none"
    >
      <Player />
    </div>
  </div>
</template>
<script setup lang="ts">
import TitleBarLeft from './titlebar/TitleBarLeft.vue'
import TitleBarRight from './titlebar/TitleBarRight.vue'
import Sidebar from '@components/sidebar/SideBar.vue'
import Player from '@components/player/Player.vue'
import { useController } from '@virid/vue'
import { SettingController } from '@/ccs/settings'
const stc = useController(SettingController)
</script>

<style lang="scss" scoped></style>
