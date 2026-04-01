<template>
  <div class="flex h-full w-full overflow-hidden">
    <!-- 侧边栏 -->
    <section
      class="relative flex h-full shrink-0 overflow-hidden transition-all duration-500 ease-in-out"
      :class="pct.isSidebarOpen ? 'w-72' : 'pointer-events-none w-0'"
    >
      <div class="flex h-full w-full">
        <!-- 歌单信息 -->
        <div class="flex h-full w-full flex-1 flex-col overflow-hidden pr-8 pl-8">
          <div class="flex-1"></div>
          <!-- 封面 -->
          <div class="mb-6 aspect-square w-full shrink-0 overflow-hidden rounded-xl shadow-lg">
            <img
              v-if="pct.playlistsDetail?.cover"
              :src="pct.playlistsDetail.cover"
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
              variant="icon"
              @click="
                () => {
                  const song = pct.currentPageSong ? pct.currentPageSong[0] : null
                  pct.setPlaylist(song)
                }
              "
            >
              <Play :size="18" fill="currentColor" />
            </Button>
          </div>
          <div class="flex-1"></div>
          <!-- 歌单文字信息 -->
          <div class="flex flex-1 flex-col justify-start">
            <h1 class="mb-3 text-2xl leading-tight font-black tracking-tighter">
              {{ pct.playlistsDetail?.name || 'Loading...' }}
            </h1>
            <p class="mb-6 line-clamp-4 text-xs leading-relaxed opacity-60">
              {{ pct.playlistsDetail?.description || '正在获取歌单详情...' }}
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
      <div class="flex h-full flex-1 flex-col pr-8" :class="[pct.isSidebarOpen ? 'pl-0' : 'pl-8']">
        <!-- 列表标头 -->
        <div class="mb-6 flex items-end justify-between border-b border-current/10 pb-4">
          <div class="flex items-center">
            <h2 class="text-lg font-bold">歌曲列表</h2>
            <p class="mr-2 ml-2 text-sm tracking-[0.2em] uppercase opacity-40">
              Total {{ pct.playlistsDetail?.songCount || 0 }} Tracks
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
            v-if="pct.currentPageSong"
            :key-field="'id'"
            :buffer="3"
            :list-data="pct.currentPageSong"
          >
            <template #item="{ item, index }">
              <div class="h-full w-full">
                <Song
                  @click="PlaySongMessage.send(item)"
                  @dblclick="pct.setPlaylist(item)"
                  :item="item"
                  :index="index"
                  :page-index="pct.pageIndex"
                  :key="item.id"
                ></Song>
              </div>
            </template>
          </VirtualList>
          <!-- 加载的时候的占位符 -->
          <div v-else class="flex h-full items-center justify-center">
            <div class="text-center">
              <div class="mb-2 animate-bounce text-xl">💿</div>
              <div class="text-sm tracking-widest uppercase">Fetching Shard...</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 分页控制 -->
      <div class="flex h-full w-8 flex-col" v-if="pct.maxPageLength !== 1">
        <Scrubber
          :page-index="pct.pageIndex"
          :max-page-length="pct.maxPageLength"
          :message-type="PlaylistPageChangeMessage"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Scrubber from '@/components/public/Scrubber.vue'
import VirtualList from '@/components/public/VirtualList.vue'
import { useController } from '@virid/vue'
import { PlaylistPageChangeMessage, PlaylistPageController } from './controllers'
import { Button } from '@/components/ui/button'
import { Play, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { PlaySongMessage } from '@/ccs/playback'
import Song from '@/components/public/Song.vue'
const pct = useController(PlaylistPageController)
</script>
