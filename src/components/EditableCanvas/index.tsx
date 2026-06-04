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
  showCellCodes?: boolean   // show/hide color code labels on cells
  onCellsChange: (cells: PatternCell[]) => void
  onColorPick: (color: PaletteColor) => void
  onSelectionChange: (sel: SelectionRect | null) => void
}

function calcBaseCS(w: number, h: number) {
  return Math.max(8, Math.min(20, Math.floor(520 / Math.max(w, h))))
}

export function EditableCanvas({
  patternData, activeTool, activeColor, highlightColorCode,
  selection, mirror, zoom, showCellCodes = true,
  onCellsChange, onColorPick, onSelectionChange,
}: EditableCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoverCell, setHoverCell] = useState<{ r: number; c: number } | null>(null)
  const isPainting = useRef(false)
  const isSelecting = useRef(false)
  const selStart = useRef<{ r: number; c: number } | null>(null)

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
  }, [cells, width, height, CS, mirror, highlightColorCode, selection, hoverCell, showCellCodes])

  function cellFromMouse(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const col = Math.floor((e.clientX - rect.left) / CS)
    const row = Math.floor((e.clientY - rect.top) / CS)
    return {
      r: Math.max(0, Math.min(height - 1, row)),
      c: Math.max(0, Math.min(width - 1, col)),
    }
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
    const { r, c } = cellFromMouse(e)
    setHoverCell({ r, c })

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
    isPainting.current = false
    isSelecting.current = false
    selStart.current = null
  }

  return (
    <div className="overflow-auto flex-1 bg-gray-100 p-2 rounded-lg" style={{ minHeight: 0 }}>
      <canvas
        ref={canvasRef}
        style={{
          imageRendering: 'pixelated',
          cursor: TOOL_CURSORS[activeTool],
          display: 'block',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setHoverCell(null)
          isPainting.current = false
          isSelecting.current = false
        }}
      />
    </div>
  )
}
