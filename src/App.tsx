import { useEffect, useState, useCallback } from 'react'
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
import type { BrandName } from './types/palette'
import type { PaletteColor } from './types/palette'
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
import { transformImage, type ImageTransformOp } from './lib/image/transform'
import { replaceColor, deleteColor, outlineBody } from './lib/editor/operations'
import {
  historyCreate, historyPush, historyUndo, historyRedo,
  canUndo, canRedo, type CellHistory,
} from './lib/editor/history'
import type { EditorTool, SelectionRect } from './lib/editor/types'
import './index.css'

function App() {
  // ── Image / preprocessing ───────────────────────────────────────────────────
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [workTitle, setWorkTitle] = useState('')
  const [showCropModal, setShowCropModal] = useState(false)

  // ── Pattern generation ──────────────────────────────────────────────────────
  const [width, setWidth] = useState(52)
  const [height, setHeight] = useState(52)
  const [brand, setBrand] = useState<BrandName>('MARD')
  const [maxColors, setMaxColors] = useState(20)
  const [mergeThreshold, setMergeThreshold] = useState(5)
  const [rawPixels, setRawPixels] = useState<PixelCell[] | null>(null)
  const [patternData, setPatternData] = useState<PatternData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // ── Edit mode ───────────────────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false)
  const [activeTool, setActiveTool] = useState<EditorTool>('brush')
  const [activeColor, setActiveColor] = useState<PaletteColor | null>(null)
  const [highlightColorCode, setHighlightColorCode] = useState<string | null>(null)
  const [selection, setSelection] = useState<SelectionRect | null>(null)
  const [fillThreshold, setFillThreshold] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [mirror, setMirror] = useState(false)
  const [cellHistory, setCellHistory] = useState<CellHistory | null>(null)

  // ── Re-match on color settings change ──────────────────────────────────────
  useEffect(() => {
    if (rawPixels && rawPixels.length > 0) {
      runRematch(rawPixels, brand, width, height)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxColors, mergeThreshold])

  // ── Image handlers ──────────────────────────────────────────────────────────
  function handleImageLoad(url: string, file: File) {
    setImageUrl(url)
    setWorkTitle(file.name.replace(/\.[^.]+$/, ''))
    setRawPixels(null)
    setPatternData(null)
    setEditMode(false)
    setErrorMsg(null)
    setCellHistory(null)
  }

  async function handleTransformImage(op: ImageTransformOp) {
    if (!imageUrl) return
    try {
      const newUrl = await transformImage(imageUrl, op)
      setImageUrl(newUrl)
      setRawPixels(null)
      setPatternData(null)
      setEditMode(false)
      setCellHistory(null)
    } catch (e) {
      console.error(e)
    }
  }

  function handleCropConfirm(croppedUrl: string) {
    setImageUrl(croppedUrl)
    setShowCropModal(false)
    setRawPixels(null)
    setPatternData(null)
    setEditMode(false)
    setCellHistory(null)
  }

  // ── Pattern generation ──────────────────────────────────────────────────────
  function handleSizeChange(w: number, h: number) {
    setWidth(w)
    setHeight(h)
    setRawPixels(null)
    setPatternData(null)
    setEditMode(false)
    setCellHistory(null)
  }

  function handleBrandChange(newBrand: BrandName) {
    setBrand(newBrand)
    if (rawPixels && rawPixels.length > 0) {
      runRematch(rawPixels, newBrand, width, height)
    }
  }

  function runRematch(pixels: PixelCell[], targetBrand: BrandName, w: number, h: number) {
    const palette = getPalette(targetBrand)
    const labCache = buildLabCache(palette)
    const nonTransparent = pixels.filter(px => !px.isTransparent)
    const transparentCount = pixels.length - nonTransparent.length
    const ntRgb = nonTransparent.map(px => [px.r, px.g, px.b] as [number, number, number])
    const clusters = ntRgb.length > 0 ? quantizeColors(ntRgb, maxColors) : []
    const clusterCache = new Map<string, ReturnType<typeof matchColor>>()
    for (const c of clusters) {
      const key = c.join(',')
      if (!clusterCache.has(key)) clusterCache.set(key, matchColor(c[0], c[1], c[2], palette, labCache))
    }
    let ntIdx = 0
    let cells: PatternCell[] = pixels.map(px => {
      if (px.isTransparent) return { row: px.y, col: px.x, isTransparent: true, color: TRANSPARENT_COLOR }
      const cluster = clusters[ntIdx++]
      const color = clusterCache.get(cluster.join(','))!
      return { row: px.y, col: px.x, isTransparent: false, color }
    })
    if (mergeThreshold > 0) cells = mergeLowUsageColors(cells, labCache, mergeThreshold)
    applyCellsToState(cells, { size: { width: w, height: h }, rawPixels: pixels, beadCount: 0, transparentCount, colorStats: [], cells: [] }, transparentCount)
  }

  function applyCellsToState(cells: PatternCell[], base: Partial<PatternData>, transparentCount: number) {
    const colorStats = computeColorStats(cells)
    const beadCount = cells.filter(c => !c.isTransparent).length
    const tc = transparentCount ?? cells.filter(c => c.isTransparent).length
    const newData: PatternData = {
      size: base.size ?? patternData!.size,
      rawPixels: base.rawPixels ?? patternData!.rawPixels,
      cells,
      colorStats,
      beadCount,
      transparentCount: tc,
    }
    setPatternData(newData)
    return newData
  }

  async function generatePattern() {
    if (!imageUrl) { setErrorMsg('请先上传图片'); return }
    if (width < 1 || height < 1 || width > 500 || height > 500) {
      setErrorMsg('请输入有效的宽高（1–500）'); return
    }
    setErrorMsg(null)
    setIsGenerating(true)
    setPatternData(null)
    setEditMode(false)
    setCellHistory(null)
    try {
      const img = await loadImage(imageUrl)
      const cropped = cropTransparentBorder(img)
      const canvas = resizeWithContain(cropped, width, height)
      const pixels = extractPixels(canvas)
      setRawPixels(pixels)
      const palette = getPalette(brand)
      const labCache = buildLabCache(palette)
      const nonTransparent = pixels.filter(px => !px.isTransparent)
      const transparentCount = pixels.length - nonTransparent.length
      const ntRgb = nonTransparent.map(px => [px.r, px.g, px.b] as [number, number, number])
      const clusters = ntRgb.length > 0 ? quantizeColors(ntRgb, maxColors) : []
      const clusterCache = new Map<string, ReturnType<typeof matchColor>>()
      for (const c of clusters) {
        const key = c.join(',')
        if (!clusterCache.has(key)) clusterCache.set(key, matchColor(c[0], c[1], c[2], palette, labCache))
      }
      let ntIdx = 0
      let cells: PatternCell[] = pixels.map(px => {
        if (px.isTransparent) return { row: px.y, col: px.x, isTransparent: true, color: TRANSPARENT_COLOR }
        const cluster = clusters[ntIdx++]
        const color = clusterCache.get(cluster.join(','))!
        return { row: px.y, col: px.x, isTransparent: false, color }
      })
      if (mergeThreshold > 0) cells = mergeLowUsageColors(cells, labCache, mergeThreshold)
      const colorStats = computeColorStats(cells)
      const beadCount = cells.filter(c => !c.isTransparent).length
      const newData: PatternData = { size: { width, height }, cells, rawPixels: pixels, colorStats, beadCount, transparentCount }
      setPatternData(newData)
      setCellHistory(historyCreate(cells))
    } catch (err) {
      setErrorMsg('图片处理失败，请重试')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  // ── Edit operations (with stats sync + history) ─────────────────────────────
  const applyEdit = useCallback((newCells: PatternCell[]) => {
    if (!patternData) return
    const colorStats = computeColorStats(newCells)
    const beadCount = newCells.filter(c => !c.isTransparent).length
    const transparentCount = newCells.filter(c => c.isTransparent).length
    setPatternData({ ...patternData, cells: newCells, colorStats, beadCount, transparentCount })
    setCellHistory(prev => prev ? historyPush(prev, newCells) : historyCreate(newCells))
  }, [patternData])

  function handleUndo() {
    if (!cellHistory || !patternData) return
    const [newH, cells] = historyUndo(cellHistory)
    setCellHistory(newH)
    const colorStats = computeColorStats(cells)
    const beadCount = cells.filter(c => !c.isTransparent).length
    const transparentCount = cells.filter(c => c.isTransparent).length
    setPatternData({ ...patternData, cells, colorStats, beadCount, transparentCount })
  }

  function handleRedo() {
    if (!cellHistory || !patternData) return
    const [newH, cells] = historyRedo(cellHistory)
    setCellHistory(newH)
    const colorStats = computeColorStats(cells)
    const beadCount = cells.filter(c => !c.isTransparent).length
    const transparentCount = cells.filter(c => c.isTransparent).length
    setPatternData({ ...patternData, cells, colorStats, beadCount, transparentCount })
  }

  // ── Color operations ────────────────────────────────────────────────────────
  function handleReplaceColor(fromCode: string, toColor: PaletteColor) {
    if (!patternData) return
    applyEdit(replaceColor(patternData.cells, fromCode, toColor, selection ?? undefined))
  }

  function handleDeleteColor(code: string) {
    if (!patternData) return
    applyEdit(deleteColor(patternData.cells, code, selection ?? undefined))
  }

  function handleOutlineBody(color: PaletteColor) {
    if (!patternData) return
    applyEdit(outlineBody(patternData.cells, width, height, color))
  }

  // ── Selection ───────────────────────────────────────────────────────────────
  function handleInvertSelection() {
    if (!patternData) return
    const { width: w, height: h } = patternData.size
    const current = selection
    if (!current) {
      setSelection({ minRow: 0, maxRow: h - 1, minCol: 0, maxCol: w - 1 })
    } else {
      setSelection(null)
    }
  }

  // ── Palette for QuickPalette ────────────────────────────────────────────────
  const palette = getPalette(brand)
  const usedCodes = new Set(
    patternData?.colorStats.map(s => s.color.code) ?? []
  )

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">豆</div>
        <div>
          <h1 className="text-base font-semibold text-gray-900 leading-none">哆啦拼豆图纸转换器</h1>
          <p className="text-xs text-gray-400 mt-0.5">哆啦拼豆图纸库</p>
        </div>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">v0.4.0</span>
        {patternData && (
          <button
            onClick={() => setEditMode(v => !v)}
            className={`text-xs px-3 py-1 rounded border transition-colors ${
              editMode
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-blue-400 text-blue-600 hover:bg-blue-50'
            }`}
          >
            {editMode ? '✏️ 编辑中' : '✏️ 进入编辑'}
          </button>
        )}
      </header>

      {errorMsg && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-600 flex items-center justify-between shrink-0">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-4">
          {/* Upload */}
          <UploadPanel onImageLoad={handleImageLoad} />

          {/* Image preprocessing: rotate + crop */}
          {imageUrl && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">图片预处理</p>
              <div className="grid grid-cols-3 gap-1 mb-1">
                {([['rotate-ccw', '↺ 左转'], ['rotate-180', '⟳ 180°'], ['rotate-cw', '↻ 右转']] as [ImageTransformOp, string][]).map(([op, label]) => (
                  <button key={op} onClick={() => handleTransformImage(op)}
                    className="text-xs py-1.5 rounded border border-gray-300 hover:border-blue-400 text-gray-600">
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1 mb-1">
                {([['flip-h', '↔ 水平翻转'], ['flip-v', '↕ 垂直翻转']] as [ImageTransformOp, string][]).map(([op, label]) => (
                  <button key={op} onClick={() => handleTransformImage(op)}
                    className="text-xs py-1.5 rounded border border-gray-300 hover:border-blue-400 text-gray-600">
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowCropModal(true)}
                className="w-full text-xs py-1.5 rounded border border-gray-300 hover:border-blue-400 text-gray-600">
                ✂ 裁剪图片
              </button>
            </div>
          )}

          {/* Settings (hidden in edit mode) */}
          {!editMode && (
            <>
              <SettingsPanel
                width={width} height={height}
                onSizeChange={handleSizeChange}
                onGenerate={generatePattern}
                isGenerating={isGenerating}
                canGenerate={!!imageUrl}
                workTitle={workTitle}
                onWorkTitleChange={setWorkTitle}
              />
              <ColorControlPanel
                maxColors={maxColors} mergeThreshold={mergeThreshold}
                onMaxColorsChange={setMaxColors}
                onMergeThresholdChange={setMergeThreshold}
              />
            </>
          )}

          {/* Editor tools (only in edit mode) */}
          {editMode && patternData && (
            <>
              <EditorToolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                activeColor={activeColor}
                fillThreshold={fillThreshold}
                onFillThresholdChange={setFillThreshold}
                zoom={zoom}
                onZoomChange={setZoom}
                canUndo={cellHistory ? canUndo(cellHistory) : false}
                canRedo={cellHistory ? canRedo(cellHistory) : false}
                onUndo={handleUndo}
                onRedo={handleRedo}
                highlightColorCode={highlightColorCode}
                onClearHighlight={() => setHighlightColorCode(null)}
                hasSelection={!!selection}
                onClearSelection={() => setSelection(null)}
                onInvertSelection={handleInvertSelection}
              />

              {/* Outline body shortcut */}
              {activeColor && (
                <button
                  onClick={() => handleOutlineBody(activeColor)}
                  className="w-full mt-2 py-1.5 text-xs border border-gray-300 rounded hover:border-blue-400 text-gray-600"
                >
                  描边主体（当前色）
                </button>
              )}
            </>
          )}
        </aside>

        {/* ── Center ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden p-4 flex flex-col">
          <div className="bg-white rounded-xl border border-gray-200 flex-1 p-4 flex flex-col min-h-0">
            {editMode && patternData ? (
              <EditableCanvas
                patternData={patternData}
                activeTool={activeTool}
                activeColor={activeColor}
                highlightColorCode={highlightColorCode}
                selection={selection}
                mirror={mirror}
                zoom={zoom}
                onCellsChange={applyEdit}
                onColorPick={(color) => { setActiveColor(color); setHighlightColorCode(color.code) }}
                onSelectionChange={setSelection}
              />
            ) : (
              <PreviewCanvas
                imageUrl={imageUrl}
                patternData={patternData}
                width={width}
                height={height}
                mirror={mirror}
              />
            )}
          </div>
        </main>

        {/* ── Right sidebar ───────────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 bg-white border-l border-gray-200 overflow-y-auto p-4">
          <PalettePanel selectedBrand={brand} onBrandChange={handleBrandChange} />

          {/* Quick palette (edit mode) */}
          {editMode && (
            <QuickPalette
              colors={palette}
              activeColor={activeColor}
              highlightColorCode={highlightColorCode}
              onSelectColor={setActiveColor}
              onHighlightColor={setHighlightColorCode}
              onReplaceColor={handleReplaceColor}
              onDeleteColor={handleDeleteColor}
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

      {/* Crop modal */}
      {showCropModal && imageUrl && (
        <CropModal
          imageUrl={imageUrl}
          onConfirm={handleCropConfirm}
          onCancel={() => setShowCropModal(false)}
        />
      )}
    </div>
  )
}

export default App
