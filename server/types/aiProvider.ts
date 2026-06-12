export type AiPreset =
  | 'remove-background'
  | 'clean-background'
  | 'enhance-clarity'
  | 'color-optimize'
  | 'reduce-noise'
  | 'pixel-clean'
  | 'bead-pattern'
  | 'illustration'
  | 'cute-cartoon'
  | 'flat-icon'
  | 'anime-soft'
  | 'watercolor'
  | 'chinese-flower-map'

export interface AiImageInput {
  name: string
  type: string
  size: number
  base64?: string
  url?: string
}

export interface RealAiStyleRequest {
  userId: string
  presetId: AiPreset
  sourceImage: AiImageInput
  prompt?: string
  strength: number
  keepOriginalColors: boolean
  targetUseCase: 'bead-pattern' | 'poster' | 'avatar' | 'reference'
}

export interface RealAiStyleResult {
  id: string
  provider: 'mock' | 'tencent-hunyuan' | 'volcengine-seedream' | 'aliyun-wanxiang' | 'openai' | 'unknown'
  status: 'pending' | 'processing' | 'success' | 'failed'
  presetId: AiPreset | string
  resultImageUrl?: string
  resultImageBase64?: string
  message: string
  errorMessage?: string
  creditCost: number
  createdAt: string
}

export interface AiProvider {
  name: string
  call(request: RealAiStyleRequest): Promise<RealAiStyleResult>
}
