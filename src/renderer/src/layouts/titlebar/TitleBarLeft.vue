<template>
  <div class="drag z-50 flex w-full items-center justify-between px-2">
    <div class="no-drag flex items-center justify-center gap-2">
      <LoginDialog />
      <DropdownMenu>
        <template #trigger="{ toggle, isOpen }" as-child>
          <Button
            @click="toggle"
            variant="none"
            @wheel.passive="TitleBarLeftControllerMessage.send($event)"
            class="hover:text-primary"
          >
            <div class="flex items-center justify-center gap-1">
              <span class="text-sm">{{ tct.currentViewName }}</span>
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
              @click="tct.changeView('menu-area')"
              class="hover:bg-primary/10 hover:text-primary justify-start!"
            >
              <Heart class="mr-2 h-4 w-4" /> 功能菜单
            </Button>
            <Button
              variant="none"
              @click="tct.changeView('current-playlist')"
              class="hover:bg-primary/10 hover:text-primary justify-start!"
            >
              <ListMusic class="mr-2 h-4 w-4" /> 播放列表
            </Button>
            <Button
              variant="none"
              @click="tct.changeView('playlist-manager')"
              class="hover:bg-primary/10 hover:text-primary justify-start!"
            >
              <Disc class="mr-2 h-4 w-4" /> 歌单列表
            </Button>
          </div>
        </template>
      </DropdownMenu>
    </div>
    <div class="drag h-full flex-1"></div>
    <div class="no-drag flex items-center">
      <Button
        :size="18"
        v-if="tct.currentView === 'current-playlist'"
        variant="icon"
        class="group flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden transition-all duration-300 active:scale-75"
        @click="MoveToCurrentSongMessage.send()"
      >
        <MapPin
          :size="18"
          :stroke-width="1.2"
          class="group-hover:text-primary transition-all duration-500 ease-out group-hover:scale-125"
        />
      </Button>
      <Button
        :size="18"
        variant="icon"
        class="group flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden transition-all duration-300 active:scale-75"
        @click="$router.push({ name: 'setting' })"
      >
        <Settings
          :size="18"
          :stroke-width="1.2"
          class="group-hover:text-primary transition-all duration-500 ease-out group-hover:scale-125 group-hover:rotate-180"
        />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginDialog from '@/components/login/LoginDialog.vue'
import { Settings, ChevronDown, ChevronUp, ListMusic, Disc, Heart, MapPin } from 'lucide-vue-next'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import { useController } from '@virid/vue'
import { TitleBarLeftController, TitleBarLeftControllerMessage } from '../controllers'
import { MoveToCurrentSongMessage } from '@/components/sidebar/controllers'
import Button from '@/components/ui/Button.vue'
const tct = useController(TitleBarLeftController, {
  id: 'title-bar-left'
})
</script>

<style>
.drag {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
