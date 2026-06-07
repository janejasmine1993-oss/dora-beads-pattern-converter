import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { getMembership, devUpgradeMembership } from '../services/api/membershipApi'

interface Membership {
  level: 'free' | 'monthly' | 'yearly' | 'lifetime'
  status: string
  startedAt: string
  expiresAt: string | null
  benefits: {
    dailyAiCredits: number
    maxWorks: number
    canHdExport: boolean
    canBatchManage: boolean
  }
}

const LEVEL_NAMES = {
  free: '免费用户',
  monthly: '月会员',
  yearly: '年会员',
  lifetime: '永久会员',
}

export function useMembership() {
  const { user, token } = useAuth()
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 从后端读取会员信息
  useEffect(() => {
    if (!user || !token) {
      setMembership(null)
      setError(null)
      return
    }

    const fetchMembership = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getMembership(token)
        setMembership(data)
      } catch (err) {
        console.error('Failed to fetch membership:', err)
        setError(err instanceof Error ? err.message : '无法获取会员信息')
      } finally {
        setLoading(false)
      }
    }

    fetchMembership()
  }, [user, token])

  const getDaysUntilExpiry = (m: Membership) => {
    if (!m.expiresAt) return -1
    const expiry = new Date(m.expiresAt)
    const now = new Date()
    const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const upgradeMembership = async (level: 'free' | 'monthly' | 'yearly' | 'lifetime') => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      const data = await devUpgradeMembership(token, level)
      setMembership(data.membership)
    } catch (err) {
      console.error('Failed to upgrade membership:', err)
      setError(err instanceof Error ? err.message : '升级失败')
    } finally {
      setLoading(false)
    }
  }

  return {
    membership,
    loading,
    error,
    daysUntilExpiry: membership ? getDaysUntilExpiry(membership) : 0,
    upgradeMembership,
    levelNames: LEVEL_NAMES,
    allLevels: ['free', 'monthly', 'yearly', 'lifetime'] as const,
  }
}
