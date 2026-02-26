<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import ProductReviews from '@/components/ProductReviews/ProductReviews.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { useLocale } from '@/stores/locale'
import authService from '@/services/auth'
import productService from '@/services/product'

const { t, currentLocale } = useLocale()
const route = useRoute()
const router = useRouter()

// ─── State ────────────────────────────────────────────────────────────────────
const product = ref<Record<string, any> | null>(null)
const isLoading = ref(true)
const loadError = ref(false)

// Cart & Wishlist
const { addToCart } = useCart()
const { toggleWishlist, items: wishlistItems } = useWishlist()
const isInWishlist = (productId: string) =>
  wishlistItems.value.some(item => String(item.id) === String(productId))

// Auth
const isAuthenticated = ref(authService.isAuthenticated())
const handleAuthChanged = () => { isAuthenticated.value = authService.isAuthenticated() }

// Image gallery
const currentImageIndex = ref(0)

// Tabs
const activeTab = ref('additional-info')
const tabs = computed(() => [
  { id: 'additional-info', label: t('productDetail.description') },
  { id: 'details', label: t('productDetail.specifications') },
  { id: 'ratings', label: t('productDetail.reviews') },
])

// Quantity
const quantity = ref(1)

// Similar products
const similarProducts = ref<any[]>([])
const isLoadingSimilarProducts = ref(false)

// ─── Computed from raw API data ───────────────────────────────────────────────
const productImages = computed<string[]>(() => {
  if (!product.value) return []
  const p = product.value
  const imgs: string[] = []

  // images.all array (morphMany)
  if (p.images?.all && Array.isArray(p.images.all)) {
    imgs.push(
      ...p.images.all
        .map((i: any) => i.original_url || i.thumbnail_url || i.original || '')
        .filter(Boolean),
    )
  }
  // single image relation
  if (imgs.length === 0 && p.image?.original_url) {
    imgs.push(p.image.original_url)
  }
  if (imgs.length === 0 && p.image_url) {
    imgs.push(p.image_url)
  }
  // fallback placeholder
  if (imgs.length === 0) {
    imgs.push('/images/placeholder-product.svg')
  }
  return imgs
})

const currentImage = computed(() => productImages.value[currentImageIndex.value] || '')

const brandName = computed(() => {
  if (!product.value) return ''
  if (typeof product.value.brand === 'object' && product.value.brand?.name) return product.value.brand.name
  if (typeof product.value.brand === 'string') return product.value.brand
  return ''
})

const price = computed(() => {
  if (!product.value) return 0
  const p = product.value
  // If has_discount and discounted_price exists, that's the selling price
  if (p.has_discount && p.discounted_price != null) return parseFloat(p.discounted_price)
  return parseFloat(p.price) || 0
})

const originalPrice = computed(() => {
  if (!product.value) return 0
  return parseFloat(product.value.price) || 0
})

const hasDiscount = computed(() => {
  if (!product.value) return false
  return product.value.has_discount === true && price.value < originalPrice.value
})

const discountPercent = computed(() => {
  if (!hasDiscount.value || !product.value) return 0
  const sale = parseFloat(product.value.sale_percentage)
  if (sale > 0) return Math.round(sale)
  if (originalPrice.value > 0 && price.value < originalPrice.value) {
    return Math.round(((originalPrice.value - price.value) / originalPrice.value) * 100)
  }
  return 0
})

const stockCount = computed(() => {
  if (!product.value) return 0
  const s = product.value.stock
  return typeof s === 'number' ? Math.max(0, s) : 0
})

const isOutOfStock = computed(() => stockCount.value <= 0)
const isLowStock = computed(() => stockCount.value > 0 && stockCount.value < 10)

const stockStatusText = computed(() => {
  if (isOutOfStock.value) return t('product.outOfStock')
  if (isLowStock.value) {
    return currentLocale.value === 'nl'
      ? `Nog ${stockCount.value} op voorraad`
      : `Only ${stockCount.value} left in stock`
  }
  return t('status.inStock')
})

const stockStatusClass = computed(() => {
  if (isOutOfStock.value) return 'bg-red-100 text-red-600'
  if (isLowStock.value) return 'bg-orange-100 text-orange-600'
  return 'bg-orange-100 text-orange-600'
})

