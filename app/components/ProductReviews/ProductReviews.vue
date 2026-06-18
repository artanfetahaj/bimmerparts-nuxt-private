<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getReviewStatistics, type ReviewStatistics as ReviewStats } from '../../services/review'
import ReviewStatistics from './ReviewStatistics.vue'

interface Props {
  productId: string
}

const props = defineProps<Props>()

const statistics = ref<ReviewStats>({
  average_rating: 0,
  total_reviews: 0,
  rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  rating_percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
})
const isLoadingStats = ref(false)

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

onMounted(() => {
  loadStatistics()
})
</script>

<template>
  <div class="space-y-8">
    <ReviewStatistics
      v-if="!isLoadingStats"
      :statistics="statistics"
    />
  </div>
</template>
