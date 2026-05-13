<script setup lang="ts">
import authService from '@/services/auth'

if (import.meta.client && authService.isAuthenticated()) {
  await navigateTo('/account', { replace: true })
}
</script>

<template>
  <Login />
</template>
