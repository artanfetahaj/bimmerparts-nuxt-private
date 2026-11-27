<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import authService from '@/services/auth'
import { useLocale } from '@/stores/locale'
import { User, ShieldCheck, ShoppingBag, LogOut } from 'lucide-vue-next'
import PersonalInformation from '@/components/account/PersonalInformation.vue'
import Security from '@/components/account/Security.vue'
import Orders from '@/components/account/Orders.vue'

definePageMeta({ middleware: 'auth' })

const { t } = useLocale()

type TabKey = 'personal' | 'security' | 'orders'
const activeTab = ref<TabKey>('personal')

// Validate token freshness after mount; kick out if expired
onMounted(async () => {
  const isValid = await authService.validateSession().catch(() => false)
  if (!isValid) navigateTo('/account/login')
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

const showLogoutDialog = ref(false)

const confirmLogout = async () => {
  showLogoutDialog.value = false
  await authService.logout()
  navigateTo('/account/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 md:px-6 py-10 md:py-15">

      <!-- Mobile tab bar -->
      <div class="md:hidden bg-white rounded-2xl border border-gray-200 p-1.5 flex gap-1 mb-4">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="setTab(tab.key)"
          class="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          :class="activeTab === tab.key ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-gray-50'"
        >
          <User v-if="tab.key === 'personal'" class="h-4 w-4 shrink-0" />
          <ShieldCheck v-else-if="tab.key === 'security'" class="h-4 w-4 shrink-0" />
          <ShoppingBag v-else class="h-4 w-4 shrink-0" />
          <span class="hidden sm:inline truncate">{{ tab.label }}</span>
        </button>
        <button
          @click="showLogoutDialog = true"
          class="flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          :aria-label="t('account.logout')"
        >
          <LogOut class="h-4 w-4 shrink-0" />
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Sidebar (desktop) -->
        <aside class="hidden md:block md:col-span-1">
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
                <span class="flex items-center gap-3 min-w-0">
                  <User v-if="tab.key === 'personal'" class="h-5 w-5 text-gray-500 shrink-0" />
                  <ShieldCheck v-else-if="tab.key === 'security'" class="h-5 w-5 text-gray-500 shrink-0" />
                  <ShoppingBag v-else class="h-5 w-5 text-gray-500 shrink-0" />
                  <span class="text-sm font-semibold truncate">{{ tab.label }}</span>
                </span>
              </button>
            </nav>
            <div class="mt-4 pt-4 border-t border-gray-100">
              <button
                @click="showLogoutDialog = true"
                class="w-full text-left px-3 py-3 rounded-2xl text-base flex items-center gap-3 text-red-500 hover:bg-red-50 border border-transparent transition-colors"
              >
                <LogOut class="h-5 w-5" />
                <span class="text-sm font-semibold truncate">{{ t('account.logout') }}</span>
              </button>
            </div>
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

    <!-- Logout confirmation dialog -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showLogoutDialog"
          class="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm"
          @click.self="showLogoutDialog = false"
        >
          <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ t('account.logoutConfirmTitle') }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ t('account.logoutConfirmMessage') }}</p>
            <div class="flex gap-3">
              <button
                @click="showLogoutDialog = false"
                class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {{ t('common.cancel') }}
              </button>
              <button
                @click="confirmLogout"
                class="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                {{ t('account.logout') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
