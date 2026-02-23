<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ordersService from '../../services/orders'

const isLoading = ref(false)
const error = ref('')
const query = ref('')
const statusFilter = ref<'all' | 'completed' | 'canceled' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all')
const orders = ref<any[]>([])

const loadOrders = async () => {
  error.value = ''
  try {
    isLoading.value = true
    const res = await ordersService.list()
    orders.value = res
  } catch (e: any) {
    error.value = e?.message || 'Failed to load orders.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrders)

const filteredOrders = computed(() => {
  let list = orders.value
  if (statusFilter.value !== 'all') {
    list = list.filter(o => (o.status || '').toLowerCase() === statusFilter.value)
  }
  if (query.value.trim().length > 0) {
    const q = query.value.toLowerCase()
    list = list.filter(o => String(o.number || o.id).toLowerCase().includes(q))
  }
  return list
})
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-lg font-semibold text-gray-900">Your Orders</h1>
      <div class="flex items-center gap-2">
        <select v-model="statusFilter" class="h-10 px-3 border rounded-lg text-sm">
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
          <option value="pending">Pending</option>
        </select>
        <div class="relative">
          <input v-model="query" placeholder="Search" class="h-10 pl-3 pr-10 border rounded-lg text-sm" />
          <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>
    </div>

    <div v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</div>
    <div v-if="isLoading" class="text-sm text-gray-600">Loading...</div>
    <div v-else class="space-y-4">
      <div v-for="order in filteredOrders" :key="order.id" class="border rounded-xl p-4 flex items-center gap-4">
        <img :src="order.image || '/images/product-1.png'" alt="order" class="w-16 h-16 object-contain rounded border" />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-3 text-sm">
            <a href="#" class="text-orange-600 hover:underline">#{{ order.number || order.id }}</a>
            <span class="text-gray-400">•</span>
            <span class="text-gray-600">{{ order.date || order.created_at?.substring(0,10) }}</span>
            <span class="text-gray-400">•</span>
            <span
              class="px-2 py-0.5 rounded-full text-xs"
              :class="{
                'bg-green-50 text-green-600': ['completed','delivered','paid'].includes((order.status||'').toLowerCase()),
                'bg-red-50 text-red-600': ['canceled','cancelled','failed'].includes((order.status||'').toLowerCase()),
                'bg-yellow-50 text-yellow-700': ['pending','processing','shipped'].includes((order.status||'').toLowerCase())
              }"
            >
              {{ (order.status || '').charAt(0).toUpperCase() + (order.status || '').slice(1) }}
            </span>
            <span class="text-gray-400">•</span>
            <span class="text-gray-900 font-medium">€ {{ (order.total || 0).toFixed(2).replace('.', ',') }}</span>
          </div>
        </div>
      </div>
      <div v-if="filteredOrders.length === 0" class="text-sm text-gray-600">No orders found.</div>
    </div>
  </div>
</template>

<style scoped>
</style>


