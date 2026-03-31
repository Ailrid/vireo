<template>
  <div class="h-full w-full flex-col">
    <div v-if="rct.songs" class="flex h-full w-full">
      <!-- 侧边栏 -->
      <section
        class="relative flex h-full shrink-0 overflow-hidden transition-all duration-500 ease-in-out"
        :class="rct.isSidebarOpen ? 'w-72' : 'pointer-events-none w-0'"
      >
        <div class="flex h-full w-full">
          <!-- 歌单信息 -->
          <div class="flex h-full w-full flex-1 flex-col overflow-hidden p-8">
            <div class="flex-1"></div>
            <!-- 封面 -->
            <div class="mb-6 aspect-square w-full shrink-0 overflow-hidden rounded-xl shadow-lg">
              <img
                v-if="rct.songs!.at(0)"
                :src="rct.songs!.at(0)!.album.cover"
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
              <Button variant="icon" @click="rct.setPlaylist(rct.songs!.at(0)!)">
                <Play :size="18" fill="currentColor" />
              </Button>
            </div>
            <div class="flex-1"></div>
            <!-- 歌单文字信息 -->
            <div class="flex flex-1 flex-col justify-start">
              <h1 class="mb-3 text-2xl leading-tight font-black tracking-tighter">
                {{ '每日推荐' }}
              </h1>
              <p class="mb-6 line-clamp-4 text-xs leading-relaxed opacity-60">
                {{ rct.songs ? `今日为你推荐${rct.songs.length}首歌，每日6:00更新` : 'Loading...' }}
              </p>
            </div>
            <div class="flex-1"></div>
          </div>
        </div>
      </section>
      <!-- 列表 -->
      <section class="flex flex-1 overflow-hidden">
        <div class="flex h-full w-full flex-1 flex-col p-8 pl-0">
          <!-- 列表标头 -->
          <div class="mb-6 flex w-full items-end justify-between border-b border-current/10 pb-4">
            <div class="flex items-center">
              <h2 class="text-lg font-bold">歌曲列表</h2>
              <p class="mr-2 ml-2 text-sm tracking-[0.2em] uppercase opacity-40">
                Total {{ rct.songs?.length || 0 }} Tracks
              </p>
              <div class="cursor-pointer" @click="rct.toggleSidebar()">
                <ChevronLeft
                  v-if="rct.isSidebarOpen"
                  class="h-4 w-4 transition-transform"
                  :size="16"
                />
                <ChevronRight v-else class="h-4 w-4 transition-transform" :size="16" />
              </div>
            </div>
            <div class="font-mono text-xs opacity-40">SHARD: 0 - {{ rct.songs?.length || 0 }}</div>
          </div>
          <!-- 列表 -->
          <div class="flex-1 overflow-y-auto">
            <div class="w-full">
              <div
                v-for="(item, index) in rct.songs"
                :key="item.id"
                class="animate-in fade-in slide-in-from-left-4 fill-mode-both group flex h-[4rem] w-full items-center"
                :style="{
                  animationDelay: `${index * 50}ms`,
                  animationDuration: '600ms'
                }"
              >
                <div class="relative flex flex-col items-center self-stretch px-3">
                  <div class="absolute top-0 bottom-0 w-[1.5px] bg-gray-200 dark:bg-white/10"></div>
                  <div
                    class="relative z-10 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-white shadow-sm transition-all duration-300 group-hover:scale-125 dark:border-zinc-900"
                    :style="{
                      backgroundColor: rct.colors.get(item.id)
                    }"
                  ></div>
                </div>
                <div class="flex-1 min-w-0">
                  <Song
                    @click="PlaySongMessage.send(item)"
                    @dblclick="rct.setPlaylist(item)"
                    :item="item"
                    :index="index"
                    :page-index="0"
                    :key="item.id"
                  ></Song>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <!-- 加载占位符 -->
    <div v-else class="flex h-full items-center justify-center">
      <div class="text-center">
        <div class="mb-2 animate-bounce text-xl">💿</div>
        <div class="text-sm tracking-widest uppercase">Fetching Recommended...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { RecommendedPageController } from './controllers'
import { PlaySongMessage } from '@/ccs/playback'
import { Button } from '@/components/ui/button'
import { Play, ChevronLeft, ChevronRight } from 'lucide-vue-next'

import Song from '@/components/public/Song.vue'
const rct = useController(RecommendedPageController)
</script>

<style>
@reference "@/assets/main.css";
.song-info-text {
  @apply hover:text-primary cursor-pointer underline-offset-2 transition-all duration-300 hover:scale-105;
}
</style>
