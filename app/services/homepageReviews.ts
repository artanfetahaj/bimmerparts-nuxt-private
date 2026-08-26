import api from './api'

export interface HomeReview {
  id: string
  author_name: string
  author_title: string | null
  rating: number
  content: string
  is_published: boolean
  sort_order: number
  created_at: string
}

const homeReviewService = {
  getPublishedReviews(): Promise<{ data: HomeReview[] }> {
    return api.get('/reviews').then((r) => r.data)
  },
}

export default homeReviewService
