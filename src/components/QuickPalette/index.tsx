import { useState } from 'react'
import type { PaletteColor } from '../../types/palette'
import { getBrightness } from '../../lib/utils/color'

interface QuickPaletteProps {
  colors: PaletteColor[]
  activeColor: PaletteColor | null         // current brush / paint color
  pickedSourceColor: PaletteColor | null   // eyedropper source (waiting for replacement target)
  highlightColorCode: string | null
  onSelectColor: (color: PaletteColor) => void
  onHighlightColor: (code: string | null) => void
  onRequestReplace: (toColor: PaletteColor) => void   // triggered when pickedSourceColor is set
  onClearPickedSource: () => void
  onSetPickedSource: (color: PaletteColor) => void    // from hover-menu "替换颜色"
  onDeleteColor: (code: string) => void
  usedCodes: Set<string>
}

export function QuickPalette({
  colors, activeColor, pickedSourceColor, highlightColorCode,
  onSelectColor, onHighlightColor,
  onRequestReplace, onClearPickedSource, onSetPickedSource,
  onDeleteColor,
  usedCodes,
}: QuickPaletteProps) {
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = colors.filter(c => {
    const q = search.toLowerCase()
    const matches = !q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    const visible = showAll || usedCodes.has(c.code)
    return matches && visible
  })

  function handleSwatchClick(color: PaletteColor) {
    // Replace mode: clicking any color triggers replace confirm
    if (pickedSourceColor) {
      if (color.code === pickedSourceColor.code) {
        // Clicked the same color — just deselect replace mode
        onClearPickedSource()
        onSelectColor(color)
      } else {
        onRequestReplace(color)
      }
      return
    }
    // Normal: set as active brush color
    onSelectColor(color)
  }

  function handleHighlight(code: string) {
    onHighlightColor(highlightColorCode === code ? null : code)
  }

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">色板</p>
        <button
          onClick={() => setShowAll(v => !v)}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          {showAll ? `已用色 (${usedCodes.size})` : `全部 (${colors.length})`}
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
            替换 <strong>{pickedSourceColor.code}</strong>：点击目标颜色
          </span>
          <button
            onClick={onClearPickedSource}
            className="text-amber-600 hover:text-amber-800 text-xs shrink-0"
          >✕</button>
        </div>
      )}

      {/* Current color indicator */}
      {activeColor && !pickedSourceColor && (
        <div className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1 mb-2">
          <div
            className="w-4 h-4 rounded border border-gray-200 shrink-0"
            style={{ backgroundColor: activeColor.hex }}
          />
          <span className="text-xs text-gray-600 truncate font-mono">{activeColor.code}</span>
          {activeColor.name !== activeColor.code && (
            <span className="text-xs text-gray-400 truncate">{activeColor.name}</span>
          )}
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索色号或色名…"
        className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-2 focus:outline-none focus:border-blue-400"
      />

      {/* Swatches */}
      <div className="grid grid-cols-8 gap-0.5 max-h-52 overflow-y-auto">
        {filtered.map(color => {
          const isActive = activeColor?.code === color.code
          const isSource = pickedSourceColor?.code === color.code
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
                  isSource
                    ? 'ring-2 ring-amber-400 ring-offset-1 scale-110 z-10'
                    : isActive
                    ? 'ring-2 ring-blue-500 ring-offset-1 scale-110 z-10'
                    : isHighlight
                    ? 'ring-2 ring-yellow-400 ring-offset-1'
                    : isUsed
                    ? 'border-gray-300'
                    : 'border-gray-200 opacity-40'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                <span style={{ fontSize: 4.5, color: textColor, lineHeight: 1 }}>
                  {color.code.slice(0, 3)}
                </span>
              </button>

              {/* Hover context menu */}
              <div className="absolute left-0 top-full z-30 hidden group-hover:flex flex-col bg-white border border-gray-200 rounded shadow-lg text-xs w-24 mt-0.5">
                <button
                  onClick={() => handleHighlight(color.code)}
                  className="px-2 py-1 hover:bg-gray-50 text-left text-gray-700"
                >
                  {isHighlight ? '取消高亮' : '高亮'}
                </button>
                {isUsed && (
                  <>
                    <button
                      onClick={() => { onSetPickedSource(color); onSelectColor(color) }}
                      className="px-2 py-1 hover:bg-amber-50 text-left text-amber-700"
                    >替换颜色…</button>
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
        <p className="text-xs text-gray-400 text-center py-3">
          {search ? '无匹配颜色' : usedCodes.size === 0 ? '生成图纸后显示已用颜色' : '无匹配'}
        </p>
      )}
    </div>
  )
}
