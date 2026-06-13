import { useEffect, useRef, useState } from 'react'

interface CropFrameOverlayProps {
  cropRect: { left: number; top: number; right: number; bottom: number } | null
  onCropRectChange: (rect: { left: number; top: number; right: number; bottom: number }) => void
  canvasWidth: number
  canvasHeight: number
  cellSize: number
  containerElement: HTMLDivElement | null
  patternWidth: number
  patternHeight: number
}

type DragEdge = 'left' | 'right' | 'top' | 'bottom' | null

export function CropFrameOverlay({
  cropRect, onCropRectChange, canvasWidth, canvasHeight,
  cellSize, containerElement, patternWidth, patternHeight
}: CropFrameOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [dragEdge, setDragEdge] = useState<DragEdge>(null)
  const dragStartRef = useRef<{
    edge: DragEdge
    startX: number
    startY: number
    rect: { left: number; top: number; right: number; bottom: number }
  } | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<DragEdge>(null)

  if (!cropRect || !containerElement) return null

  // Calculate overlay position and size based on cropRect and cellSize
  const overlayLeft = cropRect.left * cellSize
  const overlayTop = cropRect.top * cellSize
  const overlayWidth = (cropRect.right - cropRect.left) * cellSize
  const overlayHeight = (cropRect.bottom - cropRect.top) * cellSize

  function screenToGridCoords(clientX: number, clientY: number) {
    if (!containerElement) return { col: 0, row: 0 }
    const canvasRect = containerElement.getBoundingClientRect()
    const x = clientX - canvasRect.left + containerElement.scrollLeft
    const y = clientY - canvasRect.top + containerElement.scrollTop
    const col = x / cellSize
    const row = y / cellSize
    return { col, row }
  }

  function startDrag(edge: DragEdge) {
    return (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!cropRect) return

      dragStartRef.current = {
        edge,
        startX: e.clientX,
        startY: e.clientY,
        rect: { ...cropRect }
      }
      setDragEdge(edge)
    }
  }

  // Global drag handlers
  useEffect(() => {
    if (!dragStartRef.current) return

    function handleMouseMove(e: MouseEvent) {
      if (!dragStartRef.current || !cropRect) return

      const { edge, startX, startY, rect } = dragStartRef.current
      const startCoords = screenToGridCoords(startX, startY)
      const currentCoords = screenToGridCoords(e.clientX, e.clientY)

      const newRect = { ...rect }

      if (edge === 'left') {
        const newLeft = Math.round(rect.left + (currentCoords.col - startCoords.col))
        newRect.left = Math.max(0, Math.min(newLeft, rect.right - 1))
      } else if (edge === 'right') {
        const newRight = Math.round(rect.right + (currentCoords.col - startCoords.col))
        newRect.right = Math.min(patternWidth, Math.max(newRight, rect.left + 1))
      } else if (edge === 'top') {
        const newTop = Math.round(rect.top + (currentCoords.row - startCoords.row))
        newRect.top = Math.max(0, Math.min(newTop, rect.bottom - 1))
      } else if (edge === 'bottom') {
        const newBottom = Math.round(rect.bottom + (currentCoords.row - startCoords.row))
        newRect.bottom = Math.min(patternHeight, Math.max(newBottom, rect.top + 1))
      }

      onCropRectChange(newRect)
    }

    function handleMouseUp() {
      dragStartRef.current = null
      setDragEdge(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [cropRect, patternWidth, patternHeight, cellSize, containerElement])

  const handleSize = 14
  const borderWidth = 3

  return (
    <div
      ref={overlayRef}
      className="absolute pointer-events-none"
      style={{
        left: overlayLeft,
        top: overlayTop,
        width: overlayWidth,
        height: overlayHeight,
        zIndex: 40
      }}
    >
      {/* Background overlay for areas outside crop */}
      <div
        className="absolute pointer-events-auto"
        style={{
          left: -canvasWidth,
          top: -canvasHeight,
          width: canvasWidth * 3,
          height: canvasHeight * 3,
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: -1
        }}
      />

      {/* Crop frame border */}
      <div
        className="absolute"
        style={{
          inset: 0,
          border: `${borderWidth}px solid #3b82f6`,
          boxSizing: 'border-box',
          pointerEvents: 'none'
        }}
      />

      {/* Drag indicator and dimensions */}
      {dragEdge && (
        <div
          className="absolute bg-blue-500 text-white text-xs px-2 py-1 rounded pointer-events-none"
          style={{
            left: overlayWidth / 2 - 30,
            top: overlayHeight / 2 - 10,
            zIndex: 50,
            whiteSpace: 'nowrap'
          }}
        >
          {cropRect.right - cropRect.left} × {cropRect.bottom - cropRect.top}
        </div>
      )}

      {/* Left edge handle */}
      <div
        className="absolute cursor-ew-resize hover:bg-blue-400"
        style={{
          left: -handleSize / 2,
          top: (overlayHeight - handleSize) / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: hoveredEdge === 'left' ? '#2563eb' : '#3b82f6',
          borderRadius: '2px',
          zIndex: 50,
          pointerEvents: 'auto'
        }}
        onMouseDown={startDrag('left')}
        onMouseEnter={() => setHoveredEdge('left')}
        onMouseLeave={() => setHoveredEdge(null)}
      />

      {/* Right edge handle */}
      <div
        className="absolute cursor-ew-resize hover:bg-blue-400"
        style={{
          right: -handleSize / 2,
          top: (overlayHeight - handleSize) / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: hoveredEdge === 'right' ? '#2563eb' : '#3b82f6',
          borderRadius: '2px',
          zIndex: 50,
          pointerEvents: 'auto'
        }}
        onMouseDown={startDrag('right')}
        onMouseEnter={() => setHoveredEdge('right')}
        onMouseLeave={() => setHoveredEdge(null)}
      />

      {/* Top edge handle */}
      <div
        className="absolute cursor-ns-resize hover:bg-blue-400"
        style={{
          left: (overlayWidth - handleSize) / 2,
          top: -handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: hoveredEdge === 'top' ? '#2563eb' : '#3b82f6',
          borderRadius: '2px',
          zIndex: 50,
          pointerEvents: 'auto'
        }}
        onMouseDown={startDrag('top')}
        onMouseEnter={() => setHoveredEdge('top')}
        onMouseLeave={() => setHoveredEdge(null)}
      />

      {/* Bottom edge handle */}
      <div
        className="absolute cursor-ns-resize hover:bg-blue-400"
        style={{
          left: (overlayWidth - handleSize) / 2,
          bottom: -handleSize / 2,
          width: handleSize,
          height: handleSize,
          backgroundColor: hoveredEdge === 'bottom' ? '#2563eb' : '#3b82f6',
          borderRadius: '2px',
          zIndex: 50,
          pointerEvents: 'auto'
        }}
        onMouseDown={startDrag('bottom')}
        onMouseEnter={() => setHoveredEdge('bottom')}
        onMouseLeave={() => setHoveredEdge(null)}
      />
    </div>
  )
}
