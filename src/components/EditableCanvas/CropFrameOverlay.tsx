import { useEffect, useRef, useState } from 'react'

interface CropFrameOverlayProps {
  cropRect: { left: number; top: number; right: number; bottom: number } | null
  onCropRectChange: (rect: { left: number; top: number; right: number; bottom: number }) => void
  cellSize: number
  patternWidth: number
  patternHeight: number
  canvasElement?: HTMLCanvasElement | null
}

type DragEdge = 'left' | 'right' | 'top' | 'bottom' | null

export function CropFrameOverlay({
  cropRect, onCropRectChange, cellSize, patternWidth, patternHeight, canvasElement
}: CropFrameOverlayProps) {
  const [dragEdge, setDragEdge] = useState<DragEdge>(null)
  const [hoveredEdge, setHoveredEdge] = useState<DragEdge>(null)
  const dragStateRef = useRef<{
    edge: DragEdge
    startCol: number
    startRow: number
    initialRect: { left: number; top: number; right: number; bottom: number }
  } | null>(null)

  if (!cropRect) return null

  // Canvas positioning
  const canvasRect = canvasElement?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 }

  // Convert screen coordinates to grid coordinates (relative to canvas)
  const screenToGrid = (clientX: number, clientY: number) => {
    const relX = clientX - canvasRect.left
    const relY = clientY - canvasRect.top
    const col = relX / cellSize
    const row = relY / cellSize
    return { col, row }
  }

  const handleMouseDown = (edge: DragEdge) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!cropRect || !edge) return

    const { col, row } = screenToGrid(e.clientX, e.clientY)
    dragStateRef.current = {
      edge,
      startCol: col,
      startRow: row,
      initialRect: { ...cropRect }
    }
    setDragEdge(edge)
  }

  // Global mouse move and up handlers
  useEffect(() => {
    if (!dragStateRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current) return

      const { edge, startCol, startRow, initialRect } = dragStateRef.current
      const { col, row } = screenToGrid(e.clientX, e.clientY)

      const colDelta = col - startCol
      const rowDelta = row - startRow

      let newRect = { ...initialRect }

      if (edge === 'left') {
        newRect.left = Math.max(0, Math.min(Math.round(initialRect.left + colDelta), initialRect.right - 1))
      } else if (edge === 'right') {
        newRect.right = Math.min(patternWidth, Math.max(Math.round(initialRect.right + colDelta), initialRect.left + 1))
      } else if (edge === 'top') {
        newRect.top = Math.max(0, Math.min(Math.round(initialRect.top + rowDelta), initialRect.bottom - 1))
      } else if (edge === 'bottom') {
        newRect.bottom = Math.min(patternHeight, Math.max(Math.round(initialRect.bottom + rowDelta), initialRect.top + 1))
      }

      onCropRectChange(newRect)
    }

    const handleMouseUp = () => {
      dragStateRef.current = null
      setDragEdge(null)
    }

    document.addEventListener('mousemove', handleMouseMove, false)
    document.addEventListener('mouseup', handleMouseUp, false)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, false)
      document.removeEventListener('mouseup', handleMouseUp, false)
    }
  }, [cellSize, patternWidth, patternHeight, onCropRectChange])

  // Calculate overlay dimensions and position
  const overlayLeft = cropRect.left * cellSize
  const overlayTop = cropRect.top * cellSize
  const overlayWidth = (cropRect.right - cropRect.left) * cellSize
  const overlayHeight = (cropRect.bottom - cropRect.top) * cellSize

  const handleSize = 12
  const borderWidth = 2

  return (
    <div
      style={{
        position: 'absolute',
        left: overlayLeft,
        top: overlayTop,
        width: overlayWidth,
        height: overlayHeight,
        pointerEvents: 'none',
        zIndex: 100
      }}
    >
      {/* Background overlay (darkening outside area) */}
      <div
        style={{
          position: 'absolute',
          left: -10000,
          top: -10000,
          width: 20000,
          height: 20000,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          zIndex: -1,
          pointerEvents: 'auto'
        }}
      />

      {/* Crop border */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: `${borderWidth}px solid #22d3ee`,
          boxSizing: 'border-box',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Dimension indicator during drag */}
      {dragEdge && (
        <div
          style={{
            position: 'absolute',
            left: overlayWidth / 2 - 40,
            top: overlayHeight / 2 - 12,
            backgroundColor: '#0ea5e9',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 50
          }}
        >
          {cropRect.right - cropRect.left} × {cropRect.bottom - cropRect.top}
        </div>
      )}

      {/* Left edge handle */}
      <div
        onMouseDown={handleMouseDown('left')}
        onMouseEnter={() => setHoveredEdge('left')}
        onMouseLeave={() => hoveredEdge === 'left' && setHoveredEdge(null)}
        style={{
          position: 'absolute',
          left: -handleSize / 2,
          top: Math.max(0, (overlayHeight - handleSize) / 2),
          width: handleSize,
          height: Math.min(handleSize, overlayHeight),
          cursor: 'ew-resize',
          backgroundColor: hoveredEdge === 'left' ? '#06b6d4' : '#22d3ee',
          borderRadius: '2px',
          pointerEvents: 'auto',
          zIndex: 50,
          transition: 'background-color 0.15s'
        }}
      />

      {/* Right edge handle */}
      <div
        onMouseDown={handleMouseDown('right')}
        onMouseEnter={() => setHoveredEdge('right')}
        onMouseLeave={() => hoveredEdge === 'right' && setHoveredEdge(null)}
        style={{
          position: 'absolute',
          right: -handleSize / 2,
          top: Math.max(0, (overlayHeight - handleSize) / 2),
          width: handleSize,
          height: Math.min(handleSize, overlayHeight),
          cursor: 'ew-resize',
          backgroundColor: hoveredEdge === 'right' ? '#06b6d4' : '#22d3ee',
          borderRadius: '2px',
          pointerEvents: 'auto',
          zIndex: 50,
          transition: 'background-color 0.15s'
        }}
      />

      {/* Top edge handle */}
      <div
        onMouseDown={handleMouseDown('top')}
        onMouseEnter={() => setHoveredEdge('top')}
        onMouseLeave={() => hoveredEdge === 'top' && setHoveredEdge(null)}
        style={{
          position: 'absolute',
          left: Math.max(0, (overlayWidth - handleSize) / 2),
          top: -handleSize / 2,
          width: Math.min(handleSize, overlayWidth),
          height: handleSize,
          cursor: 'ns-resize',
          backgroundColor: hoveredEdge === 'top' ? '#06b6d4' : '#22d3ee',
          borderRadius: '2px',
          pointerEvents: 'auto',
          zIndex: 50,
          transition: 'background-color 0.15s'
        }}
      />

      {/* Bottom edge handle */}
      <div
        onMouseDown={handleMouseDown('bottom')}
        onMouseEnter={() => setHoveredEdge('bottom')}
        onMouseLeave={() => hoveredEdge === 'bottom' && setHoveredEdge(null)}
        style={{
          position: 'absolute',
          left: Math.max(0, (overlayWidth - handleSize) / 2),
          bottom: -handleSize / 2,
          width: Math.min(handleSize, overlayWidth),
          height: handleSize,
          cursor: 'ns-resize',
          backgroundColor: hoveredEdge === 'bottom' ? '#06b6d4' : '#22d3ee',
          borderRadius: '2px',
          pointerEvents: 'auto',
          zIndex: 50,
          transition: 'background-color 0.15s'
        }}
      />
    </div>
  )
}
