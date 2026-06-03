import { buildFileName } from '../utils/fileName'

// TODO: 使用 jsPDF 实现导出，包含图纸预览图和色号统计表
export function exportPdf(_canvas: HTMLCanvasElement, brand: string, width: number, height: number): void {
  const fileName = buildFileName(brand, width, height, 'pdf')
  console.log('exportPdf TODO:', fileName)
  throw new Error('exportPdf: not implemented yet')
}
