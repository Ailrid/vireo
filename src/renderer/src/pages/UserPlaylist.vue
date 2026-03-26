<template>
  <div class="flex h-full w-full overflow-hidden">
    <!-- 侧边栏 -->
    <section
      class="relative flex h-full shrink-0 overflow-hidden transition-all duration-500 ease-in-out"
      :class="pct.isSidebarOpen ? 'w-72' : 'pointer-events-none w-0'"
    >
      <div class="flex h-full w-full">
        <!-- 歌单信息 -->
        <div class="flex h-full w-full flex-1 flex-col overflow-hidden p-8">
          <div class="flex-1"></div>
          <!-- 封面 -->
          <div class="mb-6 aspect-square w-full shrink-0 overflow-hidden rounded-xl shadow-lg">
            <img
              v-if="pct.currentPlaylist?.cover"
              :src="pct.currentPlaylist.cover"
              class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              alt="Cover"
            />
            <div v-else class="bg-muted flex h-full w-full items-center justify-center">
              <span class="text-xs opacity-20">No Cover</span>
            </div>
          </div>
          <!-- 两个操作按钮 -->
          <div class="mb-6 flex w-full gap-2">
            <div class="flex-1"></div>
            <Button
              variant="outline"
              size="icon"
              class="shrink-0 backdrop-blur-md"
              @click="
                () => {
                  const song = pct.currentPlaylistSong ? pct.currentPlaylistSong[0] : null
                  pct.setPlaylist(song)
                }
              "
            >
              <Play :size="16" fill="currentColor" />
            </Button>
            <Button variant="outline" size="icon" class="shrink-0 backdrop-blur-md" @click="">
              <Heart :size="16" />
            </Button>
          </div>
          <div class="flex-1"></div>
          <!-- 歌单文字信息 -->
          <div class="flex flex-1 flex-col justify-start">
            <h1 class="mb-3 text-2xl leading-tight font-black tracking-tighter">
              {{ pct.currentPlaylist?.name || 'Loading...' }}
            </h1>
            <p class="mb-6 line-clamp-4 text-xs leading-relaxed opacity-60">
              {{ pct.currentPlaylist?.description || '正在获取歌单详情...' }}
            </p>
            <div
              class="mt-auto flex items-center gap-2 font-mono text-sm tracking-widest uppercase opacity-80"
            >
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></span>
              Page {{ pct.pageIndex + 1 }} / {{ pct.maxPageLength }}
            </div>
          </div>
          <div class="flex-1"></div>
        </div>
      </div>
    </section>
    <!-- 列表 -->
    <section class="flex flex-1 overflow-hidden">
      <div class="flex h-full flex-1 flex-col p-8 pl-0">
        <!-- 列表标头 -->
        <div class="mb-6 flex items-end justify-between border-b border-current/10 pb-4">
          <div class="flex items-center">
            <h2 class="text-lg font-bold">歌曲列表</h2>
            <p class="mr-2 ml-2 text-sm tracking-[0.2em] uppercase opacity-40">
              Total {{ pct.currentPlaylist?.songCount || 0 }} Tracks
            </p>
            <div class="cursor-pointer" @click="pct.toggleSidebar()">
              <ChevronLeft
                v-if="pct.isSidebarOpen"
                class="h-4 w-4 transition-transform"
                :size="16"
              />
              <ChevronRight v-else class="h-4 w-4 transition-transform" :size="16" />
            </div>
          </div>
          <div class="font-mono text-xs opacity-40">
            SHARD: {{ pct.pageIndex * 200 }} - {{ (pct.pageIndex + 1) * 200 }}
          </div>
        </div>
        <!-- 列表 -->
        <div class="flex-1">
          <VirtualList
            v-if="pct.currentPlaylistSong"
            :key-field="'id'"
            :buffer="3"
            :list-data="pct.currentPlaylistSong"
            :item-height="64"
          >
            <template #item="{ item, index }">
              <div
                class="group flex h-14 items-center gap-1 rounded-xl px-1 transition-all hover:bg-current/5 active:scale-[0.98]"
                @click="PlaySongMessage.send(item)"
                @dblclick="pct.setPlaylist(item)"
              >
                <!-- 序号 -->
                <div
                  class="group-hover:text-primary mr-1 ml-1 w-4 text-center font-mono text-xs transition-all group-hover:opacity-100"
                >
                  {{ (pct.pageIndex * 200 + index + 1).toString().padStart(2, '0') }}
                </div>
                <!-- 封面 -->
                <div class="h-13 w-13 shrink-0 overflow-hidden rounded-lg shadow-sm">
                  <img
                    :src="item.album.cover + '?param=64y64'"
                    class="h-full w-full cursor-pointer object-cover transition-transform group-hover:scale-110"
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
                          @click.stop="$router.push({ name: 'artist', params: { id: artist.id } })"
                        >
                          {{ artist.name }}
                        </span>
                      </div>
                    </div>
                    <span class="mx-1 shrink-0">-</span>
                    <span
                      class="song-info-text"
                      @click.stop="$router.push({ name: 'artist', params: { id: item.album.id } })"
                    >
                      {{ item.album.name }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </VirtualList>
          <!-- 加载的时候的占位符 -->
          <div v-else class="flex h-full items-center justify-center">
            <div class="text-center">
              <div class="mb-2 animate-bounce text-xl">💿</div>
              <div class="text-[10px] tracking-widest uppercase">Fetching Shard...</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 分页控制 -->
      <div class="flex h-full w-8 flex-col" v-if="pct.maxPageLength !== 1">
        <Scrubber
          :page-index="pct.pageIndex"
          :max-page-length="pct.maxPageLength"
          :message-type="PageChangeMessage"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Scrubber from '@/components/public/Scrubber.vue'
import VirtualList from '@/components/public/VirtualList.vue'
import { useController } from '@virid/vue'
import { UserPlaylistPageController, PageChangeMessage } from './controllers'
import { Button } from '@/components/ui/button'
import { Play, Heart, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { PlaySongMessage } from '@/ccs/playback'
const pct = useController(UserPlaylistPageController)
</script>
<style>
@reference "@/assets/main.css";
.song-info-text {
  @apply hover:text-primary cursor-pointer underline-offset-2 transition-transform hover:scale-105;
}
</style>
