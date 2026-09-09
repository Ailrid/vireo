<template>
  <div class="h-full w-full flex-col">
    <div class="flex h-full w-full">
      <div class="h-full w-8"></div>
      <!-- 侧边栏 -->
      <section
        class="relative flex h-full shrink-0 overflow-hidden transition-all duration-500 ease-in-out"
        :class="sct.isSidebarOpen ? 'w-68' : 'pointer-events-none w-0'"
      >
        <!-- 歌单信息 -->
        <div class="flex h-full w-full flex-1 flex-col overflow-hidden pr-8">
          <div class="flex-1"></div>
          <!-- 封面 -->
          <div class="mb-6 aspect-square w-full shrink-0 overflow-hidden rounded-xl shadow-lg">
            <Img
              v-if="sct.song?.items.at(0)"
              :cover="sct.song?.items.at(0)!.album.cover"
              class="transition-transform duration-700 hover:scale-105"
            />
            <div v-else class="bg-muted flex h-full w-full items-center justify-center">
              <span class="text-xs opacity-20">No Cover</span>
            </div>
          </div>
          <!-- 操作按钮 -->
          <div class="mb-6 flex w-full gap-2">
            <DropdownMenu>
              <template #trigger="{ toggle, isOpen }" as-child>
                <Button
                  @click="toggle"
                  variant="none"
                  @wheel.passive="sct.onWheel($event)"
                  class="hover:text-primary"
                >
                  <div class="flex items-center justify-center gap-1 pr-1">
                    <span class="text-sm">{{ sct.categoryName }}</span>
                    <ChevronDown v-if="!isOpen" :size="14" class="opacity-50" />
                    <ChevronUp v-else :size="14" class="opacity-50" />
                  </div>
                </Button>
              </template>
              <template #default>
                <div class="flex flex-col gap-1 border p-2 shadow-2xl">
                  <label class="text-foreground text-sm tracking-widest uppercase opacity-50"
                    >Select View</label
                  >
                  <div class="bg-primary h-0.5 w-full"></div>
                  <Button
                    variant="none"
                    @click="sct.currentView = 'song'"
                    class="hover:bg-primary/10 hover:text-primary justify-start!"
                    >歌曲</Button
                  >
                  <Button
                    variant="none"
                    @click="sct.currentView = 'artist'"
                    class="hover:bg-primary/10 hover:text-primary justify-start!"
                    >艺人</Button
                  >
                  <Button
                    variant="none"
                    @click="sct.currentView = 'album'"
                    class="hover:bg-primary/10 hover:text-primary justify-start!"
                    >专辑</Button
                  >
                  <Button
                    variant="none"
                    @click="sct.currentView = 'playlist'"
                    class="hover:bg-primary/10 hover:text-primary justify-start!"
                    >歌单</Button
                  >
                  <Button
                    variant="none"
                    @click="sct.currentView = 'user'"
                    class="hover:bg-primary/10 hover:text-primary justify-start!"
                    >用户</Button
                  >
                  <Button
                    variant="none"
                    @click="sct.currentView = 'mv'"
                    class="hover:bg-primary/10 hover:text-primary justify-start!"
                    >视频</Button
                  >
                  <Button
                    variant="none"
                    @click="sct.currentView = 'lyric'"
                    class="hover:bg-primary/10 hover:text-primary justify-start!"
                    >歌词</Button
                  >
                </div>
              </template>
            </DropdownMenu>
          </div>
          <div class="flex-1"></div>
          <!-- 歌单文字信息 -->
          <div class="flex flex-1 flex-col justify-start">
            <h1
              class="mb-3 flex justify-between text-2xl leading-tight font-black tracking-tighter"
            >
              <span>{{ sct.categoryName }}</span>
            </h1>
            <p class="mb-6 line-clamp-4 text-xs leading-relaxed opacity-60">
              {{ `查询到${sct[sct.currentView]?.items.length}个结果` }}
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
              <h2 class="text-lg font-bold">查询结果</h2>
              <p class="mr-2 ml-2 text-sm tracking-[0.2em] uppercase opacity-40">
                Total {{ sct[sct.currentView]?.items.length || 0 }} Result
              </p>
              <div class="cursor-pointer" @click="sct.isSidebarOpen = !sct.isSidebarOpen">
                <ChevronLeft
                  v-if="sct.isSidebarOpen"
                  class="h-4 w-4 transition-transform"
                  :size="16"
                />
                <ChevronRight v-else class="h-4 w-4 transition-transform" :size="16" />
              </div>
            </div>
            <div class="font-mono text-xs opacity-40">
              SHARD: 1 - {{ sct[sct.currentView]?.items.length || 0 }}
            </div>
          </div>
          <!-- 列表 -->
          <div class="flex-1 overflow-y-auto pt-4">
            <div
              v-if="sct[sct.currentView]"
              class="w-full"
              :class="{ 'h-full': sct[sct.currentView]?.total == 0 }"
            >
              <div
                v-if="sct[sct.currentView]?.total == 0"
                class="flex h-full items-center justify-center"
              >
                <Ghost :size="24"></Ghost>
                <div class="text-lg tracking-widest uppercase">这里什么都没有找到...</div>
              </div>
              <!-- song -->
              <div v-else-if="sct.currentView === 'song'">
                <div
                  v-for="(item, index) in sct.song?.items"
                  :key="item.id"
                  class="animate-in fade-in slide-in-from-left-4 fill-mode-both group flex h-[4rem] w-full items-center"
                  :style="{
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '600ms'
                  }"
                >
                  <div class="w-full">
                    <Song
                      @click="PlaySongMessage.send(item)"
                      :item="item"
                      :index="index"
                      :page-index="0"
                      :key="item.id"
                    ></Song>
                  </div>
                </div>
              </div>
              <!-- artist -->
              <div v-else-if="sct.currentView === 'artist'">
                <div
                  v-for="(item, index) in sct.artist?.items"
                  :key="item.id"
                  class="animate-in fade-in slide-in-from-left-4 fill-mode-both group flex h-[4rem] w-full items-center"
                  :style="{
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '600ms'
                  }"
                >
                  <div class="w-full">
                    <Card
                      @click="$router.push({ name: 'artist', params: { id: item.id } })"
                      :url="item.avatar"
                      :name="item.name"
                      :desc="item.description"
                      :index="index"
                      :page-index="0"
                    >
                    </Card>
                  </div>
                </div>
              </div>
              <!-- album -->
              <div v-else-if="sct.currentView === 'album'">
                <div
                  v-for="(item, index) in sct.album?.items"
                  :key="item.id"
                  class="animate-in fade-in slide-in-from-left-4 fill-mode-both group flex h-[4rem] w-full items-center"
                  :style="{
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '600ms'
                  }"
                >
                  <div class="w-full">
                    <Card
                      @click="$router.push({ name: 'album', params: { id: item.id } })"
                      :url="item.cover"
                      :name="item.name"
                      desc=""
                      :index="index"
                      :page-index="0"
                    >
                    </Card>
                  </div>
                </div>
              </div>
              <!-- playlist -->
              <div v-else-if="sct.currentView === 'playlist'">
                <div
                  v-for="(item, index) in sct.playlist?.items"
                  :key="item.id"
                  class="animate-in fade-in slide-in-from-left-4 fill-mode-both group flex h-[4rem] w-full items-center"
                  :style="{
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '600ms'
                  }"
                >
                  <div class="w-full">
                    <Card
                      @click="$router.push({ name: 'playlist', params: { id: item.id } })"
                      :url="item.cover"
                      :name="item.name"
                      :desc="item.description"
                      :index="index"
                      :page-index="0"
                    >
                    </Card>
                  </div>
                </div>
              </div>
              <!-- user -->
              <div v-else-if="sct.currentView === 'user'">
                <div
                  v-for="(item, index) in sct.user?.items"
                  :key="item.id"
                  class="animate-in fade-in slide-in-from-left-4 fill-mode-both group flex h-[4rem] w-full items-center"
                  :style="{
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '600ms'
                  }"
                >
                  <div class="w-full">
                    <Card
                      @click="$router.push({ name: 'account', params: { id: item.id } })"
                      :url="item.avatar"
                      :name="item.name"
                      :desc="item.signature"
                      :index="index"
                      :page-index="0"
                    >
                    </Card>
                  </div>
                </div>
              </div>
              <!-- mv -->
              <div v-else-if="sct.currentView === 'mv'">
                <div
                  v-for="(item, index) in sct.mv?.items"
                  :key="item.id"
                  class="animate-in fade-in slide-in-from-left-4 fill-mode-both group flex h-[4rem] w-full items-center"
                  :style="{
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '600ms'
                  }"
                >
                  <div class="w-full">
                    <!-- <Card
                      @click="$router.push({ name: 'artist', params: { id: item.id } })"
                      :url="item."
                      :name="item.name"
                      :desc="item.description"
                      :index="index"
                      :page-index="0"
                    >
                    </Card> -->
                    <!-- Todo -->
                  </div>
                </div>
              </div>
              <!-- lyric -->
              <div v-else-if="sct.currentView === 'lyric'">
                <div
                  v-for="(item, index) in sct.lyric?.items"
                  :key="item.id"
                  class="animate-in fade-in slide-in-from-left-4 fill-mode-both group flex h-[4rem] w-full items-center"
                  :style="{
                    animationDelay: `${index * 50}ms`,
                    animationDuration: '600ms'
                  }"
                >
                  <div class="w-full">
                    <Song
                      @click="PlaySongMessage.send(item)"
                      :item="item"
                      :index="index"
                      :page-index="0"
                      :key="item.id"
                    ></Song>
                  </div>
                </div>
              </div>
            </div>
            <!-- placeholder -->
            <div v-else class="flex h-full items-center justify-center">
              <div class="text-center">
                <div class="mb-2 animate-bounce text-xl">💿</div>
                <div class="text-sm tracking-widest uppercase">Fetching ...</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useController } from '@virid/vue'
import { SearchController } from './controllers'
import { ChevronDown, ChevronUp, Ghost } from 'lucide-vue-next'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import Button from '@/components/ui/Button.vue'
import { PlaySongMessage } from '@/ccs/playback'
import Song from '@/components/public/Song.vue'
import Card from '@/components/public/Card.vue'
import Img from '@/components/public/Img.vue'
const sct = useController(SearchController)
</script>
