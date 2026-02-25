<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Search, Loader2 } from 'lucide-vue-next'
import { Input } from '../ui/input'
import { useLocale } from '../../stores/locale'
import { Product, ProductIncludes } from '../../models/Product'
import type { Product as ProductType } from '../../models/Product'
import { RouteName } from '../../enums/RouteName'
import { useRouter } from 'vue-router'

const { t } = useLocale()
const router = useRouter()

const searchQuery = ref('')
const isOpen = ref(false)
const isLoading = ref(false)
const searchResults = ref<ProductType[]>([])
const searchTimeout = ref<NodeJS.Timeout | null>(null)
const searchContainerRef = ref<HTMLElement | null>(null)

// Debounced search function
const performSearch = async () => {
  if (!searchQuery.value || searchQuery.value.trim().length < 2) {
    searchResults.value = []
    isOpen.value = false
    isLoading.value = false
    return
  }

  isLoading.value = true
  isOpen.value = true

  try {
    const model = new Product()
      .filter({ search: searchQuery.value.trim() })
      .include([ProductIncludes.IMAGE, ProductIncludes.BRAND])
      .limit(5)

    const response = await model.all()
    searchResults.value = Array.isArray(response) ? response : response?.data ?? []
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

// Watch search query with debounce
watch(searchQuery, (newValue) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (!newValue || newValue.trim().length < 2) {
    searchResults.value = []
    isOpen.value = false
    isLoading.value = false
    return
  }

  searchTimeout.value = setTimeout(() => {
    performSearch()
  }, 300)
})

// Handle form submission (navigate to products page with search filter)
const handleSubmit = (e: Event) => {
  e.preventDefault()
  if (searchQuery.value.trim()) {
    navigateToProducts()
  }
}

// Navigate to products page with search filter
const navigateToProducts = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: RouteName.PRODUCTS,
      query: { search: searchQuery.value.trim() }
    })
    isOpen.value = false
  }
}

// Navigate to product detail page
const navigateToProduct = (product: ProductType) => {
  router.push({
    name: RouteName.PRODUCT_DETAILS,
    params: { slug: product.slug }
  })
  isOpen.value = false
  searchQuery.value = ''
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

// Format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(price)
}
</script>

<template>
  <form 
    role="search" 
    class="relative w-full" 
    @submit="handleSubmit"
    ref="searchContainerRef"
  >
    <Input
      v-model="searchQuery"
      type="text"
      :placeholder="t('search.placeholder')"
      class="h-12 pl-4 pr-14 rounded-full text-[15px] text-gray-900 placeholder-gray-500 w-full bg-gray-50 border-gray-300"
      autocomplete="off"
    />
    <button
      type="submit"
      class="absolute flex items-center justify-center w-10 h-10 rounded-full right-1 top-1 bg-transparent text-gray-400 hover:text-gray-600"
      :disabled="isLoading"
    >
      <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
      <Search v-else class="w-5 h-5" />
    </button>

    <!-- Search Results Dropdown -->
    <div
      v-if="isOpen && searchQuery.trim().length >= 2"
      class="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 max-h-[400px] overflow-y-auto"
    >
      <!-- Loading State -->
      <div v-if="isLoading" class="p-4 text-center text-gray-500 text-sm">
        {{ t('search.searching') || 'Searching...' }}
      </div>

      <!-- No Results -->
      <div v-else-if="searchResults.length === 0" class="p-4 text-center text-gray-500 text-sm">
        {{ t('search.noResults') || 'No products found' }}
      </div>

      <!-- Search Results -->
      <div v-else>
        <div
          v-for="product in searchResults"
          :key="product.id"
          @click="navigateToProduct(product)"
          class="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
        >
          <!-- Product Image -->
          <div class="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
            <img
              v-if="product.image?.thumb_url || product.image?.url"
              :src="product.image?.thumb_url || product.image?.url"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <Search class="w-5 h-5" />
            </div>
          </div>

          <!-- Product Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <p class="text-sm font-semibold text-orange-600">
                {{ formatPrice(product.discounted_price || product.price) }}
              </p>
              <p v-if="product.has_discount" class="text-xs text-gray-400 line-through">
                {{ formatPrice(product.price) }}
              </p>
            </div>
          </div>

          <!-- Brand -->
          <div v-if="product.brand" class="text-xs text-gray-500 hidden sm:block">
            {{ product.brand.name }}
          </div>
        </div>

        <!-- View All Button -->
        <button
          @click="navigateToProducts"
          type="button"
          class="w-full p-3 text-sm font-medium text-orange-600 hover:bg-orange-50 border-t border-gray-200 transition-colors"
        >
          {{ t('search.viewAll') || 'View all results' }}
        </button>
      </div>
    </div>
  </form>
</template>
