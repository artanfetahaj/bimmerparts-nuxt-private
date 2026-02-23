import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CarVariant } from '@/models/CarVariant'

export const useCarVariantStore = defineStore('carVariant', () => {
  const isDialogOpen = ref(false)
  const selectedVariant = ref<CarVariant | null>(null)

  function openDialog() {
    isDialogOpen.value = true
  }

  function closeDialog() {
    isDialogOpen.value = false
  }

  function setVariant(variant: CarVariant) {
    selectedVariant.value = variant;

    closeDialog()
  }

  function clearVariant() {
    selectedVariant.value = null
  }

  return {
    isDialogOpen,
    selectedVariant,
    openDialog,
    closeDialog,
    setVariant,
    clearVariant,
  }
})
