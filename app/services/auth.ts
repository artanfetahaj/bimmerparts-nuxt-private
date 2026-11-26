import api, { storage, clearAllAuthAndOrderTokens } from './api'
import { devLog } from '../utils/log'

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
  async login(credentials: LoginCredentials & { rememberMe?: boolean }): Promise<AuthResponse> {
    try {
      const { rememberMe, ...creds } = credentials
      const response = await api.post('/auth/login', creds)

      if (response.data.success) {
        storage.set('customer_token', response.data.data.token, rememberMe === true)
        storage.set('customer_data', JSON.stringify(response.data.data.customer), rememberMe === true)
        
        // Merge guest cart and wishlist with customer account
        try {
          await api.post('/cart/merge')
          // await api.post('/wishlist/merge')
        } catch (mergeError) {
          devLog.warn('Failed to merge cart/wishlist:', mergeError)
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
          // await api.post('/wishlist/merge')
        } catch (mergeError) {
          devLog.warn('Failed to merge cart/wishlist:', mergeError)
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
    } catch {
      // Intentionally swallowed — still clear local auth state
    } finally {
      clearAllAuthAndOrderTokens()
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
   * Send password reset link
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error: any) {
      if (error.response?.data) throw error.response.data
      throw { success: false, message: 'Network error occurred' }
    }
  }

  /**
   * Reset password using token from email link
   */
  async resetPassword(data: { email: string; token: string; password: string; password_confirmation: string }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post('/auth/reset-password', data)
      return response.data
    } catch (error: any) {
      if (error.response?.data) throw error.response.data
      throw { success: false, message: 'Network error occurred' }
    }
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
    } catch {
      clearAllAuthAndOrderTokens()
      dispatchAuthChanged()
      return false
    }
  }
}

export default new AuthService()
