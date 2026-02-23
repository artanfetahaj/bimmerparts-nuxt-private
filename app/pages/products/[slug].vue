<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import ProductCard from '@/components/ProductCard.vue'
import ProductReviews from '@/components/ProductReviews/ProductReviews.vue'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { useLocale } from '@/stores/locale'
import authService from '@/services/auth'
import productService from '@/services/product'
import type { Product as ApiProduct } from '@/services/product'

// Locale handling
const { t, currentLocale } = useLocale()

// Define props
const props = defineProps<{
  product: {
    id: string
    title: string
    price: number
    oldPrice?: number
    discountPercent?: number
    image: string
    images?: string[] // Array of product images from API
    badge?: string
    stock?: number
    lowStock?: boolean
    outOfStock?: boolean
    description?: string
    brand?: string
    category?: string
  } | null
  // Optional context from navigation: selected BMW series / model
  selectedSeries?: string | null
  selectedModelId?: number | null
}>()

const router = useRouter()

// Cart functionality
const { addToCart } = useCart()

// Wishlist functionality
const { toggleWishlist, items: wishlistItems } = useWishlist()
const isInWishlist = (productId: string) => {
  // Check local state first (synchronous)
  // Ensure both IDs are compared as strings for consistency
  const normalizedProductId = String(productId)
  return wishlistItems.value.some(item => String(item.id) === normalizedProductId)
}

// Authentication state
const isAuthenticated = ref(authService.isAuthenticated())

const handleNavigateToProduct = (productId: string) => {
  router.push(`/products/${productId}`)
}

