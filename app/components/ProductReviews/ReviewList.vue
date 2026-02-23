<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getProductReviews, type ProductReview } from '../../services/review'

interface Props {
  productId: number
}

const props = defineProps<Props>()

const reviews = ref<ProductReview[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 10

const loadReviews = async (page = 1) => {
  isLoading.value = true
  try {
    const response = await getProductReviews(props.productId, page, perPage)
    reviews.value = response.data
    currentPage.value = response.meta.current_page
    totalPages.value = response.meta.last_page
  } catch (error) {
    console.error('Error loading reviews:', error)
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => {
  if (currentPage.value < totalPages.value) {
    loadReviews(currentPage.value + 1)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const getStarClasses = (starNumber: number, rating: number) => {
  return starNumber <= rating ? 'text-yellow-400' : 'text-gray-300'
}

defineExpose({
  loadReviews
})

onMounted(() => {
  loadReviews()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading && reviews.length === 0" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      <p class="text-gray-600 mt-4">Beoordelingen laden...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="reviews.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <svg
        class="w-16 h-16 text-gray-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
        ></path>
      </svg>
      <p class="text-gray-600 text-lg">Nog geen beoordelingen</p>
      <p class="text-gray-500 text-sm mt-2">Wees de eerste om dit product te beoordelen!</p>
    </div>

    <!-- Reviews List -->
    <div v-else class="space-y-6">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <!-- Review Header -->
        <div class="flex items-start justify-between mb-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <!-- Customer Name -->
              <h4 class="font-semibold text-gray-900">{{ review.customer_name }}</h4>
              
              <!-- Verified Purchase Badge -->
              <span
                v-if="review.verified_purchase"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
              >
                <svg
                  class="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Geverifieerde aankoop
              </span>
            </div>

            <!-- Stars -->
            <div class="flex items-center gap-1">
              <svg
                v-for="star in 5"
                :key="star"
                class="w-4 h-4"
                :class="getStarClasses(star, review.rating)"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
          </div>

          <!-- Date -->
          <span class="text-sm text-gray-500">{{ formatDate(review.created_at) }}</span>
        </div>

        <!-- Review Comment -->
        <p class="text-gray-700 leading-relaxed">{{ review.comment }}</p>
      </div>

      <!-- Load More Button -->
      <button
        v-if="currentPage < totalPages"
        @click="loadMore"
        :disabled="isLoading"
        class="w-full py-3 px-6 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:border-orange-500 hover:text-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ isLoading ? 'Laden...' : 'Meer beoordelingen laden' }}
      </button>
    </div>
  </div>
</template>

