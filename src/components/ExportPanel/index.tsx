import { useState } from 'react'
import type { BrandName } from '../../types/palette'
import type { PatternData } from '../../types/pattern'
import { exportPatternAsPng, type PngExportMode } from '../../lib/export/exportPng'

interface ExportPanelProps {
  brand: BrandName
  patternData: PatternData | null
  workTitle?: string
}

type ExportStatus = { type: 'success' | 'error' | 'warn'; text: string } | null

export function ExportPanel({ brand, patternData, workTitle = '' }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [status, setStatus] = useState<ExportStatus>(null)
  const [pngMode, setPngMode] = useState<PngExportMode>('professional')

  function clearStatus() {
    setTimeout(() => setStatus(null), 3500)
  }

  function handleExport() {
    if (!patternData) {
      setStatus({ type: 'warn', text: '请先生成图纸' })
      clearStatus()
      return
    }
    setIsExporting(true)
    setStatus(null)
    try {
      exportPatternAsPng(patternData, brand, pngMode, workTitle)
      setStatus({ type: 'success', text: 'PNG 已导出' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', text: '导出失败，请重试' })
    } finally {
      setIsExporting(false)
      clearStatus()
    }
  }

  function handleTodo(fmt: string) {
    setStatus({ type: 'warn', text: `${fmt} 导出尚未实现` })
    clearStatus()
  }

  const hasPattern = !!patternData

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">导出图纸</p>

      {status && (
        <div className={`text-xs mb-2 px-2.5 py-1.5 rounded border ${
          status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200'
          : status.type === 'error' ? 'bg-red-50 text-red-600 border-red-200'
          : 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }`}>
          {status.text}
        </div>
      )}

      {!hasPattern && (
        <p className="text-xs text-gray-400 mb-2">生成图纸后可导出</p>
      )}

      {/* Mode selector */}
      <div className="flex gap-1 mb-2">
        {(['professional', 'simple'] as PngExportMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setPngMode(m)}
            className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
              pngMode === m
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {m === 'professional' ? '专业图纸' : '简洁格子'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`w-full py-2 text-sm font-medium rounded border transition-colors ${
            !hasPattern
              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              : isExporting
              ? 'border-blue-200 bg-blue-50 text-blue-400 cursor-not-allowed'
              : 'border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          {isExporting ? '导出中…' : `导出 PNG${pngMode === 'professional' ? '（专业）' : '（简洁）'}`}
        </button>

        <button onClick={() => handleTodo('PDF')} className="w-full py-2 text-xs font-medium rounded border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed">
          导出 PDF（待开发）
        </button>
        <button onClick={() => handleTodo('Excel')} className="w-full py-2 text-xs font-medium rounded border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed">
          导出 Excel（待开发）
        </button>
        <button onClick={() => handleTodo('CSV')} className="w-full py-2 text-xs font-medium rounded border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed">
          导出 CSV（待开发）
        </button>
      </div>
    </div>
  )
}
