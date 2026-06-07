import { useState, useEffect } from 'react'
import type { AiCredits } from '../types/work'
import { creditsMockService } from '../services/mock/creditsMockService'

export function useCredits(userId: string | undefined) {
  const [credits, setCredits] = useState<AiCredits | null>(null)

  useEffect(() => {
    if (!userId) {
      setCredits(null)
      return
    }

    const c = creditsMockService.getCredits(userId)
    setCredits(c)
  }, [userId])

  const consumeCredit = (amount: number = 1) => {
    if (!userId) return { success: false, remaining: 0, message: '请先登录' }
    const result = creditsMockService.consumeCredit(userId, amount)
    if (result.success) {
      const updated = creditsMockService.getCredits(userId)
      setCredits(updated)
    }
    return result
  }

  const addExtraCredits = (amount: number) => {
    if (!userId) return
    const updated = creditsMockService.addExtraCredits(userId, amount)
    setCredits(updated)
  }

  const resetCredits = () => {
    if (!userId) return
    const updated = creditsMockService.resetCredits(userId)
    setCredits(updated)
  }

  const refresh = () => {
    if (!userId) return
    const updated = creditsMockService.getCredits(userId)
    setCredits(updated)
  }

  return {
    credits,
    consumeCredit,
    addExtraCredits,
    resetCredits,
    refresh,
  }
}
