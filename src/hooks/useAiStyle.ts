import { useState, useEffect } from 'react'
import type { AiStyleResult, AiStylePresetConfig, AiStyleSourceImage, AiPreset } from '../types/aiStyle'
import { aiStyleMockService } from '../services/mock/aiStyleMockService'
import { getAiProvider } from '../services/ai/aiProviderFactory'

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

  const processStyle = async (presetId: string, sourceImage: AiStyleSourceImage): Promise<void> => {
    if (!userId) {
      setError('请先登录')
      return
    }

    if (!sourceImage) {
      setError('请先上传图片')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const provider = getAiProvider()
      const result = await provider.call({
        userId,
        presetId: presetId as AiPreset,
        sourceImage,
        strength: 0.8,
        keepOriginalColors: true,
        targetUseCase: 'bead-pattern',
      })

      if (result.status === 'success') {
        const mockResult: AiStyleResult = {
          id: result.id,
          status: 'success',
          presetId: result.presetId,
          sourceImage,
          message: result.message,
          creditCost: result.creditCost,
          createdAt: result.createdAt,
        }
        setHistory([mockResult, ...history])
      } else {
        setError(result.message || result.errorMessage || '处理失败')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '处理失败'
      setError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const getPreset = (presetId: string) => {
    return aiStyleMockService.getPreset(presetId as any)
  }

  const getProcessPresets = () => {
    return aiStyleMockService.getProcessPresets()
  }

  const getStylePresets = () => {
    return aiStyleMockService.getStylePresets()
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
    getProcessPresets,
    getStylePresets,
    getFreePresets,
    getMemberPresets,
  }
}