// Enhanced product data with additional details
const enhancedProduct = computed(() => {
  if (!props.product) return null
  
  // Generate additional product details based on the product
  const price = props.product.price
  let oldPrice = props.product.oldPrice
  let discountPercent = props.product.discountPercent

  if (oldPrice !== undefined && oldPrice <= price) {
    oldPrice = undefined
  }

  if ((discountPercent === undefined || discountPercent <= 0) && oldPrice) {
    discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100)
  }

  if ((oldPrice === undefined || oldPrice <= price) && discountPercent && discountPercent > 0 && discountPercent < 100) {
    oldPrice = parseFloat((price / (1 - discountPercent / 100)).toFixed(2))
  }

  const hasDiscount = !!(oldPrice && oldPrice > price && discountPercent && discountPercent > 0)
  const finalOldPrice = hasDiscount ? oldPrice! : price
  const finalDiscountPercent = hasDiscount ? discountPercent! : 0
  const savingsAmount = hasDiscount ? parseFloat((finalOldPrice - price).toFixed(2)) : 0

  const rawStock = props.product.stock
  const normalizedStock =
    typeof rawStock === 'number' && Number.isFinite(rawStock) ? Math.max(0, Math.floor(rawStock)) : 0
  const lowStock = props.product.lowStock ?? (normalizedStock > 0 && normalizedStock < 10)
  const outOfStock = props.product.outOfStock ?? normalizedStock === 0

  const productDetails = {
    id: props.product.id,
    title: props.product.title,
    code: (() => {
      // Get product-specific codes based on product ID
      const productCodes = {
        'p1': 'SPR001',
        'p2': 'RLN002', 
        'p3': 'ALU003',
        'p4': 'GRI004',
        'p5': 'BLK005',
        'p6': 'GRI006',
        'p7': 'ALU007',
        'p8': 'RLN008',
        'p9': 'BLK009',
        'p10': 'SPR010',
        'p11': 'BLK011',
        'p12': 'ALU012',
        'p13': 'SPR013',
        'p14': 'RLN014',
        'p15': 'GRI015'
      }
      
      // Return specific code for the product, or default if not found
      return productCodes[props.product.id as keyof typeof productCodes] || `BMW${props.product.id.toUpperCase()}`
    })(),
    price,
    oldPrice: finalOldPrice,
    hasDiscount,
    discountPercent: finalDiscountPercent,
    savings: savingsAmount,
    images: (() => {
      // Use images from API if available, otherwise fallback to hardcoded images
      if (props.product.images && Array.isArray(props.product.images) && props.product.images.length > 0) {
        return props.product.images
      }
      
      // Fallback to hardcoded images for backward compatibility
      const productImages = {
        'p1': ['/images/sparco.png', '/images/sparco2.png', '/images/sparco3.png'],
        'p2': ['/images/redline schroefset.png'],
        'p3': ['/images/Alu1.png', '/images/Alu2.png', '/images/Alu3.png'],
        'p4': ['/images/Glazend zwarte grillen met.png', '/images/glazend2.png', '/images/glazend3.png'],
        'p5': ['/images/Blackline achterlichten BMW 3 serie.png'],
        'p6': ['/images/Glazend zwarte grillen met.png', '/images/glazend2.png', '/images/glazend3.png'],
        'p7': ['/images/Alu1.png', '/images/Alu2.png', '/images/Alu3.png'],
        'p8': ['/images/redline schroefset.png'],
        'p9': ['/images/Blackline achterlichten BMW 3 serie.png'],
        'p10': ['/images/sparco.png', '/images/sparco2.png', '/images/sparco3.png'],
        'p11': ['/images/Blackline achterlichten BMW 3 serie.png'],
        'p12': ['/images/Alu1.png', '/images/Alu2.png', '/images/Alu3.png'],
        'p13': ['/images/sparco.png', '/images/sparco2.png', '/images/sparco3.png'],
        'p14': ['/images/redline schroefset.png'],
        'p15': ['/images/Glazend zwarte grillen met.png', '/images/glazend2.png', '/images/glazend3.png']
      }
      
      // Return specific images for the product, or default image if not found
      return productImages[props.product.id as keyof typeof productImages] || [
        props.product.image
      ]
    })(),
    rating: 4.5,
    reviews: Math.floor(Math.random() * 200) + 50,
    inStock: !outOfStock,
    stock: normalizedStock,
    lowStock,
    outOfStock,
    brand: props.product.brand || fullProductData.value?.brand || 'BMW',
    category: props.product.category || fullProductData.value?.category?.name || 'Performance Parts',
    group: 'Accessories',
    // Use description from API, fallback to empty string if not available
    description: fullProductData.value?.description || props.product.description || '',
    // Remove hardcoded features - can be added later if API provides them
    features: [],
    // Remove hardcoded specifications - can be added later if API provides them
    specifications: {},
    // Use description from API as additionalInfo
    additionalInfo: fullProductData.value?.description || props.product.description || ''
  }
  
  return productDetails
})

const stockStatusText = computed(() => {
  if (!enhancedProduct.value) return ''

  const stock = enhancedProduct.value.stock ?? 0
  if (stock <= 0) {
    return t('product.outOfStock')
  }
  if (stock < 10) {
    return currentLocale.value === 'nl'
      ? `Nog ${stock} op voorraad`
      : `Only ${stock} left in stock`
  }
  return t('status.inStock')
})

const stockStatusClass = computed(() => {
  if (!enhancedProduct.value) return 'bg-gray-100 text-gray-600'

  const stock = enhancedProduct.value.stock ?? 0
  if (stock <= 0) {
    return 'bg-red-100 text-red-600'
  }
  if (stock < 10) {
    return 'bg-orange-100 text-orange-600'
  }
  return 'bg-orange-100 text-orange-600'
})

// Image gallery state
const currentImageIndex = ref(0)

// Product tabs
const activeTab = ref('additional-info')

const tabs = computed(() => [
  { id: 'additional-info', label: t('productDetail.description') },
  { id: 'details', label: t('productDetail.specifications') },
  { id: 'ratings', label: t('productDetail.reviews') }
])

// Quantity selector
const quantity = ref(1)

