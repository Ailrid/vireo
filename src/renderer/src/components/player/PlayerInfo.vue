<template>
  <div class="flex h-full w-full flex-col items-center overflow-hidden">
    <div class="flex-2"></div>
    <!-- 封面 -->
    <div class="flex w-full flex-col">
      <div class="aspect-square w-full shrink-0 overflow-hidden rounded-xl shadow-lg">
        <Img
          v-if="pct.currentSong?.album?.cover"
          :cover="pct.currentSong?.album?.cover"
          class="cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-105"
          @click="SwitchViewMessage.send()"
        />
        <div v-else class="bg-muted flex h-full w-full items-center justify-center">
          <span class="text-xs opacity-20">No Cover</span>
        </div>
      </div>
    </div>
    <div class="flex-1"></div>
    <!-- 各种操作 -->
    <div class="flex w-full flex-col gap-2" :style="{ color: pct.textColor }">
      <!-- 歌曲信息 -->
      <div class="flex w-full flex-col items-center justify-between overflow-hidden">
        <div class="flex w-full items-center gap-2 overflow-hidden text-xl">
          <!-- 装饰条-->
          <div
            class="h-6 w-1 shrink-0 rounded-xl"
            :style="{ backgroundColor: pct.textColor }"
          ></div>
          <div class="flex w-full items-center gap-1 overflow-hidden">
            <div class="flex min-w-0 flex-1 items-center gap-x-2 text-xl">
              <span
                class="hover:text-primary song-tag min-w-0 flex-1 cursor-pointer truncate font-semibold transition-all duration-300"
                @click.stop="
                  $router.push({ name: 'artist', params: { id: pct.currentSong!.album.id } })
                "
              >
                {{ pct.currentSong!.name }}
              </span>
              <span class="shrink-0 opacity-60">-</span>
              <span
                v-for="artist in pct.currentSong!.artists.slice(0, 4)"
                :key="artist.id"
                @click.stop="$router.push({ name: 'artist', params: { id: artist.id } })"
                class="song-tag hover:text-primary cursor-pointer truncate font-semibold transition-all duration-300"
              >
                {{ artist.name }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- 进度条 -->
      <div class="flex h-4 w-full items-center justify-between">
        <div
          ref="progressBar"
          class="relative w-full flex-1 cursor-pointer"
          @click="pct.onProgressMouseDown($event)"
        >
          <div
            class="absolute z-10 h-2 w-full rounded-2xl opacity-20"
            :style="{ backgroundColor: pct.textColor }"
          ></div>
          <div
            class="z-100 h-2 rounded-2xl transition-all duration-300"
            :style="{
              backgroundColor: pct.textColor,
              width: `${pct.progress}%`
            }"
          ></div>
        </div>
      </div>
      <!-- 音量和时间 -->
      <div class="flex h-4 w-full items-center justify-between">
        <div
          ref="volumeBar"
          class="relative flex-1 cursor-pointer"
          @click="pct.onVolumeMouseDown($event)"
          @wheel="pct.onVolumeWheel($event)"
        >
          <div
            class="absolute z-10 h-2 w-full rounded-2xl opacity-20"
            :style="{ backgroundColor: pct.textColor }"
          ></div>
          <div
            class="z-100 h-2 rounded-2xl transition-all duration-300"
            :style="{
              backgroundColor: pct.textColor,
              width: `${pct.volume * 100}%`
            }"
          ></div>
        </div>
        <div class="ml-2">
          <span class="text-sm"> {{ formatTime(pct.player.currentTime) }} </span>
          /
          <span class="text-sm">
            {{ formatTime(pct.player.duration) }}
          </span>
        </div>
      </div>
      <!-- 五个按钮 -->
      <div class="flex w-full items-center justify-between transition-all">
        <Button
          variant="icon"
          class="group relative transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 active:scale-90"
          @click="pct.changeMode()"
          @contextmenu.prevent="pct.changeMode('intelligence')"
        >
          <component
            :is="icons[pct.playMode]"
            class="h-5! w-5! transition-transform duration-500 group-hover:-translate-y-0.5"
          />
        </Button>

        <Button
          variant="icon"
          class="transition-all duration-300 hover:scale-110 active:-translate-x-1 active:scale-90"
          @click="PreviousSongMessage.send()"
        >
          <SkipBack class="h-5! w-5!" />
        </Button>

        <Button
          variant="icon"
          class="relative h-14 w-14 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-115 active:scale-95"
          @click="PlayOrPauseMessage.send(!pct.player.isPlaying)"
        >
          <Transition name="scale-fade" mode="out-in">
            <Play v-if="!pct.player.isPlaying" :key="'play'" class="h-8! w-8!" />
            <Pause v-else :key="'pause'" class="h-8! w-8!" />
          </Transition>
        </Button>

        <Button
          variant="icon"
          class="transition-all duration-300 hover:scale-110 active:translate-x-1 active:scale-90"
          @click="NextSongMessage.send()"
        >
          <SkipForward class="h-5! w-5!" />
        </Button>

        <Button
          variant="icon"
          :class="[
            pct.currentSong?.like ? 'opacity-100!' : 'opacity-50 hover:opacity-100',
            'transition-all duration-500 hover:scale-125 active:scale-75'
          ]"
          :style="pct.currentSong?.like ? { color: pct.textColor } : {}"
          @click="SongLikeMessage.send()"
        >
          <Heart
            :class="{ 'animate-heartbeat fill-current': pct.currentSong?.like }"
            class="h-5! w-5!"
          />
        </Button>
      </div>
    </div>
    <div class="flex-2"></div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { PlayerInfoController } from './controllers'
import { SwitchViewMessage } from '@/pages/controllers'
import {
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  Activity,
  AudioWaveform,
  SkipBack,
  SkipForward,
  Play,
  Pause
} from 'lucide-vue-next'
import Button from '../ui/Button.vue'
import {
  NextSongMessage,
  PlayOrPauseMessage,
  PreviousSongMessage,
  SongLikeMessage
} from '@/ccs/playback'
import { formatTime } from '@/utils'
import Img from '../public/Img.vue'
const icons = {
  order: Repeat,
  loop: Repeat1,
  random: Shuffle,
  intelligence: Activity,
  fm: AudioWaveform
}
const pct = useController(PlayerInfoController)
</script>

<style scoped>
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.5) rotate(-15deg);
}

/* 喜欢后的微小脉冲感 */
@keyframes heartbeat {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.15);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
.animate-heartbeat {
  animation: heartbeat 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

@reference "@/assets/main.css";
.song-tag {
  flex: 0 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @apply hover:text-primary min-w-0 cursor-pointer underline-offset-2 transition-all duration-300 hover:scale-105;
}
</style>
