<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Search, Loader2 } from 'lucide-vue-next'
import { Input } from '../ui/input'
import { useLocale } from '../../stores/locale'
import productService from '../../services/product'

const { t } = useLocale()
const router = useRouter()

const searchQuery = ref('')
const results = ref<any[]>([])
const isOpen = ref(false)
const isLoading = ref(false)
const activeIndex = ref(-1)
const wrapperRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchResults(query: string) {
  if (query.trim().length < 2) {
    results.value = []
    isOpen.value = false
    return
  }

  isLoading.value = true
  isOpen.value = true

  try {
    const response = await productService.getAllProducts({
      search: query.trim(),
      per_page: 6,
    })
    const items = response?.data ?? []
    results.value = items.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.discounted_price ?? p.price,
      originalPrice: p.has_discount ? p.price : null,
      image: p.image?.thumbnail ?? p.image?.original ?? null,
    }))
  } catch {
    results.value = []
  } finally {
    isLoading.value = false
  }
}

watch(searchQuery, (val) => {
  activeIndex.value = -1
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!val || val.trim().length < 2) {
    results.value = []
    isOpen.value = false
    return
  }
  debounceTimer = setTimeout(() => fetchResults(val), 300)
})

function goToResults() {
  if (!searchQuery.value.trim()) return
  isOpen.value = false
  router.push({ path: '/products', query: { search: searchQuery.value.trim() } })
}

function selectProduct(slug: string) {
  isOpen.value = false
  searchQuery.value = ''
  results.value = []
  router.push(`/products/${slug}`)
}

function onSubmit() {
  if (activeIndex.value >= 0 && activeIndex.value < results.value.length) {
    selectProduct(results.value[activeIndex.value].slug)
  } else {
    goToResults()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    // +1 for the "View all results" item
    const max = results.value.length > 0 ? results.value.length : 0
    activeIndex.value = activeIndex.value < max ? activeIndex.value + 1 : 0
    scrollToActive()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const max = results.value.length > 0 ? results.value.length : 0
    activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : max
    scrollToActive()
  } else if (e.key === 'Escape') {
    isOpen.value = false
    activeIndex.value = -1
  }
}

function scrollToActive() {
  nextTick(() => {
    const el = dropdownRef.value?.querySelector('[data-active="true"]')
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function onClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    isOpen.value = false
    activeIndex.value = -1
  }
}

function formatPrice(price: number | string | null): string {
  if (price === null || price === undefined) return ''
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(num)
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <div ref="wrapperRef" class="relative w-full">
    <form role="search" @submit.prevent="onSubmit" class="relative w-full">
      <Input
        v-model="searchQuery"
        type="text"
        :placeholder="t('search.placeholder')"
        class="h-12 pl-4 pr-14 rounded-full text-[15px] text-gray-900 placeholder-gray-500 w-full bg-gray-50 border-gray-300"
        autocomplete="off"
        @keydown="onKeydown"
        @focus="searchQuery.trim().length >= 2 && results.length > 0 && (isOpen = true)"
      />
      <button
        type="submit"
        class="absolute flex items-center justify-center w-10 h-10 rounded-full right-1 top-1 bg-transparent text-gray-400 hover:text-gray-600"
      >
        <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
        <Search v-else class="w-5 h-5" />
      </button>
    </form>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen && searchQuery.trim().length >= 2"
        ref="dropdownRef"
        class="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-[420px] overflow-y-auto"
      >
        <!-- Loading skeleton -->
        <div v-if="isLoading && results.length === 0" class="p-4 space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3 animate-pulse">
            <div class="w-12 h-12 bg-gray-200 rounded-lg shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-3.5 bg-gray-200 rounded w-3/4" />
              <div class="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        </div>

        <!-- No results -->
        <div v-else-if="!isLoading && results.length === 0" class="px-4 py-6 text-center text-sm text-gray-500">
          {{ t('search.noResults') }}
        </div>

        <!-- Results -->
        <template v-else>
          <button
            v-for="(product, idx) in results"
            :key="product.id"
            :data-active="idx === activeIndex"
            class="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors cursor-pointer"
            :class="{ 'bg-gray-50': idx === activeIndex }"
            @click="selectProduct(product.slug)"
            @mouseenter="activeIndex = idx"
          >
            <img
              :src="product.image || '/images/placeholder-product.svg'"
              :alt="product.name"
              class="w-12 h-12 object-contain rounded-lg bg-gray-100 shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</p>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-orange-600">{{ formatPrice(product.price) }}</span>
                <span v-if="product.originalPrice" class="text-xs text-gray-400 line-through">
                  {{ formatPrice(product.originalPrice) }}
                </span>
              </div>
            </div>
          </button>

          <!-- View all results -->
          <button
            :data-active="activeIndex === results.length"
            class="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-50 border-t border-gray-100 transition-colors cursor-pointer"
            :class="{ 'bg-orange-50': activeIndex === results.length }"
            @click="goToResults"
            @mouseenter="activeIndex = results.length"
          >
            <Search class="w-4 h-4" />
            {{ t('search.viewAll') }}
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>
