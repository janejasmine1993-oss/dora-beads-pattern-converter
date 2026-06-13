import { useRef, useEffect, useState, useCallback } from 'react'
import type { PatternData, PatternCell } from '../../types/pattern'
import type { PaletteColor } from '../../types/palette'
import type { EditorTool, SelectionRect } from '../../lib/editor/types'
import { TOOL_CURSORS } from '../../lib/editor/types'
import { paintCell, eraseCell } from '../../lib/editor/operations'
import { floodFill } from '../../lib/editor/floodFill'

const FF_MONO = 'Consolas, Menlo, Monaco, "Courier New", monospace'

interface EditableCanvasProps {
  patternData: PatternData
  activeTool: EditorTool
  activeColor: PaletteColor | null
  highlightColorCode: string | null
  selection: SelectionRect | null
  mirror: boolean
  zoom: number
  showCellCodes?: boolean
  spacePanning?: boolean    // space key held — temporary grab/pan mode
  cropRect?: { left: number; top: number; right: number; bottom: number } | null
  onCropRectChange?: (rect: { left: number; top: number; right: number; bottom: number }) => void
  onCellsChange: (cells: PatternCell[]) => void
  onColorPick: (color: PaletteColor) => void
  onSelectionChange: (sel: SelectionRect | null) => void
}

function calcBaseCS(w: number, h: number) {
  return Math.max(8, Math.min(20, Math.floor(520 / Math.max(w, h))))
}

