import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import authService from '../services/auth'
import productService from '../services/product'

// Pull a usable image URL out of either a flat string or the nested
// { url, thumbnail, original } object the products API returns.
const extractImageUrl = (image: any): string => {
  if (!image) return ''
  if (typeof image === 'string') return image
  return image.thumbnail || image.url || image.original || image.thumbnail_url || image.original_url || ''
}

export interface CartItem {
  id: string
  product_id: string
  slug?: string
  title: string
  price: number
  oldPrice: number
  image: string
  quantity: number
  max_quantity?: number
  attributes?: Record<string, string>
  price_adjustment?: number
}

const cartItems = ref<CartItem[]>([])
const loading = ref(false)
const initialized = ref(false)

// Clear cart on logout — registered once at module level (same pattern as wishlist)
if (typeof window !== 'undefined') {
  window.addEventListener('auth-changed', () => {
    if (!authService.isAuthenticated()) {
      cartItems.value = []
      initialized.value = false
    }
  })
}

// Load cart from API
const loadCart = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const response = await api.get('/cart')
    if (response.data?.success && response.data?.data?.items) {
      const mapped = response.data.data.items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        slug: item.slug || item.product?.slug,
        title: item.title || item.name || item.product?.name,
        price: parseFloat(item.price),
        oldPrice: item.oldPrice ? parseFloat(item.oldPrice) : parseFloat(item.price),
        image: extractImageUrl(item.image || item.product?.image),
        quantity: parseInt(item.quantity),
        max_quantity: item.max_quantity || 999,
        attributes: item.attributes ?? {},
        price_adjustment: parseFloat(item.price_adjustment ?? 0),
      }))

      // The cart endpoint only returns price/quantity for some items -
      // backfill title/image/slug from the product endpoint when missing.
      await Promise.all(
        mapped.map(async (item: any) => {
          if ((item.title && item.image) || !item.product_id) return
          try {
            const productRes = await productService.getProduct(String(item.product_id))
            const p = productRes?.data || productRes
            if (!item.title) item.title = p?.name || 'Product'
            if (!item.slug) item.slug = p?.slug
            if (!item.image) item.image = extractImageUrl(p?.image)
          } catch (error) {
            console.error(`Failed to enrich cart item for product ${item.product_id}:`, error)
          }
        })
      )

      cartItems.value = mapped.map((item: any) => ({
        ...item,
        title: item.title || 'Product',
        image: item.image || '/images/placeholder.png',
      }))
    } else {
      cartItems.value = []
    }
    initialized.value = true
  } catch (error) {
    console.error('Failed to load cart:', error)
    cartItems.value = []
    initialized.value = true
  } finally {
    loading.value = false
  }
}

// Merge guest cart with customer cart after login
const mergeCart = async () => {
  try {
    await api.post('/cart/merge')
    // Reload cart after merge
    await loadCart()
  } catch (error) {
    console.error('Failed to merge cart:', error)
  }
}

