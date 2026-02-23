<script setup lang="ts">
import { Heart, X } from 'lucide-vue-next'
import { useWishlist } from '../../stores/wishlist'
import { useLocale } from '../../stores/locale'
import { useRouter } from 'vue-router'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

const router = useRouter()
const { items: wishlistItems, totalItems: wishlistCount, removeFromWishlist } = useWishlist()
const { t } = useLocale()

const handleWishlistItemClick = (productId: string | number) => {
  const idString = String(productId)
  if (idString && idString !== 'undefined' && idString !== 'null' && idString !== '') {
    router.push(`/products/${idString}`)
  }
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <button
        class="relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-600 cursor-pointer"
        aria-label="Wishlist"
      >
        <Heart class="w-5 h-5" />
        <span v-if="wishlistCount > 0" class="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center text-xs font-medium bg-orange-500 text-white">
          {{ wishlistCount }}
        </span>
      </button>
    </PopoverTrigger>

    <PopoverContent class="w-80 p-4" align="end">
      <h3 class="mb-3 text-sm font-semibold text-gray-700">{{ t('wishlist.title') }}</h3>
      <div v-if="wishlistItems.length === 0" class="py-6 text-sm text-center text-gray-500">{{ t('wishlist.empty') }}</div>
      <div v-else class="overflow-auto divide-y divide-gray-100 max-h-72">
        <div
          v-for="item in wishlistItems"
          :key="item.id"
          @click="handleWishlistItemClick(item.id)"
          class="flex items-start gap-3 py-3 transition-colors cursor-pointer select-none hover:bg-gray-50"
        >
          <img :src="item.image || '/images/placeholder-product.svg'" :alt="item.title" class="flex-shrink-0 object-contain w-12 h-12 border rounded pointer-events-none" />
          <div class="flex-1 min-w-0 pointer-events-none">
            <div class="text-sm font-medium text-gray-900 truncate">{{ item.title }}</div>
            <div class="text-sm text-gray-600">€ {{ item.price.toFixed(2).replace('.', ',') }}</div>
          </div>
          <button
            @click.stop="removeFromWishlist(item.id)"
            type="button"
            class="z-10 flex-shrink-0 text-gray-400 hover:text-red-500"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
      <div class="mt-4">
        <NuxtLink
          to="/cart"
          class="block w-full py-3 font-medium text-center text-white bg-orange-500 rounded-lg hover:bg-orange-600"
        >
          {{ t('wishlist.checkout') }}
        </NuxtLink>
      </div>
    </PopoverContent>
  </Popover>
</template>
