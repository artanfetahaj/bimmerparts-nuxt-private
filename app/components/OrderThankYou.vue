<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const paymentStatus       = ref<'pending' | 'paid' | 'failed' | 'checking'>('checking')
const resolvedOrderNumber = ref<string | undefined>(props.orderNumber)

onMounted(async () => {
  // Card payment flow: sessionStorage holds the payment_id and checkout data
  const pendingPaymentId = sessionStorage.getItem('pending_payment_id')

  if (pendingPaymentId) {
    try {
      const { status } = await ordersService.verifyPayment(pendingPaymentId)

      if (status === 'paid') {
        const raw = sessionStorage.getItem('pending_checkout')
        const checkoutData = raw ? JSON.parse(raw) : null

        if (checkoutData) {
          checkoutData.mollie_payment_id = pendingPaymentId
          const orderResult = await ordersService.create(checkoutData)
          resolvedOrderNumber.value = orderResult.order_number
        }

        paymentStatus.value = 'paid'
        clearCart()
        sessionStorage.removeItem('pending_payment_id')
        sessionStorage.removeItem('pending_checkout')
      } else if (status === 'failed') {
        paymentStatus.value = 'failed'
        sessionStorage.removeItem('pending_payment_id')
        sessionStorage.removeItem('pending_checkout')
      } else {
        paymentStatus.value = 'pending'
      }
    } catch {
      paymentStatus.value = 'pending'
    }
    return
  }

  // Bank transfer flow: order already exists, just check its payment status
  if (!props.orderNumber) {
    paymentStatus.value = 'pending'
    return
  }

  try {
    const result = await ordersService.getPaymentStatus(props.orderNumber)
    const status = result.payment_status as 'pending' | 'paid' | 'failed'
    paymentStatus.value = status
    if (status === 'paid') clearCart()
  } catch {
    paymentStatus.value = 'pending'
  }
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
      <template v-else>
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

      <div class="flex items-center gap-3 mt-4">
        <button @click="handleBackHome" class="px-5 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600">
          {{ t('thankyou.backHome') }}
        </button>
      </div>

    </div>
  </div>
</template>
