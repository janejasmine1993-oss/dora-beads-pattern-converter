/**
 * True sampling strategies for image-to-pattern conversion.
 * Not relying on browser drawImage interpolation.
 */

export type SamplingMode = 'average' | 'center'

export interface PixelData {
  r: number
  g: number
  b: number
  a: number
}

/**
 * Average sampling: compute mean RGB for each target cell's source region
 */
export function sampleImageAverage(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): PixelData[] {
  const srcW = sourceCanvas.width
  const srcH = sourceCanvas.height
  const ctx = sourceCanvas.getContext('2d')!
  const srcImageData = ctx.getImageData(0, 0, srcW, srcH)
  const srcPixels = srcImageData.data

  const result: PixelData[] = []

  for (let ty = 0; ty < targetHeight; ty++) {
    for (let tx = 0; tx < targetWidth; tx++) {
      // Map target cell to source region
      const sx1 = Math.floor((tx * srcW) / targetWidth)
      const sy1 = Math.floor((ty * srcH) / targetHeight)
      const sx2 = Math.floor(((tx + 1) * srcW) / targetWidth)
      const sy2 = Math.floor(((ty + 1) * srcH) / targetHeight)

      let sumR = 0, sumG = 0, sumB = 0, sumA = 0, count = 0

      for (let y = sy1; y < sy2; y++) {
        for (let x = sx1; x < sx2; x++) {
          const idx = (y * srcW + x) * 4
          sumR += srcPixels[idx]
          sumG += srcPixels[idx + 1]
          sumB += srcPixels[idx + 2]
          sumA += srcPixels[idx + 3]
          count++
        }
      }

      result.push({
        r: Math.round(sumR / count),
        g: Math.round(sumG / count),
        b: Math.round(sumB / count),
        a: Math.round(sumA / count),
      })
    }
  }

  return result
}

/**
 * Center sampling: take center point or center region color
 */
export function sampleImageCenter(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): PixelData[] {
  const srcW = sourceCanvas.width
  const srcH = sourceCanvas.height
  const ctx = sourceCanvas.getContext('2d')!
  const srcImageData = ctx.getImageData(0, 0, srcW, srcH)
  const srcPixels = srcImageData.data

  const result: PixelData[] = []

  for (let ty = 0; ty < targetHeight; ty++) {
    for (let tx = 0; tx < targetWidth; tx++) {
      // Map target cell to source region
      const sx1 = Math.floor((tx * srcW) / targetWidth)
      const sy1 = Math.floor((ty * srcH) / targetHeight)
      const sx2 = Math.floor(((tx + 1) * srcW) / targetWidth)
      const sy2 = Math.floor(((ty + 1) * srcH) / targetHeight)

      // Take center point
      const cx = Math.floor((sx1 + sx2) / 2)
      const cy = Math.floor((sy1 + sy2) / 2)
      const idx = (cy * srcW + cx) * 4

      result.push({
        r: srcPixels[idx],
        g: srcPixels[idx + 1],
        b: srcPixels[idx + 2],
        a: srcPixels[idx + 3],
      })
    }
  }

  return result
}

/**
 * Apply sampling and convert to array of RGB values
 */
export function applySampling(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  mode: SamplingMode
): PixelData[] {
  if (mode === 'center') {
    return sampleImageCenter(sourceCanvas, targetWidth, targetHeight)
  } else {
    return sampleImageAverage(sourceCanvas, targetWidth, targetHeight)
  }
}
