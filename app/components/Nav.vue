<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useCart } from '../stores/cart'
import { useLocale } from '../stores/locale'
import { useCarVariantStore } from '../stores/car-variant.store'
import WishlistPopover from './Nav/WishlistPopover.vue'
import SearchBar from './Nav/SearchBar.vue'
import SelectedCarVariant from './Nav/SelectedCarVariant.vue'
import MegaMenu from './Nav/MegaMenu.vue'
import MobileMenu from './Nav/MobileMenu.vue'
import { Button } from './ui/button'
import {
  ShoppingBag,
  User,
  Menu,
  ChevronDown,
} from 'lucide-vue-next'

const { totalItems } = useCart()
const { t } = useLocale()

const isMobileMenuOpen = ref(false)
const showBmwSeriesMenu = ref(false)

// ─── Mega-menu hover logic ───────────────────────────────────────────────────
let closeTimer: ReturnType<typeof setTimeout> | null = null

function openMegaMenu() {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
  showBmwSeriesMenu.value = true
}

function scheduleMegaMenuClose() {
  closeTimer = setTimeout(() => {
    showBmwSeriesMenu.value = false
  }, 200)
}

function cancelMegaMenuClose() {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
}

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer)
})

const carVariantStore = useCarVariantStore()

function openSearchDialog() { carVariantStore.openDialog() }
</script>

<template>
  <header class="z-50 w-full relative bg-white shadow-sm border-b text-gray-900">
    <div class="outer-container flex items-center h-16 gap-6 px-6 mx-auto md:px-10">
      <!-- Brand -->
      <NuxtLink to="/" class="flex items-center gap-2 min-w-[160px]">
        <span class="text-[20px] font-semibold text-[#ff6a00]">BIMMERParts</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-6 text-[14px] text-gray-700">
        <!-- BMW Series trigger -->
        <div
          class="relative"
          id="bmw-series-dropdown-container"
          @mouseenter="openMegaMenu"
          @mouseleave="scheduleMegaMenuClose"
        >
          <button
            class="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-orange-500 transition-colors"
            :class="{ 'text-orange-500': showBmwSeriesMenu }"
          >
            BMW Series
            <ChevronDown
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': showBmwSeriesMenu }"
            />
          </button>
        </div>

        <NuxtLink to="/products" class="hover:text-orange-500">{{ t('nav.autoParts') }}</NuxtLink>
        <NuxtLink to="/about" class="hover:text-orange-500">{{ t('nav.about') }}</NuxtLink>
        <NuxtLink to="/contact" class="hover:text-orange-500">{{ t('nav.contact') }}</NuxtLink>
      </nav>

      <!-- Search — takes up remaining space (desktop only) -->
      <div class="hidden lg:flex flex-1">
        <SearchBar />
      </div>

      <!-- Spacer on mobile to push icons right -->
      <div class="flex-1 lg:hidden" />

      <!-- Right icons -->
      <div class="flex items-center gap-2">
        <!-- Car variant selector (desktop only) -->
        <div class="hidden lg:block">
          <SelectedCarVariant @click="openSearchDialog" />
        </div>

        <!-- Mobile menu toggle -->
        <button
          @click.stop="isMobileMenuOpen = true"
          class="lg:hidden flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Open menu"
        >
          <Menu class="w-5 h-5" />
        </button>

        <!-- Cart (desktop only) -->
        <NuxtLink
          to="/cart"
          class="relative items-center justify-center hidden w-10 h-10 transition-colors rounded-full lg:flex border border-gray-300 hover:bg-gray-50 text-gray-600"
          aria-label="Cart"
        >
          <ShoppingBag class="w-5 h-5" />
          <span v-if="totalItems > 0" class="absolute flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-orange-500 rounded-full -top-1 -right-1">
            {{ totalItems > 99 ? '99+' : totalItems }}
          </span>
        </NuxtLink>

        <!-- Wishlist Popover (desktop only) -->
        <div class="hidden lg:block">
          <WishlistPopover />
        </div>

        <!-- Account (desktop only) -->
        <NuxtLink
          to="/account"
          class="relative items-center justify-center hidden w-10 h-10 transition-colors rounded-full lg:flex border border-gray-300 hover:bg-gray-50 text-gray-600"
          aria-label="Account"
        >
          <User class="w-5 h-5" />
        </NuxtLink>
      </div>
    </div>

    <!-- Mega Menu Dropdown -->
    <div
      v-if="showBmwSeriesMenu"
      @mouseenter="cancelMegaMenuClose"
      @mouseleave="scheduleMegaMenuClose"
    >
      <MegaMenu />
    </div>
  </header>

  <!-- Mobile Menu Drawer -->
  <MobileMenu :open="isMobileMenuOpen" @close="isMobileMenuOpen = false" />
</template>
