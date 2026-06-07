import express from 'express'
import type { RealAiStyleRequest, RealAiStyleResult } from '../../src/services/ai/aiProviderTypes'

export const aiStyleRouter = express.Router()

// POST /api/ai-style/generate
aiStyleRouter.post('/generate', async (req: express.Request, res: express.Response) => {
  try {
    const body = req.body as Partial<RealAiStyleRequest>

    // 验证请求体
    if (!body.presetId || !body.sourceImage) {
      return res.status(400).json({
        id: `error_${Date.now()}`,
        provider: 'mock',
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
        provider: 'mock',
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
        provider: 'mock',
        status: 'failed',
        presetId: body.presetId,
        message: '图片格式不支持',
        errorMessage: '仅支持 JPG / PNG / WEBP 格式',
        creditCost: 0,
        createdAt: new Date().toISOString(),
      } as RealAiStyleResult)
    }

    // 当前版本：返回 mock 结果
    // TODO: 后续接入真实 AI 服务商（腾讯混元、火山引擎等）
    const result: RealAiStyleResult = {
      id: `real_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: process.env.AI_PROVIDER === 'real' ? 'tencent-hunyuan' : 'mock',
      status: 'success',
      presetId: body.presetId,
      message: `[后端代理] AI 风格化 mock 已完成：${body.presetId}`,
      creditCost: 1,
      createdAt: new Date().toISOString(),
    }

    res.json(result)
  } catch (error) {
    console.error('Generate Error:', error)
    res.status(500).json({
      id: `error_${Date.now()}`,
      provider: 'mock',
      status: 'failed',
      presetId: '',
      message: 'AI 处理失败',
      errorMessage: '服务器内部错误，请重试',
      creditCost: 0,
      createdAt: new Date().toISOString(),
    } as RealAiStyleResult)
  }
})
