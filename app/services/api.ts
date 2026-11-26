import axios from 'axios'

// Create axios instance with base configuration
const envBase = (import.meta as any).env?.NUXT_PUBLIC_API_URL
const baseURL = (envBase && envBase.trim().length > 0 ? envBase : 'http://127.0.0.1:8000/api') + '/public'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// UUID validation regex
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Storage helpers — customer_token lives in sessionStorage by default (overridden to localStorage when "remember me" is set)
const storage = {
  get: (key: string): string | null => {
    if (!process.client) return null
    return sessionStorage.getItem(key) ?? localStorage.getItem(key)
  },
  set: (key: string, value: string, persistent = false): void => {
    if (!process.client) return
    if (persistent) {
      localStorage.setItem(key, value)
    } else {
      sessionStorage.setItem(key, value)
      // Remove any stale persistent copy
      localStorage.removeItem(key)
    }
  },
  remove: (key: string): void => {
    if (!process.client) return
    sessionStorage.removeItem(key)
    localStorage.removeItem(key)
  },
}

function clearAllAuthAndOrderTokens() {
  if (!process.client) return
  storage.remove('customer_token')
  storage.remove('customer_data')
  // Clear any order tokens stored during this session
  const keysToRemove: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key && key.startsWith('order_token_')) keysToRemove.push(key)
  }
  keysToRemove.forEach(k => sessionStorage.removeItem(k))
}

// Get or create a UUID session ID for guest users; migrate legacy non-UUID ids
const getSessionId = (): string => {
  if (!process.client) return ''
  let sessionId = localStorage.getItem('session_id')
  if (!sessionId || !UUID_RE.test(sessionId)) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

// Request interceptor — attach auth token and guest session ID
api.interceptors.request.use(
  (config) => {
    const token = storage.get('customer_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    const sessionId = getSessionId()
    if (sessionId) config.headers['X-Session-ID'] = sessionId
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — clear auth on 401 from any /customer/ route
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url || ''
      if (/\/customer\//.test(url) || /\/auth\//.test(url)) {
        clearAllAuthAndOrderTokens()
        if (process.client) window.dispatchEvent(new CustomEvent('auth-changed'))
      }
    }
    return Promise.reject(error)
  },
)

export { storage, clearAllAuthAndOrderTokens }
export default api
