import { membershipMockService } from './membershipMockService'
import { creditsMockService } from './creditsMockService'
import type { MembershipLevel } from './membershipMockService'

const LOCAL_STORAGE_HISTORY_KEY = 'dora_redeem_history'

export interface RedeemCodeDefinition {
  code: string
  rewardType: 'membership' | 'credits'
  rewardValue: number | MembershipLevel
  description: string
}

// 预设兑换码
const PREDEFINED_CODES: Record<string, RedeemCodeDefinition> = {
  'DORA-VIP-30': {
    code: 'DORA-VIP-30',
    rewardType: 'membership',
    rewardValue: 'monthly',
    description: '获得 30 天月会员',
  },
  'DORA-AI-100': {
    code: 'DORA-AI-100',
    rewardType: 'credits',
    rewardValue: 100,
    description: '获得 100 次额外 AI 次数',
  },
  'DORA-TEST-999': {
    code: 'DORA-TEST-999',
    rewardType: 'membership',
    rewardValue: 'lifetime',
    description: '测试用，获得永久会员',
  },
}

export interface RedeemResult {
  success: boolean
  message: string
  rewardType?: 'membership' | 'credits'
  rewardValue?: number | MembershipLevel
}

function getRedeemHistory(userId: string): string[] {
  const stored = localStorage.getItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

function addToRedeemHistory(userId: string, code: string): void {
  const history = getRedeemHistory(userId)
  history.push(code)
  localStorage.setItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`, JSON.stringify(history))
}

export const redeemCodeMockService = {
  // 兑换码列表（用于测试显示）
  getAvailableCodes(): RedeemCodeDefinition[] {
    return Object.values(PREDEFINED_CODES)
  },

  // 兑换
  redeem(userId: string, code: string): RedeemResult {
    const trimmedCode = code.toUpperCase().trim()
    const definition = PREDEFINED_CODES[trimmedCode]

    if (!definition) {
      return {
        success: false,
        message: '兑换码无效，请检查后重试',
      }
    }

    const history = getRedeemHistory(userId)
    if (history.includes(trimmedCode)) {
      return {
        success: false,
        message: '该兑换码已使用',
      }
    }

    // 应用奖励
    if (definition.rewardType === 'membership') {
      membershipMockService.mockUpgradeMembership(userId, definition.rewardValue as MembershipLevel)
    } else if (definition.rewardType === 'credits') {
      creditsMockService.addExtraCredits(userId, definition.rewardValue as number)
    }

    addToRedeemHistory(userId, trimmedCode)

    return {
      success: true,
      message: definition.description,
      rewardType: definition.rewardType,
      rewardValue: definition.rewardValue,
    }
  },

  // 获取用户的兑换历史
  getRedeemHistory(userId: string): string[] {
    return getRedeemHistory(userId)
  },

  // 清除兑换历史（仅用于测试）
  clearHistory(userId: string): void {
    localStorage.removeItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`)
  },

  // 检查兑换码是否已使用
  isCodeUsed(userId: string, code: string): boolean {
    const history = getRedeemHistory(userId)
    return history.includes(code.toUpperCase().trim())
  },
}
