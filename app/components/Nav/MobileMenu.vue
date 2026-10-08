<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, ChevronDown, Loader2 } from 'lucide-vue-next'
import { useLocale } from '../../stores/locale'
import { useCategoryStore } from '../../stores/category.store'
import { useCarVariantStore } from '../../stores/car-variant.store'
import SelectedCarVariant from './SelectedCarVariant.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'openCarDialog'): void
}>()

const { t } = useLocale()
const categoryStore = useCategoryStore()

// ─── Accordion state ──────────────────────────────────────────────────────────
const showCategoriesMenu = ref(false)
const expandedMainCat = ref<string | null>(null)
const expandedProductCat = ref<string | null>(null)

function toggleCategoriesMenu() {
  showCategoriesMenu.value = !showCategoriesMenu.value
}

function toggleMainCat(id: string) {
  expandedMainCat.value = expandedMainCat.value === id ? null : id
  expandedProductCat.value = null
}

function toggleProductCat(id: string) {
  expandedProductCat.value = expandedProductCat.value === id ? null : id
}

function navigate() {
  emit('close')
}

// Lock body scroll when open
watch(() => props.open, (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
  document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm"
        @click="emit('close')"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex flex-col mobile-menu-bg font-heading tracking-wide"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 pt-5 pb-4">
          <NuxtLink to="/" @click="navigate">
            <img src="/images/bimmerparts-logo.png" alt="BIMMERParts" class="h-12 w-auto object-contain" />
          </NuxtLink>
          <button
            @click="emit('close')"
            class="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Sluiten"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Car selector -->
        <div class="px-5 pb-4 [&>button]:w-full [&>button]:justify-center">
          <SelectedCarVariant @click="emit('openCarDialog'); emit('close')" />
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-5 pt-2 overflow-y-auto">

          <!-- Categorieën (accordion) -->
          <div>
            <button
              @click="toggleCategoriesMenu"
              class="flex items-center justify-between w-full text-left text-[22px] font-semibold text-gray-900 py-4 border-b border-gray-200/70"
            >
              Categorieën
              <ChevronDown
                class="w-5 h-5 transition-transform duration-200"
                :class="{ 'rotate-180': showCategoriesMenu }"
              />
            </button>

            <Transition name="accordion">
              <div v-if="showCategoriesMenu" class="pl-4 pb-2">
                <!-- Loading — only shown if the store hasn't resolved yet -->
                <div v-if="categoryStore.loading" class="flex items-center gap-2 py-3">
                  <Loader2 class="w-4 h-4 animate-spin text-orange-500" />
                  <span class="text-sm text-gray-500">Laden...</span>
                </div>

                <div v-else>
                  <div v-for="mainCat in categoryStore.mainCategories" :key="mainCat.id" class="mb-1">
                    <button
                      @click="toggleMainCat(mainCat.id)"
                      class="flex items-center justify-between w-full text-left text-base text-gray-700 py-2"
                    >
                      {{ mainCat.name }}
                      <ChevronDown
                        v-if="mainCat.categories?.length"
                        class="w-4 h-4 transition-transform duration-200 text-gray-400"
                        :class="{ 'rotate-180': expandedMainCat === mainCat.id }"
                      />
                    </button>

                    <!-- Product categories -->
                    <Transition name="accordion">
                      <div v-if="expandedMainCat === mainCat.id && mainCat.categories?.length" class="pl-4 pb-1">
                        <div v-for="prodCat in mainCat.categories" :key="prodCat.id">
                          <!-- If it has subcategories: show as toggle; otherwise navigate directly -->
                          <div v-if="prodCat.subcategories?.length">
                            <button
                              @click="toggleProductCat(prodCat.id)"
                              class="flex items-center justify-between w-full text-left text-sm text-gray-600 py-1.5 hover:text-orange-500 transition-colors"
                            >
                              {{ prodCat.name }}
                              <ChevronDown
                                class="w-3.5 h-3.5 transition-transform duration-200 text-gray-400 flex-shrink-0 ml-2"
                                :class="{ 'rotate-180': expandedProductCat === prodCat.id }"
                              />
                            </button>
                            <Transition name="accordion">
                              <div v-if="expandedProductCat === prodCat.id" class="pl-4 pb-1">
                                <NuxtLink
                                  :to="{ path: '/producten', query: { product_category: prodCat.id } }"
                                  class="block text-xs text-gray-500 py-1 hover:text-orange-500 transition-colors"
                                  @click="navigate"
                                >
                                  Alles in {{ prodCat.name }}
                                </NuxtLink>
                                <NuxtLink
                                  v-for="sub in prodCat.subcategories"
                                  :key="sub.id"
                                  :to="{ path: '/producten', query: { subcategory: sub.slug } }"
                                  class="block text-xs text-gray-500 py-1 hover:text-orange-500 transition-colors"
                                  @click="navigate"
                                >
                                  {{ sub.name }}
                                </NuxtLink>
                              </div>
                            </Transition>
                          </div>
                          <NuxtLink
                            v-else
                            :to="{ path: '/producten', query: { product_category: prodCat.id } }"
                            class="block text-sm text-gray-600 py-1.5 hover:text-orange-500 transition-colors"
                            @click="navigate"
                          >
                            {{ prodCat.name }}
                          </NuxtLink>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Producten -->
          <NuxtLink
            to="/producten"
            class="block text-[22px] font-semibold text-gray-900 py-4 border-b border-gray-200/70"
            @click="navigate"
          >
            {{ t('nav.autoParts') }}
          </NuxtLink>

          <!-- Over ons -->
          <NuxtLink
            to="/over-ons"
            class="block text-[22px] font-semibold text-gray-900 py-4 border-b border-gray-200/70"
            @click="navigate"
          >
            {{ t('nav.about') }}
          </NuxtLink>

          <!-- Contact -->
          <NuxtLink
            to="/contact"
            class="block text-[22px] font-semibold text-gray-900 py-4 border-b border-gray-200/70"
            @click="navigate"
          >
            {{ t('nav.contact') }}
          </NuxtLink>
        </nav>

      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mobile-menu-bg {
  background-color: #fafafa;
  background-image:
    radial-gradient(120% 60% at 100% 0%, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0) 60%),
    radial-gradient(100% 50% at 0% 100%, rgba(249, 115, 22, 0.07) 0%, rgba(249, 115, 22, 0) 60%);
}

.slide-enter-active,
.slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from,
.slide-leave-to { transform: translateX(100%); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.accordion-enter-from,
.accordion-leave-to { opacity: 0; max-height: 0; }
.accordion-enter-to,
.accordion-leave-from { opacity: 1; max-height: 500px; }
</style>
