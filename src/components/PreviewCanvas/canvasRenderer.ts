import type { PixelCell, PatternCell, ColorStat } from '../../types/pattern'
import { getBrightness } from '../../lib/utils/color'
import { buildShortCodeMap } from '../../lib/utils/stats'

/** Canvas size (pixels) per bead cell, given pattern dimensions. */
export function calcCellSize(patternW: number, patternH: number): number {
  const MAX_DISPLAY = 520
  return Math.max(2, Math.floor(MAX_DISPLAY / Math.max(patternW, patternH)))
}

/** Light gray used as the "empty/transparent" cell background in previews. */
const TRANSPARENT_BG = '#e8e8e8'

/**
 * Draw checkerboard-style background for the entire canvas.
 * Two alternating light grays clearly indicate "no bead here" areas.
 */
function fillTransparentBackground(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  cellSize: number
): void {
  const colsN = Math.ceil(canvasW / cellSize)
  const rowsN = Math.ceil(canvasH / cellSize)
  for (let row = 0; row < rowsN; row++) {
    for (let col = 0; col < colsN; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#e8e8e8' : '#d8d8d8'
      ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
    }
  }
}

export function drawPixelTab(
  ctx: CanvasRenderingContext2D,
  rawPixels: PixelCell[],
  width: number,
  height: number,
  cellSize: number
): void {
  fillTransparentBackground(ctx, width * cellSize, height * cellSize, cellSize)
  ctx.imageSmoothingEnabled = false
  for (const px of rawPixels) {
    if (px.isTransparent) continue
    ctx.fillStyle = px.hex
    ctx.fillRect(px.x * cellSize, px.y * cellSize, cellSize, cellSize)
  }
}

export function drawGridTab(
  ctx: CanvasRenderingContext2D,
  cells: PatternCell[],
  width: number,
  height: number,
  cellSize: number
): void {
  // Background: checkerboard for transparent areas, filled over by palette colors
  fillTransparentBackground(ctx, width * cellSize, height * cellSize, cellSize)

  // Fill non-transparent cells with matched palette color
  for (const cell of cells) {
    if (cell.isTransparent) continue
    ctx.fillStyle = cell.color.hex
    ctx.fillRect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize)
  }

  // Grid lines over everything
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 0.5
  for (let x = 0; x <= width; x++) {
    ctx.beginPath()
    ctx.moveTo(x * cellSize, 0)
    ctx.lineTo(x * cellSize, height * cellSize)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * cellSize)
    ctx.lineTo(width * cellSize, y * cellSize)
    ctx.stroke()
  }
}

export function drawColorCodeTab(
  ctx: CanvasRenderingContext2D,
  cells: PatternCell[],
  colorStats: ColorStat[],
  width: number,
  height: number,
  cellSize: number
): void {
  drawGridTab(ctx, cells, width, height, cellSize)

  if (cellSize < 10) return

  const shortCodeMap = buildShortCodeMap(colorStats)
  const fontSize = Math.max(6, Math.floor(cellSize * 0.42))
  ctx.font = `bold ${fontSize}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (const cell of cells) {
    if (cell.isTransparent) continue  // no label on transparent cells
    const key = `${cell.color.brand}__${cell.color.code}`
    const label = shortCodeMap.get(key) ?? '?'
    const brightness = getBrightness(cell.color.rgb[0], cell.color.rgb[1], cell.color.rgb[2])
    ctx.fillStyle = brightness > 140 ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)'
    ctx.fillText(
      label,
      cell.col * cellSize + cellSize / 2,
      cell.row * cellSize + cellSize / 2
    )
  }
}

export function drawStatsTab(
  ctx: CanvasRenderingContext2D,
  colorStats: ColorStat[],
  canvasWidth: number,
  _canvasHeight: number
): void {
  if (colorStats.length === 0) return

  const total = colorStats.reduce((s, c) => s + c.count, 0)

  // Top stacked bar (proportional color distribution, non-transparent only)
  const barH = 36
  let x = 0
  for (const stat of colorStats) {
    const w = (stat.count / total) * canvasWidth
    ctx.fillStyle = stat.color.hex
    ctx.fillRect(x, 4, w, barH)
    x += w
  }

  // Color swatch grid
  const shortCodeMap = buildShortCodeMap(colorStats)
  const swatchSize = 28
  const rowH = swatchSize + 32
  const cols = Math.max(1, Math.floor(canvasWidth / 120))
  let row = 0
  let col = 0
  const gridStartY = barH + 16

  ctx.font = '10px monospace'
  ctx.textAlign = 'center'

  for (const stat of colorStats) {
    const sx = col * 120 + 8
    const sy = gridStartY + row * rowH

    ctx.fillStyle = stat.color.hex
    ctx.fillRect(sx, sy, swatchSize, swatchSize)
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'
    ctx.lineWidth = 0.5
    ctx.strokeRect(sx, sy, swatchSize, swatchSize)

    const key = `${stat.color.brand}__${stat.color.code}`
    const shortCode = shortCodeMap.get(key) ?? '?'
    ctx.fillStyle = '#374151'
    ctx.fillText(shortCode, sx + swatchSize / 2, sy + swatchSize + 10)
    ctx.fillStyle = '#6b7280'
    ctx.fillText(`${stat.count}颗`, sx + swatchSize / 2, sy + swatchSize + 22)

    col++
    if (col >= cols) { col = 0; row++ }
  }
}

// Keep export for unused import compatibility
export { TRANSPARENT_BG }
