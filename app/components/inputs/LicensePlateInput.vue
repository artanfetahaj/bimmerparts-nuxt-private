<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Loader2, AlertCircle } from 'lucide-vue-next'
import { CarVariant } from '@/models/CarVariant'
import { useCarVariantStore } from '@/stores/car-variant.store'
import { useRouter } from 'vue-router'

// ─── Props ────────────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  /** Override input & button colors for dark backgrounds (default: dark/plate style) */
  theme?: 'dark' | 'light'
}>(), {
  theme: 'dark',
})

const emit = defineEmits<{
  /** Emitted after a successful lookup — variant is already set in the store */
  (e: 'success', variant: CarVariant): void
  (e: 'error', message: string): void
}>()

// ─── State ────────────────────────────────────────────────────────────────────

const store  = useCarVariantStore()
const router = useRouter()
const route  = useRoute()

const licensePlate = ref('')
const loading      = ref(false)
const error        = ref<string | null>(null)

// ─── Formatting ───────────────────────────────────────────────────────────────

function format(value: string): string {
  const raw = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)
  if (raw.length <= 2) return raw
  if (raw.length <= 4) return `${raw.slice(0, 2)}-${raw.slice(2)}`
  if (raw.length <= 6) return `${raw.slice(0, 2)}-${raw.slice(2, 4)}-${raw.slice(4)}`
  return `${raw.slice(0, 2)}-${raw.slice(2, 5)}-${raw.slice(5, 8)}`
}

function onInput() {
  licensePlate.value = format(licensePlate.value)
  error.value = null
}

const normalized = computed(() =>
  licensePlate.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
)
const isValid = computed(() => normalized.value.length >= 6)

// ─── Lookup ───────────────────────────────────────────────────────────────────

async function handleSearch() {
  if (!isValid.value || loading.value) return
  error.value = null
  loading.value = true
  try {
    const variant = await new CarVariant().lookupCarVariant({ plate: normalized.value })
    store.setVariant(variant)
    router.push({ path: '/products', query: { car: variant.id } })
    emit('success', variant)
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? 'Kenteken niet gevonden. Controleer uw invoer.'
    error.value = msg
    emit('error', msg)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <!-- Dutch license plate input -->
    <div
      class="flex w-full h-[64px] rounded-[5px] overflow-hidden border-[3px] border-gray-900 shadow-[0_2px_10px_rgba(0,0,0,0.4)] transition-opacity"
      :class="{ 'opacity-50 pointer-events-none': loading }"
    >
      <!-- NL flag side -->
      <div class="w-[48px] shrink-0 bg-[#003399] flex items-center justify-center border-r-[3px] border-gray-900">
        <span class="text-white font-black text-[15px] tracking-[2px]">NL</span>
      </div>

      <!-- Yellow plate body -->
      <div class="flex-1 bg-[#F5C400] relative">
        <input
          v-model="licensePlate"
          type="text"
          placeholder="AB-12-CD"
          maxlength="10"
          :disabled="loading"
          class="absolute inset-0 w-full h-full bg-transparent text-center text-[26px] font-black text-gray-900 placeholder-gray-600/40 focus:outline-none disabled:cursor-not-allowed uppercase"
          style="font-family: 'Arial Black', 'Arial Bold', sans-serif; letter-spacing: 0.22em;"
          @input="onInput"
          @keyup.enter="handleSearch"
        />
      </div>

      <!-- Search button -->
      <button
        :disabled="!isValid || loading"
        class="w-[52px] shrink-0 bg-gray-900 flex items-center justify-center border-l-[3px] border-gray-900 hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Zoeken op kenteken"
        @click="handleSearch"
      >
        <Loader2 v-if="loading" class="h-5 w-5 text-white animate-spin" />
        <Search v-else class="h-5 w-5 text-white" />
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
        <span>Kenteken opzoeken…</span>
      </div>
      <div v-else-if="error" class="flex items-center gap-1.5 text-xs"
        :class="theme === 'dark' ? 'text-red-300' : 'text-red-500'">
        <AlertCircle class="h-3.5 w-3.5 shrink-0" />
        <span>{{ error }}</span>
      </div>
    </Transition>
  </div>
</template>
