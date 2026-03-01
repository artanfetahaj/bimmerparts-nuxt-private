import { Model } from './Model'

// ─── Model ────────────────────────────────────────────────────────────────────

export class ProductSubcategory extends Model {
  protected override $name = 'ProductSubcategory'
  protected override $endpoint = '/product-subcategories'
  protected override $primaryKey = 'id'

  id!: string
  code!: string
  name!: string
  slug!: string
  description?: string
  is_active!: boolean
  sort_order!: number
  category_id!: string
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export enum ProductSubcategoryFilterKey {
  CATEGORY_ID = 'category_id',
  IS_ACTIVE   = 'is_active',
}

export type ProductSubcategoryFilters = Partial<{
  [ProductSubcategoryFilterKey.CATEGORY_ID]: string
  [ProductSubcategoryFilterKey.IS_ACTIVE]:   boolean
}>
