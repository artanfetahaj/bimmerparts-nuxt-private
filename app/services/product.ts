import api from './api'

export interface ProductImage {
  id?: number
  name?: string
  original?: string
  thumbnail?: string
  original_url?: string
  thumbnail_url?: string
  alt_text?: string
}

export interface Product {
  id: number
  name: string
  slug?: string
  sku: string
  description?: string
  price: string // API returns price as string (e.g., "45.99")
  formatted_price?: string
  image?: string
  image_url?: string
  images?: {
    all?: ProductImage[]
    main?: ProductImage | string
    thumbnail?: ProductImage | string
  }
  brand?: string
  part_number?: string
  category_id?: number
  stock?: number | string | null
  status: string
  created_at: string
  category?: {
    id: number
    name: string
  }
  compatibility?: string
  weight?: number
  dimensions?: any
  in_stock?: boolean
  sale_price?: string
  discount_price?: string
  discounted_price?: string
  offer_price?: string
  special_price?: string
  price_sale?: string
  compare_at_price?: string
  original_price?: string
  regular_price?: string
  price_before_discount?: string
  base_price?: string
  discount_percentage?: string | number
  sale_percentage?: string | number | null
  has_discount?: boolean
  supplier?: { id?: number; name?: string; code?: string } | string
  supplier_id?: number
}

