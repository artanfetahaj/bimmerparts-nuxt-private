import { Model } from './Model'
import type { ProductCategory } from './ProductCategory'

// ─── Model ────────────────────────────────────────────────────────────────────

export class MainCategory extends Model {
  protected override $name = 'MainCategory'
  protected override $endpoint = '/main-categories'
  protected override $primaryKey = 'id'

  id!: string
  name!: string
  description?: string

  // whenLoaded includes
  categories?: ProductCategory[]
}

// ─── Includes ─────────────────────────────────────────────────────────────────

export enum MainCategoryIncludes {
  CATEGORIES              = 'categories',
  CATEGORIES_SUBCATEGORIES = 'categories.subcategories',
}
