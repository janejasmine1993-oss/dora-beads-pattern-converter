import type { PixelCell } from '../../types/pattern'

/**
 * Extract per-pixel RGBA data from a canvas into a flat PixelCell array.
 * Pixels are ordered row by row (y outer, x inner).
 */
export function extractPixels(canvas: HTMLCanvasElement): PixelCell[] {
  const ctx = canvas.getContext('2d')!
  const { width, height } = canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels: PixelCell[] = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const r = imageData.data[i]
      const g = imageData.data[i + 1]
      const b = imageData.data[i + 2]
      const a = imageData.data[i + 3]
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      pixels.push({ x, y, r, g, b, a, hex })
    }
  }
  return pixels
}
