import api from './api'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProductBrand {
  id: string
  name: string
  slug: string
  description?: string
  is_active?: boolean
  sort_order?: number
}

// ─── Cache ───────────────────────────────────────────────────────────────────

let cachedBrands: ProductBrand[] | null = null
let brandsPromise: Promise<ProductBrand[]> | null = null

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Fetch all product brands from the public endpoint.
 * Results are cached in-memory with promise deduplication.
 */
export async function getProductBrands(): Promise<ProductBrand[]> {
  if (cachedBrands) return cachedBrands

  if (brandsPromise) return brandsPromise

  brandsPromise = (async () => {
    try {
      const response = await api.get<{ data: ProductBrand[] }>('/product-brands', {
        params: { limit: 200 },
      })

      cachedBrands = response.data.data || []
      return cachedBrands
    } catch (error) {
      console.error('Error fetching product brands:', error)
      brandsPromise = null
      throw error
    }
  })()

  return brandsPromise
}

/**
 * Clear the cached brands (e.g. after data update).
 */
export function clearBrandCache(): void {
  cachedBrands = null
  brandsPromise = null
}
