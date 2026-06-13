import { useEffect, useRef, useState, useCallback } from 'react'
import { modeThemes } from './config/modeThemes'
import { UploadPanel } from './components/UploadPanel'
import { SettingsPanel } from './components/SettingsPanel'
import { ColorControlPanel } from './components/ColorControlPanel'
import { PreviewCanvas } from './components/PreviewCanvas'
import { EditableCanvas } from './components/EditableCanvas'
import { EditorToolbar } from './components/EditorToolbar'
import { QuickPalette } from './components/QuickPalette'
import { PalettePanel } from './components/PalettePanel'
import { StatsPanel } from './components/StatsPanel'
import { ExportPanel } from './components/ExportPanel'
import { CropModal } from './components/CropModal'
import { BackgroundRemovalPanel } from './components/BackgroundRemovalPanel'
import { PixelGridImportPanel } from './components/PixelGridImportPanel'
import { ExistingPatternImportPanel } from './components/ExistingPatternImportPanel'
import { AppHeader } from './components/AppHeader'
import { HomePage } from './components/HomePage'
import { ComingSoonModal } from './components/ComingSoonModal'
import { UserCenter } from './components/UserCenter'
import { AiOptimizePage } from './components/AiOptimizePage'
import type { BrandName, PaletteColor } from './types/palette'
import type { PatternCell, PatternData, PixelCell } from './types/pattern'

type ImportMode = 'photo-direct' | 'ai-enhanced' | 'pixel-grid' | 'existing-pattern'
type AppPage = 'home' | 'workspace' | 'ai-optimize'
// Size limits for different modes
const MAX_PATTERN_SIDE_BASE = 500
const MAX_PATTERN_SIDE_HIGH_FIDELITY = 1000

type ComingSoonFeature = 'works' | 'membership' | 'redeem' | 'help' | 'login' | null
import { TRANSPARENT_COLOR, type PixelDesignGrid } from './types/pattern'
import { loadImage, resizeWithContain } from './lib/image/resize'
import { cropTransparentBorder } from './lib/image/crop'
import { samplePixelGrid } from './lib/image/samplePixelGrid'
import { buildLabCache, matchColor } from './lib/image/paletteMatch'
import { mergeLowUsageColors } from './lib/image/mergeColors'
import { clusterColors, isKeyFacialColor } from './lib/image/clustering'
import { applySampling, type SamplingMode } from './lib/image/sampling'
import { generatePixelDesignGrid } from './lib/image/pixelDesign'
import { computeColorStats } from './lib/utils/stats'
import { getPalette } from './data/palettes'
import { transformImage, type ImageTransformOp } from './lib/image/transform'
import { replaceColor, deleteColor } from './lib/editor/operations'
import {
  historyCreate, historyPush, historyUndo, historyRedo,
  canUndo, canRedo, type CellHistory,
} from './lib/editor/history'
import type { EditorTool, SelectionRect } from './lib/editor/types'
import './index.css'

