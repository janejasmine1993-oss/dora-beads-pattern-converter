
export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  thumbnail?: string
  createdAt: number
  updatedAt: number
  isPublic: boolean
  tags: string[]
}

export interface ProjectFile {
  id: string
  projectId: string
  filename: string
  fileType: 'source' | 'pattern' | 'export'
  sourceImageUrl?: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  uploadedAt: number
  metadata?: Record<string, unknown>
}

export interface PatternMetadata {
  projectId: string
  fileId: string
  brand: string
  width: number
  height: number
  totalBeads: number
  uniqueColors: number
  generatedAt: number
  generationMethod: 'photo-direct' | 'ai-enhanced' | 'pixel-grid' | 'existing-pattern'
  sourceImageUrl?: string
  processingDurationMs?: number
}

export interface SavedPattern {
  id: string
  userId: string
  projectId: string
  patternMetadata: PatternMetadata
  patternDataStorageKey: string
  thumbnailUrl?: string
  isFavorite: boolean
  downloads: number
  createdAt: number
  updatedAt: number
}

export interface ProjectVersion {
  versionId: string
  projectId: string
  patternStorageKey: string
  description: string
  createdAt: number
  createdBy: string
}

export type ExportFormat = 'png' | 'pdf' | 'svg' | 'json' | 'csv'

export interface ExportRequest {
  projectId: string
  format: ExportFormat
  quality?: 'draft' | 'standard' | 'professional'
  includeWatermark?: boolean
  customDpi?: number
  metadata?: Record<string, unknown>
}

export interface ExportResult {
  requestId: string
  projectId: string
  format: ExportFormat
  downloadUrl: string
  expiresAt: number
  sizeBytes: number
  createdAt: number
}
