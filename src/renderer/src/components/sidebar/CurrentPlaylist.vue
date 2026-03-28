<template>
  <div class="h-full w-full overflow-y-auto p-2">
    <div
      v-if="cct.currentList.length === 0"
      class="flex h-full w-full items-center justify-center p-8"
    >
      <div
        class="bg-card/20 border-border flex flex-col items-center gap-4 rounded-3xl border p-10 backdrop-blur-xl transition-all"
        style="box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1)"
      >
        <div
          class="bg-primary/10 text-primary relative flex h-16 w-16 items-center justify-center rounded-2xl"
        >
          <Music :size="32" class="opacity-80" />
          <div class="bg-primary/5 absolute inset-0 animate-ping rounded-2xl"></div>
        </div>

        <div class="flex flex-col items-center gap-1">
          <h3 class="text-sm font-bold tracking-widest uppercase opacity-60">Playlist Empty</h3>
          <p class="font-mono text-xs italic opacity-30">这里没有任何歌曲 ~</p>
        </div>
      </div>
    </div>
    <VirtualList
      v-else
      ref="current-playlist"
      :buffer="3"
      :list-data="cct.currentList"
      :key-field="'id'"
    >
      <template #item="{ item, index }">
        <div class="flex h-full w-full items-center justify-center">
          <div
            class="group flex h-14 w-full items-center gap-1 rounded-xl px-1 transition-all duration-300 hover:bg-current/5 active:scale-[0.98]"
            @click="PlaySongMessage.send(item)"
          >
            <!-- 标记 -->
            <div
              class="bg-primary absolute left-0 h-4 w-1 rounded-full opacity-0 transition-all duration-300"
              :class="{ 'h-6 opacity-100': cct.currentSong?.id === item.id }"
            ></div>
            <!-- 序号 -->
            <div
              class="group-hover:text-primary mr-1 ml-1 w-4 text-center font-mono text-xs transition-all group-hover:opacity-100"
            >
              {{ (index + 1).toString().padStart(2, '0') }}
            </div>
            <!-- 封面 -->
            <div class="h-13 w-13 shrink-0 overflow-hidden rounded-lg shadow-sm">
              <img
                :src="item.album.cover + '?param=64y64'"
                class="h-full w-full cursor-pointer object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <!-- 歌曲信息-->
            <div class="flex flex-1 flex-col truncate">
              <div class="flex w-full items-center gap-1 overflow-hidden">
                <span
                  class="hover:text-primary min-w-0 cursor-pointer truncate text-sm font-semibold"
                  @click.stop="
                    $router.push({
                      name: 'artist',
                      params: { id: item.album.id }
                    })
                  "
                >
                  {{ item.name }}
                </span>
              </div>
              <div class="flex w-full items-center gap-1 overflow-hidden">
                <div class="flex min-w-0 flex-1 items-center gap-x-2">
                  <span
                    v-for="artist in item.artists"
                    :key="artist.id"
                    class="artist-tag"
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
            </div>
          </div>
        </div>
      </template>
    </VirtualList>
  </div>
</template>

<script setup lang="ts">
import VirtualList from '../public/VirtualList.vue'
import { CurrentPlaylistController } from './controllers'
import { useController } from '@virid/vue'
import { PlaySongMessage } from '@/ccs/playback'
import { Music } from 'lucide-vue-next'
const cct = useController(CurrentPlaylistController)
</script>
<style>
@reference "@/assets/main.css";
.artist-tag {
  flex: 0 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @apply hover:text-primary min-w-0 cursor-pointer text-sm underline-offset-2 transition-transform hover:scale-105;
  color: var(--foreground); /* 继承你的主题变量 */
  opacity: 0.6;
}
</style>