export function EditableCanvas({
  patternData, activeTool, activeColor, highlightColorCode,
  selection, mirror, zoom, showCellCodes = true, spacePanning = false,
  cropRect = null, onCropRectChange = undefined,
  onCellsChange, onColorPick, onSelectionChange,
}: EditableCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number } | null>(null)
  const [hoveredCropEdge, setHoveredCropEdge] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null)
  const isPainting = useRef(false)
  const isSelecting = useRef(false)
  const selStart = useRef<{ r: number; c: number } | null>(null)
  // Pan state: tracks mouse start pos + container scroll start
  const panStart = useRef<{ mx: number; my: number; sl: number; st: number } | null>(null)
  // Crop drag state: which edge is being dragged
  const cropDragEdge = useRef<'left' | 'right' | 'top' | 'bottom' | null>(null)
  const cropDragStart = useRef<{ x: number; y: number; rect: { left: number; top: number; right: number; bottom: number } } | null>(null)

  const { size: { width, height }, cells } = patternData
  const CS = Math.round(calcBaseCS(width, height) * zoom)

  // Fast cell index: key=row*width+col -> cells array index
  const indexMap = useRef(new Map<number, number>())
  useEffect(() => {
    const m = new Map<number, number>()
    cells.forEach((c, i) => m.set(c.row * width + c.col, i))
    indexMap.current = m
  }, [cells, width])

  // Render
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const logW = width * CS
    const logH = height * CS
    canvas.width = logW * dpr
    canvas.height = logH * dpr
    canvas.style.width = logW + 'px'
    canvas.style.height = logH + 'px'
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    // 1. White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, logW, logH)

    // 2. Cells
    const imap = indexMap.current
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const srcCol = mirror ? (width - 1 - col) : col
        const idx = imap.get(row * width + srcCol)
        if (idx === undefined) continue
        const cell = cells[idx]
        if (cell.isTransparent) continue
        const dimmed = highlightColorCode && cell.color.code !== highlightColorCode
        ctx.globalAlpha = dimmed ? 0.2 : 1
        ctx.fillStyle = cell.color.hex
        ctx.fillRect(col * CS, row * CS, CS, CS)
        ctx.globalAlpha = 1
      }
    }

    // 3. Fine grid
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'
    ctx.lineWidth = 0.5
    for (let x = 0; x <= width; x++) {
      ctx.beginPath(); ctx.moveTo(x * CS, 0); ctx.lineTo(x * CS, logH); ctx.stroke()
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * CS); ctx.lineTo(logW, y * CS); ctx.stroke()
    }

    // 4. 10-grid dividers
    ctx.strokeStyle = 'rgba(30,30,30,0.28)'
    ctx.lineWidth = 1
    for (let x = 10; x < width; x += 10) {
      ctx.beginPath(); ctx.moveTo(x * CS, 0); ctx.lineTo(x * CS, logH); ctx.stroke()
    }
    for (let y = 10; y < height; y += 10) {
      ctx.beginPath(); ctx.moveTo(0, y * CS); ctx.lineTo(logW, y * CS); ctx.stroke()
    }

    // 5. Cell labels — controlled by showCellCodes prop; fallback threshold at CS>=8
    if (showCellCodes && CS >= 8) {
      const fs = Math.max(6, Math.floor(CS * 0.32))
      ctx.font = `bold ${fs}px ${FF_MONO}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const cell of cells) {
        if (cell.isTransparent) continue
        if (highlightColorCode && cell.color.code !== highlightColorCode) continue
        const drawCol = mirror ? (width - 1 - cell.col) : cell.col
        const r = parseInt(cell.color.hex.slice(1, 3), 16)
        const g = parseInt(cell.color.hex.slice(3, 5), 16)
        const b = parseInt(cell.color.hex.slice(5, 7), 16)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b
        ctx.fillStyle = lum > 155 ? 'rgba(0,0,0,0.70)' : 'rgba(255,255,255,0.85)'
        ctx.fillText(cell.color.code, drawCol * CS + CS / 2, cell.row * CS + CS / 2)
      }
    }

    // 6. Outer border
    ctx.strokeStyle = '#8A1538'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, logW - 2, logH - 2)

    // 7. Selection overlay
    if (selection) {
      const sx = selection.minCol * CS
      const sy = selection.minRow * CS
      const sw = (selection.maxCol - selection.minCol + 1) * CS
      const sh = (selection.maxRow - selection.minRow + 1) * CS
      ctx.fillStyle = 'rgba(37,99,235,0.08)'
      ctx.fillRect(sx, sy, sw, sh)
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.strokeRect(sx + 0.5, sy + 0.5, sw - 1, sh - 1)
      ctx.setLineDash([])
    }

    // 8. Hover indicator
    if (hoverCell && hoverCell.r >= 0 && hoverCell.r < height && hoverCell.c >= 0 && hoverCell.c < width) {
      ctx.strokeStyle = 'rgba(251,146,60,0.9)'
      ctx.lineWidth = 2
      ctx.strokeRect(hoverCell.c * CS + 1, hoverCell.r * CS + 1, CS - 2, CS - 2)
    }

    // 9. Crop overlay
    if (cropRect) {
      const cx = cropRect.left * CS
      const cy = cropRect.top * CS
      const cw = (cropRect.right - cropRect.left) * CS
      const ch = (cropRect.bottom - cropRect.top) * CS

      // Overlay outside crop area with semi-transparent black
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      // Left
      if (cropRect.left > 0) ctx.fillRect(0, 0, cx, logH)
      // Right
      if (cropRect.right < width) ctx.fillRect(cx + cw, 0, logW - (cx + cw), logH)
      // Top
      if (cropRect.top > 0) ctx.fillRect(cx, 0, cw, cy)
      // Bottom
      if (cropRect.bottom < height) ctx.fillRect(cx, cy + ch, cw, logH - (cy + ch))

      // Crop frame border
      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.strokeRect(cx, cy, cw, ch)

      // Draw resize handles on edges
      const handleSize = 8
      ctx.fillStyle = '#f59e0b'
      // Left edge handle
      ctx.fillRect(cx - handleSize / 2, cy + ch / 2 - handleSize / 2, handleSize, handleSize)
      // Right edge handle
      ctx.fillRect(cx + cw - handleSize / 2, cy + ch / 2 - handleSize / 2, handleSize, handleSize)
      // Top edge handle
      ctx.fillRect(cx + cw / 2 - handleSize / 2, cy - handleSize / 2, handleSize, handleSize)
      // Bottom edge handle
      ctx.fillRect(cx + cw / 2 - handleSize / 2, cy + ch - handleSize / 2, handleSize, handleSize)
    }
  }, [cells, width, height, CS, mirror, highlightColorCode, selection, hoverCell, showCellCodes, cropRect])

  function cellFromMouse(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const col = Math.floor((e.clientX - rect.left) / CS)
    const row = Math.floor((e.clientY - rect.top) / CS)
    return {
      r: Math.max(0, Math.min(height - 1, row)),
      c: Math.max(0, Math.min(width - 1, col)),
    }
  }

  function getMouseGridCoords(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const col = (e.clientX - rect.left) / CS
    const row = (e.clientY - rect.top) / CS
    return { col, row }
  }

  function detectCropEdge(e: React.MouseEvent<HTMLCanvasElement>): 'left' | 'right' | 'top' | 'bottom' | null {
    if (!cropRect) return null
    const { col, row } = getMouseGridCoords(e)
    const handleThreshold = 0.3

    const isNearLeft = Math.abs(col - cropRect.left) < handleThreshold
    const isNearRight = Math.abs(col - cropRect.right) < handleThreshold
    const isNearTop = Math.abs(row - cropRect.top) < handleThreshold
    const isNearBottom = Math.abs(row - cropRect.bottom) < handleThreshold

    const isInCropV = row >= cropRect.top && row <= cropRect.bottom
    const isInCropH = col >= cropRect.left && col <= cropRect.right

    if (isNearLeft && isInCropV) return 'left'
    if (isNearRight && isInCropV) return 'right'
    if (isNearTop && isInCropH) return 'top'
    if (isNearBottom && isInCropH) return 'bottom'
    return null
  }

  function inSelection(row: number, col: number): boolean {
    if (!selection) return true
    return row >= selection.minRow && row <= selection.maxRow &&
           col >= selection.minCol && col <= selection.maxCol
  }

  const applyTool = useCallback((row: number, col: number) => {
    // Convert visual col to data col
    const dataCol = mirror ? (width - 1 - col) : col
    if (!inSelection(row, col)) return

    const cells = patternData.cells

    if (activeTool === 'eyedropper') {
      const idx = indexMap.current.get(row * width + dataCol)
      if (idx !== undefined && !cells[idx].isTransparent) {
        onColorPick(cells[idx].color)
      }
      return
    }

    if (activeTool === 'brush' && activeColor) {
      onCellsChange(paintCell(cells, row, dataCol, activeColor))
      return
    }

    if (activeTool === 'eraser') {
      onCellsChange(eraseCell(cells, row, dataCol))
      return
    }

    if ((activeTool === 'fill' || activeTool === 'fill-erase') &&
        (activeTool !== 'fill' || activeColor)) {
      const targetColor = activeTool === 'fill' ? activeColor! : null
      onCellsChange(floodFill(cells, width, height, row, dataCol, targetColor, selection ?? undefined))
    }
  }, [patternData.cells, width, height, activeTool, activeColor, mirror, selection, onCellsChange, onColorPick])

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (e.button !== 0) return
    // Space-pan mode: start panning the scroll container
    if (spacePanning) {
      const c = containerRef.current
      if (c) panStart.current = { mx: e.clientX, my: e.clientY, sl: c.scrollLeft, st: c.scrollTop }
      return
    }

    // Detect crop edge drag
    if (cropRect && onCropRectChange) {
      const edge = detectCropEdge(e)
      if (edge) {
        cropDragEdge.current = edge
        cropDragStart.current = { x: e.clientX, y: e.clientY, rect: { ...cropRect } }
        return
      }
    }

    const { r, c } = cellFromMouse(e)
    if (activeTool === 'select') {
      isSelecting.current = true
      selStart.current = { r, c }
      onSelectionChange({ minRow: r, maxRow: r, minCol: c, maxCol: c })
      return
    }
    isPainting.current = true
    applyTool(r, c)
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    // Space-pan mode: scroll the container
    if (spacePanning) {
      if (panStart.current) {
        const c = containerRef.current
        if (c) {
          c.scrollLeft = panStart.current.sl - (e.clientX - panStart.current.mx)
          c.scrollTop  = panStart.current.st - (e.clientY - panStart.current.my)
        }
      }
      return
    }

    // Crop edge drag
    if (cropDragEdge.current && cropDragStart.current && onCropRectChange) {
      const { col, row } = getMouseGridCoords(e)
      const startRect = cropDragStart.current.rect
      const edge = cropDragEdge.current
      const newRect = { ...startRect }

      const snappedCol = Math.round(col)
      const snappedRow = Math.round(row)

      if (edge === 'left') {
        newRect.left = Math.max(0, Math.min(snappedCol, newRect.right - 1))
      } else if (edge === 'right') {
        newRect.right = Math.min(width, Math.max(snappedCol, newRect.left + 1))
      } else if (edge === 'top') {
        newRect.top = Math.max(0, Math.min(snappedRow, newRect.bottom - 1))
      } else if (edge === 'bottom') {
        newRect.bottom = Math.min(height, Math.max(snappedRow, newRect.top + 1))
      }

      onCropRectChange(newRect)
      return
    }

    const { r, c } = cellFromMouse(e)
    setHoverCell({ r, c })

    // Update hovered crop edge for cursor
    if (cropRect && !cropDragEdge.current) {
      const edge = detectCropEdge(e)
      setHoveredCropEdge(edge)
    }

    if (isSelecting.current && selStart.current) {
      const s = selStart.current
      onSelectionChange({
        minRow: Math.min(s.r, r), maxRow: Math.max(s.r, r),
        minCol: Math.min(s.c, c), maxCol: Math.max(s.c, c),
      })
      return
    }

    if (isPainting.current && (activeTool === 'brush' || activeTool === 'eraser')) {
      applyTool(r, c)
    }
  }

  function handleMouseUp() {
    panStart.current = null
    isPainting.current = false
    isSelecting.current = false
    selStart.current = null
    cropDragEdge.current = null
    cropDragStart.current = null
    if (canvasRef.current) {
      canvasRef.current.style.cursor = spacePanning ? 'grab' : TOOL_CURSORS[activeTool]
    }
  }

  let cursor = TOOL_CURSORS[activeTool]
  if (spacePanning) {
    cursor = panStart.current ? 'grabbing' : 'grab'
  } else if (cropDragEdge.current) {
    cursor = (cropDragEdge.current === 'left' || cropDragEdge.current === 'right') ? 'ew-resize' : 'ns-resize'
  } else if (hoveredCropEdge) {
    cursor = (hoveredCropEdge === 'left' || hoveredCropEdge === 'right') ? 'ew-resize' : 'ns-resize'
  }

  return (
    <div ref={containerRef} className="overflow-auto flex-1 bg-gray-100 p-2 rounded-lg" style={{ minHeight: 0 }}>
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: 'pixelated',
          cursor,
          display: 'block',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoverCell(null)
          setHoveredCropEdge(null)
          isPainting.current = false
          isSelecting.current = false
          cropDragEdge.current = null
          cropDragStart.current = null
        }}
      />
    </div>
  )
}
