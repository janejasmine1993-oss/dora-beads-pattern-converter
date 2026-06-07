export type AiStylePreset =
  | 'pixel-clean'
  | 'bead-pattern'
  | 'illustration'
  | 'cute-cartoon'
  | 'flat-icon'
  | 'anime-soft'
  | 'watercolor'
  | 'chinese-flower-map'

export interface AiStylePresetConfig {
  id: AiStylePreset
  name: string
  description: string
  suitableFor: string
  isMemberOnly: boolean
  creditCost: number
}

export interface AiStyleRequest {
  userId: string
  sourceImageId?: string
  sourceImageName?: string
  presetId: AiStylePreset
  prompt?: string
  strength: number
  keepOriginalColors: boolean
  targetUseCase: 'bead-pattern' | 'poster' | 'avatar' | 'reference'
}

export interface AiStyleResult {
  id: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  presetId: AiStylePreset
  previewImageUrl?: string
  message: string
  createdAt: string
}
