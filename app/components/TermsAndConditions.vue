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
            <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{{ t('legal.terms.title') }}</h1>
            
            <!-- Search within terms -->
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

      <!-- Terms and Conditions Content -->
      <div class="max-w-4xl">
        <!-- Introduction -->
        <div class="mb-8">
          <p class="text-gray-700 leading-relaxed mb-6">
            Welcome to BIMMERParts. These terms and conditions outline the rules and regulations for the use of our website and services. By accessing this website, we assume you accept these terms and conditions.
          </p>
        </div>

        <!-- Acceptance of Terms -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p class="text-gray-700 leading-relaxed">
              These terms apply to all visitors, users, and others who access or use the service. Your continued use of the service after any such changes constitutes your acceptance of the new terms.
            </p>
            <p class="text-gray-700 leading-relaxed">
              We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes.
            </p>
          </div>
        </div>

        <!-- Use License -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Use License</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Permission is granted to temporarily download one copy of the materials on BIMMERParts' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to reverse engineer any software contained on the website; or remove any copyright or other proprietary notations from the materials.
            </p>
            <p class="text-gray-700 leading-relaxed">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by BIMMERParts at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
            </p>
          </div>
        </div>

        <!-- Product Information and Pricing -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Product Information and Pricing</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              All product descriptions, images, and specifications are provided for informational purposes only. We strive to ensure accuracy but cannot guarantee that all information is complete, reliable, current, or error-free.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Prices are subject to change without notice. All prices are in Euros and include applicable taxes unless otherwise stated. We reserve the right to modify or discontinue any product or service without prior notice.
            </p>
          </div>
        </div>

        <!-- Orders and Payment -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Orders and Payment</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              When you place an order, you are making an offer to purchase products. We reserve the right to accept or decline your order for any reason, including but not limited to product availability, errors in product description or pricing, or problems identified by our credit and fraud avoidance department.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Payment must be received before we can process and ship your order. We accept major credit cards and other payment methods as indicated during checkout. All payments are processed securely through our payment partners.
            </p>
          </div>
        </div>

        <!-- Shipping and Delivery -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Shipping and Delivery</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              We will make every effort to ship your order within the timeframes specified. However, delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or other circumstances beyond our control.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Risk of loss and title for products purchased from our website pass to you upon delivery to the carrier. You are responsible for filing any claims with carriers for damaged and/or lost shipments.
            </p>
          </div>
        </div>

        <!-- Returns and Refunds -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Returns and Refunds</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              We offer a 30-day return policy for most items. Items must be returned in their original condition with all original packaging and accessories. Custom or personalized items may not be eligible for return.
            </p>
            <p class="text-gray-700 leading-relaxed">
              To initiate a return, please contact our customer service team. Refunds will be processed to the original payment method within 5-10 business days after we receive and inspect the returned item.
            </p>
          </div>
        </div>

        <!-- Limitation of Liability -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              In no event shall BIMMERParts, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
            <p class="text-gray-700 leading-relaxed">
              Our total liability to you for all damages shall not exceed the amount you paid us for the products or services giving rise to the claim. This limitation applies regardless of the legal theory on which the claim is based.
            </p>
          </div>
        </div>

        <!-- Governing Law -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              These terms and conditions are governed by and construed in accordance with the laws of the Netherlands. Any disputes relating to these terms and conditions will be subject to the exclusive jurisdiction of the courts of Amsterdam.
            </p>
            <p class="text-gray-700 leading-relaxed">
              If any provision of these terms is held to be invalid or unenforceable by a court, the remaining provisions of these terms will remain in effect.
            </p>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
          <div class="space-y-4">
            <p class="text-gray-700 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <ol class="list-decimal list-inside space-y-2 text-gray-700">
              <li>Email: contact@bimmer.nl</li>
              <li>Phone: +31 20 499 324 009</li>
              <li>Address: Bimmer Parts - Amsterdam, Netherlands</li>
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
