<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getReviewStatistics, type ReviewStatistics as ReviewStats } from '../../services/review'
import ReviewStatistics from './ReviewStatistics.vue'
import ReviewForm from './ReviewForm.vue'
import ReviewList from './ReviewList.vue'

interface Props {
  productId: number
}

const props = defineProps<Props>()

const statistics = ref<ReviewStats>({
  average_rating: 0,
  total_reviews: 0,
  rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  rating_percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
})
const isLoadingStats = ref(false)
const reviewListRef = ref<InstanceType<typeof ReviewList> | null>(null)

const loadStatistics = async () => {
  isLoadingStats.value = true
  try {
    statistics.value = await getReviewStatistics(props.productId)
  } catch (error) {
    console.error('Error loading review statistics:', error)
  } finally {
    isLoadingStats.value = false
  }
}

const handleReviewSubmitted = () => {
  // Reload statistics and review list
  loadStatistics()
  if (reviewListRef.value) {
    reviewListRef.value.loadReviews(1)
  }
}

onMounted(() => {
  loadStatistics()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Review Statistics -->
    <ReviewStatistics 
      v-if="!isLoadingStats" 
      :statistics="statistics" 
    />

    <!-- Review Form -->
    <ReviewForm 
      :product-id="productId" 
      @review-submitted="handleReviewSubmitted" 
    />

    <!-- Review List -->
    <div>
      <h3 class="text-xl font-semibold text-gray-900 mb-6">
        Alle beoordelingen ({{ statistics.total_reviews }})
      </h3>
      <ReviewList 
        ref="reviewListRef"
        :product-id="productId" 
      />
    </div>
  </div>
</template>

