import { useEffect, useRef } from 'react'

interface PixelGridCalibratorProps {
  imageUrl: string
  gridCols: number
  gridRows: number
  cellSizePx: number
  offsetX: number
  offsetY: number
  gridColor: 'gray' | 'red' | 'maroon' | 'blue' | 'green'
  gridOpacity: number
  zoomLevel: number
}

export function PixelGridCalibrator({
  imageUrl,
  gridCols,
  gridRows,
  cellSizePx,
  offsetX,
  offsetY,
  gridColor,
  gridOpacity,
  zoomLevel,
}: PixelGridCalibratorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return

    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      drawGrid()
    }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    drawGrid()
  }, [gridCols, gridRows, cellSizePx, offsetX, offsetY, gridColor, gridOpacity, zoomLevel])

  function getGridColor(): string {
    const opacity = Math.round((gridOpacity / 100) * 255).toString(16).padStart(2, '0')
    const colorMap: Record<string, string> = {
      gray: `#888888${opacity}`,
      red: `#ff0000${opacity}`,
      maroon: `#8b0000${opacity}`,
      blue: `#0096ff${opacity}`,
      green: `#00aa00${opacity}`,
    }
    return colorMap[gridColor] || colorMap.red
  }

  function drawGrid() {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    const canvasWidth = img.width * zoomLevel
    const canvasHeight = img.height * zoomLevel
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw the image scaled
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

    // Draw grid overlay with zoom
    const scale = zoomLevel
    const scaledOffsetX = offsetX * scale
    const scaledOffsetY = offsetY * scale
    const scaledCellSize = cellSizePx * scale

    ctx.strokeStyle = getGridColor()
    ctx.lineWidth = Math.max(1, Math.floor(scale * 0.5))

    // Draw vertical lines
    for (let col = 0; col <= gridCols; col++) {
      const x = scaledOffsetX + col * scaledCellSize
      if (x < 0 || x > canvasWidth) continue
      ctx.beginPath()
      ctx.moveTo(x, scaledOffsetY)
      ctx.lineTo(x, scaledOffsetY + gridRows * scaledCellSize)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let row = 0; row <= gridRows; row++) {
      const y = scaledOffsetY + row * scaledCellSize
      if (y < 0 || y > canvasHeight) continue
      ctx.beginPath()
      ctx.moveTo(scaledOffsetX, y)
      ctx.lineTo(scaledOffsetX + gridCols * scaledCellSize, y)
      ctx.stroke()
    }

    // Mark first 3×3 cell centers
    ctx.fillStyle = `rgba(255, 150, 0, ${gridOpacity / 100 * 0.5})`
    for (let row = 0; row < Math.min(gridRows, 3); row++) {
      for (let col = 0; col < Math.min(gridCols, 3); col++) {
        const cx = scaledOffsetX + col * scaledCellSize + scaledCellSize / 2
        const cy = scaledOffsetY + row * scaledCellSize + scaledCellSize / 2
        ctx.beginPath()
        ctx.arc(cx, cy, Math.max(1, 2 * scale), 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  return (
    <div ref={containerRef} className="w-full bg-gray-50 border border-gray-200 rounded p-2">
      <p className="text-xs text-gray-500 mb-2">网格覆盖预览（橙点为采样点）</p>
      <div className="overflow-auto border border-gray-300 rounded bg-white" style={{ maxHeight: '300px' }}>
        <canvas
          ref={canvasRef}
          className="block"
        />
      </div>
    </div>
  )
}
