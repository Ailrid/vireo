<template>
  <DropdownMenu>
    <template #trigger="{ toggle, isOpen }">
      <Button
        variant="outline"
        @click="toggle"
        :class="[isOpen ? 'ring-primary border-primary ring-1' : 'hover:bg-accent']"
      >
        <div class="flex items-center justify-center p-2">
          <span class="truncate text-sm">{{ currentLabel || placeholder }}</span>
          <ChevronDown
            :size="14"
            :class="['opacity-50 transition-transform duration-200', isOpen ? 'rotate-180' : '']"
          />
        </div>
      </Button>
    </template>
    <div class="flex flex-col p-1">
      <div
        v-for="item in options"
        :key="item.value"
        @click="handleSelect(item.value)"
        :class="[
          'flex w-36 cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors',
          modelValue === item.value
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:text-primary'
        ]"
      >
        {{ item.label }}
        <Check v-if="modelValue === item.value" :size="14" class="mr-2" />
      </div>
    </div>
  </DropdownMenu>
</template>

<script setup lang="ts">
import Button from './Button.vue'
import { computed } from 'vue'
import DropdownMenu from './DropdownMenu.vue'
import { ChevronDown, Check } from 'lucide-vue-next'

interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue: string | number
  options: Option[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择...'
})

const emit = defineEmits(['update:modelValue', 'change'])

const currentLabel = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)?.label
})

function handleSelect(value: string | number) {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>
