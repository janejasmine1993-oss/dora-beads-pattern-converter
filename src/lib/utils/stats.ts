import type { PatternCell, ColorStat } from '../../types/pattern'
import type { PaletteColor } from '../../types/palette'

/** Compute per-color usage statistics, skipping transparent cells. */
export function computeColorStats(cells: PatternCell[]): ColorStat[] {
  const countMap = new Map<string, { color: PaletteColor; count: number }>()

  for (const cell of cells) {
    if (cell.isTransparent) continue  // transparent cells have no bead
    const key = `${cell.color.brand}__${cell.color.code}`
    if (!countMap.has(key)) {
      countMap.set(key, { color: cell.color, count: 0 })
    }
    countMap.get(key)!.count++
  }

  return Array.from(countMap.values())
    .map(({ color, count }) => {
      const countWithLoss = Math.ceil(count * 1.05)
      return { color, count, countWithLoss, grams: Math.ceil(countWithLoss / 100) }
    })
    .sort((a, b) => b.count - a.count)
}

/** Map each color stat to a short display label like A1, A2 … B1, B2 … */
export function buildShortCodeMap(colorStats: ColorStat[]): Map<string, string> {
  const map = new Map<string, string>()
  colorStats.forEach((stat, i) => {
    const letter = String.fromCharCode(65 + Math.floor(i / 9))
    const num = (i % 9) + 1
    map.set(`${stat.color.brand}__${stat.color.code}`, `${letter}${num}`)
  })
  return map
}
