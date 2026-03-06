<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue
})
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="
      cn(
        'flex h-8 w-full rounded-md border border-black/15 dark:border-white/20 bg-card px-3 py-1 text-sm transition-all duration-300 outline-none tabular-nums',
        'hover:border-black/25 dark:hover:border-white/40',
        'text-primary font-medium placeholder:text-muted-foreground selection:bg-primary/20',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15',
        'disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )
    "
  />
</template>

<style scoped>
/* 移除所有浏览器的原生数字箭头 */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
