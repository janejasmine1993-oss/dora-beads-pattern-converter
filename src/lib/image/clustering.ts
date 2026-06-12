import type { PaletteColor } from '../../types/palette'
import { rgbToLab, deltaE76 } from '../utils/color'

export interface ColorCluster {
  center: [number, number, number] // RGB
  members: [number, number, number][] // Original RGB values
  brandColor?: PaletteColor
}

/**
 * Simple K-means clustering for palette reduction.
 * Returns array mapping original colors to cluster centers.
 */
export function clusterColors(
  colors: [number, number, number][],
  k: number
): { centers: [number, number, number][]; assignments: number[] } {
  if (colors.length === 0) return { centers: [], assignments: [] }
  if (k >= colors.length) return { centers: colors.slice(), assignments: colors.map((_, i) => i) }

  // Initialize: pick k random colors as initial centers
  const centers: [number, number, number][] = []
  const used = new Set<number>()
  while (centers.length < k) {
    const idx = Math.floor(Math.random() * colors.length)
    if (!used.has(idx)) {
      centers.push([...colors[idx]])
      used.add(idx)
    }
  }

  // K-means iterations (3 iterations enough for this use)
  for (let iter = 0; iter < 3; iter++) {
    const clusters: [number, number, number][][] = centers.map(() => [])

    // Assign each color to nearest center
    for (const color of colors) {
      let bestIdx = 0
      let bestDist = Infinity
      for (let i = 0; i < centers.length; i++) {
        const dist =
          (color[0] - centers[i][0]) ** 2 +
          (color[1] - centers[i][1]) ** 2 +
          (color[2] - centers[i][2]) ** 2
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = i
        }
      }
      clusters[bestIdx].push(color)
    }

    // Update centers
    for (let i = 0; i < centers.length; i++) {
      if (clusters[i].length === 0) continue
      const sum = clusters[i].reduce(([r, g, b], col) => [r + col[0], g + col[1], b + col[2]], [0, 0, 0])
      centers[i] = [Math.round(sum[0] / clusters[i].length), Math.round(sum[1] / clusters[i].length), Math.round(sum[2] / clusters[i].length)]
    }
  }

  // Final assignment
  const assignments: number[] = []
  for (const color of colors) {
    let bestIdx = 0
    let bestDist = Infinity
    for (let i = 0; i < centers.length; i++) {
      const dist =
        (color[0] - centers[i][0]) ** 2 +
        (color[1] - centers[i][1]) ** 2 +
        (color[2] - centers[i][2]) ** 2
      if (dist < bestDist) {
        bestDist = dist
        bestIdx = i
      }
    }
    assignments.push(bestIdx)
  }

  return { centers, assignments }
}

/**
 * Check if a color is a key facial detail color that should be protected
 */
export function isKeyFacialColor(r: number, g: number, b: number): boolean {
  // Deep colors: black, dark brown, dark red, dark skin tone
  const lum = 0.299 * r + 0.587 * g + 0.114 * b

  if (lum < 80) return true // Very dark colors (eyes, mouth, eyebrows, shadows)

  // Deep reds (lips, cheeks)
  if (r > 100 && r > g + 30 && r > b + 30 && lum < 120) return true

  // Deep browns (skin shadows, hair)
  if (r > 60 && r > g && g > b && lum < 100) return true

  return false
}

/**
 * Check if a pixel should be kept despite low frequency
 */
export function shouldPreservePixel(r: number, g: number, b: number, neighborColors: [number, number, number][]): boolean {
  // Always preserve key facial colors
  if (isKeyFacialColor(r, g, b)) return true

  // If surrounded by very different colors, might be important detail
  const pixelLab = rgbToLab(r, g, b)
  let minDelta = Infinity
  for (const [nr, ng, nb] of neighborColors) {
    const neighborLab = rgbToLab(nr, ng, nb)
    const delta = deltaE76(pixelLab, neighborLab)
    minDelta = Math.min(minDelta, delta)
  }

  // If quite different from neighbors, preserve
  if (minDelta > 20) return true

  return false
}
