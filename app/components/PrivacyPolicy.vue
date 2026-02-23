<script setup lang="ts">
import HeaderNav from './HeaderNav.vue'
import SiteFooter from './SiteFooter.vue'
import { useLocale } from '../stores/locale'

// Locale handling
const { t } = useLocale()

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
    <HeaderNav variant="solid" @navigate-to-products="handleNavigateToProducts" @navigate-to-home="handleHomeClick" @navigate-to-cart="handleNavigateToCart" @navigate-to-about="handleNavigateToAbout" @navigate-to-contact="handleNavigateToContact" @navigate-to-wishlist="handleNavigateToWishlist" @navigate-to-account="handleNavigateToAccount" />

    <!-- Main Content -->
    <div class="container mx-auto px-6 py-8">
      <!-- Date and Title Section -->
      <div class="mb-8">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <!-- Left side - Date and Title -->
          <div class="flex-1">
            <p class="text-sm text-gray-500 mb-4">{{ t('legal.currentAsOf') }}</p>
            <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{{ t('legal.privacy.title') }}</h1>
            
            <!-- Search within policy -->
            <div class="relative max-w-md">
              <input 
                type="text" 
                :placeholder="t('legal.search')" 
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
          </div>
          
          <!-- Right side - Agreement text -->
          <div class="lg:max-w-md">
            <p class="text-gray-600 leading-relaxed">
              {{ t('legal.agreement') }}
            </p>
          </div>
        </div>
      </div>

      <!-- Privacy Policy Content -->
      <div class="max-w-4xl">
        <!-- Introduction -->
        <div class="mb-8">
          <p class="text-gray-700 leading-relaxed mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>

        <!-- What information do we collect? -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">What information do we collect?</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </div>
        </div>

        <!-- How do we use your information? -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">How do we use your information?</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
          </div>
        </div>

        <!-- Do we use cookies and other tracking technologies? -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Do we use cookies and other tracking technologies?</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>

        <!-- How long do we keep your information? -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">How long do we keep your information?</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>

        <!-- How do we keep your information safe? -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">How do we keep your information safe?</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>

        <!-- What are your privacy rights? -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">What are your privacy rights?</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
        </div>

        <!-- How can you contact us about this policy? -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">How can you contact us about this policy?</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <ol class="list-decimal list-inside space-y-2 text-gray-700">
              <li>Lorem ipsum dolor sit amet consectetur</li>
              <li>Adipiscing elit sed do eiusmod tempor</li>
              <li>Incididunt ut labore et dolore magna</li>
            </ol>
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
