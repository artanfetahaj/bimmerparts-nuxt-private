<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import authService from '../../services/auth'
import { useLocale } from '../../stores/locale'

const { t } = useLocale()

const isLoading = ref(false)
const saveError = ref('')
const saveSuccess = ref('')

const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  country: '',
  birthday: '',
  gender: '' as '' | 'male' | 'female'
})

// Helper function to format date from API (Y-m-d) to input format (DD/MM/YYYY)
const formatDateForInput = (dateString: string): string => {
  if (!dateString) return ''
  try {
    // Handle YYYY-MM-DD format from API
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const parts = dateString.split('-')
      const year = parts[0]
      const month = parts[1]
      const day = parts[2]
      // Return in DD/MM/YYYY format (Dutch format)
      return `${day}/${month}/${year}`
    }
    
    // Try parsing as Date object if format is different
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
    
    return dateString
  } catch {
    return dateString
  }
}

// Handle date input to auto-format as user types (DD/MM/YYYY)
const handleDateInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '') // Remove non-digits
  
  // Format as DD/MM/YYYY
  if (value.length >= 3) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  if (value.length >= 6) {
    value = value.slice(0, 5) + '/' + value.slice(5, 9)
  }
  
  form.value.birthday = value
}

// Helper function to convert input date format (DD/MM/YYYY) to API format (Y-m-d)
const formatDateForAPI = (dateString: string): string | null => {
  if (!dateString || !dateString.trim()) return null
  try {
    // Handle DD/MM/YYYY format (Dutch format: day/month/year)
    const parts = dateString.split('/')
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0')
      const month = parts[1].padStart(2, '0')
      const year = parts[2]
      
      // Validate the date
      const dayNum = parseInt(day, 10)
      const monthNum = parseInt(month, 10)
      const yearNum = parseInt(year, 10)
      
      // Check if date is valid
      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
        console.warn('Invalid date values:', { day, month, year })
        return null
      }
      
      // Return in YYYY-MM-DD format (database format)
      return `${year}-${month}-${day}`
    }
    
    // If already in Y-m-d format, validate and return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString
    }
    
    console.warn('Date format not recognized:', dateString)
    return null
  } catch (error) {
    console.error('Error formatting date for API:', error)
    return null
  }
}

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  try {
    isLoading.value = true
    saveError.value = '' // Clear any previous errors
    
    // Check if user is authenticated before making request
    if (!authService.isAuthenticated()) {
      saveError.value = t('account.notAuthenticated')
      console.error('❌ User not authenticated, cannot load profile')
      return
    }
    
    const profile = await authService.getProfile()
    // Load all profile data including address fields
    form.value.first_name = profile.first_name || ''
    form.value.last_name = profile.last_name || ''
    form.value.email = profile.email || ''
    form.value.phone = (profile as any).phone || ''
    form.value.birthday = (profile as any).date_of_birth ? formatDateForInput((profile as any).date_of_birth) : ''
    form.value.gender = (profile as any).gender || ''
    form.value.address = (profile as any).address || ''
    form.value.city = (profile as any).city || ''
    form.value.state = (profile as any).state || ''
    form.value.zip_code = (profile as any).zip_code || ''
    form.value.country = (profile as any).country || ''
    
    console.log('✅ Profile loaded successfully:', { 
      first_name: form.value.first_name, 
      email: form.value.email 
    })
  } catch (e: any) {
    console.error('❌ Failed to load profile:', e)
    const errorMessage = e?.response?.data?.message || e?.message || 'Failed to load profile'
    saveError.value = errorMessage
    
    // If 401, the interceptor will handle clearing auth, but show user-friendly message
    if (e?.response?.status === 401) {
      saveError.value = t('account.sessionExpired')
    }
  } finally {
    isLoading.value = false
  }
}

// Refresh when auth changes (e.g., after login)
const handleAuthChanged = () => {
  if (authService.isAuthenticated()) {
    loadProfile()
  }
}
onMounted(() => {
  window.addEventListener('auth-changed', handleAuthChanged as EventListener)
})
onBeforeUnmount(() => {
  window.removeEventListener('auth-changed', handleAuthChanged as EventListener)
})

