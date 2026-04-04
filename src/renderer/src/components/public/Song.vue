<template>
  <div
    class="group flex h-14 w-full items-center gap-1 rounded-xl px-1 transition-all duration-300 hover:bg-current/5 active:scale-[0.98]"
  >
    <!-- 序号 -->
    <div
      class="group-hover:text-primary mr-1 ml-1 w-4 text-center font-mono text-xs transition-all duration-300 group-hover:opacity-100"
    >
      {{ (pageIndex * 200 + index + 1).toString().padStart(2, '0') }}
    </div>
    <!-- 封面 -->
    <div class="h-13 w-13 shrink-0 overflow-hidden rounded-lg shadow-sm">
      <Img
        :cover="item.album.cover + '?param=64y64'"
        class="cursor-pointer transition-all duration-300 group-hover:scale-110"
      />
    </div>
    <!-- 歌曲信息，名字和歌手和专辑 -->
    <div class="flex flex-1 flex-col truncate">
      <span class="truncate text-sm font-semibold tracking-tight">
        {{ item.name }}
      </span>
      <div class="mt-0.5 flex items-center gap-1 truncate text-sm opacity-60">
        <div class="flex shrink-0 items-center gap-1">
          <div class="flex flex-wrap gap-x-2">
            <span
              v-for="artist in item.artists"
              :key="artist.id"
              class="song-info-text"
              @click.stop="
                $router.push({
                  name: 'artist',
                  params: { id: artist.id }
                })
              "
            >
              {{ artist.name }}
            </span>
          </div>
        </div>
        <span class="mx-1 shrink-0">-</span>
        <span
          class="song-info-text"
          @click.stop="
            $router.push({
              name: 'album',
              params: { id: item.album.id }
            })
          "
        >
          {{ item.album.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type SongDetail } from '@/utils'
import Img from './Img.vue'
defineProps<{
  item: SongDetail
  index: number
  pageIndex: number
}>()
</script>

<style>
@reference "@/assets/main.css";
.song-info-text {
  flex: 0 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @apply hover:text-primary min-w-0 cursor-pointer underline-offset-2 transition-all duration-300 hover:scale-105;
}
</style>
