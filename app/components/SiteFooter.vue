<script setup lang="ts">
import { useLocale } from '../stores/locale'
import { useCategoryStore } from '../stores/category.store'

const { t } = useLocale()
const categoryStore = useCategoryStore()
</script>

<template>
  <footer class="mt-10 bg-white">
    <div class="outer-container py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Left Section: Logo & Description -->
        <div class="md:col-span-1">
          <img src="/images/bimmerparts-logo.png" alt="BIMMERParts" class="h-10 w-auto object-contain mb-4" />
          <p class="text-gray-600 text-sm mb-6">{{ t('footer.description') }}</p>
          <NuxtLink to="/contact" class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors inline-block">
            {{ t('footer.contact') }}
          </NuxtLink>
        </div>

        <!-- Middle Section: Navigation Links -->
        <div class="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
          <!-- Onderdelen column (crawlable category links) -->
          <div v-if="categoryStore.mainCategories.length">
            <h4 class="font-semibold text-gray-900 mb-4">Onderdelen</h4>
            <ul class="space-y-3 text-gray-600 text-sm">
              <li v-for="cat in categoryStore.mainCategories.slice(0, 7)" :key="cat.id">
                <NuxtLink
                  :to="{ path: '/producten', query: { main_category: cat.id } }"
                  class="hover:text-gray-900 transition-colors"
                >{{ cat.name }}</NuxtLink>
              </li>
              <li><NuxtLink to="/producten" class="hover:text-gray-900 transition-colors font-medium">Alle onderdelen</NuxtLink></li>
            </ul>
          </div>

          <!-- Over ons column -->
          <div>
            <h4 class="font-semibold text-gray-900 mb-4">Over ons</h4>
            <ul class="space-y-3 text-gray-600 text-sm">
              <li><NuxtLink to="/over-ons" class="hover:text-gray-900 transition-colors">Over ons</NuxtLink></li>
              <li><NuxtLink to="/bmw-model-codes" class="hover:text-gray-900 transition-colors">BMW Modelcodes</NuxtLink></li>
              <li><NuxtLink to="/mini-model-codes" class="hover:text-gray-900 transition-colors">MINI Modelcodes</NuxtLink></li>
            </ul>
          </div>

          <!-- Klantenservice column -->
          <div>
            <h4 class="font-semibold text-gray-900 mb-4">Klantenservice</h4>
            <ul class="space-y-3 text-gray-600 text-sm">
              <li><NuxtLink to="/contact" class="hover:text-gray-900 transition-colors">Contact</NuxtLink></li>
            </ul>
          </div>
        </div>

        <!-- Right Section: Contact -->
        <div class="md:col-span-1">
          <div class="space-y-3 mb-6">
            <div class="flex items-center gap-2 text-gray-600 text-sm">
              <img src="/images/location.png" alt="Locatie" class="w-4 h-4" />
              <span>Noorddammerweg 35, Unit 11 1424NW De Kwakel</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 text-sm">
              <img src="/images/sms.png" alt="E-mail" class="w-4 h-4" />
              <span>info@bimmerparts.nl</span>
            </div>
            <div class="flex items-center gap-2 text-gray-600 text-sm">
              <img src="/images/Phone.png" alt="Telefoon" class="w-4 h-4" />
              <span>+31613767946</span>
            </div>
          </div>

          <div class="mb-6 flex items-center gap-3">
            <p class="text-gray-600 text-sm">Wij accepteren:</p>
            <img src="/images/visa.png" alt="Visa" class="h-6" />
            <img src="/images/mastercard.png" alt="Mastercard" class="h-6" />
          </div>

          <div class="flex items-center gap-3">
            <p class="text-gray-600 text-sm">{{ t('footer.followUs') }}:</p>
            <a href="https://www.instagram.com/bimmerpartsnl/" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-pink-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div class="border-t py-4 text-center text-sm text-gray-500">
      Copyright © 2025 BimmerParts |
      <NuxtLink to="/terms" class="hover:text-gray-700 transition-colors">{{ t('footer.terms') }}</NuxtLink> |
      <NuxtLink to="/privacy" class="hover:text-gray-700 transition-colors">{{ t('footer.privacy') }}</NuxtLink>
    </div>
  </footer>
</template>
