export function buildFileName(brand: string, width: number, height: number, ext: string): string {
  const date = new Date().toISOString().slice(0, 10)
  return `哆啦拼豆图纸_${brand}_${width}x${height}_${date}.${ext}`
}
