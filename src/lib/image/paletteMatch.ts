import type { PaletteColor } from '../../types/palette'
import { rgbToLab, deltaE76 } from '../utils/color'

type LabTriple = [number, number, number]

/**
 * Pre-compute Lab values for all palette colors.
 * Uses pre-computed lab from the palette data when available (faster),
 * otherwise falls back to runtime RGB→Lab conversion.
 */
export function buildLabCache(palette: PaletteColor[]): Map<string, LabTriple> {
  const cache = new Map<string, LabTriple>()
  for (const color of palette) {
    const key = `${color.brand}__${color.code}`
    if (color.lab) {
      cache.set(key, color.lab as LabTriple)
    } else {
      cache.set(key, rgbToLab(color.rgb[0], color.rgb[1], color.rgb[2]))
    }
  }
  return cache
}

/**
 * Match a single pixel RGB to the closest palette color using Delta-E 76
 * (CIE 1976 Lab color difference formula).
 * Transparent pixels must NOT be passed to this function.
 */
export function matchColor(
  r: number,
  g: number,
  b: number,
  palette: PaletteColor[],
  labCache: Map<string, LabTriple>
): PaletteColor {
  const pixelLab = rgbToLab(r, g, b)
  let best = palette[0]
  let bestDist = Infinity

  for (const color of palette) {
    const colorLab = labCache.get(`${color.brand}__${color.code}`)!
    const dist = deltaE76(pixelLab, colorLab)
    if (dist < bestDist) {
      bestDist = dist
      best = color
    }
  }
  return best
}
