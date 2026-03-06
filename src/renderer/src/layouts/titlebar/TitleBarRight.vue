<template>
  <div class="drag flex w-full items-center justify-between px-2">
    <div class="flex-1 h-full"></div>
    <div class="no-drag flex items-center">
      <button
        class="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:text-destructive active:opacity-50"
        @click="() => MinimizeWindowMessage.send()"
      >
        <Minus :size="16" :stroke-width="1.2" />
      </button>

      <button
        class="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:text-destructive active:opacity-50"
        @click="() => MaximizeWindowMessage.send()"
      >
        <Square :size="14" :stroke-width="1.2" />
      </button>

      <button
        class="flex h-10 w-10 cursor-pointer items-center justify-center transition-colors hover:text-destructive active:opacity-50"
        @click="() => CloseWindowMessage.send()"
      >
        <X :size="18" :stroke-width="1.2" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Minus, Square, X } from 'lucide-vue-next'
import { CloseWindowMessage, MinimizeWindowMessage, MaximizeWindowMessage } from '@/ccs/electron'
</script>

<style scoped>
.drag {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