const productCode = computed(() => {
  if (!product.value) return ''
  return product.value.sku || product.value.id?.slice(0, 8) || ''
})

const deliveryLabel = computed(() => {
  if (!product.value?.delivery_time) return ''
  const map: Record<string, string> = {
    '1-2-days': '1-2 dagen',
    '2-5-days': '2-5 dagen',
    '5-10-days': '5-10 dagen',
    '1-2-weeks': '1-2 weken',
  }
  return map[product.value.delivery_time] || product.value.delivery_time
})

// ─── Format helpers ───────────────────────────────────────────────────────────
const formatPrice = (val: number) => val.toFixed(2).replace('.', ',')

// ─── Fetch product ────────────────────────────────────────────────────────────
const fetchProduct = async () => {
  const slug = route.params.slug as string
  if (!slug) { loadError.value = true; isLoading.value = false; return }

  isLoading.value = true
  loadError.value = false
  try {
    const res = await productService.getProductBySlug(slug)
    product.value = res?.data || res
  } catch {
    loadError.value = true
  } finally {
    isLoading.value = false
  }
}

// ─── Similar products ─────────────────────────────────────────────────────────
const loadSimilarProducts = async () => {
  if (!product.value) { similarProducts.value = []; return }
  isLoadingSimilarProducts.value = true
  try {
    const p = product.value
    const categoryId = p.category_id || p.category?.id || null
    if (!categoryId) { similarProducts.value = []; return }

    const related = await productService.getRelatedProducts({
      categoryIds: categoryId ? [categoryId] : [],
      excludeIds: [p.id],
      limit: 5,
    })
    console.log("🚀 ~ loadSimilarProducts ~ related:", related)
    similarProducts.value = related
  } catch {
    similarProducts.value = []
  } finally {
    isLoadingSimilarProducts.value = false
  }
}

// ─── Image gallery ────────────────────────────────────────────────────────────
const nextImage = () => {
  if (productImages.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % productImages.value.length
  }
}
const prevImage = () => {
  if (productImages.value.length > 1) {
    currentImageIndex.value = currentImageIndex.value === 0 ? productImages.value.length - 1 : currentImageIndex.value - 1
  }
}
const selectImage = (index: number) => { currentImageIndex.value = index }

// ─── Quantity ─────────────────────────────────────────────────────────────────
const incrementQuantity = () => {
  if (quantity.value < stockCount.value) quantity.value++
}
const decrementQuantity = () => {
  if (quantity.value > 1) quantity.value--
}

// ─── Cart actions ─────────────────────────────────────────────────────────────
const cartItem = computed(() => {
  if (!product.value) return null
  return {
    id: product.value.id,
    title: product.value.name,
    price: price.value,
    oldPrice: hasDiscount.value ? originalPrice.value : price.value,
    image: productImages.value[0],
  }
})

const handleAddToCart = () => {
  if (!cartItem.value || isOutOfStock.value) return
  const qty = Math.min(Math.max(1, quantity.value), stockCount.value)
  quantity.value = qty
  addToCart(cartItem.value, qty)
}

