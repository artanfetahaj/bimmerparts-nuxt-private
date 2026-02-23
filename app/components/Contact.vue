<script setup lang="ts">
import { ref, computed } from 'vue'
import HeaderNav from './HeaderNav.vue'
import SiteFooter from './SiteFooter.vue'
import { useLocale } from '../stores/locale'
import { submitContactForm } from '../services/contact'

const emit = defineEmits<{
  navigateToHome: []
  navigateToProducts: []
  navigateToProduct: [productId: string]
  navigateToCart: []
  navigateToAbout: []
  navigateToContact: []
  navigateToPrivacy: []
  navigateToTerms: []
  navigateToWishlist: []
  navigateToAccount: []
  navigateToContactThanks: []
}>()

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: ''
})

const acceptPrivacy = ref(false)

// Locale handling
const { t } = useLocale()

// Validation state
const validationErrors = ref<Record<string, string>>({})

// Required fields
const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'message']

// Computed property to check if form is valid for submission
const isFormValid = computed(() => {
  // Check if all required fields are filled
  const allFieldsFilled = requiredFields.every(field => {
    const value = formData.value[field as keyof typeof formData.value]
    return value && value.trim() !== ''
  })
  
  // Check if privacy checkbox is checked
  return allFieldsFilled && acceptPrivacy.value
})

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

const handleNavigateToPrivacy = () => {
  emit('navigateToPrivacy')
}

