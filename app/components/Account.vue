<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import HeaderNav from './HeaderNav.vue'
import SiteFooter from './SiteFooter.vue'
import PersonalInformation from './account/PersonalInformation.vue'
import Security from './account/Security.vue'
import Orders from './account/Orders.vue'
import authService from '../services/auth'
import { useLocale } from '../stores/locale'

const emit = defineEmits<{
  navigateToHome: []
  navigateToProducts: []
  navigateToCart: []
  navigateToAbout: []
  navigateToContact: []
  navigateToWishlist: []
  navigateToLogin: []
  navigateToTerms: []
  navigateToPrivacy: []
}>()

// Locale handling
const { t } = useLocale()

type TabKey = 'personal' | 'security' | 'orders'
const activeTab = ref<TabKey>('personal')

onMounted(async () => {
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    emit('navigateToLogin')
    return
  }
  
  // Validate session to ensure token is still valid
  try {
    const isValid = await authService.validateSession()
    if (!isValid) {
      console.warn('⚠️ Session validation failed, redirecting to login')
      emit('navigateToLogin')
    }
  } catch (error) {
    console.error('❌ Error validating session:', error)
    emit('navigateToLogin')
  }
})

const handleNavigateToProducts = () => emit('navigateToProducts')
const handleNavigateToHome = () => emit('navigateToHome')
const handleNavigateToCart = () => emit('navigateToCart')
const handleNavigateToAbout = () => emit('navigateToAbout')
const handleNavigateToContact = () => emit('navigateToContact')
const handleNavigateToWishlist = () => emit('navigateToWishlist')
const handleNavigateToTerms = () => emit('navigateToTerms')
const handleNavigateToPrivacy = () => emit('navigateToPrivacy')

const tabs = computed<{ key: TabKey; label: string }[]>(() => [
  { key: 'personal', label: t('account.personalInfo') },
  { key: 'security', label: t('account.security') },
  { key: 'orders', label: t('account.orders') }
])

const setTab = (key: TabKey) => {
  activeTab.value = key
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 md:px-6 py-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Left: Sidebar -->
        <aside class="md:col-span-1">
          <div class="bg-white rounded-3xl border border-gray-200 p-4">
            <h2 class="text-sm font-semibold text-gray-700 mb-3">{{ t('account.title') }}</h2>
            <nav class="space-y-1">
              <button
                v-for="t in tabs"
                :key="t.key"
                @click="setTab(t.key)"
                class="w-full text-left px-3 py-3 rounded-2xl text-base flex items-center gap-3 transition-colors"
                :class="activeTab === t.key ? 'bg-gray-50 text-slate-800 border border-gray-200' : 'text-slate-700 hover:bg-gray-50 border border-transparent'"
              >
                <span class="flex items-center gap-3">
                  <!-- Profile Icon -->
                  <img v-if="t.key === 'personal'" src="/images/Profile Icon.svg" alt="Profile" class="h-7 w-7" />
                  <!-- Security Icon -->
                  <img v-else-if="t.key === 'security'" src="/images/Security.svg" alt="Security" class="h-7 w-7" />
                  <!-- Orders Icon -->
                  <img v-else src="/images/Order.svg" alt="Orders" class="h-7 w-7" />
                  <span class="text-xl font-semibold">{{ t.label }}</span>
                </span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Right: Content -->
        <section class="md:col-span-3">
          <div v-if="activeTab === 'personal'">
            <PersonalInformation />
          </div>
          <div v-else-if="activeTab === 'security'">
            <Security />
          </div>
          <div v-else>
            <Orders />
          </div>
        </section>
      </div>
    </div>

    <SiteFooter @navigate-to-about="handleNavigateToAbout" @navigate-to-contact="handleNavigateToContact" @navigate-to-terms="handleNavigateToTerms" @navigate-to-privacy="handleNavigateToPrivacy" />
  </div>
  
</template>

<style scoped>
</style>


