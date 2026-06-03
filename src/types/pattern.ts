import type { PaletteColor } from './palette'

export interface PatternSize {
  width: number
  height: number
}

export interface PixelCell {
  x: number
  y: number
  r: number
  g: number
  b: number
  a: number
  hex: string
}

export interface PatternCell {
  row: number
  col: number
  color: PaletteColor
}

export interface ColorStat {
  color: PaletteColor
  count: number
  countWithLoss: number
  grams: number
}

export interface PatternData {
  size: PatternSize
  cells: PatternCell[]
  rawPixels: PixelCell[]
  colorStats: ColorStat[]
}

export type PreviewTab = 'original' | 'pixel' | 'grid' | 'colorcode' | 'stats'

export const PREVIEW_TABS: { key: PreviewTab; label: string }[] = [
  { key: 'original', label: '原图' },
  { key: 'pixel', label: '像素图' },
  { key: 'grid', label: '格子图' },
  { key: 'colorcode', label: '色号图' },
  { key: 'stats', label: '统计图' },
]

export const PRESET_SIZES: PatternSize[] = [
  { width: 32, height: 32 },
  { width: 48, height: 48 },
  { width: 52, height: 52 },
  { width: 78, height: 78 },
  { width: 104, height: 104 },
  { width: 128, height: 128 },
]

export const BEAD_SIZE_MM = 2.6
