import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/authService'

export interface AuthRequest extends Request {
  authUser?: { userId: string; email: string }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ success: false, error: '未提供 token' })
  }
  try {
    req.authUser = verifyToken(token)
    next()
  } catch (err) {
    res.status(401).json({ success: false, error: 'token 无效或已过期，请重新登录' })
  }
}
