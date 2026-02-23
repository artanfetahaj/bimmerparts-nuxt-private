<script setup lang="ts">
import { BMW_SERIES } from '@/collections/bmw-series'
import LicensePlateInput from '@/components/inputs/LicensePlateInput.vue'
import VinInput from '@/components/inputs/VinInput.vue'
import type { CarVariant } from '@/models/CarVariant'

const props = defineProps<{
  selectedSeries: string
}>()

const emit = defineEmits<{
  (e: 'update:selectedSeries', value: string): void
  (e: 'variantResolved', variant: CarVariant): void
}>()

function handleSuccess(variant: CarVariant) {
  emit('variantResolved', variant)
}
</script>

<template>
  <div class="space-y-6">

    <!-- Plate + VIN side by side -->
    <div class="space-y-2">
      <p class="text-sm font-medium text-gray-700">Zoek op kenteken of chassisnummer</p>
      <div class="flex gap-3 items-start">
        <div class="flex-1">
          <p class="text-xs text-gray-400 mb-1.5">Kenteken</p>
          <LicensePlateInput theme="light" @success="handleSuccess" />
        </div>
        <div class="flex-1">
          <p class="text-xs text-gray-400 mb-1.5">Chassisnummer (VIN)</p>
          <VinInput theme="light" @success="handleSuccess" />
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="flex items-center gap-3">
      <div class="flex-1 h-px bg-gray-200" />
      <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Of kies een serie</span>
      <div class="flex-1 h-px bg-gray-200" />
    </div>

    <!-- Series grid -->
    <div class="grid grid-cols-3 sm:grid-cols-4 gap-4">
      <button
        v-for="item in BMW_SERIES"
        :key="item.series"
        :class="[
          'rounded-xl border-2 p-3 transition-all duration-200 text-center',
          selectedSeries === item.series
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-200 bg-white hover:border-gray-400',
        ]"
        @click="emit('update:selectedSeries', item.series)"
      >
        <NuxtImg
          :src="item.image"
          :alt="item.label"
          width="132"
          height="48"
          class="mb-2 mx-auto object-contain"
        />
        <p class="text-sm font-semibold text-gray-700">{{ item.label }}</p>
      </button>
    </div>

  </div>
</template>
