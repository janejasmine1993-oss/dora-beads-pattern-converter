import { useEffect, useRef } from 'react'

interface PixelGridCalibratorProps {
  imageUrl: string
  gridCols: number
  gridRows: number
  cellSizePx: number
  offsetX: number
  offsetY: number
}

export function PixelGridCalibrator({
  imageUrl,
  gridCols,
  gridRows,
  cellSizePx,
  offsetX,
  offsetY,
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
  }, [gridCols, gridRows, cellSizePx, offsetX, offsetY])

  function drawGrid() {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw the image
    ctx.drawImage(img, 0, 0)

    // Draw grid overlay
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.6)'
    ctx.lineWidth = 1

    // Draw vertical lines
    for (let col = 0; col <= gridCols; col++) {
      const x = offsetX + col * cellSizePx
      ctx.beginPath()
      ctx.moveTo(x, offsetY)
      ctx.lineTo(x, offsetY + gridRows * cellSizePx)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let row = 0; row <= gridRows; row++) {
      const y = offsetY + row * cellSizePx
      ctx.beginPath()
      ctx.moveTo(offsetX, y)
      ctx.lineTo(offsetX + gridCols * cellSizePx, y)
      ctx.stroke()
    }

    // Optional: mark grid cell centers for debugging
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
    for (let row = 0; row < Math.min(gridRows, 3); row++) {
      for (let col = 0; col < Math.min(gridCols, 3); col++) {
        const cx = offsetX + col * cellSizePx + cellSizePx / 2
        const cy = offsetY + row * cellSizePx + cellSizePx / 2
        ctx.beginPath()
        ctx.arc(cx, cy, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  return (
    <div ref={containerRef} className="w-full bg-gray-50 border border-gray-200 rounded p-2">
      <p className="text-xs text-gray-500 mb-2">网格覆盖预览（前 3×3 格显示采样点）</p>
      <canvas
        ref={canvasRef}
        className="max-w-full border border-gray-300 rounded"
        style={{ maxHeight: '300px', width: 'auto', height: 'auto' }}
      />
    </div>
  )
}
