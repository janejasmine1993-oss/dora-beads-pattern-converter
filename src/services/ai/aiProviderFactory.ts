import type { AiProvider } from './aiProviderTypes'
import { AiMockProvider } from './aiMockProvider'
import { AiRealProvider } from './aiRealProvider'
import { aiRuntimeConfig } from './aiRuntimeConfig'

let cachedProvider: AiProvider | null = null

export function getAiProvider(): AiProvider {
  if (cachedProvider) {
    return cachedProvider
  }

  // 对于 mock 模式，始终使用 mock provider
  if (aiRuntimeConfig.mode === 'mock' || aiRuntimeConfig.provider === 'mock') {
    cachedProvider = new AiMockProvider()
  } else {
    // 对于 real 模式，使用真实 provider
    cachedProvider = new AiRealProvider(aiRuntimeConfig)
  }

  return cachedProvider
}

export function resetAiProvider(): void {
  cachedProvider = null
}
