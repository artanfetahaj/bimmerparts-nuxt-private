<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import authService from '@/services/auth'
import { useLocale } from '@/stores/locale'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t } = useLocale()

type TabKey = 'personal' | 'security' | 'orders'
const activeTab = ref<TabKey>('personal')

onMounted(async () => {
  if (!authService.isAuthenticated()) {
    router.push('/account/login')
    return
  }
  try {
    const isValid = await authService.validateSession()
    if (!isValid) {
      router.push('/account/login')
    }
  } catch (error) {
    console.error('Error validating session:', error)
    router.push('/account/login')
  }
})

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
        <!-- Sidebar -->
        <aside class="md:col-span-1">
          <div class="bg-white rounded-3xl border border-gray-200 p-4">
            <h2 class="text-sm font-semibold text-gray-700 mb-3">{{ t('account.title') }}</h2>
            <nav class="space-y-1">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="setTab(tab.key)"
                class="w-full text-left px-3 py-3 rounded-2xl text-base flex items-center gap-3 transition-colors"
                :class="activeTab === tab.key ? 'bg-gray-50 text-slate-800 border border-gray-200' : 'text-slate-700 hover:bg-gray-50 border border-transparent'"
              >
                <span class="flex items-center gap-3">
                  <img v-if="tab.key === 'personal'" src="/images/Profile Icon.svg" alt="Profile" class="h-7 w-7" />
                  <img v-else-if="tab.key === 'security'" src="/images/Security.svg" alt="Security" class="h-7 w-7" />
                  <img v-else src="/images/Order.svg" alt="Orders" class="h-7 w-7" />
                  <span class="text-xl font-semibold">{{ tab.label }}</span>
                </span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Content -->
        <section class="md:col-span-3">
          <div v-if="activeTab === 'personal'"><PersonalInformation /></div>
          <div v-else-if="activeTab === 'security'"><Security /></div>
          <div v-else><Orders /></div>
        </section>
      </div>
    </div>
  </div>
</template>
