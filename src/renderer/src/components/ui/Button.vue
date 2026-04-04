<template>
  <button
    :size="props.size"
    class="flex cursor-pointer items-center justify-center transition-all duration-300"
    :class="[variantMap[props.variant]]"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'icon' | 'outline' | 'none'
    size?: number
  }>(),
  {
    variant: 'outline',
    size: 18
  }
)

const variantMap = {
  icon: 'rounded-sm',
  outline: 'bg-card rounded-sm border hover:bg-primary/10 hover:text-primary p-2',
  none: ''
}
</script>

<style scoped></style>