// Similar products - load from API, excluding current product
const similarProducts = ref<any[]>([])
const isLoadingSimilarProducts = ref(false)
let loadSimilarProductsCallId = 0

// Full product data from API (includes description)
const fullProductData = ref<ApiProduct | null>(null)
const isLoadingFullProduct = ref(false)

// Load similar products from API based on category or compatible models
const loadSimilarProducts = async () => {
  if (!props.product) {
    similarProducts.value = []
    return
  }
  
  // Prevent multiple simultaneous calls - use a call ID to track the latest call
  const currentCallId = ++loadSimilarProductsCallId
  if (isLoadingSimilarProducts.value) {
    // Wait a bit and check if this is still the latest call
    await new Promise(resolve => setTimeout(resolve, 100))
    if (currentCallId !== loadSimilarProductsCallId) {
      // A newer call has been made, skip this one
      return
    }
  }
  
  isLoadingSimilarProducts.value = true
  try {
    // Fetch the latest product data to access category and compatibility info
    const currentProductResponse = await productService.getProduct(props.product.id)
    const currentProductData = currentProductResponse?.data || currentProductResponse
    
    if (!currentProductData) {
      console.warn('No product data found for related products')
      similarProducts.value = []
      return
    }
    
    const categoryId = currentProductData.category_id || currentProductData.category?.id || null
    const hauptgruppe = currentProductData.bmw_hauptgruppe || null

    // Debug: Log what we received from API
    console.log('🔍 Full currentProductData:', currentProductData)
    console.log('🔍 compatible_models:', currentProductData?.compatible_models)
    console.log('🔍 Type of compatible_models:', typeof currentProductData?.compatible_models)

    // Determine active model IDs for related products
    // 1) If navigation provided a specific model (from BMW model selector), use ONLY that
    // 2) Otherwise fall back to product's compatible_models.model_ids from CMS
    const navigationModelId =
      props.selectedModelId !== null && props.selectedModelId !== undefined
        ? Number(props.selectedModelId)
        : null

    let modelIds: number[] = []
    let modelCodes: string[] = []

    if (navigationModelId && Number.isFinite(navigationModelId)) {
      modelIds = [navigationModelId]
      console.log('✅ Using navigation model ID:', navigationModelId)
    } else {
      // Try to extract model_ids from compatible_models
      const compatibleModels = currentProductData?.compatible_models
      
      // Handle different possible structures
      if (compatibleModels) {
        // If it's already an object with model_ids
        if (typeof compatibleModels === 'object' && !Array.isArray(compatibleModels)) {
          if (Array.isArray(compatibleModels.model_ids)) {
            modelIds = compatibleModels.model_ids
              .map((id: any) => Number(id))
              .filter((id: number) => Number.isFinite(id))
          }
          if (Array.isArray(compatibleModels.codes)) {
            modelCodes = compatibleModels.codes
              .map((code: any) => (typeof code === 'string' ? code.trim().toUpperCase() : ''))
              .filter((code: string) => code !== '')
          }
        }
        // If it's a string, try to parse it as JSON
        else if (typeof compatibleModels === 'string') {
          try {
            const parsed = JSON.parse(compatibleModels)
            if (parsed && typeof parsed === 'object') {
              if (Array.isArray(parsed.model_ids)) {
                modelIds = parsed.model_ids
                  .map((id: any) => Number(id))
                  .filter((id: number) => Number.isFinite(id))
              }
              if (Array.isArray(parsed.codes)) {
                modelCodes = parsed.codes
                  .map((code: any) => (typeof code === 'string' ? code.trim().toUpperCase() : ''))
                  .filter((code: string) => code !== '')
              }
            }
          } catch (e) {
            console.warn('⚠️ Failed to parse compatible_models as JSON:', e)
          }
        }
      }
      
      console.log('✅ Extracted modelIds:', modelIds)
      console.log('✅ Extracted modelCodes:', modelCodes)
    }

    // Determine BMW series from navigation context (only used when no specific model is selected)
    const seriesFromNavigation =
      !navigationModelId && typeof props.selectedSeries === 'string' && props.selectedSeries.trim() !== ''
        ? props.selectedSeries.trim()
        : null
    
    if (!categoryId && modelIds.length === 0 && modelCodes.length === 0 && !seriesFromNavigation && !hauptgruppe) {
      similarProducts.value = []
      return
    }
    
    console.log('Loading related products with:', {
      categoryId,
      modelIds,
      modelCodes,
      hauptgruppe,
      series: seriesFromNavigation,
      excludeId: props.product.id
    })
    
    const relatedProducts = await productService.getRelatedProducts({
      categoryIds: categoryId ? [categoryId] : [],
      modelIds,
      modelCodes,
      hauptgruppen: hauptgruppe ? [hauptgruppe] : [],
      series: seriesFromNavigation ? [seriesFromNavigation] : [],
      excludeIds: [props.product.id],
      limit: 5
    })
    
    // Only update if this is still the latest call
    if (currentCallId === loadSimilarProductsCallId) {
      console.log('Related products found:', relatedProducts.map(p => ({ id: p.id, title: p.title })))
      similarProducts.value = relatedProducts
    }
  } catch (error) {
    // Only update if this is still the latest call
    if (currentCallId === loadSimilarProductsCallId) {
      console.error('Failed to load similar products:', error)
      similarProducts.value = []
    }
  } finally {
    // Only reset loading state if this is still the latest call
    if (currentCallId === loadSimilarProductsCallId) {
      isLoadingSimilarProducts.value = false
    }
  }
}

