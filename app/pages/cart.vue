<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/stores/cart'
import { useLocale } from '@/stores/locale'
import productService from '../services/product'

const router = useRouter()
const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart()
const { t } = useLocale()

const promoCode = ref('')
const promoCodeApplied = ref(false)

const togglePromoCode = () => {
  promoCodeApplied.value = !promoCodeApplied.value
}

const handleQuantityInput = (item: any, event: Event) => {
  const input = event.target as HTMLInputElement
  const value = parseInt(input.value) || 0
  const maxQuantity = item.max_quantity || 999
  if (value > maxQuantity) {
    item.quantity = maxQuantity
    input.value = maxQuantity.toString()
  } else if (value < 1) {
    item.quantity = 1
    input.value = '1'
  }
}

const handleQuantityChange = async (item: any) => {
  const maxQuantity = item.max_quantity || 999
  if (item.quantity > maxQuantity) item.quantity = maxQuantity
  else if (item.quantity < 1) item.quantity = 1
  try {
    await updateQuantity(item.id, item.quantity, item.max_quantity)
  } catch (error: any) {
    console.error('Failed to update quantity:', error)
  }
}

const similarProducts = ref<any[]>([])
const isLoadingSimilarProducts = ref(false)

const loadSimilarProducts = async () => {
  const items = cartItems.value
  if (!Array.isArray(items) || items.length === 0) {
    similarProducts.value = []
    return
  }
  isLoadingSimilarProducts.value = true
  try {
    const uniqueProductIds = Array.from(
      new Set(items.map(item => item.product_id).filter(id => id !== null && id !== undefined && id !== ''))
    )
    if (uniqueProductIds.length === 0) { similarProducts.value = []; return }

    const categoryIds = new Set<number>()
    const hauptgruppen = new Set<string>()
    const modelIds = new Set<number>()
    const modelCodes = new Set<string>()

    await Promise.all(
      uniqueProductIds.map(async productId => {
        try {
          const productResponse = await productService.getProduct(String(productId))
          const productData = productResponse?.data || productResponse
          if (productData?.category_id) categoryIds.add(Number(productData.category_id))
          else if (productData?.category?.id) categoryIds.add(Number(productData.category.id))
          if (typeof productData?.bmw_hauptgruppe === 'string' && productData.bmw_hauptgruppe.trim() !== '') hauptgruppen.add(productData.bmw_hauptgruppe.trim())
          const compatibleModelIds = Array.isArray(productData?.compatible_models?.model_ids) ? productData.compatible_models.model_ids.map((id: any) => Number(id)).filter((id: number) => Number.isFinite(id)) : []
          compatibleModelIds.forEach(id => modelIds.add(id))
          const compatibleCodes = Array.isArray(productData?.compatible_models?.codes) ? productData.compatible_models.codes.map((code: any) => (typeof code === 'string' ? code.trim().toUpperCase() : '')).filter((code: string) => code !== '') : []
          compatibleCodes.forEach(code => modelCodes.add(code))
        } catch (error) {
          console.error(`Failed to load product ${productId}`, error)
        }
      })
    )

    if (categoryIds.size === 0 && modelIds.size === 0 && modelCodes.size === 0 && hauptgruppen.size === 0) {
      similarProducts.value = []
      return
    }

    const relatedProducts = await productService.getRelatedProducts({
      categoryIds: Array.from(categoryIds),
      modelIds: Array.from(modelIds),
      modelCodes: Array.from(modelCodes),
      hauptgruppen: Array.from(hauptgruppen),
      excludeIds: uniqueProductIds,
      limit: 5
    })
    similarProducts.value = relatedProducts
  } catch (error) {
    console.error('Failed to load similar products:', error)
    similarProducts.value = []
  } finally {
    isLoadingSimilarProducts.value = false
  }
}

