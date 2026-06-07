import express from 'express'
import type { RealAiStyleRequest, RealAiStyleResult } from '../types/aiProvider'
import { getTencentHunyuanProvider } from '../services/providers/tencentHunyuanProvider'
import { authMiddleware, type AuthRequest } from '../middleware/authMiddleware'
import { getCreditsByUserId, consumeCredits } from '../services/creditsService'
import { createAiJob, markAiJobSuccess, markAiJobFailed } from '../services/aiJobService'
import { createUploadedImage } from '../services/uploadedImageService'
import { uploadBufferToCos, generateCosKey, getPublicFileUrl } from '../services/cosService'
import { randomUUID } from 'crypto'

export const aiStyleRouter = express.Router()

// POST /api/ai-style/generate
aiStyleRouter.post('/generate', authMiddleware, async (req: AuthRequest, res: express.Response) => {
  try {
    // 验证登录
    if (!req.authUser) {
      return res.status(401).json({
        id: `error_${Date.now()}`,
        provider: 'unknown',
        status: 'failed',
        presetId: '',
        message: '未登录',
        errorMessage: '请先登录',
        creditCost: 0,
        createdAt: new Date().toISOString(),
      } as RealAiStyleResult)
    }

    const userId = req.authUser.userId
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

    // 检查 AI 次数是否足够
    const credits = await getCreditsByUserId(userId)
    if (!credits || credits.dailyRemaining + credits.extraCredits < 1) {
      return res.status(402).json({
        id: `error_${Date.now()}`,
        provider: 'unknown',
        status: 'failed',
        presetId: body.presetId,
        message: 'AI 次数不足',
        errorMessage: 'AI 次数不足，请升级会员或稍后再试',
        creditCost: 0,
        createdAt: new Date().toISOString(),
      } as RealAiStyleResult)
    }

    // 创建 AI Job 记录
    const runtimeMode = process.env.AI_RUNTIME_MODE || 'mock'
    const provider = process.env.AI_PROVIDER || 'mock'
    const providerName = (runtimeMode === 'real' && provider === 'tencent-hunyuan') ? 'tencent-hunyuan' : 'mock'

    const aiJob = await createAiJob({
      userId,
      presetId: body.presetId,
      provider: providerName,
      sourceImageUrl: body.sourceImage.url, // 如果前端提供了 COS URL
    })

    console.log(`[AI Generate] Mode: ${runtimeMode}, Provider: ${provider}, Preset: ${body.presetId}, JobId: ${aiJob.id}`)

    let result: RealAiStyleResult
    let resultImageUrl: string | null = null

    try {
      if (providerName === 'tencent-hunyuan') {
        // 调用腾讯混元 provider
        const tencentProvider = getTencentHunyuanProvider()
        result = await tencentProvider.generate(body as RealAiStyleRequest)

        // 如果成功，处理结果图
        if (result.status === 'success' && result.resultImageBase64) {
          // 上传结果图到 COS
          const ext = 'png'
          const jobImageId = randomUUID()
          const cosKey = generateCosKey({
            userId,
            type: 'ai-result',
            id: jobImageId,
            ext,
          })

          // 尝试上传到 COS
          if (process.env.COS_SECRET_ID && process.env.COS_BUCKET) {
            try {
              const buffer = Buffer.from(result.resultImageBase64, 'base64')
              await uploadBufferToCos({
                bucket: process.env.COS_BUCKET,
                region: process.env.COS_REGION || 'ap-guangzhou',
                key: cosKey,
                body: buffer,
                contentType: 'image/png',
              })

              const baseUrl = process.env.COS_BASE_URL || `https://${process.env.COS_BUCKET}.cos.${process.env.COS_REGION || 'ap-guangzhou'}.myqcloud.com`
              resultImageUrl = getPublicFileUrl({
                baseUrl,
                key: cosKey,
              })
            } catch (uploadErr) {
              console.error('[AI Result Upload] COS upload failed:', uploadErr)
            }
          }

          // 如果没有上传到 COS，使用临时 base64 或腾讯返回的 URL
          if (!resultImageUrl) {
            resultImageUrl = result.resultImageUrl || `data:image/png;base64,${result.resultImageBase64}`
          }

          // 保存到 uploaded_images
          try {
            await createUploadedImage({
              userId,
              type: 'ai_result',
              fileUrl: resultImageUrl,
              fileName: `ai-result-${jobImageId}.png`,
              mimeType: 'image/png',
            })
          } catch (dbErr) {
            console.error('[AI Result Save] Database save failed:', dbErr)
          }
        }
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

        // Mock 模式：生成 mock result image URL
        resultImageUrl = `http://localhost:3001/mock-ai-result/${aiJob.id}.png`

        // 保存 mock 结果到 uploaded_images
        try {
          await createUploadedImage({
            userId,
            type: 'ai_result',
            fileUrl: resultImageUrl,
            fileName: `ai-result-${aiJob.id}.png`,
            mimeType: 'image/png',
          })
        } catch (dbErr) {
          console.error('[AI Result Save] Database save failed:', dbErr)
        }
      }

      // 如果 AI 成功，扣除 AI 次数
      if (result.status === 'success') {
        try {
          await markAiJobSuccess(aiJob.id, userId, resultImageUrl || '')
          await consumeCredits(userId, 1, 'ai_optimize', aiJob.id)

          // 添加结果图 URL 到返回值
          result.resultImageUrl = resultImageUrl || undefined
        } catch (creditErr) {
          console.error('[AI Credits] Failed to consume credits:', creditErr)
          // 不返回错误，只记录日志，因为 AI 已经成功了
        }
      } else {
        // 如果失败，记录错误
        await markAiJobFailed(aiJob.id, userId, result.errorMessage || 'Unknown error')
      }
    } catch (error) {
      // AI 调用失败
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      await markAiJobFailed(aiJob.id, userId, errorMsg)

      result = {
        id: aiJob.id,
        provider: (providerName as any),
        status: 'failed',
        presetId: body.presetId,
        message: 'AI 处理失败',
        errorMessage: errorMsg,
        creditCost: 0,
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
