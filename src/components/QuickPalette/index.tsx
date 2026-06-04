import { useState } from 'react'
import type { PaletteColor } from '../../types/palette'
import { getBrightness } from '../../lib/utils/color'

interface QuickPaletteProps {
  colors: PaletteColor[]                   // full brand palette
  activeColor: PaletteColor | null         // current brush / paint color
  pickedSourceColor: PaletteColor | null   // waiting for replacement target
  highlightColorCode: string | null
  onSelectColor: (color: PaletteColor) => void
  onRequestReplace: (toColor: PaletteColor) => void
  onClearPickedSource: () => void
  usedCodes: Set<string>
}

export function QuickPalette({
  colors, activeColor, pickedSourceColor, highlightColorCode,
  onSelectColor,
  onRequestReplace, onClearPickedSource,
  usedCodes,
}: QuickPaletteProps) {
  // Default: show ALL brand colors so users can freely pick any color
  const [showAll, setShowAll] = useState(true)
  const [search, setSearch] = useState('')

  // Filter logic:
  // - When searching: show ALL brand colors that match the query (ignore usedCodes)
  // - When not searching: respect showAll toggle
  const q = search.trim().toLowerCase()
  const filtered = colors.filter(c => {
    if (q) {
      return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    }
    return showAll || usedCodes.has(c.code)
  })

  // Colors used in current pattern (for summary row)
  const usedColors = colors.filter(c => usedCodes.has(c.code))

  function handleSwatchClick(color: PaletteColor) {
    if (pickedSourceColor && color.code !== pickedSourceColor.code) {
      onRequestReplace(color)
      return
    }
    if (pickedSourceColor && color.code === pickedSourceColor.code) {
      onClearPickedSource()
    }
    onSelectColor(color)
  }

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">颜色选择</p>
        <button
          onClick={() => setShowAll(v => !v)}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          {showAll ? `全色卡 (${colors.length})` : `已用 (${usedCodes.size})`}
        </button>
      </div>

      {/* Replace mode banner */}
      {pickedSourceColor && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mb-2">
          <div
            className="w-5 h-5 rounded border border-amber-300 shrink-0"
            style={{ backgroundColor: pickedSourceColor.hex }}
          />
          <span className="text-xs text-amber-800 flex-1 min-w-0">
            <strong>{pickedSourceColor.code}</strong> → 点击目标颜色替换
          </span>
          <button onClick={onClearPickedSource} className="text-amber-600 text-xs shrink-0">✕</button>
        </div>
      )}

      {/* 图纸用色 summary row — always visible when pattern exists */}
      {usedColors.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] text-gray-400 mb-1">图纸用色（{usedColors.length} 种）</p>
          <div className="flex flex-wrap gap-0.5">
            {usedColors.map(c => {
              const isActive = activeColor?.code === c.code
              const isSource = pickedSourceColor?.code === c.code
              const isHighlight = highlightColorCode === c.code
              const br = getBrightness(c.rgb[0], c.rgb[1], c.rgb[2])
              return (
                <button
                  key={c.code}
                  onClick={() => handleSwatchClick(c)}
                  title={`${c.code}${c.name !== c.code ? ' ' + c.name : ''}`}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                    isSource
                      ? 'ring-1 ring-amber-400 border-amber-300'
                      : isActive
                      ? 'ring-1 ring-blue-500 border-blue-400'
                      : isHighlight
                      ? 'ring-1 ring-yellow-400 border-yellow-300'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  style={{ backgroundColor: c.hex, color: br > 155 ? '#111' : '#fff' }}
                >
                  {c.code}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="输入色号或色名搜索…"
        className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-2 focus:outline-none focus:border-blue-400"
      />
      {q && (
        <p className="text-[10px] text-gray-400 mb-1">
          搜索"<span className="text-gray-600 font-medium">{q}</span>" — {filtered.length} 个结果（全色卡）
        </p>
      )}

      {/* Full palette grid */}
      <div className="grid grid-cols-8 gap-0.5 max-h-52 overflow-y-auto">
        {filtered.map(color => {
          const isActive = activeColor?.code === color.code
          const isSource = pickedSourceColor?.code === color.code
          const isHighlight = highlightColorCode === color.code
          const isUsed = usedCodes.has(color.code)
          const br = getBrightness(color.rgb[0], color.rgb[1], color.rgb[2])

          return (
            <button
              key={color.code}
              onClick={() => handleSwatchClick(color)}
              title={`${color.code}${color.name !== color.code ? ' ' + color.name : ''}`
              }
              className={`w-full aspect-square rounded-sm border transition-all ${
                isSource
                  ? 'ring-2 ring-amber-400 ring-offset-1 scale-110 z-10'
                  : isActive
                  ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 z-10'
                  : isHighlight
                  ? 'ring-1 ring-yellow-400 ring-offset-0.5'
                  : isUsed
                  ? 'border-gray-300'
                  : 'border-gray-100 opacity-60'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              <span
                style={{
                  fontSize: 4.5,
                  color: br > 155 ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)',
                  lineHeight: 1,
                  display: 'block',
                }}
              >
                {color.code.slice(0, 3)}
              </span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-3">
          {q ? `未找到包含"${q}"的颜色` : '暂无颜色'}
        </p>
      )}
    </div>
  )
}
