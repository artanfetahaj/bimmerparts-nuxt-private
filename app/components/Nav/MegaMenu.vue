<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCategoryHierarchy, type MainCategory, type ProductCategory } from '../../services/category'
import { ChevronRight, Loader2, FolderOpen } from 'lucide-vue-next'

const mainCategories = ref<MainCategory[]>([])
const loading = ref(true)
const error = ref(false)

const hoveredMainCategory = ref<MainCategory | null>(null)
const hoveredProductCategory = ref<ProductCategory | null>(null)

onMounted(async () => {
  try {
    mainCategories.value = await getCategoryHierarchy()

    // Auto-select first main category if available
    if (mainCategories.value.length > 0) {
      hoveredMainCategory.value = mainCategories.value[0]
      if (hoveredMainCategory.value.categories?.length) {
        hoveredProductCategory.value = hoveredMainCategory.value.categories[0]
      }
    }
  } catch (e) {
    error.value = true
    console.error('Failed to load category hierarchy:', e)
  } finally {
    loading.value = false
  }
})

function onMainCategoryHover(mainCat: MainCategory) {
  hoveredMainCategory.value = mainCat
  // Auto-select first product category when hovering a main category
  hoveredProductCategory.value = mainCat.categories?.length ? mainCat.categories[0] : null
}

function onProductCategoryHover(prodCat: ProductCategory) {
  hoveredProductCategory.value = prodCat
}

const visibleProductCategories = computed(() => {
  return hoveredMainCategory.value?.categories || []
})

const visibleSubcategories = computed(() => {
  return hoveredProductCategory.value?.subcategories || []
})
</script>

<template>
  <div class="mega-menu absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-xl z-50">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <Loader2 class="w-6 h-6 text-orange-500 animate-spin" />
      <span class="ml-2 text-sm text-gray-500">Loading categories...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex items-center justify-center py-16">
      <span class="text-sm text-gray-500">Failed to load categories.</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="mainCategories.length === 0" class="flex items-center justify-center py-16">
      <span class="text-sm text-gray-500">No categories available.</span>
    </div>

    <!-- 3-column layout -->
    <div v-else class="outer-container mx-auto px-6 md:px-10">
      <div class="grid grid-cols-3 min-h-[320px]">
        <!-- Column 1: Main Categories -->
        <div class="border-r border-gray-100 py-4 pr-2">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 mb-2">
            Categories
          </h3>
          <ul>
            <li
              v-for="mainCat in mainCategories"
              :key="mainCat.id"
              @mouseenter="onMainCategoryHover(mainCat)"
              class="group"
            >
              <button
                class="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors text-left"
                :class="[
                  hoveredMainCategory?.id === mainCat.id
                    ? 'bg-orange-50 text-orange-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                ]"
              >
                <span>{{ mainCat.name }}</span>
                <ChevronRight
                  class="w-4 h-4 shrink-0 transition-colors"
                  :class="[
                    hoveredMainCategory?.id === mainCat.id
                      ? 'text-orange-400'
                      : 'text-gray-300 group-hover:text-gray-400'
                  ]"
                />
              </button>
            </li>
          </ul>
        </div>

        <!-- Column 2: Product Categories -->
        <div class="border-r border-gray-100 py-4 px-2">
          <template v-if="visibleProductCategories.length > 0">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 mb-2">
              {{ hoveredMainCategory?.name }}
            </h3>
            <ul>
              <li
                v-for="prodCat in visibleProductCategories"
                :key="prodCat.id"
                @mouseenter="onProductCategoryHover(prodCat)"
                class="group"
              >
                <button
                  class="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors text-left"
                  :class="[
                    hoveredProductCategory?.id === prodCat.id
                      ? 'bg-orange-50 text-orange-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  ]"
                >
                  <span>{{ prodCat.name }}</span>
                  <ChevronRight
                    v-if="prodCat.subcategories?.length"
                    class="w-4 h-4 shrink-0 transition-colors"
                    :class="[
                      hoveredProductCategory?.id === prodCat.id
                        ? 'text-orange-400'
                        : 'text-gray-300 group-hover:text-gray-400'
                    ]"
                  />
                </button>
              </li>
            </ul>
          </template>
          <template v-else>
            <div class="flex flex-col items-center justify-center h-full text-gray-400">
              <FolderOpen class="w-8 h-8 mb-2" />
              <span class="text-sm">No subcategories</span>
            </div>
          </template>
        </div>

        <!-- Column 3: Subcategories -->
        <div class="py-4 pl-2">
          <template v-if="visibleSubcategories.length > 0">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 mb-2">
              {{ hoveredProductCategory?.name }}
            </h3>
            <ul>
              <li
                v-for="subCat in visibleSubcategories"
                :key="subCat.id"
              >
                <NuxtLink
                  :to="`/products?subcategory=${subCat.slug}`"
                  class="block px-3 py-2.5 text-sm rounded-lg transition-colors text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  {{ subCat.name }}
                </NuxtLink>
              </li>
            </ul>
          </template>
          <template v-else>
            <div class="flex flex-col items-center justify-center h-full text-gray-400">
              <FolderOpen class="w-8 h-8 mb-2" />
              <span class="text-sm">No items</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mega-menu {
  animation: megaMenuSlideDown 0.2s ease-out;
}

@keyframes megaMenuSlideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
