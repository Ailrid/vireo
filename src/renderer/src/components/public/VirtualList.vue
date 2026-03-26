<template>
  <div
    ref="container"
    class="v-scroll-container h-full w-full overflow-y-auto"
    @scroll="vlc.onScroll"
  >
    <div :style="vlc.wrapperStyle">
      <div
        v-for="(item, index) in vlc.visibleData"
        :key="vlc.getItemKey(item, index)"
        :style="{ height: `${itemHeight}px` }"
      >
        <slot name="item" :item="item" :index="vlc.actualStartIndex + index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { useController } from '@virid/vue'
import { VirtualListController } from './controllers'

const props = withDefaults(
  defineProps<{
    listData: T[]
    itemHeight: number
    buffer?: number
    keyField?: keyof T
  }>(),
  { buffer: 5 }
)

const vlc = useController(VirtualListController<T>, { context: props })
defineExpose({
  scrollTo: (index: number) => vlc.scrollTo(index)
})
</script>

<style scoped>
.v-scroll-container {
  /* 开启硬件加速，防止滚动时侧边栏抖动 */
  will-change: transform;
  contain: strict;
}
</style>