function App() {
  // ── App page routing ─────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState<AppPage>('home')
  const [comingSoonFeature, setComingSoonFeature] = useState<ComingSoonFeature>(null)
  const [isUserCenterOpen, setIsUserCenterOpen] = useState(false)
  const [authReturnPage, setAuthReturnPage] = useState<AppPage | null>(null)

  // ── Import mode ──────────────────────────────────────────────────────────────
  const [importMode, setImportMode] = useState<ImportMode>('photo-direct')

  // ── Image ───────────────────────────────────────────────────────────────────
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [workTitle, setWorkTitle] = useState('')
  const [showCropModal, setShowCropModal] = useState(false)

  // ── Pattern generation ──────────────────────────────────────────────────────
  const [width, setWidth] = useState(52)
  const [height, setHeight] = useState(52)
  const [sizeMode, setSizeMode] = useState<'preset' | 'custom' | 'originalRatio'>('preset')
  const [ratioLongSide, setRatioLongSide] = useState(104)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [brand, setBrand] = useState<BrandName>('MARD')
  const [colorMatchMode, setColorMatchMode] = useState<'standard' | 'originalColorPriority'>('standard')
  const [samplingMode, setSamplingMode] = useState<SamplingMode>('average')
  const [portraitEnhance, setPortraitEnhance] = useState(false)
  const [maxColors, setMaxColors] = useState(20)
  const [mergeThreshold, setMergeThreshold] = useState(5)
  const [highFidelityPixelMode, setHighFidelityPixelMode] = useState(false)
  const [pixelDesignGrid, setPixelDesignGrid] = useState<PixelDesignGrid | null>(null)
  const [rawPixels, setRawPixels] = useState<PixelCell[] | null>(null)
  const [patternData, setPatternData] = useState<PatternData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [autoSelectPixelTab, setAutoSelectPixelTab] = useState(false)

  // ── Edit mode ───────────────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false)
  const [activeTool, setActiveTool] = useState<EditorTool>('brush')
  // Paint color (brush) — distinct from source color being replaced
  const [activeColor, setActiveColor] = useState<PaletteColor | null>(null)
  // Source color selected by eyedropper / "替换颜色…" menu — waiting for replacement target
  const [pickedSourceColor, setPickedSourceColor] = useState<PaletteColor | null>(null)
  // Replace confirmation dialog state
  const [replaceConfirm, setReplaceConfirm] = useState<{ from: PaletteColor; to: PaletteColor } | null>(null)
  const [highlightColorCode, setHighlightColorCode] = useState<string | null>(null)
  const [selection, setSelection] = useState<SelectionRect | null>(null)
  const [fillThreshold, setFillThreshold] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [mirror, setMirror] = useState(false)
  const [cellHistory, setCellHistory] = useState<CellHistory | null>(null)
  const [showCellCodes, setShowCellCodes] = useState(false)
  const [spacePanning, setSpacePanning] = useState(false)

  // ── Re-match when color-count settings change ───────────────────────────────
  useEffect(() => {
    if (rawPixels && rawPixels.length > 0) {
      runRematch(rawPixels, brand, width, height)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxColors, mergeThreshold])


  // ── Image upload ────────────────────────────────────────────────────────────
  function handleImageLoad(url: string, file: File) {
    setImageUrl(url)
    setWorkTitle(file.name.replace(/\.[^.]+$/, ''))
    setRawPixels(null)
    setPatternData(null)
    setEditMode(false)
    setErrorMsg(null)
    setCellHistory(null)
    setPickedSourceColor(null)
    setShowCropModal(true)  // Auto-open crop after upload

    // Capture original image dimensions for aspect ratio mode
    const img = new Image()
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight }
      setImageDimensions(dims)
      // If in originalRatio mode, auto-recalculate dimensions
      if (sizeMode === 'originalRatio') {
        const newSize = calcSizeByRatio(ratioLongSide)
        setWidth(newSize.width)
        setHeight(newSize.height)
      }
    }
    img.src = url
  }

  function handleCropConfirm(croppedUrl: string) {
    setImageUrl(croppedUrl)
    setShowCropModal(false)
    setRawPixels(null)
    setPatternData(null)
    setEditMode(false)
    setCellHistory(null)

    // Update dimensions from cropped image
    const img = new Image()
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight }
      setImageDimensions(dims)
      // If in originalRatio mode, recalculate with new dimensions
      if (sizeMode === 'originalRatio') {
        const newSize = calcSizeByRatio(ratioLongSide)
        setWidth(newSize.width)
        setHeight(newSize.height)
      }
    }
    img.src = croppedUrl
  }

  function handleCropSkip() {
    setShowCropModal(false)
    // imageUrl already set from upload — no change needed
  }

  // ── Image transforms (rotate / flip) — auto-regenerate if pattern existed ──
  async function handleTransformImage(op: ImageTransformOp) {
    if (!imageUrl) return
    const hadPattern = !!rawPixels
    try {
      const newUrl = await transformImage(imageUrl, op)
      setImageUrl(newUrl)
      if (hadPattern) {
        // Re-generate with new image, no manual button press needed
        await generatePatternFromUrl(newUrl)
      } else {
        setRawPixels(null)
        setPatternData(null)
        setEditMode(false)
        setCellHistory(null)
      }
    } catch (e) {
      console.error('Transform failed', e)
    }
  }

  // ── Core generate function (accepts URL to avoid stale-state issue) ─────────
  async function generatePatternFromUrl(url: string) {
    if (!url || width < 1 || height < 1 || width > MAX_PATTERN_SIDE_BASE || height > MAX_PATTERN_SIDE_BASE) return
    setErrorMsg(null)
    setIsGenerating(true)
    setPatternData(null)
    setEditMode(false)
    setCellHistory(null)
    try {
      const img = await loadImage(url)
      const cropped = cropTransparentBorder(img)
      const canvas = resizeWithContain(cropped, width, height)

      // Apply portrait detail enhancement if enabled
      const enhancedCanvas = applyPortraitEnhance(canvas)

      // Use true sampling instead of extracting from smoothed canvas
      const sampledPixels = applySampling(enhancedCanvas, width, height, samplingMode)

      // Convert sampled pixels to PixelCell format
      const pixels: PixelCell[] = sampledPixels.map((px, idx) => {
        const row = Math.floor(idx / width)
        const col = idx % width
        const isTransparent = px.a < 32
        return { x: col, y: row, r: px.r, g: px.g, b: px.b, a: px.a, hex: `#${px.r.toString(16).padStart(2, '0')}${px.g.toString(16).padStart(2, '0')}${px.b.toString(16).padStart(2, '0')}`, isTransparent }
      })

      setRawPixels(pixels)
      const palette = getPalette(brand)
      const labCache = buildLabCache(palette)
      const nonTransparent = pixels.filter(px => !px.isTransparent)
      const transparentCount = pixels.length - nonTransparent.length

      let cells: PatternCell[] = []

      if (colorMatchMode === 'originalColorPriority') {
        // Original color priority: cluster first, then match to brand colors
        cells = generateCellsWithClustering(pixels, palette, labCache, maxColors)
        // Isolated pixel cleanup: replace lonely pixels with surrounding color
        cells = cleanupIsolatedPixels(cells, width, height, palette)
      } else {
        // Standard mode: independent matching with facial color protection
        const pixelColorCache = new Map<string, ReturnType<typeof matchColor>>()
        cells = pixels.map(px => {
          if (px.isTransparent) return { row: px.y, col: px.x, isTransparent: true, color: TRANSPARENT_COLOR }
          const key = `${px.r},${px.g},${px.b}`
          if (!pixelColorCache.has(key)) {
            pixelColorCache.set(key, matchColor(px.r, px.g, px.b, palette, labCache))
          }
          const color = pixelColorCache.get(key)!
          return { row: px.y, col: px.x, isTransparent: false, color }
        })

        if (mergeThreshold > 0) {
          // Enhanced merging with facial color protection
          cells = cells.map(cell => {
            if (cell.isTransparent || !isKeyFacialColor(cell.color.rgb[0], cell.color.rgb[1], cell.color.rgb[2])) {
              return cell
            }
            return cell
          })
          cells = mergeLowUsageColors(cells, labCache, mergeThreshold)
        }
      }
      const colorStats = computeColorStats(cells)
      const beadCount = cells.filter(c => !c.isTransparent).length
      setPatternData({ size: { width, height }, cells, rawPixels: pixels, colorStats, beadCount, transparentCount })
      setCellHistory(historyCreate(cells))
      setAutoSelectPixelTab(true)
    } catch (err) {
      setErrorMsg('图片处理失败，请重试')
      console.error(err)
      setAutoSelectPixelTab(false)
    } finally {
      setIsGenerating(false)
    }
  }

  async function generatePattern() {
    if (!imageUrl) { setErrorMsg('请先上传图片'); return }
    if (highFidelityPixelMode) {
      await generateHighFidelityPattern(imageUrl)
    } else {
      await generatePatternFromUrl(imageUrl)
    }
  }

  async function generateHighFidelityPattern(url: string) {
    if (!url || width < 1 || height < 1 || width > MAX_PATTERN_SIDE_HIGH_FIDELITY || height > MAX_PATTERN_SIDE_HIGH_FIDELITY) return
    setErrorMsg(null)
    setIsGenerating(true)
    setPatternData(null)
    setEditMode(false)
    setCellHistory(null)
    try {
      // Step 1: Generate pixel design grid (high-fidelity: skip color quantization)
      const grid = await generatePixelDesignGrid(url, width, height, 0, portraitEnhance, true)
      setPixelDesignGrid(grid)
      setRawPixels(grid.pixels)

      // Step 2: Map to pattern data (1:1 mapping from grid)
      const palette = getPalette(brand)
      const labCache = buildLabCache(palette)

      // Create pattern cells from grid pixels with 1:1 mapping
      const cells: PatternCell[] = grid.pixels.map((px) => {
        if (px.isTransparent) return { row: px.y, col: px.x, isTransparent: true, color: TRANSPARENT_COLOR }
        const color = matchColor(px.r, px.g, px.b, palette, labCache)
        return { row: px.y, col: px.x, isTransparent: false, color }
      })

      // Verify 1:1 mapping: pattern cells must match grid dimensions
      if (cells.length !== grid.width * grid.height) {
        throw new Error('Pattern cell count does not match pixel design grid')
      }

      const colorStats = computeColorStats(cells)
      const beadCount = cells.filter(c => !c.isTransparent).length
      const transparentCount = grid.pixels.filter(px => px.isTransparent).length

      setPatternData({ size: { width, height }, cells, rawPixels: grid.pixels, colorStats, beadCount, transparentCount })
      setCellHistory(historyCreate(cells))
      setAutoSelectPixelTab(true)
    } catch (err) {
      setErrorMsg('高还原像素画生成失败，请重试')
      console.error(err)
      setAutoSelectPixelTab(false)
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Pixel grid recognition ──────────────────────────────────────────────────
  async function generatePatternFromPixelGrid(params: {
    imageUrl: string
    gridCols: number
    gridRows: number
    cellSizePx: number
    offsetX: number
    offsetY: number
    sampleMode: 'center' | 'average3x3'
    preserveColorCount: boolean
  }) {
    setErrorMsg(null)
    setIsGenerating(true)
    setPatternData(null)
    setEditMode(false)
    setCellHistory(null)
    try {
      const pixels = await samplePixelGrid(params)
      setRawPixels(pixels)

      const palette = getPalette(brand)
      const labCache = buildLabCache(palette)
      const nonTransparent = pixels.filter(px => !px.isTransparent)
      const transparentCount = pixels.length - nonTransparent.length

      const w = params.gridCols
      const h = params.gridRows

      let cells: PatternCell[] = []

      if (colorMatchMode === 'originalColorPriority') {
        cells = generateCellsWithClustering(pixels, palette, labCache, maxColors)
        cells = cleanupIsolatedPixels(cells, w, h, palette)
      } else {
        const pixelColorCache = new Map<string, ReturnType<typeof matchColor>>()
        cells = pixels.map((px, idx) => {
          const col = idx % w
          const row = Math.floor(idx / w)
          if (px.isTransparent) return { row, col, isTransparent: true, color: TRANSPARENT_COLOR }
          const key = `${px.r},${px.g},${px.b}`
          if (!pixelColorCache.has(key)) {
            pixelColorCache.set(key, matchColor(px.r, px.g, px.b, palette, labCache))
          }
          const color = pixelColorCache.get(key)!
          return { row, col, isTransparent: false, color }
        })

        if (mergeThreshold > 0) {
          cells = mergeLowUsageColors(cells, labCache, mergeThreshold)
        }
      }
      const colorStats = computeColorStats(cells)
      const beadCount = cells.filter(c => !c.isTransparent).length
      setPatternData({ size: { width: w, height: h }, cells, rawPixels: pixels, colorStats, beadCount, transparentCount })
      setCellHistory(historyCreate(cells))
      setImageUrl(params.imageUrl)
      setWorkTitle('')
    } catch (err) {
      setErrorMsg('像素图识别失败，请检查参数或图片质量')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Rematch on brand/color-count change ─────────────────────────────────────
  function runRematch(pixels: PixelCell[], targetBrand: BrandName, w: number, h: number) {
    const palette = getPalette(targetBrand)
    const labCache = buildLabCache(palette)
    const transparentCount = pixels.filter(px => px.isTransparent).length

    let cells: PatternCell[]

    if (colorMatchMode === 'originalColorPriority') {
      cells = generateCellsWithClustering(pixels, palette, labCache, maxColors)
      cells = cleanupIsolatedPixels(cells, w, h, palette)
    } else {
      const pixelColorCache = new Map<string, ReturnType<typeof matchColor>>()
      cells = pixels.map(px => {
        if (px.isTransparent) return { row: px.y, col: px.x, isTransparent: true, color: TRANSPARENT_COLOR }
        const key = `${px.r},${px.g},${px.b}`
        if (!pixelColorCache.has(key)) {
          pixelColorCache.set(key, matchColor(px.r, px.g, px.b, palette, labCache))
        }
        const color = pixelColorCache.get(key)!
        return { row: px.y, col: px.x, isTransparent: false, color }
      })

      if (mergeThreshold > 0) {
        cells = mergeLowUsageColors(cells, labCache, mergeThreshold)
      }
    }
    const colorStats = computeColorStats(cells)
    const beadCount = cells.filter(c => !c.isTransparent).length
    setPatternData(prev => ({
      size: { width: w, height: h },
      rawPixels: pixels,
      cells,
      colorStats,
      beadCount,
      transparentCount,
      ...(prev ? {} : {}),
    }))
  }

  function generateCellsWithClustering(pixels: PixelCell[], palette: PaletteColor[], labCache: Map<string, [number, number, number]>, targetMaxColors: number): PatternCell[] {
    const nonTransparent = pixels.filter(px => !px.isTransparent)
    const uniqueRgbs = Array.from(new Set(
      nonTransparent.map(px => `${px.r},${px.g},${px.b}`)
    )).map(key => {
      const [r, g, b] = key.split(',').map(Number) as [number, number, number]
      return [r, g, b] as [number, number, number]
    })

    // Use maxColors as target, with sensible bounds
    const clusterK = Math.min(targetMaxColors, Math.max(2, Math.min(uniqueRgbs.length, palette.length)))
    const { centers, assignments } = clusterColors(uniqueRgbs, clusterK)

    const centerToBrand = new Map<number, PaletteColor>()
    for (let i = 0; i < centers.length; i++) {
      const [r, g, b] = centers[i]
      centerToBrand.set(i, matchColor(r, g, b, palette, labCache))
    }

    const rgbToCluster = new Map<string, number>()
    for (let i = 0; i < uniqueRgbs.length; i++) {
      const [r, g, b] = uniqueRgbs[i]
      rgbToCluster.set(`${r},${g},${b}`, assignments[i])
    }

    return pixels.map(px => {
      if (px.isTransparent) return { row: px.y, col: px.x, isTransparent: true, color: TRANSPARENT_COLOR }
      const key = `${px.r},${px.g},${px.b}`
      const clusterIdx = rgbToCluster.get(key) || 0
      const color = centerToBrand.get(clusterIdx) || palette[0]
      return { row: px.y, col: px.x, isTransparent: false, color }
    })
  }

  function applyPortraitEnhance(canvas: HTMLCanvasElement): HTMLCanvasElement {
    if (!portraitEnhance) return canvas

    const w = canvas.width, h = canvas.height
    const ctx = canvas.getContext('2d')!
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data

    // Light sharpening + contrast enhancement
    const tempData = new Uint8ClampedArray(data)
    const sharpKernel = [-1, -1, -1, -1, 9, -1, -1, -1, -1]

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4

        // Apply light sharpening
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

        // Light boost (0.3 intensity to avoid over-sharpening)
        const boost = 0.3
        data[idx] = Math.max(0, Math.min(255, tempData[idx] + (r - tempData[idx]) * boost))
        data[idx + 1] = Math.max(0, Math.min(255, tempData[idx + 1] + (g - tempData[idx + 1]) * boost))
        data[idx + 2] = Math.max(0, Math.min(255, tempData[idx + 2] + (b - tempData[idx + 2]) * boost))
      }
    }

    // Light contrast boost
    const contrastFactor = 1.15
    const contrastCenter = 128
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, contrastCenter + (data[i] - contrastCenter) * contrastFactor))
      data[i + 1] = Math.max(0, Math.min(255, contrastCenter + (data[i + 1] - contrastCenter) * contrastFactor))
      data[i + 2] = Math.max(0, Math.min(255, contrastCenter + (data[i + 2] - contrastCenter) * contrastFactor))
    }

    ctx.putImageData(imageData, 0, 0)
    return canvas
  }

  function cleanupIsolatedPixels(cells: PatternCell[], w: number, h: number, palette: PaletteColor[]): PatternCell[] {
    return cells.map((cell, idx) => {
      if (cell.isTransparent) return cell
      if (isKeyFacialColor(cell.color.rgb[0], cell.color.rgb[1], cell.color.rgb[2])) return cell

      const row = Math.floor(idx / w)
      const col = idx % w

      // Check 8 neighbors
      const neighbors: PatternCell[] = []
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue
          const nr = row + dy, nc = col + dx
          if (nr < 0 || nr >= h || nc < 0 || nc >= w) continue
          const nidx = nr * w + nc
          const ncell = cells[nidx]
          if (!ncell.isTransparent) neighbors.push(ncell)
        }
      }

      if (neighbors.length === 0) return cell

      // Count neighbor colors
      const colorCounts = new Map<string, number>()
      for (const n of neighbors) {
        const key = `${n.color.brand}__${n.color.code}`
        colorCounts.set(key, (colorCounts.get(key) || 0) + 1)
      }

      // If dominated by one color (5+ of 8), replace this pixel
      let maxCount = 0, dominantColor: PaletteColor | null = null
      for (const [key, count] of colorCounts) {
        if (count > maxCount) {
          maxCount = count
          const [brand, code] = key.split('__')
          dominantColor = palette.find(c => c.brand === brand && c.code === code) || null
        }
      }

      if (maxCount >= 5 && dominantColor) {
        return { ...cell, color: dominantColor }
      }

      return cell
    })
  }

  function calcSizeByRatio(longSide: number): { width: number; height: number } {
    if (!imageDimensions) return { width: longSide, height: longSide }
    const isLandscape = imageDimensions.width >= imageDimensions.height
    const ratio = isLandscape
      ? imageDimensions.height / imageDimensions.width
      : imageDimensions.width / imageDimensions.height
    if (isLandscape) {
      return {
        width: longSide,
        height: Math.max(1, Math.round(longSide * ratio))
      }
    } else {
      return {
        width: Math.max(1, Math.round(longSide * ratio)),
        height: longSide
      }
    }
  }

  function refreshSizeByRatio() {
    if (sizeMode !== 'originalRatio' || !imageDimensions) return
    const newSize = calcSizeByRatio(ratioLongSide)
    setWidth(newSize.width)
    setHeight(newSize.height)
    setPatternData(null)
    setPixelDesignGrid(null)
  }

  function handleSizeModeChange(mode: 'preset' | 'custom' | 'originalRatio') {
    setSizeMode(mode)
    // When switching to originalRatio, immediately recalculate dimensions
    if (mode === 'originalRatio' && imageDimensions) {
      const newSize = calcSizeByRatio(ratioLongSide)
      setWidth(newSize.width)
      setHeight(newSize.height)
    }
  }

  function handleSizeChange(w: number, h: number) {
    setWidth(w); setHeight(h)
    setRawPixels(null); setPatternData(null)
    setEditMode(false); setCellHistory(null)
  }

  function handleBrandChange(newBrand: BrandName) {
    setBrand(newBrand)
    if (rawPixels && rawPixels.length > 0) runRematch(rawPixels, newBrand, width, height)
  }

  // ── Edit operations (stats sync + history on every edit) ────────────────────
  const applyEdit = useCallback((newCells: PatternCell[]) => {
    if (!patternData) return
    const colorStats = computeColorStats(newCells)
    const beadCount = newCells.filter(c => !c.isTransparent).length
    const transparentCount = newCells.filter(c => c.isTransparent).length
    setPatternData({ ...patternData, cells: newCells, colorStats, beadCount, transparentCount })
    setCellHistory(prev => prev ? historyPush(prev, newCells) : historyCreate(newCells))
  }, [patternData])

  function restoreCells(cells: PatternCell[]) {
    if (!patternData) return
    const colorStats = computeColorStats(cells)
    const beadCount = cells.filter(c => !c.isTransparent).length
    const transparentCount = cells.filter(c => c.isTransparent).length
    setPatternData({ ...patternData, cells, colorStats, beadCount, transparentCount })
  }

  function handleUndo() {
    if (!cellHistory) return
    const [newH, cells] = historyUndo(cellHistory)
    setCellHistory(newH); restoreCells(cells)
  }

  function handleRedo() {
    if (!cellHistory) return
    const [newH, cells] = historyRedo(cellHistory)
    setCellHistory(newH); restoreCells(cells)
  }

  // ── Keyboard shortcuts (edit mode only) ─────────────────────────────────────
  // Refs always point to the latest undo/redo so the stable effect sees fresh state
  const undoRef = useRef(handleUndo)
  const redoRef = useRef(handleRedo)
  undoRef.current = handleUndo
  redoRef.current = handleRedo

  useEffect(() => {
    const ZOOM_KBD = [1, 1.5, 2, 3, 4]
    function onKeyDown(e: KeyboardEvent) {
      if (!editMode) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform)
      const ctrl = isMac ? e.metaKey : e.ctrlKey
      if (ctrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault(); undoRef.current(); return
      }
      if (ctrl && ((e.shiftKey && e.key.toLowerCase() === 'z') || e.key.toLowerCase() === 'y')) {
        e.preventDefault(); redoRef.current(); return
      }
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        setZoom(prev => { const h = ZOOM_KBD.filter(z => z > prev); return h.length ? h[0] : prev })
        return
      }
      if (e.key === '-') {
        e.preventDefault()
        setZoom(prev => { const l = ZOOM_KBD.filter(z => z < prev); return l.length ? l[l.length - 1] : prev })
        return
      }
      // Reset zoom to 1× (fit view)
      if (e.key === '0') {
        e.preventDefault()
        setZoom(1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [editMode])

  // ── Space key: hold to temporarily use grab/pan tool ────────────────────────
  useEffect(() => {
    if (!editMode) { setSpacePanning(false); return }
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== 'Space' || e.repeat) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault()
      setSpacePanning(true)
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') setSpacePanning(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [editMode])

  // ── Eyedropper pick: ONLY sets paint color + switches to brush
  // Highlight and replace are EXPLICIT separate actions, NOT automatic
  function handleColorPick(color: PaletteColor) {
    setActiveColor(color)
    setPickedSourceColor(null)     // don't enter replace mode automatically
    setHighlightColorCode(null)    // don't auto-highlight — user can do it explicitly
    setActiveTool('brush')
  }

  // ── Color quick-actions triggered from toolbar buttons ─────────────────────
  function handleHighlightActiveColor() {
    if (!activeColor) return
    // Toggle highlight: if already highlighting this color, clear it
    setHighlightColorCode(prev => prev === activeColor.code ? null : activeColor.code)
  }

  function handleStartReplaceActiveColor() {
    if (!activeColor) return
    // Enter replace mode: user is prompted to pick a target color
    setPickedSourceColor(activeColor)
    setHighlightColorCode(activeColor.code)  // highlight source to confirm visually
  }

  function handleDeleteActiveColor() {
    if (!activeColor || !patternData) return
    applyEdit(deleteColor(patternData.cells, activeColor.code, selection ?? undefined))
  }

  // ── Replace confirm flow ────────────────────────────────────────────────────
  function handleRequestReplace(toColor: PaletteColor) {
    if (!pickedSourceColor) return
    setReplaceConfirm({ from: pickedSourceColor, to: toColor })
  }

  function confirmReplaceColor() {
    if (!replaceConfirm || !patternData) return
    applyEdit(replaceColor(patternData.cells, replaceConfirm.from.code, replaceConfirm.to, selection ?? undefined))
    setPickedSourceColor(null)
    setHighlightColorCode(null)
    setReplaceConfirm(null)
  }

  // ── Selection ───────────────────────────────────────────────────────────────
  function handleInvertSelection() {
    if (!patternData) return
    const { width: w, height: h } = patternData.size
    setSelection(prev => prev ? null : { minRow: 0, maxRow: h - 1, minCol: 0, maxCol: w - 1 })
  }

  function toggleEditMode() {
    if (!patternData) {
      setErrorMsg('请先生成图纸后再进入编辑模式')
      return
    }
    setEditMode(v => {
      if (!v) {
        // Entering edit mode: set default zoom based on pattern size
        const maxDim = Math.max(patternData?.size.width || 0, patternData?.size.height || 0)
        let defaultZoom = 1
        if (maxDim > 200) defaultZoom = 0.25
        else if (maxDim > 150) defaultZoom = 0.5
        else if (maxDim > 104) defaultZoom = 1
        else defaultZoom = 1.5
        setZoom(defaultZoom)
      }
      return !v
    })
  }

  const palette = getPalette(brand)
  const usedCodes = new Set(patternData?.colorStats.map(s => s.color.code) ?? [])

  function handleNavigate(page: AppPage) {
    setCurrentPage(page)
  }

  function handleFeatureClick(feature: ComingSoonFeature) {
    if (feature === 'login') {
      setAuthReturnPage('workspace')
      setIsUserCenterOpen(true)
    } else {
      setComingSoonFeature(feature)
    }
  }

  // 登录/注册成功后处理
  function handleAuthSuccess() {
    setIsUserCenterOpen(false)
    if (authReturnPage) {
      setCurrentPage(authReturnPage)
      setAuthReturnPage(null)
    } else {
      setCurrentPage('workspace')
    }
  }

  // 需要登录时的处理
  function handleRequireLogin() {
    setAuthReturnPage('ai-optimize')
    setIsUserCenterOpen(true)
  }

  function handleStartCreating() {
    setCurrentPage('workspace')
  }

  function handleSelectMode(mode: ImportMode) {
    setImportMode(mode)
    setCurrentPage('workspace')
  }

  function handleSelectAiOptimize() {
    setCurrentPage('ai-optimize')
  }

  function handleUseAiResultInWorkspace(resultImageUrl: string) {
    setImageUrl(resultImageUrl)
    setWorkTitle('AI优化图片')
    setImportMode('photo-direct')
    setCurrentPage('workspace')
  }

  // Home page view
  if (currentPage === 'home') {
    return (
      <>
        <AppHeader
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onFeatureClick={handleFeatureClick}
        />
        <HomePage
          onStartCreating={handleStartCreating}
          onSelectMode={handleSelectMode}
          onSelectAiOptimize={handleSelectAiOptimize}
        />
        {comingSoonFeature && (
          <ComingSoonModal
            isOpen={!!comingSoonFeature}
            feature={comingSoonFeature}
            onClose={() => setComingSoonFeature(null)}
          />
        )}
      </>
    )
  }

  // AI Optimize page view
  if (currentPage === 'ai-optimize') {
    return (
      <>
        <AppHeader
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onFeatureClick={handleFeatureClick}
        />
        <AiOptimizePage
          onBack={() => setCurrentPage('home')}
          onUseResultInWorkspace={handleUseAiResultInWorkspace}
          onRequireLogin={handleRequireLogin}
          currentWorkspaceImage={imageUrl ? { url: imageUrl, name: workTitle || '当前工作台图片' } : undefined}
        />
      </>
    )
  }

  // Workspace view
  const currentTheme = modeThemes[importMode]
  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br ${currentTheme.bgGradient}`}>
      {/* App Header */}
      <AppHeader
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onFeatureClick={handleFeatureClick}
      />

      {/* Old workspace content below */}

      {errorMsg && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-600 flex items-center justify-between shrink-0">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-4">
          {/* Current Mode Badge */}
          <div className="mb-6 pb-4 border-b border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">当前模式</p>
            <div className={`inline-flex h-8 items-center justify-center rounded-full px-3 text-sm font-bold text-white ${currentTheme.badgeBg}`}>
              {currentTheme.name}
            </div>
          </div>

          {/* Import Mode Selection */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">导入模式</p>
            <div className="space-y-1">
              {([
                { id: 'photo-direct' as const, label: '📸 直接拍照' },
                { id: 'ai-enhanced' as const, label: '🤖 AI 图片优化' },
                { id: 'pixel-grid' as const, label: '🔲 像素识别' },
                { id: 'existing-pattern' as const, label: '📋 既有图纸' },
              ] as Array<{ id: ImportMode; label: string }>).map(mode => {
                const modeTheme = modeThemes[mode.id]
                const isSelected = importMode === mode.id
                return (
                  <button
                    key={mode.id}
                    onClick={() => setImportMode(mode.id)}
                    className={`w-full text-left px-3 py-2 text-xs rounded border transition-colors ${
                      isSelected
                        ? `bg-opacity-10 border-opacity-50 font-medium ${modeTheme.badgeBg} ${modeTheme.borderColor}`
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {mode.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Upload Panel or Mode-Specific Panel */}
          {importMode === 'photo-direct' && <UploadPanel onImageLoad={handleImageLoad} />}
          {importMode === 'ai-enhanced' && <BackgroundRemovalPanel onApply={(url) => { setImageUrl(url) }} isLoading={isGenerating} />}
          {importMode === 'pixel-grid' && <PixelGridImportPanel onGridDataReady={generatePatternFromPixelGrid} isProcessing={isGenerating} />}
          {importMode === 'existing-pattern' && <ExistingPatternImportPanel onImageLoad={handleImageLoad} />}

          {/* Image preprocessing */}
          {imageUrl && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">图片预处理</p>
              <div className="grid grid-cols-3 gap-1 mb-1">
                {([['rotate-ccw', '↺ 左转'], ['rotate-180', '⟳ 180°'], ['rotate-cw', '↻ 右转']] as [ImageTransformOp, string][]).map(([op, label]) => (
                  <button key={op} onClick={() => handleTransformImage(op)}
                    className="text-xs py-1.5 rounded border border-gray-300 text-gray-600 transition-colors"
                    style={{ borderColor: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = currentTheme.accentColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 mb-1">
                {([['flip-h', '↔ 水平翻转'], ['flip-v', '↕ 垂直翻转']] as [ImageTransformOp, string][]).map(([op, label]) => (
                  <button key={op} onClick={() => handleTransformImage(op)}
                    className="text-xs py-1.5 rounded border border-gray-300 text-gray-600 transition-colors"
                    style={{ borderColor: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = currentTheme.accentColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}>
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowCropModal(true)}
                className="w-full text-xs py-1.5 rounded border border-gray-300 text-gray-600 transition-colors"
                style={{ borderColor: 'inherit' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = currentTheme.accentColor)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#d1d5db')}>
                ✂ 重新裁剪
              </button>
            </div>
          )}

          {/* Zoom controls (edit mode only) */}
          {editMode && patternData && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">缩放倍率</p>
              <div className="flex flex-wrap gap-1">
                {[0.25, 0.5, 1, 1.5, 2].map(z => (
                  <button key={z} onClick={() => setZoom(z)}
                    className={`flex-1 min-w-12 py-1.5 text-xs rounded border transition-colors ${
                      zoom === z
                        ? 'bg-blue-500 text-white border-blue-500 font-medium'
                        : 'border-gray-300 text-gray-600 hover:border-blue-400'
                    }`}
                    title={`${Math.round(z * 100)}% zoom · 使用 +/− 键快速调整`}
                  >
                    {z === 1 ? '1×' : z < 1 ? `${Math.round(z * 100)}%` : `${z}×`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color tools (edit mode only) */}
          {editMode && activeColor && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">颜色工具</p>
              <div className="bg-gray-50 rounded border border-gray-200 p-2 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-5 h-5 rounded border border-gray-300 shrink-0"
                    style={{ backgroundColor: activeColor.hex }}
                  />
                  <span className="text-xs font-mono text-gray-700">{activeColor.code}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleHighlightActiveColor}
                  className={`w-full py-1.5 text-xs rounded border transition-colors ${
                    highlightColorCode === activeColor.code
                      ? 'bg-yellow-400 text-yellow-900 border-yellow-400 font-medium'
                      : 'border-gray-300 text-gray-600 hover:border-yellow-400'
                  }`}
                >
                  {highlightColorCode === activeColor.code ? '✦ 高亮中' : '◈ 高亮此颜色'}
                </button>
                <button
                  onClick={handleStartReplaceActiveColor}
                  className="w-full py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:border-amber-400 transition-colors"
                >
                  ⇄ 替换此颜色
                </button>
              </div>
            </div>
          )}

          {/* Generate settings (hidden in edit mode) */}
          {!editMode && (
            <>
              <SettingsPanel
                width={width} height={height}
                onSizeChange={handleSizeChange}
                workTitle={workTitle}
                onWorkTitleChange={setWorkTitle}
                sizeMode={sizeMode}
                onSizeModeChange={handleSizeModeChange}
                ratioLongSide={ratioLongSide}
                onRatioLongSideChange={setRatioLongSide}
                maxRatioLongSide={highFidelityPixelMode ? MAX_PATTERN_SIDE_HIGH_FIDELITY : MAX_PATTERN_SIDE_BASE}
                onRefreshSize={refreshSizeByRatio}
                highFidelityMode={highFidelityPixelMode}
              />
              <ColorControlPanel
                maxColors={maxColors} mergeThreshold={mergeThreshold}
                onMaxColorsChange={setMaxColors}
                onMergeThresholdChange={setMergeThreshold}
              />
            </>
          )}

        </aside>

        {/* ── Center ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden p-4 flex flex-col">
          <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col min-h-0 relative">
            {editMode && patternData && (
              <EditorToolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                activeColor={activeColor}
                highlightColorCode={highlightColorCode}
                fillThreshold={fillThreshold}
                onFillThresholdChange={setFillThreshold}
                canUndo={cellHistory ? canUndo(cellHistory) : false}
                canRedo={cellHistory ? canRedo(cellHistory) : false}
                onUndo={handleUndo}
                onRedo={handleRedo}
                hasSelection={!!selection}
                onClearSelection={() => setSelection(null)}
                onInvertSelection={handleInvertSelection}
                onHighlightActiveColor={handleHighlightActiveColor}
                onStartReplaceActiveColor={handleStartReplaceActiveColor}
                onDeleteActiveColor={handleDeleteActiveColor}
                showCellCodes={showCellCodes}
                onToggleCellCodes={() => setShowCellCodes(v => !v)}
              />
            )}
            <div className="flex-1 min-h-0 p-4 flex flex-col relative">
              {editMode && patternData ? (
                <>
                  <EditableCanvas
                    patternData={patternData}
                    activeTool={activeTool}
                    activeColor={activeColor}
                    highlightColorCode={highlightColorCode}
                    selection={selection}
                    mirror={mirror}
                    zoom={zoom}
                    onCellsChange={applyEdit}
                    onColorPick={handleColorPick}
                    onSelectionChange={setSelection}
                    showCellCodes={showCellCodes}
                    spacePanning={spacePanning}
                  />
                  <button
                    onClick={toggleEditMode}
                    className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#ff3f78] to-[#ff78a7] rounded-full hover:from-[#ff2d6a] hover:to-[#ff6899] transition-all shadow-md"
                  >
                    <span>←</span>
                    返回预览
                  </button>
                </>
              ) : (
                <>
                  {highFidelityPixelMode && pixelDesignGrid && (
                    <div className="absolute top-2 left-2 bg-indigo-100 border border-indigo-300 rounded px-2 py-1 text-xs text-indigo-700 z-10">
                      像素设计稿: {pixelDesignGrid.width}×{pixelDesignGrid.height}
                    </div>
                  )}
                  <PreviewCanvas
                    imageUrl={imageUrl}
                    patternData={patternData}
                    pixelDesignGrid={pixelDesignGrid}
                    width={width}
                    height={height}
                    mirror={mirror}
                    onEditClick={toggleEditMode}
                    autoSelectPixelTab={autoSelectPixelTab}
                    onGenerate={generatePattern}
                    isGenerating={isGenerating}
                    canGenerate={!!imageUrl}
                  />
                </>
              )}
            </div>
          </div>
        </main>

        {/* ── Right sidebar ───────────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 bg-white border-l border-gray-200 overflow-y-auto p-4">
          <PalettePanel selectedBrand={brand} onBrandChange={handleBrandChange} />

          {/* Sampling mode selection */}
          <div className="mt-6 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">采样方式</p>
            <div className="flex gap-2">
              {(['average', 'center'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSamplingMode(mode)}
                  className={`flex-1 text-xs py-1.5 rounded border transition-colors ${
                    samplingMode === mode
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {mode === 'average' && '平均采样'}
                  {mode === 'center' && '中心采样'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              {samplingMode === 'average' ? '适合普通照片' : '适合像素图/拼豆实物图'}
            </p>
          </div>

          {/* Workflow mode selection */}
          <div className="mt-6 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">工作流模式</p>
            <div className="flex gap-2">
              {[
                { key: false, label: '基础图纸模式', desc: '快速转图' },
                { key: true, label: '高还原像素画', desc: '像素化高还原' }
              ].map((mode) => (
                <button
                  key={String(mode.key)}
                  onClick={() => setHighFidelityPixelMode(mode.key)}
                  className={`flex-1 text-xs py-1.5 rounded border transition-colors ${
                    highFidelityPixelMode === mode.key
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  <div className="font-semibold">{mode.label}</div>
                  <div className="text-xs opacity-75">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Portrait detail enhancement */}
          <div className="mt-6 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">人像增强</p>
            <button
              onClick={() => setPortraitEnhance(!portraitEnhance)}
              className={`w-full text-xs py-1.5 rounded border transition-colors ${
                portraitEnhance
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
              }`}
            >
              {portraitEnhance ? '✓ 已启用' : '禁用'}
            </button>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              增强眼睛、眉毛、嘴巴等五官细节
            </p>
          </div>

          {/* Color match mode selection */}
          <div className="mt-6 mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">色彩匹配模式</p>
            <div className="flex gap-2">
              {(['standard', 'originalColorPriority'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setColorMatchMode(mode)}
                  className={`flex-1 text-xs py-1.5 rounded border transition-colors ${
                    colorMatchMode === mode
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {mode === 'standard' && '标准品牌匹配'}
                  {mode === 'originalColorPriority' && '原图色彩优先'}
                </button>
              ))}
            </div>
            {colorMatchMode === 'originalColorPriority' && (
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                原图色彩优先会尽量保留原图色彩观感，但最终仍会匹配到当前品牌色号。
              </p>
            )}
          </div>

          {/* Quick palette — only in edit mode */}
          {editMode && (
            <QuickPalette
              colors={palette}
              activeColor={activeColor}
              pickedSourceColor={pickedSourceColor}
              highlightColorCode={highlightColorCode}
              onSelectColor={setActiveColor}
              onRequestReplace={handleRequestReplace}
              onClearPickedSource={() => { setPickedSourceColor(null); setHighlightColorCode(null) }}
              usedCodes={usedCodes}
            />
          )}

          <StatsPanel
            brand={brand} width={width} height={height}
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

      {/* Crop modal — auto-triggered on upload, or manual re-crop */}
      {showCropModal && imageUrl && (
        <CropModal
          imageUrl={imageUrl}
          onConfirm={handleCropConfirm}
          onSkip={handleCropSkip}
        />
      )}

      {/* Replace color confirm dialog */}
      {replaceConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-800 mb-3">确认替换颜色</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded border" style={{ backgroundColor: replaceConfirm.from.hex }} />
                <span className="text-xs font-mono text-gray-700">{replaceConfirm.from.code}</span>
              </div>
              <span className="text-xl text-gray-400 font-light">→</span>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded border" style={{ backgroundColor: replaceConfirm.to.hex }} />
                <span className="text-xs font-mono text-gray-700">{replaceConfirm.to.code}</span>
              </div>
              <div className="flex-1 text-xs text-gray-500 leading-relaxed">
                <p className="font-medium text-gray-700">
                  {replaceConfirm.from.name !== replaceConfirm.from.code && replaceConfirm.from.name}
                </p>
                <p>替换为</p>
                <p className="font-medium text-gray-700">
                  {replaceConfirm.to.name !== replaceConfirm.to.code && replaceConfirm.to.name}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2 mb-4">
              {selection
                ? '📌 仅替换当前选区内的颜色'
                : '🌐 替换全图中所有该颜色'}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setReplaceConfirm(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >取消</button>
              <button
                onClick={confirmReplaceColor}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >确认替换</button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      {comingSoonFeature && (
        <ComingSoonModal
          isOpen={!!comingSoonFeature}
          feature={comingSoonFeature}
          onClose={() => setComingSoonFeature(null)}
        />
      )}

      {/* User Center Modal */}
      <UserCenter
        isOpen={isUserCenterOpen}
        onClose={() => setIsUserCenterOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        currentWorkspaceImage={imageUrl ? { url: imageUrl, name: workTitle || '当前工作台图片' } : undefined}
      />

      {/* User Center Button (Floating) */}
      {currentPage === 'workspace' && (
        <button
          onClick={() => setIsUserCenterOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center z-40 hover:scale-110"
          title="打开用户中心"
        >
          <span className="text-2xl">👤</span>
        </button>
      )}
    </div>
  )
}

export default App