const handleBuyNow = () => {
  if (!cartItem.value || isOutOfStock.value) return
  const qty = Math.min(Math.max(1, quantity.value), stockCount.value)
  quantity.value = qty
  addToCart(cartItem.value, qty)
  router.push('/cart')
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
const handleToggleWishlist = async (e?: Event) => {
  e?.stopPropagation()
  e?.preventDefault()
  if (!product.value) return
  try {
    await toggleWishlist(product.value.id, {
      id: product.value.id,
      title: product.value.name,
      price: price.value,
      image: productImages.value[0],
    })
  } catch (error) {
    console.error('Failed to toggle wishlist:', error)
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener('auth-changed', handleAuthChanged as EventListener)
  window.addEventListener('storage', handleAuthChanged as EventListener)
  fetchProduct()
})

onBeforeUnmount(() => {
  window.removeEventListener('auth-changed', handleAuthChanged as EventListener)
  window.removeEventListener('storage', handleAuthChanged as EventListener)
})

// When product loads, fetch similar products and reset UI
watch(product, (p) => {
  if (p) {
    currentImageIndex.value = 0
    quantity.value = 1
    loadSimilarProducts()
  }
})

// If slug changes (navigating between products), re-fetch
watch(() => route.params.slug, (newSlug) => {
  if (newSlug) fetchProduct()
})
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- ── Loading Skeleton ── -->
    <div v-if="isLoading" class="container mx-auto px-3 sm:px-6 py-8">
      <!-- Breadcrumb skeleton -->
      <div class="mb-6 flex gap-2">
        <Skeleton class="h-4 w-12" />
        <Skeleton class="h-4 w-16" />
        <Skeleton class="h-4 w-40" />
      </div>
      <div class="border border-gray-200 rounded-lg p-3 sm:p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Image skeleton -->
          <div class="flex space-x-4">
            <div class="flex flex-col space-y-2">
              <Skeleton class="w-20 h-20 rounded-lg" />
              <Skeleton class="w-20 h-20 rounded-lg" />
              <Skeleton class="w-20 h-20 rounded-lg" />
            </div>
            <Skeleton class="flex-1 aspect-square rounded-lg" />
          </div>
          <!-- Info skeleton -->
          <div class="space-y-4">
            <Skeleton class="h-5 w-16" />
            <Skeleton class="h-8 w-3/4" />
            <Skeleton class="h-4 w-1/2" />
            <Skeleton class="h-10 w-32 mt-4" />
            <Skeleton class="h-4 w-48" />
            <Skeleton class="h-12 w-full mt-4" />
            <Skeleton class="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Error / Not Found ── -->
    <div v-else-if="loadError || !product" class="container mx-auto px-6 py-8 text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ t('productDetail.productNotFound') }}</h1>
      <p class="text-gray-600 mb-6">{{ t('productDetail.productNotFoundDesc') }}</p>
      <NuxtLink to="/products" class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
        {{ t('common.backToProducts') }}
      </NuxtLink>
    </div>

    <!-- ── Product Content ── -->
    <div v-else class="container mx-auto px-3 sm:px-6 py-8">

      <!-- Breadcrumb -->
      <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm text-gray-600">
          <li><NuxtLink to="/" class="hover:text-orange-500">{{ t('common.home') }}</NuxtLink></li>
          <li class="text-gray-400">/</li>
          <li><NuxtLink to="/products" class="hover:text-orange-500">{{ t('common.products') }}</NuxtLink></li>
          <li class="text-gray-400">/</li>
          <li class="text-gray-900 truncate max-w-xs">{{ product.name }}</li>
        </ol>
      </nav>

      <!-- ════════════════════════════════════════════════════════════════════════
           Product Details Card
           ════════════════════════════════════════════════════════════════════════ -->
      <div class="border border-gray-200 rounded-lg p-3 sm:p-6 mb-16 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 min-w-0">

          <!-- ── Image Gallery ── -->
          <div class="flex space-x-4">
            <!-- Thumbnails -->
            <div class="flex flex-col items-center space-y-2">
              <button
                v-if="productImages.length > 1"
                @click="prevImage"
                class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 text-gray-600">
                  <path fill-rule="evenodd" d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z" clip-rule="evenodd"/>
                </svg>
              </button>
              <div class="flex flex-col space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
                <button
                  v-for="(img, index) in productImages"
                  :key="index"
                  @click="selectImage(index)"
                  class="w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0"
                  :class="currentImageIndex === index ? 'border-orange-500' : 'border-gray-200 hover:border-gray-300'"
                >
                  <img :src="img" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-contain p-2" />
                </button>
              </div>
              <button
                v-if="productImages.length > 1"
                @click="nextImage"
                class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 text-gray-600">
                  <path fill-rule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>

            <!-- Main Image -->
            <div class="relative aspect-square bg-gray-50 rounded-lg overflow-hidden flex-1">
              <img :src="currentImage" :alt="product.name" class="w-full h-full object-contain p-4 sm:p-6 md:p-8" />
            </div>
          </div>

          <!-- ── Product Info ── -->
          <div class="space-y-6 min-w-0">

            <!-- Brand + Title + Meta -->
            <div class="min-w-0">
              <span class="text-lg font-normal text-gray-900 break-words">{{ brandName }}</span>
              <h1 class="text-2xl font-bold text-gray-900 -mt-2 mb-0 break-words">{{ product.name }}</h1>
              <div class="flex flex-col sm:flex-row sm:items-center mb-4 space-y-1 sm:space-y-0 min-w-0">
                <div class="flex flex-col min-[375px]:flex-row min-[375px]:items-center min-w-0 flex-wrap">
                  <span class="text-sm text-gray-900 underline break-words">{{ t('productDetail.reviews') }}</span>
                  <span class="text-sm text-gray-900 mx-1 hidden min-[375px]:inline">&bull;</span>
                  <span class="text-sm text-gray-900 hidden min-[375px]:inline break-words">{{ t('productDetail.brandOrigin') }}</span>
                  <img src="/images/Margin.png" alt="Flag" class="h-4 mx-1 hidden min-[375px]:inline flex-shrink-0" />
                </div>
                <div class="flex items-center min-[375px]:hidden min-w-0">
                  <span class="text-sm text-gray-900 break-words">{{ t('productDetail.brandOrigin') }}</span>
                  <img src="/images/Margin.png" alt="Flag" class="h-4 mx-1 flex-shrink-0" />
                </div>
                <div class="flex items-center min-w-0">
                  <span class="text-sm text-gray-900 mx-1 sm:mx-1 flex-shrink-0">&bull;</span>
                  <span class="text-sm text-gray-900 font-bold underline ml-2 sm:ml-0 break-words">{{ t('productDetail.code') }}: #{{ productCode }}</span>
                </div>
              </div>
            </div>

            <!-- Price -->
            <div class="space-y-2 min-w-0">
              <div v-if="hasDiscount" class="text-lg text-gray-500 line-through">{{ formatPrice(originalPrice) }}&euro;</div>
              <div class="flex items-baseline space-x-3 flex-wrap min-w-0">
                <span class="text-2xl font-bold text-gray-900">&euro;{{ formatPrice(price) }}</span>
                <span class="text-sm text-gray-600">{{ t('price.taxIncluded') }}</span>
              </div>
              <p v-if="hasDiscount" class="text-orange-500 flex flex-wrap items-center gap-2">
                <span>{{ t('price.youPay') }} {{ formatPrice(price) }} &euro;</span>
                <span class="border border-orange-300 rounded-lg px-2 py-1 bg-orange-50 whitespace-nowrap">-{{ discountPercent }}%</span>
              </p>
            </div>

            <!-- Quantity & Stock -->
            <div class="space-y-2 min-w-0">
              <div class="flex items-center min-w-0">
                <p class="text-sm text-gray-600 flex-shrink-0">{{ t('productDetail.quantity') }}</p>
                <div class="flex-1 border-t border-gray-200 ml-4 min-w-0"></div>
              </div>
              <div class="flex items-center space-x-4 min-w-0">
                <div
                  class="flex items-center border border-gray-300 rounded-lg flex-shrink-0"
                  :class="isOutOfStock ? 'opacity-50' : ''"
                >
                  <button @click="decrementQuantity" :disabled="isOutOfStock" class="px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-transparent">&minus;</button>
                  <input
                    v-model="quantity" type="number" min="1" :max="stockCount"
                    :disabled="isOutOfStock"
                    class="w-16 text-center border-0 focus:outline-none disabled:cursor-not-allowed"
                  />
                  <button @click="incrementQuantity" :disabled="isOutOfStock || quantity >= stockCount" class="px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-transparent">+</button>
                </div>
                <span class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0" :class="stockStatusClass">
                  {{ stockStatusText }}
                </span>
              </div>
            </div>

            <!-- Payment Options -->
            <div class="space-y-3 min-w-0 -mx-2 sm:-mx-4">
              <div class="flex items-center min-w-0 px-2 sm:px-4">
                <p class="text-sm text-gray-600 flex-shrink-0">{{ t('checkout.paymentMethod') }}:</p>
                <div class="flex-1 border-t border-gray-200 ml-4 min-w-0"></div>
              </div>
              <div :class="[
                'flex items-center flex-wrap min-w-0 gap-2 px-2 sm:px-4',
                currentLocale === 'en'
                  ? 'space-x-8 min-[375px]:space-x-10 min-[425px]:space-x-12 md:space-x-20 lg:space-x-16 xl:space-x-20'
                  : 'space-x-6 min-[375px]:space-x-8 min-[425px]:space-x-10 md:space-x-16 lg:space-x-14 xl:space-x-16'
              ]">
                <div class="flex items-center space-x-2 flex-shrink-0">
                  <div class="w-8 h-8 min-[375px]:w-10 min-[375px]:h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src="/images/contant.svg" alt="Cash" class="h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 flex-shrink-0" />
                  </div>
                  <span class="text-xs sm:text-sm text-gray-900 whitespace-nowrap">{{ t('productDetail.payCash') }}</span>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                  <div class="w-8 h-8 min-[375px]:w-10 min-[375px]:h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src="/images/Card.svg" alt="Card" class="h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 flex-shrink-0" />
                  </div>
                  <span class="text-xs sm:text-sm text-gray-900 whitespace-nowrap">{{ t('productDetail.payOnline') }}</span>
                </div>
                <div class="flex items-center space-x-2 flex-shrink-0">
                  <div class="w-8 h-8 min-[375px]:w-10 min-[375px]:h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src="/images/Bank.svg" alt="Bank" class="h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 flex-shrink-0" />
                  </div>
                  <span class="text-xs sm:text-sm text-gray-900 whitespace-nowrap">{{ t('productDetail.payBankTransfer') }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2 sm:gap-4">
              <button
                @click="handleBuyNow"
                :disabled="isOutOfStock"
                class="flex-1 min-w-0 bg-orange-500 text-white py-3 px-3 sm:px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              >
                <img src="/images/shopping-bag.svg" alt="Shopping bag" class="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span class="text-xs sm:text-base whitespace-nowrap">{{ t('button.buyNow') }}</span>
              </button>
              <button
                @click="handleAddToCart"
                :disabled="isOutOfStock"
                class="px-3 sm:px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-1 sm:space-x-2 flex-shrink-0 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:border-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 flex-shrink-0">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <span class="text-xs sm:text-base whitespace-nowrap hidden min-[375px]:inline">{{ t('productDetail.addToCart') }}</span>
              </button>
              <!-- Wishlist -->
              <button
                @click="handleToggleWishlist($event)"
                type="button"
                class="px-3 sm:px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-1 sm:space-x-2 flex-shrink-0 cursor-pointer"
                :class="isInWishlist(product.id) ? 'border-orange-500 bg-orange-50 text-orange-600' : 'hover:border-orange-300'"
                :title="isInWishlist(product.id) ? t('productDetail.removeFromWishlist') : t('productDetail.addToWishlist')"
              >
                <svg v-if="!isInWishlist(product.id)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 flex-shrink-0">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 flex-shrink-0">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span class="text-xs sm:text-base whitespace-nowrap hidden min-[375px]:inline">
                  {{ isInWishlist(product.id) ? t('productDetail.inWishlist') : t('productDetail.addToWishlist') }}
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════════════
           Product Tabs
           ════════════════════════════════════════════════════════════════════════ -->
      <div class="border border-gray-200 rounded-lg p-3 sm:p-6 mb-16 overflow-hidden">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 overflow-x-auto">
          <nav class="flex space-x-4 sm:space-x-8 min-w-0">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="py-4 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
              :class="activeTab === tab.id
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-600 hover:text-gray-900'"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="py-4 sm:py-8 min-w-0">
          <!-- Additional Information (HTML description) -->
          <div v-if="activeTab === 'additional-info'" class="prose max-w-none min-w-0">
            <div
              v-if="product.description"
              class="text-gray-700 leading-relaxed break-words"
              v-html="product.description"
            />
            <p v-else class="text-gray-500 italic">{{ t('productDetail.noDescription') || 'No description available.' }}</p>
          </div>

          <!-- Details / Specifications -->
          <div v-if="activeTab === 'details'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              <div v-if="product.sku" class="flex justify-between py-2 border-b border-gray-100 gap-2">
                <span class="font-medium text-gray-600">SKU:</span>
                <span class="text-gray-900 text-right">{{ product.sku }}</span>
              </div>
              <div v-if="brandName" class="flex justify-between py-2 border-b border-gray-100 gap-2">
                <span class="font-medium text-gray-600">{{ t('productDetail.brand') || 'Brand' }}:</span>
                <span class="text-gray-900 text-right">{{ brandName }}</span>
              </div>
              <div v-if="product.weight" class="flex justify-between py-2 border-b border-gray-100 gap-2">
                <span class="font-medium text-gray-600">{{ t('productDetail.weight') || 'Weight' }}:</span>
                <span class="text-gray-900 text-right">{{ product.weight }} kg</span>
              </div>
              <div v-if="product.packaging" class="flex justify-between py-2 border-b border-gray-100 gap-2">
                <span class="font-medium text-gray-600">{{ t('productDetail.packaging') || 'Packaging' }}:</span>
                <span class="text-gray-900 text-right">{{ product.packaging }}</span>
              </div>
              <div v-if="product.sold_unit" class="flex justify-between py-2 border-b border-gray-100 gap-2">
                <span class="font-medium text-gray-600">{{ t('productDetail.soldUnit') || 'Unit' }}:</span>
                <span class="text-gray-900 text-right">{{ product.sold_unit }}</span>
              </div>
              <div v-if="deliveryLabel" class="flex justify-between py-2 border-b border-gray-100 gap-2">
                <span class="font-medium text-gray-600">{{ t('productDetail.deliveryTime') || 'Delivery' }}:</span>
                <span class="text-gray-900 text-right">{{ deliveryLabel }}</span>
              </div>
              <div v-if="product.vat_percentage" class="flex justify-between py-2 border-b border-gray-100 gap-2">
                <span class="font-medium text-gray-600">{{ t('productDetail.vat') || 'VAT' }}:</span>
                <span class="text-gray-900 text-right">{{ product.vat_percentage }}%</span>
              </div>
              <div v-if="product.category?.name" class="flex justify-between py-2 border-b border-gray-100 gap-2">
                <span class="font-medium text-gray-600">{{ t('productDetail.category') || 'Category' }}:</span>
                <span class="text-gray-900 text-right">{{ product.category.name }}</span>
              </div>
              <div v-if="product.subcategory?.name" class="flex justify-between py-2 border-b border-gray-100 gap-2">
                <span class="font-medium text-gray-600">{{ t('productDetail.subcategory') || 'Subcategory' }}:</span>
                <span class="text-gray-900 text-right">{{ product.subcategory.name }}</span>
              </div>
            </div>
            <div
              v-if="!product.sku && !brandName && !product.weight && !product.packaging && !product.sold_unit && !deliveryLabel"
              class="text-gray-500 italic"
            >
              {{ t('productDetail.noDetails') || 'No details available.' }}
            </div>
          </div>

          <!-- Ratings -->
          <div v-if="activeTab === 'ratings'">
            <ProductReviews :product-id="parseInt(product.id)" />
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════════════════════════════════════
           Similar Products
           ════════════════════════════════════════════════════════════════════════ -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">{{ t('productDetail.relatedProducts') }}</h2>
        <div v-if="isLoadingSimilarProducts" class="text-center py-8">
          <p class="text-gray-600">{{ t('products.loading') }}</p>
        </div>
        <div v-else-if="similarProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <NuxtLink
            v-for="sp in similarProducts"
            :key="sp.id"
            :to="`/products/${sp.slug || sp.id}`"
            class="block"
          >
            <ProductCard :product="sp" />
          </NuxtLink>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-600">{{ t('productDetail.noRelatedProducts') || 'Geen gerelateerde producten gevonden' }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.prose {
  color: #374151;
  line-height: 1.7;
}

.prose :deep(p) {
  margin-bottom: 1rem;
}

.prose :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose :deep(li) {
  margin-bottom: 0.25rem;
}

.prose :deep(strong) {
  font-weight: 600;
}

.prose :deep(a) {
  color: #f97316;
  text-decoration: underline;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
