import type { PatternData, PatternCell, ColorStat } from '../../types/pattern'
import type { BrandName } from '../../types/palette'
import { buildFileName } from '../utils/fileName'
import { buildShortCodeMap } from '../utils/stats'
import { getBrightness } from '../utils/color'

export type PngExportMode = 'grid' | 'colorcode'

function calcExportCellSize(w: number, h: number): number {
  const maxDim = Math.max(w, h)
  if (maxDim <= 52) return 30
  if (maxDim <= 104) return 20
  if (maxDim <= 200) return 15
  return 10
}

/** Fill export canvas with a light-gray checkerboard to indicate transparent areas. */
function fillTransparentBackground(
  ctx: CanvasRenderingContext2D,
  gridW: number,
  gridH: number,
  cellSize: number
): void {
  for (let row = 0; row < gridH; row++) {
    for (let col = 0; col < gridW; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#f0f0f0' : '#e4e4e4'
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
    }
  }
}

function drawCells(
  ctx: CanvasRenderingContext2D,
  cells: PatternCell[],
  cellSize: number
): void {
  for (const cell of cells) {
    if (cell.isTransparent) continue
    ctx.fillStyle = cell.color.hex
    ctx.fillRect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize)
  }
}

function drawGridLines(
  ctx: CanvasRenderingContext2D,
  gridW: number,
  gridH: number,
  cellSize: number
): void {
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'
  ctx.lineWidth = 1
  for (let x = 0; x <= gridW; x++) {
    ctx.beginPath()
    ctx.moveTo(x * cellSize, 0)
    ctx.lineTo(x * cellSize, gridH * cellSize)
    ctx.stroke()
  }
  for (let y = 0; y <= gridH; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * cellSize)
    ctx.lineTo(gridW * cellSize, y * cellSize)
    ctx.stroke()
  }
}

function drawColorLabels(
  ctx: CanvasRenderingContext2D,
  cells: PatternCell[],
  colorStats: ColorStat[],
  cellSize: number
): void {
  if (cellSize < 14) return

  const shortCodeMap = buildShortCodeMap(colorStats)
  const fontSize = Math.max(8, Math.floor(cellSize * 0.38))
  ctx.font = `bold ${fontSize}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (const cell of cells) {
    if (cell.isTransparent) continue
    const key = `${cell.color.brand}__${cell.color.code}`
    const label = shortCodeMap.get(key) ?? '?'
    const brightness = getBrightness(cell.color.rgb[0], cell.color.rgb[1], cell.color.rgb[2])
    ctx.fillStyle = brightness > 140 ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.88)'
    ctx.fillText(
      label,
      cell.col * cellSize + cellSize / 2,
      cell.row * cellSize + cellSize / 2
    )
  }
}

const WATERMARK_H = 40

function drawWatermarkStrip(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  stripY: number,
  brand: string,
  gridW: number,
  gridH: number
): void {
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, stripY, canvasWidth, WATERMARK_H)
  ctx.strokeStyle = 'rgba(0,0,0,0.10)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, stripY)
  ctx.lineTo(canvasWidth, stripY)
  ctx.stroke()

  const midY = stripY + WATERMARK_H / 2
  const date = new Date().toISOString().slice(0, 10)

  ctx.fillStyle = 'rgba(0,0,0,0.30)'
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${brand} · ${gridW}×${gridH} 格 · ${date}`, 14, midY)

  ctx.fillStyle = 'rgba(0,0,0,0.40)'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText('哆啦拼豆图纸库', canvasWidth - 14, midY)
}

function triggerDownload(dataUrl: string, fileName: string): void {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function exportPatternAsPng(
  patternData: PatternData,
  brand: BrandName,
  mode: PngExportMode = 'grid'
): void {
  const { size, cells, colorStats } = patternData
  const { width, height } = size
  const cellSize = calcExportCellSize(width, height)

  const canvasW = width * cellSize
  const canvasH = height * cellSize + WATERMARK_H

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false

  // White base for watermark strip area
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Checkerboard background for transparent areas within the grid
  fillTransparentBackground(ctx, width, height, cellSize)

  // Non-transparent cells in palette color
  drawCells(ctx, cells, cellSize)

  // Grid lines
  drawGridLines(ctx, width, height, cellSize)

  // Color code labels (colorcode mode, non-transparent cells only)
  if (mode === 'colorcode') {
    drawColorLabels(ctx, cells, colorStats, cellSize)
  }

  // Watermark strip
  drawWatermarkStrip(ctx, canvasW, height * cellSize, brand, width, height)

  const fileName = buildFileName(brand, width, height, 'png')
  const dataUrl = canvas.toDataURL('image/png')
  triggerDownload(dataUrl, fileName)
}
