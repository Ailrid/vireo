<template>
  <div class="drag z-50 flex w-full items-center justify-between px-2">
    <div class="no-drag flex items-center">
      <Button
        variant="icon"
        class="hover:text-primary h-10 w-10 active:opacity-50"
        @click="$router.go(-1)"
      >
        <ArrowLeft :size="18" :stroke-width="1.2" />
      </Button>

      <Button
        variant="icon"
        class="hover:text-primary h-10 w-10 active:opacity-50"
        @click="$router.go(1)"
      >
        <ArrowRight :size="18" :stroke-width="1.2" />
      </Button>
    </div>
    <div class="h-full flex-1"></div>
    <div class="no-drag flex items-center">
      <Button
        variant="icon"
        class="hover:text-primary h-10 w-10 active:opacity-50"
        @click="MinimizeWindowMessage.send()"
      >
        <Minus :size="16" :stroke-width="1.2" />
      </Button>

      <Button
        variant="icon"
        class="hover:text-primary h-10 w-10 active:opacity-50"
        @click="MaximizeWindowMessage.send()"
      >
        <Square :size="14" :stroke-width="1.2" />
      </Button>

      <Button
        variant="icon"
        class="hover:text-primary h-10 w-10 active:opacity-50"
        @click="BackupPlaybackMessage.send()"
      >
        <X :size="18" :stroke-width="1.2" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { Minus, Square, X, ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { BackupPlaybackMessage, MinimizeWindowMessage, MaximizeWindowMessage } from '@/ccs/electron'
</script>

<style scoped>
.drag {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
