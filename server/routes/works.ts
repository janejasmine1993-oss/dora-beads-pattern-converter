import express from 'express'
import { getWorksByUserId, getWorkById, createWork, updateWork, deleteWork } from '../services/worksService'
import { authMiddleware, type AuthRequest } from '../middleware/authMiddleware'

export const worksRouter = express.Router()

// GET /api/works - 获取当前用户的所有作品
worksRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const works = await getWorksByUserId(req.authUser.userId)

    res.json({
      success: true,
      works,
    })
  } catch (err) {
    console.error('[Works] GET / error:', err)
    res.status(500).json({ success: false, error: '获取作品列表失败' })
  }
})

// GET /api/works/:id - 获取单个作品
worksRouter.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const work = await getWorkById(req.params.id, req.authUser.userId)

    if (!work) {
      return res.status(404).json({ success: false, error: '作品不存在或无权访问' })
    }

    res.json({
      success: true,
      work,
    })
  } catch (err) {
    console.error('[Works] GET /:id error:', err)
    res.status(500).json({ success: false, error: '获取作品失败' })
  }
})

// POST /api/works - 创建新作品
worksRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const {
      title,
      sourceImageUrl,
      previewImageUrl,
      patternDataUrl,
      beadBrand,
      patternWidth,
      patternHeight,
      colorCount,
      totalBeads,
      status,
    } = req.body

    const work = await createWork(req.authUser.userId, {
      title,
      sourceImageUrl,
      previewImageUrl,
      patternDataUrl,
      beadBrand,
      patternWidth,
      patternHeight,
      colorCount,
      totalBeads,
      status,
    })

    res.status(201).json({
      success: true,
      work,
    })
  } catch (err) {
    console.error('[Works] POST / error:', err)
    res.status(500).json({ success: false, error: '创建作品失败' })
  }
})

// PATCH /api/works/:id - 更新作品
worksRouter.patch('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const {
      title,
      sourceImageUrl,
      previewImageUrl,
      patternDataUrl,
      beadBrand,
      patternWidth,
      patternHeight,
      colorCount,
      totalBeads,
      status,
    } = req.body

    const work = await updateWork(req.params.id, req.authUser.userId, {
      title,
      sourceImageUrl,
      previewImageUrl,
      patternDataUrl,
      beadBrand,
      patternWidth,
      patternHeight,
      colorCount,
      totalBeads,
      status,
    })

    if (!work) {
      return res.status(404).json({ success: false, error: '作品不存在或无权访问' })
    }

    res.json({
      success: true,
      work,
    })
  } catch (err) {
    console.error('[Works] PATCH /:id error:', err)
    res.status(500).json({ success: false, error: '更新作品失败' })
  }
})

// DELETE /api/works/:id - 删除作品
worksRouter.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const success = await deleteWork(req.params.id, req.authUser.userId)

    if (!success) {
      return res.status(404).json({ success: false, error: '作品不存在或无权访问' })
    }

    res.json({
      success: true,
      message: '作品已删除',
    })
  } catch (err) {
    console.error('[Works] DELETE /:id error:', err)
    res.status(500).json({ success: false, error: '删除作品失败' })
  }
})
