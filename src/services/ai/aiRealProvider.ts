import type { AiProvider, RealAiStyleRequest, RealAiStyleResult } from './aiProviderTypes'
import type { AiRuntimeConfig } from './aiRuntimeConfig'

export class AiRealProvider implements AiProvider {
  name: string
  private config: AiRuntimeConfig

  constructor(config: AiRuntimeConfig) {
    this.config = config
    this.name = `Real AI Provider (${config.provider})`
  }

  async call(request: RealAiStyleRequest): Promise<RealAiStyleResult> {
    // 调用后端代理接口，而不是直接调用真实 AI 服务
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/ai-style/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          presetId: request.presetId,
          sourceImage: request.sourceImage,
          prompt: request.prompt,
          strength: request.strength,
          keepOriginalColors: request.keepOriginalColors,
          targetUseCase: request.targetUseCase,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `后端请求失败：${response.status}`)
      }

      const result: RealAiStyleResult = await response.json()
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '后端请求出错'
      return {
        id: `real_error_${Date.now()}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: this.config.provider as any,
        status: 'failed',
        presetId: request.presetId,
        message: 'AI 处理失败',
        errorMessage,
        creditCost: 0,
        createdAt: new Date().toISOString(),
      }
    }
  }
}
