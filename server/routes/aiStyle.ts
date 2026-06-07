import express from 'express'
import type { RealAiStyleRequest, RealAiStyleResult } from '../types/aiProvider'
import { getTencentHunyuanProvider } from '../services/providers/tencentHunyuanProvider'

export const aiStyleRouter = express.Router()

// POST /api/ai-style/generate
aiStyleRouter.post('/generate', async (req: express.Request, res: express.Response) => {
  try {
    const body = req.body as Partial<RealAiStyleRequest>

    // 验证请求体
    if (!body.presetId || !body.sourceImage) {
      return res.status(400).json({
        id: `error_${Date.now()}`,
        provider: 'unknown',
        status: 'failed',
        presetId: body.presetId || '',
        message: '请求参数不完整',
        errorMessage: '缺少 presetId 或 sourceImage',
        creditCost: 0,
        createdAt: new Date().toISOString(),
      } as RealAiStyleResult)
    }

    // 检查图片大小（5MB = 5242880 bytes）
    if (body.sourceImage.size && body.sourceImage.size > 5242880) {
      return res.status(400).json({
        id: `error_${Date.now()}`,
        provider: 'unknown',
        status: 'failed',
        presetId: body.presetId,
        message: '图片过大',
        errorMessage: '图片大小超过 5MB 限制',
        creditCost: 0,
        createdAt: new Date().toISOString(),
      } as RealAiStyleResult)
    }

    // 检查图片格式
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(body.sourceImage.type)) {
      return res.status(400).json({
        id: `error_${Date.now()}`,
        provider: 'unknown',
        status: 'failed',
        presetId: body.presetId,
        message: '图片格式不支持',
        errorMessage: '仅支持 JPG / PNG / WEBP 格式',
        creditCost: 0,
        createdAt: new Date().toISOString(),
      } as RealAiStyleResult)
    }

    // 根据运行模式调用相应的 provider
    const runtimeMode = process.env.AI_RUNTIME_MODE || 'mock'
    const provider = process.env.AI_PROVIDER || 'mock'

    console.log(`[AI Generate] Mode: ${runtimeMode}, Provider: ${provider}, Preset: ${body.presetId}`)

    let result: RealAiStyleResult

    if (runtimeMode === 'real' && provider === 'tencent-hunyuan') {
      // 调用腾讯混元 provider
      const tencentProvider = getTencentHunyuanProvider()
      result = await tencentProvider.generate(body as RealAiStyleRequest)
    } else {
      // 默认返回 mock 结果
      result = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        provider: 'mock',
        status: 'success',
        presetId: body.presetId,
        message: `[Mock] AI 风格化已完成：${body.presetId}`,
        creditCost: 1,
        createdAt: new Date().toISOString(),
      }
    }

    res.json(result)
  } catch (error) {
    console.error('[AI Generate Error]', error)
    res.status(500).json({
      id: `error_${Date.now()}`,
      provider: 'unknown',
      status: 'failed',
      presetId: '',
      message: 'AI 处理失败',
      errorMessage: '服务器内部错误，请重试',
      creditCost: 0,
      createdAt: new Date().toISOString(),
    } as RealAiStyleResult)
  }
})
