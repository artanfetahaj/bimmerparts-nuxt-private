<script setup lang="ts">
import { ToastProvider } from 'reka-ui'
import ToastViewport from './ToastViewport.vue'
import Toast from './Toast.vue'
import ToastTitle from './ToastTitle.vue'
import ToastDescription from './ToastDescription.vue'
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

function handleOpenChange(id: string, open: boolean) {
  if (!open) {
    dismiss(id)
  }
}
</script>

<template>
  <ToastProvider>
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :variant="toast.variant"
      :duration="toast.duration || 5000"
      :open="true"
      @update:open="(open) => handleOpenChange(toast.id, open)"
    >
      <ToastTitle v-if="toast.title">
        {{ toast.title }}
      </ToastTitle>
      <ToastDescription v-if="toast.description">
        {{ toast.description }}
      </ToastDescription>
    </Toast>
    <ToastViewport />
  </ToastProvider>
</template>
