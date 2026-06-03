import { useEffect, useRef, useState } from 'react'
import type { PatternData, PreviewTab } from '../../types/pattern'
import { PREVIEW_TABS } from '../../types/pattern'
import {
  calcCellSize,
  drawPixelTab,
  drawGridTab,
  drawColorCodeTab,
  drawStatsTab,
} from './canvasRenderer'

interface PreviewCanvasProps {
  imageUrl: string | null
  patternData: PatternData | null
  width?: number
  height?: number
  mirror?: boolean
}

export function PreviewCanvas({ imageUrl, patternData, mirror = false }: PreviewCanvasProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('original')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (activeTab === 'original') return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!

    if (!patternData) {
      canvas.width = 4
      canvas.height = 4
      ctx.clearRect(0, 0, 4, 4)
      return
    }

    const { size, cells, rawPixels, colorStats } = patternData
    const cellSize = calcCellSize(size.width, size.height)

    if (activeTab === 'stats') {
      canvas.width = 520
      canvas.height = Math.max(200, 56 + Math.ceil(colorStats.length / Math.floor(520 / 120)) * 60)
    } else {
      canvas.width = size.width * cellSize
      canvas.height = size.height * cellSize
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    switch (activeTab) {
      case 'pixel':
        drawPixelTab(ctx, rawPixels, size.width, size.height, cellSize, mirror)
        break
      case 'grid':
        drawGridTab(ctx, cells, size.width, size.height, cellSize, mirror)
        break
      case 'colorcode':
        drawColorCodeTab(ctx, cells, colorStats, size.width, size.height, cellSize, mirror)
        break
      case 'stats':
        drawStatsTab(ctx, colorStats, canvas.width, canvas.height)
        break
    }
  }, [activeTab, patternData, mirror])

  const isEmpty = activeTab === 'original' ? !imageUrl : !patternData

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex border-b border-gray-200 mb-3 shrink-0">
        {PREVIEW_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {mirror && (
          <span className="ml-auto self-center text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
            镜像
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 overflow-auto">
        {activeTab === 'original' && (
          imageUrl ? (
            <img src={imageUrl} alt="原图" className="max-w-full max-h-full object-contain" />
          ) : (
            <EmptyHint text="上传图片后在此预览原图" />
          )
        )}

        {activeTab !== 'original' && (
          isEmpty ? (
            <EmptyHint text={emptyHintText(activeTab)} />
          ) : (
            <canvas ref={canvasRef} style={{ imageRendering: 'pixelated' }} />
          )
        )}
      </div>
    </div>
  )
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="text-center text-gray-400 select-none">
      <div className="text-4xl mb-2">🖼️</div>
      <p className="text-sm">{text}</p>
    </div>
  )
}

function emptyHintText(tab: PreviewTab): string {
  if (tab === 'pixel') return '上传图片并点击"生成图纸"后显示像素图'
  if (tab === 'grid') return '生成图纸后显示拼豆格子图'
  if (tab === 'colorcode') return '生成图纸后显示色号图'
  if (tab === 'stats') return '生成图纸后显示色彩统计'
  return '生成图纸后显示'
}
