<template>
  <div class="h-full w-full overflow-y-auto">
    <div class="mb-7 flex flex-col gap-1 overflow-y-auto p-2">
      <div
        v-for="item in pct.playlists"
        :key="item.id"
        class="group relative flex cursor-pointer items-center gap-4 rounded-xl p-2 transition-all duration-200 hover:bg-black/5 active:scale-[0.98] dark:hover:bg-white/5"
        @click="$router.push({ name: 'user-playlist', params: { id: item.id } })"
      >
        <div
          class="bg-primary absolute left-0 h-4 w-1 rounded-full opacity-0 transition-all duration-300"
          :class="{ 'h-6 opacity-100': pct.currentPlaylistId === item.id }"
        ></div>
        <div
          class="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-black/5 shadow-sm dark:border-white/5"
        >
          <img
            :src="item.cover"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <h3
            class="truncate text-sm font-medium tracking-tight transition-colors"
            :class="
              pct.currentPlaylistId === item.id
                ? 'text-primary'
                : 'text-foreground/90 group-hover:text-primary'
            "
          >
            {{ item.name }}
          </h3>
          <p class="text-[11px] font-medium tracking-wider uppercase opacity-40">
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
const pct = useController(PlaylistManagerController)
</script>