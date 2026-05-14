import { ref, computed, watch } from 'vue'

export interface WishlistItem {
  id: string
  slug?: string
  title: string
  price: number
  oldPrice?: number
  image: string
}

const STORAGE_KEY = 'bimmerparts_wishlist'

const loadFromStorage = (): WishlistItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const wishlistItems = ref<WishlistItem[]>(loadFromStorage())

watch(
  wishlistItems,
  (items) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  },
  { deep: true }
)

// Clear wishlist whenever auth changes (login or logout) so one user never sees another's items
if (typeof window !== 'undefined') {
  window.addEventListener('auth-changed', () => {
    wishlistItems.value = []
    localStorage.removeItem(STORAGE_KEY)
  })
}

export function useWishlist() {
  const items = computed(() => wishlistItems.value)
  const totalItems = computed(() => wishlistItems.value.length)
  const loading = computed(() => false)

  const isInWishlist = (productId: string): boolean =>
    wishlistItems.value.some(i => String(i.id) === String(productId))

  const addToWishlist = (productId: string | number, product?: Partial<WishlistItem>) => {
    const id = String(productId)
    if (isInWishlist(id)) return
    wishlistItems.value = [
      ...wishlistItems.value,
      {
        id,
        slug: product?.slug,
        title: product?.title ?? 'Product',
        price: product?.price ?? 0,
        oldPrice: product?.oldPrice,
        image: product?.image ?? '/images/placeholder-product.svg',
      },
    ]
  }

  const removeFromWishlist = (productId: string | number) => {
    const id = String(productId)
    wishlistItems.value = wishlistItems.value.filter(i => String(i.id) !== id)
  }

  const toggleWishlist = (productId: string | number, product?: Partial<WishlistItem>) => {
    if (isInWishlist(String(productId))) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId, product)
    }
  }

  const clearWishlist = () => {
    wishlistItems.value = []
  }

  return {
    items,
    totalItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    isInWishlist,
  }
}
