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
    preserveColorCount: boolean
  }) => void
  isProcessing?: boolean
}

type GridColor = 'gray' | 'red' | 'maroon' | 'blue' | 'green'
type GridOpacity = 25 | 50 | 75 | 100
type ZoomLevel = 1 | 2 | 3 | 4

export function PixelGridImportPanel({ onGridDataReady, isProcessing }: PixelGridImportPanelProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [gridCols, setGridCols] = useState(10)
  const [gridRows, setGridRows] = useState(10)
  const [cellSize, setCellSize] = useState(8)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [sampleMode, setSampleMode] = useState<'center' | 'average3x3'>('center')
  const [preserveColorCount, setPreserveColorCount] = useState(false)
  const [gridColor, setGridColor] = useState<GridColor>('red')
  const [gridOpacity, setGridOpacity] = useState<GridOpacity>(75)
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(1)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setZoomLevel(1)

    const img = new Image()
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height })
    }
    img.src = url
  }

  function handleAutoEstimate() {
    if (!imageDimensions) return
    const { width, height } = imageDimensions
    const estimatedCellSize = Math.round((width / gridCols + height / gridRows) / 2)
    const estimatedOffsetX = Math.max(0, Math.round((width - gridCols * estimatedCellSize) / 2))
    const estimatedOffsetY = Math.max(0, Math.round((height - gridRows * estimatedCellSize) / 2))

    setCellSize(estimatedCellSize)
    setStartX(estimatedOffsetX)
    setStartY(estimatedOffsetY)
  }

  function adjustParam(param: string, delta: number) {
    switch (param) {
      case 'cols':
        setGridCols(Math.max(2, Math.min(200, gridCols + delta)))
        break
      case 'rows':
        setGridRows(Math.max(2, Math.min(200, gridRows + delta)))
        break
      case 'size':
        setCellSize(Math.max(1, Math.min(50, cellSize + delta)))
        break
      case 'offsetX':
        setStartX(Math.max(0, startX + delta))
        break
      case 'offsetY':
        setStartY(Math.max(0, startY + delta))
        break
    }
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
      preserveColorCount,
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
          {/* Calibrator with zoom */}
          <div className="space-y-2 bg-gray-50 p-2 rounded border border-gray-200">
            <div className="flex gap-1 justify-center">
              {([1, 2, 3, 4] as const).map(z => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                    zoomLevel === z
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-blue-300'
                  }`}
                >
                  {z}x
                </button>
              ))}
              <button
                onClick={() => setZoomLevel(1)}
                className="text-[10px] px-2 py-1 rounded border border-gray-300 text-gray-600 hover:border-blue-300 bg-white transition-colors"
              >
                重置
              </button>
            </div>
            <PixelGridCalibrator
              imageUrl={imageUrl}
              gridCols={gridCols}
              gridRows={gridRows}
              cellSizePx={cellSize}
              offsetX={startX}
              offsetY={startY}
              gridColor={gridColor}
              gridOpacity={gridOpacity}
              zoomLevel={zoomLevel}
            />
          </div>

          {/* Grid display options */}
          <div className="space-y-2 bg-blue-50 p-2 rounded border border-blue-200">
            <p className="text-xs font-semibold text-blue-900">网格显示</p>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-blue-700 block mb-1">颜色</label>
                <select
                  value={gridColor}
                  onChange={e => setGridColor(e.target.value as GridColor)}
                  className="w-full px-2 py-1 text-xs border border-blue-300 rounded bg-white"
                >
                  <option value="gray">灰色</option>
                  <option value="red">红色</option>
                  <option value="maroon">酒红色</option>
                  <option value="blue">蓝色</option>
                  <option value="green">绿色</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-blue-700 block mb-1">透明度</label>
                <select
                  value={gridOpacity}
                  onChange={e => setGridOpacity(Number(e.target.value) as GridOpacity)}
                  className="w-full px-2 py-1 text-xs border border-blue-300 rounded bg-white"
                >
                  <option value={25}>25%</option>
                  <option value={50}>50%</option>
                  <option value={75}>75%</option>
                  <option value={100}>100%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid parameters with adjustment buttons */}
          <div className="space-y-2 bg-gray-50 p-2 rounded border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-700">格子参数</label>
              {imageDimensions && (
                <button
                  onClick={handleAutoEstimate}
                  className="text-[10px] px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  自动估算
                </button>
              )}
            </div>

            {/* Cols with +/- buttons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-600">横向格数</label>
                <span className="font-bold text-gray-800">{gridCols}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustParam('cols', -1)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-blue-400 bg-white"
                >
                  −
                </button>
                <input
                  type="range"
                  min="2"
                  max="200"
                  value={gridCols}
                  onChange={e => setGridCols(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => adjustParam('cols', 1)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-blue-400 bg-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Rows with +/- buttons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-600">纵向格数</label>
                <span className="font-bold text-gray-800">{gridRows}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustParam('rows', -1)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-blue-400 bg-white"
                >
                  −
                </button>
                <input
                  type="range"
                  min="2"
                  max="200"
                  value={gridRows}
                  onChange={e => setGridRows(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => adjustParam('rows', 1)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-blue-400 bg-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Cell size with +/- buttons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-gray-600">格子大小（px）</label>
                <span className="font-bold text-gray-800">{cellSize}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => adjustParam('size', -1)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-blue-400 bg-white"
                >
                  −
                </button>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={cellSize}
                  onChange={e => setCellSize(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => adjustParam('size', 1)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:border-blue-400 bg-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Offset X/Y with +/- buttons */}
            <div className="border-t pt-2 space-y-2">
              <label className="text-xs text-gray-600 block">起点位置</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-gray-500">X</label>
                    <span className="text-xs font-bold text-gray-700">{startX}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => adjustParam('offsetX', -1)}
                      className="px-1.5 py-0.5 text-xs border border-gray-300 rounded hover:border-blue-400 bg-white"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={startX}
                      onChange={e => setStartX(Math.max(0, Number(e.target.value)))}
                      min="0"
                      className="flex-1 px-2 py-0.5 text-xs border border-gray-300 rounded"
                    />
                    <button
                      onClick={() => adjustParam('offsetX', 1)}
                      className="px-1.5 py-0.5 text-xs border border-gray-300 rounded hover:border-blue-400 bg-white"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-gray-500">Y</label>
                    <span className="text-xs font-bold text-gray-700">{startY}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => adjustParam('offsetY', -1)}
                      className="px-1.5 py-0.5 text-xs border border-gray-300 rounded hover:border-blue-400 bg-white"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={startY}
                      onChange={e => setStartY(Math.max(0, Number(e.target.value)))}
                      min="0"
                      className="flex-1 px-2 py-0.5 text-xs border border-gray-300 rounded"
                    />
                    <button
                      onClick={() => adjustParam('offsetY', 1)}
                      className="px-1.5 py-0.5 text-xs border border-gray-300 rounded hover:border-blue-400 bg-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sampling and color control */}
          <div className="space-y-2 bg-gray-50 p-2 rounded border border-gray-200">
            <div>
              <label className="text-xs text-gray-600 block mb-1">采样方式</label>
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

            <div className="pt-2 border-t">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={preserveColorCount}
                  onChange={e => setPreserveColorCount(e.target.checked)}
                  className="w-3 h-3"
                />
                <span className="text-gray-700">保留原图颜色数量</span>
              </label>
              <p className="text-[10px] text-gray-400 mt-1">
                {preserveColorCount ? '已启用：不限制颜色数量' : '已禁用：遵守色板限制'}
              </p>
            </div>
          </div>

          <button
            onClick={handleStartRecognition}
            disabled={isProcessing}
            className="w-full py-2 px-3 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
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
