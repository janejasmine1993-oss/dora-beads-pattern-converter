import type { PatternData, PatternCell } from '../../types/pattern'
import { BEAD_SIZE_MM } from '../../types/pattern'

// ─── Brand series names ───────────────────────────────────────────────────────
const BRAND_SERIES: Record<string, string> = {
  'MARD': 'Mard221',
  'COCO': 'COCO',
  '漫漫': '漫漫',
  '盼盼': '盼盼',
  '咪小窝': '咪小窝',
}

// ─── Typography ───────────────────────────────────────────────────────────────
const FF = '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif'
const FF_MONO = '"SF Mono", Menlo, Consolas, "Courier New", monospace'

// ─── Wine-red palette (rulers + outer border) ─────────────────────────────────
const WINE = '#8A1538'
const WINE_BG = '#fff0f2'
const WINE_BORDER = 'rgba(138,21,56,0.28)'

// ─── Layout constants ─────────────────────────────────────────────────────────
const MH = 18       // horizontal margin
const MV = 14       // vertical margin
const RW = 42       // ruler width (row labels)
const RH = 28       // ruler height (col labels)
const TITLE_H = 56
const LEGEND_ENTRY_W = 155
const LEGEND_ENTRY_H = 46
const LEGEND_HDR_H = 20
const LEGEND_PAD_V = 8
const STATS_H = 72
const WM_H = 30

export interface TemplateOptions {
  patternData: PatternData
  brand: string
  workTitle: string
  mirror?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cellSize(w: number, h: number): number {
  const m = Math.max(w, h)
  if (m <= 32) return 28
  if (m <= 52) return 22
  if (m <= 78) return 18
  if (m <= 104) return 15
  if (m <= 128) return 12
  return 10
}

function rulerStep(n: number): number {
  if (n <= 50) return 5
  if (n <= 100) return 10
  return 20
}

function physCm(n: number): string {
  return ((n * BEAD_SIZE_MM) / 10).toFixed(1)
}

function calcBodyRange(cells: PatternCell[]): { bodyW: number; bodyH: number } | null {
  let minCol = Infinity, maxCol = -1, minRow = Infinity, maxRow = -1, hasNT = false
  for (const c of cells) {
    if (c.isTransparent) continue
    hasNT = true
    if (c.col < minCol) minCol = c.col
    if (c.col > maxCol) maxCol = c.col
    if (c.row < minRow) minRow = c.row
    if (c.row > maxRow) maxRow = c.row
  }
  if (!hasNT) return null
  return { bodyW: maxCol - minCol + 1, bodyH: maxRow - minRow + 1 }
}

function labelColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lum = 0.299 * r + 0.587 * g + 0.114 * b
  return lum > 155 ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.88)'
}

function drawHLine(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  color = 'rgba(0,0,0,0.10)', lw = 0.5
): void {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = lw
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke()
  ctx.restore()
}

function drawVLine(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, h: number,
  color = 'rgba(0,0,0,0.10)', lw = 0.5
): void {
  ctx.save()
  ctx.strokeStyle = color; ctx.lineWidth = lw
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.stroke()
  ctx.restore()
}

// ─── Main export function ─────────────────────────────────────────────────────

/**
 * Render a full professional pattern sheet to an off-screen canvas.
 * When mirror=true, cell positions are horizontally flipped.
 * All text (brand, title, rulers, legend, watermark) remains readable — never mirrored.
 */
