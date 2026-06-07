/**
 * 腾讯混元生图 AI Provider
 * 实现 ImageToImage（图像风格化）和 RefineImage（图片变清晰）两个接口
 */

import type { RealAiStyleRequest, RealAiStyleResult } from '../../../src/services/ai/aiProviderTypes'
import { getPromptByPreset } from '../promptMaps/tencentHunyuanPromptMap'
import { getStyleIdByPreset } from '../promptMaps/tencentHunyuanStyleMap'

// 预设到腾讯接口的映射
const PRESET_TO_ACTION_MAP: Record<string, 'ImageToImage' | 'RefineImage'> = {
  'enhance-clarity': 'RefineImage',  // 提高清晰度使用 RefineImage
  'bead-pattern': 'ImageToImage',
  'pixel-clean': 'ImageToImage',
  'cute-cartoon': 'ImageToImage',
  'watercolor': 'ImageToImage',
  'illustration': 'ImageToImage',
  'anime-soft': 'ImageToImage',
  'clean-background': 'ImageToImage',
  'remove-background': 'ImageToImage',
  'color-optimize': 'ImageToImage',
  'reduce-noise': 'ImageToImage',
}

/**
 * 根据 presetId 选择腾讯接口
 */
function getActionByPreset(presetId: string): 'ImageToImage' | 'RefineImage' {
  return PRESET_TO_ACTION_MAP[presetId] || 'ImageToImage'
}

/**
 * 将 base64 字符串去掉前缀（如果有）
 */
function stripBase64Prefix(base64: string): string {
  const match = base64.match(/^data:[^;]+;base64,(.+)$/)
  return match ? match[1] : base64
}

/**
 * 腾讯混元 AI Provider 类
 */
export class TencentHunyuanProvider {
  private secretId: string
  private secretKey: string
  private region: string
  private endpoint: string
  private version: string

  constructor() {
    this.secretId = process.env.TENCENT_SECRET_ID || ''
    this.secretKey = process.env.TENCENT_SECRET_KEY || ''
    this.region = process.env.TENCENT_REGION || 'ap-guangzhou'
    this.endpoint = process.env.TENCENT_AIART_ENDPOINT || 'aiart.tencentcloudapi.com'
    this.version = process.env.TENCENT_AIART_VERSION || '2022-12-29'
  }

  /**
   * 验证密钥配置
   */
  private validateCredentials(): { valid: boolean; error?: string } {
    if (!this.secretId || !this.secretKey) {
      return {
        valid: false,
        error: '未配置腾讯云 SecretId / SecretKey，请检查 server/.env.local',
      }
    }
    return { valid: true }
  }

