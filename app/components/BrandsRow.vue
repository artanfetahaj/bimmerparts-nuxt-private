<script setup lang="ts">
import { useLocale } from '../stores/locale'

interface Brand {
  name: string
  logo?: string
}

// Locale handling
const { t } = useLocale()

const emit = defineEmits<{
  navigateToBrands: []
}>()

const handleSeeAllClick = () => {
  emit('navigateToBrands')
}

// Homepage brands: use real brands consistent with Brands.vue
// (Genuine BMW + bekende aftermarket merken)
const brands: Brand[] = [
  { name: 'Genuine BMW', logo: 'diamond' },
  { name: 'Bosch', logo: 'hexagon' },
  { name: 'Sachs', logo: 'sphere' },
  { name: 'Lemförder', logo: 'wave' },
  { name: 'Brembo', logo: 'lightning' },
  { name: 'Meyle', logo: 'feather' },
  { name: 'Febi', logo: 'atom' },
  { name: 'Bilstein', logo: 'cloud' },
]
</script>

<template>
  <section class="w-full bg-white py-6">
    <div class="container mx-auto px-4 sm:px-6 md:px-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">{{ t('brands.title') }}</h2>
        <button @click="handleSeeAllClick" class="text-orange-500 hover:text-orange-600 font-medium flex-shrink-0 ml-4 cursor-pointer">{{ t('brands.seeAll') }}</button>
      </div>
      <!-- Mobile: horizontal scroll, compact items -->
      <div class="flex md:hidden items-center gap-5 overflow-x-auto no-scrollbar pb-2">
        <div v-for="(brand, i) in brands" :key="i" class="flex-none inline-flex items-center gap-2">
          <div v-if="brand.logo" class="w-6 h-6 flex items-center justify-center">
            <!-- Diamond Logo -->
            <div v-if="brand.logo === 'diamond'" class="w-5 h-5 bg-blue-500 flex items-center justify-center" style="clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);">
              <div class="w-2.5 h-2.5 bg-white transform rotate-45"></div>
            </div>
            
            <!-- Feather Logo -->
            <div v-else-if="brand.logo === 'feather'" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <div class="flex flex-col items-center justify-center space-y-1">
                <div class="w-3.5 h-0.5 bg-white rounded"></div>
                <div class="w-3 h-0.5 bg-white rounded"></div>
                <div class="w-2 h-0.5 bg-white rounded"></div>
              </div>
            </div>
            
            <!-- Sphere Logo -->
            <div v-else-if="brand.logo === 'sphere'" class="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 text-white">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            
            <!-- Lightning Logo -->
            <div v-else-if="brand.logo === 'lightning'" class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-white">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
              </svg>
            </div>
            
            <!-- Wave Logo -->
            <div v-else-if="brand.logo === 'wave'" class="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 text-white">
                <path d="M3 12c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6z"/>
                <path d="M15 12c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6z"/>
              </svg>
            </div>
            
            <!-- Hexagon Logo -->
            <div v-else-if="brand.logo === 'hexagon'" class="w-5 h-5 bg-indigo-500 rounded-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-white">
                <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z"/>
              </svg>
            </div>
            
            <!-- Speed Logo -->
            <div v-else-if="brand.logo === 'speed'" class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            
            <!-- Atom Logo -->
            <div v-else-if="brand.logo === 'atom'" class="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 text-white">
                <circle cx="12" cy="12" r="1"/>
                <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z"/>
                <path d="M3.8 3.8c-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5 2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5z"/>
              </svg>
            </div>
            
            <!-- Grid Logo -->
            <div v-else-if="brand.logo === 'grid'" class="w-5 h-5 bg-gray-600 rounded-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5 text-white">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            
            <!-- Hammer Logo -->
            <div v-else-if="brand.logo === 'hammer'" class="w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-white">
                <path d="M20.7 7.07l-1.64-1.63c-.39-.39-1.02-.39-1.41 0L9.12 14.4l1.41 1.41 8.52-8.52.35.35-3.89 3.89 1.41 1.41 3.89-3.89.35.35-6.36 6.36 1.41 1.41 6.36-6.36c.39-.39.39-1.02 0-1.41z"/>
                <path d="M8.94 15.12L2 22.06l1.41 1.41 6.94-6.94-1.41-1.41z"/>
              </svg>
            </div>
            
            <!-- Cloud Logo -->
            <div v-else-if="brand.logo === 'cloud'" class="w-5 h-5 bg-sky-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-white">
                <path d="M18.36 9.64c-.98 0-1.85.5-2.35 1.26-.5-.76-1.37-1.26-2.35-1.26-1.54 0-2.8 1.26-2.8 2.8 0 .28.04.55.12.8-.08-.25-.12-.52-.12-.8 0-1.54-1.26-2.8-2.8-2.8-.98 0-1.85.5-2.35 1.26-.5-.76-1.37-1.26-2.35-1.26-1.54 0-2.8 1.26-2.8 2.8s1.26 2.8 2.8 2.8h15.2c1.54 0 2.8-1.26 2.8-2.8s-1.26-2.8-2.8-2.8z"/>
              </svg>
            </div>
          </div>
          <span class="text-gray-900 font-medium text-sm whitespace-nowrap">{{ brand.name }}</span>
        </div>
      </div>

      <!-- Tablet: grid layout (show only first 4)
           Use up to xl breakpoint so iPad Pro (1024px) stays on this layout -->
      <div class="hidden md:grid xl:hidden md:grid-cols-4 gap-4 pb-4">
        <div v-for="(brand, i) in brands.slice(0, 4)" :key="i" class="flex items-center gap-3 justify-center">
          <div v-if="brand.logo" class="w-8 h-8 flex items-center justify-center">
            <div v-if="brand.logo === 'diamond'" class="w-6 h-6 bg-blue-500 flex items-center justify-center" style="clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);">
              <div class="w-3 h-3 bg-white transform rotate-45"></div>
            </div>
            <div v-else-if="brand.logo === 'feather'" class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div class="flex flex-col items-center justify-center space-y-1">
                <div class="w-4 h-1 bg-white rounded"></div>
                <div class="w-3 h-1 bg-white rounded"></div>
                <div class="w-2 h-1 bg-white rounded"></div>
              </div>
            </div>
            <div v-else-if="brand.logo === 'sphere'" class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-white">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'lightning'" class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'wave'" class="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-white">
                <path d="M3 12c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6z"/>
                <path d="M15 12c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'hexagon'" class="w-6 h-6 bg-indigo-500 rounded-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'speed'" class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'atom'" class="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-white">
                <circle cx="12" cy="12" r="1"/>
                <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z"/>
                <path d="M3.8 3.8c-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5 2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'grid'" class="w-6 h-6 bg-gray-600 rounded-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-white">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'hammer'" class="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                <path d="M20.7 7.07l-1.64-1.63c-.39-.39-1.02-.39-1.41 0L9.12 14.4l1.41 1.41 8.52-8.52.35.35-3.89 3.89 1.41 1.41 3.89-3.89.35.35-6.36 6.36 1.41 1.41 6.36-6.36c.39-.39.39-1.02 0-1.41z"/>
                <path d="M8.94 15.12L2 22.06l1.41 1.41 6.94-6.94-1.41-1.41z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'cloud'" class="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                <path d="M18.36 9.64c-.98 0-1.85.5-2.35 1.26-.5-.76-1.37-1.26-2.35-1.26-1.54 0-2.8 1.26-2.8 2.8 0 .28.04.55.12.8-.08-.25-.12-.52-.12-.8 0-1.54-1.26-2.8-2.8-2.8-.98 0-1.85.5-2.35 1.26-.5-.76-1.37-1.26-2.35-1.26-1.54 0-2.8 1.26-2.8 2.8s1.26 2.8 2.8 2.8h15.2c1.54 0 2.8-1.26 2.8-2.8s-1.26-2.8-2.8-2.8z"/>
              </svg>
            </div>
          </div>
          <span class="text-gray-900 font-semibold text-2xl">{{ brand.name }}</span>
        </div>
      </div>

      <!-- Desktop: grid layout (show all 8) starts at xl to avoid crowding on 1024px -->
      <div class="hidden xl:grid xl:grid-cols-8 gap-6 pb-4">
        <div v-for="(brand, i) in brands" :key="i" class="flex items-center gap-3 justify-center">
          <div v-if="brand.logo" class="w-8 h-8 flex items-center justify-center">
            <div v-if="brand.logo === 'diamond'" class="w-6 h-6 bg-blue-500 flex items-center justify-center" style="clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);">
              <div class="w-3 h-3 bg-white transform rotate-45"></div>
            </div>
            <div v-else-if="brand.logo === 'feather'" class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <div class="flex flex-col items-center justify-center space-y-1">
                <div class="w-4 h-1 bg-white rounded"></div>
                <div class="w-3 h-1 bg-white rounded"></div>
                <div class="w-2 h-1 bg-white rounded"></div>
              </div>
            </div>
            <div v-else-if="brand.logo === 'sphere'" class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-white">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'lightning'" class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'wave'" class="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-white">
                <path d="M3 12c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6z"/>
                <path d="M15 12c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'hexagon'" class="w-6 h-6 bg-indigo-500 rounded-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'speed'" class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-white">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'atom'" class="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-white">
                <circle cx="12" cy="12" r="1"/>
                <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z"/>
                <path d="M3.8 3.8c-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5 2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'grid'" class="w-6 h-6 bg-gray-600 rounded-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-white">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'hammer'" class="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                <path d="M20.7 7.07l-1.64-1.63c-.39-.39-1.02-.39-1.41 0L9.12 14.4l1.41 1.41 8.52-8.52.35.35-3.89 3.89 1.41 1.41 3.89-3.89.35.35-6.36 6.36 1.41 1.41 6.36-6.36c.39-.39.39-1.02 0-1.41z"/>
                <path d="M8.94 15.12L2 22.06l1.41 1.41 6.94-6.94-1.41-1.41z"/>
              </svg>
            </div>
            <div v-else-if="brand.logo === 'cloud'" class="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
                <path d="M18.36 9.64c-.98 0-1.85.5-2.35 1.26-.5-.76-1.37-1.26-2.35-1.26-1.54 0-2.8 1.26-2.8 2.8 0 .28.04.55.12.8-.08-.25-.12-.52-.12-.8 0-1.54-1.26-2.8-2.8-2.8-.98 0-1.85.5-2.35 1.26-.5-.76-1.37-1.26-2.35-1.26-1.54 0-2.8 1.26-2.8 2.8s1.26 2.8 2.8 2.8h15.2c1.54 0 2.8-1.26 2.8-2.8s-1.26-2.8-2.8-2.8z"/>
              </svg>
            </div>
          </div>
          <span class="text-gray-900 font-semibold text-2xl">{{ brand.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* hide scrollbars on mobile list */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>


