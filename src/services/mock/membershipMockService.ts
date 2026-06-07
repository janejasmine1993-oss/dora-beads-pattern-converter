export type MembershipLevel = 'free' | 'monthly' | 'yearly' | 'lifetime'

export interface MembershipMock {
  userId: string
  level: MembershipLevel
  expiresAt: string // ISO 8601 format
  dailyAiLimit: number
  maxSavedWorks: number
}

const LOCAL_STORAGE_KEY = 'dora_membership'

const MEMBERSHIP_BENEFITS: Record<MembershipLevel, {
  dailyAiLimit: number
  maxSavedWorks: number
  canHighQualityExport: boolean
  canBatchExport: boolean
  description: string
}> = {
  free: {
    dailyAiLimit: 3,
    maxSavedWorks: 3,
    canHighQualityExport: false,
    canBatchExport: false,
    description: '免费用户',
  },
  monthly: {
    dailyAiLimit: 50,
    maxSavedWorks: 100,
    canHighQualityExport: true,
    canBatchExport: false,
    description: '月会员',
  },
  yearly: {
    dailyAiLimit: 200,
    maxSavedWorks: 1000,
    canHighQualityExport: true,
    canBatchExport: true,
    description: '年会员',
  },
  lifetime: {
    dailyAiLimit: 500,
    maxSavedWorks: Infinity,
    canHighQualityExport: true,
    canBatchExport: true,
    description: '永久会员',
  },
}

export const membershipMockService = {
  // 获取用户会员信息
  getMembership(userId: string): MembershipMock {
    const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return this.getDefaultMembership(userId)
      }
    }
    return this.getDefaultMembership(userId)
  },

  // 获取默认会员信息（免费）
  getDefaultMembership(userId: string): MembershipMock {
    return {
      userId,
      level: 'free',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      dailyAiLimit: MEMBERSHIP_BENEFITS.free.dailyAiLimit,
      maxSavedWorks: MEMBERSHIP_BENEFITS.free.maxSavedWorks,
    }
  },

  // 模拟升级会员
  mockUpgradeMembership(userId: string, level: MembershipLevel): MembershipMock {
    const daysValid = level === 'monthly' ? 30 : level === 'yearly' ? 365 : 3650
    const membership: MembershipMock = {
      userId,
      level,
      expiresAt: new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString(),
      dailyAiLimit: MEMBERSHIP_BENEFITS[level].dailyAiLimit,
      maxSavedWorks: MEMBERSHIP_BENEFITS[level].maxSavedWorks,
    }
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(membership))
    return membership
  },

  // 获取会员权益详情
  getBenefits(level: MembershipLevel) {
    return MEMBERSHIP_BENEFITS[level]
  },

  // 获取所有会员等级选项
  getAllLevels(): MembershipLevel[] {
    return ['free', 'monthly', 'yearly', 'lifetime']
  },

  // 检查是否已过期
  isExpired(membership: MembershipMock): boolean {
    return new Date(membership.expiresAt) < new Date()
  },

  // 获取距过期还剩多少天
  getDaysUntilExpiry(membership: MembershipMock): number {
    const now = new Date()
    const expiry = new Date(membership.expiresAt)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  },
}
