import type { User, AuthToken, AuthSession } from '../../types/user'

export interface IAuthService {
  loginWithWeChat(code: string): Promise<AuthToken>
  loginWithPhone(phone: string, code: string): Promise<AuthToken>
  loginWithEmail(email: string, password: string): Promise<AuthToken>
  logout(userId: string, sessionId: string): Promise<void>
  refreshToken(refreshToken: string): Promise<AuthToken>
  getCurrentUser(sessionId: string): Promise<User | null>
  validateSession(sessionId: string): Promise<boolean>
  createUser(user: User): Promise<User>
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User>
}

export class MockAuthService implements IAuthService {
  private sessions: Map<string, AuthSession> = new Map()
  private users: Map<string, User> = new Map()

  async loginWithWeChat(_code: string): Promise<AuthToken> {
    const userId = `user-${Date.now()}`
    const user: User = {
      id: userId,
      nickname: '测试用户',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      isTestUser: true,
      preferredBrand: 'MARD',
    }
    this.users.set(userId, user)

    return this.createToken(user)
  }

  async loginWithPhone(phone: string, _code: string): Promise<AuthToken> {
    const userId = `user-${Date.now()}`
    const user: User = {
      id: userId,
      phone,
      nickname: `用户${phone.slice(-4)}`,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      isTestUser: false,
      preferredBrand: 'MARD',
    }
    this.users.set(userId, user)

    return this.createToken(user)
  }

  async loginWithEmail(email: string, _password: string): Promise<AuthToken> {
    const userId = `user-${Date.now()}`
    const user: User = {
      id: userId,
      email,
      nickname: email.split('@')[0],
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      isTestUser: false,
      preferredBrand: 'MARD',
    }
    this.users.set(userId, user)

    return this.createToken(user)
  }

  async logout(_userId: string, sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
  }

  async refreshToken(_refreshToken: string): Promise<AuthToken> {
    return {
      accessToken: `access-${Date.now()}`,
      refreshToken: `refresh-${Date.now()}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      user: {
        id: 'user-123',
        nickname: '测试',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        isTestUser: true,
        preferredBrand: 'MARD',
      },
    }
  }

  async getCurrentUser(sessionId: string): Promise<User | null> {
    const session = this.sessions.get(sessionId)
    if (!session) return null
    return this.users.get(session.userId) || null
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    return session.expiresAt > Date.now()
  }

  async createUser(user: User): Promise<User> {
    this.users.set(user.id, user)
    return user
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(userId)
    if (!user) throw new Error('User not found')
    const updated = { ...user, ...updates }
    this.users.set(userId, updated)
    return updated
  }

  private createToken(user: User): AuthToken {
    const sessionId = `session-${Date.now()}`
    const session: AuthSession = {
      sessionId,
      userId: user.id,
      deviceId: 'device-123',
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      ipAddress: '127.0.0.1',
      userAgent: 'mock-agent',
    }
    this.sessions.set(sessionId, session)

    return {
      accessToken: `access-${Date.now()}`,
      refreshToken: `refresh-${Date.now()}`,
      expiresAt: session.expiresAt,
      user,
    }
  }
}

let authService: IAuthService | null = null

export function getAuthService(): IAuthService {
  if (!authService) {
    authService = new MockAuthService()
  }
  return authService
}

export function setAuthService(service: IAuthService): void {
  authService = service
}
