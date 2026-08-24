<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import homeReviewService, { type HomeReview } from '@/services/homepageReviews'
import { Star } from 'lucide-vue-next'

const reviews = ref<HomeReview[]>([])
const loading = ref(false)
const currentIndex = ref(0)

onMounted(async () => {
  loading.value = true
  try {
    const response = await homeReviewService.getPublishedReviews()
    reviews.value = response.data ?? []
  } catch (e) {
    // silently ignore — reviews are non-critical
  } finally {
    loading.value = false
  }
})

const visibleCount = 3

const count = computed(() => Math.min(visibleCount, reviews.value.length))
const maxIndex = computed(() => Math.max(0, reviews.value.length - count.value))
const canScroll = computed(() => reviews.value.length > visibleCount)

const visibleReviews = computed(() => {
  if (reviews.value.length === 0) return []
  return reviews.value.slice(currentIndex.value, currentIndex.value + count.value)
})

const prev = () => {
  if (currentIndex.value > 0) currentIndex.value--
}
const next = () => {
  if (currentIndex.value < maxIndex.value) currentIndex.value++
}
</script>

<template>
  <section v-if="!loading && reviews.length > 0" class="py-16 bg-zinc-950">
    <div class="outer-container">
      <!-- Header -->
      <div class="flex items-end justify-between mb-10">
        <div>
          <p class="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-2">
            Wat klanten zeggen
          </p>
          <h2 class="text-white text-3xl font-black leading-tight">
            Beoordelingen van<br>
            <span class="text-orange-500">echte BMW-rijders</span>
          </h2>
        </div>

        <!-- Prev / Next arrows -->
        <div v-if="canScroll" class="hidden sm:flex items-center gap-2">
          <button
            @click="prev"
            :disabled="currentIndex === 0"
            class="flex items-center justify-center w-10 h-10 rounded-full border transition-colors"
            :class="currentIndex === 0
              ? 'border-white/10 text-white/20 cursor-not-allowed'
              : 'border-white/20 text-white/60 hover:border-orange-500 hover:text-orange-500'"
            aria-label="Vorige"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            @click="next"
            :disabled="currentIndex >= maxIndex"
            class="flex items-center justify-center w-10 h-10 rounded-full border transition-colors"
            :class="currentIndex >= maxIndex
              ? 'border-white/10 text-white/20 cursor-not-allowed'
              : 'border-white/20 text-white/60 hover:border-orange-500 hover:text-orange-500'"
            aria-label="Volgende"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Review cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="review in visibleReviews"
          :key="review.id"
          class="bg-zinc-900 border border-white/8 rounded-xl p-6 flex flex-col gap-4"
        >
          <!-- Stars -->
          <div class="flex gap-0.5">
            <Star
              v-for="n in 5"
              :key="n"
              class="w-4 h-4"
              :class="n <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-white/10 text-white/10'"
            />
          </div>

          <!-- Content -->
          <p class="text-white/80 text-sm leading-relaxed flex-1">
            "{{ review.content }}"
          </p>

          <!-- Author -->
          <div class="flex items-center gap-3 pt-2 border-t border-white/8">
            <div class="w-9 h-9 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
              <span class="text-orange-400 font-bold text-sm">
                {{ review.author_name.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <p class="text-white text-sm font-semibold leading-none">{{ review.author_name }}</p>
              <p v-if="review.author_title" class="text-white/40 text-xs mt-0.5">{{ review.author_title }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile nav dots -->
      <div v-if="canScroll" class="flex sm:hidden justify-center gap-2 mt-6">
        <button
          v-for="i in maxIndex + 1"
          :key="i"
          @click="currentIndex = i - 1"
          class="w-2 h-2 rounded-full transition-all duration-200"
          :class="(i - 1) === currentIndex ? 'bg-orange-500' : 'bg-white/20'"
          :aria-label="`Pagina ${i}`"
        />
      </div>
    </div>
  </section>
</template>
