import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { getCredits, consumeCredits, devResetCredits } from '../services/api/creditsApi'

interface Credits {
  dailyTotal: number
  dailyUsed: number
  dailyRemaining: number
  extraCredits: number
  resetAt: string
}

export function useCredits() {
  const { token } = useAuth()
  const [credits, setCredits] = useState<Credits | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 从后端读取 AI 次数
  useEffect(() => {
    if (!token) {
      setCredits(null)
      setError(null)
      return
    }

    const fetchCredits = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getCredits(token)
        setCredits(data)
      } catch (err) {
        console.error('Failed to fetch credits:', err)
        setError(err instanceof Error ? err.message : '无法获取 AI 次数信息')
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
  }, [token])

  const consumeCredit = async (amount: number = 1, reason: string = 'ai_optimize') => {
    if (!token) {
      return { success: false, message: '请先登录' }
    }

    try {
      const updated = await consumeCredits(token, amount, reason)
      setCredits(updated)
      return { success: true, credits: updated }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 次数不足'
      setError(message)
      return { success: false, message }
    }
  }

  const resetCredits = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      const updated = await devResetCredits(token)
      setCredits(updated)
    } catch (err) {
      console.error('Failed to reset credits:', err)
      setError(err instanceof Error ? err.message : '重置失败')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    if (!token) return

    setLoading(true)
    try {
      const data = await getCredits(token)
      setCredits(data)
    } catch (err) {
      console.error('Failed to refresh credits:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    credits,
    loading,
    error,
    consumeCredit,
    resetCredits,
    refresh,
  }
}
