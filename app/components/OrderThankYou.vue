<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLocale } from '../stores/locale'
import { useCart } from '../stores/cart'
import ordersService from '../services/orders'

const props = defineProps<{
  orderNumber?:  string
  trackingCode?: string
}>()

const emit = defineEmits<{
  navigateToHome: []
}>()

const { t } = useLocale()
const { clearCart } = useCart()

const paymentStatus       = ref<'pending' | 'paid' | 'failed' | 'processing' | 'checking'>('checking')
const resolvedOrderNumber = ref<string | undefined>(props.orderNumber)

let pollTimer: ReturnType<typeof setTimeout> | null = null

function getOrderToken(orderNumber: string): string | null {
  return sessionStorage.getItem(`order_token_${orderNumber}`)
}

function clearOrderToken(orderNumber: string): void {
  sessionStorage.removeItem(`order_token_${orderNumber}`)
}

async function pollPaymentStatus(orderNumber: string, token: string | null, startedAt: number, attempt: number) {
  const elapsed = Date.now() - startedAt
  if (elapsed > 30_000) {
    paymentStatus.value = 'processing'
    if (token) clearOrderToken(orderNumber)
    return
  }

  try {
    const result = await ordersService.getPaymentStatus(orderNumber, token || undefined)
    const status = result.payment_status as string

    if (status === 'paid') {
      paymentStatus.value = 'paid'
      clearCart()
      if (token) clearOrderToken(orderNumber)
    } else if (status === 'failed' || status === 'canceled') {
      paymentStatus.value = 'failed'
      if (token) clearOrderToken(orderNumber)
    } else {
      // Still open/pending — backoff: 1s, 2s, 3s, then 4s intervals
      const delay = Math.min(1000 * (attempt + 1), 4000)
      pollTimer = setTimeout(() => pollPaymentStatus(orderNumber, token, startedAt, attempt + 1), delay)
    }
  } catch {
    // On error, keep checking until timeout
    const delay = Math.min(2000 * (attempt + 1), 8000)
    pollTimer = setTimeout(() => pollPaymentStatus(orderNumber, token, startedAt, attempt + 1), delay)
  }
}

onMounted(async () => {
  const orderNumber = props.orderNumber
  if (!orderNumber) {
    paymentStatus.value = 'processing'
    return
  }

  resolvedOrderNumber.value = orderNumber
  const token = getOrderToken(orderNumber)
  await pollPaymentStatus(orderNumber, token, Date.now(), 0)
})

onUnmounted(() => {
  if (pollTimer) clearTimeout(pollTimer)
})

const handleBackHome = () => emit('navigateToHome')

const dhlTrackingUrl = (code: string) =>
  `https://www.dhl.com/nl-nl/home/traceren.html?tracking-id=${code}`
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <div class="flex-1 container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">

      <!-- Checking -->
      <template v-if="paymentStatus === 'checking'">
        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-gray-400">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-700 mb-3">{{ t('thankyou.verifying') }}</h1>
      </template>

      <!-- Paid -->
      <template v-else-if="paymentStatus === 'paid'">
        <div class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-orange-500">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('thankyou.order.title') }}</h1>
        <p class="text-gray-600 max-w-xl mb-8">{{ t('thankyou.order.message') }}</p>

        <div v-if="resolvedOrderNumber" class="mb-4 text-sm text-gray-500">
          {{ t('thankyou.orderNumber') }}: <span class="font-semibold text-gray-800">{{ resolvedOrderNumber }}</span>
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
      </template>

      <!-- Failed -->
      <template v-else-if="paymentStatus === 'failed'">
        <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-red-500">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('thankyou.failed.title') }}</h1>
        <p class="text-gray-600 max-w-xl mb-8">{{ t('thankyou.failed.message') }}</p>
        <div v-if="resolvedOrderNumber" class="mb-4 text-sm text-gray-500">
          {{ t('thankyou.orderNumber') }}: <span class="font-semibold text-gray-800">{{ resolvedOrderNumber }}</span>
        </div>
      </template>

      <!-- Pending (bank transfer waiting) -->
      <template v-else-if="paymentStatus === 'pending'">
        <div class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-orange-500">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('thankyou.order.title') }}</h1>
        <p class="text-gray-600 max-w-xl mb-8">{{ t('thankyou.order.message') }}</p>
        <div v-if="resolvedOrderNumber" class="mb-4 text-sm text-gray-500">
          {{ t('thankyou.orderNumber') }}: <span class="font-semibold text-gray-800">{{ resolvedOrderNumber }}</span>
        </div>
      </template>

      <!-- Payment still processing after 30s timeout -->
      <template v-else>
        <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 text-blue-500">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-3">{{ t('thankyou.processing.title') || 'Betaling wordt verwerkt' }}</h1>
        <p class="text-gray-600 max-w-xl mb-8">{{ t('thankyou.processing.message') || 'Uw betaling wordt nog verwerkt. U ontvangt een bevestiging per e-mail.' }}</p>
        <div v-if="resolvedOrderNumber" class="mb-4 text-sm text-gray-500">
          {{ t('thankyou.orderNumber') }}: <span class="font-semibold text-gray-800">{{ resolvedOrderNumber }}</span>
        </div>
      </template>

      <div class="flex items-center gap-3 mt-4">
        <button @click="handleBackHome" class="px-5 py-3 rounded-lg bg-orange-500 text-zinc-900 font-medium hover:bg-orange-600">
          {{ t('thankyou.backHome') }}
        </button>
      </div>

    </div>
  </div>
</template>
