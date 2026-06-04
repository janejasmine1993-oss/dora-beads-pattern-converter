import type { PatternCell } from '../../types/pattern'
import type { PaletteColor } from '../../types/palette'
import { TRANSPARENT_COLOR } from '../../types/pattern'
import type { SelectionRect } from './types'

function inSel(c: PatternCell, sel?: SelectionRect): boolean {
  if (!sel) return true
  return c.row >= sel.minRow && c.row <= sel.maxRow &&
         c.col >= sel.minCol && c.col <= sel.maxCol
}

/** Paint a single cell (data coordinates) with a color. */
export function paintCell(
  cells: PatternCell[],
  row: number,
  col: number,
  color: PaletteColor
): PatternCell[] {
  return cells.map(c => c.row === row && c.col === col
    ? { ...c, isTransparent: false, color }
    : c
  )
}

/** Erase a single cell (data coordinates) to transparent. */
export function eraseCell(
  cells: PatternCell[],
  row: number,
  col: number
): PatternCell[] {
  return cells.map(c => c.row === row && c.col === col
    ? { ...c, isTransparent: true, color: TRANSPARENT_COLOR }
    : c
  )
}

/** Replace all cells with fromCode with toColor (optionally within selection). */
export function replaceColor(
  cells: PatternCell[],
  fromCode: string,
  toColor: PaletteColor,
  sel?: SelectionRect
): PatternCell[] {
  return cells.map(c => {
    if (c.isTransparent || c.color.code !== fromCode) return c
    if (!inSel(c, sel)) return c
    return { ...c, color: toColor }
  })
}

/** Delete all cells with the given color code (optionally within selection). */
export function deleteColor(
  cells: PatternCell[],
  code: string,
  sel?: SelectionRect
): PatternCell[] {
  return cells.map(c => {
    if (c.isTransparent || c.color.code !== code) return c
    if (!inSel(c, sel)) return c
    return { ...c, isTransparent: true, color: TRANSPARENT_COLOR }
  })
}

/**
 * Add a 1-cell-wide outline around the non-transparent body.
 * Fills adjacent transparent cells with outlineColor.
 */
export function outlineBody(
  cells: PatternCell[],
  width: number,
  _height: number,
  outlineColor: PaletteColor
): PatternCell[] {
  const solidKeys = new Set<number>()
  for (const c of cells) {
    if (!c.isTransparent) solidKeys.add(c.row * width + c.col)
  }

  const borderKeys = new Set<number>()
  for (const c of cells) {
    if (!c.isTransparent) continue
    const neighbors = [
      (c.row - 1) * width + c.col,
      (c.row + 1) * width + c.col,
      c.row * width + (c.col - 1),
      c.row * width + (c.col + 1),
    ]
    if (neighbors.some(k => solidKeys.has(k))) {
      borderKeys.add(c.row * width + c.col)
    }
  }

  return cells.map(c => {
    if (!borderKeys.has(c.row * width + c.col)) return c
    return { ...c, isTransparent: false, color: outlineColor }
  })
}
