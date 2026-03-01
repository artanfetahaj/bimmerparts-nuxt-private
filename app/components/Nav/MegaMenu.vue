<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCategoryStore } from '../../stores/category.store'
import type { MainCategory } from '../../models/MainCategory'
import type { ProductCategory } from '../../models/ProductCategory'
import { ChevronRight, Loader2, FolderOpen } from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'

const emit = defineEmits<{ close: [] }>()

const categoryStore = useCategoryStore()

// ─── Local hover state ───────────────────────────────────────────────────────

const hoveredMainCategory = ref<MainCategory | null>(null)
const hoveredProductCategory = ref<ProductCategory | null>(null)

// Auto-select first items when the store data becomes available
watch(
  () => categoryStore.mainCategories,
  (cats) => {
    if (cats.length && !hoveredMainCategory.value) {
      hoveredMainCategory.value = cats[0]
      hoveredProductCategory.value = cats[0].categories?.[0] ?? null
    }
  },
  { immediate: true },
)

// ─── Derived lists ───────────────────────────────────────────────────────────

const visibleProductCategories = computed(() =>
  hoveredMainCategory.value?.categories ?? []
)

const visibleSubcategories = computed(() =>
  hoveredProductCategory.value?.subcategories ?? []
)

// ─── Hover handlers ──────────────────────────────────────────────────────────

function onMainCategoryHover(mainCat: MainCategory) {
  hoveredMainCategory.value = mainCat
  hoveredProductCategory.value = mainCat.categories?.[0] ?? null
}

function onProductCategoryHover(prodCat: ProductCategory) {
  hoveredProductCategory.value = prodCat
}
</script>

<template>
  <div class="mega-menu absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-xl z-50">

    <!-- Loading state -->
    <div v-if="categoryStore.loading" class="flex items-center justify-center py-16">
      <Loader2 class="w-6 h-6 text-orange-500 animate-spin" />
      <span class="ml-2 text-sm text-gray-500">Categorieën laden...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="categoryStore.error" class="flex items-center justify-center py-16">
      <span class="text-sm text-gray-500">Categorieën konden niet worden geladen.</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="categoryStore.mainCategories.length === 0" class="flex items-center justify-center py-16">
      <span class="text-sm text-gray-500">Geen categorieën beschikbaar.</span>
    </div>

    <!-- 3-column layout -->
    <div v-else class="outer-container mx-auto px-6 md:px-10">
      <div class="grid grid-cols-3" style="height: min(480px, 60vh);">

        <!-- Column 1: Main Categories -->
        <div class="border-r border-gray-100 flex flex-col min-h-0">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 pt-4 pb-2 shrink-0">
            Categorieën
          </h3>
          <ScrollArea class="flex-1 min-h-0">
            <ul class="pr-2 pb-4">
              <li
                v-for="mainCat in categoryStore.mainCategories"
                :key="mainCat.id"
                @mouseenter="onMainCategoryHover(mainCat)"
                class="group"
              >
                <NuxtLink
                  :to="{ path: '/products', query: { main_category: mainCat.id } }"
                  @click="emit('close')"
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
                </NuxtLink>
              </li>
            </ul>
          </ScrollArea>
        </div>

        <!-- Column 2: Product Categories -->
        <div class="border-r border-gray-100 flex flex-col min-h-0">
          <template v-if="visibleProductCategories.length > 0">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 pt-4 pb-2 shrink-0">
              {{ hoveredMainCategory?.name }}
            </h3>
            <ScrollArea class="flex-1 min-h-0">
              <ul class="px-2 pb-4">
                <li
                  v-for="prodCat in visibleProductCategories"
                  :key="prodCat.id"
                  @mouseenter="onProductCategoryHover(prodCat)"
                  class="group"
                >
                  <NuxtLink
                    :to="{ path: '/products', query: { product_category: prodCat.id } }"
                    @click="emit('close')"
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
                  </NuxtLink>
                </li>
              </ul>
            </ScrollArea>
          </template>
          <template v-else>
            <div class="flex flex-col items-center justify-center h-full text-gray-400">
              <FolderOpen class="w-8 h-8 mb-2" />
              <span class="text-sm">Geen subcategorieën</span>
            </div>
          </template>
        </div>

        <!-- Column 3: Subcategories -->
        <div class="flex flex-col min-h-0">
          <template v-if="visibleSubcategories.length > 0">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 px-3 pt-4 pb-2 shrink-0">
              {{ hoveredProductCategory?.name }}
            </h3>
            <ScrollArea class="flex-1 min-h-0">
              <ul class="pl-2 pb-4">
                <li
                  v-for="subCat in visibleSubcategories"
                  :key="subCat.id"
                >
                  <NuxtLink
                    :to="{ path: '/products', query: { subcategory: subCat.slug } }"
                    @click="emit('close')"
                    class="block px-3 py-2.5 text-sm rounded-lg transition-colors text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  >
                    {{ subCat.name }}
                  </NuxtLink>
                </li>
              </ul>
            </ScrollArea>
          </template>
          <template v-else>
            <div class="flex flex-col items-center justify-center h-full text-gray-400">
              <FolderOpen class="w-8 h-8 mb-2" />
              <span class="text-sm">Geen items</span>
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
