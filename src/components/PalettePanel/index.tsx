import { BRAND_NAMES, type BrandName } from '../../types/palette'

interface PalettePanelProps {
  selectedBrand: BrandName
  onBrandChange: (brand: BrandName) => void
}

export function PalettePanel({ selectedBrand, onBrandChange }: PalettePanelProps) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">品牌色卡</p>
      <div className="flex flex-wrap gap-1">
        {BRAND_NAMES.map((brand) => (
          <button
            key={brand}
            onClick={() => onBrandChange(brand)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              selectedBrand === brand
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>
    </div>
  )
}
