<script setup lang="ts">
import ProductCard from './ProductCard.vue'
import { ref, computed } from 'vue'
import { useLocale } from '../stores/locale'

// Locale handling
const { t } = useLocale()

interface Product {
  id: string
  title: string
  price: number
  oldPrice?: number
  image: string
  badge?: string
}

const props = defineProps<{ title: string; products: Product[] }>()

const emit = defineEmits<{
  navigateToProduct: [productId: string]
  navigateToProducts: []
}>()

const handleProductClick = (productId: string) => {
  emit('navigateToProduct', productId)
}

const activeTab = ref('General')

const tabs = computed(() => [
  { id: 'General', label: t('productSection.tabs.general') },
  { id: 'BMW Parts', label: t('productSection.tabs.bmwParts') },
  { id: 'Accessories', label: t('productSection.tabs.accessories') },
  { id: 'Exterior', label: t('productSection.tabs.exterior') }
])
</script>

<template>
  <section class="w-full bg-white py-8">
    <div class="container mx-auto px-6 md:px-10">
      <!-- Title -->
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-normal text-gray-900">{{ props.title }}</h2>
        <button 
          v-if="props.title === t('products.allProducts')"
          @click="emit('navigateToProducts')"
          class="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
        >
          {{ t('brands.seeAll') }}
        </button>
      </div>
      
      <!-- Navigation Tabs - Only show for On Sale (localized) -->
      <div v-if="props.title === t('products.onSale')" class="mb-8">
        <div class="flex border-b border-gray-200 overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0 scrollbar-hide">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="pb-3 md:pb-4 text-xs md:text-sm font-medium transition-colors mr-3 sm:mr-4 md:mr-28 lg:mr-48 xl:mr-56 2xl:mr-64 whitespace-nowrap relative flex-shrink-0"
            :class="activeTab === tab.id 
              ? 'text-orange-500 after:content-[\'\'] after:absolute after:left-0 after:-bottom-[1px] after:h-[2px] after:w-full after:bg-orange-500' 
              : 'text-gray-600 hover:text-gray-900'"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
      
      <!-- Products Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <ProductCard 
          v-for="p in props.products" 
          :key="p.id" 
          :product="p" 
          @navigate-to-product="handleProductClick"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Hide scrollbar arrows and scrollbar */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>


