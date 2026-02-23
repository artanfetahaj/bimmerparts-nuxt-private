<script setup lang="ts">
import { ToastDescription as RekaToastDescription, type ToastDescriptionProps } from 'reka-ui'

const props = defineProps<ToastDescriptionProps & {
  class?: string
}>()
</script>

<template>
  <RekaToastDescription
    v-bind="props"
    :class="['text-sm opacity-90', props.class]"
  >
    <slot />
  </RekaToastDescription>
</template>
