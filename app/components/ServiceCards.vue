<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '../stores/locale'

interface ServiceCard {
  icon: string
  title: string
  description: string
  ctaText: string
  ctaHref: string
}

// Locale handling
const { t } = useLocale()

const emit = defineEmits<{
  navigateToProducts: []
}>()

const services = computed<ServiceCard[]>(() => [
  {
    icon: 'package',
    title: t('services.qualityParts'),
    description: t('services.qualityPartsDesc'),
    ctaText: t('common.products'),
    ctaHref: '#products'
  },
  {
    icon: 'lightning',
    title: t('services.fastShipping'),
    description: t('services.fastShippingDesc'),
    ctaText: t('common.products'),
    ctaHref: '#products'
  },
  {
    icon: 'support',
    title: t('services.expertSupport'),
    description: t('services.expertSupportDesc'),
    ctaText: t('footer.contact'),
    ctaHref: '#contact'
  }
])

const handleCtaClick = (service: ServiceCard) => {
  if (service.ctaHref === '#products') {
    emit('navigateToProducts')
  }
  // For other CTAs like "Contact Us", you could add more logic here
}
</script>

<template>
  <section class="w-full bg-white py-8">
    <div class="container mx-auto px-6 md:px-10">
      <div class="flex flex-col md:flex-col lg:flex-row gap-4 mx-auto" style="max-width: 100%; width: 100%;">
        <div 
          v-for="service in services" 
          :key="service.title"
          class="flex items-start space-x-4 border border-gray-200 rounded-lg p-6 bg-white shadow-sm flex-1"
          style="height: 180px !important;"
        >
          <!-- Icon -->
          <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <!-- Package Icon -->
            <svg v-if="service.icon === 'package'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 text-white">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            
            <!-- Lightning Icon -->
            <svg v-else-if="service.icon === 'lightning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 text-white">
              <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
            </svg>
            
            <!-- Support Icon -->
            <svg v-else-if="service.icon === 'support'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 text-white">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <path d="M16 11l2 2-2 2"/>
              <path d="M8 11l-2 2 2 2"/>
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <!-- Title -->
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ service.title }}</h3>

            <!-- Description -->
            <p class="text-sm text-gray-600 leading-relaxed mb-4">{{ service.description }}</p>

            <!-- CTA Link -->
            <button 
              @click="handleCtaClick(service)" 
              class="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <span class="text-sm font-medium">{{ service.ctaText }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
