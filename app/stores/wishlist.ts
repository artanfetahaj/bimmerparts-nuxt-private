import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import authService from '../services/auth'

export interface WishlistItem {
  id: string
  title: string
  price: number
  oldPrice?: number
  image: string
}

const wishlistItems = ref<WishlistItem[]>([])
const loading = ref(false)
const initialized = ref(false)

// Load wishlist from API
const loadWishlist = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const response = await api.get('/wishlist')
    if (response.data?.success && response.data?.data?.items) {
      wishlistItems.value = response.data.data.items.map((item: any) => {
        // API returns 'id' as the product ID (from WishlistController)
        const productId = String(item.id || item.product_id || item.product?.id || '')
        return {
          id: productId,
          title: item.title || item.product?.name || item.name || 'Product',
          price: parseFloat(item.price || item.product?.price || 0),
          oldPrice: item.oldPrice ? parseFloat(item.oldPrice) : undefined,
          image: item.image || item.product?.image_url || item.product?.image || '/images/placeholder-product.svg',
        }
      })
    } else {
      wishlistItems.value = []
    }
    initialized.value = true
  } catch (error) {
    console.error('Failed to load wishlist:', error)
    wishlistItems.value = []
    initialized.value = true
  } finally {
    loading.value = false
  }
}

// Merge guest wishlist with customer wishlist after login
const mergeWishlist = async () => {
  try {
    await api.post('/wishlist/merge')
    // Reload wishlist after merge
    await loadWishlist()
  } catch (error) {
    console.error('Failed to merge wishlist:', error)
  }
}

export function useWishlist() {
  // Initialize wishlist on mount
  onMounted(() => {
    if (!initialized.value) {
      loadWishlist()
    }
  })

  // Listen for auth changes to merge wishlist
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-changed', async () => {
      if (authService.isAuthenticated() && !initialized.value) {
        await mergeWishlist()
        await loadWishlist()
      }
    })
  }

  const items = computed(() => wishlistItems.value)

  const totalItems = computed(() => items.value.length)

  const isInWishlist = async (productId: string): Promise<boolean> => {
    // Check if already in local state
    if (items.value.some(i => i.id === productId)) {
      return true
    }

    // Check with API
    try {
      const response = await api.get(`/wishlist/check/${productId}`)
      if (response.data?.success) {
        return response.data.data.in_wishlist === true
      }
    } catch (error) {
      console.error('Failed to check wishlist:', error)
    }
    
    return false
  }

  const addToWishlist = async (productId: string | number, product?: Partial<WishlistItem>) => {
    try {
      const response = await api.post('/wishlist', {
        product_id: parseInt(String(productId))
      })
      
      if (response.data?.success) {
        // Reload wishlist from API
        await loadWishlist()
      } else {
        throw new Error(response.data?.message || 'Failed to add to wishlist')
      }
    } catch (error: any) {
      console.error('Failed to add to wishlist:', error)
      throw error
    }
  }

  const removeFromWishlist = async (productId: string | number) => {
    try {
      const response = await api.delete(`/wishlist/${productId}`)
      
      if (response.data?.success) {
        // Reload wishlist from API
        await loadWishlist()
      } else {
        throw new Error(response.data?.message || 'Failed to remove from wishlist')
      }
    } catch (error: any) {
      console.error('Failed to remove from wishlist:', error)
      throw error
    }
  }

  const toggleWishlist = async (productId: string | number, product?: Partial<WishlistItem>) => {
    const inWishlist = await isInWishlist(String(productId))
    if (inWishlist) {
      await removeFromWishlist(productId)
    } else {
      await addToWishlist(productId, product)
    }
  }

  const clearWishlist = async () => {
    // Remove all items one by one (API doesn't have bulk clear)
    const itemsToRemove = [...items.value]
    for (const item of itemsToRemove) {
      await removeFromWishlist(item.id)
    }
  }

  const refreshWishlist = async () => {
    await loadWishlist()
  }

  return {
    items,
    totalItems,
    loading: computed(() => loading.value),
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
    refreshWishlist
  }
}
