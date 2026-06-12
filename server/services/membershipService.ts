import { prisma } from './db'

export const MEMBERSHIP_BENEFITS = {
  free: {
    dailyAiCredits: 5,
    maxWorks: 3,
    canHdExport: false,
    canBatchManage: false,
  },
  monthly: {
    dailyAiCredits: 50,
    maxWorks: 100,
    canHdExport: true,
    canBatchManage: true,
  },
  yearly: {
    dailyAiCredits: 200,
    maxWorks: 1000,
    canHdExport: true,
    canBatchManage: true,
  },
  lifetime: {
    dailyAiCredits: 500,
    maxWorks: -1, // unlimited
    canHdExport: true,
    canBatchManage: true,
  },
}

export async function getMembershipByUserId(userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId },
  })

  if (!membership) return null

  const benefits = MEMBERSHIP_BENEFITS[membership.level as keyof typeof MEMBERSHIP_BENEFITS] || MEMBERSHIP_BENEFITS.free

  return {
    level: membership.level,
    status: membership.status,
    startedAt: membership.startedAt.toISOString(),
    expiresAt: membership.expiresAt ? membership.expiresAt.toISOString() : null,
    benefits,
  }
}

export async function upgradeMembership(userId: string, level: keyof typeof MEMBERSHIP_BENEFITS) {
  // 获取新等级的日次数
  const newBenefits = MEMBERSHIP_BENEFITS[level]

  // 更新会员信息
  const membership = await prisma.membership.update({
    where: { userId },
    data: {
      level,
      status: 'active',
      startedAt: new Date(),
      expiresAt: level === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 月会员30天后过期
    },
  })

  // 同步更新 AI 次数
  await prisma.aiCredits.update({
    where: { userId },
    data: {
      dailyTotal: newBenefits.dailyAiCredits,
      dailyUsed: 0,
      resetAt: new Date(),
    },
  })

  const benefits = MEMBERSHIP_BENEFITS[membership.level as keyof typeof MEMBERSHIP_BENEFITS]

  return {
    level: membership.level,
    status: membership.status,
    startedAt: membership.startedAt.toISOString(),
    expiresAt: membership.expiresAt ? membership.expiresAt.toISOString() : null,
    benefits,
  }
}