const save = async () => {
  saveError.value = ''
  saveSuccess.value = ''
  
  // Check if user is authenticated before making request
  if (!authService.isAuthenticated()) {
    saveError.value = t('account.notAuthenticated')
    return
  }
  
  try {
    isLoading.value = true
    console.log('💾 Saving profile with data:', {
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      email: form.value.email,
      birthday: form.value.birthday,
      gender: form.value.gender
    })
    
    await authService.updateProfile({
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      phone: form.value.phone,
      date_of_birth: formatDateForAPI(form.value.birthday),
      gender: form.value.gender || null,
      address: form.value.address,
      city: form.value.city,
      state: form.value.state,
      zip_code: form.value.zip_code,
      country: form.value.country
    })
    saveSuccess.value = t('account.changesSaved')
    console.log('✅ Profile saved successfully')
    
    // Reload profile to get updated data
    await loadProfile()
  } catch (e: any) {
    console.error('❌ Failed to save profile:', e)
    const errorMessage = e?.response?.data?.message || e?.message || t('account.saveError')
    saveError.value = errorMessage
    
    // If 401, show user-friendly message
    if (e?.response?.status === 401) {
      saveError.value = t('account.sessionExpired')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <h1 class="text-lg font-semibold text-gray-900 mb-6">{{ t('account.personalInfo') }}</h1>

    <div v-if="saveError" class="mb-4 text-sm text-red-600">{{ saveError }}</div>
    <div v-if="saveSuccess" class="mb-4 text-sm text-green-600">{{ saveSuccess }}</div>

    <!-- Login Credentials Section -->
    <div class="mb-8 pb-6 border-b border-gray-200">
      <h2 class="text-base font-semibold text-gray-900 mb-4">{{ t('account.loginCredentials') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.firstName') }}</label>
          <div class="w-full h-10 px-0 border-0 border-b border-gray-200 flex items-center">
            <span class="text-gray-900 text-sm">{{ form.first_name || t('account.notSet') }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ t('account.firstNameHint') }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.email') }}</label>
          <div class="w-full h-10 px-0 border-0 border-b border-gray-200 flex items-center">
            <span class="text-gray-900 text-sm">{{ form.email || t('account.notSet') }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ t('account.emailDisplayHint') }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.password') }}</label>
          <div class="w-full h-10 px-0 border-0 border-b border-gray-200 flex items-center">
            <span class="text-gray-500 text-sm">••••••••</span>
            <span class="ml-auto text-xs text-gray-500">{{ t('account.passwordHint') }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ t('account.changePasswordHint') }}</p>
        </div>
      </div>
    </div>

    <!-- Personal Details Section -->
    <div>
      <h2 class="text-base font-semibold text-gray-900 mb-4">{{ t('account.personalDetails') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.firstName') }}</label>
          <input 
            v-model="form.first_name" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.enterFirstName')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.lastName') }}</label>
          <input 
            v-model="form.last_name" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.enterLastName')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.phone') }}</label>
          <input 
            v-model="form.phone" 
            type="tel" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.enterPhone')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.birthday') }}</label>
          <input 
            :value="form.birthday"
            type="text"
            :placeholder="t('account.birthdayPlaceholder')" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            @input="handleDateInput"
            maxlength="10"
            pattern="\d{2}/\d{2}/\d{4}"
          />
          <p class="text-xs text-gray-500 mt-1">Format: DD/MM/YYYY (bijv. 03/06/2000)</p>
        </div>
      </div>

      <div class="mt-6 flex items-center gap-6">
        <label class="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="radio" value="male" v-model="form.gender" />
          <span>{{ t('account.genderMale') }}</span>
        </label>
        <label class="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="radio" value="female" v-model="form.gender" />
          <span>{{ t('account.genderFemale') }}</span>
        </label>
      </div>
    </div>

    <!-- Address Section -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <h2 class="text-base font-semibold text-gray-900 mb-4">{{ t('account.address') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.streetAddress') }}</label>
          <input 
            v-model="form.address" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.enterAddress')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.city') }}</label>
          <input 
            v-model="form.city" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.enterCity')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.state') }}</label>
          <input 
            v-model="form.state" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.enterState')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.postalCode') }}</label>
          <input 
            v-model="form.zip_code" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.enterPostalCode')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.country') }}</label>
          <input 
            v-model="form.country" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.enterCountry')"
          />
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-2">{{ t('account.addressHint') }}</p>
    </div>

    <div class="mt-8">
      <button @click="save" :disabled="isLoading" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium">
        {{ isLoading ? t('account.saving') : t('common.save') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>


