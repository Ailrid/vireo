<template>
  <div>
    <slot name="trigger" :open="open"></slot>
    <DialogContent v-if="isShowing" v-model:show="isShowing" :height="height" :width="width">
      <template #context="{ close }">
        <slot name="context" :close="close"></slot>
      </template>
    </DialogContent>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DialogContent from './DialogContent.vue'

withDefaults(
  defineProps<{
    height?: string
    width?: string
  }>(),
  {
    height: 'auto',
    width: 'auto'
  }
)

const isShowing = ref(false)

const open = () => {
  isShowing.value = true
}
</script>
