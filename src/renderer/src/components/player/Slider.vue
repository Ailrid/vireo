<template>
  <div class="flex max-w-[calc(100vw-23.25rem)] items-center overflow-hidden" ref="sliderRoot">
    <div class="time-text">
      <span>{{ sct.currentTime }}</span>
    </div>
    <div
      ref="sliderContainer"
      class="group relative flex cursor-pointer items-center"
      @mousedown="SliderControllerMessage.send($event)"
    >
      <Transition name="slider-fade">
        <div v-if="!sct.changeSlider" class="flex items-center justify-center gap-1">
          <div
            v-for="(val, i) in sct.slider"
            :key="i"
            class="wave-bar"
            :class="sct.waveBarStyle(sct.sliderMask[i])"
            :style="{
              height: `${val * 1.5 + 0.5}rem`
            }"
          ></div>
        </div>
        <div v-else class="flex h-4 w-[calc(100vw-30.75rem)] items-center justify-between">
          <div class="relative w-full flex-1 cursor-pointer">
            <div
              class="absolute z-10 h-2 w-full rounded-2xl opacity-20"
              :class="[sct.progressBarStyle()]"
            ></div>
            <div
              class="z-100 h-2 rounded-2xl transition-all duration-300"
              :class="[sct.progressBarStyle()]"
              :style="{
                width: `${sct.progress}%`
              }"
            ></div>
          </div>
        </div>
      </Transition>
    </div>

    <div class="time-text">
      <span>{{ sct.player.duration ? formatTime(sct.player.duration) : '00:00' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { SliderController, SliderControllerMessage } from './controllers'
import { formatTime } from '@/utils'
const sct = useController(SliderController)
</script>
<style scoped>
@reference "@assets/main.css";
.wave-bar {
  @apply shrink-0 rounded-full transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] will-change-[height,opacity,transform] hover:z-10 hover:scale-x-110 hover:scale-y-125 hover:opacity-100 hover:brightness-150;
  width: 0.4rem;
}
.bg-cover-color {
  background-color: var(--cover-color, var(--primary));
}
.time-text {
  font-size: 0.8rem;
  opacity: 0.8;
  @apply flex w-15 items-center justify-center;
}
.slider-fade-enter-active,
.slider-fade-leave-active {
  transition: opacity 1.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.slider-fade-leave-active {
  position: absolute;
}
.slider-fade-enter-from,
.slider-fade-leave-to {
  opacity: 0;
}
</style>
