/** Pixels with alpha below this value are treated as transparent/empty. */
export const TRANSPARENT_ALPHA_THRESHOLD = 32

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败'))
    img.src = src
  })
}

/**
 * Resize source (image or canvas) to exactly targetW×targetH using contain mode:
 * - Preserves original aspect ratio
 * - Centers the content
 * - Areas outside the content remain transparent (alpha=0)
 */
export function resizeWithContain(
  source: HTMLCanvasElement | HTMLImageElement,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  const srcW = source instanceof HTMLImageElement ? source.naturalWidth : source.width
  const srcH = source instanceof HTMLImageElement ? source.naturalHeight : source.height

  const scale = Math.min(targetW / srcW, targetH / srcH)
  const drawW = Math.round(srcW * scale)
  const drawH = Math.round(srcH * scale)
  const offsetX = Math.floor((targetW - drawW) / 2)
  const offsetY = Math.floor((targetH - drawH) / 2)

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  // No background fill — transparent areas keep alpha=0 so isTransparent detection works
  ctx.drawImage(source, 0, 0, srcW, srcH, offsetX, offsetY, drawW, drawH)
  return canvas
}
