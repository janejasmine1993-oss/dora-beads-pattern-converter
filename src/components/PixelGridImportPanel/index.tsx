import { useState, useRef } from 'react'
import { PixelGridCalibrator } from '../PixelGridCalibrator'

export interface PixelGridImportPanelProps {
  onGridDataReady: (data: {
    imageUrl: string
    gridCols: number
    gridRows: number
    cellSizePx: number
    offsetX: number
    offsetY: number
    sampleMode: 'center' | 'average3x3'
  }) => void
  isProcessing?: boolean
}

export function PixelGridImportPanel({ onGridDataReady, isProcessing }: PixelGridImportPanelProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [gridCols, setGridCols] = useState(10)
  const [gridRows, setGridRows] = useState(10)
  const [cellSize, setCellSize] = useState(8)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [sampleMode, setSampleMode] = useState<'center' | 'average3x3'>('center')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  function handleStartRecognition() {
    if (!imageUrl) return
    onGridDataReady({
      imageUrl,
      gridCols,
      gridRows,
      cellSizePx: cellSize,
      offsetX: startX,
      offsetY: startY,
      sampleMode,
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">像素图转色号</h3>

      <div>
        <label className="text-xs text-gray-600 block mb-1">上传像素图：</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-xs file:mr-2 file:px-2 file:py-1 file:rounded file:border file:border-gray-300 file:text-xs file:text-gray-600 hover:file:border-blue-400"
        />
      </div>

      {imageUrl && (
        <>
          <PixelGridCalibrator
            imageUrl={imageUrl}
            gridCols={gridCols}
            gridRows={gridRows}
            cellSizePx={cellSize}
            offsetX={startX}
            offsetY={startY}
          />

          <div className="space-y-2 bg-gray-50 p-2 rounded border border-gray-200">
            <div>
              <label className="text-xs text-gray-600 block mb-1">
                横向格数：<span className="font-bold text-gray-800">{gridCols}</span>
              </label>
              <input
                type="range"
                min="2"
                max="200"
                value={gridCols}
                onChange={e => setGridCols(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 block mb-1">
                纵向格数：<span className="font-bold text-gray-800">{gridRows}</span>
              </label>
              <input
                type="range"
                min="2"
                max="200"
                value={gridRows}
                onChange={e => setGridRows(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 block mb-1">
                格子大小（px）：<span className="font-bold text-gray-800">{cellSize}</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={cellSize}
                onChange={e => setCellSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="border-t pt-2 space-y-2">
            <label className="text-xs text-gray-600 block">起点位置</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 block mb-1">X：</label>
                <input
                  type="number"
                  value={startX}
                  onChange={e => setStartX(Number(e.target.value))}
                  min="0"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-gray-500 block mb-1">Y：</label>
                <input
                  type="number"
                  value={startY}
                  onChange={e => setStartY(Number(e.target.value))}
                  min="0"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-2 space-y-2">
            <label className="text-xs text-gray-600 block">采样方式</label>
            <div className="flex gap-2">
              {(['center', 'average3x3'] as const).map(mode => (
                <label key={mode} className="flex-1 flex items-center gap-1 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="sampleMode"
                    value={mode}
                    checked={sampleMode === mode}
                    onChange={() => setSampleMode(mode)}
                    className="w-3 h-3"
                  />
                  <span className="text-gray-600">{mode === 'center' ? '中心点' : '3×3平均'}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartRecognition}
            disabled={isProcessing}
            className="w-full py-2 px-3 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? '识别中...' : '开始识别'}
          </button>
        </>
      )}

      {!imageUrl && (
        <p className="text-[10px] text-gray-400 text-center py-4">
          请先上传像素图
        </p>
      )}
    </div>
  )
}
