<script setup lang="ts">
import { computed } from 'vue'
import type { ReviewStatistics } from '../../services/review'

interface Props {
  statistics: ReviewStatistics
}

const props = defineProps<Props>()

// Format rating for display (e.g., 4.5)
const formattedRating = computed(() => {
  return props.statistics.average_rating.toFixed(1)
})

// Get star classes for display
const getStarClasses = (starNumber: number) => {
  const rating = props.statistics.average_rating
  if (starNumber <= Math.floor(rating)) {
    return 'text-yellow-400'
  } else if (starNumber === Math.ceil(rating) && rating % 1 !== 0) {
    return 'text-yellow-400 opacity-50'
  } else {
    return 'text-gray-300'
  }
}

// Rating labels
const ratingLabels = {
  5: '5 stars',
  4: '4 stars',
  3: '3 stars',
  2: '2 stars',
  1: '1 star'
}
</script>

<template>
  <div class="bg-white rounded-lg p-6 shadow-sm">
    <!-- Average Rating Display -->
    <div class="flex items-center gap-6 mb-6">
      <div class="text-center">
        <div class="text-5xl font-bold text-gray-900">{{ formattedRating }}</div>
        <div class="flex items-center justify-center mt-2">
          <svg
            v-for="star in 5"
            :key="star"
            class="w-5 h-5"
            :class="getStarClasses(star)"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </div>
        <div class="text-sm text-gray-600 mt-1">
          {{ statistics.total_reviews }} {{ statistics.total_reviews === 1 ? 'Beoordeel' : 'Beoordelingen' }}
        </div>
      </div>

      <!-- Rating Breakdown Bars -->
      <div class="flex-1 space-y-2">
        <div
          v-for="rating in [5, 4, 3, 2, 1]"
          :key="rating"
          class="flex items-center gap-3"
        >
          <span class="text-sm text-gray-600 w-16">{{ rating }} stars</span>
          <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              class="bg-yellow-400 h-full transition-all duration-300"
              :style="{ width: `${statistics.rating_percentages[rating]}%` }"
            ></div>
          </div>
          <span class="text-sm text-gray-600 w-12 text-right">
            {{ statistics.rating_percentages[rating] }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

