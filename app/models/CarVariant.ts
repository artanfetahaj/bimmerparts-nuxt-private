import { Model } from './Model'
import api from '@/services/api'
import type { CarModel } from './CarModel'
import { getSeriesImage, getSeriesLabel } from '@/collections/bmw-series'

// ─── Model ────────────────────────────────────────────────────────────────────

export class CarVariant extends Model {
  protected override $name = 'CarVariant'
  protected override $endpoint = '/car-variants'

  // Fields from CarVariantResource
  id!: string
  name!: string
  full_name!: string
  fuel_type?: string
  start_year?: number
  end_year?: number

  // Always included (not behind whenLoaded in the resource)
  car_model!: CarModel
  car_engine?: CarEngine

  // ─── Lookup by license plate or VIN ────────────────────────────────────────

  async lookupCarVariant(payload: { plate: string } | { vin: string }): Promise<CarVariant> {
    const response = await api.post('/lookup-car-variant', payload)
    return this.rowToModel(response.data)
  }
}

// ─── Includes enum ────────────────────────────────────────────────────────────

export enum CarVariantIncludes {
  CAR_MODEL  = 'car_model',
  CAR_ENGINE = 'car_engine',
}

// ─── Filters enum ─────────────────────────────────────────────────────────────

export enum CarVariantFilterKey {
  CAR_MODEL_ID = 'car_model_id',
  FUEL_TYPE    = 'fuel_type',
  SEARCH       = 'search',
}

export type CarVariantFilters = Partial<{
  [CarVariantFilterKey.CAR_MODEL_ID]: string
  [CarVariantFilterKey.FUEL_TYPE]:    string
  [CarVariantFilterKey.SEARCH]:       string
}>

// ─── Nested types (from CarEngineResource) ────────────────────────────────────

export interface CarEngine {
  id: string
  code: string
  family?: string
  fuel_type?: string
  displacement?: number
  description?: string
}
