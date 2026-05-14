<script setup lang="ts">
import { ref, onMounted } from 'vue'
import authService from '@/services/auth'
import { useLocale } from '@/stores/locale'

const { t } = useLocale()
const route = useRoute()

const token = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})
const serverError = ref('')
const success = ref(false)
const linkInvalid = ref(false)

onMounted(() => {
  token.value = String(route.query.token ?? '')
  email.value = String(route.query.email ?? '')

  if (!token.value || !email.value) {
    linkInvalid.value = true
  }
})

const validate = () => {
  const e: Record<string, string> = {}
  if (!password.value) e.password = t('auth.validation.passwordRequired')
  else if (password.value.length < 8) e.password = t('auth.validation.passwordMinLength')
  if (!passwordConfirmation.value) e.passwordConfirmation = t('auth.validation.confirmPasswordRequired')
  else if (password.value !== passwordConfirmation.value) e.passwordConfirmation = t('auth.validation.passwordsDontMatch')
  errors.value = e
  return Object.keys(e).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return

  isLoading.value = true
  serverError.value = ''

  try {
    await authService.resetPassword({
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    success.value = true
  } catch (error: any) {
    if (error.errors) {
      Object.keys(error.errors).forEach(field => {
        errors.value[field] = error.errors[field][0]
      })
    } else {
      serverError.value = error.message || t('auth.invalidResetLink')
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 md:px-6 py-12">
    <div class="max-w-md mx-auto">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">

        <!-- Invalid link -->
        <div v-if="linkInvalid" class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Ongeldige link</h1>
          <p class="text-gray-600 mb-6">{{ t('auth.invalidResetLink') }}</p>
          <NuxtLink to="/account/forgot-password" class="text-orange-500 hover:underline font-medium text-sm">
            Nieuwe resetlink aanvragen
          </NuxtLink>
        </div>

        <!-- Success -->
        <div v-else-if="success" class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">Wachtwoord gewijzigd</h1>
          <p class="text-gray-600 mb-6">{{ t('auth.resetSuccess') }}</p>
          <NuxtLink to="/account/login" class="bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 transition-colors inline-block">
            {{ t('auth.login') }}
          </NuxtLink>
        </div>

        <!-- Form -->
        <template v-else>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('auth.resetPasswordTitle') }}</h1>
          <p class="text-gray-600 mb-6">{{ t('auth.resetPasswordSubtitle') }}</p>

          <div v-if="serverError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="text-red-600 text-sm">{{ serverError }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.newPassword') }}</label>
              <div class="relative">
                <input
                  v-model="password"
                  @input="errors.password = ''"
                  :type="showPassword ? 'text' : 'password'"
                  :disabled="isLoading"
                  class="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  :class="errors.password ? 'border-red-500' : 'border-gray-300'"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.confirmNewPassword') }}</label>
              <input
                v-model="passwordConfirmation"
                @input="errors.passwordConfirmation = ''"
                :type="showPassword ? 'text' : 'password'"
                :disabled="isLoading"
                class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                :class="errors.passwordConfirmation ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="errors.passwordConfirmation" class="text-red-500 text-sm mt-1">{{ errors.passwordConfirmation }}</p>
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
              {{ isLoading ? t('auth.resettingPassword') : t('auth.resetPassword') }}
            </button>
          </form>
        </template>

      </div>
    </div>
  </div>
</template>
