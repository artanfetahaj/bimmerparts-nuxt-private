<script setup lang="ts">
import {
  ToastClose,
  ToastRoot,
} from 'reka-ui'
import { computed, ref } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    class?: string
    variant?: 'default' | 'success' | 'error'
    duration?: number
    open?: boolean
  }>(),
  {
    variant: 'default',
    duration: 5000,
    open: true,
  }
)

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = ref(props.open)

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800'
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800'
    default:
      return 'bg-white border-gray-200 text-gray-900'
  }
})

function handleOpenChange(open: boolean) {
  isOpen.value = open
  emit('update:open', open)
}
</script>

<template>
  <ToastRoot
    :open="isOpen"
    :duration="duration"
    :class="[
      'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all mb-2',
      variantClasses,
      props.class,
    ]"
    @update:open="handleOpenChange"
  >
    <div class="grid gap-1 flex-1">
      <slot />
    </div>
    <ToastClose
      class="rounded-md p-1 hover:bg-black/10 transition-colors focus:outline-none"
    >
      <X class="h-4 w-4" />
    </ToastClose>
  </ToastRoot>
</template>
