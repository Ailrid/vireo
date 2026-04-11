<template>
  <div class="h-full w-full">
    <Transition name="fade" mode="out-in">
      <component :is="componentsMap[sct.currentView!]" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import CurrentPlaylist from './CurrentPlaylist.vue'
import PlaylistManager from './PlaylistManager.vue'
import MenuArea from './MenuArea.vue'
import { useController } from '@virid/vue'
import { SideBarController } from './controllers'

const sct = useController(SideBarController)
const componentsMap = {
  'menu-area': MenuArea,
  'current-playlist': CurrentPlaylist,
  'playlist-manager': PlaylistManager
}
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
