<script setup lang="ts">
import { onMounted, ref } from 'vue'
import productService from '../services/product'
import type { Product as ApiProduct } from '../services/product'

interface UiProduct {
  id: string
  slug?: string
  title: string
  price: number
  oldPrice?: number
  discountPercent?: number
  image: string
  badge?: string
  brand?: string
  part_number?: string
  stock: number
  lowStock?: boolean
  outOfStock?: boolean
  description?: string
  category?: string
}

const onSale = ref<UiProduct[]>([])
const allProducts = ref<UiProduct[]>([])
const isLoadingProducts = ref(false)
const productsError = ref<string | null>(null)

const loadProducts = async () => {
  isLoadingProducts.value = true
  productsError.value = null
  try {
    const response = await productService.getAllProducts({ per_page: 20 })
    if (response && response.data) {
      const transformedProducts: UiProduct[] = response.data.map((product: ApiProduct) =>
        productService.transformProductForFrontend(product) as UiProduct
      )
      const discountedProducts = transformedProducts
        .filter((product) => typeof product.discountPercent === 'number' && product.discountPercent > 0)
        .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0))

      onSale.value = discountedProducts.slice(0, 6)
      allProducts.value = transformedProducts
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
