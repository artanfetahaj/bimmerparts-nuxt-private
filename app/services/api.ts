import axios from 'axios'

// Create axios instance with base configuration
const envBase = (import.meta as any).env?.VITE_APP_HOST_API
// Ensure we have a valid base URL; fall back to localhost:8000 during development
const baseURL = (envBase && envBase.trim().length > 0 ? envBase : 'http://localhost:8000/api') + '/public'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Safe localStorage helpers (no-op on server)
const storage = {
  get: (key: string): string | null => {
    if (process.client) return localStorage.getItem(key)
    return null
  },
  set: (key: string, value: string): void => {
    if (process.client) localStorage.setItem(key, value)
  },
  remove: (key: string): void => {
    if (process.client) localStorage.removeItem(key)
  }
}

// Get or create session ID for guest users
const getSessionId = (): string => {
  let sessionId = storage.get('session_id')
  if (!sessionId) {
    sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    storage.set('session_id', sessionId)
  }
  return sessionId
}

// Request interceptor to add auth token and session ID
api.interceptors.request.use(
  (config) => {
    const token = storage.get('customer_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add session ID for guest users (for cart/wishlist persistence)
    const sessionId = getSessionId()
    config.headers['X-Session-ID'] = sessionId
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url || ''
      console.error('❌ 401 Unauthorized for:', url, error.response?.data)
      // Only clear customer auth if the 401 originates from customer-specific endpoints
      const shouldClear = /\/customer\//.test(url) || /\/auth\//.test(url)
      if (shouldClear) {
        console.warn('⚠️ Clearing auth due to 401 on customer endpoint')
        storage.remove('customer_token')
        storage.remove('customer_data')
        if (process.client) window.dispatchEvent(new CustomEvent('auth-changed'))
      }
    }
    return Promise.reject(error)
  }
)

export { storage }
export default api
