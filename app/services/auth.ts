import api, { storage } from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
}

export interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  status: string
  created_at: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    customer: Customer
    token: string
  }
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

const dispatchAuthChanged = () => {
  if (process.client) window.dispatchEvent(new CustomEvent('auth-changed'))
}

class AuthService {
  /**
   * Login customer
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        storage.set('customer_token', response.data.data.token)
        storage.set('customer_data', JSON.stringify(response.data.data.customer))
        
        // Merge guest cart and wishlist with customer account
        try {
          await api.post('/cart/merge')
          await api.post('/wishlist/merge')
        } catch (mergeError) {
          console.warn('Failed to merge cart/wishlist:', mergeError)
        }
        
        dispatchAuthChanged()
      }
      
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data
      }
      throw {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  /**
   * Register new customer
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', data)
      
      if (response.data.success) {
        storage.set('customer_token', response.data.data.token)
        storage.set('customer_data', JSON.stringify(response.data.data.customer))
        
        // Merge guest cart and wishlist with customer account
        try {
          await api.post('/cart/merge')
          await api.post('/wishlist/merge')
        } catch (mergeError) {
          console.warn('Failed to merge cart/wishlist:', mergeError)
        }
        
        dispatchAuthChanged()
      }
      
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data
      }
      throw {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  /**
   * Logout customer
   */
  async logout(): Promise<void> {
    try {
      if (this.isAuthenticated()) {
        await api.post('/customer/logout')
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      storage.remove('customer_token')
      storage.remove('customer_data')
      dispatchAuthChanged()
    }
  }

  /**
   * Get current customer data from localStorage
   */
  getCurrentCustomer(): Customer | null {
    const customerData = storage.get('customer_data')
    return customerData ? JSON.parse(customerData) : null
  }

  /**
   * Check if customer is authenticated
   */
  isAuthenticated(): boolean {
    const token = storage.get('customer_token')
    const customer = storage.get('customer_data')
    return !!token && !!customer
  }

  /**
   * Get customer profile from API
   */
  async getProfile(): Promise<Customer> {
    const response = await api.get('/customer/profile')
    return response.data.data
  }

  /**
   * Update customer profile
   */
  async updateProfile(data: Partial<RegisterData>): Promise<Customer> {
    const response = await api.put('/customer/profile', data)
    
    storage.set('customer_data', JSON.stringify(response.data.data))
    dispatchAuthChanged()
    
    return response.data.data
  }

  /**
   * Change customer password
   */
  async changePassword(data: { current_password: string; password: string; password_confirmation: string }): Promise<void> {
    await api.post('/customer/change-password', data)
  }

  /**
   * Validate token and restore session if valid
   */
  async validateSession(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false
    }

    try {
      const profile = await this.getProfile()
      storage.set('customer_data', JSON.stringify(profile))
      return true
    } catch (error) {
      storage.remove('customer_token')
      storage.remove('customer_data')
      dispatchAuthChanged()
      return false
    }
  }
}

export default new AuthService()
