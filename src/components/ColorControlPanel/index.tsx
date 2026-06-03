interface ColorControlPanelProps {
  maxColors: number
  mergeThreshold: number
  onMaxColorsChange: (n: number) => void
  onMergeThresholdChange: (n: number) => void
}

const PRESETS = [15, 20, 25, 30] as const
const MERGE_OPTIONS = [
  { label: '关闭', value: 0 },
  { label: '≤3颗', value: 3 },
  { label: '≤5颗', value: 5 },
  { label: '≤10颗', value: 10 },
]

export function ColorControlPanel({
  maxColors,
  mergeThreshold,
  onMaxColorsChange,
  onMergeThresholdChange,
}: ColorControlPanelProps) {
  return (
    <div className="border-t border-gray-100 pt-4 mt-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">颜色设置</p>

      {/* Preset color count */}
      <div className="grid grid-cols-4 gap-1 mb-2">
        {PRESETS.map((n) => (
          <button
            key={n}
            onClick={() => onMaxColorsChange(n)}
            className={`text-xs py-1.5 rounded border transition-colors ${
              maxColors === n
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
            }`}
          >
            {n}色
          </button>
        ))}
      </div>

      {/* Custom color count */}
      <div className="flex items-center gap-2 mb-3">
        <label className="text-xs text-gray-500 shrink-0">自定义</label>
        <input
          type="number"
          min={5}
          max={100}
          value={maxColors}
          onChange={(e) => {
            const v = Math.max(5, Math.min(100, parseInt(e.target.value) || 20))
            onMaxColorsChange(v)
          }}
          className="w-14 border border-gray-300 rounded px-2 py-1 text-xs"
        />
        <span className="text-xs text-gray-500">色</span>
      </div>

      {/* Merge threshold */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">少量色合并</p>
      <div className="grid grid-cols-4 gap-1">
        {MERGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onMergeThresholdChange(opt.value)}
            className={`text-xs py-1.5 rounded border transition-colors ${
              mergeThreshold === opt.value
                ? 'bg-orange-400 text-white border-orange-400'
                : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-1">用量低于阈值的色号自动合并</p>
    </div>
  )
}
