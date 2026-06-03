import type { BrandName } from '../../types/palette'
import type { PatternData } from '../../types/pattern'
import { buildShortCodeMap } from '../../lib/utils/stats'
import { getBrightness } from '../../lib/utils/color'

interface StatsPanelProps {
  brand: BrandName
  width: number
  height: number
  patternData: PatternData | null
}

export function StatsPanel({ brand, width, height, patternData }: StatsPanelProps) {
  const totalBeads = width * height
  const totalWithLoss = Math.ceil(totalBeads * 1.05)

  const colorStats = patternData?.colorStats ?? []
  const shortCodeMap = buildShortCodeMap(colorStats)

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">图纸统计</p>

      {/* Summary card */}
      <div className="bg-gray-50 rounded p-3 text-sm space-y-1.5 mb-3">
        <Row label="当前品牌" value={brand} />
        <Row label="图纸尺寸" value={`${width} × ${height} 格`} />
        <Row label="实际总豆量" value={`${totalBeads.toLocaleString()} 颗`} />
        <Row label="损耗率" value="5%" />
        <div className="flex justify-between border-t border-gray-200 pt-1.5">
          <span className="text-gray-500">建议备货总量</span>
          <span className="font-semibold text-blue-600">{totalWithLoss.toLocaleString()} 颗</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>色号种数</span>
          <span>{colorStats.length > 0 ? colorStats.length : '—'}</span>
        </div>
      </div>

      {/* Per-color stats table */}
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">色号明细</p>
      {colorStats.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded">
          生成图纸后显示各色号用量
        </p>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {colorStats.map((stat) => {
            const key = `${stat.color.brand}__${stat.color.code}`
            const shortCode = shortCodeMap.get(key) ?? '?'
            const brightness = getBrightness(stat.color.rgb[0], stat.color.rgb[1], stat.color.rgb[2])
            const textColor = brightness > 140 ? '#000' : '#fff'

            return (
              <div
                key={key}
                className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1.5 text-xs"
              >
                {/* Color swatch with short code */}
                <div
                  className="w-8 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: stat.color.hex, color: textColor, fontSize: 9 }}
                >
                  {shortCode}
                </div>

                {/* Color info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {stat.color.code} {stat.color.name}
                  </p>
                  <p className="text-gray-400 truncate">{stat.color.hex}</p>
                </div>

                {/* Count + grams */}
                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-700">{stat.countWithLoss.toLocaleString()}</p>
                  <p className="text-gray-400">{stat.grams}g</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {colorStats.length > 0 && (
        <p className="text-xs text-gray-400 mt-1 text-right">含 5% 损耗 · 约 100颗/g</p>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  )
}
