import { useRef, useState, useCallback, useEffect } from 'react'
import { cropImage } from '../../lib/image/transform'

interface CropRect { x: number; y: number; w: number; h: number }  // 0-100 percent of displayed img

interface CropModalProps {
  imageUrl: string
  onConfirm: (croppedUrl: string) => void
  onCancel: () => void
}

export function CropModal({ imageUrl, onConfirm, onCancel }: CropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nat, setNat] = useState({ w: 0, h: 0 })
  const [crop, setCrop] = useState<CropRect>({ x: 10, y: 10, w: 80, h: 80 })
  const drag = useRef<{ type: 'move' | 'br'; sx: number; sy: number; cx: number; cy: number; cw: number; ch: number } | null>(null)

  function handleImgLoad() {
    const img = imgRef.current!
    setNat({ w: img.naturalWidth, h: img.naturalHeight })
  }

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

  function getContainerSize() {
    const c = containerRef.current
    const img = imgRef.current
    if (!c || !img) return { w: 0, h: 0 }
    return { w: img.clientWidth, h: img.clientHeight }
  }

  function onMouseDown(e: React.MouseEvent, type: 'move' | 'br') {
    e.preventDefault()
    e.stopPropagation()
    drag.current = { type, sx: e.clientX, sy: e.clientY, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h }
  }

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!drag.current) return
    const { w, h } = getContainerSize()
    if (!w || !h) return
    const dx = (e.clientX - drag.current.sx) / w * 100
    const dy = (e.clientY - drag.current.sy) / h * 100
    const { type, cx, cy, cw, ch } = drag.current

    if (type === 'move') {
      setCrop({
        x: clamp(cx + dx, 0, 100 - cw),
        y: clamp(cy + dy, 0, 100 - ch),
        w: cw,
        h: ch,
      })
    } else {
      const nw = clamp(cw + dx, 5, 100 - cx)
      const nh = clamp(ch + dy, 5, 100 - cy)
      setCrop({ x: cx, y: cy, w: nw, h: nh })
    }
  }, [])

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
    const cw = Math.round(crop.w / 100 * img.clientWidth * scaleX)
    const ch = Math.round(crop.h / 100 * img.clientHeight * scaleY)
    const url = await cropImage(imageUrl, cx, cy, cw, ch)
    onConfirm(url)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col" style={{ maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
          <h2 className="font-semibold text-gray-800">裁剪图片</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="p-4 overflow-auto flex-1 flex items-center justify-center">
          <div ref={containerRef} className="relative inline-block select-none" style={{ maxWidth: '100%', maxHeight: '60vh' }}>
            <img
              ref={imgRef}
              src={imageUrl}
              alt="crop"
              style={{ maxWidth: '100%', maxHeight: '55vh', display: 'block', userSelect: 'none' }}
              onLoad={handleImgLoad}
              draggable={false}
            />

            {/* Dark overlay (outside crop) */}
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
              {[['top-0 left-0', '-translate-x-1/2 -translate-y-1/2', 'nw-resize'],
                ['top-0 right-0', 'translate-x-1/2 -translate-y-1/2', 'ne-resize'],
                ['bottom-0 left-0', '-translate-x-1/2 translate-y-1/2', 'sw-resize'],
                ['bottom-0 right-0', 'translate-x-1/2 translate-y-1/2', 'se-resize']].map(([pos, tr, cur], i) => (
                <div
                  key={i}
                  className={`absolute ${pos} w-3 h-3 bg-blue-500 rounded-sm`}
                  style={{ transform: `translate(${tr.includes('-translate-x') ? '-50%' : '50%'}, ${tr.includes('-translate-y') ? '-50%' : '50%'})`, cursor: cur }}
                  onMouseDown={i === 3 ? (e) => onMouseDown(e, 'br') : undefined}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 px-4 pb-1 shrink-0">拖动裁剪框可移动位置，拖动右下角调整大小</p>
        <div className="text-xs text-gray-500 px-4 pb-2 shrink-0">
          选区：X {crop.x.toFixed(0)}%&nbsp; Y {crop.y.toFixed(0)}%&nbsp;
          宽 {crop.w.toFixed(0)}%&nbsp; 高 {crop.h.toFixed(0)}%
        </div>

        <div className="flex gap-2 px-4 py-3 border-t justify-end shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >取消</button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >确认裁剪</button>
        </div>
      </div>
    </div>
  )
}
