import { useRef, useState, useCallback, useEffect } from 'react'
import { cropImage } from '../../lib/image/transform'

interface CropRect { x: number; y: number; w: number; h: number }  // percent of displayed img

type AspectKey = 'free' | 'original' | '1:1' | '2:3' | '3:4' | '9:16' | '3:2' | '4:3' | '16:9'

const ASPECT_PRESETS: { label: string; key: AspectKey; r: number | null }[] = [
  { label: '自由', key: 'free', r: null },
  { label: '原比例', key: 'original', r: null },  // computed from nat
  { label: '1:1', key: '1:1', r: 1 },
  { label: '2:3', key: '2:3', r: 2 / 3 },
  { label: '3:4', key: '3:4', r: 3 / 4 },
  { label: '9:16', key: '9:16', r: 9 / 16 },
  { label: '3:2', key: '3:2', r: 3 / 2 },
  { label: '4:3', key: '4:3', r: 4 / 3 },
  { label: '16:9', key: '16:9', r: 16 / 9 },
]

interface CropModalProps {
  imageUrl: string
  onConfirm: (croppedUrl: string) => void
  onSkip: () => void   // skip / cancel without cropping
}

export function CropModal({ imageUrl, onConfirm, onSkip }: CropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nat, setNat] = useState({ w: 0, h: 0 })
  const [crop, setCrop] = useState<CropRect>({ x: 10, y: 10, w: 80, h: 80 })
  const [aspectKey, setAspectKey] = useState<AspectKey>('free')
  const [ratio, setRatio] = useState<number | null>(null)  // pixel w/h ratio, null = free

  const drag = useRef<{
    type: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r'
    sx: number; sy: number
    cx: number; cy: number; cw: number; ch: number
  } | null>(null)

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

  function getImgSize() {
    const img = imgRef.current
    return img ? { w: img.clientWidth, h: img.clientHeight } : { w: 0, h: 0 }
  }

  function handleImgLoad() {
    const img = imgRef.current!
    setNat({ w: img.naturalWidth, h: img.naturalHeight })
  }

  /** Compute percentage crop rect centered for the given pixel ratio. */
  function centeredCropForRatio(r: number, natW: number, natH: number): CropRect {
    if (natW <= 0 || natH <= 0) return { x: 10, y: 10, w: 80, h: 80 }
    // displayRatio = (crop.w% / crop.h%) = r * natH / natW
    const dr = r * natH / natW
    let w = 80
    let h = w / dr
    if (h > 80) { h = 80; w = h * dr }
    w = Math.min(w, 100)
    h = Math.min(h, 100)
    return { x: (100 - w) / 2, y: (100 - h) / 2, w, h }
  }

  function selectAspect(key: AspectKey) {
    setAspectKey(key)
    if (key === 'free') {
      setRatio(null)
      setCrop({ x: 10, y: 10, w: 80, h: 80 })
      return
    }
    const preset = ASPECT_PRESETS.find(p => p.key === key)!
    const r = key === 'original'
      ? (nat.h > 0 ? nat.w / nat.h : null)
      : preset.r
    setRatio(r)
    if (r !== null && nat.w > 0) {
      setCrop(centeredCropForRatio(r, nat.w, nat.h))
    } else if (r === null) {
      setCrop({ x: 10, y: 10, w: 80, h: 80 })
    }
  }

  // Re-compute centered crop when nat loads for "original" mode
  useEffect(() => {
    if (aspectKey === 'original' && nat.w > 0) {
      const r = nat.w / nat.h
      setRatio(r)
      setCrop(centeredCropForRatio(r, nat.w, nat.h))
    }
  }, [nat, aspectKey])

  function onMouseDown(e: React.MouseEvent, type: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r') {
    e.preventDefault()
    e.stopPropagation()
    drag.current = { type, sx: e.clientX, sy: e.clientY, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h }
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!drag.current) return
    const { w: iw, h: ih } = getImgSize()
    if (!iw || !ih) return
    const dx = (e.clientX - drag.current.sx) / iw * 100
    const dy = (e.clientY - drag.current.sy) / ih * 100
    const { type, cx, cy, cw, ch } = drag.current

    if (type === 'move') {
      setCrop({ x: clamp(cx + dx, 0, 100 - cw), y: clamp(cy + dy, 0, 100 - ch), w: cw, h: ch })
      return
    }

    // Handle all resize types
    const minSize = 5
    const dr = ratio !== null && nat.w > 0 ? ratio * nat.h / nat.w : null

    let nx = cx, ny = cy, nw = cw, nh = ch

    // Corners and edges
    if (type === 'tl') {
      ny = clamp(cy + dy, 0, cy + ch - minSize)
      nx = clamp(cx + dx, 0, cx + cw - minSize)
      nw = cw - (nx - cx)
      nh = ch - (ny - cy)
    } else if (type === 'tr') {
      ny = clamp(cy + dy, 0, cy + ch - minSize)
      nw = clamp(cw + dx, minSize, 100 - nx)
      nh = ch - (ny - cy)
    } else if (type === 'bl') {
      nx = clamp(cx + dx, 0, cx + cw - minSize)
      nh = clamp(ch + dy, minSize, 100 - ny)
      nw = cw - (nx - cx)
    } else if (type === 'br') {
      nw = clamp(cw + dx, minSize, 100 - nx)
      nh = clamp(ch + dy, minSize, 100 - ny)
    } else if (type === 't') {
      ny = clamp(cy + dy, 0, cy + ch - minSize)
      nh = ch - (ny - cy)
    } else if (type === 'b') {
      nh = clamp(ch + dy, minSize, 100 - ny)
    } else if (type === 'l') {
      nx = clamp(cx + dx, 0, cx + cw - minSize)
      nw = cw - (nx - cx)
    } else if (type === 'r') {
      nw = clamp(cw + dx, minSize, 100 - nx)
    }

    // Apply ratio constraint if needed
    if (dr !== null) {
      if (type === 'br' || type === 'tl' || type === 'tr' || type === 'bl') {
        // For corners, maintain aspect ratio
        const currentDr = nw > 0 ? nh / nw : dr
        if (Math.abs(currentDr - dr) > 0.01) {
          if (type === 'br') {
            const adjH = nw / dr
            if (ny + adjH <= 100) {
              nh = adjH
            } else {
              nw = (100 - ny) * dr
            }
          } else if (type === 'tl') {
            const adjH = nw / dr
            if (ny - adjH >= 0) {
              ny = ny - adjH + nh
              nh = adjH
            } else {
              const adjW = (ny - 0) * dr
              nw = adjW
              nx = cx + cw - adjW
            }
          } else if (type === 'tr') {
            const adjH = nw / dr
            if (ny - adjH >= 0) {
              ny = ny - adjH + nh
              nh = adjH
            } else {
              const adjW = (ny - 0) * dr
              nw = adjW
            }
          } else if (type === 'bl') {
            const adjH = nw / dr
            if (ny + adjH <= 100) {
              nh = adjH
            } else {
              const adjW = (100 - ny) * dr
              nw = adjW
              nx = cx + cw - adjW
            }
          }
        }
      }
    }

    setCrop({ x: nx, y: ny, w: nw, h: nh })
  }, [ratio, nat])

  const onMouseUp = useCallback(() => { drag.current = null }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  async function handleConfirm() {
    const img = imgRef.current
    if (!img || !nat.w) return
    const scaleX = nat.w / img.clientWidth
    const scaleY = nat.h / img.clientHeight
    const cx = Math.round(crop.x / 100 * img.clientWidth * scaleX)
    const cy = Math.round(crop.y / 100 * img.clientHeight * scaleY)
    const cw = Math.max(1, Math.round(crop.w / 100 * img.clientWidth * scaleX))
    const ch = Math.max(1, Math.round(crop.h / 100 * img.clientHeight * scaleY))
    const url = await cropImage(imageUrl, cx, cy, cw, ch)
    onConfirm(url)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col" style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <h2 className="font-semibold text-gray-800">裁剪图片</h2>
          <button onClick={onSkip} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        {/* Aspect ratio presets */}
        <div className="px-4 pt-3 pb-2 border-b shrink-0">
          <p className="text-xs text-gray-500 mb-2">裁剪比例</p>
          <div className="flex flex-wrap gap-1">
            {ASPECT_PRESETS.map(p => (
              <button
                key={p.key}
                onClick={() => selectAspect(p.key)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  aspectKey === p.key
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300 text-gray-600 hover:border-blue-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Crop area */}
        <div className="p-4 overflow-auto flex-1 flex items-center justify-center">
          <div
            ref={containerRef}
            className="relative inline-block select-none"
            style={{ maxWidth: '100%', maxHeight: '55vh' }}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="crop"
              style={{ maxWidth: '100%', maxHeight: '50vh', display: 'block', userSelect: 'none' }}
              onLoad={handleImgLoad}
              draggable={false}
            />

            {/* Dark mask outside crop */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(0,0,0,0.45)' }} />

            {/* Crop box */}
            <div
              className="absolute border-2 border-blue-400 cursor-move"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.w}%`,
                height: `${crop.h}%`,
                boxSizing: 'border-box',
                background: 'transparent',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
              }}
              onMouseDown={(e) => onMouseDown(e, 'move')}
            >
              {/* Corner handles */}
              <div className="absolute top-0 left-0 w-3 h-3 bg-white border-2 border-blue-500 cursor-nwse-resize"
                style={{ transform: 'translate(-50%,-50%)' }}
                onMouseDown={(e) => onMouseDown(e, 'tl')} />
              <div className="absolute top-0 right-0 w-3 h-3 bg-white border-2 border-blue-500 cursor-nesw-resize"
                style={{ transform: 'translate(50%,-50%)' }}
                onMouseDown={(e) => onMouseDown(e, 'tr')} />
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-white border-2 border-blue-500 cursor-nesw-resize"
                style={{ transform: 'translate(-50%,50%)' }}
                onMouseDown={(e) => onMouseDown(e, 'bl')} />
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-nwse-resize"
                style={{ transform: 'translate(50%,50%)' }}
                onMouseDown={(e) => onMouseDown(e, 'br')}
              />
              {/* Edge centers */}
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-white border border-blue-400 cursor-ns-resize"
                style={{ transform: 'translate(-50%,-50%)' }}
                onMouseDown={(e) => onMouseDown(e, 't')} />
              <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white border border-blue-400 cursor-ns-resize"
                style={{ transform: 'translate(-50%,50%)' }}
                onMouseDown={(e) => onMouseDown(e, 'b')} />
              <div className="absolute left-0 top-1/2 w-2 h-2 bg-white border border-blue-400 cursor-ew-resize"
                style={{ transform: 'translate(-50%,-50%)' }}
                onMouseDown={(e) => onMouseDown(e, 'l')} />
              <div className="absolute right-0 top-1/2 w-2 h-2 bg-white border border-blue-400 cursor-ew-resize"
                style={{ transform: 'translate(50%,-50%)' }}
                onMouseDown={(e) => onMouseDown(e, 'r')} />
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 px-4 pb-1 shrink-0">
          拖动框体移动 · 拖动四边或四角调整大小 · 保持选定比例
        </p>
        <div className="text-xs text-gray-500 px-4 pb-2 shrink-0">
          选区 {crop.w.toFixed(0)}% × {crop.h.toFixed(0)}%
          &emsp;{nat.w > 0 ? `原图 ${nat.w}×${nat.h}` : ''}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-4 py-3 border-t justify-between shrink-0">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            跳过裁剪，使用原图
          </button>
          <button
            onClick={handleConfirm}
            disabled={!nat.w}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            确认裁剪
          </button>
        </div>
      </div>
    </div>
  )
}