// Methods
const nextImage = () => {
  if (enhancedProduct.value) {
    currentImageIndex.value = (currentImageIndex.value + 1) % enhancedProduct.value.images.length
  }
}

const prevImage = () => {
  if (enhancedProduct.value) {
    currentImageIndex.value = currentImageIndex.value === 0 ? enhancedProduct.value.images.length - 1 : currentImageIndex.value - 1
  }
}

const selectImage = (index: number) => {
  currentImageIndex.value = index
}


const incrementQuantity = () => {
  if (enhancedProduct.value) {
    const stock = enhancedProduct.value.stock ?? 0
    if (quantity.value < stock) {
      quantity.value++
    }
  } else {
    quantity.value++
  }
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleAddToCart = () => {
  if (enhancedProduct.value) {
    // Check if product is in stock
    const stock = enhancedProduct.value.stock ?? 0
    if (stock <= 0) {
      return // Don't add to cart if out of stock
    }

    // Clamp quantity so it never exceeds stock
    const safeQuantity = Math.min(Math.max(1, quantity.value), stock)
    quantity.value = safeQuantity

    addToCart({
      id: enhancedProduct.value.id,
      title: enhancedProduct.value.title,
      price: enhancedProduct.value.price,
      oldPrice: enhancedProduct.value.hasDiscount ? enhancedProduct.value.oldPrice : enhancedProduct.value.price,
      image: enhancedProduct.value.images[0]
    }, safeQuantity)
  }
}

const handleBuyNow = () => {
  if (enhancedProduct.value) {
    // Check if product is in stock
    const stock = enhancedProduct.value.stock ?? 0
    if (stock <= 0) {
      return // Don't add to cart if out of stock
    }

    // Clamp quantity so it never exceeds stock
    const safeQuantity = Math.min(Math.max(1, quantity.value), stock)
    quantity.value = safeQuantity

    // Add to cart first
    addToCart({
      id: enhancedProduct.value.id,
      title: enhancedProduct.value.title,
      price: enhancedProduct.value.price,
      oldPrice: enhancedProduct.value.hasDiscount ? enhancedProduct.value.oldPrice : enhancedProduct.value.price,
      image: enhancedProduct.value.images[0]
    }, safeQuantity)

    // Navigate to cart
    router.push('/cart')
  }
}

const handleToggleWishlist = async (e?: Event) => {
  if (e) {
    e.stopPropagation()
    e.preventDefault()
  }
  if (enhancedProduct.value) {
    try {
      await toggleWishlist(enhancedProduct.value.id, {
        id: enhancedProduct.value.id,
        title: enhancedProduct.value.title,
        price: enhancedProduct.value.price,
        image: enhancedProduct.value.images[0]
      })
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    }
  }
}

// Listen for auth changes
const handleAuthChanged = () => {
  isAuthenticated.value = authService.isAuthenticated()
}

// Load full product data from API to get description
const loadFullProductData = async () => {
  if (!props.product?.id) {
    fullProductData.value = null
    return
  }
  
  isLoadingFullProduct.value = true
  try {
    const response = await productService.getProduct(props.product.id)
    if (response && response.data) {
      fullProductData.value = response.data
    }
  } catch (error) {
    console.error('Failed to load full product data:', error)
    fullProductData.value = null
  } finally {
    isLoadingFullProduct.value = false
  }
}

// Watch for product changes and reload similar products + full product data
let lastWatchedProductId: string | null = null
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    // Only reload if the product ID actually changed
    const productId = newProduct.id
    if (productId !== lastWatchedProductId) {
      lastWatchedProductId = productId
      loadSimilarProducts()
      loadFullProductData()
    }
  } else {
    lastWatchedProductId = null
    similarProducts.value = []
    fullProductData.value = null
  }
}, { immediate: true })