export const useCart = () => {
  // Initialize cart on mount
  onMounted(() => {
    if (!initialized.value) {
      loadCart()
    }
  })

  // Merge cart on login
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-changed', async () => {
      if (authService.isAuthenticated()) {
        await mergeCart()
        await loadCart()
      }
    })
  }

  const addToCart = async (product: any, quantity: number = 1, attributes?: Record<string, string>, priceAdjustment?: number) => {
    // Extract product_id from product object
    // Product can have either 'id' or 'product_id' field
    const productId = product.product_id || product.id
    
    if (!productId) {
      throw new Error('Product ID is required')
    }
    
    // Optimistic update: add product to cart immediately for instant feedback
    const tempId = `temp-${Date.now()}-${Math.random()}`
    const existingItemIndex = cartItems.value.findIndex(
      item => String(item.product_id) === String(productId)
    )
    const wasExisting = existingItemIndex >= 0
    
    if (wasExisting) {
      // Item already exists, update quantity optimistically
      cartItems.value[existingItemIndex].quantity += quantity
    } else {
      // Add new item optimistically
      cartItems.value.push({
        id: tempId,
        product_id: String(productId),
        title: product.title || 'Product',
        price: product.price || 0,
        oldPrice: product.oldPrice || product.price || 0,
        image: product.image || '/images/placeholder.png',
        quantity: quantity,
        max_quantity: product.max_quantity || 999,
      })
    }
    
    try {
      const response = await api.post('/cart', {
        product_id: String(productId),
        quantity: quantity,
        ...(attributes && Object.keys(attributes).length > 0 ? { attributes } : {}),
        ...(priceAdjustment != null && priceAdjustment > 0 ? { price_adjustment: priceAdjustment } : {}),
      })
      
      if (response.data?.success) {
        // Reload cart from API to get the correct server data (real IDs, prices, etc.)
        // This happens in the background, so the user already sees the product
        loadCart().catch(error => {
          console.error('Failed to reload cart after adding item:', error)
          // If reload fails, keep the optimistic update
        })
      } else {
        // Revert optimistic update on failure
        if (wasExisting && existingItemIndex >= 0) {
          cartItems.value[existingItemIndex].quantity -= quantity
          if (cartItems.value[existingItemIndex].quantity <= 0) {
            cartItems.value.splice(existingItemIndex, 1)
          }
        } else {
          const tempItemIndex = cartItems.value.findIndex(item => item.id === tempId)
          if (tempItemIndex >= 0) {
            cartItems.value.splice(tempItemIndex, 1)
          }
        }
        throw new Error(response.data?.message || 'Failed to add to cart')
      }
    } catch (error: any) {
      // Revert optimistic update on error
      if (wasExisting) {
        const currentItemIndex = cartItems.value.findIndex(
          item => String(item.product_id) === String(productId)
        )
        if (currentItemIndex >= 0) {
          cartItems.value[currentItemIndex].quantity -= quantity
          if (cartItems.value[currentItemIndex].quantity <= 0) {
            cartItems.value.splice(currentItemIndex, 1)
          }
        }
      } else {
        const tempItemIndex = cartItems.value.findIndex(item => item.id === tempId)
        if (tempItemIndex >= 0) {
          cartItems.value.splice(tempItemIndex, 1)
        }
      }
      console.error('Failed to add to cart:', error)
      throw error
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await api.delete(`/cart/${itemId}`)
      
      if (response.data?.success) {
        // Reload cart from API
        await loadCart()
      } else {
        throw new Error(response.data?.message || 'Failed to remove from cart')
      }
    } catch (error: any) {
      console.error('Failed to remove from cart:', error)
      throw error
    }
  }

  const updateQuantity = async (itemId: string, quantity: number, maxQuantity?: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    try {
      const response = await api.put(`/cart/${itemId}`, {
        quantity: quantity
      })
      
      if (response.data?.success) {
        // Reload cart from API to get updated stock information
        await loadCart()
      } else {
        // If API returns error, reload cart to sync with server state
        await loadCart()
        throw new Error(response.data?.message || 'Failed to update cart')
      }
    } catch (error: any) {
      console.error('Failed to update cart:', error)
      // Always reload cart on error to sync with server state
      await loadCart()
      
      // Re-throw error so UI can handle it
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart quantity'
      throw new Error(errorMessage)
    }
  }

  const clearCart = async () => {
    try {
      const response = await api.delete('/cart')
      
      if (response.data?.success) {
        cartItems.value = []
      } else {
        throw new Error(response.data?.message || 'Failed to clear cart')
      }
    } catch (error: any) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  }

  const refreshCart = async () => {
    await loadCart()
  }

  const totalItems = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const totalSavings = computed(() => {
    return cartItems.value.reduce((total, item) => total + ((item.oldPrice - item.price) * item.quantity), 0)
  })

  return {
    cartItems: computed(() => cartItems.value),
    loading: computed(() => loading.value),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart,
    totalItems,
    totalPrice,
    totalSavings
  }
}
