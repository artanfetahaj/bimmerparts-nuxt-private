<script setup lang="ts">
import { onMounted, ref } from 'vue'
import productService from '../services/product'
import type { Product as ApiProduct } from '../services/product'

const onSale = ref<ApiProduct[]>([])
const allProducts = ref<ApiProduct[]>([])
const isLoadingProducts = ref(false)
const productsError = ref<string | null>(null)

const loadProducts = async () => {
  isLoadingProducts.value = true
  productsError.value = null
  try {
    const response = await productService.getAllProducts({ per_page: 20 })
    if (response && response.data) {
      const products: ApiProduct[] = response.data

      const discountedProducts = products
        .filter((p) => p.has_discount)
        .sort((a, b) => (Number(b.sale_percentage) ?? 0) - (Number(a.sale_percentage) ?? 0))

      onSale.value = discountedProducts.slice(0, 6)
      allProducts.value = products
    }
  } catch (error) {
    console.error('Failed to load products:', error)
    productsError.value = 'Failed to load products. Please try again later.'
  } finally {
    isLoadingProducts.value = false
  }
}

onMounted(async () => {
  await loadProducts()
})
</script>

<template>
  <div>
    <HomeHero image="/images/hero.jpg" />
    <ServiceCards />
    <BrandsRow />
    <ProductSection :title="'On Sale'" :products="onSale" />
    <ProductSection :title="'All Products'" :products="allProducts" />
  </div>
</template>
