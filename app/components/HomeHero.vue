<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import HomeCarVariantSelector from '@/components/HomeCarVariantSelector.vue'

defineProps({
  image: { type: String, required: false, default: '' },
})

const currentSlide = ref(0)

const carouselImages = [
  '/images/hero.jpg',
  '/images/2025bmwm2coupe13.jpg',
  '/images/BMW_M2_2025_Lifestyle_v7.jpg',
  '/images/P90439365_lowRes_bmw-i4-m50-9-2021.jpg',
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
              Het juiste onderdeel<br>
              voor <span class="text-orange-500">jouw BMW</span>,<br>
              binnen 2 minuten.
            </h1>

            <!-- Sub-copy -->
            <p class="mt-4 text-white text-base leading-relaxed">
              Voer je kenteken in en zie direct welke onderdelen passen. Geen giswerk, geen verkeerde bestelling.
            </p>

            <!-- Trust pills -->
            <div class="mt-6 flex flex-wrap gap-2">
              <span class="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                Gratis verzending vanaf €75
              </span>
              <span class="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></span>
                Morgen in huis
              </span>
              <span class="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white/80 text-xs font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                Tot 35% korting
              </span>
            </div>

            <!-- CTA -->
            <div class="mt-8 flex items-center gap-3">
              <Button
                variant="outline"
                class="rounded-full border-white/40 text-white bg-white/10 hover:bg-white/20 gap-2 px-5 h-10"
              >
                Bekijk alle onderdelen
                <ChevronRight class="h-4 w-4" />
              </Button>
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
