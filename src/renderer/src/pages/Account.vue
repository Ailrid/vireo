<template>
  <div class="h-full w-full flex-col">
    <div class="flex h-full w-full">
      <div class="h-full w-8"></div>
      <!-- 侧边栏 -->
      <section
        class="relative flex h-full shrink-0 overflow-hidden transition-all duration-500 ease-in-out"
        :class="act.isSidebarOpen ? 'w-68' : 'pointer-events-none w-0'"
      >
        <!-- 歌单信息 -->
        <div class="flex h-full w-full flex-1 flex-col overflow-hidden pr-8">
          <div class="flex-1"></div>
          <!-- 封面 -->
          <div class="mb-6 aspect-square w-full shrink-0 overflow-hidden rounded-xl shadow-lg">
            <Img
              v-if="act.profile?.avatar"
              :cover="act.profile?.avatar"
              class="transition-transform duration-700 hover:scale-105"
            />
            <div v-else class="bg-muted flex h-full w-full items-center justify-center">
              <span class="text-xs opacity-20">No Avatar</span>
            </div>
          </div>
          <!-- 操作按钮 -->
          <div class="mb-6 flex w-full gap-2">
            <Button v-if="act.isPlaylist" variant="icon" @click="act.isPlaylist = false">
              <Music :size="18" />
            </Button>
            <Button v-else variant="icon" @click="act.isPlaylist = true">
              <List :size="18" />
            </Button>
            <div class="flex-1"></div>
            <Button v-if="!act.isPlaylist" variant="icon" @click="act.isWeek = !act.isWeek">
              <Disc v-if="act.isWeek" :size="18" />
              <Disc3 v-else :size="18" />
            </Button>
          </div>
          <div class="flex-1"></div>
          <!-- 歌单文字信息 -->
          <div class="flex flex-1 flex-col justify-start">
            <h1 class="mb-3 text-2xl leading-tight font-black tracking-tighter">
              {{ act.profile?.nickname || 'Loading ...' }}
            </h1>
            <p class="mb-3 text-sm opacity-60">{{ act.profile?.signature || 'No Signature' }}</p>
            <div class="bg-primary mb-3 h-1 w-full opacity-60"></div>
            <div class="flex flex-wrap items-center gap-2">
              <div class="flex items-center">
                <p class="text-sm opacity-60">{{ act.profile?.follows || 0 }}</p>
                <p class="text-sm opacity-60">关注</p>
              </div>
              <div class="h-6 w-px"></div>
              <div class="flex items-center">
                <p class="text-sm opacity-60">{{ act.profile?.followeds || 0 }}</p>
                <p class="text-sm opacity-60">粉丝</p>
              </div>
              <div class="h-6 w-px"></div>
              <div class="flex items-center">
                <p class="text-sm opacity-60">{{ act.profile?.listenSongs || 0 }}</p>
                <p class="text-sm opacity-60">听歌</p>
              </div>
              <div class="flex items-center">
                <p class="text-sm opacity-60">已加入网易云 {{ act.profile?.createDays || 0 }} 天</p>
              </div>
            </div>
          </div>
          <div class="flex-1"></div>
        </div>
      </section>
      <div class="relative flex flex-1 overflow-hidden">
        <Transition name="slide" mode="out-in">
          <!-- 最近播放 -->
          <section v-if="!act.isPlaylist" class="flex h-full w-full overflow-hidden pr-8">
            <div class="flex h-full w-full flex-1 flex-col">
              <!-- 列表标头 -->
              <div class="flex w-full items-end justify-between border-b border-current/10 pb-4">
                <div class="flex items-center">
                  <h2 class="text-lg font-bold">{{ act.isWeek ? '周播放记录' : '总播放记录' }}</h2>
                  <p class="mr-2 ml-2 text-sm tracking-[0.2em] uppercase opacity-40">
                    Total {{ act.record?.length || 0 }} Tracks
                  </p>
                  <div class="cursor-pointer" @click="act.toggleSidebar()">
                    <ChevronLeft
                      v-if="act.isSidebarOpen"
                      class="h-4 w-4 transition-transform"
                      :size="16"
                    />
                    <ChevronRight v-else class="h-4 w-4 transition-transform" :size="16" />
                  </div>
                </div>
                <div class="font-mono text-xs opacity-40">SHARD: 0 - {{ act.record?.length }}</div>
              </div>
              <!-- 列表 -->
              <div class="flex-1">
                <VirtualList v-if="act.record" :buffer="3" :list-data="act.record">
                  <template #item="{ item, index }">
                    <div class="relative h-full w-full">
                      <Song
                        @click="PlaySongMessage.send(item.song)"
                        :item="item.song"
                        :index="index"
                        :page-index="0"
                        :key="item.song.id"
                      ></Song>
                      <div class="pointer-none absolute top-0.5 right-0.5 text-xs">
                        {{ item.playCount }} 次
                      </div>
                    </div>
                  </template>
                </VirtualList>
              </div>
            </div>
          </section>
          <!-- 用户歌单 -->
          <section v-else-if="act.isPlaylist" class="flex h-full w-full overflow-hidden pr-8">
            <div class="flex h-full w-full flex-1 flex-col">
              <!-- 列表标头 -->
              <div class="flex w-full items-end justify-between border-b border-current/10 pb-4">
                <div class="flex items-center">
                  <h2 class="text-lg font-bold">用户歌单</h2>
                  <p class="mr-2 ml-2 text-sm tracking-[0.2em] uppercase opacity-40">
                    Total {{ act.playlist.length || 0 }} Albums
                  </p>
                  <div class="cursor-pointer" @click="act.toggleSidebar()">
                    <ChevronLeft
                      v-if="act.isSidebarOpen"
                      class="h-4 w-4 transition-transform"
                      :size="16"
                    />
                    <ChevronRight v-else class="h-4 w-4 transition-transform" :size="16" />
                  </div>
                </div>
                <div class="font-mono text-xs opacity-40">
                  Time: {{ convertDate(act.playlist?.at(-1)?.createTime || 0) }} -
                  {{ convertDate(act.playlist?.at(0)?.createTime || 0) }}
                </div>
              </div>
              <!-- 列表 -->
              <div class="flex-1">
                <VirtualList
                  v-if="act.playlist"
                  :key-field="'id'"
                  :buffer="3"
                  :list-data="act.playlist"
                  :item-height="8"
                >
                  <template #item="{ item }">
                    <div class="group relative flex h-full w-full px-4">
                      <!-- Timeline -->
                      <div class="relative flex w-24 flex-col items-center text-sm">
                        <span
                          class="mt-4 font-mono font-bold opacity-40 transition-all duration-300 group-hover:opacity-100"
                        >
                          {{ new Date(item.createTime).getFullYear() }}
                        </span>
                        <span class="tracking-tighter uppercase opacity-30">
                          {{
                            new Date(item.createTime).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric'
                            })
                          }}
                        </span>
                        <div
                          class="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 bg-current/10"
                        ></div>
                        <div
                          class="bg-base-100 ring-base-100 z-10 mt-2 h-3 w-3 rounded-full border-2 border-current ring-4 transition-transform group-hover:scale-125"
                        ></div>
                      </div>
                      <!-- 歌单介绍 -->
                      <div class="flex-1">
                        <div
                          class="flex h-full w-full gap-4 rounded-2xl p-3 transition-all duration-300 hover:bg-current/5 hover:shadow-xl hover:shadow-black/5 active:scale-[0.98]"
                        >
                          <div
                            class="relative aspect-square h-full cursor-pointer overflow-hidden rounded-xl shadow-lg"
                            @click="$router.push({ name: 'playlist', params: { id: item.id } })"
                          >
                            <Img
                              :cover="item.cover + '?param=256y256'"
                              class="transition-transform duration-700 group-hover:scale-110"
                            />
                            <div
                              class="absolute right-1 bottom-1 rounded-md bg-black/60 px-1.5 py-0.5 text-sm text-white backdrop-blur-sm transition-all duration-300"
                            >
                              {{ item.songCount }} Tracks
                            </div>
                          </div>
                          <div class="flex flex-1 flex-col justify-center">
                            <div class="flex items-baseline gap-2">
                              <h3
                                class="group-hover:text-primary line-clamp-1 text-lg font-black tracking-tight transition-all duration-300"
                              >
                                {{ item.name }}
                              </h3>
                            </div>

                            <p
                              class="line-clamp-2 font-serif text-sm leading-relaxed italic opacity-70"
                            >
                              {{ item.description || '' }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </VirtualList>
              </div>
            </div>
          </section>
          <!-- 加载占位符 -->
          <div v-else class="flex h-full w-full items-center justify-center">
            <div class="text-center">
              <div class="mb-2 animate-bounce text-xl">💿</div>
              <div class="text-sm tracking-widest uppercase">Fetching Account...</div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VirtualList from '@/components/public/VirtualList.vue'
import { useController } from '@virid/vue'
import { AccountController } from './controllers'
import { PlaySongMessage } from '@/ccs/playback'
import Button from '@/components/ui/Button.vue'
import { Music, List, ChevronLeft, ChevronRight, Disc, Disc3 } from 'lucide-vue-next'
import Song from '@/components/public/Song.vue'
import Img from '@/components/public/Img.vue'
import { convertDate } from '@/utils'
const act = useController(AccountController)
</script>

<style>
@reference "@/assets/main.css";
.song-info-text {
  @apply hover:text-primary cursor-pointer underline-offset-2 transition-all duration-300 hover:scale-105;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}
</style>
