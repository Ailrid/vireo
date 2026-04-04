<template>
  <div class="h-full w-full pr-8 pl-8">
    <div class="mask h-full w-full overflow-y-auto">
      <div class="flex w-full flex-col gap-4">
        <!-- 日推 -->
        <section class="no-scrollbar section">
          <h2 class="section-title relative w-full">
            <div></div>
            <span>发现新歌</span>
            <Button variant="icon" @click="hct.refresh()" class="absolute right-0">
              <RotateCcw :size="18" />
            </Button>
          </h2>
          <div class="grid grid-cols-[repeat(auto-fill,minmax(calc(25%-1.5rem),1fr))] gap-6">
            <div
              v-for="(item, index) in hct.discoverData"
              :key="item.title"
              class="group relative flex w-full cursor-pointer flex-col transition-all duration-500 hover:-translate-y-2"
              @click="item.click()"
              :style="{ '--card-color': hct.colors.get(index) }"
            >
              <div
                class="bg-primary relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl shadow-md"
              >
                <Img :cover="item.cover" />
              </div>
              <div class="group relative mt-4 flex w-full flex-col px-1">
                <div class="mb-1 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div
                      class="h-1 w-1 rounded-full bg-(--card-color) opacity-40 group-hover:animate-pulse"
                    ></div>
                    <span
                      class="text-sm font-medium tracking-[0.2em] uppercase transition-colors group-hover:text-(--card-color)"
                    >
                      {{ item.subTitle }}
                    </span>
                  </div>
                  <i
                    class="ri-arrow-right-up-line text-muted-foreground/20 text-sm transition-all group-hover:text-(--card-color) group-hover:opacity-100"
                  ></i>
                </div>

                <div class="relative flex items-center overflow-hidden">
                  <span
                    class="text-foreground line-clamp-1 text-lg font-black tracking-tighter transition-all duration-500 group-hover:translate-x-1 group-hover:text-(--card-color)"
                    :style="{ '--tw-text-opacity': '0.9' }"
                  >
                    {{ item.title }}
                  </span>
                </div>

                <div class="relative mt-2 h-[2px] w-full overflow-hidden rounded-full">
                  <div
                    class="absolute inset-0 w-full transition-opacity duration-500 ease-in-out group-hover:opacity-0"
                    style="
                      background: linear-gradient(to right, var(--foreground), transparent);
                      opacity: 0.2;
                    "
                  ></div>

                  <div
                    class="absolute inset-0 w-full -translate-x-2 opacity-0 transition-all duration-500 ease-in-out group-hover:translate-x-0 group-hover:opacity-100"
                    :style="{
                      background: `linear-gradient(to right, var(--card-color), transparent)`
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <!-- 推荐歌曲 -->
        <section class="no-scrollbar section">
          <h2 class="section-title">
            <div></div>
            <span>推荐歌曲</span>
          </h2>
          <div class="grid w-full auto-cols-fr grid-flow-col gap-4">
            <div v-for="group in hct.pageSong" class="flex flex-col gap-4">
              <div class="flex h-10 w-full flex-col">
                <span class="truncate text-sm">{{ group.title }}</span>
                <span class="truncate text-sm opacity-50">{{ group.subTitle }}</span>
              </div>
              <div
                v-for="item in group.detail"
                :key="item.id"
                class="group flex h-14 w-full items-center gap-1 rounded-xl px-1 transition-all duration-300 hover:bg-current/5 active:scale-[0.98]"
                @click="PlaySongMessage.send(item)"
              >
                <!-- 封面 -->
                <div class="h-14 w-14 shrink-0 overflow-hidden rounded-lg shadow-sm">
                  <Img
                    :cover="item.album.cover + '?param=64y64'"
                    class="cursor-pointer transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <!-- 歌曲信息-->
                <div class="flex flex-1 flex-col truncate">
                  <div class="flex w-full items-center gap-1 overflow-hidden">
                    <span
                      class="hover:text-primary min-w-0 cursor-pointer truncate text-sm font-semibold transition-all duration-300"
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
                  <div class="w-full overflow-hidden">
                    <div class="flex min-w-0 flex-1 items-center gap-x-2">
                      <span
                        v-for="artist in item.artists.slice(0, 4)"
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
          </div>
        </section>
        <!-- 推荐歌单 -->
        <section class="no-scrollbar section">
          <h2 class="section-title">
            <div></div>
            <span>推荐歌单</span>
          </h2>
          <div class="grid grid-cols-[repeat(auto-fill,minmax(calc(25%-1.5rem),1fr))] gap-6">
            <div
              v-for="(item, index) in hct.pagePlaylist?.playlist"
              :key="index"
              class="group flex w-full cursor-pointer flex-col transition-all hover:-translate-y-1"
              @click="$router.push({ name: 'playlist', params: { id: item.id } })"
            >
              <div class="aspect-square w-full shrink-0 overflow-hidden rounded-2xl shadow-md">
                <Img
                  :cover="item.cover"
                  class="transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div class="flex flex-col pt-3">
                <span class="truncate text-base font-bold">{{ item.title }}</span>
                <span class="truncate text-sm opacity-80">{{ item.subTitle }}</span>
                <div class="mt-1 flex flex-wrap gap-2">
                  <span v-for="label in item.labels" :key="label" class="text-xs opacity-70">
                    {{ label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <!-- 雷达歌单 -->
        <section class="no-scrollbar section">
          <h2 class="section-title">
            <div></div>
            <span>雷达歌单</span>
          </h2>
          <div class="grid grid-cols-[repeat(auto-fill,minmax(calc(25%-1.5rem),1fr))] gap-6">
            <div
              v-for="(item, index) in hct.pageRadar?.playlist"
              :key="index"
              class="group flex w-full cursor-pointer flex-col transition-all hover:-translate-y-1"
              @click="$router.push({ name: 'playlist', params: { id: item.id } })"
            >
              <div class="aspect-square w-full shrink-0 overflow-hidden rounded-2xl shadow-md">
                <Img
                  :cover="item.cover"
                  class="transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div class="mt-3 h-12 w-full">
                <span class="line-clamp-2 text-base leading-6 font-bold">
                  {{ item.title }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import Button from '@/components/ui/Button.vue'
import { RotateCcw } from 'lucide-vue-next'
import { HomePageController } from './controllers'
import { PlaySongMessage } from '@/ccs/playback'
import Img from '@/components/public/Img.vue'
const hct = useController(HomePageController)
</script>

<style scoped>
@reference "@/assets/main.css";

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.section-title {
  @apply flex items-center gap-4;
  & div {
    @apply bg-primary h-6 w-1 rounded-full;
  }
  & span {
    @apply text-xl font-bold tracking-wider uppercase;
  }
}
.section {
  @apply flex w-full flex-col justify-between gap-4;
}
.artist-tag {
  flex: 0 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @apply hover:text-primary min-w-0 cursor-pointer text-sm underline-offset-2 transition-all duration-300 hover:scale-105;
  color: var(--foreground);
  opacity: 0.6;
}
</style>
