<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Loader2, AlertCircle } from 'lucide-vue-next'
import { CarVariant } from '@/models/CarVariant'
import { useCarVariantStore } from '@/stores/car-variant.store'
import { useRouter } from 'vue-router'

// ─── Props ────────────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  theme?: 'dark' | 'light'
}>(), {
  theme: 'dark',
})

const emit = defineEmits<{
  (e: 'success', variant: CarVariant): void
  (e: 'error', message: string): void
}>()

// ─── State ────────────────────────────────────────────────────────────────────

const store  = useCarVariantStore()
const router = useRouter()
const route  = useRoute()

const vinNumber = ref('')
const loading   = ref(false)
const error     = ref<string | null>(null)

// ─── Formatting ───────────────────────────────────────────────────────────────

function onInput() {
  vinNumber.value = vinNumber.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 17)
  error.value = null
}

const isValid = computed(() => vinNumber.value.length === 17)

// ─── Lookup ───────────────────────────────────────────────────────────────────

async function handleSearch() {
  if (!isValid.value || loading.value) return
  error.value = null
  loading.value = true
  try {
    const variant = await new CarVariant().lookupCarVariant({ vin_number: vinNumber.value })
    store.setVariant(variant)
    router.push({ path: '/products', query: { car: variant.id } })
    emit('success', variant)
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? 'Chassisnummer niet gevonden. Controleer uw invoer.'
    error.value = msg
    emit('error', msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <!-- VIN input -->
    <div
      class="flex w-full h-[64px] rounded-lg overflow-hidden border transition-colors"
      :class="[
        { 'opacity-50 pointer-events-none': loading },
        theme === 'dark'
          ? 'border-white/25 bg-white/10 focus-within:border-white/55'
          : 'border-gray-300 bg-white focus-within:border-gray-400',
      ]"
    >
      <input
        v-model="vinNumber"
        type="text"
        placeholder="WBA3A5G50ENP26705"
        maxlength="17"
        :disabled="loading"
        class="flex-1 h-full bg-transparent pl-4 pr-2 text-[12px] font-mono font-bold tracking-widest focus:outline-none disabled:cursor-not-allowed uppercase"
        :class="theme === 'dark' ? 'text-white placeholder-white/25' : 'text-gray-900 placeholder-gray-400'"
        @input="onInput"
        @keyup.enter="handleSearch"
      />

      <!-- Character counter -->
      <span
        class="self-center pr-2 text-[10px] font-mono tabular-nums shrink-0 select-none"
        :class="theme === 'dark' ? 'text-white/30' : 'text-gray-400'"
      >
        {{ vinNumber.length }}/17
      </span>

      <!-- Search button -->
      <button
        :disabled="!isValid || loading"
        class="w-[44px] shrink-0 flex items-center justify-center border-l transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :class="theme === 'dark'
          ? 'bg-white/10 hover:bg-white/20 border-white/20'
          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'"
        aria-label="Zoeken op chassisnummer"
        @click="handleSearch"
      >
        <Loader2 v-if="loading" class="h-4 w-4 animate-spin"
          :class="theme === 'dark' ? 'text-white' : 'text-gray-600'" />
        <Search v-else class="h-4 w-4"
          :class="theme === 'dark' ? 'text-white' : 'text-gray-600'" />
      </button>
    </div>

    <!-- Status messages -->
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div v-if="loading" class="flex items-center gap-2 text-xs"
        :class="theme === 'dark' ? 'text-white/70' : 'text-gray-500'">
        <Loader2 class="h-3 w-3 animate-spin shrink-0" />
        <span>Chassisnummer opzoeken…</span>
      </div>
      <div v-else-if="error" class="flex items-center gap-1.5 text-xs"
        :class="theme === 'dark' ? 'text-red-300' : 'text-red-500'">
        <AlertCircle class="h-3.5 w-3.5 shrink-0" />
        <span>{{ error }}</span>
      </div>
    </Transition>
  </div>
</template>
