<template>
  <input
    :type="type"
    :value="modelValue"
    :min="min"
    :max="max"
    @input="onInput"
    class="hide-arrows focus:ring-primary focus:border-primary border-foreground/10 rounded px-2 py-1 outline-none focus:ring-1"
    :class="$attrs.class"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  type?: string
  min?: string | number
  max?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text'
})

const emit = defineEmits(['update:modelValue'])

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value

  if (props.type === 'number') {
    value = value === '' ? '' : Number(value)
  }

  emit('update:modelValue', value)
}
</script>

<style scoped>
@reference "@/assets/main.css";

.hide-arrows::-webkit-outer-spin-button,
.hide-arrows::-webkit-inner-spin-button {
  @apply m-0 appearance-none;
}
</style>
