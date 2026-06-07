import { useState } from 'react'
import { aiRuntimeConfig } from '../../services/ai/aiRuntimeConfig'

interface BackgroundRemovalPanelProps {
  onApply: (processedUrl: string) => void
  isLoading?: boolean
}

const IMAGE_PROCESSING_PRESETS = [
  { id: 'enhance-clarity', label: '提高清晰度', description: '让模糊图片更清楚，适合照片、截图、低清图片。', icon: '🔍', category: 'processing' },
  { id: 'clean-background', label: '背景简化', description: '弱化杂乱背景，让主体更突出。注意：不是透明抠图。', icon: '🎯', category: 'processing' },
  { id: 'color-optimize', label: '颜色优化', description: '让颜色更干净明亮，减少灰蒙感。', icon: '🎨', category: 'processing' },
  { id: 'reduce-noise', label: '减少杂色', description: '减少噪点、碎色和复杂纹理，更适合转拼豆图纸。', icon: '✨', category: 'processing' },
]

const STYLE_TRANSFER_PRESETS = [
  { id: 'bead-pattern', label: '拼豆图纸优化', description: '减少颜色数量、简化色块、强化边缘，适合后续生成拼豆图纸。', icon: '🎯', category: 'style' },
  { id: 'pixel-clean', label: '干净像素风', description: '把图片变成边缘清晰、色块明确的像素风。', icon: '⬜', category: 'style' },
  { id: 'cute-cartoon', label: 'Q版卡通', description: '适合人物、动物、头像类图片，转成可爱卡通风。', icon: '🎭', category: 'style' },
  { id: 'illustration', label: '插画风格', description: '适合照片转插画参考图。', icon: '🖼️', category: 'style' },
  { id: 'watercolor', label: '水彩风', description: '适合柔和、手绘感的图像风格。', icon: '🌊', category: 'style' },
  { id: 'anime-soft', label: '柔和动漫风', description: '适合头像、人物和二次元风格参考。', icon: '✨', category: 'style' },
]

export function BackgroundRemovalPanel({ onApply, isLoading }: BackgroundRemovalPanelProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('bead-pattern')
  const [processing, setProcessing] = useState(false)

  async function handleOptimizeImage() {
    setProcessing(true)
    try {
      if (aiRuntimeConfig.mode === 'real') {
        // 在真实模式下，应该调用后端 API
        console.log('[BackgroundRemovalPanel] Optimize with preset:', selectedPreset)
        // TODO: 调用真实 AI API
      } else {
        // Mock 模式下直接返回
        console.log('[BackgroundRemovalPanel] Mock optimize with preset:', selectedPreset)
      }
      onApply('processed')
    } catch (err) {
      console.error('Image optimization failed:', err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">AI 图片优化</h3>
        {aiRuntimeConfig.mode === 'mock' ? (
          <p className="text-[10px] text-orange-600">💡 当前模式：Mock 模拟，不会真实调用 AI</p>
        ) : (
          <p className="text-[10px] text-green-600">✅ 当前模式：Real 真实 AI，服务商：腾讯混元</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-600 font-medium">图片处理优化：</p>
        {IMAGE_PROCESSING_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => setSelectedPreset(preset.id)}
            disabled={processing}
            className={`w-full text-left p-2 rounded border text-xs transition-colors ${
              selectedPreset === preset.id
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5">{preset.icon}</span>
              <div>
                <div className="font-medium">{preset.label}</div>
                <div className="text-[10px] text-gray-500">{preset.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-600 font-medium">风格转换优化：</p>
        {STYLE_TRANSFER_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => setSelectedPreset(preset.id)}
            disabled={processing}
            className={`w-full text-left p-2 rounded border text-xs transition-colors ${
              selectedPreset === preset.id
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5">{preset.icon}</span>
              <div>
                <div className="font-medium">{preset.label}</div>
                <div className="text-[10px] text-gray-500">{preset.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleOptimizeImage}
        disabled={processing || isLoading}
        className="w-full py-2 px-3 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? '优化中...' : '开始 AI 图片优化'}
      </button>

      <p className="text-[10px] text-gray-400 text-center">
        💡 AI 优化的目标是让图片更适合转成拼豆图纸，而不是单纯生成好看的图片
      </p>
    </div>
  )
}
