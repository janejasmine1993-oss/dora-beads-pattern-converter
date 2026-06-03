import type { PatternData, PatternCell } from '../../types/pattern'
import { BEAD_SIZE_MM } from '../../types/pattern'
import { buildShortCodeMap } from '../utils/stats'

// ─── Layout constants ────────────────────────────────────────────────────────
const MH = 16      // horizontal margin
const MV = 12      // vertical margin
const RW = 38      // ruler width  (row numbers, left & right)
const RH = 26      // ruler height (col numbers, top & bottom)
const TITLE_H = 48
const LEGEND_ENTRY_W = 132
const LEGEND_ENTRY_H = 42
const LEGEND_PAD_V = 14
const STATS_H = 54
const WM_H = 28     // watermark strip height

export interface TemplateOptions {
  patternData: PatternData
  brand: string
  workTitle: string
}

/** Pick export cell size based on pattern dimensions. */
function cellSize(w: number, h: number): number {
  const m = Math.max(w, h)
  if (m <= 32) return 28
  if (m <= 52) return 22
  if (m <= 78) return 18
  if (m <= 104) return 15
  if (m <= 128) return 12
  return 10
}

/** Ruler label interval – show every N-th line number. */
function rulerStep(n: number): number {
  if (n <= 50) return 5
  if (n <= 100) return 10
  return 20
}

function physCm(n: number): string {
  return ((n * BEAD_SIZE_MM) / 10).toFixed(1)
}

/**
 * Draw a full professional pattern sheet and return the off-screen canvas.
 * Never touches the DOM preview canvas.
 */
