<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCart } from '../stores/cart'
import { useLocale } from '../stores/locale'
import HeaderNav from './HeaderNav.vue'
import SiteFooter from './SiteFooter.vue'
import ordersService from '../services/orders'
import productService from '../services/product'
import authService from '../services/auth'

const emit = defineEmits<{
  navigateToHome: []
  navigateToProducts: []
  navigateToProduct: [productId: string]
  navigateToCart: []
  navigateToAbout: []
  navigateToContact: []
  navigateToTerms: []
  navigateToPrivacy: []
  navigateToWishlist: []
  navigateToAccount: []
  navigateToOrderThanks: []
}>()

const { cartItems, totalPrice, clearCart, removeFromCart, updateQuantity } = useCart()
const { t } = useLocale()

// Form data 
const formData = ref({
  firstName: '',
  lastName: '',
  company: '',
  city: '',
  address: '',
  address2: '',
  postCode: '',
  country: '',
  email: '',
  phone: '',
})

// Load customer profile data if authenticated
const loadCustomerData = async () => {
  if (!authService.isAuthenticated()) {
    return
  }

  try {
    const profile = await authService.getProfile()
    
    // Only fill in fields that have values (don't overwrite with empty/null)
    if (profile.first_name) formData.value.firstName = profile.first_name
    if (profile.last_name) formData.value.lastName = profile.last_name
    if (profile.email) formData.value.email = profile.email
    if (profile.phone) formData.value.phone = profile.phone
    if (profile.address) formData.value.address = profile.address
    if (profile.city) formData.value.city = profile.city
    if (profile.zip_code) formData.value.postCode = profile.zip_code
    if (profile.country) formData.value.country = profile.country
    // Note: company and address2 are not in customer profile, so they remain empty
  } catch (error) {
    console.error('Failed to load customer profile:', error)
    // Don't show error to user, just silently fail - they can still fill form manually
  }
}

// Load customer data when component mounts
onMounted(() => {
  loadCustomerData()
})

// Shipping and payment methods
const selectedShippingMethod = ref<'store' | 'post'>('store')
const selectedPaymentMethod = ref<'bank'>('bank')
const acceptTerms = ref(false)
const showTermsError = ref(false)

// Validation state
const validationErrors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const orderError = ref('')

// Required fields
const requiredFields = ['firstName', 'lastName', 'city', 'address', 'postCode', 'country', 'email', 'phone']

// Computed values
const subtotal = computed(() => totalPrice.value)
const deliveryFee = computed(() => selectedShippingMethod.value === 'post' ? 20 : 0)
const orderTotal = computed(() => subtotal.value + deliveryFee.value)

// Watch for empty cart and redirect to products
watch(() => cartItems.value.length, (newLength, oldLength) => {
  // Only redirect if cart becomes empty (not on initial load when oldLength is undefined)
  if (newLength === 0 && oldLength !== undefined && oldLength > 0) {
    emit('navigateToProducts')
  }
})

// Methods
const handleHomeClick = () => {
  emit('navigateToHome')
}

const handleNavigateToProducts = () => {
  emit('navigateToProducts')
}

const handleNavigateToProduct = (productId: string) => {
  emit('navigateToProduct', productId)
}

const handleNavigateToCart = () => {
  emit('navigateToCart')
}

const handleNavigateToAbout = () => {
  emit('navigateToAbout')
}

const handleNavigateToContact = () => {
  emit('navigateToContact')
}

const handleNavigateToTerms = () => {
  emit('navigateToTerms')
}

const handleNavigateToPrivacy = () => {
  emit('navigateToPrivacy')
}

const handleNavigateToWishlist = () => {
  emit('navigateToWishlist')
}

const handleNavigateToAccount = () => {
  emit('navigateToAccount')
}

  // Validation function
