<template>
  <div class="mr-2 flex items-center gap-2">
    <Button
      variant="icon"
      class="group/like h-9 w-9 rounded-full transition-all"
      :class="pct.currentSong?.like ? 'text-primary' : 'opacity-50 hover:opacity-100'"
      @click="SongLikeMessage.send()"
    >
      <Heart
        :size="18"
        :class="{ 'fill-current': pct.currentSong?.like }"
        class="transition-transform group-active/like:scale-75"
      />
    </Button>
    <Button
      variant="icon"
      class="group/like h-9 w-9 rounded-full transition-all"
      @click="pct.changeMode()"
      @contextmenu.prevent="pct.changeMode('intelligence')"
    >
      <component
        :is="icons[pct.playMode]"
        :size="18"
        class="transition-transform group-active/like:scale-75"
      />
    </Button>
    <div class="group relative flex flex-col items-center">
      <div
        class="bg-card pointer-events-none absolute bottom-full mb-2 flex h-40 w-12 translate-y-2 flex-col items-center justify-between gap-2 rounded-2xl border p-3 opacity-0 shadow-2xl backdrop-blur-sm transition-all duration-300 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100"
      >
        <div class="absolute -bottom-2 left-0 h-2 w-full bg-transparent" />

        <span class="text-foreground font-mono text-sm font-black italic select-none">
          {{ (pct.volume * 100).toFixed(0) }}
        </span>

        <div
          ref="volumeBar"
          class="bg-foreground/10 relative w-3 flex-1 cursor-pointer overflow-hidden rounded-full ring-1 ring-black/5 ring-inset"
          @mousedown.stop="pct.onVolumeMouseDown($event)"
          @wheel.prevent="pct.onWheel($event)"
        >
          <div
            class="bg-primary absolute bottom-0 w-full transition-all duration-150 ease-out"
            :style="{ height: `${pct.volume * 100}%` }"
          >
            <div class="absolute top-0 h-2 w-full bg-white/30 blur-[1px]" />
          </div>
        </div>

        <div class="bg-foreground/20 h-1 w-1 rounded-full"></div>
      </div>

      <Button
        variant="icon"
        class="relative h-9 w-9 rounded-full transition-all hover:bg-white/10 active:scale-90"
        @click="pct.mute()"
        @wheel.prevent="pct.onWheel($event)"
      >
        <Volume2 v-if="pct.volume > 0.5" :size="18" />
        <Volume1 v-else-if="pct.volume > 0" :size="18" />
        <VolumeX v-else :size="18" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import {
  Heart,
  Volume2,
  Volume1,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Activity,
  AudioWaveform
} from 'lucide-vue-next'
import { useController } from '@virid/vue'
import { PlayerButtonController } from './controllers'
import { SongLikeMessage } from '@/ccs/playback'
const icons = {
  order: Repeat,
  loop: Repeat1,
  random: Shuffle,
  intelligence: Activity,
  fm: AudioWaveform
}
const pct = useController(PlayerButtonController)
</script>
