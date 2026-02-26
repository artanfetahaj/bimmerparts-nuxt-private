<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { SlidersHorizontal } from 'lucide-vue-next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { getProductBrands, type ProductBrand } from '@/services/productBrand'
import { getCategoryHierarchy, type MainCategory } from '@/services/category'
import { getBmwModelsBySeries, type BmwModel } from '@/services/bmw'
import api from '@/services/api'

// ─── URL query param sync ─────────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()

// ─── Price range ─────────────────────────────────────────────────────────────
const PRICE_FLOOR = 0
const PRICE_CEILING = 20000

const priceMin = ref(Number(route.query.price_min) || PRICE_FLOOR)
const priceMax = ref(Number(route.query.price_max) || PRICE_CEILING)

// Debounce for price slider
let priceDebounce: ReturnType<typeof setTimeout> | null = null

function onPriceMinInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  priceMin.value = Math.min(val, priceMax.value - 1)
}

function onPriceMaxInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  priceMax.value = Math.max(val, priceMin.value + 1)
}

function commitPriceFilter() {
  if (priceDebounce) clearTimeout(priceDebounce)
  priceDebounce = setTimeout(() => {
    const query = { ...route.query }
    if (priceMin.value > PRICE_FLOOR) {
      query.price_min = String(priceMin.value)
    } else {
      delete query.price_min
    }
    if (priceMax.value < PRICE_CEILING) {
      query.price_max = String(priceMax.value)
    } else {
      delete query.price_max
    }
    delete query.page
    router.replace({ query })
  }, 400)
}

watch([priceMin, priceMax], commitPriceFilter)

// Track position percentage for slider styling
const minPercent = computed(() => ((priceMin.value - PRICE_FLOOR) / (PRICE_CEILING - PRICE_FLOOR)) * 100)
const maxPercent = computed(() => ((priceMax.value - PRICE_FLOOR) / (PRICE_CEILING - PRICE_FLOOR)) * 100)

// ─── Brands ──────────────────────────────────────────────────────────────────
const brands = ref<ProductBrand[]>([])
const selectedBrand = ref<string>((route.query.brand as string) || '')

function selectBrand(brandId: string) {
  const query = { ...route.query }
  if (selectedBrand.value === brandId) {
    selectedBrand.value = ''
    delete query.brand
  } else {
    selectedBrand.value = brandId
    query.brand = brandId
  }
  delete query.page
  router.replace({ query })
}

// ─── Categories ──────────────────────────────────────────────────────────────
const categoryHierarchy = ref<MainCategory[]>([])
const selectedMainCategory = ref<string>((route.query.main_category as string) || '')
const selectedProductCategory = ref<string>((route.query.product_category as string) || '')
const selectedSubcategory = ref<string>((route.query.subcategory as string) || '')

function selectMainCategory(id: string) {
  const query = { ...route.query }
  if (selectedMainCategory.value === id) {
    selectedMainCategory.value = ''
    delete query.main_category
  } else {
    selectedMainCategory.value = id
    query.main_category = id
  }
  selectedProductCategory.value = ''
  selectedSubcategory.value = ''
  delete query.product_category
  delete query.subcategory
  delete query.page
  router.replace({ query })
}

function selectProductCategory(id: string) {
  const query = { ...route.query }
  if (selectedProductCategory.value === id) {
    selectedProductCategory.value = ''
    delete query.product_category
  } else {
    selectedProductCategory.value = id
    query.product_category = id
  }
  selectedSubcategory.value = ''
  delete query.subcategory
  delete query.page
  router.replace({ query })
}

function selectSubcategory(slug: string) {
  const query = { ...route.query }
  if (selectedSubcategory.value === slug) {
    selectedSubcategory.value = ''
    delete query.subcategory
  } else {
    selectedSubcategory.value = slug
    query.subcategory = slug
  }
  delete query.page
  router.replace({ query })
}

// ─── Group (Car models) ─────────────────────────────────────────────────────
interface CarModel {
  id: string
  name: string
  series?: string
}

const carModels = ref<CarModel[]>([])
const selectedCarModel = ref<string>((route.query.car_model as string) || '')

