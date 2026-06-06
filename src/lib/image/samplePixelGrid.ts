import type { PixelCell } from '../../types/pattern'

export interface GridSampleParams {
  imageUrl: string
  gridCols: number
  gridRows: number
  cellSizePx: number
  offsetX: number
  offsetY: number
  sampleMode: 'center' | 'average3x3'
}

export async function samplePixelGrid(params: GridSampleParams): Promise<PixelCell[]> {
  const { imageUrl, gridCols, gridRows, cellSizePx, offsetX, offsetY, sampleMode } = params

  const img = await loadImageForSampling(imageUrl)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const pixels: PixelCell[] = []

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const cellX = offsetX + col * cellSizePx
      const cellY = offsetY + row * cellSizePx

      const rgba = sampleCellColor(
        data,
        canvas.width,
        canvas.height,
        cellX,
        cellY,
        cellSizePx,
        sampleMode
      )

      const hex = rgbToHex(rgba[0], rgba[1], rgba[2])
      pixels.push({
        x: col,
        y: row,
        r: rgba[0],
        g: rgba[1],
        b: rgba[2],
        a: rgba[3],
        hex,
        isTransparent: rgba[3] < 32,
      })
    }
  }

  return pixels
}

function sampleCellColor(
  data: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  cellX: number,
  cellY: number,
  cellSize: number,
  mode: 'center' | 'average3x3'
): [number, number, number, number] {
  if (mode === 'center') {
    const cx = Math.floor(cellX + cellSize / 2)
    const cy = Math.floor(cellY + cellSize / 2)
    return getPixel(data, imgWidth, imgHeight, cx, cy)
  } else {
    // average3x3
    const cx = Math.floor(cellX + cellSize / 2)
    const cy = Math.floor(cellY + cellSize / 2)

    let sumR = 0, sumG = 0, sumB = 0, sumA = 0, count = 0
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const [r, g, b, a] = getPixel(data, imgWidth, imgHeight, cx + dx, cy + dy)
        sumR += r
        sumG += g
        sumB += b
        sumA += a
        count++
      }
    }
    return [
      Math.round(sumR / count),
      Math.round(sumG / count),
      Math.round(sumB / count),
      Math.round(sumA / count),
    ]
  }
}

function getPixel(
  data: Uint8ClampedArray,
  imgWidth: number,
  imgHeight: number,
  x: number,
  y: number
): [number, number, number, number] {
  // Clamp to image bounds
  x = Math.max(0, Math.min(imgWidth - 1, x))
  y = Math.max(0, Math.min(imgHeight - 1, y))

  const idx = (Math.floor(y) * imgWidth + Math.floor(x)) * 4
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
}

function loadImageForSampling(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}
