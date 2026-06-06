export interface User {
  id: string
  email?: string
  phone?: string
  openId?: string
  nickname: string
  avatar?: string
  createdAt: number
  lastLoginAt: number
  isTestUser: boolean
  preferredBrand: string
}

export interface UserPreferences {
  userId: string
  theme: 'light' | 'dark'
  defaultBrand: string
  defaultSize: { width: number; height: number }
  autoSaveEnabled: boolean
}

export interface UserStatistics {
  userId: string
  totalPatterns: number
  totalExports: number
  aiTasksUsed: number
  lastPatternAt: number
  favoriteColors: string[]
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: User
}

export interface AuthSession {
  sessionId: string
  userId: string
  deviceId: string
  createdAt: number
  expiresAt: number
  ipAddress: string
  userAgent: string
}
