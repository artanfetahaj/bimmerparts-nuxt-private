<script setup lang="ts">
import { useLocale } from '../stores/locale'

const props = defineProps<{
  orderNumber?:  string
  trackingCode?: string
}>()

const emit = defineEmits<{
  navigateToHome: []
}>()

const { t } = useLocale()

const handleBackHome = () => emit('navigateToHome')

const dhlTrackingUrl = (code: string) =>
  `https://www.dhl.com/nl-nl/home/traceren.html?tracking-id=${code}`
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <div class="flex-1 container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
      <div class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-orange-500">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('thankyou.order.title') }}</h1>
      <p class="text-gray-600 max-w-xl mb-8">
        {{ t('thankyou.order.message') }}
      </p>

      <div v-if="orderNumber" class="mb-4 text-sm text-gray-500">
        {{ t('thankyou.orderNumber') }}: <span class="font-semibold text-gray-800">{{ orderNumber }}</span>
      </div>

      <div v-if="trackingCode" class="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md w-full">
        <div class="flex items-center justify-center gap-2 mb-2">
          <img src="/images/dhl-1-logo-png.png" alt="DHL" class="h-12" onerror="this.style.display='none'" />
        </div>
        <span class="text-sm font-semibold text-yellow-800">{{ t('thankyou.dhlTracking') }}</span>
        <p class="text-lg font-mono font-bold text-gray-900 mb-3 mt-2">{{ trackingCode }}</p>
        <a
          :href="dhlTrackingUrl(trackingCode)"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-block px-4 py-2 rounded-lg bg-yellow-400 text-black text-sm font-medium hover:bg-yellow-500 transition-colors"
        >
          {{ t('thankyou.trackPackage') }}
        </a>
      </div>

      <div class="flex items-center gap-3">
        <button @click="handleBackHome" class="px-5 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600">{{ t('thankyou.backHome') }}</button>
      </div>
    </div>
  </div>
</template>


