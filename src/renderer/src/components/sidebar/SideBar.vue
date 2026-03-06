<template>
  <div class="sidebar-content h-full">
    <!-- <VirtualList :list-data="allData" :item-height="50" key-field="id">
      <template #item="{ item, index }">
        <div
          class="flex items-center h-full px-4 hover:bg-accent/50 cursor-pointer transition-colors"
        >
          <span class="text-xs text-muted-foreground w-8">{{ index }}</span>
          <span class="text-sm font-medium truncate">{{ item.title }}</span>
        </div>
      </template>
    </VirtualList> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VirtualList from '@components/public/VirtualList.vue'

const allData = ref(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    title: `菜单项目 ${i + 1}`
  }))
)
</script>
