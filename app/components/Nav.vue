<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, reactive } from 'vue'
import { useCart } from '../stores/cart'
import { useLocale } from '../stores/locale'
import authService from '../services/auth'
import { useCarVariantStore } from '../stores/car-variant.store'
import WishlistPopover from './Nav/WishlistPopover.vue'
import SearchBar from './Nav/SearchBar.vue'
import SelectedCarVariant from './Nav/SelectedCarVariant.vue'
import { useRouter } from 'vue-router'
import { Button } from './ui/button'
import {
  ShoppingBag,
  User,
  Menu,
  ChevronDown,
} from 'lucide-vue-next'

const router = useRouter()

const { totalItems } = useCart()
const { t } = useLocale()

const isMobileMenuOpen = ref(false)
const showBmwSeriesMenu = ref(false)

watch(isMobileMenuOpen, (open) => {
  const value = open ? 'hidden' : ''
  document.documentElement.style.overflow = value
  document.body.style.overflow = value
})

onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
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
        <div class="relative" id="bmw-series-dropdown-container">
          <button
            @click.stop="showBmwSeriesMenu = !showBmwSeriesMenu"
            class="flex items-center gap-1 cursor-pointer text-gray-700 hover:text-orange-500"
          >
            BMW Series
            <ChevronDown class="w-4 h-4" />
          </button>
        </div>

        <NuxtLink to="/products" class="hover:text-orange-500">{{ t('nav.autoParts') }}</NuxtLink>
        <NuxtLink to="/about" class="hover:text-orange-500">{{ t('nav.about') }}</NuxtLink>
        <NuxtLink to="/contact" class="hover:text-orange-500">{{ t('nav.contact') }}</NuxtLink>
      </nav>

      <!-- Search — takes up remaining space -->
      <div class="flex flex-1">
        <SearchBar />
      </div>

      <!-- Right icons -->
      <div class="flex items-center gap-2">
        <SelectedCarVariant @click="openSearchDialog" />

        <!-- Mobile menu toggle -->
        <Button
          @click.stop="isMobileMenuOpen = true"
          variant="outline"
          size="icon"
          class="lg:hidden rounded-full"
          aria-label="Open menu"
        >
          <Menu class="w-5 h-5" />
        </Button>

        <!-- Cart -->
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

        <!-- Wishlist Popover -->
        <div class="hidden lg:block">
          <WishlistPopover />
        </div>

        <!-- Account -->
        <NuxtLink
          to="/account"
          class="relative items-center justify-center hidden w-10 h-10 transition-colors rounded-full lg:flex border border-gray-300 hover:bg-gray-50 text-gray-600"
          aria-label="Account"
        >
          <User class="w-5 h-5" />
        </NuxtLink>
      </div>
    </div>


  </header>
</template>

<style scoped>
.mobile-menu-bg {
  background-image: linear-gradient(180deg, #ffffff 0%, #fff7f1 40%, #ffe9db 100%);
}
.mobile-menu-bg a { color: #0f172a; }
.mobile-menu-bg a:hover { color: #ff6a00; }
</style>
