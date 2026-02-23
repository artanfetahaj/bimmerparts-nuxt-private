<script setup lang="ts">
import { useLocale } from '../stores/locale'

const emit = defineEmits<{
  navigateToHome: []
}>()

// Locale handling
const { t } = useLocale()

const handleBackHome = () => emit('navigateToHome')
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <div class="flex-1 container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
      <div class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-orange-500">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('thankyou.contact.title') }}</h1>
      <p class="text-gray-600 max-w-xl mb-8">
        {{ t('thankyou.contact.message') }}
      </p>
      <div class="flex items-center gap-3">
        <button @click="handleBackHome" class="px-5 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600">{{ t('thankyou.backHome') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>


