import type { BrandName } from '../../types/palette'
import type { PatternData } from '../../types/pattern'
import { buildShortCodeMap } from '../../lib/utils/stats'
import { getBrightness } from '../../lib/utils/color'

const BRAND_SERIES: Record<string, string> = {
  'MARD': 'Mard221',
  'COCO': 'COCO',
  '漫漫': '漫漫',
  '盼盼': '盼盼',
  '咪小窝': '咪小窝',
}

interface StatsPanelProps {
  brand: BrandName
  width: number
  height: number
  patternData: PatternData | null
  workTitle?: string
  mirror?: boolean
}

export function StatsPanel({ brand, width, height, patternData, workTitle, mirror = false }: StatsPanelProps) {
  const canvasTotal = width * height
  const beadCount = patternData?.beadCount ?? canvasTotal
  const transparentCount = patternData?.transparentCount ?? 0
  const totalWithLoss = Math.ceil(beadCount * 1.05)
  const colorStats = patternData?.colorStats ?? []
  const shortCodeMap = buildShortCodeMap(colorStats)
  const seriesName = BRAND_SERIES[brand] ?? brand

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">图纸统计</p>

      <div className="bg-gray-50 rounded p-3 text-sm space-y-1.5 mb-3">
        {/* Work title & mirror status */}
        <Row label="图纸名称" value={workTitle || '未命名图纸'} />
        <div className="flex justify-between">
          <span className="text-gray-500">镜像状态</span>
          <span className={mirror ? 'font-medium text-red-600' : 'font-medium text-gray-400'}>
            {mirror ? '已开启' : '未开启'}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-1.5" />

        <Row label="当前品牌" value={`${brand}（${seriesName}）`} />
        <Row label="画布尺寸" value={`${width} × ${height} 格`} />
        <Row label="实际用豆" value={patternData ? `${beadCount.toLocaleString()} 颗` : '—'} />
        {patternData && transparentCount > 0 && (
          <Row label="空白格子" value={`${transparentCount.toLocaleString()} 格`} />
        )}
        <Row label="损耗率" value="5%" />
        <div className="flex justify-between border-t border-gray-200 pt-1.5">
          <span className="text-gray-500">建议备货总量</span>
          <span className="font-semibold text-blue-600">
            {patternData ? `${totalWithLoss.toLocaleString()} 颗` : '—'}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>色号种数</span>
          <span>{colorStats.length > 0 ? colorStats.length : '—'}</span>
        </div>
      </div>

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
              <div key={key} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1.5 text-xs">
                <div
                  className="w-8 h-6 rounded flex items-center justify-center font-bold shrink-0"
                  style={{ backgroundColor: stat.color.hex, color: textColor, fontSize: 9 }}
                >
                  {shortCode}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {stat.color.code} {stat.color.name}
                  </p>
                  <p className="text-gray-400 truncate">{stat.color.hex}</p>
                </div>
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