function selectCarModel(modelId: string) {
  const query = { ...route.query }
  if (selectedCarModel.value === modelId) {
    selectedCarModel.value = ''
    delete query.car_model
  } else {
    selectedCarModel.value = modelId
    query.car_model = modelId
  }
  delete query.page
  router.replace({ query })
}

// Group car models by series
const carModelsBySeries = computed(() => {
  const grouped = new Map<string, CarModel[]>()
  for (const model of carModels.value) {
    const series = model.series || 'Other'
    if (!grouped.has(series)) grouped.set(series, [])
    grouped.get(series)!.push(model)
  }
  return grouped
})

// ─── Sync URL → local state ─────────────────────────────────────────────────
watch(
  () => route.query,
  (q) => {
    selectedBrand.value = (q.brand as string) || ''
    selectedMainCategory.value = (q.main_category as string) || ''
    selectedProductCategory.value = (q.product_category as string) || ''
    selectedSubcategory.value = (q.subcategory as string) || ''
    selectedCarModel.value = (q.car_model as string) || ''
    priceMin.value = Number(q.price_min) || PRICE_FLOOR
    priceMax.value = Number(q.price_max) || PRICE_CEILING
  },
  { deep: true },
)

// ─── Init ────────────────────────────────────────────────────────────────────
onMounted(async () => {
  getProductBrands()
    .then((b) => { brands.value = b })
    .catch(() => {})

  getCategoryHierarchy()
    .then((h) => { categoryHierarchy.value = h })
    .catch(() => {})

  // Fetch car models
  api.get('/car-models', { params: { limit: 200 } })
    .then((res) => { carModels.value = res.data?.data || [] })
    .catch(() => {})
})

