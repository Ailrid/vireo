<template>
  <!-- <div class="backdrop-blur-xl fixed bottom-0 left-0 right-0 h-20 z-40 player-hole-bg"></div> -->

  <div
    class="fixed bottom-0 left-0 right-0 h-20 bg-card / 100 backdrop-blur-xl border-t border-border z-50 player-layout-mask"
  >
    <div class="flex h-full w-full items-center relative px-6">
      <div class="absolute -top-8 left-8 h-24 w-24 z-10">
        <SongCard />
      </div>

      <div class="flex-1 flex items-center justify-between ml-32">
        <Button class="max-w-xs" />
        <Slider class="flex-1 mx-10" />
        <Volume class="w-48" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import SongCard from './SongCard.vue'
import Button from './Button.vue'
import Slider from './Slider.vue'
import Volume from './Volume.vue'
</script>
<style scoped>
.player-hole-bg {
  /* 这里我们不需要填满颜色，因为 mask 已经让我们看到了底层的 bg-background。
    我们要画的是“槽位边缘的阴影”。
  */
  background: radial-gradient(
    54px at 80px -4px,
    /* 1. 圆心部分彻底透明，确保看到的是最底下的背景色 */ transparent 70%,
    /* 2. 在接近边缘 (90% - 100%) 的地方渐变出阴影颜色 */
    /* 我们使用 var(--foreground) 但给很低的透明度，这样亮暗模式都通用 */
    color-mix(in oklch, var(--foreground), transparent 90%) 94%,
    /* 3. 最边缘处稍微深一点，模拟物理转折的缝隙 */ var(--border) 100%
  );
}

.player-layout-mask {
  /* 这个 mask 保持不变，它是实现“透过底栏看底层背景”的关键 */
  mask-image: radial-gradient(54px at 80px -4px, transparent 100%, black 100%);
  -webkit-mask-image: radial-gradient(54px at 80px -4px, transparent 100%, black 100%);
}
</style>
