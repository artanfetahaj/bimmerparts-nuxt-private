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
const selectedShippingMethod = ref<'store' | 'post'>('post')
const selectedPaymentMethod = ref<'bank' | 'card' | 'bancontact'>('bank')
const acceptTerms = ref(false)
const installationRequested = ref(true)

// Per-item installation opt-out map (true = install this item, false = ship it)
const itemInstallMap = ref<Record<string, boolean>>({})

// When installation is toggled on, reset all items to "install"
watch(installationRequested, (val) => {
  if (val) {
    cartItems.value.forEach(item => {
      itemInstallMap.value[item.id] = true
    })
  }
})

// Initialise map when cart loads
watch(() => cartItems.value, (items) => {
  items.forEach(item => {
    if (!(item.id in itemInstallMap.value)) {
      itemInstallMap.value[item.id] = true
    }
  })
}, { immediate: true })

const itemsBeingInstalled = computed(() =>
  installationRequested.value
    ? cartItems.value.filter(item => itemInstallMap.value[item.id] !== false)
    : []
)

const itemsNeedingShipping = computed(() =>
  installationRequested.value
    ? cartItems.value.filter(item => itemInstallMap.value[item.id] === false)
    : cartItems.value
)

const needsShipping = computed(() => itemsNeedingShipping.value.length > 0)
const reservationFee = computed(() => itemsBeingInstalled.value.length > 0 ? 20 : 0)

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
const deliveryFee = computed(() => {
  if (!needsShipping.value) return 0
  if (selectedShippingMethod.value !== 'post') return 0
  return subtotal.value > 100 ? 0 : 10
})
const btwAmount = computed(() => subtotal.value * 0.21)
const orderTotal = computed(() => subtotal.value + btwAmount.value + deliveryFee.value + reservationFee.value)

// Watch for empty cart and redirect to products
// Guard: don't redirect when we just completed an order
const isOrderComplete = ref(false)
watch(() => cartItems.value.length, (newLength, oldLength) => {
  if (isOrderComplete.value) return
  if (newLength === 0 && oldLength !== undefined && oldLength > 0) {
    router.push('/producten')
  }
})