// ─── Accordion default state ────────────────────────────────────────────────
const openSections = ref(['price'])
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm p-5">
    <!-- Header -->
    <div class="flex items-center justify-between mb-1">
      <h2 class="text-lg font-bold text-gray-900">Filters</h2>
      <SlidersHorizontal class="w-5 h-5 text-gray-500" />
    </div>

    <Accordion type="multiple" :default-value="openSections" class="w-full">

      <!-- ── Price Range ── -->
      <AccordionItem value="price">
        <AccordionTrigger class="text-base font-semibold text-gray-900 hover:no-underline">
          Price
        </AccordionTrigger>
        <AccordionContent>
          <div class="px-1">
            <!-- Dual range slider -->
            <div class="relative h-6 mb-3">
              <!-- Track background -->
              <div class="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 rounded-full bg-gray-200" />
              <!-- Active track -->
              <div
                class="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-orange-500"
                :style="{ left: minPercent + '%', right: (100 - maxPercent) + '%' }"
              />
              <!-- Min thumb -->
              <input
                type="range"
                :min="PRICE_FLOOR"
                :max="PRICE_CEILING"
                :value="priceMin"
                @input="onPriceMinInput"
                class="range-thumb absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none z-[3]"
              />
              <!-- Max thumb -->
              <input
                type="range"
                :min="PRICE_FLOOR"
                :max="PRICE_CEILING"
                :value="priceMax"
                @input="onPriceMaxInput"
                class="range-thumb absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none z-[4]"
              />
            </div>
            <div class="flex justify-between text-sm text-gray-600">
              <span class="font-medium">${{ priceMin.toLocaleString() }}</span>
              <span class="font-medium">${{ priceMax.toLocaleString() }}</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <!-- ── Group (Car Models) ── -->
      <AccordionItem value="group">
        <AccordionTrigger class="text-base font-semibold text-gray-900 hover:no-underline">
          Group
        </AccordionTrigger>
        <AccordionContent>
          <div v-if="carModels.length === 0" class="text-sm text-gray-400 py-1">
            No models available
          </div>
          <div v-else class="max-h-52 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            <template v-for="[series, models] in carModelsBySeries" :key="series">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2 first:mt-0">{{ series }}</p>
              <label
                v-for="model in models"
                :key="model.id"
                class="flex items-center gap-2 py-1 px-1 rounded cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="car_model"
                  :value="model.id"
                  :checked="selectedCarModel === model.id"
                  @change="selectCarModel(model.id)"
                  class="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 accent-orange-500"
                />
                <span class="text-sm text-gray-700">{{ model.name }}</span>
              </label>
            </template>
            <!-- Clear -->
            <button
              v-if="selectedCarModel"
              @click="selectCarModel(selectedCarModel)"
              class="text-xs text-orange-600 hover:text-orange-700 mt-1"
            >
              Clear selection
            </button>
          </div>
        </AccordionContent>
      </AccordionItem>

      <!-- ── Category ── -->
      <AccordionItem value="category">
        <AccordionTrigger class="text-base font-semibold text-gray-900 hover:no-underline">
          Category
        </AccordionTrigger>
        <AccordionContent>
          <div v-if="categoryHierarchy.length === 0" class="text-sm text-gray-400 py-1">
            No categories available
          </div>
          <div v-else class="max-h-60 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
            <template v-for="mc in categoryHierarchy" :key="mc.id">
              <!-- Main category -->
              <label class="flex items-center gap-2 py-1.5 px-1 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="main_category"
                  :value="mc.id"
                  :checked="selectedMainCategory === mc.id && !selectedProductCategory && !selectedSubcategory"
                  @change="selectMainCategory(mc.id)"
                  class="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 accent-orange-500"
                />
                <span class="text-sm font-medium text-gray-800">{{ mc.name }}</span>
              </label>

              <!-- Product categories (nested) -->
              <template v-if="mc.categories?.length">
                <label
                  v-for="pc in mc.categories"
                  :key="pc.id"
                  class="flex items-center gap-2 py-1 px-1 pl-6 rounded cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="product_category"
                    :value="pc.id"
                    :checked="selectedProductCategory === pc.id && !selectedSubcategory"
                    @change="selectProductCategory(pc.id)"
                    class="w-3.5 h-3.5 text-orange-500 border-gray-300 focus:ring-orange-500 accent-orange-500"
                  />
                  <span class="text-sm text-gray-700">{{ pc.name }}</span>
                </label>
              </template>
            </template>
            <!-- Clear -->
            <button
              v-if="selectedMainCategory || selectedProductCategory || selectedSubcategory"
              @click="() => {
                const q = { ...route.query }
                delete q.main_category
                delete q.product_category
                delete q.subcategory
                delete q.page
                router.replace({ query: q })
              }"
              class="text-xs text-orange-600 hover:text-orange-700 mt-1"
            >
              Clear selection
            </button>
          </div>
        </AccordionContent>
      </AccordionItem>

      <!-- ── Brand ── -->
      <AccordionItem value="brand" class="border-b-0">
        <AccordionTrigger class="text-base font-semibold text-gray-900 hover:no-underline">
          Brand
        </AccordionTrigger>
        <AccordionContent>
          <div v-if="brands.length === 0" class="text-sm text-gray-400 py-1">
            No brands available
          </div>
          <div v-else class="max-h-52 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
            <label
              v-for="brand in brands"
              :key="brand.id"
              class="flex items-center gap-2 py-1 px-1 rounded cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="brand"
                :value="brand.id"
                :checked="selectedBrand === brand.id"
                @change="selectBrand(brand.id)"
                class="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500 accent-orange-500"
              />
              <span class="text-sm text-gray-700">{{ brand.name }}</span>
            </label>
            <!-- Clear -->
            <button
              v-if="selectedBrand"
              @click="selectBrand(selectedBrand)"
              class="text-xs text-orange-600 hover:text-orange-700 mt-1"
            >
              Clear selection
            </button>
          </div>
        </AccordionContent>
      </AccordionItem>

    </Accordion>
  </div>
</template>

<style scoped>
/* ─── Dual range slider thumbs ─── */
.range-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f97316;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  pointer-events: auto;
  position: relative;
}

.range-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f97316;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  pointer-events: auto;
}

/* Hide default track for overlapping inputs */
.range-thumb::-webkit-slider-runnable-track {
  -webkit-appearance: none;
  appearance: none;
  height: 0;
}

.range-thumb::-moz-range-track {
  height: 0;
  background: transparent;
}

/* Scrollbar for filter lists */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
