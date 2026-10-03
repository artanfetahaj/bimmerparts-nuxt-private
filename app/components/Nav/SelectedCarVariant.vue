<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { useCarVariantStore } from '@/stores/car-variant.store'
import { getSeriesLabel } from '@/collections/bmw-series'

const emit = defineEmits<{ click: [] }>()

const store  = useCarVariantStore()
const route  = useRoute()
const router = useRouter()

const variant = computed(() => store.selectedVariant)
const model   = computed(() => store.selectedModel)

const variantSeriesLabel = computed(() =>
  variant.value ? getSeriesLabel(variant.value.car_model!.series) : null,
)

const modelSeriesLabel = computed(() =>
  model.value ? getSeriesLabel(model.value.series) : null,
)

function handleClear(e: MouseEvent) {
  e.stopPropagation()
  store.clearVariant()
  const { car: _c, car_model: _m, ...rest } = route.query
  router.replace({ query: rest })
}
</script>

<template>
  <!-- ── Active variant pill ── -->
  <button
    v-if="variant"
    class="h-10 pl-4 pr-5 rounded-full flex items-center gap-2 whitespace-nowrap text-sm font-heading font-medium tracking-wide focus:outline-none text-zinc-900 bg-orange-500 hover:bg-orange-600 border border-orange-500 transition-colors cursor-pointer"
    @click="$emit('click')"
  >
    <div class="w-10 h-7 flex items-center justify-center shrink-0">
      <NuxtImg
        :src="`/car-models/${variant.car_model?.code}.webp`"
        :alt="variantSeriesLabel!"
        width="40"
        height="28"
        class="object-contain w-full h-full"
      />
    </div>
    <div class="flex flex-col items-start leading-tight min-w-0">
      <span class="text-[11px] text-zinc-700 font-medium tracking-wide">
        {{ variantSeriesLabel }}
      </span>
      <span class="text-xs text-zinc-900 truncate max-w-[130px] font-semibold">
        <span class="uppercase font-semibold">{{ variant.car_model?.code }}</span> {{ variant.full_name }}
      </span>
    </div>
    <span
      class="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:bg-orange-400 transition-colors shrink-0"
      role="button"
      aria-label="Verwijder auto selectie"
      @click="handleClear"
    >
      <X class="w-3.5 h-3.5" />
    </span>
  </button>

  <!-- ── Model-only pill ── -->
  <button
    v-else-if="model"
    class="h-10 pl-4 pr-5 rounded-full flex items-center gap-2 whitespace-nowrap text-sm font-heading font-medium tracking-wide focus:outline-none text-zinc-900 bg-orange-500 hover:bg-orange-600 border border-orange-500 transition-colors cursor-pointer"
    @click="$emit('click')"
  >
    <div class="w-10 h-7 flex items-center justify-center shrink-0">
      <NuxtImg
        :src="`/car-models/${model.code}.webp`"
        :alt="modelSeriesLabel!"
        width="40"
        height="28"
        class="object-contain w-full h-full"
      />
    </div>
    <div class="flex flex-col items-start leading-tight min-w-0">
      <span class="text-[11px] text-zinc-700 font-medium tracking-wide">
        {{ modelSeriesLabel }}
      </span>
      <span class="text-xs text-zinc-900 truncate max-w-[130px] font-semibold uppercase font-semibold">
        {{ model.code }}
      </span>
    </div>
    <span
      class="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-zinc-700 hover:text-zinc-900 hover:bg-orange-400 transition-colors shrink-0"
      role="button"
      aria-label="Verwijder auto selectie"
      @click="handleClear"
    >
      <X class="w-3.5 h-3.5" />
    </span>
  </button>

  <!-- ── Empty state pill: dark logo-stripe colour, white text, the three logo stripes as icon ── -->
  <button
    v-else
    class="h-10 pl-4 pr-5 rounded-full flex items-center gap-2.5 whitespace-nowrap text-sm font-heading font-medium tracking-wide text-white bg-stripe-dark hover:bg-[#3a464d] shadow-md shadow-black/20 ring-1 ring-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-stripe-blue transition-colors cursor-pointer"
    @click="$emit('click')"
  >
    <!-- The three stripes from the BimmerParts logo (centre stripe white so it stays visible on the dark button) -->
    <svg class="w-6 h-4 shrink-0" viewBox="130 296 1000 650" aria-hidden="true">
      <path fill="#ed4416" d="M140 813 L378 419 H548 L318 813 Z" />
      <path fill="#ffffff" d="M330 935 L720 306 H930 L545 935 Z" />
      <path fill="#3ca9e6" d="M713 813 L950 419 H1121 L890 813 Z" />
    </svg>
    Kies jouw BMW
  </button>
</template>
