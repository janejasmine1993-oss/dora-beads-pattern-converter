export type ImageTransformOp =
  | 'rotate-cw'
  | 'rotate-ccw'
  | 'rotate-180'
  | 'flip-h'
  | 'flip-v'

function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export async function transformImage(url: string, op: ImageTransformOp): Promise<string> {
  const img = await loadImg(url)
  const { naturalWidth: iw, naturalHeight: ih } = img
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  if (op === 'rotate-cw' || op === 'rotate-ccw') {
    canvas.width = ih
    canvas.height = iw
  } else {
    canvas.width = iw
    canvas.height = ih
  }

  ctx.save()
  switch (op) {
    case 'rotate-cw':
      ctx.translate(canvas.width, 0)
      ctx.rotate(Math.PI / 2)
      break
    case 'rotate-ccw':
      ctx.translate(0, canvas.height)
      ctx.rotate(-Math.PI / 2)
      break
    case 'rotate-180':
      ctx.translate(canvas.width, canvas.height)
      ctx.rotate(Math.PI)
      break
    case 'flip-h':
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      break
    case 'flip-v':
      ctx.translate(0, canvas.height)
      ctx.scale(1, -1)
      break
  }
  ctx.drawImage(img, 0, 0)
  ctx.restore()

  return canvas.toDataURL('image/png')
}

/** Crop image to a rect (in natural pixel coordinates). */
export async function cropImage(
  url: string,
  cx: number,
  cy: number,
  cw: number,
  ch: number
): Promise<string> {
  const img = await loadImg(url)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, cw)
  canvas.height = Math.max(1, ch)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch)
  return canvas.toDataURL('image/png')
}
