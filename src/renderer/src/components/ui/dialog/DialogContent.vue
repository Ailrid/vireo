<template>
  <Teleport to="#dialog">
    <div class="fixed inset-0 z-1000 flex items-center justify-center">
      <!-- 遮罩 -->
      <Transition name="fade" appear>
        <div v-if="show" class="bg-card/50 absolute inset-0 backdrop-blur-md" @click="close"></div>
      </Transition>
      <!-- 主要内容 -->
      <Transition name="pop" appear>
        <div
          v-if="show"
          :style="{ height, width }"
          class="bg-card relative z-10 overflow-hidden rounded-2xl shadow-xl backdrop-blur-md"
        >
          <slot name="context" :close="close"></slot>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'

const props = defineProps<{
  show: boolean
  height: string
  width: string
}>()
const { show } = toRefs(props)

const emit = defineEmits(['update:show'])

const close = () => {
  show.value = false
  setTimeout(() => {
    emit('update:show', false)
  }, 500)
}
</script>

<style scoped>
/* 动画样式保持你原来的即可 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.pop-enter-active,
.pop-leave-active {
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.3s ease;
}
.pop-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
.pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
