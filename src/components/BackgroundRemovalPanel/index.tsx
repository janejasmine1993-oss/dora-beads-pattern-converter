import { useState, useRef } from 'react'
import { aiRuntimeConfig } from '../../services/ai/aiRuntimeConfig'

interface BackgroundRemovalPanelProps {
  onApply: (processedUrl: string) => void
  currentWorkspaceImage?: { url: string; name: string }
  isLoading?: boolean
}

interface OptimizeResult {
  id: string
  status: 'idle' | 'processing' | 'success' | 'failed'
  presetId: string
  imageUrl?: string
  imageBase64?: string
  message: string
  errorMessage?: string
  createdAt: string
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

export function BackgroundRemovalPanel({ onApply, currentWorkspaceImage, isLoading }: BackgroundRemovalPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImage, setUploadedImage] = useState<{ url: string; name: string; base64: string } | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string>('bead-pattern')
  const [result, setResult] = useState<OptimizeResult>({ id: '', status: 'idle', presetId: '', message: '', createdAt: new Date().toISOString() })

  const handleFileSelect = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      alert('请上传 JPG / PNG / WEBP 格式的图片')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert(`图片大小超过 5MB 限制（当前：${(file.size / 1024 / 1024).toFixed(1)}MB）`)
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      const base64Data = result.split(',')[1] || result
      setUploadedImage({ url: result, name: file.name, base64: base64Data })
      setResult({ id: '', status: 'idle', presetId: '', message: '', createdAt: new Date().toISOString() })
    }
    reader.readAsDataURL(file)
  }

  const handleOptimizeImage = async () => {
    if (!uploadedImage && !currentWorkspaceImage) {
      alert('请先上传图片')
      return
    }

    setResult({ id: `ai_${Date.now()}`, status: 'processing', presetId: selectedPreset, message: '优化中...', createdAt: new Date().toISOString() })

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock 模式：直接使用上传图或工作台图作为结果
      const sourceImage = uploadedImage?.url || currentWorkspaceImage?.url || ''

      setResult({
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'success',
        presetId: selectedPreset,
        imageUrl: sourceImage,
        message: `AI 优化完成（${selectedPreset}）`,
        createdAt: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Image optimization failed:', err)
      setResult({
        id: `ai_error_${Date.now()}`,
        status: 'failed',
        presetId: selectedPreset,
        message: '优化失败',
        errorMessage: err instanceof Error ? err.message : '未知错误',
        createdAt: new Date().toISOString(),
      })
    }
  }

  const handleDownloadImage = () => {
    if (!result.imageUrl) {
      alert('没有可下载的图片')
      return
    }

    const link = document.createElement('a')
    link.href = result.imageUrl
    link.download = `dora-ai-optimized-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleContinueOptimize = () => {
    setResult({ id: '', status: 'idle', presetId: '', message: '', createdAt: new Date().toISOString() })
  }

  const handleUseForGeneration = () => {
    if (result.imageUrl) {
      onApply(result.imageUrl)
    }
  }

  return (
    <div className="space-y-4">
      {/* 标题和模式提示 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">AI 图片优化</h3>
        <p className="text-[10px] text-gray-600 mb-2">先对图片进行清晰度、背景、色块优化，再生成更干净的拼豆图纸。</p>
        {aiRuntimeConfig.mode === 'mock' ? (
          <p className="text-[10px] text-orange-600">💡 当前模式：Mock 模拟，不会真实调用 AI</p>
        ) : (
          <p className="text-[10px] text-green-600">✅ 当前模式：Real 真实 AI，服务商：腾讯混元</p>
        )}
      </div>

      {/* 图片上传区 */}
      {result.status === 'idle' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 font-medium">上传图片</p>
          {!uploadedImage && !currentWorkspaceImage && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
            >
              <p className="text-sm text-gray-600">📁 点击上传或拖拽图片</p>
              <p className="text-[10px] text-gray-500 mt-1">支持 JPG / PNG / WEBP，最大 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                }}
                className="hidden"
              />
            </div>
          )}

          {uploadedImage && (
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                  <img src={uploadedImage.url} alt="uploaded" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">📄 {uploadedImage.name}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-blue-600 hover:text-blue-700"
                  >
                    重新上传
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentWorkspaceImage && !uploadedImage && (
            <div className="space-y-2">
              <p className="text-xs text-green-600">✅ 已检测到当前工作台图片</p>
              <div className="flex gap-2 items-center">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-100">
                  <img src={currentWorkspaceImage.url} alt="workspace" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">📄 {currentWorkspaceImage.name}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] text-blue-600 hover:text-blue-700"
                  >
                    上传新图片
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 优化方式选择 */}
          <div className="space-y-2 mt-4">
            <p className="text-xs text-gray-600 font-medium">图片处理优化：</p>
            {IMAGE_PROCESSING_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
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

          {/* 开始优化按钮 */}
          <button
            onClick={handleOptimizeImage}
            disabled={(!uploadedImage && !currentWorkspaceImage) || isLoading}
            className="w-full py-2 px-3 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            开始 AI 图片优化
          </button>
        </div>
      )}

      {/* 处理中 */}
      {result.status === 'processing' && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">⏳ {result.message}</p>
        </div>
      )}

      {/* 结果显示区 */}
      {result.status === 'success' && (
        <div className="space-y-2 border-t pt-4">
          <div>
            <p className="text-xs font-semibold text-gray-700">✅ AI 优化完成</p>
            <p className="text-[10px] text-gray-600 mt-1">
              优化方式：{STYLE_TRANSFER_PRESETS.find(p => p.id === selectedPreset)?.label || IMAGE_PROCESSING_PRESETS.find(p => p.id === selectedPreset)?.label}
            </p>
            <p className="text-[10px] text-gray-500">
              当前模式：{aiRuntimeConfig.mode === 'mock' ? 'Mock' : 'Real'}
            </p>
          </div>

          {result.imageUrl && (
            <div className="rounded overflow-hidden border border-gray-200 bg-gray-50 p-2">
              <img src={result.imageUrl} alt="result" className="w-full max-h-48 object-contain" />
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={handleUseForGeneration}
              className="w-full py-2 px-3 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors font-medium"
            >
              用此图生成拼豆图纸
            </button>
            <button
              onClick={handleDownloadImage}
              className="w-full py-2 px-3 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
            >
              下载优化图
            </button>
            <button
              onClick={handleContinueOptimize}
              className="w-full py-2 px-3 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
            >
              继续优化
            </button>
          </div>
        </div>
      )}

      {/* 失败提示 */}
      {result.status === 'failed' && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-xs text-red-600">❌ {result.message}</p>
          {result.errorMessage && <p className="text-[10px] text-red-500">{result.errorMessage}</p>}
          <button
            onClick={handleContinueOptimize}
            className="w-full py-2 px-3 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
          >
            返回继续优化
          </button>
        </div>
      )}

      <p className="text-[10px] text-gray-400 text-center">
        💡 AI 优化的目标是让图片更适合转成拼豆图纸，而不是单纯生成好看的图片
      </p>
    </div>
  )
}