// Navigation handlers
const handleHomeClick          = () => router.push('/')
const handleNavigateToProducts = () => router.push('/producten')
const handleNavigateToProduct  = (productId: string) => router.push(`/products/${productId}`)
const handleNavigateToCart     = () => router.push('/winkelwagen')
const handleNavigateToAbout    = () => router.push('/over-ons')
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

  const itemsPayload: { product_id: string; quantity: number; install?: boolean }[] = cartItems.value.map(ci => ({
    product_id: ci.product_id,
    quantity: ci.quantity,
    ...(installationRequested.value ? { install: itemInstallMap.value[ci.id] !== false } : {}),
  }))

  const customerEmail = authService.isAuthenticated()
    ? (authService.getCurrentCustomer()?.email || formData.value.email)
    : formData.value.email

  const addressStr = `${formData.value.address} ${formData.value.houseNumber}, ${formData.value.postCode} ${formData.value.city}, ${formData.value.country}`

  // Both card and iDEAL/Wero go through Mollie — order is only created after payment is confirmed
  const mollieMethodMap: Record<'bank' | 'card' | 'bancontact', string> = {
    bank: 'ideal',
    card: 'creditcard',
    bancontact: 'bancontact',
  }
  const orderPaymentMethodMap: Record<'bank' | 'card' | 'bancontact', string> = {
    bank: 'bank_transfer',
    card: 'credit_card',
    bancontact: 'bancontact',
  }

  try {
    sessionStorage.setItem('pending_checkout', JSON.stringify({
      customer_name: `${formData.value.firstName} ${formData.value.lastName}`.trim(),
      customer_email: customerEmail,
      customer_phone: formData.value.phone,
      shipping_address: addressStr,
      billing_address: addressStr,
      address_street: formData.value.address,
      address_house_number: formData.value.houseNumber,
      address_house_number_addition: formData.value.address2 || null,
      address_postcode: formData.value.postCode,
      address_city: formData.value.city,
      address_country_code: formData.value.country,
      payment_method: orderPaymentMethodMap[selectedPaymentMethod.value],
      shipping_method: selectedShippingMethod.value,
      installation_requested: installationRequested.value,
      items: itemsPayload,
    }))

    const result = await ordersService.initiatePayment({
      items: itemsPayload,
      redirect_url: `${window.location.origin}/bestelling-bevestigd`,
      method: mollieMethodMap[selectedPaymentMethod.value],
      shipping_method: selectedShippingMethod.value,
      installation_requested: installationRequested.value,
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
                  <label class="block text-sm font-medium text-gray-500 mb-2">{{ t('checkout.toevoeging') }}</label>
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

                <!-- All product info stacked, like the HTML example -->
                <div class="flex-1 min-w-0 pr-6">
                  <h4 class="text-sm font-bold text-gray-900 leading-snug">{{ item.title }}</h4>
                  <div class="text-sm font-bold text-gray-900 mt-1.5">€ {{ item.price.toFixed(2).replace('.', ',') }}</div>
                  <div v-if="item.oldPrice < item.price" class="text-sm text-gray-400 line-through">€ {{ item.oldPrice.toFixed(2).replace('.', ',') }}</div>

                  <!-- Qty stepper -->
                  <div class="inline-flex items-center border border-gray-300 rounded-full mt-2.5">
                    <button
                      @click="updateQuantity(item.id, item.quantity - 1)"
                      class="w-[26px] h-[26px] flex items-center justify-center text-gray-500 hover:text-gray-800 text-sm"
                    >−</button>
                    <span class="w-[22px] text-center text-[13px] font-semibold text-gray-900">{{ item.quantity }}</span>
                    <button
                      @click="updateQuantity(item.id, item.quantity + 1)"
                      class="w-[26px] h-[26px] flex items-center justify-center text-gray-500 hover:text-gray-800 text-sm"
                    >+</button>
                  </div>

                  <!-- Per-item install toggle (only when service is on) -->
                  <Transition
                    enter-active-class="transition-all duration-150 ease-out overflow-hidden"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-16"
                    leave-active-class="transition-all duration-100 ease-in overflow-hidden"
                    leave-from-class="opacity-100 max-h-16"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <div v-if="installationRequested" class="flex items-center gap-1.5 mt-2.5">
                      <span class="text-[10.5px] font-semibold text-gray-400 uppercase tracking-[0.04em]">Montage:</span>
                      <label
                        class="inline-flex items-center gap-1.5 text-[12px] font-bold pl-[7px] pr-[11px] py-[5px] rounded-full border-[1.5px] cursor-pointer transition-[background,border-color,color] duration-150 select-none"
                        :class="itemInstallMap[item.id] !== false
                          ? 'bg-orange-50 border-orange-300 text-orange-700'
                          : 'bg-gray-100 border-gray-300 text-gray-500'"
                      >
                        <input
                          type="checkbox"
                          class="sr-only"
                          :checked="itemInstallMap[item.id] !== false"
                          @change="itemInstallMap[item.id] = ($event.target as HTMLInputElement).checked"
                        />
                        <span
                          class="w-[7px] h-[7px] rounded-full flex-shrink-0 transition-colors"
                          :class="itemInstallMap[item.id] !== false ? 'bg-orange-500' : 'bg-gray-400'"
                        ></span>
                        {{ itemInstallMap[item.id] !== false ? 'Wordt geïnstalleerd' : 'Wordt verzonden' }}
                      </label>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Install hero + Order Summary + Payment -->
        <div class="space-y-5">

          <!-- ─── Installation service hero card ─── -->
          <div
            class="rounded-xl overflow-hidden transition-all duration-200"
            :class="installationRequested
              ? 'border border-orange-300 shadow-[0_4px_20px_rgba(234,88,12,0.12)]'
              : 'border border-gray-200 shadow-sm'"
          >
            <!-- Top band -->
            <div
              class="px-5 py-5 transition-colors duration-200"
              :class="installationRequested ? 'bg-gradient-to-br from-orange-50 to-white' : 'bg-gray-50'"
            >
              <!-- Eyebrow -->
              <div
                class="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-widest uppercase rounded-full px-2.5 py-1 mb-4 border transition-colors duration-200"
                :class="installationRequested
                  ? 'text-orange-700 bg-orange-100 border-orange-200'
                  : 'text-gray-400 bg-transparent border-gray-200'"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-200"
                  :class="installationRequested ? 'bg-orange-500' : 'bg-gray-300'"
                ></span>
                Installatieservice
              </div>

              <!-- Main row: icon + text + toggle -->
              <div class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  :class="installationRequested ? 'bg-orange-500 shadow-md text-white' : 'bg-gray-200 text-gray-400'"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 text-[17px] leading-tight">Laat het ons installeren</h3>
                  <p class="text-sm text-gray-500 mt-1 leading-snug">Onze BMW-monteurs monteren je onderdelen vakkundig — geen gedoe.</p>
                </div>
                <!-- Toggle -->
                <label class="relative inline-block w-12 h-6 flex-shrink-0 mt-0.5 cursor-pointer">
                  <input v-model="installationRequested" type="checkbox" class="sr-only" />
                  <span
                    class="absolute inset-0 rounded-full transition-colors duration-200"
                    :class="installationRequested ? 'bg-orange-500' : 'bg-gray-300'"
                  ></span>
                  <span
                    class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                    :class="installationRequested ? 'translate-x-6' : 'translate-x-0'"
                  ></span>
                </label>
              </div>
            </div>

            <!-- Benefits list -->
            <ul
              class="px-5 py-4 flex flex-col gap-2.5 transition-all duration-200"
              :class="installationRequested
                ? 'border-t border-orange-100 bg-white'
                : 'border-t border-gray-100 bg-white opacity-40'"
            >
              <li v-for="benefit in [
                'Geen verzendkosten voor geïnstalleerde onderdelen',
                'Vakkundige montage door onze specialisten',
                'Wij bellen je om een afspraak in te plannen',
              ]" :key="benefit" class="flex items-start gap-2.5 text-sm text-gray-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                  class="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
                {{ benefit }}
              </li>
            </ul>

            <!-- Status footer -->
            <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
              <p
                class="text-[12.5px] font-semibold"
                :class="installationRequested ? 'text-orange-700' : 'text-gray-400'"
              >
                <template v-if="!installationRequested">
                  Alle producten worden verzonden — geen installatie.
                </template>
                <template v-else-if="itemsBeingInstalled.length === cartItems.length">
                  ✓ Alle {{ cartItems.length }} producten worden bij ons geïnstalleerd.
                </template>
                <template v-else-if="itemsBeingInstalled.length === 0">
                  Geen producten geselecteerd voor installatie — alles wordt verzonden.
                </template>
                <template v-else>
                  {{ itemsBeingInstalled.length }} van {{ cartItems.length }} producten wordt geïnstalleerd, de rest verzonden.
                </template>
              </p>
              <p v-if="itemsBeingInstalled.length > 0" class="text-xs text-gray-400 flex gap-1.5 items-start">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                €20,- reserveringskosten voor montage. Dit bedrag gaat af van de rekening bij montage.
              </p>
            </div>
          </div>

          <!-- ─── Order summary + payment card ─── -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <!-- Order Summary -->
            <h3 class="text-xl font-bold text-gray-900 mb-4">{{ t('checkout.orderSummary') }}</h3>

            <div class="space-y-2 mb-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('checkout.bagTotal') }}</span>
                <span class="font-medium">€{{ subtotal.toFixed(2).replace('.', ',') }}</span>
              </div>
              <!-- Reservation fee row -->
              <div v-if="reservationFee > 0" class="flex justify-between text-sm">
                <span class="text-gray-600">Reserveringskosten montage</span>
                <span class="font-medium">€{{ reservationFee.toFixed(2).replace('.', ',') }}</span>
              </div>
              <p v-if="reservationFee > 0" class="text-xs text-gray-400 -mt-1">Wordt verrekend bij montage in de winkel.</p>
              <!-- Shipping row -->
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">{{ t('checkout.deliveryFee') }}</span>
                <span class="font-medium">
                  <template v-if="!needsShipping && installationRequested">Gratis</template>
                  <template v-else>€{{ deliveryFee.toFixed(2).replace('.', ',') }}</template>
                </span>
              </div>
              <p v-if="!needsShipping && installationRequested" class="text-xs text-gray-400 -mt-1">Geen verzendkosten — alles wordt bij ons geïnstalleerd.</p>

              <!-- BTW row -->
              <div class="flex justify-between text-sm pt-1">
                <span class="text-gray-400">Waarvan BTW (21%)</span>
                <span class="text-dark">€{{ btwAmount.toFixed(2).replace('.', ',') }}</span>
              </div>

              <div class="flex justify-between text-lg font-bold text-orange-500 pt-2 border-t border-gray-100">
                <span>{{ t('checkout.orderTotal') }}</span>
                <span>€{{ orderTotal.toFixed(2).replace('.', ',') }}</span>
              </div>
            </div>

            <div class="border-t border-gray-200 my-4"></div>

            <!-- Shipping & Payment Method -->
            <div>
              <h3 class="text-lg font-medium text-gray-600 mb-5">{{ t('checkout.shippingPayment') }}</h3>

              <!-- Shipping method — only shown when some items need shipping -->
              <Transition
                enter-active-class="transition-all duration-200 ease-out overflow-hidden"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-96"
                leave-active-class="transition-all duration-150 ease-in overflow-hidden"
                leave-from-class="opacity-100 max-h-96"
                leave-to-class="opacity-0 max-h-0"
              >
                <div v-if="needsShipping" class="mb-6">
                  <h4 class="text-sm font-medium text-gray-700 mb-1">{{ t('checkout.selectShippingMethod') }}</h4>
                  <p v-if="installationRequested && itemsBeingInstalled.length > 0" class="text-xs text-gray-400 mb-3">
                    Alleen voor producten die niet geïnstalleerd worden.
                  </p>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  </div>

                  <!-- Pickup address info -->
                  <Transition
                    enter-active-class="transition-all duration-300 ease-out overflow-hidden"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-64"
                    leave-active-class="transition-all duration-200 ease-in overflow-hidden"
                    leave-from-class="opacity-100 max-h-64"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <div v-if="selectedShippingMethod === 'store'" class="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
                      <p class="text-sm font-semibold text-orange-700 mb-3">Afhaaladres</p>
                      <div class="flex gap-3 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="w-5 h-5 text-orange-500 shrink-0 mt-0.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <div class="text-sm text-gray-700 leading-relaxed">
                          Noorddammerweg 35, Unit 11<br />1424NW De Kwakel
                        </div>
                      </div>
                      <div class="flex gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="w-5 h-5 text-orange-500 shrink-0 mt-0.5">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <div class="text-sm text-gray-700 leading-relaxed space-y-0.5">
                          <div class="flex justify-between gap-6"><span>Maandag t/m vrijdag</span><span class="font-medium">09:00 – 17:00</span></div>
                          <div class="flex justify-between gap-6"><span>Zaterdag</span><span class="font-medium">10:00 – 14:00</span></div>
                          <div class="flex justify-between gap-6"><span>Zondag</span><span class="font-medium text-gray-400">Gesloten</span></div>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </Transition>

              <!-- Payment method -->
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-700 mb-3">{{ t('checkout.paymentMethod') }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button @click="selectedPaymentMethod = 'bank'" type="button"
                    class="flex items-center justify-center space-x-3 p-4 border-2 rounded-lg transition-colors"
                    :class="selectedPaymentMethod === 'bank' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'">
                    <img src="/images/ideal.png" alt="iDEAL" class="h-10 w-10 object-contain" />
                    <span class="text-sm font-medium">iDEAL</span>
                  </button>
                  <button @click="selectedPaymentMethod = 'card'" type="button"
                    class="flex items-center justify-center space-x-3 p-4 border-2 rounded-lg transition-colors"
                    :class="selectedPaymentMethod === 'card' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'">
                    <div class="flex items-center gap-1">
                      <img src="/images/mastercard.png" alt="Mastercard" class="h-7 w-auto" />
                      <img src="/images/visa.png" alt="Visa" class="h-5 w-auto" />
                    </div>
                    <span class="text-sm font-medium">{{ t('checkout.payment.card') }}</span>
                  </button>
                  <button @click="selectedPaymentMethod = 'bancontact'" type="button"
                    class="flex items-center justify-center space-x-3 p-4 border-2 rounded-lg transition-colors"
                    :class="selectedPaymentMethod === 'bancontact' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'">
                    <div class="flex items-center justify-center w-10 h-10 rounded-md bg-[#005498]">
                      <span class="text-[10px] font-bold text-white leading-none text-center">Bancon<br>tact</span>
                    </div>
                    <span class="text-sm font-medium">Bancontact</span>
                  </button>
                </div>
              </div>

              <!-- Fine print & terms -->
              <div class="mb-6">
                <p class="text-sm text-gray-600 mb-4" v-html="t('checkout.accountCreated')"></p>

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
                <p v-if="showTermsError" class="text-red-500 text-sm mt-2">{{ t('checkout.termsError') }}</p>
              </div>

              <!-- Error -->
              <div v-if="orderError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-sm text-red-600">{{ orderError }}</p>
              </div>

              <!-- Submit -->
              <button
                @click="handleOrderNow"
                :disabled="isSubmitting"
                class="w-full flex items-center justify-center p-4 border-2 hover:border-orange-500 rounded-lg transition-colors hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="text-lg font-medium text-orange-500">
                  {{ isSubmitting ? t('checkout.redirectingToPayment') : t('checkout.orderNow') }}
                </span>
              </button>
            </div>
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
  background-color: #d3ba74;
  border-color: #d3ba74;
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.terms-checkbox:focus {
  outline: 2px solid #d3ba74;
  outline-offset: 2px;
}
</style>
