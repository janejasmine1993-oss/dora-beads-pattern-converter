export type AiRuntimeMode = 'mock' | 'real'
export type AiProvider = 'mock' | 'tencent-hunyuan' | 'volcengine-seedream' | 'aliyun-wanxiang' | 'openai'

export interface AiRuntimeConfig {
  mode: AiRuntimeMode
  provider: AiProvider
  apiBaseUrl?: string
  hasValidApiKey: boolean
}

// 从环境变量读取配置
function getConfig(): AiRuntimeConfig {
  const mode: AiRuntimeMode = (import.meta.env.VITE_AI_RUNTIME_MODE as AiRuntimeMode) || 'mock'
  const provider: AiProvider = (import.meta.env.VITE_AI_PROVIDER as AiProvider) || 'mock'

  // 前端不检查 API Key（绝不在前端存储）
  // API Key 验证由后端服务完成
  const hasValidApiKey = mode === 'real' ? true : false

  return {
    mode,
    provider,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    hasValidApiKey,
  }
}

export const aiRuntimeConfig = getConfig()

export function getConfigStatus(): string {
  if (aiRuntimeConfig.mode === 'real' && !aiRuntimeConfig.hasValidApiKey) {
    return '当前未配置真实 AI 服务，已自动切换为 mock 模式'
  }
  return `当前模式：${aiRuntimeConfig.mode}，服务商：${aiRuntimeConfig.provider}`
}
