import api from './api'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Subcategory {
  id: string
  name: string
  slug: string
}

export interface ProductCategory {
  id: string
  code: string
  name: string
  description?: string
  subcategories: Subcategory[]
}

export interface MainCategory {
  id: string
  name: string
  description?: string
  categories: ProductCategory[]
}

// ─── Cache ───────────────────────────────────────────────────────────────────

let cachedHierarchy: MainCategory[] | null = null
let hierarchyPromise: Promise<MainCategory[]> | null = null

// ─── API ─────────────────────────────────────────────────────────────────────

/**
 * Fetch the full category hierarchy for the navigation mega-menu.
 * Returns MainCategories → ProductCategories → Subcategories in a single call
 * by eager-loading relationships via the `with[]` query param.
 */
export async function getCategoryHierarchy(): Promise<MainCategory[]> {
  if (cachedHierarchy) return cachedHierarchy

  if (hierarchyPromise) return hierarchyPromise

  hierarchyPromise = (async () => {
    try {
      const response = await api.get<{ data: MainCategory[] }>('/main-categories', {
        params: {
          'with[]': ['categories.subcategories'],
          limit: 100,
        },
      })

      cachedHierarchy = response.data.data || []
      return cachedHierarchy
    } catch (error) {
      console.error('Error fetching category hierarchy:', error)
      hierarchyPromise = null
      throw error
    }
  })()

  return hierarchyPromise
}

/**
 * Clear the cached hierarchy (e.g. after locale change).
 */
export function clearCategoryCache(): void {
  cachedHierarchy = null
  hierarchyPromise = null
}
