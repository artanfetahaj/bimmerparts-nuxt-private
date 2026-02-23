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
}

class OrdersService {
  async list(): Promise<Order[]> {
    const res = await api.get('/customer/orders')
    const raw = res.data?.data || []
    // Normalize to component-friendly shape
    return raw.map((o: any) => ({
      id: o.id,
      number: o.order_number || o.number || String(o.id),
      status: (o.status || '').toLowerCase(),
      total: typeof o.total_amount === 'number' ? o.total_amount : parseFloat(o.total_amount || o.total || 0),
      date: o.formatted_date || o.created_at?.substring(0,10),
      created_at: o.created_at,
      items: o.order_items || o.items || [],
      image: o.items?.[0]?.product?.image || null,
    }))
  }

  async create(payload: {
    customer_name: string
    customer_email: string
    customer_phone?: string
    shipping_address: string
    billing_address?: string
    payment_method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'
    notes?: string
    items: { product_id: number; quantity: number }[]
  }): Promise<{ order_number: string }> {
    const res = await api.post('/orders', payload)
    return res.data?.data || { order_number: '' }
  }
}

export default new OrdersService()


