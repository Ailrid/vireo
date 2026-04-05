<template>
  <div>
    <DialogContent
      v-if="sct.show"
      :width="'18rem'"
      :height="'18rem'"
      :show="sct.show"
      @update:show="sct.closeDialog()"
    >
      <template #context="{ close }">
        <div
          v-if="sct.songDetail"
          class="relative flex h-full w-full flex-col overflow-hidden rounded-xl"
          :style="{ color: sct.songColor }"
        >
          <div class="absolute inset-0 z-0">
            <Img :cover="sct.songDetail.album.cover" class="h-full w-full object-cover"></Img>
          </div>

          <div class="z-10 flex h-[14rem] w-[18rem] flex-col justify-end">
            <div class="line-clamp-4 p-2 text-sm font-bold opacity-80 brightness-50 contrast-150">
              《{{ sct.songDetail.album.name }}》
            </div>
          </div>

          <div
            class="z-10 flex cursor-pointer items-center px-4 py-2"
            :style="{ backgroundColor: sct.songColor }"
            @click="
              () => {
                PlaySongMessage.send(sct.songDetail!)
                close()
              }
            "
          >
            <span
              class="line-clamp-1 text-xs font-bold tracking-widest uppercase brightness-50 contrast-150"
            >
              分享歌曲: {{ sct.songDetail.name }}
            </span>
          </div>
        </div>
        <div
          v-if="sct.playlistDetail"
          class="relative flex h-full w-full flex-col overflow-hidden rounded-xl"
          :style="{ color: sct.songColor }"
        >
          <div class="absolute inset-0 z-0">
            <Img
              :cover="sct.playlistDetail.firstSongCover"
              class="h-full w-full object-cover"
            ></Img>
          </div>

          <div class="z-10 flex h-[14rem] w-[18rem] flex-col justify-end">
            <div class="line-clamp-4 p-2 text-sm font-bold opacity-80 brightness-50 contrast-150">
              《{{ sct.playlistDetail.description }}》
            </div>
          </div>

          <div
            class="z-10 flex cursor-pointer items-center px-4 py-2"
            :style="{ backgroundColor: sct.songColor }"
            @click="
              () => {
                $router.push({ name: 'playlist', params: { id: sct.playlistDetail!.id } })
                close()
              }
            "
          >
            <span
              class="line-clamp-1 text-xs font-bold tracking-widest uppercase brightness-50 contrast-150"
            >
              分享歌单: {{ sct.playlistDetail.name }}
            </span>
          </div>
        </div>
      </template>
    </DialogContent>
  </div>
</template>

<script setup lang="ts">
import DialogContent from '../ui/dialog/DialogContent.vue'
import { useController } from '@virid/vue'
import { ShareDialogController } from './controllers'
import { PlaySongMessage } from '@/ccs/playback'
import Img from './Img.vue'
const sct = useController(ShareDialogController)
</script>

<style scoped></style>
