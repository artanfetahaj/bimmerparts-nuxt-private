import api from '@/services/api'
import { isNull, isUndefined } from 'lodash-es'

export type SortOrder = 'ASC' | 'DESC'

export interface SortOptions {
  key?: string
  order?: SortOrder
}

/**
 * Base Model
 *
 * Mirrors the model pattern used in bimmerparts-vue, but stripped of auth
 * concerns so it stays simple for this Nuxt project.
 *
 * Usage:
 *   const models = await new CarModel().filter('series', '3 Series').all()
 *   const variant = await new CarVariant().find('some-uuid')
 */
export class Model {
  public meta?: Record<string, any> = {}

  // Must match the class name — used for re-hydration.
  protected $name = 'Model'

  protected $endpoint = ''

  protected $primaryKey = 'id'

  protected $fillable: string[] = []

  protected $page: number | null = null

  protected $limit: number | null = null

  protected $sort: SortOptions = {}

  protected $includes: string[] = []

  protected filters: Record<string, any> = {}

  constructor(attributes: Record<string, any> = {}) {
    this.hydrate(attributes)
  }

  // ─── Fluent query builders ──────────────────────────────────────────────────

  public include(includes: string | string[]): this {
    this.$includes = Array.isArray(includes) ? includes : [includes]
    return this
  }

  public filter(filters: string | Record<string, any>, value?: any): this {
    if (typeof filters === 'string') {
      this.filters = { ...this.filters, [filters]: value ?? null }
    } else {
      this.filters = { ...this.filters, ...filters }
    }
    return this
  }

  public removeFilter(key: string): this {
    delete this.filters[key]
    return this
  }

  public page(page: number): this {
    this.$page = page
    return this
  }

  public limit(limit: number): this {
    this.$limit = limit
    return this
  }

  public sort(key: string, order: SortOrder = 'ASC'): this {
    this.$sort = { key, order }
    return this
  }

  public clearSort(): this {
    this.$sort = {}
    return this
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  public all(): Promise<any> {
    return this.request('get', this.$endpoint)
  }

  public find(id: string | number): Promise<any> {
    return this.request('get', `${this.$endpoint}/${id}`)
  }

  public first(): Promise<any> {
    return this.limit(1)
      .all()
      .then((result: any) => {
        const list = Array.isArray(result) ? result : result?.data ?? []
        if (!list.length) return Promise.reject(new Error('No results'))
        Object.assign(this, list[0])
        return list[0]
      })
  }

  public create(attributes?: Record<string, any>): Promise<any> {
    return this.request('post', this.$endpoint, this.getPayload(attributes))
  }

  public update(attributes?: Record<string, any>): Promise<any> {
    const pk = this.resolvePrimaryKey()
    return this.request('patch', `${this.$endpoint}${pk ? `/${pk}` : ''}`, this.getPayload(attributes))
  }

  public put(attributes?: Record<string, any>): Promise<any> {
    return this.request('put', `${this.$endpoint}/${this.resolvePrimaryKey()}`, this.getPayload(attributes))
  }

  public delete(attributes?: Record<string, any>): Promise<any> {
    return this.request('delete', `${this.$endpoint}/${this.resolvePrimaryKey()}`, this.getPayload(attributes))
  }

  // ─── Hydration ──────────────────────────────────────────────────────────────

  public hydrate(attributes: Record<string, any> = {}): this {
    Object.entries(attributes).forEach(([key, value]) => {
      this.setAttribute(key, value)
    })
    return this
  }

  public setAttribute(attribute: string, value: any): void {
    const setter = `set${toPascalCase(attribute)}Attribute` as keyof this
    const hasSetter = Object.getPrototypeOf(this).hasOwnProperty(setter)
    ;(this as any)[attribute] = hasSetter ? (this as any)[setter](value) : value
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  public exists(): boolean {
    const pk = (this as any)[this.$primaryKey]
    return !isNull(pk) && !isUndefined(pk)
  }

  public resolvePrimaryKey(): string {
    return `${(this as any)[this.$primaryKey] ?? ''}`
  }

  public getPayload(attributes?: Record<string, any>): Record<string, any> {
    if (attributes !== undefined) return attributes
    const payload: Record<string, any> = {}
    for (const key of this.$fillable) {
      const value = (this as any)[key]
      if (!isNull(value) && !isUndefined(value)) payload[key] = value
    }
    return payload
  }

  public clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }

  // ─── Core HTTP request ──────────────────────────────────────────────────────

  public request(
    method: string,
    url: string,
    payload: Record<string, any> = {},
  ): Promise<any> {
    // Append ?with[]=relation for eager loads
    if (this.$includes.length) {
      const query = this.$includes.map(i => `with[]=${encodeURIComponent(i)}`).join('&')
      url += url.includes('?') ? `&${query}` : `?${query}`
    }

    // Build query / body params
    if (Object.keys(this.filters).length) payload.filter = { ...this.filters }
    if (this.$page !== null) payload.page = this.$page
    if (this.$limit !== null) payload.limit = this.$limit
    if (this.$sort.key) payload.sort = this.$sort.order === 'DESC' ? `!${this.$sort.key}` : this.$sort.key

    const isReadMethod = ['get', 'delete'].includes(method.toLowerCase())

    const axiosArgs: any[] = [url]
    if (isReadMethod) {
      axiosArgs.push({ params: payload })
    } else {
      axiosArgs.push(payload)
    }

    return (api as any)[method.toLowerCase()](...axiosArgs)
      .then((response: any) => this.responseToModel(response))
  }

  // ─── Response → Model(s) ────────────────────────────────────────────────────

  protected responseToModel(response: any): any {
    const { data } = response

    // Laravel paginated: { data: [...], meta: { ... } }
    if (data?.data !== undefined && Array.isArray(data.data)) {
      return {
        data: data.data.map((row: any) => this.rowToModel(row)),
        meta: data.meta,
      }
    }

    // Non-paginated collection
    if (Array.isArray(data)) {
      return data.map((row: any) => this.rowToModel(row))
    }

    // Single resource
    return this.rowToModel(data)
  }

  protected rowToModel(row: Record<string, any>): this {
    const instance: this = Object.create(Object.getPrototypeOf(this))
    instance.hydrate(row)
    return instance
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str
    .replace(/([-_][a-z])/gi, m => m.toUpperCase().replace(/[-_]/, ''))
    .replace(/^[a-z]/, m => m.toUpperCase())
}
