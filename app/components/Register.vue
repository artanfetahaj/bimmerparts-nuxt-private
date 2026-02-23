<script setup lang="ts">
import { ref } from 'vue'
import HeaderNav from './HeaderNav.vue'
import SiteFooter from './SiteFooter.vue'
import authService from '../services/auth'
import type { ApiError } from '../services/auth'
import { useLocale } from '../stores/locale'

const emit = defineEmits<{
  navigateToHome: []
  navigateToProducts: []
  navigateToCart: []
  navigateToAbout: []
  navigateToContact: []
  navigateToWishlist: []
  navigateToAccount: []
  navigateToLogin: []
  navigateToTerms: []
  navigateToPrivacy: []
}>()

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// Form validation and state
const validationErrors = ref<Record<string, string>>({})
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const registerError = ref('')

// Locale handling
const { t } = useLocale()

// Methods
const handleHomeClick = () => {
  emit('navigateToHome')
}

const handleNavigateToProducts = () => {
  emit('navigateToProducts')
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

const handleNavigateToWishlist = () => {
  emit('navigateToWishlist')
}

const handleNavigateToAccount = () => {
  emit('navigateToAccount')
}

const handleNavigateToLogin = () => {
  emit('navigateToLogin')
}

const handleNavigateToTerms = () => {
  emit('navigateToTerms')
}

const handleNavigateToPrivacy = () => {
  emit('navigateToPrivacy')
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const validateForm = () => {
  const errors: Record<string, string> = {}
  
  // Required fields
  if (!formData.value.firstName.trim()) {
    errors.firstName = t('auth.validation.firstNameRequired')
  }
  
  if (!formData.value.lastName.trim()) {
    errors.lastName = t('auth.validation.lastNameRequired')
  }
  
  if (!formData.value.email.trim()) {
    errors.email = t('auth.validation.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.email = t('auth.validation.emailInvalid')
  }
  
  if (!formData.value.password) {
    errors.password = t('auth.validation.passwordRequired')
  } else if (formData.value.password.length < 8) {
    errors.password = t('auth.validation.passwordMinLength')
  }
  
  if (!formData.value.confirmPassword) {
    errors.confirmPassword = t('auth.validation.confirmPasswordRequired')
  } else if (formData.value.password !== formData.value.confirmPassword) {
    errors.confirmPassword = t('auth.validation.passwordsDontMatch')
  }
  
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }
  
  isLoading.value = true
  registerError.value = ''
  
  try {
    const response = await authService.register({
      first_name: formData.value.firstName,
      last_name: formData.value.lastName,
      email: formData.value.email,
      phone: formData.value.phone || undefined,
      password: formData.value.password,
      password_confirmation: formData.value.confirmPassword
    })
    
    if (response.success) {
      // Registration successful, user is automatically logged in
      window.dispatchEvent(new CustomEvent('auth-changed'))
      // Redirect to account page
      setTimeout(() => emit('navigateToAccount'), 0)
    }
  } catch (error: any) {
    const apiError = error as ApiError
    
    if (apiError.errors) {
      // Handle validation errors
      validationErrors.value = {}
      Object.keys(apiError.errors).forEach(field => {
        // Map API field names to form field names
        let formField = field
        if (field === 'first_name') formField = 'firstName'
        if (field === 'last_name') formField = 'lastName'
        
        validationErrors.value[formField] = apiError.errors![field][0]
      })
    } else {
      // Handle general error
      registerError.value = apiError.message || t('auth.registrationFailed') || 'Registration failed. Please try again.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <HeaderNav variant="solid" @navigate-to-products="handleNavigateToProducts" @navigate-to-home="handleHomeClick" @navigate-to-cart="handleNavigateToCart" @navigate-to-about="handleNavigateToAbout" @navigate-to-contact="handleNavigateToContact" @navigate-to-wishlist="handleNavigateToWishlist" @navigate-to-account="handleNavigateToAccount" />

    <!-- Main Content -->
    <div class="container mx-auto px-4 md:px-6 py-12">
      <div class="max-w-md mx-auto">
        <!-- Register Form -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('auth.registerTitle') }}</h1>
          <p class="text-gray-600 mb-6">
            {{ t('auth.hasAccount') }} 
            <button @click="handleNavigateToLogin" class="text-orange-500 hover:underline font-medium">{{ t('auth.login') }}</button>
          </p>
          
          <!-- Registration Error Message -->
          <div v-if="registerError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="text-red-600 text-sm">{{ registerError }}</p>
          </div>
          
          <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- First Name and Last Name -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.firstName') }}</label>
                <input 
                  v-model="formData.firstName"
                  @input="validationErrors.firstName = ''; registerError = ''"
                  type="text" 
                  :disabled="isLoading"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  :class="validationErrors.firstName ? 'border-red-500' : 'border-gray-300'"
                />
                <p v-if="validationErrors.firstName" class="text-red-500 text-sm mt-1">{{ validationErrors.firstName }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.lastName') }}</label>
                <input 
                  v-model="formData.lastName"
                  @input="validationErrors.lastName = ''; registerError = ''"
                  type="text" 
                  :disabled="isLoading"
                  class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  :class="validationErrors.lastName ? 'border-red-500' : 'border-gray-300'"
                />
                <p v-if="validationErrors.lastName" class="text-red-500 text-sm mt-1">{{ validationErrors.lastName }}</p>
              </div>
            </div>
            
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.email') }}</label>
              <input 
                v-model="formData.email"
                @input="validationErrors.email = ''; registerError = ''"
                type="email" 
                :disabled="isLoading"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                :class="validationErrors.email ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="validationErrors.email" class="text-red-500 text-sm mt-1">{{ validationErrors.email }}</p>
            </div>
            
            <!-- Phone (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {{ t('auth.phone') }} <span class="text-xs font-normal text-gray-500">{{ t('common.optional') }}</span>
              </label>
              <input 
                v-model="formData.phone"
                type="tel" 
                :disabled="isLoading"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.password') }}</label>
              <div class="relative">
                <input 
                  v-model="formData.password"
                  @input="validationErrors.password = ''; registerError = ''"
                  :type="showPassword ? 'text' : 'password'"
                  :disabled="isLoading"
                  class="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  :class="validationErrors.password ? 'border-red-500' : 'border-gray-300'"
                />
                <button 
                  type="button"
                  @click="togglePasswordVisibility"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <p v-if="validationErrors.password" class="text-red-500 text-sm mt-1">{{ validationErrors.password }}</p>
            </div>
            
            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.confirmPassword') }}</label>
              <div class="relative">
                <input 
                  v-model="formData.confirmPassword"
                  @input="validationErrors.confirmPassword = ''; registerError = ''"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  :disabled="isLoading"
                  class="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  :class="validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'"
                />
                <button 
                  type="button"
                  @click="toggleConfirmPasswordVisibility"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <p v-if="validationErrors.confirmPassword" class="text-red-500 text-sm mt-1">{{ validationErrors.confirmPassword }}</p>
            </div>
            
            <!-- Continue Button -->
            <button 
              type="submit"
              :disabled="isLoading"
              class="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isLoading ? t('auth.creatingAccount') : t('auth.continue') }}
            </button>
          </form>
          
          <!-- Terms and Conditions -->
          <p class="text-xs text-gray-600 mt-4 text-center">
            {{ t('auth.termsAgreement') }}
            <a href="#" @click.prevent="handleNavigateToTerms" class="text-orange-500 hover:underline cursor-pointer">{{ t('auth.terms') }}</a> 
            {{ t('auth.and') }}
            <a href="#" @click.prevent="handleNavigateToPrivacy" class="text-orange-500 hover:underline cursor-pointer">{{ t('auth.privacyPolicy') }}</a>.
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <SiteFooter @navigate-to-about="handleNavigateToAbout" @navigate-to-contact="handleNavigateToContact" @navigate-to-terms="handleNavigateToTerms" @navigate-to-privacy="handleNavigateToPrivacy" />
  </div>
</template>

<style scoped>
</style>