import { useState } from 'react'
import { PRESET_SIZES } from '../../types/pattern'
import { calcPhysicalSize } from '../../lib/utils/size'

interface SettingsPanelProps {
  width: number
  height: number
  onSizeChange: (w: number, h: number) => void
  onGenerate: () => void
  isGenerating: boolean
  canGenerate: boolean
}

export function SettingsPanel({
  width,
  height,
  onSizeChange,
  onGenerate,
  isGenerating,
  canGenerate,
}: SettingsPanelProps) {
  const [customW, setCustomW] = useState(String(width))
  const [customH, setCustomH] = useState(String(height))

  function selectPreset(w: number, h: number) {
    setCustomW(String(w))
    setCustomH(String(h))
    onSizeChange(w, h)
  }

  function applyCustom() {
    const w = Math.max(1, Math.min(500, parseInt(customW) || 52))
    const h = Math.max(1, Math.min(500, parseInt(customH) || 52))
    setCustomW(String(w))
    setCustomH(String(h))
    onSizeChange(w, h)
  }

  const physW = calcPhysicalSize(width).toFixed(1)
  const physH = calcPhysicalSize(height).toFixed(1)

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">图纸尺寸</p>
      <div className="grid grid-cols-3 gap-1 mb-3">
        {PRESET_SIZES.map((s) => (
          <button
            key={`${s.width}x${s.height}`}
            onClick={() => selectPreset(s.width, s.height)}
            className={`text-xs py-1.5 rounded border transition-colors ${
              width === s.width && height === s.height
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {s.width}×{s.height}
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">自定义尺寸</p>
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">宽（格）</label>
          <input
            type="number"
            min={1}
            max={500}
            value={customW}
            onChange={(e) => setCustomW(e.target.value)}
            onBlur={applyCustom}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">高（格）</label>
          <input
            type="number"
            min={1}
            max={500}
            value={customH}
            onChange={(e) => setCustomH(e.target.value)}
            onBlur={applyCustom}
            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 mb-4">
        <p className="font-medium text-gray-700 mb-1">成品尺寸（每格 2.6mm）</p>
        <p>
          {width} × {height} 格 ={' '}
          <span className="font-semibold text-blue-600">{physW} × {physH} cm</span>
        </p>
        {(width > 200 || height > 200) && (
          <p className="text-yellow-600 mt-1">尺寸较大，生成可能需要几秒</p>
        )}
      </div>

      <button
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          !canGenerate
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isGenerating
            ? 'bg-blue-300 text-white cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isGenerating ? '生成中…' : canGenerate ? '生成图纸' : '请先上传图片'}
      </button>
    </div>
  )
}
