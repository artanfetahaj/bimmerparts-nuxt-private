<script setup lang="ts">
import productService from '../services/product'
import type { Product as ApiProduct } from '../services/product'

// Fetched during SSR so the product sections are in the initial HTML.
const { data: allProducts } = await useAsyncData<ApiProduct[]>('home-products', async () => {
  try {
    const response = await productService.getAllProducts({ per_page: 20 })
    return response?.data ?? []
  } catch (error) {
    console.error('Failed to load products:', error)
    return []
  }
}, { default: () => [] })

const onSale = computed(() =>
  (allProducts.value ?? [])
    .filter((p) => p.has_discount)
    .sort((a, b) => (Number(b.sale_percentage) || 0) - (Number(a.sale_percentage) || 0))
    .slice(0, 6),
)
</script>

<template>
  <div>
    <HomeHero image="/images/hero.jpg" />
    <ServiceCards />
    <HomeReviews />
    <HomeInstallation />
    <BrandsRow />
    <ProductSection v-if="onSale.length > 0" :title="'In de aanbieding'" :products="onSale" />
    <ProductSection :title="'Alle producten'" :products="allProducts" />
  </div>
</template>
