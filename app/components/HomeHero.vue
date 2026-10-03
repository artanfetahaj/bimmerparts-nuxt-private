<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronRight, ShoppingBag, Heart, User } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import HomeCarVariantSelector from '@/components/HomeCarVariantSelector.vue'

const { totalItems } = useCart()
const { items: wishlistItems } = useWishlist()

defineProps({
  image: { type: String, required: false, default: '' },
})

const currentSlide = ref(0)

const carouselImages = [
  '/images/New/1000130641.jpg',
  '/images/New/Toffer-Automotive_Elin-de-Wilde-10.2-scaled.jpg',
  '/images/New/DIV05625-scaled.jpg',
  '/images/New/Toffer-Automotive_Elin-de-Wilde-14-scaled.jpg',
]

let autoSlideInterval: ReturnType<typeof setInterval> | null = null

const nextSlide  = () => { currentSlide.value = (currentSlide.value + 1) % carouselImages.length }
const goToSlide  = (i: number) => { currentSlide.value = i }
const startAutoSlide = () => { autoSlideInterval = setInterval(nextSlide, 5000) }
const stopAutoSlide  = () => { if (autoSlideInterval) { clearInterval(autoSlideInterval); autoSlideInterval = null } }

const handlePlateSearch  = (plate: string) => { console.log('plate:', plate) }
const handleVinSearch    = (vin: string)   => { console.log('vin:', vin) }
const handleSelectModel  = ()              => { console.log('select model') }

onMounted(() => startAutoSlide())
onUnmounted(() => stopAutoSlide())
</script>

<template>
  <div class="w-full">
    <section class="relative w-full overflow-x-hidden overflow-y-hidden">

      <!-- Carousel — full bleed -->
      <div
        class="absolute inset-0 transition-transform duration-1000 ease-in-out"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div
          v-for="(img, index) in carouselImages"
          :key="index"
          class="absolute inset-0 w-full h-full bg-cover bg-center"
          :style="{ backgroundImage: `url(${img})`, left: `${index * 100}%` }"
        />
      </div>

      <!-- Gradient overlay — darker on the right so the card is readable, lighter left for the copy -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/55 via-black/40 to-black/65" />

      <!-- Content -->
      <div class="relative z-10 min-h-[580px] sm:min-h-[640px] md:min-h-[720px] pt-24 pb-14 flex flex-col">
        <div class="outer-container flex-1 flex flex-col md:flex-row items-center gap-6 md:gap-16">

          <!-- LEFT — hero copy -->
          <div class="flex-1 flex flex-col justify-center">

            <!-- Eyebrow -->
            <p class="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-3">
              BMW-specialist Nederland
            </p>

            <!-- Headline -->
            <h1 class="text-white font-black leading-[1.08] text-4xl sm:text-5xl lg:text-[3.5rem]">
              Alles voor jouw<br>
              <span class="text-orange-500">BMW of MINI</span>.
            </h1>

            <!-- Sub-copy -->
            <p class="mt-4 text-white text-base leading-relaxed">
              Vind de juiste onderdelen via kenteken of chassisnummer.
            </p>

            <!-- Trust pills -->
            <div class="mt-6 flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                OEM & Premium kwaliteit 
              </span>
              <span class="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                Snelle levering
              </span>
              <span class="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                Montage door TOFFER Automotive
              </span>
              <span class="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 text-orange-500 shrink-0">
                  <path fill-rule="evenodd" d="M14.5 10a4.5 4.5 0 0 0 4.284-5.882c-.105-.324-.51-.391-.752-.15L15.34 6.66a.454.454 0 0 1-.493.11 3.01 3.01 0 0 1-1.618-1.616.455.455 0 0 1 .11-.494l2.694-2.692c.24-.241.174-.647-.15-.752a4.5 4.5 0 0 0-5.873 4.575c.055.873-.128 1.808-.8 2.368l-7.23 6.024a2.724 2.724 0 1 0 3.837 3.837l6.024-7.23c.56-.672 1.495-.855 2.368-.8.096.007.193.01.291.01ZM5 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clip-rule="evenodd" />
                </svg>
                Installatie in onze werkplaats
              </span>
            </div>

            <!-- Mobile action icons (Cart, Wishlist, Account) -->
            <div class="mt-6 flex items-center gap-3 lg:hidden">
              <NuxtLink
                to="/winkelwagen"
                class="relative flex items-center justify-center w-11 h-11 rounded-full bg-white/15 border border-white/25 text-white hover:bg-white/25 transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag class="w-5 h-5" />
                <span
                  v-if="totalItems > 0"
                  class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-zinc-900 bg-orange-500 rounded-full"
                >
                  {{ totalItems > 99 ? '99+' : totalItems }}
                </span>
              </NuxtLink>

              <NuxtLink
                to="/wishlist"
                class="relative flex items-center justify-center w-11 h-11 rounded-full bg-white/15 border border-white/25 text-white hover:bg-white/25 transition-colors"
                aria-label="Wishlist"
              >
                <Heart class="w-5 h-5" />
                <span
                  v-if="wishlistItems.length > 0"
                  class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-zinc-900 bg-orange-500 rounded-full"
                >
                  {{ wishlistItems.length > 99 ? '99+' : wishlistItems.length }}
                </span>
              </NuxtLink>

              <NuxtLink
                to="/account"
                class="flex items-center justify-center w-11 h-11 rounded-full bg-white/15 border border-white/25 text-white hover:bg-white/25 transition-colors"
                aria-label="Account"
              >
                <User class="w-5 h-5" />
              </NuxtLink>
            </div>

            <!-- CTA -->
            <div class="mt-6 lg:mt-8 flex items-center gap-3">
              <NuxtLink to="/producten">
                <Button
                  variant="outline"
                  class="rounded-full border-white/40 text-white bg-white/10 hover:bg-white/20 gap-2 px-5 h-10"
                >
                  Bekijk alle onderdelen
                  <ChevronRight class="h-4 w-4" />
                </Button>
              </NuxtLink>
            </div>
          </div>

          <!-- RIGHT — car variant selector -->
          <aside class="w-full md:w-[420px] md:shrink-0 flex justify-center md:justify-end">
            <HomeCarVariantSelector
              @search-plate="handlePlateSearch"
              @search-vin="handleVinSearch"
              @select-model="handleSelectModel"
            />
          </aside>

        </div>
      </div>

      <!-- Pagination dots -->
      <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        <button
          v-for="(_, index) in carouselImages"
          :key="index"
          @click="goToSlide(index)"
          @mouseenter="stopAutoSlide"
          @mouseleave="startAutoSlide"
          class="h-2 w-2 rounded-full transition-all duration-300 hover:scale-125"
          :class="currentSlide === index ? 'bg-white' : 'bg-white/40 cursor-pointer'"
          :aria-label="`Slide ${index + 1}`"
        />
      </div>

    </section>
  </div>


</template>

<style scoped>
@media (max-width: 430px) {
  h1 { font-size: 2rem; }
}
</style>
