import api from './api'

export interface ProductReview {
  id: number
  product_id: number
  customer_id?: number
  customer_name: string
  customer_email: string
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  verified_purchase: boolean
  created_at: string
  updated_at: string
}

export interface ReviewStatistics {
  average_rating: number
  total_reviews: number
  rating_breakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  rating_percentages: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

export interface SubmitReviewData {
  product_id: number
  rating: number
  comment: string
  customer_name?: string
  customer_email?: string
}

/**
 * Get reviews for a specific product
 */
export async function getProductReviews(
  productId: number,
  page = 1,
  perPage = 10
): Promise<{ data: ProductReview[]; meta: any }> {
  try {
    const response = await api.get(`/products/${productId}/reviews`, {
      params: { page, per_page: perPage }
    })
    return {
      data: response.data.data,
      meta: response.data
    }
  } catch (error) {
    console.error('Error fetching product reviews:', error)
    throw error
  }
}

/**
 * Get review statistics for a product
 */
export async function getReviewStatistics(productId: number): Promise<ReviewStatistics> {
  try {
    const response = await api.get(`/products/${productId}/reviews/statistics`)
    return response.data
  } catch (error) {
    console.error('Error fetching review statistics:', error)
    throw error
  }
}

/**
 * Submit a new review
 */
export async function submitReview(reviewData: SubmitReviewData): Promise<ProductReview> {
  try {
    const response = await api.post('/reviews', reviewData)
    return response.data.data
  } catch (error) {
    console.error('Error submitting review:', error)
    throw error
  }
}

