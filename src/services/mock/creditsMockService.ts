import type { AiCredits } from '../../types/work'
import { membershipMockService } from './membershipMockService'

const LOCAL_STORAGE_KEY = 'dora_ai_credits'

export const creditsMockService = {
  // 获取用户 AI 次数信息
  getCredits(userId: string): AiCredits {
    const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`)
    if (stored) {
      try {
        const credits = JSON.parse(stored) as AiCredits
        // 检查是否需要重置（新的一天）
        const resetAt = new Date(credits.resetAt)
        const now = new Date()
        if (now > resetAt) {
          // 需要重置
          return this.resetCredits(userId)
        }
        return credits
      } catch {
        return this.initializeCredits(userId)
      }
    }
    return this.initializeCredits(userId)
  },

  // 初始化用户 AI 次数
  initializeCredits(userId: string): AiCredits {
    const membership = membershipMockService.getMembership(userId)
    const credits: AiCredits = {
      userId,
      dailyTotal: membership.dailyAiLimit,
      dailyUsed: 0,
      dailyRemaining: membership.dailyAiLimit,
      extraCredits: 0,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(credits))
    return credits
  },

  // 重置每日次数
  resetCredits(userId: string): AiCredits {
    const membership = membershipMockService.getMembership(userId)
    const credits: AiCredits = {
      userId,
      dailyTotal: membership.dailyAiLimit,
      dailyUsed: 0,
      dailyRemaining: membership.dailyAiLimit,
      extraCredits: 0,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(credits))
    return credits
  },

  // 消耗次数
  consumeCredit(userId: string, amount: number = 1): { success: boolean; remaining: number; message: string } {
    const credits = this.getCredits(userId)
    const totalAvailable = credits.dailyRemaining + credits.extraCredits

    if (totalAvailable < amount) {
      return {
        success: false,
        remaining: totalAvailable,
        message: `今日 AI 次数不足，请升级会员或使用兑换码`,
      }
    }

    // 优先消耗额外次数
    let needed = amount
    let newExtra = credits.extraCredits
    let newUsed = credits.dailyUsed

    if (newExtra >= needed) {
      newExtra -= needed
    } else {
      needed -= newExtra
      newExtra = 0
      newUsed += needed
    }

    const updated: AiCredits = {
      ...credits,
      dailyUsed: newUsed,
      dailyRemaining: credits.dailyTotal - newUsed,
      extraCredits: newExtra,
    }

    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(updated))

    return {
      success: true,
      remaining: updated.dailyRemaining + updated.extraCredits,
      message: '已消耗 AI 次数',
    }
  },

  // 添加额外次数（用于兑换码）
  addExtraCredits(userId: string, amount: number): AiCredits {
    const credits = this.getCredits(userId)
    const updated: AiCredits = {
      ...credits,
      extraCredits: credits.extraCredits + amount,
    }
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(updated))
    return updated
  },

  // 手动重置（用于测试）
  manualReset(userId: string): AiCredits {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${userId}`)
    return this.initializeCredits(userId)
  },
}
