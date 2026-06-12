import type { User } from '../../types/user'

const LOCAL_STORAGE_KEY = 'dora_auth_user'

export const DEFAULT_MOCK_USER: User = {
  id: 'mock_user_001',
  nickname: '哆啦拼豆用户',
  avatar: '',
  createdAt: Date.now(),
  lastLoginAt: Date.now(),
  isTestUser: true,
  preferredBrand: 'BOZLES',
}

export const authMockService = {
  // 获取当前用户
  getCurrentUser(): User | null {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return null
      }
    }
    return null
  },

  // 模拟登录
  mockLogin(): User {
    const user = DEFAULT_MOCK_USER
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user))
    return user
  },

  // 模拟退出登录
  mockLogout(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  },

  // 检查是否已登录
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null
  },

  // 获取或创建游客用户
  getOrCreateGuest(): User {
    const current = this.getCurrentUser()
    if (current) {
      return current
    }
    return {
      id: 'guest_' + Date.now(),
      nickname: '游客',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      isTestUser: false,
      preferredBrand: 'BOZLES',
    }
  },
}