const handleNavigateToTerms = () => {
  emit('navigateToTerms')
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
      errors[field] = t('contact.fieldRequired')
    }
  })
  
  // Email validation
  if (formData.value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.email = t('contact.validEmail')
  }
  
  // Privacy policy validation
  if (!acceptPrivacy.value) {
    errors.privacy = t('contact.agreePrivacy')
  }
  
  validationErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  try {
    // Submit form to API using the contact service
    await submitContactForm({
      first_name: formData.value.firstName,
      last_name: formData.value.lastName,
      email: formData.value.email,
      phone: formData.value.phone,
      message: formData.value.message,
      subject: 'Contact Form Submission',
    })
    
    // Reset form
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: ''
    }
    acceptPrivacy.value = false
    validationErrors.value = {}
    
    // Navigate to thank you
    emit('navigateToContactThanks')
  } catch (error: any) {
    console.error('Error submitting contact form:', error)
    validationErrors.value = {
      message: error.response?.data?.message || t('contact.submissionError') || 'Failed to submit contact form. Please try again.'
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-16">
      <!-- Contact Title -->
      <div class="text-center mb-16">
        <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          {{ t('contact.title') }}
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          {{ t('contact.subtitle') }}
        </p>
      </div>

      <!-- Contact Form and Info -->
      <div class="mb-16">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <!-- Left Column - Contact Form -->
          <div class="border border-gray-200 rounded-lg p-6 h-full flex flex-col">
            <h2 class="text-2xl font-bold text-gray-900 mb-8">{{ t('contact.getInTouch') }}</h2>
            
            <form @submit.prevent="handleSubmit" class="space-y-6 flex-1 flex flex-col">
              <!-- Name Fields -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('contact.firstName') }} <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="formData.firstName"
                    @input="validationErrors.firstName = ''"
                    type="text" 
                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    :class="validationErrors.firstName ? 'border-red-500' : 'border-gray-300'"
                  />
                  <p v-if="validationErrors.firstName" class="text-red-500 text-sm mt-1">{{ validationErrors.firstName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    {{ t('contact.lastName') }} <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="formData.lastName"
                    @input="validationErrors.lastName = ''"
                    type="text" 
                    class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    :class="validationErrors.lastName ? 'border-red-500' : 'border-gray-300'"
                  />
                  <p v-if="validationErrors.lastName" class="text-red-500 text-sm mt-1">{{ validationErrors.lastName }}</p>
                </div>
              </div>
              
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="formData.email"
                  @input="validationErrors.email = ''"
                  type="email" 
                  class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  :class="validationErrors.email ? 'border-red-500' : 'border-gray-300'"
                />
                <p v-if="validationErrors.email" class="text-red-500 text-sm mt-1">{{ validationErrors.email }}</p>
              </div>
              
              <!-- Phone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('contact.phoneNumber') }} <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="formData.phone"
                  @input="validationErrors.phone = ''"
                  type="tel" 
                  class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  :class="validationErrors.phone ? 'border-red-500' : 'border-gray-300'"
                />
                <p v-if="validationErrors.phone" class="text-red-500 text-sm mt-1">{{ validationErrors.phone }}</p>
              </div>
              
              <!-- Message -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ t('contact.message') }} <span class="text-red-500">*</span>
                </label>
                <textarea 
                  v-model="formData.message"
                  @input="validationErrors.message = ''"
                  rows="4"
                  :placeholder="t('contact.messagePlaceholder')"
                  class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  :class="validationErrors.message ? 'border-red-500' : 'border-gray-300'"
                ></textarea>
                <p v-if="validationErrors.message" class="text-red-500 text-sm mt-1">{{ validationErrors.message }}</p>
              </div>
              
              <!-- Privacy Policy -->
              <div 
                class="p-4 rounded-lg border-2 transition-colors"
                :class="validationErrors.privacy ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'"
              >
                <label class="flex items-start space-x-3 cursor-pointer">
                  <input 
                    v-model="acceptPrivacy"
                    @change="validationErrors.privacy = ''"
                    type="checkbox" 
                    class="mt-1 w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                  />
                  <span class="text-sm text-gray-700 font-medium">
                    {{ t('contact.privacyAgreement') }} 
                    <a href="#" @click.prevent="handleNavigateToPrivacy" class="text-orange-500 hover:underline cursor-pointer font-semibold">{{ t('contact.privacyPolicy') }}</a> {{ t('contact.and') }} 
                    <a href="#" @click.prevent="handleNavigateToTerms" class="text-orange-500 hover:underline cursor-pointer font-semibold">{{ t('contact.termsAndConditions') }}</a>. <span class="text-red-500">*</span>
                  </span>
                </label>
                <p v-if="validationErrors.privacy" class="text-red-500 text-sm mt-2 ml-8 font-medium">{{ validationErrors.privacy }}</p>
              </div>
              
              <!-- Submit Button -->
              <button 
                type="submit"
                :disabled="!acceptPrivacy"
                class="w-full py-4 px-6 rounded-lg font-medium transition-all text-lg mt-auto"
                :class="acceptPrivacy 
                  ? 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'"
              >
                {{ t('contact.sendMessage') }}
              </button>
            </form>
          </div>

          <!-- Right Column - Contact Information Cards -->
          <div class="space-y-6 h-full flex flex-col">
            <!-- Email Card 1 -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex-1">
              <div class="flex flex-col items-start text-left h-full">
                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shadow-sm p-2 mb-4">
                  <img src="/images/Featured icon.png" alt="Email" class="w-8 h-8 object-contain" />
                </div>
                <div class="flex-1 flex flex-col">
                  <h3 class="text-lg font-bold text-gray-900 mb-1">info@ipsum.com</h3>
                  <p class="text-orange-500 font-medium mb-2">{{ t('contact.generalSupport') }}</p>
                  <p class="text-gray-600 text-base leading-relaxed flex-1">
                    {{ t('contact.supportDescription') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Email Card 2 -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex-1">
              <div class="flex flex-col items-start text-left h-full">
                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shadow-sm p-2 mb-4">
                  <img src="/images/Featured icon.png" alt="Email" class="w-8 h-8 object-contain" />
                </div>
                <div class="flex-1 flex flex-col">
                  <h3 class="text-lg font-bold text-gray-900 mb-1">info@ipsum.com</h3>
                  <p class="text-orange-500 font-medium mb-2">{{ t('contact.generalSupport') }}</p>
                  <p class="text-gray-600 text-base leading-relaxed flex-1">
                    {{ t('contact.supportDescription') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Phone Card -->
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex-1">
              <div class="flex flex-col items-start text-left h-full">
                <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shadow-sm p-2 mb-4">
                  <img src="/images/call.png" alt="Phone" class="w-8 h-8 object-contain" />
                </div>
                <div class="flex-1 flex flex-col">
                  <h3 class="text-lg font-bold text-gray-900 mb-1">+383 49 884 555</h3>
                  <p class="text-orange-500 font-medium mb-2">{{ t('contact.anythingElse') }}</p>
                  <p class="text-gray-600 text-base leading-relaxed flex-1">
                    {{ t('contact.supportDescription') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Section -->
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="h-96">
          <iframe 
            src="https://www.google.com/maps?q=Noorddammerweg+35,+Unit+11,+1424NW+De+Kwakel,+Netherlands&output=embed"
            width="100%" 
            height="100%" 
            style="border:0;" 
            allowfullscreen
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade"
            class="rounded-2xl"
          ></iframe>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <SiteFooter @navigate-to-about="handleNavigateToAbout" @navigate-to-contact="handleNavigateToContact" @navigate-to-terms="handleNavigateToTerms" @navigate-to-privacy="handleNavigateToPrivacy" />
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
