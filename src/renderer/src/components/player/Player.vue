<template>
  <div
    ref="player"
    class="bg-card z-50 flex h-20 w-full items-center backdrop-blur-xl"
    @dblclick="PlayerControllerMessage.send($event, false)"
  >
    <SongCard class="h-20 w-64" />
    <div class="flex-1 " @dblclick="PlayerControllerMessage.send($event, true)"></div>
    <Slider class="h-8" />
    <div class="flex-1" @dblclick="PlayerControllerMessage.send($event, true)"></div>
    <Volume />
  </div>
</template>
<script lang="ts" setup>
import SongCard from './SongCard.vue'
import Slider from './Slider.vue'
import Volume from './PlayerButton.vue'
import { useController } from '@virid/vue'
import { PlayerController, PlayerControllerMessage } from './controllers'
useController(PlayerController)
</script>