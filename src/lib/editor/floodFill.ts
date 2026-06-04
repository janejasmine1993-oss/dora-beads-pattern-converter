import type { PatternCell } from '../../types/pattern'
import type { PaletteColor } from '../../types/palette'
import { TRANSPARENT_COLOR } from '../../types/pattern'
import type { SelectionRect } from './types'

/**
 * BFS flood fill on the pattern cell grid.
 * Fills connected cells that share the same color code as the start cell.
 * targetColor=null fills with transparent (delete mode).
 */
export function floodFill(
  cells: PatternCell[],
  width: number,
  height: number,
  startRow: number,
  startCol: number,
  targetColor: PaletteColor | null,
  selection?: SelectionRect
): PatternCell[] {
  if (startRow < 0 || startRow >= height || startCol < 0 || startCol >= width) return cells

  // Build index map: grid key -> cells array index
  const indexMap = new Map<number, number>()
  for (let i = 0; i < cells.length; i++) {
    indexMap.set(cells[i].row * width + cells[i].col, i)
  }

  const startIdx = indexMap.get(startRow * width + startCol)
  if (startIdx === undefined) return cells

  const startCell = cells[startIdx]
  const startCode = startCell.isTransparent ? null : startCell.color.code

  const visited = new Set<number>()
  const toFill: number[] = []
  const queue: number[] = [startRow * width + startCol]

  while (queue.length > 0) {
    const key = queue.shift()!
    if (visited.has(key)) continue
    visited.add(key)

    const row = Math.floor(key / width)
    const col = key % width

    if (row < 0 || row >= height || col < 0 || col >= width) continue

    if (selection) {
      if (row < selection.minRow || row > selection.maxRow ||
          col < selection.minCol || col > selection.maxCol) continue
    }

    const idx = indexMap.get(key)
    if (idx === undefined) continue
    const cell = cells[idx]
    const code = cell.isTransparent ? null : cell.color.code
    if (code !== startCode) continue

    toFill.push(idx)

    queue.push(
      (row - 1) * width + col,
      (row + 1) * width + col,
      row * width + (col - 1),
      row * width + (col + 1),
    )
  }

  if (toFill.length === 0) return cells

  const fillSet = new Set(toFill)
  return cells.map((c, i) => {
    if (!fillSet.has(i)) return c
    if (targetColor === null) return { ...c, isTransparent: true, color: TRANSPARENT_COLOR }
    return { ...c, isTransparent: false, color: targetColor }
  })
}
