import { Model } from './Model'
import type { CarVariant } from './CarVariant'

// ─── Model ────────────────────────────────────────────────────────────────────

export class CarModel extends Model {
  protected override $name = 'CarModel'
  protected override $endpoint = '/car-models'
  protected override $primaryKey = 'id'

  // Fields from CarModelResource
  id!: string
  name!: string
  series!: string
  code!: string
  slug!: string
  generation?: string
  type!: string
  body_type?: string
  start_year?: number
  end_year?: number
  is_active!: boolean
  sort_order!: number

  // whenLoaded includes
  brand?: CarBrand
  variants?: CarVariant[]
}

// ─── Includes enum ────────────────────────────────────────────────────────────

export enum CarModelIncludes {
  BRAND    = 'brand',
  VARIANTS = 'variants',
}

// ─── Filters enum ─────────────────────────────────────────────────────────────

export enum CarModelFilterKey {
  SERIES       = 'series',
  TYPE         = 'type',
  BODY_TYPE    = 'body_type',
  IS_ACTIVE    = 'is_active',
  SEARCH       = 'search',
}

export type CarModelFilters = Partial<{
  [CarModelFilterKey.SERIES]:    string
  [CarModelFilterKey.TYPE]:      string
  [CarModelFilterKey.BODY_TYPE]: string
  [CarModelFilterKey.IS_ACTIVE]: boolean
  [CarModelFilterKey.SEARCH]:    string
}>

// ─── Nested types (from CarBrandResource) ─────────────────────────────────────

export interface CarBrand {
  id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
  sort_order: number
}
