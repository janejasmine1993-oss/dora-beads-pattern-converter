import express from 'express'
import { getMembershipByUserId, upgradeMembership, MEMBERSHIP_BENEFITS } from '../services/membershipService'
import { getCreditsByUserId } from '../services/creditsService'
import { authMiddleware, type AuthRequest } from '../middleware/authMiddleware'

export const membershipRouter = express.Router()

// GET /api/membership/me
membershipRouter.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const membership = await getMembershipByUserId(req.authUser.userId)
    if (!membership) {
      return res.status(404).json({ success: false, error: '无法获取会员信息' })
    }

    res.json({
      success: true,
      membership,
    })
  } catch (err) {
    console.error('[Membership] /me error:', err)
    res.status(500).json({ success: false, error: '获取会员信息失败' })
  }
})

// POST /api/membership/dev-upgrade (仅开发环境)
membershipRouter.post('/dev-upgrade', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // 生产环境禁用
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, error: '该接口仅开发环境可用' })
    }

    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const { level } = req.body

    if (!level || !MEMBERSHIP_BENEFITS[level as keyof typeof MEMBERSHIP_BENEFITS]) {
      return res.status(400).json({ success: false, error: '无效的会员等级' })
    }

    const membership = await upgradeMembership(req.authUser.userId, level)

    // 获取更新后的 AI 次数
    const credits = await getCreditsByUserId(req.authUser.userId)

    res.json({
      success: true,
      membership,
      credits,
    })
  } catch (err) {
    console.error('[Membership] dev-upgrade error:', err)
    res.status(500).json({ success: false, error: '升级会员失败' })
  }
})
