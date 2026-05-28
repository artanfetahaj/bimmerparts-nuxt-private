<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../stores/cart'
import { useLocale } from '../stores/locale'
import SiteFooter from './SiteFooter.vue'
import ordersService from '../services/orders'
import authService from '../services/auth'
import { autocompleteAddress } from '../services/geocode'

const router = useRouter()

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
  houseNumber: '',
  postCode: '',
  country: '',
  email: '',
  phone: '',
})

// ─── Address autocomplete ─────────────────────────────────────────────────────
const isGeocoding = ref(false)

async function onAddressLookup() {
  if (!formData.value.postCode || !formData.value.houseNumber) return

  isGeocoding.value = true
  try {
    const result = await autocompleteAddress({
      postcode: formData.value.postCode,
      house_number: formData.value.houseNumber,
    })

    if (result) {
      formData.value.address = result.street
      formData.value.city = result.city
      formData.value.country = result.country
    }
  } catch (e) {
    console.error('[Checkout] Address lookup failed:', e)
  } finally {
    isGeocoding.value = false
  }
}

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
const selectedPaymentMethod = ref<'bank' | 'card'>('bank')
const acceptTerms = ref(false)

const showTermsError = ref(false)

// Validation state
const validationErrors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const orderError = ref('')

// Required fields
const requiredFields = ['firstName', 'lastName', 'city', 'address', 'postCode', 'country', 'email', 'phone']

const countries = [
  { value: 'Netherlands',     label: 'Netherlands' },
  { value: 'Belgium',         label: 'Belgium' },
  { value: 'Germany',         label: 'Germany' },
  { value: 'France',          label: 'France' },
  { value: 'Luxembourg',      label:  'Luxembourg' },
  { value: 'United Kingdom',  label:  'United Kingdom' },
  { value: 'Austria',         label: 'Austria' },
  { value: 'Switzerland',     label: 'Switzerland' },
  { value: 'Spain',           label: 'Spain' },
  { value: 'Italy',           label: 'Italy' },
  { value: 'Portugal',        label: 'Portugal' },
  { value: 'Denmark',         label: 'Denmark' },
  { value: 'Sweden',          label: 'Sweden' },
  { value: 'Norway',          label: 'Norway' },
  { value: 'Finland',         label: 'Finland' },
  { value: 'Poland',          label: 'Poland' },
  { value: 'United States',   label: 'United States' },
  { value: 'Other',           label: '🌍 Other' },
]

// Computed values
const subtotal = computed(() => totalPrice.value)
const deliveryFee = computed(() => selectedShippingMethod.value === 'post' ? 20 : 0)
const orderTotal = computed(() => subtotal.value + deliveryFee.value)

// Watch for empty cart and redirect to products
// Guard: don't redirect when we just completed an order
const isOrderComplete = ref(false)
watch(() => cartItems.value.length, (newLength, oldLength) => {
  if (isOrderComplete.value) return
  if (newLength === 0 && oldLength !== undefined && oldLength > 0) {
    router.push('/products')
  }
})