export function drawProfessionalTemplate(opts: TemplateOptions): HTMLCanvasElement {
  const { patternData, brand, workTitle, mirror = false } = opts
  const { size, cells, colorStats } = patternData
  const { width, height } = size

  const CS = cellSize(width, height)
  const gridW = width * CS
  const gridH = height * CS
  const seriesName = BRAND_SERIES[brand] ?? brand
  const bodyRange = calcBodyRange(cells)
  const displayTitle = `${workTitle || '未命名图纸'}${mirror ? ' [镜像]' : ''}`

  // ── Canvas dimensions ──────────────────────────────────────────────────────
  const canvasW = MH * 2 + RW * 2 + gridW
  const legendCols = Math.max(1, Math.floor((canvasW - MH * 2) / LEGEND_ENTRY_W))
  const legendRows = colorStats.length > 0 ? Math.ceil(colorStats.length / legendCols) : 0
  const legendH = legendRows > 0
    ? LEGEND_HDR_H + LEGEND_PAD_V + legendRows * LEGEND_ENTRY_H + LEGEND_PAD_V
    : 0
  const canvasH = MV * 2 + TITLE_H + RH + gridH + RH + legendH + STATS_H + WM_H

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  // Fast cell lookup by (row * width + col)
  const cellLookup = new Map<number, PatternCell>()
  for (const cell of cells) cellLookup.set(cell.row * width + cell.col, cell)

  const gridX = MH + RW
  const gridY = MV + TITLE_H + RH

  // ── 1. White background ────────────────────────────────────────────────────
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // ── 2. Title bar ───────────────────────────────────────────────────────────
  const ty = MV
  ctx.fillStyle = '#f0f4ff'
  ctx.fillRect(0, ty, canvasW, TITLE_H)
  drawHLine(ctx, 0, ty + TITLE_H, canvasW, '#c7d2fe', 1.5)

  // Left: "哆啦拼豆图纸" (fixed brand, line 1) + series name (line 2)
  ctx.fillStyle = '#3730a3'
  ctx.font = `bold 16px ${FF}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('哆啦拼豆图纸', gridX, ty + TITLE_H * 0.35)

  ctx.fillStyle = '#6366f1'
  ctx.font = `12px ${FF}`
  ctx.fillText(seriesName, gridX, ty + TITLE_H * 0.72)

  // Right: work title with mirror label (line 1) + dimension hint (line 2)
  ctx.fillStyle = '#111827'
  ctx.font = `bold 18px ${FF}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  // Truncate long titles to prevent overflow
  const maxTitleW = canvasW - gridX * 2 - 120
  let titleText = displayTitle
  ctx.font = `bold 18px ${FF}`
  while (ctx.measureText(titleText).width > maxTitleW && titleText.length > 4) {
    titleText = titleText.slice(0, -2) + '…'
  }
  ctx.fillText(titleText, canvasW - gridX, ty + TITLE_H * 0.35)

  ctx.fillStyle = '#6b7280'
  ctx.font = `11px ${FF}`
  ctx.textAlign = 'right'
  const dimHint = bodyRange
    ? `图纸 ${width}×${height} · 主体 ${bodyRange.bodyW}×${bodyRange.bodyH}`
    : `图纸 ${width}×${height} 格`
  ctx.fillText(dimHint, canvasW - gridX, ty + TITLE_H * 0.72)

  // ── 3. Fill cells (mirror: visual col reads from mirrored source col) ──────
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const srcCol = mirror ? (width - 1 - col) : col
      const cell = cellLookup.get(row * width + srcCol)
      const x = gridX + col * CS
      const y = gridY + row * CS
      ctx.fillStyle = (!cell || cell.isTransparent)
        ? ((row + col) % 2 === 0 ? '#ededed' : '#e2e2e2')
        : cell.color.hex
      ctx.fillRect(x, y, CS, CS)
    }
  }

  // ── 4. Grid lines ──────────────────────────────────────────────────────────
  // Fine lines: every cell (subtle)
  for (let x = 0; x <= width; x++)  drawVLine(ctx, gridX + x * CS, gridY, gridH, 'rgba(0,0,0,0.10)', 0.5)
  for (let y = 0; y <= height; y++) drawHLine(ctx, gridX, gridY + y * CS, gridW, 'rgba(0,0,0,0.10)', 0.5)

  // Major lines: every 10 cells (darker, slightly thicker — clear zone marker)
  for (let x = 10; x < width; x += 10)  drawVLine(ctx, gridX + x * CS, gridY, gridH, 'rgba(80,8,8,0.36)', 1.8)
  for (let y = 10; y < height; y += 10) drawHLine(ctx, gridX, gridY + y * CS, gridW, 'rgba(80,8,8,0.36)', 1.8)

  // Board section lines: every 26 cells (blue guide)
  for (let x = 26; x < width; x += 26)  drawVLine(ctx, gridX + x * CS, gridY, gridH, 'rgba(70,100,230,0.45)', 1.8)
  for (let y = 26; y < height; y += 26) drawHLine(ctx, gridX, gridY + y * CS, gridW, 'rgba(70,100,230,0.45)', 1.8)

  // ── 5. Color labels — text always readable (mirrored position, normal text) ─
  if (CS >= 10) {
    const codeLen = colorStats.length > 0
      ? Math.max(...colorStats.map(s => s.color.code.length))
      : 3
    const fs = Math.max(5, Math.floor(CS * (codeLen >= 3 ? 0.34 : 0.40)))
    ctx.font = `bold ${fs}px ${FF_MONO}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (const cell of cells) {
      if (cell.isTransparent) continue
      // Visual column: mirrored when mirror=true; text drawn in normal direction
      const drawCol = mirror ? (width - 1 - cell.col) : cell.col
      ctx.fillStyle = labelColor(cell.color.hex)
      ctx.fillText(
        cell.color.code,
        gridX + drawCol * CS + CS / 2,
        gridY + cell.row * CS + CS / 2
      )
    }
  }

  // ── 6. Grid outer border (wine red, most prominent) ────────────────────────
  ctx.strokeStyle = WINE
  ctx.lineWidth = 2
  ctx.strokeRect(gridX, gridY, gridW, gridH)

  // ── 7. Rulers (all 4 sides, wine red palette) ─────────────────────────────
  const rulerFontSize = Math.min(10, Math.max(7, CS - 3))
  const rulerFont = `${rulerFontSize}px ${FF}`
  const colStep = rulerStep(width)
  const rowStep = rulerStep(height)

  function drawRuler(
    bx: number, by: number, bw: number, bh: number,
    axis: 'col' | 'row', count: number, step: number
  ) {
    ctx.fillStyle = WINE_BG
    ctx.fillRect(bx, by, bw, bh)
    ctx.strokeStyle = WINE_BORDER
    ctx.lineWidth = 0.6
    ctx.strokeRect(bx, by, bw, bh)

    ctx.fillStyle = WINE
    ctx.font = rulerFont
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let i = 1; i <= count; i++) {
      const isMajor = i % 10 === 0 || i === 1 || i === count
      if (!isMajor && i % step !== 0) continue
      if (axis === 'col') {
        const cx = bx + (i - 0.5) * CS
        if (cx < bx || cx > bx + bw) continue
        ctx.font = isMajor ? `bold ${rulerFontSize}px ${FF}` : rulerFont
        ctx.fillText(String(i), cx, by + bh / 2)
      } else {
        const cy = by + (i - 0.5) * CS
        if (cy < by || cy > by + bh) continue
        ctx.font = isMajor ? `bold ${rulerFontSize}px ${FF}` : rulerFont
        ctx.fillText(String(i), bx + bw / 2, cy)
      }
    }
  }

  const topRulerY = MV + TITLE_H
  drawRuler(gridX, topRulerY, gridW, RH, 'col', width, colStep)
  drawRuler(gridX, gridY + gridH, gridW, RH, 'col', width, colStep)
  drawRuler(MH, gridY, RW, gridH, 'row', height, rowStep)
  drawRuler(gridX + gridW, gridY, RW, gridH, 'row', height, rowStep)

  // ── 8. Legend (real brand codes + counts) ─────────────────────────────────
  if (legendRows > 0) {
    const lgY = gridY + gridH + RH

    ctx.fillStyle = '#374151'
    ctx.font = `bold 12px ${FF}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(`色号图例（${brand} · ${colorStats.length} 色）`, MH + RW, lgY + LEGEND_HDR_H / 2)
    drawHLine(ctx, MH + RW, lgY + LEGEND_HDR_H, canvasW - MH * 2 - RW, '#e5e7eb', 0.5)

    const lgStartY = lgY + LEGEND_HDR_H + LEGEND_PAD_V

    colorStats.forEach((stat, i) => {
      const col = i % legendCols
      const row = Math.floor(i / legendCols)
      const lx = MH + RW + col * LEGEND_ENTRY_W
      const ly = lgStartY + row * LEGEND_ENTRY_H

      const swH = 24, swW = 24

      // Color swatch
      ctx.fillStyle = stat.color.hex
      ctx.fillRect(lx, ly + (LEGEND_ENTRY_H - swH) / 2, swW, swH)
      ctx.strokeStyle = 'rgba(0,0,0,0.20)'
      ctx.lineWidth = 0.5
      ctx.strokeRect(lx, ly + (LEGEND_ENTRY_H - swH) / 2, swW, swH)

      // Real brand code
      ctx.fillStyle = '#111827'
      ctx.font = `bold 11px ${FF_MONO}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(stat.color.code, lx + swW + 6, ly + 4)

      // Color name (show only if different from code)
      const hasName = stat.color.name && stat.color.name !== stat.color.code
      if (hasName) {
        ctx.fillStyle = '#6b7280'
        ctx.font = `9px ${FF}`
        ctx.fillText(stat.color.name, lx + swW + 6, ly + 18)
      }

      // Usage counts (right-aligned)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#1f2937'
      ctx.font = `bold 10px ${FF}`
      ctx.fillText(`${stat.count}颗`, lx + LEGEND_ENTRY_W - 2, ly + 4)

      ctx.fillStyle = '#6b7280'
      ctx.font = `9px ${FF}`
      ctx.fillText(`建议${stat.countWithLoss}·${stat.grams}g`, lx + LEGEND_ENTRY_W - 2, ly + 18)
    })
  }

  // ── 9. Stats bar (2 rows) ──────────────────────────────────────────────────
  const statsY = gridY + gridH + RH + legendH
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, statsY, canvasW, STATS_H)
  drawHLine(ctx, 0, statsY, canvasW, '#e2e8f0', 1)
  drawHLine(ctx, 0, statsY + STATS_H, canvasW, '#e2e8f0', 0.5)

  const beads = patternData.beadCount
  const date = new Date().toISOString().slice(0, 10)
  const mirrorLabel = mirror ? ' [镜像]' : ''

  const row1Items = [
    `品牌：${brand}（${seriesName}）${mirrorLabel}`,
    `颜色：${colorStats.length} 种`,
    `实际用豆：${beads.toLocaleString()} 颗`,
    `含5%损耗：${Math.ceil(beads * 1.05).toLocaleString()} 颗`,
  ]
  const row2Items = [
    `图纸尺寸：${width} 列 × ${height} 行`,
    bodyRange ? `主体范围：${bodyRange.bodyW} 列 × ${bodyRange.bodyH} 行` : `主体：全画布`,
    `成品约：${physCm(width)} × ${physCm(height)} cm`,
    `生成日期：${date}`,
  ]

  const segW = (canvasW - MH * 2) / 4
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'

  row1Items.forEach((item, i) => {
    ctx.fillStyle = i < 2 ? '#374151' : '#1f2937'
    ctx.font = i < 2 ? `11px ${FF}` : `bold 11px ${FF}`
    ctx.fillText(item, MH + i * segW, statsY + STATS_H * 0.28)
  })
  row2Items.forEach((item, i) => {
    ctx.fillStyle = '#6b7280'
    ctx.font = `10px ${FF}`
    ctx.fillText(item, MH + i * segW, statsY + STATS_H * 0.72)
  })

  // ── 10. Watermark strip ────────────────────────────────────────────────────
  const wmY = statsY + STATS_H
  ctx.fillStyle = '#fff0f2'
  ctx.fillRect(0, wmY, canvasW, WM_H)
  drawHLine(ctx, 0, wmY, canvasW, WINE_BORDER, 0.5)

  ctx.fillStyle = `${WINE}88`
  ctx.font = `11px ${FF}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(`哆啦拼豆图纸 · ${date}`, canvasW - MH, wmY + WM_H / 2)

  return canvas
}
