<script setup lang="ts">
import { ref, onMounted } from 'vue'
import authService from '../../services/auth'
import { useLocale } from '../../stores/locale'

const { t } = useLocale()

const isLoading = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  current_password: '',
  new_password: '',
  confirm_password: ''
})

const customerEmail = ref('')

onMounted(async () => {
  try {
    const customer = authService.getCurrentCustomer()
    if (customer?.email) {
      customerEmail.value = customer.email
    } else {
      // Fetch fresh profile if not in localStorage
      const profile = await authService.getProfile()
      customerEmail.value = profile.email || ''
    }
  } catch (e) {
    console.error('Failed to load customer email:', e)
  }
})

const saveChanges = async () => {
  error.value = ''
  success.value = ''
  
  // Validate password match
  if (form.value.new_password && form.value.new_password !== form.value.confirm_password) {
    error.value = t('auth.validation.passwordsDontMatch')
    return
  }

  // Validate password length
  if (form.value.new_password && form.value.new_password.length < 8) {
    error.value = t('auth.validation.passwordMinLength')
    return
  }

  try {
    isLoading.value = true

    // Change password if all fields provided
    if (form.value.current_password && form.value.new_password && form.value.confirm_password) {
      await authService.changePassword({
        current_password: form.value.current_password,
        password: form.value.new_password,
        password_confirmation: form.value.confirm_password
      })
      success.value = t('account.passwordChanged')
      form.value.current_password = ''
      form.value.new_password = ''
      form.value.confirm_password = ''
    } else if (form.value.current_password || form.value.new_password || form.value.confirm_password) {
      error.value = t('account.passwordFieldsRequired')
    } else {
      error.value = t('account.noChanges')
    }
  } catch (e: any) {
    error.value = e?.message || t('account.passwordChangeError')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-6">
    <h1 class="text-lg font-semibold text-gray-900 mb-6">{{ t('account.security') }}</h1>

    <div v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</div>
    <div v-if="success" class="mb-4 text-sm text-green-600">{{ success }}</div>

    <!-- Login Credentials Display -->
    <div class="mb-8 pb-6 border-b border-gray-200">
      <h2 class="text-base font-semibold text-gray-900 mb-4">{{ t('account.currentCredentials') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.email') }}</label>
          <div class="w-full h-10 px-0 border-0 border-b border-gray-200 flex items-center">
            <span class="text-gray-900">{{ customerEmail || t('account.loading') }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ t('account.emailChangeHint') }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.password') }}</label>
          <div class="w-full h-10 px-0 border-0 border-b border-gray-200 flex items-center">
            <span class="text-gray-500">••••••••</span>
            <span class="ml-auto text-xs text-gray-500">{{ t('account.passwordHidden') }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-1">{{ t('account.changePasswordBelow') }}</p>
        </div>
      </div>
    </div>

    <!-- Change Password Section -->
    <div>
      <h2 class="text-base font-semibold text-gray-900 mb-4">{{ t('account.changePassword') }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.currentPassword') }}</label>
          <input 
            v-model="form.current_password" 
            type="password" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.enterCurrentPassword')"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.newPassword') }}</label>
          <input 
            v-model="form.new_password" 
            type="password" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.enterNewPassword')"
          />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.confirmPassword') }}</label>
          <input 
            v-model="form.confirm_password" 
            type="password" 
            :disabled="isLoading" 
            class="w-full h-10 px-0 border-0 border-b border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-0 bg-transparent" 
            :placeholder="t('account.confirmNewPassword')"
          />
        </div>
      </div>
      <p class="text-xs text-gray-500 mt-4">{{ t('account.passwordRequirements') }}</p>
    </div>

    <div class="mt-8">
      <button @click="saveChanges" :disabled="isLoading" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium">
        {{ isLoading ? t('account.saving') : t('common.save') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>


