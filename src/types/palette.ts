export interface PaletteColor {
  brand: string
  code: string
  name: string
  hex: string
  rgb: [number, number, number]
}

export type BrandName = 'MARD' | 'COCO' | '漫漫' | '盼盼' | '咪小窝'

export const BRAND_NAMES: BrandName[] = ['MARD', 'COCO', '漫漫', '盼盼', '咪小窝']
