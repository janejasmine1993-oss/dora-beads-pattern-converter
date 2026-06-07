import { useState } from 'react'
import { AiStyleImageUploader } from './AiStyleImageUploader'
import type { AiStylePresetConfig, AiStyleSourceImage } from '../../types/aiStyle'
import type { MembershipMock } from '../../services/mock/membershipMockService'
import { aiRuntimeConfig } from '../../services/ai/aiRuntimeConfig'

interface AiStylePanelProps {
  isLoggedIn: boolean
  membership: MembershipMock | null
  presets: AiStylePresetConfig[]
  isProcessing: boolean
  error: string | null
  onProcessStyle: (presetId: string, sourceImage: AiStyleSourceImage) => Promise<void>
  credits: { dailyRemaining: number; extraCredits: number } | null
  currentWorkspaceImage?: { url: string; name: string }
}

export function AiStylePanel({
  isLoggedIn,
  membership,
  presets,
  isProcessing,
  error,
  onProcessStyle,
  credits,
  currentWorkspaceImage,
}: AiStylePanelProps) {
  const [selectedImage, setSelectedImage] = useState<AiStyleSourceImage | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState('')
  const [lastResult, setLastResult] = useState<any>(null)

  const processPresets = presets.filter(p => p.category === 'process')
  const stylePresets = presets.filter(p => p.category === 'style')

  const handleUseWorkspaceImage = () => {
    if (!currentWorkspaceImage) return
    const image: AiStyleSourceImage = {
      id: `workspace_${Date.now()}`,
      name: currentWorkspaceImage.name,
      type: 'image/jpeg',
      size: 0,
      previewUrl: currentWorkspaceImage.url,
      createdAt: new Date().toISOString(),
    }
    setSelectedImage(image)
  }

  const handleProcess = async () => {
    if (!selectedPreset || !selectedImage) {
      setLastMessage('❌ 请先上传图片并选择优化方式')
      setTimeout(() => setLastMessage(''), 3000)
      return
    }

    try {
      await onProcessStyle(selectedPreset, selectedImage)
      const preset = presets.find(p => p.id === selectedPreset)
      setLastMessage(`✅ AI ${preset?.category === 'process' ? '处理' : '风格化'} mock 已完成`)
      setLastResult({
        presetId: selectedPreset,
        presetName: preset?.name,
        sourceImage: selectedImage,
        timestamp: new Date().toLocaleTimeString('zh-CN'),
      })
      setTimeout(() => setLastMessage(''), 5000)
    } catch (err) {
      setLastMessage('')
    }
  }

  const getPresetErrorMessage = (preset: AiStylePresetConfig): string | null => {
    if (!isLoggedIn) return '请先登录后再使用 AI 优化功能'
    if (preset.isMemberOnly && membership?.level === 'free') return '该功能为会员专属，请先升级会员'
    const totalCredits = (credits?.dailyRemaining || 0) + (credits?.extraCredits || 0)
    if (totalCredits < preset.creditCost) return '今日 AI 次数不足，可升级会员或使用兑换码'
    if (!selectedImage) return '请先上传图片'
    return null
  }


  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">人工智能优化</h3>

      <div className="text-xs text-gray-600 mb-3 pb-3 border-b border-gray-200 space-y-1">
        <p>
          <span className="font-semibold">运行模式：</span>
          {aiRuntimeConfig.mode === 'mock' ? '📦 Mock（模拟）' : '🚀 Real（真实）'}
        </p>
        <p>
          <span className="font-semibold">服务商：</span>
          {aiRuntimeConfig.provider === 'mock' ? 'Mock' : aiRuntimeConfig.provider}
        </p>
        {aiRuntimeConfig.mode === 'mock' && (
          <p className="text-gray-500">ℹ️ 当前为模拟模式，不会真实消耗 AI 配额</p>
        )}
      </div>

      {/* 图片上传器 */}
      <AiStyleImageUploader
        onImageSelected={setSelectedImage}
        selectedImage={selectedImage}
        onClear={() => setSelectedImage(null)}
        currentWorkspaceImage={currentWorkspaceImage}
        onUseWorkspaceImage={handleUseWorkspaceImage}
      />

      {/* 错误提示 */}
      {error && <p className="text-xs bg-red-50 text-red-700 border border-red-200 rounded p-2 mb-3">{error}</p>}

      {/* 消息提示 */}
      {lastMessage && (
        <p className={`text-xs p-2 rounded mb-3 ${lastMessage.startsWith('❌') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {lastMessage}
        </p>
      )}

      {/* 图片处理类 */}
      {processPresets.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">图片处理</h4>
          <div className="grid grid-cols-1 gap-2 mb-4">
            {processPresets.map(preset => {
              const errorMsg = getPresetErrorMessage(preset)
              const isSelected = selectedPreset === preset.id
              const totalCredits = (credits?.dailyRemaining || 0) + (credits?.extraCredits || 0)

              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (errorMsg) {
                      setLastMessage(`❌ ${errorMsg}`)
                      setTimeout(() => setLastMessage(''), 3000)
                    } else {
                      setSelectedPreset(preset.id)
                      setLastMessage('')
                    }
                  }}
                  className={`w-full text-left p-3 border rounded transition ${
                    isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  } cursor-pointer`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{preset.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
                      <p className="text-xs text-gray-500 mt-1">消耗：{preset.creditCost} 次</p>
                    </div>
                    <div className="text-right ml-2 flex items-center gap-1">
                      {preset.isMemberOnly && (
                        <span className="inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">会员</span>
                      )}
                      {totalCredits < preset.creditCost && (
                        <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-1 rounded">次数不足</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 风格转换类 */}
      {stylePresets.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">风格转换</h4>
          <div className="grid grid-cols-1 gap-2">
            {stylePresets.map(preset => {
              const errorMsg = getPresetErrorMessage(preset)
              const isSelected = selectedPreset === preset.id
              const totalCredits = (credits?.dailyRemaining || 0) + (credits?.extraCredits || 0)

              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    if (errorMsg) {
                      setLastMessage(`❌ ${errorMsg}`)
                      setTimeout(() => setLastMessage(''), 3000)
                    } else {
                      setSelectedPreset(preset.id)
                      setLastMessage('')
                    }
                  }}
                  className={`w-full text-left p-3 border rounded transition ${
                    isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                  } cursor-pointer`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{preset.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{preset.description}</p>
                      <p className="text-xs text-gray-500 mt-1">消耗：{preset.creditCost} 次</p>
                    </div>
                    <div className="text-right ml-2 flex items-center gap-1">
                      {preset.isMemberOnly && (
                        <span className="inline-block text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">会员</span>
                      )}
                      {totalCredits < preset.creditCost && (
                        <span className="inline-block text-xs bg-red-100 text-red-700 px-2 py-1 rounded">次数不足</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 生成按钮 */}
      <button
        onClick={handleProcess}
        disabled={isProcessing || !selectedImage}
        title={!selectedImage ? '请先上传图片' : ''}
        className={`w-full px-4 py-2 rounded text-sm font-medium transition ${
          isProcessing || !selectedImage
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-purple-500 text-white hover:bg-purple-600'
        }`}
      >
        {isProcessing ? '处理中...' : '模拟生成'}
      </button>

      {/* 结果预览区 */}
      {lastResult && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-xs font-semibold text-green-700 mb-2">✓ 生成结果</p>
          <div className="space-y-1 text-xs text-green-700">
            <p>
              <span className="font-semibold">优化方式：</span>
              {lastResult.presetName}
            </p>
            <p>
              <span className="font-semibold">原图文件：</span>
              {lastResult.sourceImage.name}
            </p>
            <p>
              <span className="font-semibold">生成时间：</span>
              {lastResult.timestamp}
            </p>
            <p className="mt-2 text-green-600">当前为 mock 模式，暂未接入真实 AI API</p>
          </div>
        </div>
      )}

      {!lastResult && selectedImage && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
          <p>上传图片并选择优化方式后，可以在这里查看 mock 结果</p>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
        💡 这是 mock 服务，实际处理需接入真实 AI API
      </p>
    </div>
  )
}
