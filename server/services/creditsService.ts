import { prisma } from './db'

export async function getCreditsByUserId(userId: string) {
  const credits = await prisma.aiCredits.findUnique({
    where: { userId },
  })

  if (!credits) return null

  // 检查是否需要重置（跨天）
  const now = new Date()
  const resetAt = new Date(credits.resetAt)
  const needsReset = now.getDate() !== resetAt.getDate() || now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()

  if (needsReset) {
    // 重置每日使用量
    const updated = await prisma.aiCredits.update({
      where: { userId },
      data: {
        dailyUsed: 0,
        resetAt: new Date(),
      },
    })

    return {
      dailyTotal: updated.dailyTotal,
      dailyUsed: updated.dailyUsed,
      dailyRemaining: updated.dailyTotal - updated.dailyUsed,
      extraCredits: updated.extraCredits,
      resetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  return {
    dailyTotal: credits.dailyTotal,
    dailyUsed: credits.dailyUsed,
    dailyRemaining: credits.dailyTotal - credits.dailyUsed,
    extraCredits: credits.extraCredits,
    resetAt: new Date(resetAt.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

export async function consumeCredits(userId: string, amount: number, reason: string, relatedJobId?: string) {
  // 获取当前次数
  const credits = await getCreditsByUserId(userId)
  if (!credits) {
    return {
      success: false,
      message: '无法获取 AI 次数信息',
    }
  }

  // 检查次数是否足够
  const totalAvailable = credits.dailyRemaining + credits.extraCredits
  if (totalAvailable < amount) {
    return {
      success: false,
      message: 'AI 次数不足',
    }
  }

  // 优先扣每日次数，不足时扣额外次数
  const fromDaily = Math.min(amount, credits.dailyRemaining)
  const fromExtra = amount - fromDaily

  const updated = await prisma.aiCredits.update({
    where: { userId },
    data: {
      dailyUsed: credits.dailyUsed + fromDaily,
      extraCredits: credits.extraCredits - fromExtra,
    },
  })

  // 记录 AI Job 的消耗（如果提供了 jobId）
  if (relatedJobId) {
    await prisma.aiJob.updateMany({
      where: { id: relatedJobId },
      data: { creditCost: amount },
    })
  }

  return {
    success: true,
    credits: {
      dailyTotal: updated.dailyTotal,
      dailyUsed: updated.dailyUsed,
      dailyRemaining: updated.dailyTotal - updated.dailyUsed,
      extraCredits: updated.extraCredits,
    },
  }
}

export async function resetDailyUsage(userId: string) {
  const updated = await prisma.aiCredits.update({
    where: { userId },
    data: {
      dailyUsed: 0,
      resetAt: new Date(),
    },
  })

  return {
    dailyTotal: updated.dailyTotal,
    dailyUsed: updated.dailyUsed,
    dailyRemaining: updated.dailyTotal - updated.dailyUsed,
    extraCredits: updated.extraCredits,
  }
}
