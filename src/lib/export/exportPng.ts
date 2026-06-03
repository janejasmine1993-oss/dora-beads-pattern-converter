import type { PatternData, PatternCell, ColorStat } from '../../types/pattern'
import type { BrandName } from '../../types/palette'
import { buildFileName } from '../utils/fileName'
import { buildShortCodeMap } from '../utils/stats'
import { getBrightness } from '../utils/color'
import { drawProfessionalTemplate } from './drawPatternTemplate'

export type PngExportMode = 'simple' | 'professional'

// ─── Simple export (legacy) ──────────────────────────────────────────────────

function calcExportCellSize(w: number, h: number): number {
  const m = Math.max(w, h)
  if (m <= 52) return 28
  if (m <= 104) return 20
  if (m <= 200) return 14
  return 10
}

function fillTransparentBg(
  ctx: CanvasRenderingContext2D,
  gridW: number, gridH: number, cs: number
): void {
  for (let row = 0; row < gridH; row++) {
    for (let col = 0; col < gridW; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#f0f0f0' : '#e4e4e4'
      ctx.fillRect(col * cs, row * cs, cs, cs)
    }
  }
}

function drawSimpleCells(ctx: CanvasRenderingContext2D, cells: PatternCell[], cs: number): void {
  for (const cell of cells) {
    if (cell.isTransparent) continue
    ctx.fillStyle = cell.color.hex
    ctx.fillRect(cell.col * cs, cell.row * cs, cs, cs)
  }
}

function drawSimpleGridLines(ctx: CanvasRenderingContext2D, w: number, h: number, cs: number): void {
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'
  ctx.lineWidth = 1
  for (let x = 0; x <= w; x++) {
    ctx.beginPath(); ctx.moveTo(x * cs, 0); ctx.lineTo(x * cs, h * cs); ctx.stroke()
  }
  for (let y = 0; y <= h; y++) {
    ctx.beginPath(); ctx.moveTo(0, y * cs); ctx.lineTo(w * cs, y * cs); ctx.stroke()
  }
}

function drawSimpleLabels(
  ctx: CanvasRenderingContext2D,
  cells: PatternCell[],
  colorStats: ColorStat[],
  cs: number
): void {
  if (cs < 14) return
  const map = buildShortCodeMap(colorStats)
  const fs = Math.max(8, Math.floor(cs * 0.38))
  ctx.font = `bold ${fs}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const cell of cells) {
    if (cell.isTransparent) continue
    const label = map.get(`${cell.color.brand}__${cell.color.code}`) ?? '?'
    const lum = getBrightness(cell.color.rgb[0], cell.color.rgb[1], cell.color.rgb[2])
    ctx.fillStyle = lum > 140 ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.88)'
    ctx.fillText(label, cell.col * cs + cs / 2, cell.row * cs + cs / 2)
  }
}

function triggerDownload(dataUrl: string, fileName: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function exportPatternAsPng(
  patternData: PatternData,
  brand: BrandName,
  mode: PngExportMode = 'professional',
  workTitle = ''
): void {
  const { size, cells, colorStats } = patternData
  const { width, height } = size
  const fileName = buildFileName(brand, width, height, 'png')

  if (mode === 'professional') {
    const canvas = drawProfessionalTemplate({ patternData, brand, workTitle })
    triggerDownload(canvas.toDataURL('image/png'), fileName)
    return
  }

  // Simple mode (legacy grid export)
  const cs = calcExportCellSize(width, height)
  const WM_H = 40
  const cw = width * cs
  const ch = height * cs + WM_H

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, cw, ch)
  fillTransparentBg(ctx, width, height, cs)
  drawSimpleCells(ctx, cells, cs)
  drawSimpleGridLines(ctx, width, height, cs)
  drawSimpleLabels(ctx, cells, colorStats, cs)

  // Watermark strip
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, height * cs, cw, WM_H)
  ctx.strokeStyle = 'rgba(0,0,0,0.10)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, height * cs); ctx.lineTo(cw, height * cs); ctx.stroke()
  const d = new Date().toISOString().slice(0, 10)
  ctx.fillStyle = 'rgba(0,0,0,0.30)'
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.fillText(`${brand} · ${width}×${height} 格 · ${d}`, 14, height * cs + WM_H / 2)
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('哆啦拼豆图纸库', cw - 14, height * cs + WM_H / 2)

  triggerDownload(canvas.toDataURL('image/png'), fileName)
}
