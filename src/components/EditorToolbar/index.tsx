import type { EditorTool } from '../../lib/editor/types'
import { TOOL_LABELS } from '../../lib/editor/types'
import type { PaletteColor } from '../../types/palette'

interface EditorToolbarProps {
  activeTool: EditorTool
  onToolChange: (t: EditorTool) => void
  activeColor: PaletteColor | null
  fillThreshold: number
  onFillThresholdChange: (v: number) => void
  zoom: number
  onZoomChange: (v: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  highlightColorCode: string | null
  onClearHighlight: () => void
  onClearSelection: () => void
  hasSelection: boolean
  onInvertSelection: () => void
}

const TOOLS: EditorTool[] = ['select', 'eyedropper', 'brush', 'eraser', 'fill', 'fill-erase']

const TOOL_ICONS: Record<EditorTool, string> = {
  select: '⬚',
  eyedropper: '🔬',
  brush: '✏️',
  eraser: '⬜',
  fill: '🪣',
  'fill-erase': '🗑️',
}

const ZOOM_LEVELS = [1, 1.5, 2, 3, 4]

export function EditorToolbar({
  activeTool, onToolChange,
  activeColor,
  fillThreshold, onFillThresholdChange,
  zoom, onZoomChange,
  canUndo, canRedo, onUndo, onRedo,
  highlightColorCode, onClearHighlight,
  hasSelection, onClearSelection, onInvertSelection,
}: EditorToolbarProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">编辑工具</p>

      {/* Tool grid */}
      <div className="grid grid-cols-3 gap-1">
        {TOOLS.map(tool => (
          <button
            key={tool}
            onClick={() => onToolChange(tool)}
            title={TOOL_LABELS[tool]}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded border text-xs transition-colors ${
              activeTool === tool
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            <span className="text-base leading-none">{TOOL_ICONS[tool]}</span>
            <span className="text-[10px] leading-tight">{TOOL_LABELS[tool]}</span>
          </button>
        ))}
      </div>

      {/* Active color indicator */}
      <div className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1.5">
        <span className="text-xs text-gray-500 shrink-0">当前颜色</span>
        {activeColor ? (
          <>
            <div
              className="w-5 h-5 rounded border border-gray-200 shrink-0"
              style={{ backgroundColor: activeColor.hex }}
            />
            <span className="text-xs font-mono text-gray-700 truncate">{activeColor.code}</span>
          </>
        ) : (
          <span className="text-xs text-gray-400">未选择</span>
        )}
      </div>

      {/* Fill threshold (only for fill tools) */}
      {(activeTool === 'fill' || activeTool === 'fill-erase') && (
        <div>
          <p className="text-xs text-gray-500 mb-1">
            填充模式
            <span className="ml-1 text-gray-700 font-medium">
              {fillThreshold === 0 ? '精确同色' : `扩展 ${fillThreshold} 步`}
            </span>
          </p>
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={fillThreshold}
            onChange={e => onFillThresholdChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>精确</span><span>扩展</span>
          </div>
        </div>
      )}

      {/* Highlighted color */}
      {highlightColorCode && (
        <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
          <span className="text-xs text-yellow-800">高亮: {highlightColorCode}</span>
          <button onClick={onClearHighlight} className="text-yellow-600 hover:text-yellow-800 text-xs">✕ 清除</button>
        </div>
      )}

      {/* Selection */}
      {hasSelection && (
        <div className="space-y-1">
          <div className="flex gap-1">
            <button
              onClick={onInvertSelection}
              className="flex-1 py-1 text-xs border border-gray-300 rounded hover:border-blue-400 hover:text-blue-600"
            >反选</button>
            <button
              onClick={onClearSelection}
              className="flex-1 py-1 text-xs border border-gray-300 rounded hover:border-red-400 hover:text-red-600"
            >取消选区</button>
          </div>
        </div>
      )}

      {/* Undo / Redo */}
      <div className="flex gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
            canUndo
              ? 'border-gray-300 hover:border-blue-400 text-gray-700'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
        >↩ 撤销</button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
            canRedo
              ? 'border-gray-300 hover:border-blue-400 text-gray-700'
              : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
        >↪ 重做</button>
      </div>

      {/* Zoom */}
      <div>
        <p className="text-xs text-gray-500 mb-1">缩放</p>
        <div className="flex gap-0.5">
          {ZOOM_LEVELS.map(z => (
            <button
              key={z}
              onClick={() => onZoomChange(z)}
              className={`flex-1 py-1 text-[11px] rounded border transition-colors ${
                zoom === z
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'border-gray-300 text-gray-600 hover:border-blue-400'
              }`}
            >
              {z === 1 ? '1×' : `${z}×`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
