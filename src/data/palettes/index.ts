import type { PaletteColor, BrandName } from '../../types/palette'
import mard from './mard.json'
import coco from './coco.json'
import manman from './manman.json'
import panpan from './panpan.json'
import mixiaowo from './mixiaowo.json'

// TODO: Replace with verified real brand color data from authoritative sources.
// See docs/05_PALETTE_DATA_SPEC.md for search keywords and GitHub project references.

const PALETTES: Record<BrandName, PaletteColor[]> = {
  'MARD': mard as PaletteColor[],
  'COCO': coco as PaletteColor[],
  '漫漫': manman as PaletteColor[],
  '盼盼': panpan as PaletteColor[],
  '咪小窝': mixiaowo as PaletteColor[],
}

export function getPalette(brand: BrandName): PaletteColor[] {
  return PALETTES[brand]
}
