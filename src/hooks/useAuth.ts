import { useState, useEffect } from 'react'
import type { User } from '../types/user'
import { authMockService } from '../services/mock/authMockService'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化用户状态
  useEffect(() => {
    const currentUser = authMockService.getCurrentUser()
    setUser(currentUser)
    setIsLoggedIn(currentUser !== null)
    setIsLoading(false)
  }, [])

  const login = () => {
    const user = authMockService.mockLogin()
    setUser(user)
    setIsLoggedIn(true)
  }

  const logout = () => {
    authMockService.mockLogout()
    setUser(null)
    setIsLoggedIn(false)
  }

  return {
    user,
    isLoggedIn,
    isLoading,
    login,
    logout,
  }
}
