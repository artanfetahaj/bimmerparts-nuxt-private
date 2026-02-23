import api from './api'

export interface BmwBrand {
  id: string
  name: string
  code: string
  description?: string
  is_active: boolean
  sort_order: number
}

export interface BmwModel {
  id: string
  name: string
  series: string
  code: string
  generation?: string
  type: string
  body_type?: string
  start_year?: number
  end_year?: number
  brand_id: number
  brand?: BmwBrand
  is_active: boolean
  sort_order: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

// Simple in-memory cache to avoid duplicate /bmw-models requests per session
let cachedModels: BmwModel[] | null = null
let modelsPromise: Promise<BmwModel[]> | null = null

/**
 * Fetch all BMW brands
 */
export async function getBmwBrands(): Promise<BmwBrand[]> {
  try {
    const response = await api.get<ApiResponse<BmwBrand[]>>('/bmw-brands')
    return response.data.data
  } catch (error) {
    console.error('Error fetching BMW brands:', error)
    throw error
  }
}

/**
 * Fetch all BMW models
 */
export async function getBmwModels(): Promise<BmwModel[]> {
  // If we already have the models cached, return them immediately
  if (cachedModels) {
    return cachedModels
  }

  // If a request is already in progress, reuse that promise
  if (modelsPromise) {
    return modelsPromise
  }

  modelsPromise = (async () => {
    try {
      const response = await api.get<ApiResponse<BmwModel[]>>('/bmw-models')
      cachedModels = response.data.data || []
      return cachedModels
    } catch (error) {
      console.error('Error fetching BMW models:', error)
      // Reset promise so a later call can retry
      modelsPromise = null
      throw error
    }
  })()

  return modelsPromise
}

/**
 * Fetch BMW models by brand ID
 */
export async function getBmwModelsByBrand(brandId: number): Promise<BmwModel[]> {
  try {
    const response = await api.get<ApiResponse<BmwModel[]>>(`/bmw-models/brand/${brandId}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching BMW models by brand:', error)
    throw error
  }
}
export async function getBmwModelsBySeries1(): Promise<BmwModel[]> {
  try {
    const response = await api.get<ApiResponse<BmwModel[]>>(`/bmw-models/series`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching BMW models by brand:', error)
    throw error
  }
}
/**
 * Fetch BMW models by series
 */
export async function getBmwModelsBySeries(series: string): Promise<BmwModel[]> {
  try {
    const response = await api.get<ApiResponse<BmwModel[]>>('car-models', {
      params: {
        filter: {
          series: series
        }
      },
    })
    return response.data.data
  } catch (error) {
    console.error('Error fetching BMW models by series:', error)
    throw error
  }
}
export async function getEnginesByModel(modelId: number): Promise<BmwModel[]> {
  try {
    const response = await api.get<ApiResponse<BmwModel[]>>(`car-variants`, {
      params: {
        filter: {
          car_model_id: modelId
        }
      }
    })
    return response.data.data
  } catch (error) {
    console.error(`Error fetching engines for model ${modelId}:`, error)
    throw error
  }
}
