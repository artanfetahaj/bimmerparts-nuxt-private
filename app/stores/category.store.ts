import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MainCategory, MainCategoryIncludes } from '@/models/MainCategory'
import type { ProductCategory } from '@/models/ProductCategory'
import type { ProductSubcategory } from '@/models/ProductSubcategory'

export const useCategoryStore = defineStore('category', () => {
  // ─── State ────────────────────────────────────────────────────────────────

  const mainCategories = ref<MainCategory[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref(false)

  const variantCategories = ref<MainCategory[]>([])
  const variantCategoriesLoading = ref(false)
  const variantCategoriesError = ref(false)
  const loadedVariantId = ref<string | null>(null)

  // ─── Getters ──────────────────────────────────────────────────────────────

  const allProductCategories = computed<ProductCategory[]>(() =>
    mainCategories.value.flatMap(mc => mc.categories ?? [])
  )

  const allSubcategories = computed<ProductSubcategory[]>(() =>
    allProductCategories.value.flatMap(pc => pc.subcategories ?? [])
  )

  function getMainCategoryById(id: string): MainCategory | undefined {
    return mainCategories.value.find(mc => mc.id === id)
  }

  function getProductCategoryById(id: string): ProductCategory | undefined {
    return allProductCategories.value.find(pc => pc.id === id)
  }

  function getSubcategoryBySlug(slug: string): ProductSubcategory | undefined {
    return allSubcategories.value.find(sc => sc.slug === slug)
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  async function fetchCategories() {
    // Only fetch once — idempotent
    if (loaded.value || loading.value) return

    loading.value = true
    error.value = false

    try {
      const response = await new MainCategory()
        .include(MainCategoryIncludes.CATEGORIES_SUBCATEGORIES)
        .limit(100)
        .all()

      mainCategories.value = Array.isArray(response)
        ? response
        : (response.data ?? [])

      loaded.value = true
    } catch (e) {
      console.error('[CategoryStore] Failed to fetch categories:', e)
      error.value = true
    } finally {
      loading.value = false
    }
  }

  async function fetchCategoriesForVariant(variantId: string) {
    if (loadedVariantId.value === variantId || variantCategoriesLoading.value) return

    variantCategoriesLoading.value = true
    variantCategoriesError.value = false

    try {
      const response = await new MainCategory()
        .include(MainCategoryIncludes.CATEGORIES_SUBCATEGORIES)
        .filter('car_variant', variantId)
        .limit(100)
        .all()

      variantCategories.value = Array.isArray(response)
        ? response
        : (response.data ?? [])

      loadedVariantId.value = variantId
    } catch (e) {
      console.error('[CategoryStore] Failed to fetch variant categories:', e)
      variantCategoriesError.value = true
    } finally {
      variantCategoriesLoading.value = false
    }
  }

  function resetVariantCategories() {
    variantCategories.value = []
    loadedVariantId.value = null
    variantCategoriesError.value = false
  }

  function reset() {
    mainCategories.value = []
    loaded.value = false
    error.value = false
  }

  return {
    // state
    mainCategories,
    loading,
    loaded,
    error,
    variantCategories,
    variantCategoriesLoading,
    variantCategoriesError,
    // getters
    allProductCategories,
    allSubcategories,
    getMainCategoryById,
    getProductCategoryById,
    getSubcategoryBySlug,
    // actions
    fetchCategories,
    fetchCategoriesForVariant,
    resetVariantCategories,
    reset,
  }
})
