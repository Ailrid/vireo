<template>
  <div
    ref="container"
    class="no-scrollbar h-full w-full overflow-y-auto scroll-smooth"
    :style="lct.lyricStyle"
    :class="{
      'lyric-mask': lct.setting.mask
    }"
    @wheel.passive="lct.onWheel"
  >
    <div ref="lyric" class="flex w-full flex-col gap-10" :style="lct.paddingStyle">
      <div
        v-for="(line, index) in lct.lyric?.lyrics"
        :key="index"
        :class="[
          lct.setting.center ? 'origin-center' : 'origin-left',
          lct.currentIndex === index ? 'scale-100 opacity-100' : 'scale-80 opacity-50',
          lct.currentIndex !== index && lct.setting.lyricBlur ? 'blur-[1px]' : ''
        ]"
        class="group lyric-content ease-[cubic-bezier(0.22, 1, 0.36, 1)] relative flex w-full cursor-pointer flex-col items-start rounded-xl transition-all duration-700 hover:opacity-100 hover:blur-[0px]"
        @click="SeekTimeMessage.send(line.time)"
      >
        <!-- 横虚线 -->
        <div
          class="pointer-events-none absolute inset-0 flex items-center opacity-0 transition-opacity duration-100 group-hover:opacity-100"
        >
          <div
            :style="lct.arrowStyle"
            class="ml-[-20px] border-y-[6px] border-l-[1rem] border-y-transparent"
          ></div>
          <div :style="lct.dashStyle" class="mx-4 h-[2px] flex-1 border-t border-dashed"></div>
          <span class="mr-4 font-mono text-sm">
            {{ formatTime(line.time) }}
          </span>
        </div>
        <!-- 歌词和翻译 -->
        <div class="text-3xl font-medium" :class="{ 'w-full text-center': lct.setting.center }">
          {{ line.text }}
        </div>

        <div
          v-if="line.trans"
          class="mt-3 text-2xl font-medium opacity-80"
          :class="{ 'w-full text-center': lct.setting.center }"
        >
          {{ line.trans }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { LyricController } from './controllers'
import { SeekTimeMessage } from '@/ccs/playback'
import { formatTime } from '@/utils'
const lct = useController(LyricController)
</script>

<style scoped>
.lyric-mask {
  mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.lyric-content {
  text-shadow:
    0 4px 8px rgba(0, 0, 0, 0.4),
    0 0 4px rgba(0, 0, 0, 0.2);
}
</style>


