import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CarVariant } from '@/models/CarVariant'
import type { CarModel } from '@/models/CarModel'

export const useCarVariantStore = defineStore('carVariant', () => {
  const isDialogOpen = ref(false)
  const selectedVariant = ref<CarVariant | null>(null)
  const selectedModel = ref<CarModel | null>(null)

  function openDialog() {
    isDialogOpen.value = true
  }

  function closeDialog() {
    isDialogOpen.value = false
  }

  function setVariant(variant: CarVariant) {
    selectedVariant.value = variant
    selectedModel.value = null
    closeDialog()
  }

  function setModel(model: CarModel) {
    selectedModel.value = model
    selectedVariant.value = null
    closeDialog()
  }

  function clearVariant() {
    selectedVariant.value = null
    selectedModel.value = null
  }

  return {
    isDialogOpen,
    selectedVariant,
    selectedModel,
    openDialog,
    closeDialog,
    setVariant,
    setModel,
    clearVariant,
  }
})
