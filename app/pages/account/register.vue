<script setup lang="ts">
import authService from '@/services/auth'
definePageMeta({ layout: 'blank' })
if (import.meta.client && authService.isAuthenticated()) {
  await navigateTo('/account', { replace: true })
}
</script>

<template>
  <Register />
</template>
