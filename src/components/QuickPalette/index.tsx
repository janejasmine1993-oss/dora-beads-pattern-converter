import { useState } from 'react'
import type { PaletteColor } from '../../types/palette'
import { getBrightness } from '../../lib/utils/color'

interface QuickPaletteProps {
  colors: PaletteColor[]
  activeColor: PaletteColor | null
  highlightColorCode: string | null
  onSelectColor: (color: PaletteColor) => void
  onHighlightColor: (code: string | null) => void
  /** Replace fromCode with toColor globally */
  onReplaceColor: (fromCode: string, toColor: PaletteColor) => void
  /** Delete all cells with code */
  onDeleteColor: (code: string) => void
  /** Color codes that actually appear in the current pattern */
  usedCodes: Set<string>
}

export function QuickPalette({
  colors, activeColor, highlightColorCode,
  onSelectColor, onHighlightColor,
  onReplaceColor, onDeleteColor,
  usedCodes,
}: QuickPaletteProps) {
  const [showAll, setShowAll] = useState(false)
  const [replaceFrom, setReplaceFrom] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Filter: show used colors first, optionally show all
  const filtered = colors.filter(c =>
    search ? c.code.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
            : showAll || usedCodes.has(c.code)
  )

  function handleSwatchClick(color: PaletteColor) {
    if (replaceFrom) {
      if (replaceFrom !== color.code) {
        onReplaceColor(replaceFrom, color)
      }
      setReplaceFrom(null)
      return
    }
    onSelectColor(color)
  }

  function handleHighlight(code: string) {
    onHighlightColor(highlightColorCode === code ? null : code)
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">色板</p>
        <button
          onClick={() => setShowAll(v => !v)}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          {showAll ? '仅显示用色' : `全部 (${colors.length})`}
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索色号…"
        className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-2 focus:outline-none focus:border-blue-400"
      />

      {replaceFrom && (
        <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 mb-2 text-xs text-yellow-800">
          选择目标颜色替换 <strong>{replaceFrom}</strong>
          <button onClick={() => setReplaceFrom(null)} className="ml-2 text-yellow-600">取消</button>
        </div>
      )}

      <div className="grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
        {filtered.map(color => {
          const isActive = activeColor?.code === color.code
          const isHighlight = highlightColorCode === color.code
          const isUsed = usedCodes.has(color.code)
          const brightness = getBrightness(color.rgb[0], color.rgb[1], color.rgb[2])
          const textColor = brightness > 155 ? '#000' : '#fff'

          return (
            <div key={color.code} className="relative group">
              <button
                onClick={() => handleSwatchClick(color)}
                title={`${color.code}${color.name !== color.code ? ' ' + color.name : ''}`}
                className={`w-full aspect-square rounded-sm border transition-all ${
                  isActive ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 z-10' :
                  isHighlight ? 'ring-2 ring-yellow-400 ring-offset-1' :
                  isUsed ? 'border-gray-300' : 'border-gray-200 opacity-50'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                <span style={{ fontSize: 5, color: textColor, lineHeight: 1 }}>
                  {color.code.slice(0, 3)}
                </span>
              </button>

              {/* Context menu on right-click / long-press - use tooltip approach */}
              <div className="absolute left-0 top-full z-20 hidden group-hover:flex flex-col bg-white border border-gray-200 rounded shadow-lg text-xs w-20 mt-0.5">
                <button
                  onClick={() => handleHighlight(color.code)}
                  className="px-2 py-1 hover:bg-gray-50 text-left text-gray-700"
                >
                  {isHighlight ? '取消高亮' : '高亮'}
                </button>
                {isUsed && (
                  <>
                    <button
                      onClick={() => setReplaceFrom(color.code)}
                      className="px-2 py-1 hover:bg-gray-50 text-left text-gray-700"
                    >替换颜色</button>
                    <button
                      onClick={() => onDeleteColor(color.code)}
                      className="px-2 py-1 hover:bg-red-50 text-left text-red-600"
                    >删除此色</button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">无匹配颜色</p>
      )}

      {!showAll && usedCodes.size === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">生成图纸后显示用色</p>
      )}
    </div>
  )
}
