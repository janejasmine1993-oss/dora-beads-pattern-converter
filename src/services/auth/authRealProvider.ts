import type { User } from '../../types/user'
import type { AuthProvider } from './authMockProvider'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

interface LoginResponse {
  success: true
  token: string
  user: {
    id: string
    email: string
    nickname: string
    avatarUrl: string
    loginProvider: string
  }
}

interface ErrorResponse {
  success: false
  error: string
}

function toUser(authUser: any): User {
  return {
    id: authUser.id,
    email: authUser.email,
    nickname: authUser.nickname,
    avatar: authUser.avatarUrl,
    createdAt: 0,
    lastLoginAt: 0,
    isTestUser: false,
    preferredBrand: 'BOZLES',
  }
}

export const authRealProvider: AuthProvider = {
  async register(email: string, password: string, nickname: string) {
    try {
      console.log('[AuthRealProvider] Register started', { email, apiUrl: API_BASE_URL })
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, nickname }),
      })
      console.log('[AuthRealProvider] Register response status:', res.status)
      const data = (await res.json()) as LoginResponse | ErrorResponse
      console.log('[AuthRealProvider] Register response data:', { success: data.success, hasError: 'error' in data })

      if (!data.success) {
        return { success: false, error: (data as ErrorResponse).error }
      }

      const response = data as LoginResponse
      const user = toUser(response.user)
      localStorage.setItem('dora_auth_token', response.token)
      localStorage.setItem('dora_auth_user', JSON.stringify(user))
      console.log('[AuthRealProvider] Register success, user saved to localStorage')
      return { success: true, token: response.token, user }
    } catch (err) {
      const error = err instanceof Error ? err.message : '网络错误'
      console.error('[AuthRealProvider] Register error:', error)
      return { success: false, error }
    }
  },

  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = (await res.json()) as LoginResponse | ErrorResponse

      if (!data.success) {
        return { success: false, error: (data as ErrorResponse).error }
      }

      const response = data as LoginResponse
      const user = toUser(response.user)
      localStorage.setItem('dora_auth_token', response.token)
      localStorage.setItem('dora_auth_user', JSON.stringify(user))
      return { success: true, token: response.token, user }
    } catch (err) {
      const error = err instanceof Error ? err.message : '网络错误'
      return { success: false, error }
    }
  },

  async logout() {
    localStorage.removeItem('dora_auth_token')
    localStorage.removeItem('dora_auth_user')
  },

  async getCurrentUser() {
    const userStr = localStorage.getItem('dora_auth_user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  },

  getToken(): string | null {
    return localStorage.getItem('dora_auth_token') || null
  },
}
