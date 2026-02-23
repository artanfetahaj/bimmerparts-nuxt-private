import api from './api'

export interface OrderItem {
  product_id: number
  quantity: number
}

export interface CreateOrderRequest {
  customer_name: string
  customer_email: string
  customer_phone?: string
  shipping_address: string
  billing_address?: string
  payment_method: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'
  notes?: string
  items: OrderItem[]
}

export interface OrderResponse {
  success: boolean
  message: string
  data?: {
    order_number: string
    total: number
    status: string
  }
  errors?: any
}

class OrderService {
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    try {
      const response = await api.post('/orders', orderData)
      return response.data
    } catch (error: any) {
      console.error('Error creating order:', error)
      
      // Handle validation errors
      if (error.response?.status === 422) {
        return {
          success: false,
          message: 'Validation failed',
          errors: error.response.data.errors
        }
      }
      
      // Handle other errors
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order',
        errors: error.response?.data?.errors
      }
    }
  }

  async getOrder(orderNumber: string) {
    try {
      const response = await api.get(`/orders/${orderNumber}`)
      return response.data
    } catch (error) {
      console.error('Error fetching order:', error)
      throw error
    }
  }

  async trackOrder(orderNumber: string) {
    try {
      const response = await api.get(`/orders/${orderNumber}/track`)
      return response.data
    } catch (error) {
      console.error('Error tracking order:', error)
      throw error
    }
  }

  // Transform frontend payment method to API format
  transformPaymentMethod(frontendMethod: 'bank' | 'cash'): 'credit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery' {
    switch (frontendMethod) {
      case 'bank':
        return 'bank_transfer'
      case 'cash':
        return 'cash_on_delivery'
      default:
        return 'bank_transfer'
    }
  }

  // Transform cart items to API format
  transformCartItems(cartItems: any[]): OrderItem[] {
    return cartItems.map(item => ({
      product_id: parseInt(item.id), // Convert string ID to number
      quantity: item.quantity
    }))
  }

  // Build shipping address from form data
  buildShippingAddress(formData: any): string {
    const parts = [
      formData.address,
      formData.address2,
      formData.city,
      formData.postCode,
      formData.country
    ].filter(Boolean)
    
    return parts.join(', ')
  }
}

export default new OrderService()
