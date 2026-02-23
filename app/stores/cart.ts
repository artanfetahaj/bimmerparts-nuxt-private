import { ref, computed, onMounted } from 'vue'
import api from '../services/api'
import authService from '../services/auth'

export interface CartItem {
  id: string
  product_id: string
  title: string
  price: number
  oldPrice: number
  image: string
  quantity: number
  max_quantity?: number
}

const cartItems = ref<CartItem[]>([])
const loading = ref(false)
const initialized = ref(false)

// Load cart from API
const loadCart = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const response = await api.get('/cart')
    if (response.data?.success && response.data?.data?.items) {
      cartItems.value = response.data.data.items.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        title: item.title,
        price: parseFloat(item.price),
        oldPrice: item.oldPrice ? parseFloat(item.oldPrice) : parseFloat(item.price),
        image: item.image || '/images/placeholder.png',
        quantity: parseInt(item.quantity),
        max_quantity: item.max_quantity || 999,
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

  // Listen for auth changes to merge cart
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-changed', async () => {
      if (authService.isAuthenticated() && !initialized.value) {
        await mergeCart()
        await loadCart()
      }
    })
  }

  const addToCart = async (product: any, quantity: number = 1) => {
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
        product_id: parseInt(String(productId)),
        quantity: quantity
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

    // Check if quantity exceeds available stock
    if (maxQuantity !== undefined && maxQuantity > 0 && quantity > maxQuantity) {
      // Limit quantity to available stock
      const item = cartItems.value.find(item => item.id === itemId)
      if (item) {
        item.quantity = maxQuantity
      }
      quantity = maxQuantity
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
