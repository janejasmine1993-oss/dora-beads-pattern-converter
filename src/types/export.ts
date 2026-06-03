export type ExportFormat = 'png' | 'pdf' | 'excel' | 'csv'

export interface ExportOptions {
  format: ExportFormat
  brand: string
  width: number
  height: number
  includeWatermark: boolean
}
