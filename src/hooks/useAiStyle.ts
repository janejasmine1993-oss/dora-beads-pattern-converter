import { useState, useEffect } from 'react'
import type { AiStyleRequest, AiStyleResult, AiStylePresetConfig } from '../types/aiStyle'
import { aiStyleMockService } from '../services/mock/aiStyleMockService'

export function useAiStyle(userId: string | undefined) {
  const [presets, setPresets] = useState<AiStylePresetConfig[]>([])
  const [history, setHistory] = useState<AiStyleResult[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const allPresets = aiStyleMockService.getAllPresets()
    setPresets(allPresets)
  }, [])

  useEffect(() => {
    if (!userId) {
      setHistory([])
      return
    }

    const h = aiStyleMockService.getHistory(userId)
    setHistory(h)
  }, [userId])

  const processStyle = async (request: AiStyleRequest) => {
    if (!userId) {
      setError('请先登录')
      return null
    }

    setIsProcessing(true)
    setError(null)

    try {
      const result = await aiStyleMockService.mockStyleTransfer(userId, request)
      setHistory([result, ...history])
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : '处理失败'
      setError(message)
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  const getPreset = (presetId: string) => {
    return aiStyleMockService.getPreset(presetId as any)
  }

  const getFreePresets = () => {
    return aiStyleMockService.getFreePresets()
  }

  const getMemberPresets = () => {
    return aiStyleMockService.getMemberPresets()
  }

  return {
    presets,
    history,
    isProcessing,
    error,
    processStyle,
    getPreset,
    getFreePresets,
    getMemberPresets,
  }
}
