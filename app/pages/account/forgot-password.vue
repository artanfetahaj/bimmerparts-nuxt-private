<script setup lang="ts">
import { ref } from 'vue'
import authService from '@/services/auth'
import { useLocale } from '@/stores/locale'

const { t } = useLocale()

const email = ref('')
const isLoading = ref(false)
const emailError = ref('')
const serverError = ref('')
const submitted = ref(false)

const validate = () => {
  if (!email.value.trim()) {
    emailError.value = t('auth.validation.emailRequired')
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = t('auth.validation.emailInvalid')
    return false
  }
  emailError.value = ''
  return true
}

const handleSubmit = async () => {
  if (!validate()) return

  isLoading.value = true
  serverError.value = ''

  try {
    await authService.forgotPassword(email.value)
    submitted.value = true
  } catch (error: any) {
    serverError.value = error.message || 'Er is een fout opgetreden. Probeer het opnieuw.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 md:px-6 py-12">
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">

        <div v-if="submitted" class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">E-mail verzonden</h1>
          <p class="text-gray-600 mb-6">
            Als het e-mailadres <strong>{{ email }}</strong> bij ons bekend is, ontvangt u een resetlink.
          </p>
          <NuxtLink to="/account/login" class="text-orange-500 hover:underline font-medium text-sm">
            {{ t('auth.backToLogin') }}
          </NuxtLink>
        </div>

        <template v-else>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('auth.forgotPasswordTitle') }}</h1>
          <p class="text-gray-600 mb-6">{{ t('auth.forgotPasswordSubtitle') }}</p>

          <div v-if="serverError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="text-red-600 text-sm">{{ serverError }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.email') }}</label>
              <input
                v-model="email"
                @input="emailError = ''; serverError = ''"
                type="email"
                :disabled="isLoading"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                :class="emailError ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="emailError" class="text-red-500 text-sm mt-1">{{ emailError }}</p>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {{ isLoading ? t('auth.sendingResetLink') : t('auth.sendResetLink') }}
            </button>
          </form>

          <div class="mt-4 text-center">
            <NuxtLink to="/account/login" class="text-sm text-orange-500 hover:underline">
              {{ t('auth.backToLogin') }}
            </NuxtLink>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>
