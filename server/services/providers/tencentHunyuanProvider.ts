/**
 * 腾讯混元生图 AI Provider - 真实 SDK 实现
 * 使用 tencentcloud-sdk-nodejs 调用腾讯云 AIART API
 */

import type { RealAiStyleRequest, RealAiStyleResult } from '../../types/aiProvider'
import { getPromptByPreset } from '../promptMaps/tencentHunyuanPromptMap'
import { getStyleIdByPreset } from '../promptMaps/tencentHunyuanStyleMap'

// 动态导入 tencentcloud SDK（支持 ESM）
let tencentcloud: any = null
async function getTencentCloudSDK() {
  if (!tencentcloud) {
    tencentcloud = await import('tencentcloud-sdk-nodejs')
  }
  return tencentcloud
}

// 预设到腾讯接口的映射
const PRESET_TO_ACTION_MAP: Record<string, 'ImageToImage' | 'RefineImage'> = {
  'enhance-clarity': 'RefineImage',
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
 * 腾讯混元 AI Provider 类 - 真实 SDK 实现
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
      let userFriendlyError = '腾讯混元调用失败，请重试'
      let errorKey = errorMsg

      // 检查腾讯云 SDK 错误
      if (errorMsg.includes('InvalidParameter') || errorMsg.includes('失败')) {
        userFriendlyError = '图片格式、大小或分辨率不符合腾讯混元生图要求'
      } else if (errorMsg.includes('AuthFailure') || errorMsg.includes('鉴权')) {
        userFriendlyError = '腾讯云鉴权失败，请检查 SecretId / SecretKey 是否正确'
      } else if (
        errorMsg.includes('UnauthorizedOperation') ||
        errorMsg.includes('PermissionDenied') ||
        errorMsg.includes('无权限')
      ) {
        userFriendlyError = '腾讯混元生图未开通或当前账号无调用权限，请检查腾讯云控制台和 CAM 授权'
      } else if (errorMsg.includes('NoBalance') || errorMsg.includes('欠费')) {
        userFriendlyError = '腾讯云账户余额不足或服务不可用，请检查账户状态'
      } else if (errorMsg.includes('ContentRejection') || errorMsg.includes('审核')) {
        userFriendlyError = '图片或提示词未通过平台审核，请更换图片或调整描述后重试'
      } else if (errorMsg.includes('RateLimitExceeded') || errorMsg.includes('限流')) {
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
   * 处理 ImageToImage（图像风格化）- 真实 SDK 实现
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
      // 导入腾讯云 SDK
      const sdk = await getTencentCloudSDK()
      const AiartClient = sdk.aiart.v20221229.Client

      // 创建客户端
      const client = new AiartClient({
        credential: {
          secretId: this.secretId,
          secretKey: this.secretKey,
        },
        region: this.region,
        profile: {
          httpProfile: {
            endpoint: this.endpoint,
          },
        },
      })

      // 构造请求参数
      const params = {
        InputImage: base64Image,
        Prompt: prompt,
        NegativePrompt: '文字，水印，模糊，杂乱背景，畸形，多余肢体，低质量',
        Styles: [styleId],
        Strength: request.strength || 0.8,
        RspImgType: 'url',
        LogoAdd: 0,
        ResultConfig: {
          Resolution: 'origin',
        },
        EnhanceImage: 0,
        RestoreFace: 0,
      }

      // 调用腾讯云 API
      const response = await client.ImageToImage(params)

      console.log(
        `[Tencent Hunyuan] ImageToImage success, RequestId: ${response.RequestId}`
      )

      // 获取结果图片 URL
      const resultImageUrl = response.ResultImage

      return {
        id: `tencent_${response.RequestId}_${Math.random().toString(36).substr(2, 9)}`,
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
   * 处理 RefineImage（图片变清晰）- 真实 SDK 实现
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
      // 导入腾讯云 SDK
      const sdk = await getTencentCloudSDK()
      const AiartClient = sdk.aiart.v20221229.Client

      // 创建客户端
      const client = new AiartClient({
        credential: {
          secretId: this.secretId,
          secretKey: this.secretKey,
        },
        region: this.region,
        profile: {
          httpProfile: {
            endpoint: this.endpoint,
          },
        },
      })

      // 构造请求参数
      const params = {
        InputImage: base64Image,
        RspImgType: 'url',
      }

      // 调用腾讯云 API
      const response = await client.RefineImage(params)

      console.log(
        `[Tencent Hunyuan] RefineImage success, RequestId: ${response.RequestId}`
      )

      // 获取结果图片 URL
      const resultImageUrl = response.ResultImage

      return {
        id: `tencent_${response.RequestId}_${Math.random().toString(36).substr(2, 9)}`,
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
