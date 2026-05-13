<script setup lang="ts">
import { useWishlist } from '@/stores/wishlist'
import { useLocale } from '@/stores/locale'

const { items, removeFromWishlist } = useWishlist()
const { t } = useLocale()
</script>

<template>
  <div class="container mx-auto px-4 md:px-6 py-10">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('wishlist.title') }}</h1>

    <div v-if="items.length === 0" class="py-16 text-center text-gray-500">
      <p>{{ t('wishlist.empty') }}</p>
      <NuxtLink to="/products" class="mt-4 inline-block text-orange-500 hover:underline font-medium">
        {{ t('nav.autoParts') }}
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="item in items"
        :key="item.id"
        class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <NuxtLink :to="`/products/${item.slug || item.id}`">
          <img
            :src="item.image || '/images/placeholder-product.svg'"
            :alt="item.title"
            class="w-full h-48 object-contain p-4 bg-gray-50"
          />
        </NuxtLink>
        <div class="p-4">
          <NuxtLink :to="`/products/${item.slug || item.id}`" class="text-sm font-medium text-gray-900 hover:text-orange-500 line-clamp-2">
            {{ item.title }}
          </NuxtLink>
          <div class="flex items-center justify-between mt-3">
            <span class="font-bold text-gray-900">€ {{ item.price.toFixed(2).replace('.', ',') }}</span>
            <button
              @click="removeFromWishlist(item.id)"
              class="text-sm text-red-500 hover:underline"
            >
              Verwijderen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
