<script setup lang="ts">
import { computed } from 'vue'
import { ImageOff } from 'lucide-vue-next'
import { useWishlist } from '../stores/wishlist'
import { useLocale } from '../stores/locale'
import type { Product } from '@/models/Product'

const props = defineProps<{ product: Product }>()

const { toggleWishlist, items: wishlistItems } = useWishlist()
const { t, currentLocale } = useLocale()

const isInWishlist = (id: string) =>
  wishlistItems.value.some(item => String(item.id) === String(id))

const handleToggleWishlist = async (e: MouseEvent) => {
  e.stopPropagation()
  e.preventDefault()
  try {
    await toggleWishlist(props.product.id, {
      id: props.product.id,
      title: props.product.name,
      price: displayPrice.value,
      image: props.product.image?.url ?? '',
    })
  } catch (error) {
    console.error('Failed to toggle wishlist:', error)
  }
}

// Price helpers
const displayPrice = computed(() => Number(props.product.discounted_price ?? props.product.price ?? 0))
const originalPrice = computed(() => Number(props.product.price ?? 0))
const showOldPrice = computed(() => props.product.has_discount && originalPrice.value > displayPrice.value)

// Stock
const parseStockCount = (value: unknown): number | undefined => {
  if (value === undefined || value === null) return undefined
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string') {
    const parsed = parseFloat(value.trim().replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

const stockCount = computed(() => {
  const parsed = parseStockCount(props.product.stock)
  if (parsed === undefined) return undefined
  return parsed <= 0 ? 0 : Math.floor(parsed)
})

const isLowStock = computed(() => {
  const s = stockCount.value
  return s !== undefined && s > 0 && s < 10
})

const isOutOfStock = computed(() => stockCount.value === 0)

// Badges
const discountBadge = computed(() => {
  const pct = props.product.sale_percentage
  if (pct && Number(pct) > 0) return `-${Math.round(Number(pct))}%`
  return null
})

const stockBadge = computed(() => {
  if (isOutOfStock.value) return { key: 'out-of-stock', text: t('product.outOfStock'), variant: 'out' as const }
  if (isLowStock.value) return { key: 'low-stock', text: currentLocale.value === 'nl' ? 'Lage voorraad' : 'Low Stock', variant: 'low' as const }
  return null
})

const badges = computed(() => {
  const items: Array<{ key: string; text: string; variant: 'discount' | 'low' | 'out' }> = []
  if (discountBadge.value) items.push({ key: 'discount', text: discountBadge.value, variant: 'discount' })
  if (stockBadge.value) items.push(stockBadge.value)
  return items
})

const formatPrice = (n: number) => n.toFixed(2).replace('.', ',')
</script>

<template>
  <article class="bg-white rounded-lg shadow-sm flex flex-col relative cursor-pointer transition-all duration-300 hover:shadow-lg md:hover:scale-105 h-full">
    <!-- Badges -->
    <div v-if="badges.length" class="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10">
      <span
        v-for="badge in badges"
        :key="badge.key"
        class="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium"
        :class="badge.variant === 'discount' ? 'bg-orange-500 text-white' : badge.variant === 'low' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'"
      >
        {{ badge.text }}
      </span>
    </div>

    <!-- Wishlist -->
    <button
      @click="handleToggleWishlist"
      type="button"
      class="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 z-10 cursor-pointer"
      :title="isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
    >
      <svg v-if="!isInWishlist(product.id)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3 h-3 sm:w-4 sm:h-4 text-gray-600">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3 h-3 sm:w-4 sm:h-4 text-orange-500">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>

    <!-- Image -->
    <div class="relative overflow-hidden rounded-t-lg bg-gray-50 flex items-center justify-center h-32 sm:h-40 lg:h-48">
      <img
        v-if="product.image?.url || product.image?.thumb_url"
        :src="product.image.url ?? product.image.thumb_url"
        :alt="product.name"
        class="w-full h-full object-contain p-2 sm:p-4"
      />
      <div v-else class="flex flex-col items-center justify-center gap-2 text-gray-300">
        <ImageOff class="w-10 h-10" />
      </div>
    </div>

    <!-- Info -->
    <div class="p-2 sm:p-3 lg:p-4 flex flex-col flex-grow">
      <h3 class="text-xs sm:text-sm text-gray-900 font-medium mb-2 sm:mb-3 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
        {{ product.name }}
      </h3>
      <div class="mt-auto flex items-baseline gap-1 sm:gap-2">
        <span class="text-sm sm:text-base lg:text-lg font-bold text-gray-900">€ {{ formatPrice(displayPrice) }}</span>
        <span v-if="showOldPrice" class="text-xs sm:text-sm text-gray-500 line-through">
          € {{ formatPrice(originalPrice) }}
        </span>
      </div>
    </div>
  </article>
</template>
