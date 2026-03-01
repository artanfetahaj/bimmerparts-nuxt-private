import { Model } from './Model'
import type { ProductSubcategory } from './ProductSubcategory'

// ─── Model ────────────────────────────────────────────────────────────────────

export class ProductCategory extends Model {
  protected override $name = 'ProductCategory'
  protected override $endpoint = '/product-categories'
  protected override $primaryKey = 'id'

  id!: string
  code!: string
  name!: string
  description?: string
  is_original!: boolean
  main_category_id!: string

  // whenLoaded includes
  subcategories?: ProductSubcategory[]
}

// ─── Includes ─────────────────────────────────────────────────────────────────

export enum ProductCategoryIncludes {
  SUBCATEGORIES = 'subcategories',
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export enum ProductCategoryFilterKey {
  MAIN_CATEGORY_ID = 'main_category_id',
  IS_ORIGINAL      = 'is_original',
}

export type ProductCategoryFilters = Partial<{
  [ProductCategoryFilterKey.MAIN_CATEGORY_ID]: string
  [ProductCategoryFilterKey.IS_ORIGINAL]:      boolean
}>
