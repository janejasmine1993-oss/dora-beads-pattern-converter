import type { AiProvider, RealAiStyleRequest, RealAiStyleResult } from './aiProviderTypes'

export class AiMockProvider implements AiProvider {
  name = 'Mock AI Provider'

  async call(request: RealAiStyleRequest): Promise<RealAiStyleResult> {
    // Mock 实现：模拟 AI 处理延迟
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500))

    return {
      id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: 'mock',
      status: 'success',
      presetId: request.presetId,
      message: `[Mock] 已完成 ${request.presetId} 风格化处理`,
      creditCost: 1,
      createdAt: new Date().toISOString(),
    }
  }
}