// Navigation handlers
const handleHomeClick          = () => router.push('/')
const handleNavigateToProducts = () => router.push('/products')
const handleNavigateToProduct  = (productId: string) => router.push(`/products/${productId}`)
const handleNavigateToCart     = () => router.push('/cart')
const handleNavigateToAbout    = () => router.push('/about')
const handleNavigateToContact  = () => router.push('/contact')
const handleNavigateToTerms    = () => router.push('/terms')
const handleNavigateToPrivacy  = () => router.push('/privacy')
const handleNavigateToWishlist = () => router.push('/wishlist')
const handleNavigateToAccount  = () => router.push('/account')

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
  if (!validateForm()) return

  if (!acceptTerms.value) {
    showTermsError.value = true
    return
  }

  showTermsError.value = false
  orderError.value = ''
  isSubmitting.value = true

  const itemsPayload: { product_id: string; quantity: number }[] = cartItems.value.map(ci => ({
    product_id: ci.product_id,
    quantity: ci.quantity,
  }))

  const customerEmail = authService.isAuthenticated()
    ? (authService.getCurrentCustomer()?.email || formData.value.email)
    : formData.value.email

  const addressStr = `${formData.value.address} ${formData.value.houseNumber}, ${formData.value.postCode} ${formData.value.city}, ${formData.value.country}`

  // Both card and iDEAL/Wero go through Mollie — order is only created after payment is confirmed
  const mollieMethodMap: Record<'bank' | 'card', string> = {
    bank: 'ideal',       // iDEAL / Wero
    card: 'creditcard',
  }
  const orderPaymentMethodMap: Record<'bank' | 'card', string> = {
    bank: 'bank_transfer',
    card: 'credit_card',
  }

  try {
    sessionStorage.setItem('pending_checkout', JSON.stringify({
      customer_name: `${formData.value.firstName} ${formData.value.lastName}`.trim(),
      customer_email: customerEmail,
      customer_phone: formData.value.phone,
      shipping_address: addressStr,
      billing_address: addressStr,
      payment_method: orderPaymentMethodMap[selectedPaymentMethod.value],
      shipping_method: selectedShippingMethod.value,
      items: itemsPayload,
    }))

    const result = await ordersService.initiatePayment({
      items: itemsPayload,
      redirect_url: `${window.location.origin}/order-thanks`,
      method: mollieMethodMap[selectedPaymentMethod.value],
    })

    sessionStorage.setItem('pending_payment_id', result.payment_id)
    window.location.href = result.checkout_url
  } catch (e: any) {
    sessionStorage.removeItem('pending_checkout')
    sessionStorage.removeItem('pending_payment_id')
    orderError.value = e?.response?.data?.message || e?.message || 'Failed to initiate payment. Please try again.'
    isSubmitting.value = false
  }
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
              <!-- Row 1: First name | Last name -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              </div>

              <!-- Row 2: Company -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">{{ t('checkout.company') }}</label>
                  <input
                    v-model="formData.company"
                    type="text"
                    :placeholder="t('checkout.enterCompany')"
                    class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                  />
                </div>
              </div>

              <!-- Row 3: Postcode | House number | Addition -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">
                    {{ t('checkout.postCode') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.postCode"
                    @input="validationErrors.postCode = ''"
                    @change="onAddressLookup"
                    type="text"
                    :placeholder="t('checkout.enterPostCode')"
                    class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                    :class="validationErrors.postCode ? 'border-red-500' : ''"
                  />
                  <p v-if="validationErrors.postCode" class="text-red-500 text-sm mt-1">{{ validationErrors.postCode }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">
                    Huisnummer <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.houseNumber"
                    @change="onAddressLookup"
                    type="text"
                    placeholder="10"
                    class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent"
                  />
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
              </div>

              <!-- Row 4: Street (auto-filled) | City (auto-filled) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="relative">
                  <label class="block text-sm font-medium text-gray-500 mb-2">
                    {{ t('checkout.address') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.address"
                    @input="validationErrors.address = ''"
                    type="text"
                    :placeholder="isGeocoding ? 'Ophalen...' : t('checkout.enterAddress')"
                    :disabled="isGeocoding"
                    class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent disabled:opacity-50"
                    :class="validationErrors.address ? 'border-red-500' : ''"
                  />
                  <p v-if="validationErrors.address" class="text-red-500 text-sm mt-1">{{ validationErrors.address }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">
                    {{ t('checkout.city') }} <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.city"
                    @input="validationErrors.city = ''"
                    type="text"
                    :placeholder="isGeocoding ? 'Ophalen...' : t('checkout.enterCity')"
                    :disabled="isGeocoding"
                    class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent disabled:opacity-50"
                    :class="validationErrors.city ? 'border-red-500' : ''"
                  />
                  <p v-if="validationErrors.city" class="text-red-500 text-sm mt-1">{{ validationErrors.city }}</p>
                </div>
              </div>

              <!-- Row 5: Country -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label class="block text-sm font-medium text-gray-500 mb-2">
                    {{ t('checkout.country') }} <span class="text-red-500">*</span>
                  </label>
                  <select
                    v-model="formData.country"
                    @change="validationErrors.country = ''"
                    class="w-full text-base text-gray-900 border-0 border-b border-gray-300 pb-2 focus:outline-none focus:border-orange-500 bg-transparent appearance-none cursor-pointer"
                    :class="validationErrors.country ? 'border-red-500' : ''"
                  >
                    <option value="" disabled>{{ t('checkout.selectCountry') }}</option>
                    <option v-for="c in countries" :key="c.value" :value="c.value">{{ c.label }}</option>
                  </select>
                  <p v-if="validationErrors.country" class="text-red-500 text-sm mt-1">{{ validationErrors.country }}</p>
                </div>
              </div>

              <!-- Row 5: Email | Phone -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Bank Transfer -->
                <button
                  @click="selectedPaymentMethod = 'bank'"
                  type="button"
                  class="flex items-center justify-center space-x-3 p-4 border-2 rounded-lg transition-colors"
                  :class="selectedPaymentMethod === 'bank' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="w-8 h-8 flex items-center justify-center">
                    <img src="/images/bank.png" :alt="t('checkout.payment.bank')" class="w-6 h-6" />
                  </div>
                  <span class="text-sm font-medium">{{ t('checkout.payment.bank') }}</span>
                </button>

                <!-- Credit / Debit Card -->
                <button
                  @click="selectedPaymentMethod = 'card'"
                  type="button"
                  class="flex items-center justify-center space-x-3 p-4 border-2 rounded-lg transition-colors"
                  :class="selectedPaymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'"
                >
                  <div class="w-8 h-8 flex items-center justify-center">
                    <!-- Card icon (inline SVG — no image dependency) -->
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-6 h-6 text-gray-600">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <span class="text-sm font-medium">{{ t('checkout.payment.card') }}</span>
                </button>
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
                    class="terms-checkbox mt-1 flex-shrink-0"
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
              class="w-full flex items-center justify-center p-4 border-2 hover:border-orange-500 rounded-lg transition-colors hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="text-lg font-medium text-orange-500">
                {{ t('checkout.redirectingToPayment') }}
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
  </div>
</template>

<style scoped>
.terms-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 1rem;
  height: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: #ffffff;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.terms-checkbox:checked {
  background-color: #f97316;
  border-color: #f97316;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.terms-checkbox:focus {
  outline: 2px solid #f97316;
  outline-offset: 2px;
}
</style>