onMounted(() => {
  window.addEventListener('auth-changed', handleAuthChanged as EventListener)
  window.addEventListener('storage', handleAuthChanged as EventListener)
  // Note: loadSimilarProducts and loadFullProductData are already called by the watcher with immediate: true
})

onBeforeUnmount(() => {
  window.removeEventListener('auth-changed', handleAuthChanged as EventListener)
  window.removeEventListener('storage', handleAuthChanged as EventListener)
})

// Computed
const currentImage = computed(() => enhancedProduct.value?.images[currentImageIndex.value] || '')
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Main Content -->
    <div v-if="enhancedProduct" class="container mx-auto px-3 sm:px-6 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm text-gray-600">
          <li><NuxtLink to="/" class="hover:text-orange-500">{{ t('common.home') }}</NuxtLink></li>
          <li class="text-gray-400">/</li>
          <li><NuxtLink to="/products" class="hover:text-orange-500">{{ t('common.products') }}</NuxtLink></li>
          <li class="text-gray-400">/</li>
          <li class="text-gray-900">{{ enhancedProduct.title }}</li>
        </ol>
      </nav>

      <!-- Product Details -->
      <div class="border border-gray-200 rounded-lg p-3 sm:p-6 mb-16 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 min-w-0">
          <!-- Product Images -->
          <div class="flex space-x-4">
          <!-- Thumbnail Navigation -->
          <div class="flex flex-col items-center space-y-2">
            <!-- Up Arrow -->
            <button 
              v-if="enhancedProduct.images.length > 1"
              @click="prevImage"
              class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 text-gray-600">
                <path fill-rule="evenodd" d="M11.47 7.72a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06L12 9.31l-6.97 6.97a.75.75 0 01-1.06-1.06l7.5-7.5z" clip-rule="evenodd"/>
              </svg>
            </button>
            
            <!-- Thumbnails -->
            <div class="flex flex-col space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
              <button 
                v-for="(image, index) in enhancedProduct.images" 
                :key="index"
                @click="selectImage(index)"
                class="w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0"
                :class="currentImageIndex === index ? 'border-orange-500' : 'border-gray-200 hover:border-gray-300'"
              >
                <img :src="image" :alt="`${enhancedProduct.title} ${index + 1}`" class="w-full h-full object-contain p-2" />
              </button>
            </div>
            
            <!-- Down Arrow -->
            <button 
              v-if="enhancedProduct.images.length > 1"
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
            <img :src="currentImage" :alt="enhancedProduct.title" class="w-full h-full object-contain p-4 sm:p-6 md:p-8" />
          </div>
          </div>

          <!-- Product Info -->
          <div class="space-y-6 min-w-0">
          <!-- Title -->
          <div class="min-w-0">
            <span class="text-lg font-normal text-gray-900 break-words">{{ enhancedProduct.brand }}</span>
            <h1 class="text-2xl font-bold text-gray-900 -mt-2 mb-0 break-words">{{ enhancedProduct.title }}</h1>
            <div class="flex flex-col sm:flex-row sm:items-center mb-4 space-y-1 sm:space-y-0 min-w-0">
              <div class="flex flex-col min-[375px]:flex-row min-[375px]:items-center min-w-0 flex-wrap">
                <span class="text-sm text-gray-900 underline break-words">{{ t('productDetail.reviews') }}</span>
                <span class="text-sm text-gray-900 mx-1 hidden min-[375px]:inline">•</span>
                <span class="text-sm text-gray-900 hidden min-[375px]:inline break-words">{{ t('productDetail.brandOrigin') }}</span>
                <img src="/images/Margin.png" alt="Flag" class="h-4 mx-1 hidden min-[375px]:inline flex-shrink-0" />
              </div>
              <div class="flex items-center min-[375px]:hidden min-w-0">
                <span class="text-sm text-gray-900 break-words">{{ t('productDetail.brandOrigin') }}</span>
                <img src="/images/Margin.png" alt="Flag" class="h-4 mx-1 flex-shrink-0" />
              </div>
               <div class="flex items-center min-w-0">
                 <span class="text-sm text-gray-900 mx-1 sm:mx-1 flex-shrink-0">•</span>
                 <span class="text-sm text-gray-900 font-bold underline ml-2 sm:ml-0 break-words">{{ t('productDetail.code') }}: #{{ enhancedProduct.code }}</span>
               </div>
            </div>
          </div>

          <!-- Price -->
          <div class="space-y-2 min-w-0">
            <div v-if="enhancedProduct.hasDiscount" class="text-lg text-gray-500 line-through break-words">€ {{ enhancedProduct.oldPrice.toFixed(2).replace('.', ',') }}</div>
            <div class="flex items-baseline space-x-3 flex-wrap min-w-0">
              <span class="text-2xl font-bold text-gray-900 break-words">€{{ enhancedProduct.price.toFixed(2).replace('.', ',') }}</span>
              <span class="text-sm text-gray-600 break-words">{{ t('price.taxIncluded') }}</span>
            </div>
            <p v-if="enhancedProduct.hasDiscount" class="text-orange-500 break-words flex flex-wrap items-center gap-2">
              <span>{{ t('price.youPay') }} {{ enhancedProduct.price.toFixed(2).replace('.', ',') }} €</span>
              <span class="border border-orange-300 rounded-lg px-2 py-1 bg-orange-50 whitespace-nowrap">-{{ enhancedProduct.discountPercent }}%</span>
            </p>
          </div>

          <!-- Quantity & Stock -->
          <div class="space-y-2 min-w-0">
            <div class="flex items-center min-w-0">
              <p class="text-sm text-gray-600 break-words flex-shrink-0">{{ t('productDetail.quantity') }}</p>
              <div class="flex-1 border-t border-gray-200 ml-4 min-w-0"></div>
            </div>
            <div class="flex items-center space-x-4 min-w-0">
              <div class="flex items-center border border-gray-300 rounded-lg flex-shrink-0" :class="(!enhancedProduct || (enhancedProduct.stock ?? 0) <= 0) ? 'opacity-50' : ''">
                <button @click="decrementQuantity" :disabled="!enhancedProduct || (enhancedProduct.stock ?? 0) <= 0" class="px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-transparent">-</button>
                <input v-model="quantity" type="number" min="1" :max="enhancedProduct?.stock ?? 1" :disabled="!enhancedProduct || (enhancedProduct.stock ?? 0) <= 0" class="w-16 text-center border-0 focus:outline-none disabled:cursor-not-allowed" />
                <button @click="incrementQuantity" :disabled="!enhancedProduct || (enhancedProduct.stock ?? 0) <= 0 || quantity >= (enhancedProduct.stock ?? 0)" class="px-3 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:hover:bg-transparent">+</button>
              </div>
              <button
                class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex-shrink-0"
                :class="stockStatusClass"
              >
                {{ stockStatusText }}
              </button>
            </div>
          </div>

          <!-- Payment Options -->
          <div class="space-y-3 min-w-0 -mx-2 sm:-mx-4">
            <div class="flex items-center min-w-0 px-2 sm:px-4">
              <p class="text-sm text-gray-600 break-words flex-shrink-0">{{ t('checkout.paymentMethod') }}:</p>
              <div class="flex-1 border-t border-gray-200 ml-4 min-w-0"></div>
            </div>
            <div :class="[
              'flex items-center flex-wrap min-w-0 gap-2 px-2 sm:px-4',
              currentLocale === 'en' 
                ? 'space-x-8 min-[375px]:space-x-10 min-[425px]:space-x-12 md:space-x-20 lg:space-x-16 xl:space-x-20'
                : 'space-x-6 min-[375px]:space-x-8 min-[425px]:space-x-10 md:space-x-16 lg:space-x-14 xl:space-x-16'
            ]">
              <!-- Pay with cash -->
              <div class="flex items-center space-x-2 flex-shrink-0">
                <div class="w-8 h-8 min-[375px]:w-10 min-[375px]:h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src="/images/contant.svg" alt="Cash" class="h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 flex-shrink-0" />
                </div>
                <span class="text-xs sm:text-sm text-gray-900 whitespace-nowrap">{{ t('productDetail.payCash') }}</span>
              </div>
              <!-- Pay online -->
              <div class="flex items-center space-x-2 flex-shrink-0">
                <div class="w-8 h-8 min-[375px]:w-10 min-[375px]:h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img src="/images/Card.svg" alt="Card" class="h-5 w-5 min-[375px]:h-6 min-[375px]:w-6 flex-shrink-0" />
                </div>
                <span class="text-xs sm:text-sm text-gray-900 whitespace-nowrap">{{ t('productDetail.payOnline') }}</span>
              </div>
              <!-- Pay with bank transfer -->
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
              :disabled="!enhancedProduct || (enhancedProduct.stock ?? 0) <= 0"
              class="flex-1 min-w-0 bg-orange-500 text-white py-3 px-3 sm:px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            >
              <img src="/images/shopping-bag.svg" alt="Shopping bag" class="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span class="text-xs sm:text-base whitespace-nowrap">{{ t('button.buyNow') }}</span>
            </button>
            <button 
              @click="handleAddToCart"
              :disabled="!enhancedProduct || (enhancedProduct.stock ?? 0) <= 0"
              class="px-3 sm:px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-1 sm:space-x-2 flex-shrink-0 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:hover:bg-gray-100 disabled:border-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 flex-shrink-0">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span class="text-xs sm:text-base whitespace-nowrap hidden min-[375px]:inline">{{ t('productDetail.addToCart') }}</span>
            </button>
            <!-- Wishlist Button -->
            <button 
              @click="handleToggleWishlist($event)"
              type="button"
              class="px-3 sm:px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-1 sm:space-x-2 flex-shrink-0 cursor-pointer"
              :class="isInWishlist(enhancedProduct.id) ? 'border-orange-500 bg-orange-50 text-orange-600' : 'hover:border-orange-300'"
              :title="isInWishlist(enhancedProduct.id) ? t('productDetail.removeFromWishlist') : t('productDetail.addToWishlist')"
            >
              <svg v-if="!isInWishlist(enhancedProduct.id)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 flex-shrink-0">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 flex-shrink-0">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.53C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span class="text-xs sm:text-base whitespace-nowrap hidden min-[375px]:inline">{{ isInWishlist(enhancedProduct.id) ? t('productDetail.inWishlist') : t('productDetail.addToWishlist') }}</span>
            </button>
          </div>
          </div>
        </div>
      </div>

      <!-- Product Tabs -->
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
          <!-- Additional Information -->
          <div v-if="activeTab === 'additional-info'" class="prose max-w-none min-w-0">
            <p v-if="enhancedProduct.additionalInfo" class="text-gray-700 leading-relaxed break-words">{{ enhancedProduct.additionalInfo }}</p>
            <p v-else class="text-gray-500 italic">{{ t('productDetail.noDescription') || 'No description available.' }}</p>
          </div>

          <!-- Details -->
          <div v-if="activeTab === 'details'" class="space-y-6">
            <div v-if="enhancedProduct.features && enhancedProduct.features.length > 0">
              <h3 class="text-lg font-semibold mb-4 break-words">{{ t('productDetail.features') }}</h3>
              <ul class="space-y-2 min-w-0">
                <li v-for="feature in enhancedProduct.features" :key="feature" class="flex items-center space-x-2 min-w-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 text-green-500 flex-shrink-0">
                    <path fill-rule="evenodd" d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z" clip-rule="evenodd"/>
                  </svg>
                  <span class="break-words min-w-0">{{ feature }}</span>
                </li>
              </ul>
            </div>
            
            <div v-if="enhancedProduct.specifications && Object.keys(enhancedProduct.specifications).length > 0">
              <h3 class="text-lg font-semibold mb-4 break-words">{{ t('productDetail.specifications') }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                <div v-for="(value, key) in enhancedProduct.specifications" :key="key" class="flex justify-between py-2 border-b border-gray-100 min-w-0 gap-2">
                  <span class="font-medium text-gray-600 break-words flex-shrink-0">{{ key }}:</span>
                  <span class="text-gray-900 break-words text-right">{{ value }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="(!enhancedProduct.features || enhancedProduct.features.length === 0) && (!enhancedProduct.specifications || Object.keys(enhancedProduct.specifications).length === 0)" class="text-gray-500 italic">
              {{ t('productDetail.noDetails') || 'No details available.' }}
            </div>
          </div>

          <!-- Ratings -->
          <div v-if="activeTab === 'ratings'">
            <ProductReviews v-if="product" :product-id="parseInt(product.id)" />
          </div>
        </div>
      </div>

      <!-- Similar Products -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">{{ t('productDetail.relatedProducts') }}</h2>
        <div v-if="isLoadingSimilarProducts" class="text-center py-8">
          <p class="text-gray-600">{{ t('products.loading') }}</p>
        </div>
        <div v-else-if="similarProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <ProductCard 
            v-for="similarProduct in similarProducts" 
            :key="similarProduct.id" 
            :product="similarProduct" 
            @navigate-to-product="handleNavigateToProduct"
          />
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-600">{{ t('productDetail.noRelatedProducts') || 'Geen gerelateerde producten gevonden' }}</p>
        </div>
      </div>
    </div>

    <!-- No Product Found -->
    <div v-else class="container mx-auto px-6 py-8 text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ t('productDetail.productNotFound') }}</h1>
      <p class="text-gray-600 mb-6">{{ t('productDetail.productNotFoundDesc') }}</p>
      <NuxtLink to="/products" class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
        {{ t('common.backToProducts') }}
      </NuxtLink>
    </div>


  </div>
</template>

<style scoped>
.prose {
  color: #374151;
  line-height: 1.7;
}

.prose p {
  margin-bottom: 1rem;
}

.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}
</style>
