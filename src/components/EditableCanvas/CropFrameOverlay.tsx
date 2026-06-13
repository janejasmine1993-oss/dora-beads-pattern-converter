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
  const [draggingEdge, setDraggingEdge] = useState<DragEdge>(null)
  const dragStateRef = useRef<{
    edge: DragEdge
    startScreenX: number
    startScreenY: number
    initialRect: { left: number; top: number; right: number; bottom: number }
  } | null>(null)

  if (!cropRect || !canvasElement) return null

  // Get canvas position in viewport
  const getCanvasOffset = () => {
    const rect = canvasElement.getBoundingClientRect()
    return { x: rect.left, y: rect.top }
  }

  // Convert screen coords to grid coords
  const screenToGridCoords = (screenX: number, screenY: number): { col: number; row: number } => {
    const { x: canvasX, y: canvasY } = getCanvasOffset()
    const relX = screenX - canvasX
    const relY = screenY - canvasY
    const col = relX / cellSize
    const row = relY / cellSize
    return { col, row }
  }

  // Handle pointer down on drag handle
  const handlePointerDown = (edge: DragEdge) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cropRect || !edge) return
    e.preventDefault()
    e.stopPropagation()

    dragStateRef.current = {
      edge,
      startScreenX: e.clientX,
      startScreenY: e.clientY,
      initialRect: { ...cropRect }
    }
    setDraggingEdge(edge)
    console.log(`[CropDebug] Start dragging ${edge}`, { x: e.clientX, y: e.clientY })
  }

  // Global pointer move handler
  useEffect(() => {
    if (!dragStateRef.current) return

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStateRef.current) return

      const { edge, startScreenX, startScreenY, initialRect } = dragStateRef.current
      const startCoords = screenToGridCoords(startScreenX, startScreenY)
      const currentCoords = screenToGridCoords(e.clientX, e.clientY)

      const colDelta = Math.round(currentCoords.col - startCoords.col)
      const rowDelta = Math.round(currentCoords.row - startCoords.row)

      let newRect = { ...initialRect }

      if (edge === 'left') {
        newRect.left = Math.max(0, Math.min(initialRect.left + colDelta, initialRect.right - 1))
      } else if (edge === 'right') {
        newRect.right = Math.min(patternWidth, Math.max(initialRect.right + colDelta, initialRect.left + 1))
      } else if (edge === 'top') {
        newRect.top = Math.max(0, Math.min(initialRect.top + rowDelta, initialRect.bottom - 1))
      } else if (edge === 'bottom') {
        newRect.bottom = Math.min(patternHeight, Math.max(initialRect.bottom + rowDelta, initialRect.top + 1))
      }

      console.log(`[CropDebug] Moving ${edge}: delta=${colDelta}/${rowDelta}, newRect=`, newRect)
      onCropRectChange(newRect)
    }

    const handlePointerUp = () => {
      if (dragStateRef.current) {
        console.log(`[CropDebug] Stop dragging ${dragStateRef.current.edge}`)
      }
      dragStateRef.current = null
      setDraggingEdge(null)
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)

    return () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
  }, [cellSize, patternWidth, patternHeight, onCropRectChange])

  // Calculate overlay position
  const overlayLeft = cropRect.left * cellSize
  const overlayTop = cropRect.top * cellSize
  const overlayWidth = (cropRect.right - cropRect.left) * cellSize
  const overlayHeight = (cropRect.bottom - cropRect.top) * cellSize

  const handleSize = 20 // 增大到 20px 便于点击

  return (
    <div
      style={{
        position: 'absolute',
        left: overlayLeft,
        top: overlayTop,
        width: overlayWidth,
        height: overlayHeight,
        pointerEvents: 'none',
        zIndex: 200
      }}
    >
      {/* 暗化外部区域 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          pointerEvents: 'auto',
          zIndex: -1
        }}
      />

      {/* 裁切框边框 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid #06b6d4',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          zIndex: 201
        }}
      />

      {/* 拖动尺寸显示 */}
      {draggingEdge && (
        <div
          style={{
            position: 'absolute',
            left: overlayWidth / 2 - 50,
            top: overlayHeight / 2 - 12,
            backgroundColor: '#0ea5e9',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 300
          }}
        >
          {cropRect.right - cropRect.left} × {cropRect.bottom - cropRect.top}
        </div>
      )}

      {/* 左边调节杆 - 20px 宽 */}
      <div
        onPointerDown={handlePointerDown('left')}
        style={{
          position: 'absolute',
          left: -handleSize / 2,
          top: 0,
          width: handleSize,
          height: overlayHeight || handleSize,
          cursor: 'ew-resize',
          backgroundColor: draggingEdge === 'left' ? '#0891b2' : '#06b6d4',
          opacity: 0.9,
          pointerEvents: 'auto',
          zIndex: 250,
          touchAction: 'none',
          transition: 'background-color 0.15s'
        }}
      />

      {/* 右边调节杆 - 20px 宽 */}
      <div
        onPointerDown={handlePointerDown('right')}
        style={{
          position: 'absolute',
          right: -handleSize / 2,
          top: 0,
          width: handleSize,
          height: overlayHeight || handleSize,
          cursor: 'ew-resize',
          backgroundColor: draggingEdge === 'right' ? '#0891b2' : '#06b6d4',
          opacity: 0.9,
          pointerEvents: 'auto',
          zIndex: 250,
          touchAction: 'none',
          transition: 'background-color 0.15s'
        }}
      />

      {/* 上边调节杆 - 20px 高 */}
      <div
        onPointerDown={handlePointerDown('top')}
        style={{
          position: 'absolute',
          left: 0,
          top: -handleSize / 2,
          width: overlayWidth || handleSize,
          height: handleSize,
          cursor: 'ns-resize',
          backgroundColor: draggingEdge === 'top' ? '#0891b2' : '#06b6d4',
          opacity: 0.9,
          pointerEvents: 'auto',
          zIndex: 250,
          touchAction: 'none',
          transition: 'background-color 0.15s'
        }}
      />

      {/* 下边调节杆 - 20px 高 */}
      <div
        onPointerDown={handlePointerDown('bottom')}
        style={{
          position: 'absolute',
          left: 0,
          bottom: -handleSize / 2,
          width: overlayWidth || handleSize,
          height: handleSize,
          cursor: 'ns-resize',
          backgroundColor: draggingEdge === 'bottom' ? '#0891b2' : '#06b6d4',
          opacity: 0.9,
          pointerEvents: 'auto',
          zIndex: 250,
          touchAction: 'none',
          transition: 'background-color 0.15s'
        }}
      />
    </div>
  )
}