  /**
   * 主处理函数
   */
  async generate(request: RealAiStyleRequest): Promise<RealAiStyleResult> {
    const credCheck = this.validateCredentials()
    if (!credCheck.valid) {
      return {
        id: `tencent_error_${Date.now()}`,
        provider: 'tencent-hunyuan',
        status: 'failed',
        presetId: request.presetId,
        message: '腾讯混元密钥未配置',
        errorMessage: credCheck.error || '密钥配置错误',
        creditCost: 0,
        createdAt: new Date().toISOString(),
      }
    }

    const action = getActionByPreset(request.presetId)

    console.log(`[Tencent Hunyuan] Starting ${action} for preset: ${request.presetId}`)

    try {
      if (action === 'RefineImage') {
        return await this.handleRefineImage(request)
      } else {
        return await this.handleImageToImage(request)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '未知错误'
      console.error(`[Tencent Hunyuan] Error: ${errorMsg}`)

      // 根据错误类型返回更具体的错误信息
      let userFriendlyError = '腾讯混元 AI 处理失败，请重试'
      if (errorMsg.includes('InvalidParameter')) {
        userFriendlyError = '请求参数错误，请检查图片格式或大小'
      } else if (errorMsg.includes('ResourceNotFound')) {
        userFriendlyError = '腾讯混元生图服务未开通或当前账号无权限'
      } else if (errorMsg.includes('FailedOperation.ServiceIsolated')) {
        userFriendlyError = '腾讯混元生图服务暂不可用，请检查账户状态'
      } else if (errorMsg.includes('FailedOperation.Balance')) {
        userFriendlyError = '腾讯云账户余额不足，请充值后重试'
      } else if (errorMsg.includes('ContentRejection')) {
        userFriendlyError = '图片或提示词未通过平台审核，请更换图片或调整描述后重试'
      } else if (errorMsg.includes('RateLimitExceeded')) {
        userFriendlyError = '当前请求较多，请稍后再试'
      }

      return {
        id: `tencent_error_${Date.now()}`,
        provider: 'tencent-hunyuan',
        status: 'failed',
        presetId: request.presetId,
        message: userFriendlyError,
        errorMessage: errorMsg,
        creditCost: 0,
        createdAt: new Date().toISOString(),
      }
    }
  }

  /**
   * 处理 ImageToImage（图像风格化）
   */
  private async handleImageToImage(request: RealAiStyleRequest): Promise<RealAiStyleResult> {
    // 获取提示词和风格 ID
    const prompt = getPromptByPreset(request.presetId)
    const styleId = getStyleIdByPreset(request.presetId)

    // 提取纯 base64（去掉 data URL 前缀）
    const base64Image = stripBase64Prefix(request.sourceImage.base64 || '')

    if (!base64Image) {
      return {
        id: `tencent_error_${Date.now()}`,
        provider: 'tencent-hunyuan',
        status: 'failed',
        presetId: request.presetId,
        message: '图片 base64 数据缺失',
        errorMessage: '无法获取图片数据',
        creditCost: 0,
        createdAt: new Date().toISOString(),
      }
    }

    console.log(
      `[Tencent Hunyuan] ImageToImage request: preset=${request.presetId}, style=${styleId}, image_size=${request.sourceImage.size}`
    )

    try {
      // 这里应调用腾讯云 SDK
      // 当前为 mock 实现示例（真实实现需要腾讯云 SDK）
      const resultImageUrl = await this.callTencentImageToImage({
        inputImage: base64Image,
        prompt: prompt,
        styles: [styleId],
        strength: request.strength || 0.8,
      })

      console.log(`[Tencent Hunyuan] ImageToImage success`)

      return {
        id: `tencent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider: 'tencent-hunyuan',
        status: 'success',
        presetId: request.presetId,
        resultImageUrl: resultImageUrl,
        message: `腾讯混元图像风格化成功：${request.presetId}`,
        creditCost: 1,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * 处理 RefineImage（图片变清晰）
   */
  private async handleRefineImage(request: RealAiStyleRequest): Promise<RealAiStyleResult> {
    const base64Image = stripBase64Prefix(request.sourceImage.base64 || '')

    if (!base64Image) {
      return {
        id: `tencent_error_${Date.now()}`,
        provider: 'tencent-hunyuan',
        status: 'failed',
        presetId: request.presetId,
        message: '图片 base64 数据缺失',
        errorMessage: '无法获取图片数据',
        creditCost: 0,
        createdAt: new Date().toISOString(),
      }
    }

    console.log(
      `[Tencent Hunyuan] RefineImage request: preset=${request.presetId}, image_size=${request.sourceImage.size}`
    )

    try {
      // 这里应调用腾讯云 SDK
      // 当前为 mock 实现示例（真实实现需要腾讯云 SDK）
      const resultImageUrl = await this.callTencentRefineImage({
        inputImage: base64Image,
      })

      console.log(`[Tencent Hunyuan] RefineImage success`)

      return {
        id: `tencent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider: 'tencent-hunyuan',
        status: 'success',
        presetId: request.presetId,
        resultImageUrl: resultImageUrl,
        message: `腾讯混元图片变清晰成功：${request.presetId}`,
        creditCost: 1,
        createdAt: new Date().toISOString(),
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * 调用腾讯 ImageToImage 接口（SDK 实现）
   * TODO: 使用真实的腾讯云 SDK 替换此 mock 实现
   */
  private async callTencentImageToImage(params: {
    inputImage: string
    prompt: string
    styles: string[]
    strength: number
  }): Promise<string> {
    // 这里应使用腾讯云 SDK 的真实实现
    // const client = new tencentcloud.aiart.v20221229.Client(...)
    // const response = await client.ImageToImage(...)

    // 当前为 mock 实现
    console.log('[Tencent Mock] Would call ImageToImage with:')
    console.log('  - prompt length:', params.prompt.length)
    console.log('  - styles:', params.styles)
    console.log('  - strength:', params.strength)

    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500))

    // 返回模拟的图片 URL
    return `https://tencent-hunyuan-mock.example.com/img_${Date.now()}.jpg`
  }

  /**
   * 调用腾讯 RefineImage 接口（SDK 实现）
   * TODO: 使用真实的腾讯云 SDK 替换此 mock 实现
   */
  private async callTencentRefineImage(params: { inputImage: string }): Promise<string> {
    // 这里应使用腾讯云 SDK 的真实实现
    // const client = new tencentcloud.aiart.v20221229.Client(...)
    // const response = await client.RefineImage(...)

    // 当前为 mock 实现
    console.log('[Tencent Mock] Would call RefineImage')

    // 模拟 API 调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500))

    // 返回模拟的图片 URL
    return `https://tencent-hunyuan-mock.example.com/refined_${Date.now()}.jpg`
  }
}

/**
 * 创建全局单例
 */
let tencentProvider: TencentHunyuanProvider | null = null

export function getTencentHunyuanProvider(): TencentHunyuanProvider {
  if (!tencentProvider) {
    tencentProvider = new TencentHunyuanProvider()
  }
  return tencentProvider
}