watch(cartItems, () => { loadSimilarProducts() }, { immediate: true, deep: true })
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="container mx-auto px-6 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm text-gray-600">
          <li><NuxtLink to="/" class="hover:text-orange-500">{{ t('common.home') }}</NuxtLink></li>
          <li class="text-gray-400">/</li>
          <li class="text-gray-900">{{ t('cart.title') }}</li>
        </ol>
      </nav>

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ t('cart.title') }}</h1>
      </div>

      <!-- Cart Content -->
      <div v-if="cartItems.length > 0" class="border border-gray-200 rounded-lg p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Products -->
          <div class="lg:col-span-2">
            <div class="grid grid-cols-4 text-sm font-medium text-gray-700 mb-4 px-6" style="grid-template-columns: 4fr 0.8fr 0.4fr 0.4fr; gap: 0 2rem;">
              <div class="text-left">{{ t('cart.product') }}</div>
              <div class="text-right flex justify-end">{{ t('cart.price') }}</div>
              <div class="text-center">{{ t('cart.quantity') }}</div>
              <div class="text-right flex justify-end">{{ t('cart.total') }}</div>
            </div>
            <div class="bg-white rounded-lg overflow-hidden">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="border-b border-gray-200 last:border-b-0 px-6 py-4"
              >
                <div class="grid grid-cols-4 items-center text-sm" style="grid-template-columns: 4fr 1fr 0.4fr 0.4fr; gap: 0 2rem;">
                  <div class="flex items-center space-x-3">
                    <div class="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      <img :src="item.image" :alt="item.title" class="w-full h-full object-contain p-1" />
                    </div>
                    <div class="flex-1">
                      <h3 class="text-sm font-medium text-gray-900 mb-1">{{ item.title }}</h3>
                      <button @click="removeFromCart(item.id)" class="text-red-500 hover:text-red-700 transition-colors text-xs">
                        {{ t('cart.delete') }}
                      </button>
                    </div>
                  </div>
                  <div class="text-right flex justify-end">
                    <span class="text-sm font-medium text-gray-900">€{{ item.price.toFixed(2).replace('.', ',') }}</span>
                  </div>
                  <div class="text-center">
                    <input
                      v-model.number="item.quantity"
                      @change="handleQuantityChange(item)"
                      @input="handleQuantityInput(item, $event)"
                      type="number"
                      :min="1"
                      :max="item.max_quantity || 999"
                      class="border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style="width: 80px; height: 37px; border-radius: 12px; padding: 0 16px;"
                    />
                  </div>
                  <div class="text-right flex justify-end">
                    <span class="text-sm font-medium text-gray-900">€{{ (item.price * item.quantity).toFixed(2).replace('.', ',') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg p-6 sticky top-8">
              <div class="mb-6">
                <div class="relative">
                  <input
                    v-model="promoCode"
                    type="text"
                    :placeholder="t('cart.promoCode')"
                    class="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    @click="togglePromoCode"
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50"
                  >
                    <svg v-if="promoCodeApplied" class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="space-y-3 mb-6">
                <div class="flex justify-between">
                  <span class="text-gray-600">{{ t('cart.subtotal') }}</span>
                  <span class="font-medium">€{{ totalPrice.toFixed(2).replace('.', ',') }}</span>
                </div>
                <div class="border-t border-gray-200 pt-3">
                  <div class="flex justify-between text-lg font-bold">
                    <span>{{ t('cart.total') }}</span>
                    <span>€{{ totalPrice.toFixed(2).replace('.', ',') }}</span>
                  </div>
                </div>
              </div>
              <NuxtLink
                to="/checkout"
                class="block w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors text-center"
              >
                {{ t('cart.continue') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Similar Products -->
      <div v-if="cartItems.length > 0" class="mt-16">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">{{ t('cart.similarProducts') }}</h2>
        <div v-if="isLoadingSimilarProducts" class="text-center py-8">
          <p class="text-gray-600">{{ t('products.loading') }}</p>
        </div>
        <div v-else-if="similarProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <ProductCard
            v-for="product in similarProducts"
            :key="product.id"
            :product="product"
          />
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-600">{{ t('productDetail.noRelatedProducts') || 'Geen producten gevonden' }}</p>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="h-24 w-24 text-gray-300 mx-auto mb-4">
          <path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ t('cart.empty') }}</h2>
        <p class="text-gray-600 mb-6">{{ t('cart.emptyMessage') }}</p>
        <NuxtLink to="/products" class="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
          {{ t('cart.startShopping') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
