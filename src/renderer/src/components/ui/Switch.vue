<template>
  <button
    type="button"
    @click="toggle"
    :size="size"
    :class="[
      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none',
      modelValue ? 'bg-primary' : 'bg-gray-200'
    ]"
  >
    <span
      :class="[
        'mt-0.5 ml-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
        modelValue ? 'translate-x-5' : 'translate-x-0'
      ]"
    />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    size?: number
  }>(),
  {
    size: 18
  }
)
const emit = defineEmits(['update:modelValue'])

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>
