import api from './api'

export interface OrderItem {
  id: number
  title: string
  price: number
  quantity: number
  image?: string
}

export interface Order {
  id: number
  number?: string
  status: 'completed' | 'canceled' | 'pending' | string
  total: number
  date?: string
  created_at?: string
  items?: OrderItem[]
  shipping_method?: string
}

export interface CreateOrderPayload {
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  billing_address?: string
  address_street?: string
  address_house_number?: string
  address_house_number_addition?: string | null
  address_postcode?: string
  address_city?: string
  address_country_code?: string
  /** Mollie payment method: ideal | creditcard | bancontact */
  payment_method: string
  shipping_method?: string
  installation_requested?: boolean
  items: { product_id: string; quantity: number; install?: boolean }[]
}

export interface CreateOrderResponse {
  order_number: string
  order_access_token: string
}

export interface InitiatePaymentResponse {
  checkout_url: string
  payment_id: string
}

class OrdersService {
  async list(): Promise<Order[]> {
    const res = await api.get('/customer/orders')
    const raw = res.data?.data || []
    return raw.map((o: any) => ({
      id: o.id,
      number: o.order_number || o.number || String(o.id),
      status: (o.status || '').toLowerCase(),
      total: typeof o.total_amount === 'number' ? o.total_amount : parseFloat(o.total_amount || o.total || 0),
      date: o.formatted_date || o.created_at?.substring(0, 10),
      created_at: o.created_at,
      items: o.order_items || o.items || [],
      image: o.items?.[0]?.product?.image || null,
    }))
  }

  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const res = await api.post('/orders', payload)
    return res.data?.data || res.data || { order_number: '', order_access_token: '' }
  }

  async initiatePayment(orderNumber: string, orderToken: string, method: string): Promise<InitiatePaymentResponse> {
    const res = await api.post(
      `/orders/${orderNumber}/payment`,
      { method },
      { headers: { 'X-Order-Token': orderToken } },
    )
    return res.data?.data || res.data || { checkout_url: '', payment_id: '' }
  }

  async getPaymentStatus(orderNumber: string, orderToken?: string): Promise<{ payment_status: string; order_status: string }> {
    const headers: Record<string, string> = {}
    if (orderToken) headers['X-Order-Token'] = orderToken
    const res = await api.get(`/orders/${orderNumber}/payment/status`, { headers })
    return res.data || { payment_status: 'pending', order_status: 'pending' }
  }

  async getDetail(orderNumber: string): Promise<any> {
    const res = await api.get(`/customer/orders/${orderNumber}`)
    return res.data?.data || null
  }

  async downloadInvoice(orderNumber: string): Promise<void> {
    const res = await api.get(`/customer/orders/${orderNumber}/invoice/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice_${orderNumber}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export default new OrdersService()
