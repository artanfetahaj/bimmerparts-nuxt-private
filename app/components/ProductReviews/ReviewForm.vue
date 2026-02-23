<script setup lang="ts">
import { ref, computed } from 'vue'
import { submitReview, type SubmitReviewData } from '../../services/review'
import authService from '../../services/auth'

interface Props {
  productId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  reviewSubmitted: []
}>()

const rating = ref(0)
const hoverRating = ref(0)
const comment = ref('')
const customerName = ref('')
const customerEmail = ref('')
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref('')

const isAuthenticated = computed(() => authService.isAuthenticated())
const currentCustomer = computed(() => authService.getCurrentCustomer())

// Pre-fill customer data if authenticated
if (isAuthenticated.value && currentCustomer.value) {
  const customer = currentCustomer.value as any
  customerName.value = `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
  customerEmail.value = customer.email || ''
}

const canSubmit = computed(() => {
  if (!rating.value || !comment.value || comment.value.length < 10) {
    return false
  }
  if (!isAuthenticated.value) {
    return !!(customerName.value && customerEmail.value)
  }
  return true
})

const handleSubmit = async () => {
  if (!canSubmit.value) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const reviewData: SubmitReviewData = {
      product_id: props.productId,
      rating: rating.value,
      comment: comment.value
    }

    if (!isAuthenticated.value) {
      reviewData.customer_name = customerName.value
      reviewData.customer_email = customerEmail.value
    }

    await submitReview(reviewData)
    
    submitSuccess.value = true
    rating.value = 0
    comment.value = ''
    if (!isAuthenticated.value) {
      customerName.value = ''
      customerEmail.value = ''
    }

    emit('reviewSubmitted')

    // Hide success message after 5 seconds
    setTimeout(() => {
      submitSuccess.value = false
    }, 5000)
  } catch (error: any) {
    submitError.value = error.response?.data?.message || 'Er is een fout opgetreden bij het versturen van je beoordeling.'
  } finally {
    isSubmitting.value = false
  }
}

const setRating = (value: number) => {
  rating.value = value
}
</script>

<template>
  <div class="bg-white rounded-lg p-6 shadow-sm">
    <h3 class="text-xl font-semibold text-gray-900 mb-4">Schrijf een beoordeling</h3>

    <!-- Success Message -->
    <div v-if="submitSuccess" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <p class="text-green-800 text-sm">
        ✓ Bedankt voor je beoordeling! Je beoordeling wordt gepubliceerd na goedkeuring.
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="submitError" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-800 text-sm">{{ submitError }}</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Rating Stars -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Jouw beoordeling <span class="text-red-500">*</span>
        </label>
        <div class="flex gap-1">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="p-1 hover:scale-110 transition-transform"
            @click="setRating(star)"
            @mouseenter="hoverRating = star"
            @mouseleave="hoverRating = 0"
          >
            <svg
              class="w-8 h-8 transition-colors"
              :class="star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
        <p v-if="!rating" class="text-xs text-gray-500 mt-1">Klik op de sterren om je beoordeling te geven</p>
      </div>

      <!-- Comment -->
      <div>
        <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
          Jouw beoordeling <span class="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          v-model="comment"
          rows="4"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Deel je ervaring met dit product..."
          required
          minlength="10"
        ></textarea>
        <p class="text-xs text-gray-500 mt-1">
          Minimaal 10 karakters ({{ comment.length }}/1000)
        </p>
      </div>

      <!-- Customer Info (if not authenticated) -->
      <template v-if="!isAuthenticated">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Naam <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="customerName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Je naam"
              required
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              E-mail <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="customerEmail"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="je@email.nl"
              required
            />
          </div>
        </div>
      </template>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="!canSubmit || isSubmitting"
        class="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ isSubmitting ? 'Verzenden...' : 'Beoordeling Verzenden' }}
      </button>
    </form>
  </div>
</template>

