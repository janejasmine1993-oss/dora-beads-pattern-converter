import express from 'express'
import { authMiddleware, type AuthRequest } from '../middleware/authMiddleware'
import { uploadBufferToCos, generateCosKey, getPublicFileUrl } from '../services/cosService'
import { createUploadedImage } from '../services/uploadedImageService'
import { randomUUID } from 'crypto'

export const uploadsRouter = express.Router()

// POST /api/uploads/image - 上传图片
uploadsRouter.post('/image', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    // 获取上传的文件内容和元数据（从 req.body 或 multipart）
    const { base64Data, fileName, mimeType, type = 'source' } = req.body

    if (!base64Data || !fileName || !mimeType) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: base64Data, fileName, mimeType',
      })
    }

    // 验证文件类型
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      return res.status(400).json({
        success: false,
        error: '仅支持 JPG / PNG / WEBP 格式',
      })
    }

    // 验证文件大小（base64 数据的大小约为原始大小的 1.33 倍）
    const buffer = Buffer.from(base64Data, 'base64')
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (buffer.length > maxSize) {
      return res.status(400).json({
        success: false,
        error: `文件超过 5MB 限制 (当前: ${(buffer.length / 1024 / 1024).toFixed(1)}MB)`,
      })
    }

    // 生成文件扩展名
    const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType === 'image/png' ? 'png' : 'webp'
    const imageId = randomUUID()

    // 生成 COS 存储路径
    const cosKey = generateCosKey({
      userId: req.authUser.userId,
      type: 'upload',
      id: imageId,
      ext,
    })

    // 检查 COS 配置
    if (!process.env.COS_SECRET_ID || !process.env.COS_BUCKET) {
      // Mock 模式：生成本地 mock URL
      const mockUrl = `http://localhost:3001/mock-cos/${cosKey}`

      const image = await createUploadedImage({
        userId: req.authUser.userId,
        type: 'source',
        fileUrl: mockUrl,
        fileName,
        mimeType,
        size: buffer.length,
      })

      return res.status(201).json({
        success: true,
        image,
      })
    }

    // 上传到 COS
    const uploadResult = await uploadBufferToCos({
      bucket: process.env.COS_BUCKET,
      region: process.env.COS_REGION || 'ap-guangzhou',
      key: cosKey,
      body: buffer,
      contentType: mimeType,
    })

    // 生成公开 URL
    const baseUrl = process.env.COS_BASE_URL || uploadResult.location.replace(/\?.*$/, '')
    const fileUrl = getPublicFileUrl({
      baseUrl,
      key: cosKey,
    })

    // 保存到 uploaded_images 表
    const image = await createUploadedImage({
      userId: req.authUser.userId,
      type: 'source',
      fileUrl,
      fileName,
      mimeType,
      size: buffer.length,
    })

    res.status(201).json({
      success: true,
      image,
    })
  } catch (err) {
    console.error('[Uploads] POST /image error:', err)
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : '图片上传失败',
    })
  }
})

// Mock COS 文件返回（仅用于开发）
uploadsRouter.get('/mock-cos/*', async (req, res) => {
  // 这是一个 mock 端点，实际应该从 COS 获取
  res.status(404).json({ error: 'Mock COS file not found' })
})
