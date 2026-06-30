<script setup lang="ts">
interface Brand {
  name: string
  logo: string
  brandParam: string
  wide?: boolean
}

const brands: Brand[] = [
  {
    name: 'K&N Performance Filters',
    logo: '/images/K&N-Performance filters-logo.png',
    brandParam: 'K&N',
  },
  {
    name: 'Cobra Suspensions',
    logo: '/images/Cobra-suspensions-logo.png',
    brandParam: 'Cobra',
  },
  {
    name: 'Strongflex',
    logo: '/images/Strongflex-logo.png',
    brandParam: 'Strongflex',
    wide: true,
  },
  {
    name: 'Eventuri',
    logo: '/images/Eventuri-logo.png',
    brandParam: 'Eventuri',
    wide: true,
  },
]
</script>

<template>
  <section class="w-full bg-white py-8 border-t border-b border-gray-100">
    <div class="container mx-auto  sm:px-6 md:px-10">
      <h2 class="text-lg font-semibold text-gray-900 mb-6">Partner Brands</h2>
      <div class="flex flex-wrap justify-between gap-6 md:gap-10">
        <NuxtLink
          v-for="brand in brands"
          :key="brand.brandParam"
          :to="`/products?brand=${encodeURIComponent(brand.brandParam)}`"
          :class="[
            brand.wide ? 'max-w-[400px]' : 'max-w-[300px]',
            brand.brandParam === 'Eventuri' ? 'pb-6' : '',
            'flex w-[calc(50%-12px)] md:w-auto md:flex-1 group'
          ]"
        >
          <NuxtImg
            :src="brand.logo"
            :alt="brand.name"
            class="max-h-[500px] w-full object-contain"
          />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
