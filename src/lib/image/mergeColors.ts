import type { PatternCell } from '../../types/pattern'
import type { PaletteColor } from '../../types/palette'
import { deltaE76 } from '../utils/color'

type LabTriple = [number, number, number]

/**
 * Merge palette colors whose bead count is below `threshold` into the nearest
 * retained color (by Delta-E).  All cell assignments are updated in-place on
 * a new array — the original is not mutated.
 *
 * Rules:
 * - Transparent cells are always skipped.
 * - If ALL colors are below the threshold nothing is merged.
 * - Only one pass (no cascading merges).
 */
export function mergeLowUsageColors(
  cells: PatternCell[],
  labCache: Map<string, LabTriple>,
  threshold: number
): PatternCell[] {
  if (threshold <= 0) return cells

  // Count usage per palette color key
  const usage = new Map<string, { color: PaletteColor; count: number }>()
  for (const cell of cells) {
    if (cell.isTransparent) continue
    const key = colorKey(cell.color)
    if (!usage.has(key)) usage.set(key, { color: cell.color, count: 0 })
    usage.get(key)!.count++
  }

  const keepKeys = new Set<string>()
  const mergeKeys = new Set<string>()
  for (const [key, { count }] of usage) {
    if (count >= threshold) keepKeys.add(key)
    else mergeKeys.add(key)
  }

  // Nothing to merge, or nothing to merge into → return as-is
  if (mergeKeys.size === 0 || keepKeys.size === 0) return cells

  // For each merge color, find nearest keep color by Delta-E
  const mergeTarget = new Map<string, PaletteColor>()
  for (const mergeK of mergeKeys) {
    const mergeColor = usage.get(mergeK)!.color
    const mergeLab = getLabFor(mergeK, mergeColor, labCache)

    let bestKey = ''
    let bestDist = Infinity
    for (const keepK of keepKeys) {
      const keepColor = usage.get(keepK)!.color
      const keepLab = getLabFor(keepK, keepColor, labCache)
      const dist = deltaE76(mergeLab, keepLab)
      if (dist < bestDist) { bestDist = dist; bestKey = keepK }
    }
    mergeTarget.set(mergeK, usage.get(bestKey)!.color)
  }

  // Rebuild cells with merged colors
  return cells.map(cell => {
    if (cell.isTransparent) return cell
    const key = colorKey(cell.color)
    if (!mergeTarget.has(key)) return cell
    return { ...cell, color: mergeTarget.get(key)! }
  })
}

function colorKey(c: PaletteColor): string {
  return `${c.brand}__${c.code}`
}

function getLabFor(
  key: string,
  color: PaletteColor,
  labCache: Map<string, LabTriple>
): LabTriple {
  return labCache.get(key) ?? (color.lab as LabTriple | undefined) ?? [0, 0, 0]
}
