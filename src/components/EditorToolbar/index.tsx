import type { EditorTool } from '../../lib/editor/types'
import { TOOL_LABELS } from '../../lib/editor/types'
import type { PaletteColor } from '../../types/palette'

interface EditorToolbarProps {
  activeTool: EditorTool
  onToolChange: (t: EditorTool) => void
  activeColor: PaletteColor | null
  highlightColorCode: string | null
  fillThreshold: number
  onFillThresholdChange: (v: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onClearSelection: () => void
  hasSelection: boolean
  onInvertSelection: () => void
  // Color quick-actions (applied to activeColor)
  onHighlightActiveColor: () => void
  onStartReplaceActiveColor: () => void
  onDeleteActiveColor: () => void
  // Display options
  showCellCodes: boolean
  onToggleCellCodes: () => void
}

const TOOLS: EditorTool[] = ['select', 'eyedropper', 'brush', 'eraser', 'fill', 'fill-erase']

const TOOL_ICONS: Record<EditorTool, string> = {
  select: '⬚',
  eyedropper: '💉',
  brush: '✏️',
  eraser: '⬜',
  fill: '🪣',
  'fill-erase': '🗑️',
}

export function EditorToolbar({
  activeTool, onToolChange,
  activeColor, highlightColorCode,
  fillThreshold, onFillThresholdChange,
  canUndo, canRedo, onUndo, onRedo,
  hasSelection, onClearSelection, onInvertSelection,
  onHighlightActiveColor, onStartReplaceActiveColor, onDeleteActiveColor,
  showCellCodes, onToggleCellCodes,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 overflow-x-auto">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide shrink-0">编辑工具</p>

      {/* Tool buttons (horizontal) */}
      <div className="flex gap-1">
        {TOOLS.map(tool => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            title={TOOL_LABELS[tool]}
            className={`flex items-center gap-1 py-1 px-2 rounded border text-xs transition-colors shrink-0 ${
              activeTool === tool
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            <span className="text-sm leading-none">{TOOL_ICONS[tool]}</span>
            <span className="hidden sm:inline text-[10px]">{TOOL_LABELS[tool]}</span>
          </button>
        ))}
      </div>

      {/* Current color display */}
      {activeColor && (
        <div className="flex items-center gap-2 px-2 border-l border-gray-300">
          <span className="text-xs text-gray-500 shrink-0">当前色</span>
          <div
            className="w-5 h-5 rounded border border-gray-300 shrink-0"
            style={{ backgroundColor: activeColor.hex }}
            title={activeColor.name}
          />
          <span className="text-xs font-mono text-gray-600 shrink-0">{activeColor.code}</span>
        </div>
      )}

      {/* Color tools - enabled when in edit mode, even without active color selected */}
      <div className="flex gap-1 px-2 border-l border-gray-300">
        <button
          onClick={onHighlightActiveColor}
          disabled={false}
          title={activeColor ? `高亮全图该颜色 (${activeColor.code})` : '吸取或选择一个颜色后可高亮'}
          className={`py-1 px-2 text-[10px] rounded border transition-colors shrink-0 ${
            activeColor && highlightColorCode === activeColor.code
              ? 'bg-yellow-400 text-yellow-900 border-yellow-400'
              : activeColor
              ? 'border-gray-300 text-gray-600 hover:border-yellow-400'
              : 'border-gray-300 text-gray-400'
          }`}
        >
          {activeColor && highlightColorCode === activeColor.code ? '✦ 高亮中' : '◈ 高亮'}
        </button>
        <button
          onClick={onStartReplaceActiveColor}
          disabled={false}
          title={activeColor ? `替换 ${activeColor.code}` : '吸取或选择一个颜色后可替换'}
          className={`py-1 px-2 text-[10px] rounded border transition-colors shrink-0 ${
            activeColor
              ? 'border-gray-300 text-gray-600 hover:border-amber-400'
              : 'border-gray-300 text-gray-400'
          }`}
        >
          ⇄ 替换
        </button>
        <button
          onClick={onDeleteActiveColor}
          disabled={false}
          title={activeColor ? `删除 ${activeColor.code}` : '吸取或选择一个颜色后可删除'}
          className={`py-1 px-2 text-[10px] rounded border transition-colors shrink-0 ${
            activeColor
              ? 'border-gray-300 text-gray-600 hover:border-red-400'
              : 'border-gray-300 text-gray-400'
          }`}
        >
          ✕ 删除
        </button>
      </div>

      {/* Undo / Redo */}
      <div className="flex gap-1 px-2 border-l border-gray-300">
        <button onClick={onUndo} disabled={!canUndo}
          className={`py-1 px-2 text-xs rounded border transition-colors shrink-0 ${
            canUndo ? 'border-gray-300 hover:border-blue-400 text-gray-700' : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
          title="Ctrl+Z"
        >↩</button>
        <button onClick={onRedo} disabled={!canRedo}
          className={`py-1 px-2 text-xs rounded border transition-colors shrink-0 ${
            canRedo ? 'border-gray-300 hover:border-blue-400 text-gray-700' : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
          title="Ctrl+Y"
        >↪</button>
      </div>

      {/* Selection actions */}
      {hasSelection && (
        <div className="flex gap-1 px-2 border-l border-gray-300">
          <button
            onClick={onInvertSelection}
            className="py-1 px-2 text-xs border border-gray-300 rounded hover:border-blue-400 text-gray-600 shrink-0"
          >反选</button>
          <button
            onClick={onClearSelection}
            className="py-1 px-2 text-xs border border-gray-300 rounded hover:border-red-400 text-gray-600 shrink-0"
          >清除</button>
        </div>
      )}

      {/* Fill threshold (compact) */}
      {(activeTool === 'fill' || activeTool === 'fill-erase') && (
        <div className="flex items-center gap-2 px-2 border-l border-gray-300">
          <span className="text-xs text-gray-500 shrink-0">填充</span>
          <input
            type="range" min={0} max={3} step={1} value={fillThreshold}
            onChange={e => onFillThresholdChange(Number(e.target.value))}
            className="w-20"
            title={fillThreshold === 0 ? '精确同色' : `扩展 ${fillThreshold} 步`}
          />
          <span className="text-xs text-gray-500 shrink-0 w-12">{fillThreshold === 0 ? '精确' : `+${fillThreshold}`}</span>
        </div>
      )}

      {/* Cell codes toggle */}
      <button
        onClick={onToggleCellCodes}
        className={`ml-auto py-1 px-2 text-xs rounded border transition-colors shrink-0 ${
          showCellCodes
            ? 'bg-blue-50 border-blue-400 text-blue-700'
            : 'border-gray-300 text-gray-500 hover:border-blue-400'
        }`}
        title={showCellCodes ? '隐藏色号' : '显示色号'}
      >
        {showCellCodes ? '色号:ON' : '色号:OFF'}
      </button>
    </div>
  )
}
