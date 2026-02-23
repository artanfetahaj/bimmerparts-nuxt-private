<script setup lang="ts">
import { computed } from 'vue'
import { CarFront, X } from 'lucide-vue-next'
import { useCarVariantStore } from '@/stores/car-variant.store'
import { getSeriesImage, getSeriesLabel } from '@/collections/bmw-series'
import { CarVariant } from '~/models/CarVariant';

const emit = defineEmits<{ click: [] }>()

const store = useCarVariantStore()
const variant = computed(() => store.selectedVariant)

const seriesImage = computed(() =>
  `/car-models/${variant.value?.car_model?.code}.png`
)

const seriesLabel = computed(() =>
  variant.value ? getSeriesLabel(variant.value.car_model!.series) : null,
)

function handleClear(e: MouseEvent) {
  e.stopPropagation()
  store.clearVariant()
}
</script>

<template>
  <!-- ── Active variant pill ── -->
  <button
    v-if="variant"
    
    class="h-10 pl-4 pr-5 rounded-full flex items-center gap-2 whitespace-nowrap text-sm focus:outline-none text-white bg-orange-500 hover:bg-orange-600 border border-orange-500 transition-colors cursor-pointer"
    @click="$emit('click')"
  >
    <!-- Series thumbnail -->
    <div class="w-10 h-7 flex items-center justify-center shrink-0">
      <NuxtImg
        :src="seriesImage!"
        :alt="seriesLabel!"
        width="40"
        height="28"
        class="object-contain w-full h-full"
      />
    </div>

    <!-- Text info -->
    <div class="flex flex-col items-start leading-tight min-w-0">
      <span class="text-[11px] text-white font-medium tracking-wide">
        {{ seriesLabel }}
      </span>
      <span class="text-xs  text-white truncate max-w-[130px] font-semibold">
        <span class="uppercase font-semibold">{{ variant.car_model?.code }}</span> {{ variant.full_name }}
      </span>
    </div>

    <!-- Clear button -->
    <span
      class="ml-1 w-5 h-5 rounded-full flex items-center justify-center text-orange-200 hover:text-white hover:bg-orange-400 transition-colors shrink-0"
      role="button"
      aria-label="Verwijder auto selectie"
      @click="handleClear"
    >
      <X class="w-3.5 h-3.5" />
    </span>
  </button>

  <!-- ── Empty state pill ── -->
  <button
    v-else
    class="h-10 pl-4 pr-5 rounded-full flex items-center gap-2 whitespace-nowrap text-sm focus:outline-none text-white bg-orange-500 hover:bg-orange-600 border border-orange-500 transition-colors cursor-pointer"
    @click="$emit('click')"
  >
    <CarFront class="w-5 h-5 shrink-0" />
    Kies jouw BMW
  </button>
</template>
