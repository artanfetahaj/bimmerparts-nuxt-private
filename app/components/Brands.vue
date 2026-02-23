<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import HeaderNav from './HeaderNav.vue'
import SiteFooter from './SiteFooter.vue'
import { useLocale } from '../stores/locale'
import { getBmwBrands, type BmwBrand } from '../services/bmw'

interface Brand extends BmwBrand {
  logo?: string
}

const emit = defineEmits<{
  navigateToHome: []
  navigateToProducts: [params: { series?: string; modelId?: number; brand?: string }]
  navigateToCart: []
  navigateToAbout: []
  navigateToContact: []
  navigateToWishlist: []
  navigateToAccount: []
  navigateToTerms: []
  navigateToPrivacy: []
}>()

const { t } = useLocale()

const allBrands = ref<Brand[]>([])
const displayedBrands = ref<Brand[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const itemsPerPage = 12
const currentPage = ref(1)

// BMW Parts Brands with descriptions
const bmwBrandsData: Array<{ name: string; logo: string; description: string; category: string }> = [
  // OEM
  { name: 'Genuine BMW', logo: 'diamond', description: 'Original Equipment Manufacturer parts directly from BMW, ensuring perfect fit and factory quality for your vehicle.', category: 'OEM' },
  
  // Major Aftermarket Suppliers
  { name: 'Bosch', logo: 'circle', description: 'Leading supplier of engine components, electronics, and automotive systems. Known for reliability and innovation in automotive technology.', category: 'Engine/Electronics' },
  { name: 'Sachs', logo: 'sphere', description: 'Premium suspension components and clutches. Trusted by BMW owners for OEM-quality replacement parts.', category: 'Suspension' },
  { name: 'Lemförder', logo: 'radiate', description: 'High-quality steering and suspension components. German engineering excellence for precise handling and durability.', category: 'Suspension/Steering' },
  { name: 'Brembo', logo: 'lightning', description: 'World-renowned brake systems manufacturer. Performance brakes trusted by racing teams and enthusiasts worldwide.', category: 'Brakes' },
  { name: 'Meyle', logo: 'wave', description: 'German-made suspension and steering parts. Meyle HD line offers enhanced durability for demanding driving conditions.', category: 'Suspension' },
  { name: 'Febi', logo: 'feather', description: 'Quality replacement parts for BMW vehicles. Comprehensive range of suspension, steering, and engine components.', category: 'Aftermarket' },
  { name: 'Bilstein', logo: 'sun', description: 'Premium shock absorbers and suspension systems. From comfort to performance, Bilstein offers solutions for every BMW model.', category: 'Suspension' },
  { name: 'Hella', logo: 'radiate', description: 'Leading manufacturer of lighting systems and electronics. OEM-quality headlights, taillights, and electronic components.', category: 'Lighting' },
  { name: 'Mahle', logo: 'circle', description: 'Expert in engine components, filters, and gaskets. Precision-engineered parts for optimal engine performance and longevity.', category: 'Engine/Filters' },
  { name: 'ZF', logo: 'interlock', description: 'Premium transmission and steering components. ZF parts are used as original equipment by BMW and offer exceptional quality.', category: 'Transmission/Steering' },
  { name: 'Continental', logo: 'wave', description: 'Advanced automotive systems including sensors, electronics, and engine components. Innovation-driven solutions for modern BMWs.', category: 'Electronics' },
  
  // Brakes
  { name: 'EBC', logo: 'lightning', description: 'High-performance brake pads and rotors. From daily driving to track use, EBC offers superior stopping power.', category: 'Brakes' },
  { name: 'Ferodo', logo: 'diamond', description: 'Premium brake friction materials. Racing heritage meets daily driving reliability for confident braking performance.', category: 'Brakes' },
  { name: 'ATE', logo: 'circle', description: 'German brake components manufacturer. OEM-quality brake pads, rotors, and fluid for BMW vehicles.', category: 'Brakes' },
  { name: 'Pagid', logo: 'sphere', description: 'High-performance brake pads with excellent fade resistance. Trusted by BMW enthusiasts for spirited driving.', category: 'Brakes' },
  { name: 'Textar', logo: 'radiate', description: 'Premium brake pads and linings. German engineering for reliable and consistent braking performance.', category: 'Brakes' },
  
  // Suspension/Steering
  { name: 'H&R', logo: 'sun', description: 'Premium lowering springs and suspension components. Enhance your BMW\'s handling and appearance with German-engineered parts.', category: 'Suspension' },
  { name: 'Koni', logo: 'wave', description: 'Adjustable shock absorbers and suspension systems. Fine-tune your BMW\'s ride quality and performance characteristics.', category: 'Suspension' },
  { name: 'Thyssenkrupp', logo: 'interlock', description: 'Steering and suspension components. OEM supplier providing high-quality replacement parts for BMW vehicles.', category: 'Steering' },
  
  // Engine/Electronics
  { name: 'Mann', logo: 'feather', description: 'Premium filters and engine components. Air, oil, and fuel filters designed to protect your BMW\'s engine.', category: 'Filters' },
  { name: 'Behr', logo: 'circle', description: 'Cooling system components and radiators. Keep your BMW running at optimal temperature with Behr quality parts.', category: 'Cooling' },
  { name: 'Valeo', logo: 'radiate', description: 'Lighting, wiper systems, and engine components. Comprehensive range of parts for BMW maintenance and upgrades.', category: 'Lighting/Engine' },
  { name: 'Pierburg', logo: 'wave', description: 'Engine management components and sensors. Precision parts for optimal engine performance and efficiency.', category: 'Engine' },
  { name: 'VDO', logo: 'sun', description: 'Instrumentation and electronics. Gauges, sensors, and electronic components for BMW vehicles.', category: 'Electronics' },
  
  // Filtration/Gaskets
  { name: 'Elring', logo: 'circle', description: 'Premium gaskets and seals. Prevent leaks and maintain engine integrity with Elring\'s precision-engineered components.', category: 'Gaskets' },
  
  // Exhaust
  { name: 'Akrapovic', logo: 'lightning', description: 'Premium titanium and carbon fiber exhaust systems. World-class performance exhausts for BMW M models and enthusiasts.', category: 'Exhaust' },
  { name: 'Magnaflow', logo: 'wave', description: 'Performance exhaust systems and mufflers. Enhanced sound and power for your BMW with quality American engineering.', category: 'Exhaust' },
  { name: 'Borla', logo: 'radiate', description: 'Performance exhaust systems. Deep, aggressive sound and improved power delivery for BMW vehicles.', category: 'Exhaust' },
  
  // Performance & Tuning
  { name: 'Dinan', logo: 'diamond', description: 'BMW-specific performance upgrades and tuning. Engineered specifically for BMW vehicles with warranty-backed modifications.', category: 'Tuning' },
  { name: 'BootMod3', logo: 'lightning', description: 'Advanced ECU tuning platform. Unlock your BMW\'s potential with professional-grade engine calibration software.', category: 'ECU Tuning' },
  { name: 'Active Autowerke', logo: 'sun', description: 'BMW performance specialists. Exhaust systems, intakes, and engine tuning for enhanced power and sound.', category: 'Tuning' },
  { name: 'aFe Power', logo: 'wave', description: 'Performance air intakes and exhaust systems. Increase horsepower and improve throttle response with aFe Power.', category: 'Intake/Exhaust' },
  { name: 'Eventuri', logo: 'radiate', description: 'Carbon fiber intake systems. Advanced aerodynamics and filtration for maximum engine performance and stunning aesthetics.', category: 'Intake' },
  { name: 'AWE Tuning', logo: 'circle', description: 'Performance exhaust systems and intakes. Handcrafted in the USA for BMW vehicles seeking enhanced power and sound.', category: 'Exhaust/Intake' },
  { name: 'Forge Motorsport', logo: 'interlock', description: 'Performance intercoolers and intake systems. Boost your BMW\'s forced induction performance with Forge components.', category: 'Intake/Cooling' },
  { name: 'CTS Turbo', logo: 'lightning', description: 'Performance turbo upgrades and intercoolers. Maximize your BMW\'s turbocharged potential with CTS Turbo parts.', category: 'Turbo' },
  
  // Wheels/Suspension
  { name: 'Apex Wheels', logo: 'circle', description: 'Lightweight forged wheels for BMW. Track-proven designs that reduce unsprung weight and enhance performance.', category: 'Wheels' },
  { name: 'KW Automotive', logo: 'sun', description: 'Premium coilover suspension systems. Adjustable height and damping for the perfect balance of comfort and performance.', category: 'Suspension' }
]

// Map brand names to logo types
const getBrandLogo = (name: string): string | undefined => {
  const brand = bmwBrandsData.find(b => b.name === name)
  return brand?.logo
}

// Get brand description
const getBrandDescription = (name: string): string => {
  const brand = bmwBrandsData.find(b => b.name === name)
  return brand?.description || `From individual car owners to large auto repair shops, we cater to a diverse clientele, all united by their pursuit of quality and performance.`
}

const loadBrands = async () => {
  loading.value = true
  error.value = null
  try {
    // Try to load from API first, then merge with static data
    let apiBrands: BmwBrand[] = []
    try {
      apiBrands = await getBmwBrands()
    } catch (err) {
      console.warn('Could not load brands from API, using static data')
    }
    
    // Create a map of API brands
    const apiBrandMap = new Map(apiBrands.map(b => [b.name, b]))
    
    // Combine static brands with API brands, prioritizing API data
    const combinedBrands = bmwBrandsData.map((staticBrand, index) => {
      const apiBrand = apiBrandMap.get(staticBrand.name)
      return {
        id: apiBrand?.id || (index + 1),
        name: staticBrand.name,
        code: apiBrand?.code || staticBrand.name.substring(0, 3).toUpperCase(),
        description: apiBrand?.description || staticBrand.description,
        is_active: apiBrand?.is_active ?? true,
        sort_order: apiBrand?.sort_order ?? index,
        logo: staticBrand.logo || 'circle'
      }
    })
    
    // Add any API brands not in our static list
    apiBrands.forEach(apiBrand => {
      if (!bmwBrandsData.find(b => b.name === apiBrand.name)) {
        combinedBrands.push({
          ...apiBrand,
          logo: getBrandLogo(apiBrand.name) || 'circle',
          description: apiBrand.description || getBrandDescription(apiBrand.name)
        })
      }
    })
    
    allBrands.value = combinedBrands
    
    // Load initial page
    loadPage(1)
  } catch (err) {
    console.error('Error loading brands:', err)
    error.value = 'Failed to load brands. Please try again later.'
  } finally {
    loading.value = false
  }
}

const loadPage = (page: number) => {
  const start = 0
  const end = page * itemsPerPage
  displayedBrands.value = allBrands.value.slice(start, end)
  currentPage.value = page
}

const handleLoadMore = () => {
  const nextPage = currentPage.value + 1
  loadPage(nextPage)
}

const hasMore = computed(() => {
  return displayedBrands.value.length < allBrands.value.length
})

const handleBrandClick = (brand: Brand) => {
  // Navigate to products page filtered by the selected brand
  emit('navigateToProducts', { brand: brand.name })
}

onMounted(() => {
  loadBrands()
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <HeaderNav 
      variant="solid" 
      @navigate-to-products="(params) => emit('navigateToProducts', params)" 
      @navigate-to-home="emit('navigateToHome')" 
      @navigate-to-cart="emit('navigateToCart')" 
      @navigate-to-about="emit('navigateToAbout')" 
      @navigate-to-contact="emit('navigateToContact')" 
      @navigate-to-wishlist="emit('navigateToWishlist')" 
      @navigate-to-account="emit('navigateToAccount')" 
    />

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-16">
      <!-- Page Header -->
      <div class="mb-12 text-center">
        <p class="text-orange-500 text-sm font-medium uppercase tracking-wide mb-2">
          {{ t('brands.title') || 'Our Brands' }}
        </p>
        <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 mx-auto" style="color: #1e3a8a;">
          {{ t('brands.pageTitle') || 'BimmerParts - Your Source For Auto Parts' }}
        </h1>
        <p class="text-gray-600 text-lg max-w-3xl mx-auto">
          {{ t('brands.description') || 'From individual car owners to large auto repair shops, we cater to a diverse clientele, all united by their pursuit of quality and performance.' }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p class="text-gray-600">{{ t('products.loading') || 'Loading brands...' }}</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-20">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button 
          @click="loadBrands" 
          class="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {{ t('common.retry') || 'Try Again' }}
        </button>
      </div>

      <!-- Brands Grid -->
      <div v-else-if="displayedBrands.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[25px] mb-12">
        <div
          v-for="brand in displayedBrands"
          :key="brand.id"
          @click="() => handleBrandClick(brand)"
          class="group relative bg-gradient-to-b from-white to-gray-50 border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl"
          style="border-radius: 30px; border-width: 1px; height: 343px;"
        >
          <!-- Logo and Brand Name (always visible) -->
          <div class="relative z-20 h-full flex flex-col items-center justify-center" style="padding-left: 35px; padding-right: 35px; padding-top: 35px; padding-bottom: 35px;">
            <!-- Logo and Brand Name Row -->
            <div class="flex items-center gap-2">
              <!-- Brand Logo -->
              <div v-if="brand.logo" class="flex-shrink-0">
                <!-- Diamond Logo -->
                <div v-if="brand.logo === 'diamond'" class="w-10 h-10 bg-blue-600 flex items-center justify-center" style="clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);">
                  <div class="w-5 h-5 bg-white transform rotate-45"></div>
                </div>
                
                <!-- Feather Logo -->
                <div v-else-if="brand.logo === 'feather'" class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <div class="flex flex-col items-center justify-center space-y-0.5">
                    <div class="w-3 h-0.5 bg-white rounded"></div>
                    <div class="w-2.5 h-0.5 bg-white rounded"></div>
                    <div class="w-2 h-0.5 bg-white rounded"></div>
                  </div>
                </div>
                
                <!-- Sphere Logo -->
                <div v-else-if="brand.logo === 'sphere'" class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-white">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                
                <!-- Lightning Logo -->
                <div v-else-if="brand.logo === 'lightning'" class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white">
                    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
                  </svg>
                </div>
                
                <!-- Wave Logo -->
                <div v-else-if="brand.logo === 'wave'" class="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-white">
                    <path d="M3 12c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6z"/>
                    <path d="M15 12c0-3 2-6 6-6s6 3 6 6-2 6-6 6-6-3-6-6z"/>
                  </svg>
                </div>
                
                <!-- Box Logo -->
                <div v-else-if="brand.logo === 'box'" class="w-10 h-10 bg-gray-800 rounded flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-white">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
                
                <!-- Sun Logo -->
                <div v-else-if="brand.logo === 'sun'" class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white">
                    <circle cx="12" cy="12" r="4"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                  </svg>
                </div>
                
                <!-- Circle Logo -->
                <div v-else-if="brand.logo === 'circle'" class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                  <div class="w-5 h-5 border-2 border-white rounded-full"></div>
                </div>
                
                <!-- Radiate Logo -->
                <div v-else-if="brand.logo === 'radiate'" class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white">
                    <circle cx="12" cy="12" r="2"/>
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                </div>
                
                <!-- Interlock Logo -->
                <div v-else-if="brand.logo === 'interlock'" class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                    <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4"/>
                  </svg>
                </div>
                
                <!-- Catalog Logo -->
                <div v-else-if="brand.logo === 'catalog'" class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-lg">C</span>
                </div>
                
                <!-- Capsule Logo -->
                <div v-else-if="brand.logo === 'capsule'" class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white">
                    <ellipse cx="12" cy="12" rx="8" ry="4"/>
                    <ellipse cx="12" cy="12" rx="4" ry="8"/>
                  </svg>
                </div>
                
                <!-- Default/Initial Logo -->
                <div v-else class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-gray-600 font-bold text-base">{{ brand.name.charAt(0).toUpperCase() }}</span>
                </div>
              </div>
              <div v-else class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="text-gray-600 font-bold text-base">{{ brand.name.charAt(0).toUpperCase() }}</span>
              </div>
              
              <!-- Brand Name -->
              <h3 class="font-bold text-gray-900 text-base leading-tight">
                {{ brand.name }}
              </h3>
            </div>
            
            <!-- Description (always visible; hover still shows gradient) -->
            <div class="absolute bottom-0 left-0 right-0 opacity-100 transition-opacity duration-300" style="padding-left: 35px; padding-right: 35px; padding-bottom: 35px;">
              <p class="text-sm text-gray-700 leading-relaxed text-center">
                {{ brand.description }}
              </p>
            </div>
          </div>

          <!-- Gradient overlay on hover -->
          <div class="absolute inset-0 bg-gradient-to-b from-white to-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 pointer-events-none" style="border-radius: 30px;"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <p class="text-gray-600 text-lg">{{ t('brands.empty') || 'No brands available' }}</p>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && !loading && !error" class="text-center mt-8">
        <button
          @click="handleLoadMore"
          class="px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto"
        >
          Load more
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Footer -->
    <SiteFooter 
      @navigate-to-about="emit('navigateToAbout')" 
      @navigate-to-contact="emit('navigateToContact')" 
      @navigate-to-terms="emit('navigateToTerms')" 
      @navigate-to-privacy="emit('navigateToPrivacy')" 
    />
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>

