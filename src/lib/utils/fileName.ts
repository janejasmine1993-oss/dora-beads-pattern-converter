const UNSAFE = /[\\/:*?"<>|]/g

export function buildFileName(
  brand: string,
  width: number,
  height: number,
  ext: string,
  workTitle?: string,
  mirror?: boolean
): string {
  const date = new Date().toISOString().slice(0, 10)
  const title = workTitle ? workTitle.replace(UNSAFE, '').trim().slice(0, 30) : ''
  const titlePart = title ? `_${title}` : ''
  const mirrorPart = mirror ? '_镜像' : ''
  return `哆啦拼豆图纸${titlePart}${mirrorPart}_${brand}_${width}x${height}_${date}.${ext}`
}
