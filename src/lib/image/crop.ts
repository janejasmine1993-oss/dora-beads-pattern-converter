import { TRANSPARENT_ALPHA_THRESHOLD } from './resize'

/**
 * Auto-crop transparent border from an image.
 * Finds the bounding box of non-transparent pixels, adds a small safety
 * margin, then returns a canvas cropped to that region.
 *
 * If the image has no transparent pixels (e.g. a JPEG), returns the original
 * image drawn to a canvas without any cropping.
 */
export function cropTransparentBorder(
  img: HTMLImageElement,
  threshold = TRANSPARENT_ALPHA_THRESHOLD
): HTMLCanvasElement {
  const w = img.naturalWidth
  const h = img.naturalHeight

  // Draw to temp canvas for pixel inspection
  const temp = document.createElement('canvas')
  temp.width = w
  temp.height = h
  const tempCtx = temp.getContext('2d')!
  tempCtx.drawImage(img, 0, 0)

  const { data } = tempCtx.getImageData(0, 0, w, h)

  // Check whether image even has transparent pixels
  let hasTransparency = false
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) { hasTransparency = true; break }
  }

  // No transparency (e.g. JPEG) → return as-is
  if (!hasTransparency) return temp

  // Find bounding box of non-transparent pixels
  let minX = w, maxX = 0, minY = h, maxY = 0
  let hasContent = false

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3]
      if (alpha >= threshold) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        hasContent = true
      }
    }
  }

  // Entire image is transparent — return original
  if (!hasContent) return temp

  // Safety margin: 5% of content dimensions, minimum 2px
  const contentW = maxX - minX + 1
  const contentH = maxY - minY + 1
  const mx = Math.max(2, Math.round(contentW * 0.05))
  const my = Math.max(2, Math.round(contentH * 0.05))

  const cropX = Math.max(0, minX - mx)
  const cropY = Math.max(0, minY - my)
  const cropW = Math.min(w, maxX + mx + 1) - cropX
  const cropH = Math.min(h, maxY + my + 1) - cropY

  const result = document.createElement('canvas')
  result.width = cropW
  result.height = cropH
  const rCtx = result.getContext('2d')!
  rCtx.drawImage(temp, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
  return result
}
