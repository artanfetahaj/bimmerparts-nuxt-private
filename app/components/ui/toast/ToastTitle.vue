<script setup lang="ts">
import { ToastTitle as RekaToastTitle, type ToastTitleProps } from 'reka-ui'

const props = defineProps<ToastTitleProps & {
  class?: string
}>()
</script>

<template>
  <RekaToastTitle
    v-bind="props"
    :class="['text-sm font-semibold', props.class]"
  >
    <slot />
  </RekaToastTitle>
</template>