export function drawProfessionalTemplate(opts: TemplateOptions): HTMLCanvasElement {
  const { patternData, brand, workTitle } = opts
  const { size, cells, colorStats } = patternData
  const { width, height } = size

  const CS = cellSize(width, height)
  const gridW = width * CS
  const gridH = height * CS

  const shortCodeMap = buildShortCodeMap(colorStats)

  // Legend layout
  const innerW = MH * 2 + RW * 2 + gridW
  const legendCols = Math.max(1, Math.floor((innerW - MH * 2) / LEGEND_ENTRY_W))
  const legendRows = colorStats.length > 0 ? Math.ceil(colorStats.length / legendCols) : 0
  const legendH = legendRows > 0 ? LEGEND_PAD_V * 2 + legendRows * LEGEND_ENTRY_H : 0

  const canvasW = innerW
  const canvasH = MV * 2 + TITLE_H + RH + gridH + RH + legendH + STATS_H + WM_H

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  // Pre-build a fast cell lookup: linear index → PatternCell
  const cellLookup = new Map<number, PatternCell>()
  for (const cell of cells) cellLookup.set(cell.row * width + cell.col, cell)

  // Anchor positions
  const gridX = MH + RW
  const gridY = MV + TITLE_H + RH

  // ── 1. White background ──────────────────────────────────────────────────
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // ── 2. Title bar ─────────────────────────────────────────────────────────
  const ty = MV
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, ty, canvasW, TITLE_H)
  drawHLine(ctx, 0, ty + TITLE_H, canvasW, '#e2e8f0', 1)

  const midY = ty + TITLE_H / 2

  // Brand label
  ctx.fillStyle = '#4f46e5'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(brand, gridX, midY)

  // Work title
  ctx.fillStyle = '#111827'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(workTitle || '未命名图纸', canvasW - gridX, midY)

  // Dimensions (center)
  ctx.fillStyle = '#6b7280'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(
    `${width} × ${height} 格 · ${physCm(width)} × ${physCm(height)} cm`,
    canvasW / 2, midY
  )

  // ── 3. Draw all cells ────────────────────────────────────────────────────
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const cell = cellLookup.get(row * width + col)
      const x = gridX + col * CS
      const y = gridY + row * CS
      if (!cell || cell.isTransparent) {
        ctx.fillStyle = (row + col) % 2 === 0 ? '#ebebeb' : '#dfdfdf'
      } else {
        ctx.fillStyle = cell.color.hex
      }
      ctx.fillRect(x, y, CS, CS)
    }
  }

  // ── 4. Grid lines ────────────────────────────────────────────────────────
  // Thin lines every cell
  ctx.strokeStyle = 'rgba(0,0,0,0.09)'
  ctx.lineWidth = 0.5
  for (let x = 0; x <= width; x++) {
    drawVLine(ctx, gridX + x * CS, gridY, gridH, undefined, undefined)
  }
  for (let y = 0; y <= height; y++) {
    drawHLine(ctx, gridX, gridY + y * CS, gridW, undefined, undefined)
  }

  // Medium lines every 10 cells
  ctx.strokeStyle = 'rgba(0,0,0,0.20)'
  ctx.lineWidth = 0.8
  for (let x = 10; x < width; x += 10) drawVLine(ctx, gridX + x * CS, gridY, gridH, undefined, undefined)
  for (let y = 10; y < height; y += 10) drawHLine(ctx, gridX, gridY + y * CS, gridW, undefined, undefined)

  // Section lines every 26 cells (pegboard boundary)
  ctx.strokeStyle = 'rgba(66, 99, 220, 0.40)'
  ctx.lineWidth = 1.5
  for (let x = 26; x < width; x += 26) drawVLine(ctx, gridX + x * CS, gridY, gridH, undefined, undefined)
  for (let y = 26; y < height; y += 26) drawHLine(ctx, gridX, gridY + y * CS, gridW, undefined, undefined)

  // ── 5. Color labels in cells ─────────────────────────────────────────────
  if (CS >= 11) {
    const fs = Math.max(7, Math.floor(CS * 0.38))
    ctx.font = `bold ${fs}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const cell of cells) {
      if (cell.isTransparent) continue
      const key = `${cell.color.brand}__${cell.color.code}`
      const label = shortCodeMap.get(key) ?? '?'
      const [r, g, b] = cell.color.rgb
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      ctx.fillStyle = lum > 155 ? 'rgba(0,0,0,0.68)' : 'rgba(255,255,255,0.82)'
      ctx.fillText(
        label,
        gridX + cell.col * CS + CS / 2,
        gridY + cell.row * CS + CS / 2
      )
    }
  }

  // ── 6. Grid outer border ─────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(0,0,0,0.32)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(gridX, gridY, gridW, gridH)

  // ── 7. Rulers ────────────────────────────────────────────────────────────
  const rulerFont = `${Math.min(10, Math.max(7, CS - 3))}px sans-serif`
  const colStep = rulerStep(width)
  const rowStep = rulerStep(height)

  // Top ruler
  drawRulerBg(ctx, gridX, MV + TITLE_H, gridW, RH)
  ctx.fillStyle = '#9ca3af'
  ctx.font = rulerFont
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let c = 1; c <= width; c++) {
    if (c === 1 || c % colStep === 0 || c === width) {
      ctx.fillText(String(c), gridX + (c - 0.5) * CS, MV + TITLE_H + RH / 2)
    }
  }

  // Bottom ruler
  const botRulerY = gridY + gridH
  drawRulerBg(ctx, gridX, botRulerY, gridW, RH)
  ctx.fillStyle = '#9ca3af'
  ctx.font = rulerFont
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let c = 1; c <= width; c++) {
    if (c === 1 || c % colStep === 0 || c === width) {
      ctx.fillText(String(c), gridX + (c - 0.5) * CS, botRulerY + RH / 2)
    }
  }

  // Left ruler
  drawRulerBg(ctx, MH, gridY, RW, gridH)
  ctx.fillStyle = '#9ca3af'
  ctx.font = rulerFont
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let r = 1; r <= height; r++) {
    if (r === 1 || r % rowStep === 0 || r === height) {
      ctx.fillText(String(r), MH + RW / 2, gridY + (r - 0.5) * CS)
    }
  }

  // Right ruler
  drawRulerBg(ctx, gridX + gridW, gridY, RW, gridH)
  ctx.fillStyle = '#9ca3af'
  ctx.font = rulerFont
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let r = 1; r <= height; r++) {
    if (r === 1 || r % rowStep === 0 || r === height) {
      ctx.fillText(String(r), gridX + gridW + RW / 2, gridY + (r - 0.5) * CS)
    }
  }

  // ── 8. Legend ────────────────────────────────────────────────────────────
  if (legendRows > 0) {
    const lgBase = gridY + gridH + RH

    // Section label
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('色号图例', MH + RW, lgBase + 4)

    const lgStartY = lgBase + LEGEND_PAD_V

    colorStats.forEach((stat, i) => {
      const col = i % legendCols
      const row = Math.floor(i / legendCols)
      const lx = MH + RW + col * LEGEND_ENTRY_W
      const ly = lgStartY + row * LEGEND_ENTRY_H

      const key = `${stat.color.brand}__${stat.color.code}`
      const sc = shortCodeMap.get(key) ?? '?'

      // Swatch
      ctx.fillStyle = stat.color.hex
      ctx.fillRect(lx, ly + 2, 22, 22)
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'
      ctx.lineWidth = 0.5
      ctx.strokeRect(lx, ly + 2, 22, 22)

      // Short code
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 10px monospace'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(sc, lx + 26, ly + 2)

      // Brand code
      ctx.fillStyle = '#6b7280'
      ctx.font = '9px sans-serif'
      ctx.fillText(stat.color.code, lx + 26, ly + 14)

      // Usage (right-aligned in entry)
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'top'
      ctx.fillText(`${stat.countWithLoss}颗`, lx + LEGEND_ENTRY_W - 2, ly + 2)

      ctx.fillStyle = '#9ca3af'
      ctx.font = '9px sans-serif'
      ctx.fillText(`${stat.grams}g`, lx + LEGEND_ENTRY_W - 2, ly + 14)
    })
  }

  // ── 9. Stats bar ─────────────────────────────────────────────────────────
  const statsY = gridY + gridH + RH + legendH
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, statsY, canvasW, STATS_H)
  drawHLine(ctx, 0, statsY, canvasW, '#e2e8f0', 1)

  const beads = patternData.beadCount
  const statsItems = [
    `品牌：${brand}`,
    `颜色：${colorStats.length} 种`,
    `用豆：${beads.toLocaleString()} 颗`,
    `备货（含5%）：${Math.ceil(beads * 1.05).toLocaleString()} 颗`,
    `图纸：${width} × ${height} 格`,
    `成品：${physCm(width)} × ${physCm(height)} cm`,
  ]

  const segW = (canvasW - MH * 2) / statsItems.length
  ctx.fillStyle = '#374151'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  statsItems.forEach((item, i) => {
    ctx.fillText(item, MH + i * segW, statsY + STATS_H / 2)
  })

  // ── 10. Watermark strip ──────────────────────────────────────────────────
  const wmY = statsY + STATS_H
  ctx.fillStyle = '#f1f5f9'
  ctx.fillRect(0, wmY, canvasW, WM_H)
  drawHLine(ctx, 0, wmY, canvasW, '#e2e8f0', 0.5)

  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  const date = new Date().toISOString().slice(0, 10)
  ctx.fillText(`哆啦拼豆图纸库 · ${date}`, canvasW - MH, wmY + WM_H / 2)

  return canvas
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function drawHLine(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  color = 'rgba(0,0,0,0.09)',
  lw = 0.5
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lw
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + w, y)
  ctx.stroke()
  ctx.restore()
}

function drawVLine(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, h: number,
  color = 'rgba(0,0,0,0.09)',
  lw = 0.5
) {
  ctx.save()
  ctx.strokeStyle = color ?? 'rgba(0,0,0,0.09)'
  ctx.lineWidth = lw ?? 0.5
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y + h)
  ctx.stroke()
  ctx.restore()
}

function drawRulerBg(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number
) {
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(x, y, w, h)
}
