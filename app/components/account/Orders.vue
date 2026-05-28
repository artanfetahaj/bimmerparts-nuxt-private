<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ordersService from '../../services/orders'

// ── List state ──────────────────────────────────────────────────────────────
const isLoading = ref(false)
const error = ref('')
const query = ref('')
const statusFilter = ref<'all' | 'completed' | 'canceled' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all')
const orders = ref<any[]>([])

const loadOrders = async () => {
  error.value = ''
  try {
    isLoading.value = true
    orders.value = await ordersService.list()
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

// ── Detail state ─────────────────────────────────────────────────────────────
const detail = ref<any>(null)
const isLoadingDetail = ref(false)
const detailError = ref('')
const isDownloading = ref(false)

const viewOrder = async (orderNumber: string) => {
  isLoadingDetail.value = true
  detailError.value = ''
  detail.value = null
  try {
    detail.value = await ordersService.getDetail(orderNumber)
  } catch (e: any) {
    detailError.value = e?.message || 'Failed to load order details.'
  } finally {
    isLoadingDetail.value = false
  }
}

const backToList = () => {
  detail.value = null
  detailError.value = ''
}

const downloadInvoice = async (orderNumber: string) => {
  isDownloading.value = true
  try {
    await ordersService.downloadInvoice(orderNumber)
  } catch (e: any) {
    console.error('Invoice download failed', e)
  } finally {
    isDownloading.value = false
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusClass = (status: string) => {
  const s = (status || '').toLowerCase()
  if (['completed', 'delivered', 'paid'].includes(s)) return 'bg-green-50 text-green-600'
  if (['canceled', 'cancelled', 'failed'].includes(s)) return 'bg-red-50 text-red-600'
  return 'bg-yellow-50 text-yellow-700'
}

const statusLabel = (status: string) =>
  (status || '').charAt(0).toUpperCase() + (status || '').slice(1)

const formatPrice = (val: any) =>
  '€ ' + (parseFloat(val) || 0).toFixed(2).replace('.', ',')
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">

    <!-- ── Order detail view ─────────────────────────────────────────────── -->
    <div v-if="detail || isLoadingDetail || detailError">

      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <button @click="backToList" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">
          Order {{ detail?.order_number || '...' }}
        </h1>
        <span v-if="detail" class="px-2 py-0.5 rounded-full text-xs" :class="statusClass(detail.status)">
          {{ statusLabel(detail.status) }}
        </span>
      </div>

      <div v-if="isLoadingDetail" class="text-sm text-gray-500 py-8 text-center">Loading order details…</div>
      <div v-else-if="detailError" class="text-sm text-red-600">{{ detailError }}</div>

      <div v-else-if="detail" class="space-y-6">

        <!-- Meta row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p class="text-gray-500 mb-0.5">Date</p>
            <p class="font-medium text-gray-900">{{ detail.created_at?.substring(0, 10) || '—' }}</p>
          </div>
          <div>
            <p class="text-gray-500 mb-0.5">Payment</p>
            <p class="font-medium text-gray-900 capitalize">{{ (detail.payment_method || '').replace(/_/g, ' ') }}</p>
          </div>
          <div>
            <p class="text-gray-500 mb-0.5">Payment status</p>
            <p class="font-medium" :class="statusClass(detail.payment_status)">
              {{ statusLabel(detail.payment_status) }}
            </p>
          </div>
          <div>
            <p class="text-gray-500 mb-0.5">Shipping</p>
            <p class="font-medium text-gray-900 capitalize">{{ detail.status || '—' }}</p>
          </div>
        </div>

        <!-- Addresses -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div class="border rounded-xl p-4">
            <p class="font-semibold text-gray-800 mb-1">Shipping address</p>
            <p class="text-gray-600 whitespace-pre-line">{{ detail.shipping_address }}</p>
          </div>
          <div v-if="detail.billing_address" class="border rounded-xl p-4">
            <p class="font-semibold text-gray-800 mb-1">Billing address</p>
            <p class="text-gray-600 whitespace-pre-line">{{ detail.billing_address }}</p>
          </div>
        </div>

        <!-- Items -->
        <div>
          <p class="font-semibold text-gray-800 mb-3">Order items</p>
          <div class="border rounded-xl overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th class="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">SKU</th>
                  <th class="text-center px-4 py-3 font-medium text-gray-600">Qty</th>
                  <th class="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                  <th class="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in detail.order_items" :key="item.id">
                  <td class="px-4 py-3 font-medium">
                    <NuxtLink
                      v-if="item.product?.slug"
                      :to="`/products/${item.product.slug}`"
                      class="text-gray-900 hover:text-orange-500 transition-colors"
                    >
                      {{ item.product_name }}
                    </NuxtLink>
                    <span v-else class="text-gray-900">{{ item.product_name }}</span>
                  </td>
                  <td class="px-4 py-3 text-gray-500 hidden sm:table-cell">{{ item.product_sku }}</td>
                  <td class="px-4 py-3 text-center text-gray-700">{{ item.quantity }}</td>
                  <td class="px-4 py-3 text-right text-gray-700">{{ formatPrice(item.unit_price) }}</td>
                  <td class="px-4 py-3 text-right font-medium text-gray-900">{{ formatPrice(item.total_price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Totals + Invoice download -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

          <!-- Totals -->
          <div class="text-sm space-y-1 min-w-[220px]">
            <div class="flex justify-between gap-8 text-gray-600">
              <span>Subtotal</span>
              <span>{{ formatPrice(detail.subtotal) }}</span>
            </div>
            <div class="flex justify-between gap-8 text-gray-600">
              <span>Shipping</span>
              <span>{{ parseFloat(detail.shipping_cost) === 0 ? 'Free' : formatPrice(detail.shipping_cost) }}</span>
            </div>
            <div class="flex justify-between gap-8 text-gray-600">
              <span>VAT (21%)</span>
              <span>{{ formatPrice(detail.tax_amount) }}</span>
            </div>
            <div class="flex justify-between gap-8 font-semibold text-gray-900 border-t pt-2 mt-2">
              <span>Total</span>
              <span>{{ formatPrice(detail.total_amount) }}</span>
            </div>
          </div>

          <!-- Invoice download -->
          <button
            @click="downloadInvoice(detail.order_number)"
            :disabled="isDownloading"
            class="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            {{ isDownloading ? 'Downloading…' : 'Download invoice' }}
          </button>
        </div>

        <!-- Tracking -->
        <div v-if="detail.dhl_tracking_code" class="border rounded-xl p-4 flex items-center justify-between text-sm">
          <div>
            <p class="font-medium text-gray-800">DHL Tracking</p>
            <p class="text-gray-500 mt-0.5">{{ detail.dhl_tracking_code }}</p>
          </div>
          <a
            v-if="detail.dhl_label_url"
            :href="detail.dhl_label_url"
            target="_blank"
            class="text-orange-600 hover:underline font-medium"
          >
            Track shipment →
          </a>
        </div>

      </div>
    </div>

    <!-- ── Orders list view ──────────────────────────────────────────────── -->
    <div v-else>
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-lg font-semibold text-gray-900">Your Orders</h1>
        <div class="flex items-center gap-2">
          <select v-model="statusFilter" class="h-10 px-3 border rounded-lg text-sm">
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
          <div class="relative">
            <input v-model="query" placeholder="Search" class="h-10 pl-3 pr-10 border rounded-lg text-sm" />
            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      <div v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</div>
      <div v-if="isLoading" class="text-sm text-gray-600">Loading…</div>

      <div v-else class="space-y-3">
        <button
          v-for="order in filteredOrders"
          :key="order.id"
          @click="viewOrder(order.number)"
          class="w-full border rounded-xl p-4 flex items-center gap-4 text-left hover:border-orange-300 hover:bg-orange-50 transition-colors group"
        >
          <img
            :src="order.image || '/images/product-1.png'"
            alt="order"
            class="w-16 h-16 object-contain rounded border shrink-0"
          />
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <span class="text-orange-600 font-medium group-hover:underline">
                #{{ order.number || order.id }}
              </span>
              <span class="text-gray-400">•</span>
              <span class="text-gray-600">{{ order.date || order.created_at?.substring(0, 10) }}</span>
              <span class="text-gray-400">•</span>
              <span class="px-2 py-0.5 rounded-full text-xs" :class="statusClass(order.status)">
                {{ statusLabel(order.status) }}
              </span>
              <span class="text-gray-400">•</span>
              <span class="text-gray-900 font-medium">{{ formatPrice(order.total) }}</span>
            </div>
          </div>
          <svg class="w-4 h-4 text-gray-400 group-hover:text-orange-500 shrink-0 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div v-if="filteredOrders.length === 0" class="text-sm text-gray-600 py-4 text-center">
          No orders found.
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
