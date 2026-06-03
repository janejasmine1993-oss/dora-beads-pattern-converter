import { useEffect, useState } from 'react'
import { UploadPanel } from './components/UploadPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { ColorControlPanel } from './components/ColorControlPanel'
import { PreviewCanvas } from './components/PreviewCanvas'
import { PalettePanel } from './components/PalettePanel'
import { StatsPanel } from './components/StatsPanel'
import { ExportPanel } from './components/ExportPanel'
import type { BrandName } from './types/palette'
import type { PatternCell, PatternData, PixelCell } from './types/pattern'
import { TRANSPARENT_COLOR } from './types/pattern'
import { loadImage, resizeWithContain } from './lib/image/resize'
import { cropTransparentBorder } from './lib/image/crop'
import { extractPixels } from './lib/image/pixelate'
import { buildLabCache, matchColor } from './lib/image/paletteMatch'
import { quantizeColors } from './lib/image/quantize'
import { mergeLowUsageColors } from './lib/image/mergeColors'
import { computeColorStats } from './lib/utils/stats'
import { getPalette } from './data/palettes'
import './index.css'

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [workTitle, setWorkTitle] = useState('')
  const [mirror, setMirror] = useState(false)
  const [width, setWidth] = useState(52)
  const [height, setHeight] = useState(52)
  const [brand, setBrand] = useState<BrandName>('MARD')
  const [maxColors, setMaxColors] = useState(20)
  const [mergeThreshold, setMergeThreshold] = useState(5)
  const [rawPixels, setRawPixels] = useState<PixelCell[] | null>(null)
  const [patternData, setPatternData] = useState<PatternData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (rawPixels && rawPixels.length > 0) {
      runRematch(rawPixels, brand, width, height)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxColors, mergeThreshold])

  function handleImageLoad(url: string, file: File) {
    setImageUrl(url)
    setWorkTitle(file.name.replace(/\.[^.]+$/, ''))
    setRawPixels(null)
    setPatternData(null)
    setErrorMsg(null)
  }

  function handleSizeChange(w: number, h: number) {
    setWidth(w)
    setHeight(h)
    setRawPixels(null)
    setPatternData(null)
  }

  function handleBrandChange(newBrand: BrandName) {
    setBrand(newBrand)
    if (rawPixels && rawPixels.length > 0) {
      runRematch(rawPixels, newBrand, width, height)
    }
  }

  function handleMaxColorsChange(n: number) {
    setMaxColors(n)
  }

  function handleMergeThresholdChange(n: number) {
    setMergeThreshold(n)
  }

  function runRematch(
    pixels: PixelCell[],
    targetBrand: BrandName,
    w: number,
    h: number
  ) {
    const palette = getPalette(targetBrand)
    const labCache = buildLabCache(palette)

    const nonTransparent = pixels.filter(px => !px.isTransparent)
    const transparentCount = pixels.length - nonTransparent.length

    const ntRgb = nonTransparent.map(px => [px.r, px.g, px.b] as [number, number, number])
    const clusters = ntRgb.length > 0 ? quantizeColors(ntRgb, maxColors) : []

    const clusterCache = new Map<string, ReturnType<typeof matchColor>>()
    for (const c of clusters) {
      const key = c.join(',')
      if (!clusterCache.has(key)) {
        clusterCache.set(key, matchColor(c[0], c[1], c[2], palette, labCache))
      }
    }

    let ntIdx = 0
    let cells: PatternCell[] = pixels.map(px => {
      if (px.isTransparent) {
        return { row: px.y, col: px.x, isTransparent: true, color: TRANSPARENT_COLOR }
      }
      const cluster = clusters[ntIdx++]
      const color = clusterCache.get(cluster.join(','))!
      return { row: px.y, col: px.x, isTransparent: false, color }
    })

    if (mergeThreshold > 0) {
      cells = mergeLowUsageColors(cells, labCache, mergeThreshold)
    }

    const colorStats = computeColorStats(cells)
    const beadCount = cells.filter(c => !c.isTransparent).length

    setPatternData({
      size: { width: w, height: h },
      cells,
      rawPixels: pixels,
      colorStats,
      beadCount,
      transparentCount,
    })
  }

  async function generatePattern() {
    if (!imageUrl) { setErrorMsg('请先上传图片'); return }
    if (width < 1 || height < 1 || width > 500 || height > 500) {
      setErrorMsg('请输入有效的宽高（1–500）'); return
    }

    setErrorMsg(null)
    setIsGenerating(true)
    setPatternData(null)

    try {
      const img = await loadImage(imageUrl)
      const cropped = cropTransparentBorder(img)
      const canvas = resizeWithContain(cropped, width, height)
      const pixels = extractPixels(canvas)
      setRawPixels(pixels)
      runRematch(pixels, brand, width, height)
    } catch (err) {
      setErrorMsg('图片处理失败，请重试')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
          豆
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900 leading-none">哆啦拼豆图纸转换器</h1>
          <p className="text-xs text-gray-400 mt-0.5">哆啦拼豆图纸库</p>
        </div>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">v0.3.4</span>
      </header>

      {errorMsg && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-600 flex items-center justify-between shrink-0">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Upload + Title + Size + Color settings */}
        <aside className="w-64 shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-4">
          <UploadPanel onImageLoad={handleImageLoad} />
          <SettingsPanel
            width={width}
            height={height}
            onSizeChange={handleSizeChange}
            onGenerate={generatePattern}
            isGenerating={isGenerating}
            canGenerate={!!imageUrl}
            workTitle={workTitle}
            onWorkTitleChange={setWorkTitle}
          />
          <ColorControlPanel
            maxColors={maxColors}
            mergeThreshold={mergeThreshold}
            onMaxColorsChange={handleMaxColorsChange}
            onMergeThresholdChange={handleMergeThresholdChange}
          />
        </aside>

        {/* Center: Preview */}
        <main className="flex-1 overflow-hidden p-4">
          <div className="bg-white rounded-xl border border-gray-200 h-full p-4 flex flex-col">
            <PreviewCanvas
              imageUrl={imageUrl}
              patternData={patternData}
              width={width}
              height={height}
              mirror={mirror}
            />
          </div>
        </main>

        {/* Right: Brand + Stats + Export */}
        <aside className="w-64 shrink-0 bg-white border-l border-gray-200 overflow-y-auto p-4">
          <PalettePanel selectedBrand={brand} onBrandChange={handleBrandChange} />
          <StatsPanel
            brand={brand}
            width={width}
            height={height}
            patternData={patternData}
            workTitle={workTitle}
            mirror={mirror}
          />
          <ExportPanel
            brand={brand}
            patternData={patternData}
            workTitle={workTitle}
            mirror={mirror}
            onMirrorChange={setMirror}
          />
        </aside>
      </div>
    </div>
  )
}

export default App
