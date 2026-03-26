<template>
  <div class="relative flex shrink-0 flex-col items-center justify-center">
    <div class="absolute -top-13 left-1/2 z-50 -translate-x-1/2">
      <div class="group/cover relative h-24 w-24 shrink-0">
        <img
          :src="sct.cover"
          class="cover h-full w-full"
          :class="['animate-spin-slow', { 'pause-animation': !sct.isPlaying }]"
        />

        <div
          class="play-btn-container absolute inset-0 flex items-center justify-center"
          @click="PlayOrPauseMessage.send(!sct.isPlaying)"
        >
          <div class="play-btn flex h-12 w-12 items-center justify-center">
            <Button variant="icon">
              <Play v-if="!sct.isPlaying" class="h-6 w-6 fill-current" />
              <Pause v-else class="h-6 w-6 fill-current" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex w-full flex-col items-center">
      <div class="flex w-full">
        <div class="flex-1" @dblclick="PlayerControllerMessage.send($event, true)"></div>
        <div class="flex w-[80%] items-center justify-between px-2">
          <Button variant="icon" @click="PreviousSongMessage.send()">
            <SkipBack class="control-btn"
          /></Button>
          <Button variant="icon" @click="NextSongMessage.send()">
            <SkipForward class="control-btn"
          /></Button>
        </div>
        <div class="flex-1" @dblclick="PlayerControllerMessage.send($event, true)"></div>
      </div>

      <div class="flex w-full">
        <div class="flex-1" @dblclick="PlayerControllerMessage.send($event, true)"></div>
        <div v-if="sct.currentSong" class="flex max-w-[80%] items-center px-2 whitespace-nowrap">
          <span class="song-text text-right">
            {{ sct.currentSong?.name }}
          </span>
          <span class="mx-0.5 shrink-0">-</span>
          <span class="song-text text-left">
            {{ sct.currentSong?.artists[0].name }}
          </span>
        </div>
        <div class="flex-1" @dblclick="PlayerControllerMessage.send($event, true)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { SkipBack, SkipForward, Play, Pause } from 'lucide-vue-next'
import { PlayOrPauseMessage, NextSongMessage, PreviousSongMessage } from '@/ccs/playback'
import { PlayerControllerMessage, SongCardController } from './controllers'
import { useController } from '@virid/vue'

const sct = useController(SongCardController)
</script>

<style scoped>
@reference "@/assets/main.css";
.cover {
  @apply border-background rounded-full border-4 object-cover shadow-2xl transition-transform duration-500 group-hover/cover:rotate-12;
}
.play-btn-container {
  @apply cursor-pointer rounded-full opacity-0 backdrop-blur-sm transition-all duration-300 group-hover/cover:opacity-100;
}
.play-btn {
  @apply bg-card border-border/50 rounded-full border shadow-md transition-transform hover:scale-110 active:scale-95;
}
.song-text {
  @apply max-w-[7rem] cursor-pointer truncate text-right text-xs transition-all duration-300 ease-out;
  transform: scale(1);
  backface-visibility: hidden;
}
.control-btn {
  @apply m-1 h-5 w-5 cursor-pointer fill-current transition-all duration-300 hover:scale-110 active:scale-95;
}
.song-text:hover {
  transform: scale(1.08);
  @apply text-foreground;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin 20s linear infinite;
}

.pause-animation {
  animation-play-state: paused;
}
</style>
