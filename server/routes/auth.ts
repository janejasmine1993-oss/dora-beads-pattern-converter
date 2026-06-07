import express from 'express'
import { randomUUID } from 'crypto'
import { hashPassword, verifyPassword, signToken } from '../services/authService'
import { findUserByEmail, findUserById, createUser, updateLastLoginAt } from '../services/dbUserStore'
import { authMiddleware, type AuthRequest } from '../middleware/authMiddleware'
import type { RegisterRequest, LoginRequest, AuthUser, ErrorResponse } from '../types/auth'

export const authRouter = express.Router()

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body as RegisterRequest

    // 校验
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, error: '邮箱不能为空' } as ErrorResponse)
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: '密码至少 6 位' } as ErrorResponse)
    }
    if (!nickname || typeof nickname !== 'string') {
      return res.status(400).json({ success: false, error: '昵称不能为空' } as ErrorResponse)
    }

    // 检查 email 是否已存在
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ success: false, error: '该邮箱已被注册' } as ErrorResponse)
    }

    // 密码 hash
    const passwordHash = await hashPassword(password)
    const userId = randomUUID()

    // 创建用户
    const storedUser = await createUser({
      id: userId,
      email,
      nickname,
      avatarUrl: '',
      passwordHash,
      createdAt: new Date().toISOString(),
    })

    // 生成 token
    const token = signToken(userId, email)

    // 返回用户信息（不含 passwordHash）
    const authUser: AuthUser = {
      id: storedUser.id,
      email: storedUser.email,
      nickname: storedUser.nickname,
      avatarUrl: storedUser.avatarUrl,
      loginProvider: 'email',
    }

    res.status(201).json({
      success: true,
      token,
      user: authUser,
    })
  } catch (err) {
    console.error('[Auth] Register error:', err)
    res.status(500).json({ success: false, error: '注册失败，请稍后重试' } as ErrorResponse)
  }
})

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as LoginRequest

    if (!email || !password) {
      return res.status(400).json({ success: false, error: '邮箱或密码不能为空' } as ErrorResponse)
    }

    // 查找用户
    const user = await findUserByEmail(email)
    if (!user) {
      return res.status(401).json({ success: false, error: '邮箱或密码错误' } as ErrorResponse)
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ success: false, error: '邮箱或密码错误' } as ErrorResponse)
    }

    // 更新最后登录时间
    await updateLastLoginAt(user.id)

    // 生成 token
    const token = signToken(user.id, user.email)

    // 返回用户信息（不含 passwordHash）
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      loginProvider: 'email',
    }

    res.json({
      success: true,
      token,
      user: authUser,
    })
  } catch (err) {
    console.error('[Auth] Login error:', err)
    res.status(500).json({ success: false, error: '登录失败，请稍后重试' } as ErrorResponse)
  }
})

// GET /api/auth/me
authRouter.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ success: false, error: '无效的身份' } as ErrorResponse)
    }

    // 查找用户
    const user = await findUserById(req.authUser.userId)
    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' } as ErrorResponse)
    }

    // 返回用户信息（不含 passwordHash）
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      loginProvider: 'email',
    }

    res.json({
      success: true,
      user: authUser,
    })
  } catch (err) {
    console.error('[Auth] /me error:', err)
    res.status(500).json({ success: false, error: '获取用户信息失败' } as ErrorResponse)
  }
})

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  // 前端负责清除 localStorage token，服务端返回成功即可
  res.json({ success: true })
})
