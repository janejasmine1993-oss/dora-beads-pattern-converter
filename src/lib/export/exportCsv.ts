import { buildFileName } from '../utils/fileName'

// TODO: 实现 CSV 导出，UTF-8 BOM 编码
export function exportCsv(_data: unknown, brand: string, width: number, height: number): void {
  const fileName = buildFileName(brand, width, height, 'csv')
  console.log('exportCsv TODO:', fileName)
  throw new Error('exportCsv: not implemented yet')
}
