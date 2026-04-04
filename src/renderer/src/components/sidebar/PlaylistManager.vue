<template>
  <div class="h-full w-full p-2">
    <div class="mb-7 flex flex-col gap-2 overflow-y-auto">
      <div
        v-for="item in pct.playlists"
        :key="item.id"
        class="group flex h-15 w-full items-center gap-1 rounded-xl px-1 transition-all duration-300 hover:bg-current/5 active:scale-[0.98]"
        @click="$router.push({ name: 'user-playlist', params: { id: item.id } })"
      >
        <div
          class="bg-primary absolute left-0 h-4 w-1 rounded-full opacity-0 transition-all duration-300"
          :class="{ 'h-6 opacity-100': pct.currentPlaylistId === item.id }"
        ></div>
        <div class="h-14 w-14 shrink-0 overflow-hidden rounded-lg shadow-sm">
          <Img
            :cover="item.cover + '?param=128y128'"
            class="cursor-pointer transition-all duration-300 group-hover:scale-110"
          />
        </div>
        <div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <h3
            class="truncate text-sm font-medium tracking-tight transition-all duration-300"
            :class="
              pct.currentPlaylistId === item.id
                ? 'text-primary'
                : 'text-foreground/90 group-hover:text-primary'
            "
          >
            {{ item.name }}
          </h3>
          <p class="text-sm font-medium tracking-wider uppercase opacity-40">
            {{ item.songCount }} TRACKS
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { PlaylistManagerController } from './controllers'
import Img from '../public/Img.vue'
const pct = useController(PlaylistManagerController)
</script>
