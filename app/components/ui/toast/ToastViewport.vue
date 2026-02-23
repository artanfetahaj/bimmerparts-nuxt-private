<script setup lang="ts">
import { ToastViewport as RekaToastViewport } from 'reka-ui'

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <RekaToastViewport
    :class="[
      'fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-[380px] outline-none',
      props.class,
    ]"
  />
</template>
