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
import type { BrandName, PaletteColor } from './types/palette'
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
  // ── Image ───────────────────────────────────────────────────────────────────
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
  }

  function handleCropConfirm(croppedUrl: string) {
    setImageUrl(croppedUrl)
    setShowCropModal(false)
    setRawPixels(null)
    setPatternData(null)
    setEditMode(false)
    setCellHistory(null)
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
    if (!url || width < 1 || height < 1 || width > 500 || height > 500) return
    setErrorMsg(null)
    setIsGenerating(true)
    setPatternData(null)
    setEditMode(false)
    setCellHistory(null)
    try {
      const img = await loadImage(url)
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
      setPatternData({ size: { width, height }, cells, rawPixels: pixels, colorStats, beadCount, transparentCount })
      setCellHistory(historyCreate(cells))
    } catch (err) {
      setErrorMsg('图片处理失败，请重试')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  async function generatePattern() {
    if (!imageUrl) { setErrorMsg('请先上传图片'); return }
    await generatePatternFromUrl(imageUrl)
  }

  // ── Rematch on brand/color-count change ─────────────────────────────────────
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

  // ── Color operations ────────────────────────────────────────────────────────
  function handleDeleteColor(code: string) {
    if (!patternData) return
    applyEdit(deleteColor(patternData.cells, code, selection ?? undefined))
  }

  function handleOutlineBody(color: PaletteColor) {
    if (!patternData) return
    applyEdit(outlineBody(patternData.cells, width, height, color))
  }

  // ── Eyedropper pick: set paint color, source color, highlight, switch to brush
  function handleColorPick(color: PaletteColor) {
    setActiveColor(color)
    setPickedSourceColor(color)
    setHighlightColorCode(color.code)
    setActiveTool('brush')  // return to canvas-edit state after picking
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
    setEditMode(v => !v)
  }

  const palette = getPalette(brand)
  const usedCodes = new Set(patternData?.colorStats.map(s => s.color.code) ?? [])

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">豆</div>
        <div>
          <h1 className="text-base font-semibold text-gray-900 leading-none">哆啦拼豆图纸转换器</h1>
          <p className="text-xs text-gray-400 mt-0.5">哆啦拼豆图纸库</p>
        </div>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">v0.4.1</span>
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
          <UploadPanel onImageLoad={handleImageLoad} />

          {/* Image preprocessing */}
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
                ✂ 重新裁剪
              </button>
            </div>
          )}

          {/* Generate settings (hidden in edit mode) */}
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

          {/* Editor tools (edit mode only) */}
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
                onClearHighlight={() => { setHighlightColorCode(null); setPickedSourceColor(null) }}
                hasSelection={!!selection}
                onClearSelection={() => setSelection(null)}
                onInvertSelection={handleInvertSelection}
              />
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
          <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col min-h-0 relative">
            {/* Edit mode toggle — top right of canvas area */}
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={toggleEditMode}
                className={`text-xs px-2.5 py-1 rounded shadow-sm border transition-colors ${
                  editMode
                    ? 'bg-blue-500 text-white border-blue-500'
                    : patternData
                    ? 'bg-white border-blue-400 text-blue-600 hover:bg-blue-50'
                    : 'bg-white border-gray-200 text-gray-400 cursor-default'
                }`}
              >
                {editMode ? '← 返回预览' : '✏️ 进入编辑'}
              </button>
            </div>

            <div className="flex-1 min-h-0 p-4 pt-10 flex flex-col">
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
                  onColorPick={handleColorPick}
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
          </div>
        </main>

        {/* ── Right sidebar ───────────────────────────────────────────────── */}
        <aside className="w-64 shrink-0 bg-white border-l border-gray-200 overflow-y-auto p-4">
          <PalettePanel selectedBrand={brand} onBrandChange={handleBrandChange} />

          {/* Quick palette — only in edit mode */}
          {editMode && (
            <QuickPalette
              colors={palette}
              activeColor={activeColor}
              pickedSourceColor={pickedSourceColor}
              highlightColorCode={highlightColorCode}
              onSelectColor={setActiveColor}
              onHighlightColor={setHighlightColorCode}
              onRequestReplace={handleRequestReplace}
              onClearPickedSource={() => { setPickedSourceColor(null); setHighlightColorCode(null) }}
              onSetPickedSource={(c) => { setPickedSourceColor(c); setHighlightColorCode(c.code) }}
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
    </div>
  )
}

export default App
