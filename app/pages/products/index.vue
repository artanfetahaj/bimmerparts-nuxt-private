<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Product, ProductIncludes, ProductFilterKey } from '@/models/Product'
import type { Product as ProductType } from '@/models/Product'
import { useCarVariantStore } from '@/stores/car-variant.store'
import { RouteName } from '@/enums/RouteName'

// ─── URL query param sync ─────────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()

const currentPage = ref(Number(route.query.page) || 1)

// ─── State ────────────────────────────────────────────────────────────────────
const products = ref<ProductType[]>([])
const isLoading = ref(true)
const isInitialLoad = ref(true)
const apiError = ref<string | null>(null)
const meta = ref({
  current_page: 1,
  last_page: 1,
  per_page: 50,
  total: 0,
  from: 0,
  to: 0,
})

// Simple in-memory cache: key = serialised params → { products, meta }
const cache = new Map<string, { products: ProductType[]; meta: typeof meta.value }>()

const carVariantStore = useCarVariantStore()

const getCacheKey = (page: number) =>
  JSON.stringify({ page, variant: carVariantStore.selectedVariant?.id ?? null })

// ─── Load ─────────────────────────────────────────────────────────────────────
const loadProducts = async (page: number = 1) => {
  const cacheKey = getCacheKey(page)

  // Serve from cache instantly while still showing fresh data
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!
    products.value = cached.products
    meta.value = cached.meta
    currentPage.value = page
    isLoading.value = false
    isInitialLoad.value = false
    // Revalidate in the background
    fetchProducts(page, cacheKey, /* silent */ true)
    return
  }

  isLoading.value = true
  apiError.value = null
  await fetchProducts(page, cacheKey, false)
}

const fetchProducts = async (page: number, cacheKey: string, silent: boolean) => {
  if (!silent) {
    isLoading.value = true
    apiError.value = null
  }

  try {
    const model = new Product()
      .filter({
        car_variants: carVariantStore.selectedVariant?.id ? [carVariantStore.selectedVariant.id] : undefined,
      })
      .include([ProductIncludes.IMAGE, ProductIncludes.BRAND])
      .page(page)
      .limit(50)

    const response = await model.all()

    const newProducts: ProductType[] = Array.isArray(response) ? response : response?.data ?? []
    const newMeta = response?.meta ?? meta.value

    // Update cache
    cache.set(cacheKey, { products: newProducts, meta: newMeta })

    // Only update UI if this is still the page the user is on
    if (page === currentPage.value) {
      products.value = newProducts
      meta.value = newMeta
    }
  } catch (err) {
    if (!silent) {
      console.error('Failed to load products:', err)
      apiError.value = 'Failed to load products. Please try again later.'
    }
  } finally {
    if (!silent) {
      isLoading.value = false
      isInitialLoad.value = false
    }
  }
}

// ─── Prefetch adjacent pages ──────────────────────────────────────────────────
const prefetchAdjacentPages = () => {
  const next = currentPage.value + 1
  const prev = currentPage.value - 1
  if (next <= meta.value.last_page && !cache.has(getCacheKey(next))) {
    fetchProducts(next, getCacheKey(next), true)
  }
  if (prev >= 1 && !cache.has(getCacheKey(prev))) {
    fetchProducts(prev, getCacheKey(prev), true)
  }
}

// ─── Pagination ───────────────────────────────────────────────────────────────
const goToPage = (page: number) => {
  if (page < 1 || page > meta.value.last_page || page === currentPage.value) return
  // Update URL query param without full navigation
  router.replace({ query: { ...route.query, page: page === 1 ? undefined : page } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Sync page state from URL — the single source of truth
watch(() => route.query.page, (val) => {
  const page = Number(val) || 1
  if (page !== currentPage.value) {
    currentPage.value = page
    loadProducts(page)
  }
})

// Re-fetch when selected car variant changes
watch(() => carVariantStore.selectedVariant, () => {
  cache.clear()
  router.replace({ query: { ...route.query, page: undefined } })
  currentPage.value = 1
  loadProducts(1)
})

// Prefetch after data loads
watch(products, () => {
  if (!isLoading.value) prefetchAdjacentPages()
})

onMounted(() => loadProducts(currentPage.value))
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-3 sm:px-6 py-2 sm:py-4">

      <!-- ── Skeleton (initial load only) ── -->
      <div v-if="isLoading && isInitialLoad" class="flex gap-8">
        <aside class="hidden lg:block w-64 shrink-0">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <Skeleton class="h-6 w-24" />
          </div>
        </aside>
        <main class="flex-1">
          <Skeleton class="h-4 w-40 mb-3" />
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            <div v-for="n in 12" :key="n" class="bg-white rounded-lg shadow-sm overflow-hidden">
              <Skeleton class="w-full h-40" />
              <div class="p-3 space-y-2">
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-3/4" />
                <Skeleton class="h-5 w-1/2 mt-3" />
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- ── Content ── -->
      <div v-else class="flex gap-3 lg:gap-8">

        <!-- ── Sidebar ── -->
        <aside class="hidden lg:block w-64 shrink-0 bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 class="text-xl font-bold text-gray-900">Filters</h2>
        </aside>

        <!-- ── Product Grid ── -->
        <main class="flex-1">
          <p class="text-xs text-gray-500 mb-3">
            {{ meta.total }} results
            <span v-if="meta.total > meta.per_page">(showing {{ meta.from }}–{{ meta.to }})</span>
          </p>

          <!-- Error -->
          <div v-if="apiError" class="text-center py-12 text-red-500 text-sm">{{ apiError }}</div>

          <!-- Empty -->
          <div v-else-if="!isLoading && products.length === 0" class="text-center py-16 text-gray-500 text-sm">
            No products found.
          </div>

          <!-- Cards — keep old grid visible while loading next page -->
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 transition-opacity duration-150"
            :class="isLoading && !isInitialLoad ? 'opacity-50 pointer-events-none' : 'opacity-100'"
          >
            <NuxtLink
              v-for="product in products"
              :key="product.id"
              :to="{ name: RouteName.PRODUCT_DETAILS, params: { slug: product.slug } }"
              class="block"
            >
              <ProductCard :product="product" />
            </NuxtLink>
          </div>

          <!-- ── Pagination ── -->
          <div v-if="meta.last_page > 1" class="mt-8">
            <Pagination
              :total="meta.total"
              :items-per-page="meta.per_page"
              :page="currentPage"
              :sibling-count="1"
              show-edges
              @update:page="goToPage"
            >
              <PaginationContent v-slot="{ items }">
                <PaginationFirst />
                <PaginationPrevious />
                <template v-for="item in items" :key="item.type === 'page' ? item.value : `ellipsis-${item.key}`">
                  <PaginationItem
                    v-if="item.type === 'page'"
                    :value="item.value"
                    :is-active="item.value === currentPage"
                  >
                    {{ item.value }}
                  </PaginationItem>
                  <PaginationEllipsis v-else />
                </template>
                <PaginationNext />
                <PaginationLast />
              </PaginationContent>
            </Pagination>
          </div>
        </main>
      </div>

    </div>
  </div>
</template>
