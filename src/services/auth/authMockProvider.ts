import { authMockService } from '../mock/authMockService'
import type { User } from '../../types/user'

export interface AuthProvider {
  register(email: string, password: string, nickname: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }>
  login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }>
  logout(): Promise<void>
  getCurrentUser(): Promise<User | null>
  getToken(): string | null
}

export const authMockProvider: AuthProvider = {
  async register(_email: string, _password: string, _nickname: string) {
    // Mock always succeeds
    const user = authMockService.mockLogin()
    return { success: true, user, token: 'mock-token' }
  },

  async login(_email: string, _password: string) {
    const user = authMockService.mockLogin()
    return { success: true, user, token: 'mock-token' }
  },

  async logout() {
    authMockService.mockLogout()
  },

  async getCurrentUser() {
    return authMockService.getCurrentUser()
  },

  getToken(): string | null {
    return localStorage.getItem('dora_auth_token_mock') || null
  },
}
