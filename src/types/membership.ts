export type MembershipTier = 'free' | 'test' | 'basic' | 'pro' | 'enterprise'

export interface MembershipPlan {
  id: string
  tier: MembershipTier
  name: string
  description: string
  priceYuan: number
  billingCycle: 'monthly' | 'quarterly' | 'yearly'
  features: {
    maxProjects: number
    maxExportsPerMonth: number
    maxAiTasksPerMonth: number
    maxStorageGB: number
    canExportPdf: boolean
    canExportSvg: boolean
    canBatchExport: boolean
    prioritySupport: boolean
    customBrands: boolean
  }
}

export interface UserMembership {
  id: string
  userId: string
  tier: MembershipTier
  planId: string
  startDate: number
  endDate: number
  autoRenew: boolean
  isActive: boolean
}

export interface AiTaskQuota {
  userId: string
  tier: MembershipTier
  monthlyLimit: number
  used: number
  resetAt: number
}

export interface AiTaskCost {
  taskType: 'background-removal' | 'style-transfer' | 'super-resolution'
  style?: 'basic' | 'flat' | 'chibi' | 'healing' | 'block'
  costPerTask: number
  description: string
}

export const AI_TASK_COSTS: Record<string, number> = {
  'background-removal-basic': 0,
  'background-removal-ai': 1,
  'style-flat': 3,
  'style-chibi': 5,
  'style-healing': 5,
  'style-block': 3,
  'super-resolution': 2,
}

export interface RedeemCode {
  id: string
  code: string
  tier: MembershipTier
  daysValid: number
  redeemCount: number
  maxRedeems: number
  createdAt: number
  expiresAt: number
  notes?: string
}

export interface RedeemRecord {
  id: string
  userId: string
  codeId: string
  code: string
  redeemAt: number
  validUntil: number
}

export interface UsageLog {
  id: string
  userId: string
  taskType: string
  costCredit: number
  timestamp: number
  metadata?: Record<string, unknown>
}
