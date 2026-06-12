export type AiProcessPreset =
  | 'remove-background'
  | 'clean-background'
  | 'enhance-clarity'
  | 'color-optimize'
  | 'reduce-noise'

export type AiStylePreset =
  | 'pixel-clean'
  | 'bead-pattern'
  | 'illustration'
  | 'cute-cartoon'
  | 'flat-icon'
  | 'anime-soft'
  | 'watercolor'
  | 'chinese-flower-map'

export type AiPreset = AiProcessPreset | AiStylePreset

export interface AiStyleSourceImage {
  id: string
  name: string
  type: string
  size: number
  width?: number
  height?: number
  previewUrl: string
  base64?: string
  createdAt: string
}

export interface AiStylePresetConfig {
  id: AiPreset
  name: string
  description: string
  suitableFor: string
  isMemberOnly: boolean
  creditCost: number
  category: 'process' | 'style'
}

export interface AiStyleRequest {
  userId: string
  sourceImage: AiStyleSourceImage
  presetId: AiPreset
  prompt?: string
  strength: number
  keepOriginalColors: boolean
  targetUseCase: 'bead-pattern' | 'poster' | 'avatar' | 'reference'
}

export interface AiStyleResult {
  id: string
  status: 'idle' | 'pending' | 'processing' | 'success' | 'failed'
  presetId: AiPreset
  sourceImage?: AiStyleSourceImage
  previewImageUrl?: string
  message: string
  creditCost: number
  createdAt: string
}
