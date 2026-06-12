import { useState, useEffect } from 'react'
import type { RedeemCodeDefinition, RedeemResult } from '../services/mock/redeemCodeMockService'
import { redeemCodeMockService } from '../services/mock/redeemCodeMockService'

export function useRedeemCode(userId: string | undefined) {
  const [availableCodes, setAvailableCodes] = useState<RedeemCodeDefinition[]>([])
  const [redeemHistory, setRedeemHistory] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const codes = redeemCodeMockService.getAvailableCodes()
    setAvailableCodes(codes)
  }, [])

  useEffect(() => {
    if (!userId) {
      setRedeemHistory([])
      return
    }

    const history = redeemCodeMockService.getRedeemHistory(userId)
    setRedeemHistory(history)
  }, [userId])

  const redeem = async (code: string): Promise<RedeemResult> => {
    if (!userId) {
      return {
        success: false,
        message: '请先登录',
      }
    }

    setIsProcessing(true)

    try {
      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 300))

      const result = redeemCodeMockService.redeem(userId, code)

      if (result.success) {
        const history = redeemCodeMockService.getRedeemHistory(userId)
        setRedeemHistory(history)
      }

      return result
    } finally {
      setIsProcessing(false)
    }
  }

  const getHistory = () => {
    return redeemHistory
  }

  const isCodeUsed = (code: string) => {
    if (!userId) return false
    return redeemCodeMockService.isCodeUsed(userId, code)
  }

  return {
    availableCodes,
    redeemHistory,
    isProcessing,
    redeem,
    getHistory,
    isCodeUsed,
  }
}
