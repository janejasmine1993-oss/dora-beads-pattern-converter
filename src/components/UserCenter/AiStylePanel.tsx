import { useState } from 'react'
import type { AiStylePresetConfig } from '../../types/aiStyle'
import type { MembershipMock } from '../../services/mock/membershipMockService'

interface AiStylePanelProps {
  isLoggedIn: boolean
  membership: MembershipMock | null
  presets: AiStylePresetConfig[]
  isProcessing: boolean
  error: string | null
  onProcessStyle: (presetId: string) => Promise<void>
  credits: { dailyRemaining: number; extraCredits: number } | null
}

export function AiStylePanel({
  isLoggedIn,
  membership,
  presets,
  isProcessing,
  error,
  onProcessStyle,
  credits,
}: AiStylePanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState('')

  if (!isLoggedIn) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 opacity-50">
        <p className="text-gray-500 text-sm">请先登录使用 AI 风格化</p>
      </div>
    )
  }

  const canUsePreset = (preset: AiStylePresetConfig) => {
    if (!membership) return false
    if (!preset.isMemberOnly) return true
    return membership.level !== 'free'
  }

  const handleProcess = async () => {
    if (!selectedPreset) return

    try {
      await onProcessStyle(selectedPreset)
      setLastMessage('✅ AI 风格化 mock 已完成')
      setSelectedPreset(null)
      setTimeout(() => setLastMessage(''), 5000)
    } catch (err) {
      setLastMessage('')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">AI 风格化</h3>

      <p className="text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">
        ⚠️ 当前为 mock 模式，暂未接入真实 AI 生图 API
      </p>

      {error && (
        <p className="text-xs bg-red-50 text-red-700 border border-red-200 rounded p-2 mb-3">{error}</p>
      )}

      {lastMessage && (
        <p className="text-xs bg-green-50 text-green-700 border border-green-200 rounded p-2 mb-3">
          {lastMessage}
        </p>
      )}

      <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
        {presets.map(preset => {
          const canUse = canUsePreset(preset)
          const totalCredits = (credits?.dailyRemaining || 0) + (credits?.extraCredits || 0)
          const hasEnoughCredits = totalCredits >= preset.creditCost

          return (
            <button
              key={preset.id}
              onClick={() => canUse && setSelectedPreset(preset.id)}
              disabled={!canUse || !hasEnoughCredits || isProcessing}
              className={`w-full text-left p-3 border rounded transition ${
                selectedPreset === preset.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              } ${(!canUse || !hasEnoughCredits) && 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{preset.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    适用：{preset.suitableFor} • 消耗：{preset.creditCost} 次
                  </p>
                </div>
                <div className="text-right ml-2">
                  {preset.isMemberOnly && (
                    <span className="inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      会员
                    </span>
                  )}
                  {!hasEnoughCredits && <span className="text-xs text-red-600 block mt-1">次数不足</span>}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleProcess}
        disabled={!selectedPreset || isProcessing}
        className="w-full px-4 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:bg-gray-300 transition"
      >
        {isProcessing ? '处理中...' : '模拟生成'}
      </button>

      <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
        💡 这是 mock 服务，实际生图需接入真实 AI API
      </p>
    </div>
  )
}
