import { useState, useEffect } from 'react'
import type { User } from '../types/user'
import { getAuthProvider } from '../services/auth/authProviderFactory'
import { authMockService } from '../services/mock/authMockService'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const provider = getAuthProvider()

  // 初始化用户状态
  useEffect(() => {
    const init = async () => {
      console.log('[useAuth] Initializing auth state with provider mode')
      const currentUser = await provider.getCurrentUser()
      const currentToken = provider.getToken()
      console.log('[useAuth] Loaded user:', currentUser ? currentUser.email : 'null', 'Token:', currentToken ? 'exists' : 'null')
      setUser(currentUser)
      setToken(currentToken)
      setIsLoggedIn(currentUser !== null)
      setIsLoading(false)
    }
    init()
  }, [provider])

  const login = () => {
    // Mock 模式兼容：直接调用 mockLogin
    const mockUser = authMockService.mockLogin()
    setUser(mockUser)
    setIsLoggedIn(true)
  }

  const loginWithEmail = async (email: string, password: string) => {
    setIsSubmitting(true)
    try {
      const result = await provider.login(email, password)
      if (result.success && result.user && result.token) {
        setUser(result.user)
        setToken(result.token)
        setIsLoggedIn(true)
        return { success: true }
      } else {
        return { success: false, error: result.error || '登录失败' }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const register = async (email: string, password: string, nickname: string) => {
    console.log('[useAuth.register] Starting registration', { email, nickname })
    setIsSubmitting(true)
    try {
      const result = await provider.register(email, password, nickname)
      console.log('[useAuth.register] Provider returned:', { success: result.success, hasError: !!result.error })
      if (result.success && result.user && result.token) {
        setUser(result.user)
        setToken(result.token)
        setIsLoggedIn(true)
        console.log('[useAuth.register] Registration successful')
        return { success: true }
      } else {
        console.log('[useAuth.register] Registration failed:', result.error)
        return { success: false, error: result.error || '注册失败' }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const logout = async () => {
    await provider.logout()
    setUser(null)
    setToken(null)
    setIsLoggedIn(false)
  }

  return {
    user,
    isLoggedIn,
    isLoading,
    isSubmitting,
    token,
    login,
    loginWithEmail,
    register,
    logout,
  }
}
