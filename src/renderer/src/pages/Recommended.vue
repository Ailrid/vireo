<template>
  <div class="h-full w-full flex-col">
    <div v-if="rct.songs" class="flex h-full w-full">
      <div class="h-full w-8"></div>
      <!-- 侧边栏 -->
      <section
        class="relative flex h-full shrink-0 overflow-hidden transition-all duration-500 ease-in-out"
        :class="rct.isSidebarOpen ? 'w-68' : 'pointer-events-none w-0'"
      >
        <!-- 歌单信息 -->
        <div class="flex h-full w-full flex-1 flex-col overflow-hidden pr-8">
          <div class="flex-1"></div>
          <!-- 封面 -->
          <div class="mb-6 aspect-square w-full shrink-0 overflow-hidden rounded-xl shadow-lg">
            <Img
              v-if="rct.songs!.at(0)"
              :cover="rct.songs!.at(0)!.album.cover"
              class="transition-transform duration-700 hover:scale-105"
            />
            <div v-else class="bg-muted flex h-full w-full items-center justify-center">
              <span class="text-xs opacity-20">No Cover</span>
            </div>
          </div>
          <!-- 操作按钮 -->
          <div class="mb-6 flex w-full gap-2">
            <div class="flex-1"></div>
            <Button variant="icon" @click="rct.setPlaylist(rct.songs!.at(0)!)">
              <Play :size="18" fill="currentColor" />
            </Button>
          </div>
          <div class="flex-1"></div>
          <!-- 歌单文字信息 -->
          <div class="flex flex-1 flex-col justify-start">
            <h1
              class="mb-3 flex justify-between text-2xl leading-tight font-black tracking-tighter"
            >
              <span>每日推荐</span>
              <span>{{ rct.getMonthAndDate() }}</span>
            </h1>
            <p class="mb-6 line-clamp-4 text-xs leading-relaxed opacity-60">
              {{ rct.songs ? `今日为你推荐${rct.songs.length}首歌，每日6:00更新` : 'Loading...' }}
            </p>
          </div>
          <div class="flex-1"></div>
        </div>
      </section>
      <!-- 列表 -->
      <section class="flex flex-1 overflow-hidden">
        <div class="flex h-full w-full flex-1 flex-col pr-8">
          <!-- 列表标头 -->
          <div class="flex w-full items-end justify-between border-b border-current/10 pb-4">
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
          <div class="flex-1 overflow-y-auto pt-4">
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
                  <div
                    class="absolute top-0 bottom-0 w-[2px] bg-white/20 shadow-[0_0_1px_rgba(0,0,0,0.1)]"
                  ></div>
                  <div
                    class="relative z-10 h-3 w-3 shrink-0 rounded-full border-2 border-white shadow-lg transition-all duration-300 group-hover:scale-150 dark:border-zinc-900"
                    :style="{
                      backgroundColor: rct.colors.get(item.id),
                      boxShadow: `0 0 10px ${rct.colors.get(item.id)}80`
                    }"
                  ></div>
                </div>
                <div class="min-w-0 flex-1">
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
import Button from '@/components/ui/Button.vue'
import { Play, ChevronLeft, ChevronRight } from 'lucide-vue-next'

import Song from '@/components/public/Song.vue'
import Img from '@/components/public/Img.vue'
const rct = useController(RecommendedPageController)
</script>

<style>
@reference "@/assets/main.css";
.song-info-text {
  @apply hover:text-primary cursor-pointer underline-offset-2 transition-all duration-300 hover:scale-105;
}
</style>
