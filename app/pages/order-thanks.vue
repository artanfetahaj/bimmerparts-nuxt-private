<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import OrderThankYou from '@/components/OrderThankYou.vue'

definePageMeta({
  ssr: false,
})

const router = useRouter()
const route  = useRoute()

const orderNumber   = route.query.order as string | undefined
const trackingCode  = route.query.tracking as string | undefined
</script>

<template>
  <OrderThankYou
    :order-number="orderNumber"
    :tracking-code="trackingCode"
    @navigate-to-home="router.push('/')"
  />
</template>
