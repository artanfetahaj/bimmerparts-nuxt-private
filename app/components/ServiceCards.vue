<script setup lang="ts">
interface ServiceCard {
  icon: string
  title: string
  description: string
  ctaText: string
  ctaHref: string
}

const services: ServiceCard[] = [
  {
    icon: 'package',
    title: 'Originele & Premium onderdelen',
    description: 'OEM, originele BMW en hoogwaardige aftermarket onderdelen — uitsluitend producten waar we zelf volledig achter staan.',
    ctaText: 'Bekijk onderdelen',
    ctaHref: '/products'
  },
  {
    icon: 'check',
    title: 'Gegarandeerd passend',
    description: 'Wij controleren op kenteken of chassisnummer (VIN) zodat u zeker weet dat het onderdeel bij uw BMW of MINI past.',
    ctaText: 'Meer informatie',
    ctaHref: '/contact'
  },
  {
    icon: 'wrench',
    title: 'Montagepartner TOFFER Automotive',
    description: 'Professionele montage door BMW & MINI specialisten. Één aanspreekpunt voor het juiste onderdeel én vakkundige montage.',
    ctaText: 'Meer over TOFFER',
    ctaHref: '/about'
  },
  {
    icon: 'star',
    title: '4.9 op Trustpilot',
    description: 'Klanten beoordelen ons met een 4.9 op Trustpilot. Kwaliteit en service die voor zichzelf spreken.',
    ctaText: 'Meer informatie',
    ctaHref: '/contact'
  }
]
</script>

<template>
  <section class="w-full bg-white py-8">
    <div class="container mx-auto px-6 md:px-10">
      <div class="flex flex-col lg:flex-row gap-4 items-stretch">
        <div
          v-for="service in services"
          :key="service.title"
          class="flex flex-col border border-gray-200 rounded-lg p-6 bg-white shadow-sm flex-1"
        >
          <!-- Icon + Content wrapper -->
          <div class="flex items-start gap-4 flex-1">
          <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
            <!-- Package -->
            <svg v-if="service.icon === 'package'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 text-white">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <!-- Check / shield -->
            <svg v-else-if="service.icon === 'check'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 text-white">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <!-- Star -->
            <svg v-else-if="service.icon === 'star'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <!-- Wrench -->
            <svg v-else-if="service.icon === 'wrench'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 text-white">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 flex flex-col h-full">
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ service.title }}</h3>
            <p class="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{{ service.description }}</p>

            <NuxtLink
              :to="service.ctaHref"
              class="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 transition-colors mt-auto"
            >
              <span class="text-sm font-medium">{{ service.ctaText }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
            </NuxtLink>
          </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
