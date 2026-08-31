<script setup lang="ts">
interface Brand {
  name: string
  logo: string
  brandParam: string
  wide?: boolean
  href?: string
  cta?: string
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
    href: '/cobra-suspension',
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
    href: '/eventuri',
    cta: 'Wil je kijken welke Eventuri upgrade er voor jouw BMW of MINI is? Klik dan hier',
  },
]
</script>

<template>
  <section class="w-full bg-white py-8 border-t border-b border-gray-100">
    <div class="container mx-auto px-6 md:px-10">
      <h2 class="text-2xl font-normal text-gray-900 mb-6">Partnermerken</h2>
      <div class="flex flex-wrap justify-between gap-6 md:gap-10">
        <NuxtLink
          v-for="brand in brands"
          :key="brand.brandParam"
          :to="brand.href ?? `/products?brand=${encodeURIComponent(brand.brandParam)}`"
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

      <!-- Eventuri CTA -->
      <p class="mt-4 text-sm text-gray-600">
        Wil je kijken welke Eventuri upgrade er voor jouw BMW of MINI is?
        <NuxtLink
          to="/eventuri"
          class="text-orange-500 hover:underline font-medium"
        >Klik dan hier</NuxtLink>
      </p>
    </div>
  </section>
</template>