class ProductService {
  async getAllProducts(params?: {
    sort?: string
    per_page?: number
    page?: number
    series?: string
    hauptgruppe?: string
    search?: string
    category_id?: number | string
    model_id?: number | string
    model_ids?: number[] | string
    model_codes?: string
    exclude?: string
  }) {
    try {
      const response = await api.get('/products', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  async getProduct(id: string) {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  async getProductBySlug(slug: string) {
    try {
      const response = await api.get(`/products/slug/${slug}`, {
        params: {
          'with[]': ['category', 'subcategory', 'brand', 'supplier', 'car_variants.model'],
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching product by slug:', error)
      throw error
    }
  }

  async getBrands() {
    try {
      // Use product-brands endpoint to get all product brands from CMS
      // Note: baseURL already includes /v1, so we don't need to add it again
      const response = await api.get('/product-brands')
      // API returns { success: true, data: [...] }
      return response.data?.data || []
    } catch (error) {
      console.error('Error fetching brands:', error)
      // Fallback to products/brands if product-brands fails
      try {
        const fallbackResponse = await api.get('/products/brands')
        return fallbackResponse.data?.data || []
      } catch (fallbackError) {
        console.error('Error fetching brands from fallback:', fallbackError)
        throw error
      }
    }
  }

  async getSuppliers() {
    try {
      const response = await api.get('/suppliers')
      return response.data?.data || []
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      throw error
    }
  }

  // Transform API product data to match frontend component expectations
  transformProductForFrontend(product: Product) {
    const parseNumber = (value: unknown): number | undefined => {
      if (value === undefined || value === null) return undefined
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined
      }
      if (typeof value === 'string') {
        const normalized = value.replace(',', '.')
        const parsed = parseFloat(normalized)
        return Number.isFinite(parsed) ? parsed : undefined
      }
      return undefined
    }

    const parseStockCount = (value: unknown): number | undefined => {
      if (value === undefined || value === null) return undefined
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined
      }
      if (typeof value === 'string') {
        const normalized = value.replace(',', '.')
        const parsed = parseFloat(normalized)
        return Number.isFinite(parsed) ? parsed : undefined
      }
      return undefined
    }

    const pickNumber = (...candidates: unknown[]): number | undefined => {
      for (const candidate of candidates) {
        const parsed = parseNumber(candidate)
        if (parsed !== undefined && parsed > 0) {
          return parsed
        }
      }
      return undefined
    }

    // Get first image from images array (preferred) or fallback to image/image_url
    let imageUrl = '/images/placeholder-product.svg'
    
    if (product.images && product.images.all && Array.isArray(product.images.all) && product.images.all.length > 0) {
      // Use first image from images.all array
      const firstImage = product.images.all[0]
      imageUrl = firstImage.original_url || firstImage.thumbnail_url || firstImage.original || firstImage.thumbnail || imageUrl
    } else if (product.image_url) {
      imageUrl = product.image_url
    } else if (product.image) {
      // Fallback to legacy image field
      const base = (api.defaults.baseURL || '').replace(/\/$/, '')
      const apiOriginMatch = base.match(/^https?:\/\/[^/]+/)
      const apiOrigin = apiOriginMatch ? apiOriginMatch[0] : 'http://localhost:8000'
      imageUrl = product.image.startsWith('http')
        ? product.image
        : `${apiOrigin}/storage/${product.image.replace(/^\//, '')}`
    }

    // Extract all images for product detail view
    const productImages: string[] = []
    if (product.images && product.images.all && Array.isArray(product.images.all)) {
      productImages.push(...product.images.all.map((img: ProductImage) => 
        img.original_url || img.thumbnail_url || img.original || img.thumbnail || ''
      ).filter(Boolean))
    }
    // If no images from API but we have a fallback image, use it
    if (productImages.length === 0 && imageUrl !== '/images/placeholder-product.svg') {
      productImages.push(imageUrl)
    }

    const discountPercentageFromApi =
      pickNumber(product.discount_percentage, product.sale_percentage) ??
      parseNumber((product as any).discountPercent) ??
      parseNumber((product as any).salePercentage)
    let salePrice =
      pickNumber(
        product.sale_price,
        product.discount_price,
        product.discounted_price,
        product.offer_price,
        product.special_price,
        product.price_sale
      ) ?? pickNumber(product.price)

    let originalPrice =
      pickNumber(
        product.compare_at_price,
        product.original_price,
        product.regular_price,
        product.price_before_discount,
        product.base_price
      ) ?? pickNumber(product.price)

    const hasDiscountFlag = product.has_discount === true

    if (!salePrice && originalPrice) {
      salePrice = originalPrice
    }

    if (!originalPrice && salePrice) {
      originalPrice = salePrice
    }

    if (
      discountPercentageFromApi &&
      discountPercentageFromApi > 0 &&
      discountPercentageFromApi < 100
    ) {
      if (originalPrice && (!salePrice || salePrice >= originalPrice)) {
        salePrice = originalPrice * (1 - discountPercentageFromApi / 100)
      }
      if (!originalPrice && salePrice) {
        const denominator = 1 - discountPercentageFromApi / 100
        if (denominator > 0) {
          originalPrice = salePrice / denominator
        }
      }
    }

    let discountPercent: number | undefined
    if (originalPrice && salePrice && originalPrice > salePrice) {
      discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    } else if (
      discountPercentageFromApi &&
      discountPercentageFromApi > 0 &&
      discountPercentageFromApi < 100
    ) {
      discountPercent = Math.round(discountPercentageFromApi)
      if (originalPrice && (!salePrice || salePrice >= originalPrice)) {
        salePrice = originalPrice * (1 - discountPercent / 100)
      } else if (!originalPrice && salePrice) {
        const denominator = 1 - discountPercent / 100
        if (denominator > 0) {
          originalPrice = salePrice / denominator
        }
      }
    }

    const normalizedOriginal =
      originalPrice !== undefined ? parseFloat(originalPrice.toFixed(2)) : undefined
    const normalizedSale =
      salePrice !== undefined ? parseFloat(salePrice.toFixed(2)) : normalizedOriginal ?? 0

    let normalizedDiscount = discountPercent
    if (
      (!normalizedDiscount || normalizedDiscount <= 0) &&
      normalizedOriginal &&
      normalizedSale &&
      normalizedOriginal > normalizedSale
    ) {
      normalizedDiscount = Math.round(((normalizedOriginal - normalizedSale) / normalizedOriginal) * 100)
    }

    const hasDiscount =
      Boolean(
        normalizedOriginal &&
          normalizedSale &&
          normalizedOriginal > normalizedSale &&
          normalizedDiscount &&
          normalizedDiscount > 0
      ) || (hasDiscountFlag && normalizedOriginal !== undefined && normalizedOriginal >= normalizedSale)

    const finalOldPrice =
      hasDiscount && normalizedOriginal && normalizedOriginal > normalizedSale
        ? normalizedOriginal
        : undefined

    const finalPrice =
      hasDiscount || normalizedOriginal === undefined ? normalizedSale : normalizedOriginal

    const finalDiscountPercent =
      hasDiscount && normalizedDiscount && normalizedDiscount > 0 ? normalizedDiscount : undefined

    const safeFinalPrice = Number.isFinite(finalPrice) ? parseFloat(finalPrice.toFixed(2)) : 0
    const safeFinalOldPrice =
      finalOldPrice && Number.isFinite(finalOldPrice) && finalOldPrice > safeFinalPrice
        ? parseFloat(finalOldPrice.toFixed(2))
        : undefined
    const safeFinalDiscount =
      finalDiscountPercent && finalDiscountPercent > 0 ? finalDiscountPercent : undefined

    const stockCountRaw = parseStockCount(product.stock)
    const normalizedStockCount =
      stockCountRaw !== undefined ? Math.max(0, Math.floor(stockCountRaw)) : undefined
    const finalStockCount = normalizedStockCount ?? 0
    const isLowStock = finalStockCount > 0 && finalStockCount < 10
    const isOutOfStock = finalStockCount === 0

    let badge: string | undefined
    if (safeFinalDiscount) {
      badge = `-${safeFinalDiscount}%`
    }

    const compatibleModelIds = Array.isArray((product as any)?.compatible_models?.model_ids)
      ? (product as any).compatible_models.model_ids
          .map((id: unknown) => {
            const parsed = Number(id)
            return Number.isFinite(parsed) ? parsed : null
          })
          .filter((id: number | null): id is number => id !== null)
      : []

    return {
      id: product.id.toString(),
      slug: product.slug || undefined,
      title: product.name,
      price: safeFinalPrice,
      oldPrice: safeFinalOldPrice,
      discountPercent: safeFinalDiscount,
      image: imageUrl,
      images: productImages, // Array of all product images
      badge,
      brand: product.brand,
      supplier: typeof product.supplier === 'string'
        ? product.supplier
        : product.supplier?.name || product.supplier?.code,
      part_number: product.part_number,
      stock: finalStockCount,
      lowStock: isLowStock,
      outOfStock: isOutOfStock,
      description: product.description,
      category: product.category?.name,
      categoryId: product.category_id || product.category?.id || null,
      compatibleModels: product.compatible_models || null,
      compatibleModelIds
    }
  }

  async getRelatedProducts(options?: {
    categoryIds?: Array<number | string | null | undefined>
    modelIds?: Array<number | string | null | undefined>
    modelCodes?: Array<string | null | undefined>
    hauptgruppen?: Array<string | null | undefined>
    series?: Array<string | null | undefined>
    excludeIds?: Array<number | string | null | undefined>
    limit?: number
  }) {
    const {
      categoryIds = [],
      modelIds = [],
      modelCodes = [],
      hauptgruppen = [],
      series = [],
      excludeIds = [],
      limit = 5
    } = options || {}

    const uniqueCategoryIds = Array.from(
      new Set(
        categoryIds
          .map(id => (typeof id === 'string' ? id.trim() : id))
          .filter(id => id !== null && id !== undefined && id !== '')
      )
    )

    const uniqueModelIds = Array.from(
      new Set(
        modelIds
          .map(id => (typeof id === 'string' ? id.trim() : id))
          .filter(id => id !== null && id !== undefined && id !== '')
      )
    )

    const uniqueModelCodes = Array.from(
      new Set(
        modelCodes
          .map(code => (typeof code === 'string' ? code.trim().toUpperCase() : code))
          .filter(code => code !== null && code !== undefined && code !== '')
      )
    )

    const uniqueHauptgruppen = Array.from(
      new Set(
        hauptgruppen
          .map(code => (typeof code === 'string' ? code.trim() : code))
          .filter(code => code !== null && code !== undefined && code !== '')
      )
    )

    const uniqueSeries = Array.from(
      new Set(
        series
          .map(code => (typeof code === 'string' ? code.trim() : code))
          .filter(code => code !== null && code !== undefined && code !== '')
      )
    )

    if (
      uniqueCategoryIds.length === 0 &&
      uniqueModelIds.length === 0 &&
      uniqueModelCodes.length === 0 &&
      uniqueHauptgruppen.length === 0 &&
      uniqueSeries.length === 0
    ) {
      return []
    }

    const excludeSet = new Set(
      excludeIds
        ?.map(id => (id !== null && id !== undefined ? String(id) : null))
        .filter((id): id is string => Boolean(id))
    )

    // Prepare exclude parameter for API calls
    const excludeParam = Array.from(excludeSet).join(',')

    const collected = new Map<string, ReturnType<ProductService['transformProductForFrontend']>>()

    const addProductsFromResponse = (response: any) => {
      const productsData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : []

      productsData.forEach((product: Product) => {
        const transformed = this.transformProductForFrontend(product)
        const idString = String(transformed.id)
        if (!excludeSet.has(idString)) {
          collected.set(idString, transformed)
        }
      })
    }

    const apiParams: any = {
      per_page: 50
    }
    if (excludeParam) {
      apiParams.exclude = excludeParam
    }

    for (const categoryId of uniqueCategoryIds) {
      try {
        const response = await this.getAllProducts({
          ...apiParams,
          category_id: categoryId as string | number
        })
        addProductsFromResponse(response)
      } catch (error) {
        console.error('Failed to load related products for category', categoryId, error)
      }
    }

    if (uniqueModelIds.length > 0) {
      try {
        const response = await this.getAllProducts({
          ...apiParams,
          model_ids: uniqueModelIds.join(',')
        })
        addProductsFromResponse(response)
      } catch (error) {
        console.error('Failed to load related products for model IDs', uniqueModelIds, error)
      }
    }

    if (uniqueModelCodes.length > 0) {
      try {
        const response = await this.getAllProducts({
          ...apiParams,
          model_codes: uniqueModelCodes.join(',')
        })
        addProductsFromResponse(response)
      } catch (error) {
        console.error('Failed to load related products for model codes', uniqueModelCodes, error)
      }
    }

    if (uniqueHauptgruppen.length > 0) {
      for (const hg of uniqueHauptgruppen) {
        try {
          const response = await this.getAllProducts({
            ...apiParams,
            hauptgruppe: hg as string
          })
          addProductsFromResponse(response)
        } catch (error) {
          console.error('Failed to load related products for hauptgruppe', hg, error)
        }
      }
    }

    // Only use series filter when there is no specific model filter
    if (uniqueSeries.length > 0 && uniqueModelIds.length === 0) {
      for (const seriesCode of uniqueSeries) {
        try {
          const response = await this.getAllProducts({
            ...apiParams,
            series: seriesCode as string
          })
          addProductsFromResponse(response)
        } catch (error) {
          console.error('Failed to load related products for series', seriesCode, error)
        }
      }
    }

    return Array.from(collected.values()).slice(0, Math.max(1, limit ?? 5))
  }

  /**
   * Search parts by license plate using RDW API
   */
  async searchPartsByLicensePlate(plate: string) {
    try {
      const response = await api.post('/parts-by-plate', { plate })
      return response.data
    } catch (error: any) {
      console.error('Error searching parts by license plate:', error)
      throw error
    }
  }
  async searchPartsByVin(vin: string) {
    try {
      const response = await api.post('/parts-by-vin', { vin })
      return response.data
    } catch (error: any) {
      console.error('Error searching parts by VIN:', error)
      throw error
    }
  }
}

export default new ProductService()
