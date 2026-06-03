import { buildFileName } from '../utils/fileName'

// TODO: 使用 xlsx 库实现导出，包含图纸数据和汇总 Sheet
export function exportExcel(_data: unknown, brand: string, width: number, height: number): void {
  const fileName = buildFileName(brand, width, height, 'xlsx')
  console.log('exportExcel TODO:', fileName)
  throw new Error('exportExcel: not implemented yet')
}
