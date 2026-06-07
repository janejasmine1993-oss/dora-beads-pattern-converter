import express from 'express'
import { getCreditsByUserId, consumeCredits, resetDailyUsage } from '../services/creditsService'
import { authMiddleware, type AuthRequest } from '../middleware/authMiddleware'

export const creditsRouter = express.Router()

// GET /api/credits/me
creditsRouter.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const credits = await getCreditsByUserId(req.authUser.userId)
    if (!credits) {
      return res.status(404).json({ success: false, error: '无法获取 AI 次数信息' })
    }

    res.json({
      success: true,
      credits,
    })
  } catch (err) {
    console.error('[Credits] /me error:', err)
    res.status(500).json({ success: false, error: '获取 AI 次数信息失败' })
  }
})

// POST /api/credits/consume
creditsRouter.post('/consume', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const { amount = 1, reason = 'ai_optimize', relatedJobId } = req.body

    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, error: '无效的扣除数量' })
    }

    const result = await consumeCredits(req.authUser.userId, amount, reason, relatedJobId)

    if (!result.success) {
      return res.status(400).json(result)
    }

    res.json(result)
  } catch (err) {
    console.error('[Credits] consume error:', err)
    res.status(500).json({ success: false, error: '扣除 AI 次数失败' })
  }
})

// POST /api/credits/dev-reset (仅开发环境)
creditsRouter.post('/dev-reset', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // 生产环境禁用
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: '该接口仅开发环境可用' })
    }

    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const credits = await resetDailyUsage(req.authUser.userId)

    res.json({
      success: true,
      credits,
    })
  } catch (err) {
    console.error('[Credits] dev-reset error:', err)
    res.status(500).json({ success: false, error: '重置 AI 次数失败' })
  }
})
