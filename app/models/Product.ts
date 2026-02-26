import { Model } from './Model'

// ─── Model ────────────────────────────────────────────────────────────────────

export class Product extends Model {
  protected override $name = 'Product'
  protected override $endpoint = '/products'
  protected override $primaryKey = 'id'

  // Fields from ProductResource
  id!: string
  name!: string
  slug!: string
  sku!: string

  description?: string
  short_description?: string

  price!: number
  cost_price?: number
  sale_percentage?: number
  discounted_price?: number
  has_discount!: boolean

  vat_percentage!: number

  stock!: number
  units_sold?: number
  sold_unit?: string
  popularity?: number
  status!: string

  weight?: number
  dimensions?: Record<string, any>
  packaging?: string
  delivery_time?: string

  // whenLoaded includes — ids
  category_id?: string
  subcategory_id?: string
  brand_id?: string
  supplier_id?: string

  // whenLoaded includes — nested objects
  category?: ProductCategory
  subcategory?: ProductSubcategory
  brand?: ProductBrand
  supplier?: ProductSupplier
  image?: ProductImage

  // Compatibility block (whenLoaded car_variants)
  compatibility?: ProductCompatibility
}

// ─── Includes enum ────────────────────────────────────────────────────────────

export enum ProductIncludes {
  CATEGORY    = 'category',
  SUBCATEGORY = 'subcategory',
  BRAND       = 'brand',
  SUPPLIER    = 'supplier',
  IMAGE       = 'image',
  CAR_VARIANTS = 'car_variants',
}

// ─── Filters enum ─────────────────────────────────────────────────────────────

export enum ProductFilterKey {
  SEARCH            = 'search',
  MAIN_CATEGORY     = 'main_category',
  PRODUCT_CATEGORY  = 'product_category',
  SUBCATEGORY       = 'subcategory',
  CATEGORY          = 'category',
  BRAND             = 'brand',
  STATUS            = 'status',
  CAR_VARIANT       = 'car_variant_id',
  CAR_MODEL         = 'car_model',
  PRICE_MIN         = 'price_min',
  PRICE_MAX         = 'price_max',
}

export type ProductFilters = Partial<{
  [ProductFilterKey.SEARCH]:           string
  [ProductFilterKey.MAIN_CATEGORY]:    string
  [ProductFilterKey.PRODUCT_CATEGORY]: string
  [ProductFilterKey.SUBCATEGORY]:      string
  [ProductFilterKey.CATEGORY]:         string
  [ProductFilterKey.BRAND]:            string
  [ProductFilterKey.STATUS]:           string
  [ProductFilterKey.CAR_VARIANT]:      string
  [ProductFilterKey.CAR_MODEL]:        string
  [ProductFilterKey.PRICE_MIN]:        number
  [ProductFilterKey.PRICE_MAX]:        number
}>

// ─── Nested types ─────────────────────────────────────────────────────────────

export interface ProductCategory {
  id: string
  name: string
  slug: string
}

export interface ProductSubcategory {
  id: string
  name: string
  slug: string
}

export interface ProductBrand {
  id: string
  name: string
  slug: string
}

export interface ProductSupplier {
  id: string
  name: string
}

export interface ProductImage {
  id: string
  url: string
  thumb_url?: string
}

export interface ProductCompatibility {
  models: Array<{ id: string; name: string }>
  variants: Array<{ id: string; name: string; full_name: string }>
}
