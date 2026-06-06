import { useState } from 'react'

interface BackgroundRemovalPanelProps {
  onApply: (processedUrl: string) => void
  isLoading?: boolean
}

const REMOVAL_OPTIONS = [
  { id: 'basic', label: '去背景主体版', icon: '✨', available: true },
  { id: 'flat', label: '扁平插画风', icon: '🎨', available: false },
  { id: 'chibi', label: 'Q版卡通风', icon: '🎭', available: false },
  { id: 'healing', label: '日系治愈插画风', icon: '🌸', available: false },
  { id: 'block', label: '色块油画风', icon: '🖼️', available: false },
]

export function BackgroundRemovalPanel({ onApply, isLoading }: BackgroundRemovalPanelProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>('basic')
  const [processing, setProcessing] = useState(false)

  async function handleRemoveBackground() {
    setProcessing(true)
    try {
      // Currently uses local BFS removal (no API call needed)
      // This will be replaced with actual AI API in v0.6+
      onApply('processed')
    } catch (err) {
      console.error('Background removal failed:', err)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">AI 优化处理</h3>

      <div className="space-y-2">
        <p className="text-xs text-gray-500">选择优化风格：</p>
        {REMOVAL_OPTIONS.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSelectedStyle(opt.id)}
            disabled={!opt.available || processing}
            className={`w-full text-left p-2 rounded border text-xs transition-colors ${
              !opt.available
                ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                : selectedStyle === opt.id
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:border-blue-300'
            }`}
          >
            <span className="mr-2">{opt.icon}</span>
            {opt.label}
            {!opt.available && <span className="ml-2 text-[10px] text-gray-400">即将支持</span>}
          </button>
        ))}
      </div>

      <button
        onClick={handleRemoveBackground}
        disabled={!REMOVAL_OPTIONS.find(o => o.id === selectedStyle)?.available || processing || isLoading}
        className="w-full py-2 px-3 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {processing ? '处理中...' : '应用优化'}
      </button>

      <p className="text-[10px] text-gray-400 text-center">
        AI 优化的目标是让图片更适合转成拼豆图纸，而不是单纯生成好看的图片
      </p>
    </div>
  )
}
