<script setup lang="ts">
import HeaderNav from './HeaderNav.vue'
import SiteFooter from './SiteFooter.vue'
import { useLocale } from '../stores/locale'

const emit = defineEmits<{
  navigateToHome: []
  navigateToProducts: []
  navigateToCart: []
  navigateToAbout: []
  navigateToContact: []
  navigateToWishlist: []
  navigateToAccount: []
  navigateToTerms: []
  navigateToPrivacy: []
}>()

const handleHomeClick = () => {
  emit('navigateToHome')
}

const handleNavigateToProducts = () => {
  emit('navigateToProducts')
}

const handleNavigateToCart = () => {
  emit('navigateToCart')
}

const handleNavigateToAbout = () => {
  emit('navigateToAbout')
}

const handleNavigateToContact = () => {
  emit('navigateToContact')
}

// Locale handling
const { t } = useLocale()

const handleNavigateToWishlist = () => {
  emit('navigateToWishlist')
}

const handleNavigateToAccount = () => {
  emit('navigateToAccount')
}

const handleNavigateToTerms = () => {
  emit('navigateToTerms')
}

const handleNavigateToPrivacy = () => {
  emit('navigateToPrivacy')
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-16">
      <!-- About Us Section -->
      <div class="mb-20">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <!-- Left Side - Text Content -->
          <div class="space-y-6">
            <div class="space-y-4">
              <h2 class="text-orange-500 text-sm font-medium uppercase tracking-wide">{{ t('about.title') }}</h2>
              <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {{ t('about.subtitle') }}
              </h1>
            </div>
            
            <div class="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
          
          <!-- Right Side - Image -->
          <div class="relative">
            <img 
              src="/images/about-us-banner.png" 
              alt="Car parts and automotive components" 
              class="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      <!-- Foundation Section -->
      <div class="mb-20">
        <div class="space-y-8">
          <div class="space-y-4">
            <h2 class="text-orange-500 text-sm font-medium uppercase tracking-wide">Foundation</h2>
            <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Establishment of the company
            </h1>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Left Column -->
            <div class="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
            
            <!-- Right Column -->
            <div class="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <SiteFooter @navigate-to-about="handleNavigateToAbout" @navigate-to-contact="handleNavigateToContact" @navigate-to-terms="handleNavigateToTerms" @navigate-to-privacy="handleNavigateToPrivacy" />
  </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