const validateForm = () => {
  const errors: Record<string, string> = {}
  
  requiredFields.forEach(field => {
    const value = formData.value[field as keyof typeof formData.value]
    if (!value || value.trim() === '') {
      errors[field] = t('checkout.fieldRequired')
    }
  })
  
  // Email validation
  if (formData.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.email = t('checkout.validEmail')
  }
  
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleOrderNow = async () => {
  // Validate form first
  if (!validateForm()) {
    return
  }
  
  if (!acceptTerms.value) {
    showTermsError.value = true
    return
  }
  
  // Reset error state
  showTermsError.value = false
  orderError.value = ''
  isSubmitting.value = true
  
  // Build order payload for API and CMS
  // Use product_id instead of cart item id
  const itemsPayload: { product_id: number; quantity: number }[] = cartItems.value.map(ci => ({
    product_id: parseInt(ci.product_id || ci.id, 10), // Use product_id if available, fallback to id
    quantity: ci.quantity
  }))

  // If customer is logged in, use their account email to ensure proper order linking
  const customerEmail = authService.isAuthenticated() 
    ? (authService.getCurrentCustomer()?.email || formData.value.email)
    : formData.value.email

  try {
    const result = await ordersService.create({
      customer_name: `${formData.value.firstName} ${formData.value.lastName}`.trim(),
      customer_email: customerEmail, // Use account email if logged in
      customer_phone: formData.value.phone,
      shipping_address: `${formData.value.address}, ${formData.value.postCode} ${formData.value.city}, ${formData.value.country}`,
      billing_address: `${formData.value.address}, ${formData.value.postCode} ${formData.value.city}, ${formData.value.country}`,
      payment_method: 'bank_transfer',
      items: itemsPayload
    })
    
    console.log('Order created successfully:', result)
  } catch (e: any) {
    console.error('Order creation failed', e)
    orderError.value = e?.response?.data?.message || e?.message || 'Failed to create order. Please try again.'
    isSubmitting.value = false
    return // Don't navigate if order creation fails
  }

  // Clear cart and navigate to thank you
  clearCart()
  emit('navigateToOrderThanks')
}

</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <HeaderNav variant="solid" @navigate-to-products="handleNavigateToProducts" @navigate-to-home="handleHomeClick" @navigate-to-cart="handleNavigateToCart" @navigate-to-about="handleNavigateToAbout" @navigate-to-contact="handleNavigateToContact" @navigate-to-wishlist="handleNavigateToWishlist" @navigate-to-account="handleNavigateToAccount" @navigate-to-product="handleNavigateToProduct" />

    <!-- Main Content -->
    <div class="container mx-auto px-4 md:px-6 py-8">
      <!-- Breadcrumb -->
      <nav class="mb-6">
        <ol class="flex items-center space-x-2 text-sm text-gray-600">
          <li><button @click="handleHomeClick" class="hover:text-orange-500 cursor-pointer">{{ t('common.home') }}</button></li>
          <li class="text-gray-400">/</li>
          <li><button @click="handleNavigateToCart" class="hover:text-orange-500 cursor-pointer">{{ t('cart.title') }}</button></li>
          <li class="text-gray-400">/</li>
          <li class="text-gray-900">{{ t('checkout.title') }}</li>
        </ol>
      </nav>

      <!-- Page Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">{{ t('checkout.title') }}</h1>
        <h2 class="text-2xl font-bold text-orange-500 mt-2">BIMMERParts</h2>
      </div>

      <!-- Checkout Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left Column: Secure Checkout & Your Cart -->
        <div class="space-y-8">
          <!-- Secure Checkout Form -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-6">{{ t('checkout.secure') }}</h3>
            
            <form class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">
                      {{ t('checkout.firstName') }} <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="formData.firstName"
                      @input="validationErrors.firstName = ''"
                      type="text" 
                      :placeholder="t('checkout.enterFirstName')"
                      class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                      :class="validationErrors.firstName ? 'border-red-500' : ''"
                    />
                    <p v-if="validationErrors.firstName" class="text-red-500 text-sm mt-1">{{ validationErrors.firstName }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">{{ t('checkout.company') }}</label>
                    <input 
                      v-model="formData.company"
                      type="text" 
                      :placeholder="t('checkout.enterCompany')"
                      class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">
                      {{ t('checkout.address') }} <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="formData.address"
                      @input="validationErrors.address = ''"
                      type="text" 
                      :placeholder="t('checkout.enterAddress')"
                      class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                      :class="validationErrors.address ? 'border-red-500' : ''"
                    />
                    <p v-if="validationErrors.address" class="text-red-500 text-sm mt-1">{{ validationErrors.address }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">
                      {{ t('checkout.postCode') }} <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="formData.postCode"
                      @input="validationErrors.postCode = ''"
                      type="text" 
                      :placeholder="t('checkout.enterPostCode')"
                      class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                      :class="validationErrors.postCode ? 'border-red-500' : ''"
                    />
                    <p v-if="validationErrors.postCode" class="text-red-500 text-sm mt-1">{{ validationErrors.postCode }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">
                      {{ t('checkout.email') }} <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="formData.email"
                      @input="validationErrors.email = ''"
                      type="email" 
                      :placeholder="t('checkout.enterEmail')"
                      class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                      :class="validationErrors.email ? 'border-red-500' : ''"
                    />
                    <p v-if="validationErrors.email" class="text-red-500 text-sm mt-1">{{ validationErrors.email }}</p>
                  </div>
                </div>
                
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">
                      {{ t('checkout.lastName') }} <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="formData.lastName"
                      @input="validationErrors.lastName = ''"
                      type="text" 
                      :placeholder="t('checkout.enterLastName')"
                      class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                      :class="validationErrors.lastName ? 'border-red-500' : ''"
                    />
                    <p v-if="validationErrors.lastName" class="text-red-500 text-sm mt-1">{{ validationErrors.lastName }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">
                      {{ t('checkout.city') }} <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="formData.city"
                      @input="validationErrors.city = ''"
                      type="text" 
                      :placeholder="t('checkout.enterCity')"
                      class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                      :class="validationErrors.city ? 'border-red-500' : ''"
                    />
                    <p v-if="validationErrors.city" class="text-red-500 text-sm mt-1">{{ validationErrors.city }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">{{ t('checkout.address2') }}</label>
                    <input 
                      v-model="formData.address2"
                      type="text" 
                      :placeholder="t('checkout.enterAddress2')"
                      class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">
                      {{ t('checkout.country') }} <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="formData.country"
                      @input="validationErrors.country = ''"
                      type="text" 
                      :placeholder="t('checkout.enterCountry')"
                      class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                      :class="validationErrors.country ? 'border-red-500' : ''"
                    />
                    <p v-if="validationErrors.country" class="text-red-500 text-sm mt-1">{{ validationErrors.country }}</p>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-500 mb-2">
                      {{ t('checkout.phone') }} <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="formData.phone"
                      @input="validationErrors.phone = ''"
                      type="tel" 
                      :placeholder="t('checkout.enterPhone')"
                      class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                      :class="validationErrors.phone ? 'border-red-500' : ''"
                    />
                    <p v-if="validationErrors.phone" class="text-red-500 text-sm mt-1">{{ validationErrors.phone }}</p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Your Cart -->
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-6">{{ t('checkout.yourCart') }}</h3>
            
            <div class="space-y-4">
              <div 
                v-for="item in cartItems" 
                :key="item.id"
                class="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg relative"
              >
                <!-- Remove button -->
                <button 
                  @click="removeFromCart(item.id)"
                  class="absolute top-3 right-3 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
                
                <!-- Product Image -->
                <div class="w-20 h-20 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img :src="item.image" :alt="item.title" class="w-full h-full object-contain p-2" />
                </div>
                
                <!-- Product Info -->
                <div class="flex-1 min-w-0 pr-1">
                  <h4 class="text-lg font-semibold text-gray-900 mb-2 truncate">{{ item.title }}</h4>
                  <div class="space-y-1">
                    <div class="text-xl font-bold text-gray-900">€ {{ item.price.toFixed(2).replace('.', ',') }}</div>
                    <div v-if="item.oldPrice" class="text-lg text-gray-500 line-through">€ {{ item.oldPrice.toFixed(2).replace('.', ',') }}</div>
                  </div>
                </div>
                
                <!-- Quantity Controls -->
                <div class="flex flex-col items-start space-y-2 mr-1 flex-1 justify-center">
                  <span class="text-lg font-medium text-gray-900">{{ t('cart.quantity') }}</span>
                  <div class="flex items-center bg-white border border-gray-200 rounded-lg">
                    <button 
                      @click="updateQuantity(item.id, item.quantity - 1)"
                      class="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-50 rounded-l-lg"
                    >
                      <span class="text-sm font-medium">-</span>
                    </button>
                    <span class="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-900">{{ item.quantity }}</span>
                    <button 
                      @click="updateQuantity(item.id, item.quantity + 1)"
                      class="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-50 rounded-r-lg"
                    >
                      <span class="text-sm font-medium">+</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Order Summary & Payment -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <!-- Order Summary -->
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-6">{{ t('checkout.orderSummary') }}</h3>
            
            <div class="space-y-3 mb-2">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ t('checkout.bagTotal') }}</span>
                <span class="font-medium">€{{ subtotal.toFixed(2).replace('.', ',') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ t('checkout.bagDiscount') }}</span>
                <span class="font-medium text-green-600">-€{{ (subtotal * 0.2).toFixed(2).replace('.', ',') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ t('checkout.deliveryFee') }}</span>
                <span class="font-medium">€{{ deliveryFee.toFixed(2).replace('.', ',') }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold text-orange-500">
                <span>{{ t('checkout.orderTotal') }}</span>
                <span class="text-orange-500">€{{ orderTotal.toFixed(2).replace('.', ',') }}</span>
              </div>
            </div>
          </div>

          <!-- Divider between Order Summary and Shipping & Payment Method -->
          <div class="border-t border-gray-200 my-4"></div>

          <!-- Shipping & Payment Method -->
          <div>
            <h3 class="text-lg font-medium text-gray-600 mb-6">{{ t('checkout.shippingPayment') }}</h3>
            
            <!-- Select Shipping Method -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ t('checkout.selectShippingMethod') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button 
                  @click="selectedShippingMethod = 'store'"
                  class="flex items-center justify-center space-x-3 p-4 border-2 rounded-lg transition-colors"
                  :class="selectedShippingMethod === 'store' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="w-8 h-8 flex items-center justify-center">
                    <img src="/images/building.png" :alt="t('checkout.atOurStore')" class="w-6 h-6" />
                  </div>
                  <span class="text-sm font-medium">{{ t('checkout.atOurStore') }}</span>
                </button>
                
                <button 
                  @click="selectedShippingMethod = 'post'"
                  class="flex items-center justify-center space-x-3 p-4 border-2 rounded-lg transition-colors"
                  :class="selectedShippingMethod === 'post' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="w-8 h-8 flex items-center justify-center">
                    <img src="/images/box-time.png" :alt="t('checkout.viaPost')" class="w-6 h-6" />
                  </div>
                  <span class="text-sm font-medium">{{ t('checkout.viaPost') }}</span>
                </button>
              </div>
            </div>

            <!-- Select Payment Method -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-700 mb-3">{{ t('checkout.paymentMethod') }}</h4>
              <div class="flex items-center justify-center space-x-3 p-4 border-2 border-orange-500 bg-orange-50 rounded-lg">
                <div class="w-8 h-8 flex items-center justify-center">
                  <img src="/images/bank.png" :alt="t('checkout.payment.bank')" class="w-6 h-6" />
                </div>
                <span class="text-sm font-medium">{{ t('checkout.payment.bank') }}</span>
              </div>
            </div>

            <!-- Additional Information -->
            <div class="mb-6">
              <p class="text-sm text-gray-600 mb-4" v-html="t('checkout.accountCreated')">
              </p>
              
              <div>
                <label class="flex items-start space-x-3 cursor-pointer">
                  <input 
                    v-model="acceptTerms"
                    @change="showTermsError = false"
                    type="checkbox" 
                    class="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <span class="text-sm text-gray-600">
                    <span>{{ t('checkout.acceptTermsText') || 'I accept the' }}</span>
                    <a href="#" @click.prevent="handleNavigateToTerms" class="text-orange-500 hover:underline cursor-pointer font-medium ml-1">{{ t('checkout.terms') || 'Terms and Conditions' }}</a>
                    <span class="ml-1 mr-1">{{ t('auth.and') || 'and' }}</span>
                    <a href="#" @click.prevent="handleNavigateToPrivacy" class="text-orange-500 hover:underline cursor-pointer font-medium">{{ t('checkout.privacy') || 'Privacy Policy' }}</a>
                    <span class="text-red-500 ml-1">*</span>
                  </span>
                </label>
                <p v-if="showTermsError" class="text-red-500 text-sm mt-2">
                  {{ t('checkout.termsError') }}
                </p>
              </div>
            </div>

            <!-- Order Error Display -->
            <div v-if="orderError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ orderError }}</p>
            </div>

            <!-- Order Now Button -->
            <button 
              @click="handleOrderNow"
              :disabled="isSubmitting"
              class="w-full flex items-center justify-center p-4 border-2 border-orange-500 bg-orange-50 rounded-lg transition-colors hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="text-lg font-medium text-orange-500">
                {{ t('checkout.processingOrder') }}
              </span>
              <span v-else class="text-lg font-medium text-orange-500">
                {{ t('checkout.orderNow') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <SiteFooter @navigate-to-about="handleNavigateToAbout" @navigate-to-contact="handleNavigateToContact" @navigate-to-terms="handleNavigateToTerms" @navigate-to-privacy="handleNavigateToPrivacy" />
  </div>
</template>

<style scoped>
</style>
