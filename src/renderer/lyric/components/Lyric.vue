<template>
  <div
    class="relative flex h-screen w-screen flex-col overflow-hidden rounded-xl transition-all duration-300 select-none"
    :class="[
      lct.isLocked
        ? 'bg-transparent'
        : 'border border-black/10 bg-black/60 shadow-2xl backdrop-blur-md'
    ]"
    :style="{ color: lct.dynamicTextColor }"
  >
    <!-- Title Controls Area  -->
    <div v-if="!lct.isLocked" class="drag z-50 flex h-11 w-full items-center justify-between px-3">
      <div class="w-8"></div>

      <div class="no-drag flex items-center justify-center space-x-1">
        <Button
          variant="icon"
          class="hover:text-primary h-8 w-8 active:opacity-50"
          @click="lct.toggleLock()"
        >
          <Lock v-if="lct.isLocked" :size="18" :stroke-width="1.2" />
          <Unlock v-else :size="18" :stroke-width="1.2" />
        </Button>

        <Button
          variant="icon"
          class="hover:text-primary h-8 w-8 active:opacity-50"
          @click="lct.zoomInFont()"
        >
          <AArrowUp :size="18" :stroke-width="1.2" />
        </Button>

        <Button
          variant="icon"
          class="hover:text-primary h-8 w-8 active:opacity-50"
          @click="PreviousSongMessage.send()"
        >
          <SkipBack :size="18" :stroke-width="1.2" />
        </Button>

        <Button
          variant="icon"
          class="hover:text-primary h-8 w-8 active:opacity-50"
          @click="PlayOrPauseMessage.send()"
        >
          <Play v-if="!lct.isPlaying" :size="18" :stroke-width="1.2" />
          <Pause v-else :size="18" :stroke-width="1.2" />
        </Button>

        <Button
          variant="icon"
          class="hover:text-primary h-8 w-8 active:opacity-50"
          @click="NextSongMessage.send()"
        >
          <SkipForward :size="18" :stroke-width="1.2" />
        </Button>

        <Button
          variant="icon"
          class="hover:text-primary h-8 w-8 active:opacity-50"
          @click="lct.zoomOutFont()"
        >
          <AArrowDown :size="18" :stroke-width="1.2" />
        </Button>
      </div>

      <div class="no-drag flex items-center">
        <Button
          variant="icon"
          class="hover:text-destructive h-8 w-8 active:opacity-50"
          @click="lct.closeLyricWindow()"
        >
          <X :size="18" :stroke-width="1.2" />
        </Button>
      </div>
    </div>

    <!--  Lyric Content Area -->
    <div
      class="flex flex-1 flex-col justify-center px-8 py-2"
      :class="[lct.isLocked ? 'drag' : '']"
      :style="{
        fontFamily: lct.theme?.fontFamily || 'inherit'
      }"
    >
      <!-- 有翻译：第一行左对齐，第二行右对齐 -->
      <template v-if="lct.destLyric?.trans">
        <div
          class="w-full truncate text-left font-bold tracking-wide transition-all duration-200"
          :style="{ fontSize: `${1.75 * lct.computedFontScale}rem` }"
        >
          {{ lct.destLyric.text }}
        </div>
        <div
          class="mt-1 w-full truncate text-right font-medium opacity-80 transition-all duration-200"
          :style="{ fontSize: `${1.3 * lct.computedFontScale}rem` }"
        >
          {{ lct.destLyric.trans }}
        </div>
      </template>

      <!-- 无翻译：居中单行显示 -->
      <template v-else>
        <div
          class="w-full truncate text-center font-bold tracking-wide transition-all duration-200"
          :style="{ fontSize: `${1.9 * lct.computedFontScale}rem` }"
        >
          {{ lct.destLyric?.text || '听你想听的音乐' }}
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import Button from '@/components/ui/Button.vue'
import {
  Lock,
  Unlock,
  AArrowUp,
  AArrowDown,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  X
} from 'lucide-vue-next'

import { LyricController } from './controllers'
import { PlayOrPauseMessage, NextSongMessage, PreviousSongMessage } from '../ccs'

const lct = useController(LyricController)
</script>

<style scoped>
.drag {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
