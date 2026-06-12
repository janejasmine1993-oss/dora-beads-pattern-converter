import type { PixelCell, PixelDesignGrid } from '../../types/pattern'
import { loadImage } from './resize'
import { cropTransparentBorder } from './crop'
import { applySampling } from './sampling'
import { clusterColors } from './clustering'
import { TRANSPARENT_ALPHA_THRESHOLD } from './resize'

/**
 * Generate a pixel design grid from an image.
 * This is the intermediate "pixel art design draft" before brand color mapping.
 */
export async function generatePixelDesignGrid(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number,
  maxColors: number,
  portraitEnhance: boolean = false
): Promise<PixelDesignGrid> {
  const img = await loadImage(imageUrl)
  const cropped = cropTransparentBorder(img)

  // Get original dimensions for metadata
  const srcW = cropped instanceof HTMLImageElement ? cropped.naturalWidth : cropped.width
  const srcH = cropped instanceof HTMLImageElement ? cropped.naturalHeight : cropped.height

  // Resize to target grid size using nearest-neighbor for crisp pixels
  const targetCanvas = document.createElement('canvas')
  targetCanvas.width = targetWidth
  targetCanvas.height = targetHeight
  const ctx = targetCanvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(cropped, 0, 0, srcW, srcH, 0, 0, targetWidth, targetHeight)

  // Apply portrait enhancement if enabled
  if (portraitEnhance) {
    applyPortraitEnhancementInPlace(targetCanvas)
  }

  // Sample pixels from resized canvas
  const rawPixels = applySampling(targetCanvas, targetWidth, targetHeight, 'center')

  // Convert to PixelCell format
  const pixelCells: PixelCell[] = rawPixels.map((px, idx) => {
    const row = Math.floor(idx / targetWidth)
    const col = idx % targetWidth
    const isTransparent = px.a < TRANSPARENT_ALPHA_THRESHOLD
    return {
      x: col,
      y: row,
      r: px.r,
      g: px.g,
      b: px.b,
      a: px.a,
      hex: `#${px.r.toString(16).padStart(2, '0')}${px.g.toString(16).padStart(2, '0')}${px.b.toString(16).padStart(2, '0')}`,
      isTransparent
    }
  })

  // Color quantization using clustering
  const nonTransparent = pixelCells.filter(px => !px.isTransparent)
  if (nonTransparent.length > 0) {
    const uniqueRgbs = Array.from(new Set(
      nonTransparent.map(px => `${px.r},${px.g},${px.b}`)
    )).map(key => {
      const [r, g, b] = key.split(',').map(Number) as [number, number, number]
      return [r, g, b] as [number, number, number]
    })

    // Cluster colors
    const clusterK = Math.min(maxColors, Math.max(2, uniqueRgbs.length))
    const { centers, assignments } = clusterColors(uniqueRgbs, clusterK)

    // Map each pixel to its cluster center
    const rgbToClusterIdx = new Map<string, number>()
    for (let i = 0; i < uniqueRgbs.length; i++) {
      const [r, g, b] = uniqueRgbs[i]
      rgbToClusterIdx.set(`${r},${g},${b}`, assignments[i])
    }

    // Replace pixels with cluster center colors
    for (const cell of pixelCells) {
      if (!cell.isTransparent) {
        const key = `${cell.r},${cell.g},${cell.b}`
        const clusterIdx = rgbToClusterIdx.get(key) || 0
        const [cr, cg, cb] = centers[clusterIdx]
        cell.r = cr
        cell.g = cg
        cell.b = cb
        cell.hex = `#${cr.toString(16).padStart(2, '0')}${cg.toString(16).padStart(2, '0')}${cb.toString(16).padStart(2, '0')}`
      }
    }
  }

  return {
    width: targetWidth,
    height: targetHeight,
    pixels: pixelCells,
    metadata: {
      sourceImageSize: { w: srcW, h: srcH },
      downscaleFactor: Math.max(srcW / targetWidth, srcH / targetHeight),
      timestamp: Date.now()
    }
  }
}

/**
 * Apply light sharpening and contrast boost directly to canvas
 */
function applyPortraitEnhancementInPlace(canvas: HTMLCanvasElement): void {
  const w = canvas.width, h = canvas.height
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  const tempData = new Uint8ClampedArray(data)
  const sharpKernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1]

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4

      let r = 0, g = 0, b = 0
      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const nidx = ((y - 1 + ky) * w + (x - 1 + kx)) * 4
          const weight = sharpKernel[ky * 3 + kx]
          r += tempData[nidx] * weight
          g += tempData[nidx + 1] * weight
          b += tempData[nidx + 2] * weight
        }
      }

      const boost = 0.3
      data[idx] = Math.max(0, Math.min(255, tempData[idx] + (r - tempData[idx]) * boost))
      data[idx + 1] = Math.max(0, Math.min(255, tempData[idx + 1] + (g - tempData[idx + 1]) * boost))
      data[idx + 2] = Math.max(0, Math.min(255, tempData[idx + 2] + (b - tempData[idx + 2]) * boost))
    }
  }

  const contrastFactor = 1.15
  const contrastCenter = 128
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, contrastCenter + (data[i] - contrastCenter) * contrastFactor))
    data[i + 1] = Math.max(0, Math.min(255, contrastCenter + (data[i + 1] - contrastCenter) * contrastFactor))
    data[i + 2] = Math.max(0, Math.min(255, contrastCenter + (data[i + 2] - contrastCenter) * contrastFactor))
  }

  ctx.putImageData(imageData, 0, 0)
}
