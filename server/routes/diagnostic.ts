import express from 'express'
import { randomUUID } from 'crypto'
import { prisma } from '../services/db'
import { hashPassword, signToken } from '../services/authService'
import { findUserByEmail } from '../services/dbUserStore'

export const diagnosticRouter = express.Router()

// GET /api/diagnostic - 完整诊断
diagnosticRouter.get('/', async (req, res) => {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    tests: {},
  }

  // 测试 1: 数据库连接
  try {
    await prisma.$queryRaw`SELECT 1`
    results.tests.database_connection = { status: 'ok', message: '数据库连接成功' }
  } catch (err: any) {
    results.tests.database_connection = {
      status: 'failed',
      error: err.message || String(err),
    }
  }

  // 测试 2: 查询 user 表
  try {
    const count = await prisma.user.count()
    results.tests.user_table_query = {
      status: 'ok',
      message: `user 表存在，当前有 ${count} 个用户`,
      user_count: count,
    }
  } catch (err: any) {
    results.tests.user_table_query = {
      status: 'failed',
      error: err.message || String(err),
    }
  }

  // 测试 3: bcryptjs 密码 hash
  try {
    const hash = await hashPassword('test123')
    results.tests.bcryptjs_hash = {
      status: 'ok',
      message: '密码 hash 成功',
      hash_length: hash.length,
    }
  } catch (err: any) {
    results.tests.bcryptjs_hash = {
      status: 'failed',
      error: err.message || String(err),
    }
  }

  // 测试 4: JWT 生成
  try {
    const token = signToken('test-user-id', 'test@test.com')
    results.tests.jwt_generation = {
      status: 'ok',
      message: 'JWT token 生成成功',
      token_length: token.length,
    }
  } catch (err: any) {
    results.tests.jwt_generation = {
      status: 'failed',
      error: err.message || String(err),
    }
  }

  // 测试 5: 完整注册流程
  try {
    const testEmail = `diagnostic-${Date.now()}@test.com`
    const testPassword = 'Test@123456'
    const testNickname = 'DiagnosticTest'

    const existing = await findUserByEmail(testEmail)
    if (existing) {
      results.tests.full_register_flow = {
        status: 'warning',
        message: '测试邮箱已存在',
      }
    } else {
      const userId = randomUUID()
      const passwordHash = await hashPassword(testPassword)

      const createdUser = await prisma.user.create({
        data: {
          id: userId,
          email: testEmail,
          nickname: testNickname,
          avatarUrl: '',
          passwordHash,
          createdAt: new Date(),
        },
      })

      results.tests.full_register_flow = {
        status: 'ok',
        message: '完整注册流程测试成功',
        user_id: createdUser.id,
        email: createdUser.email,
      }
    }
  } catch (err: any) {
    results.tests.full_register_flow = {
      status: 'failed',
      error: err.message || String(err),
      error_code: err.code,
    }
  }

  // 总结
  const passedTests = Object.values(results.tests).filter(
    (t: any) => t.status === 'ok'
  ).length
  const failedTests = Object.values(results.tests).filter(
    (t: any) => t.status === 'failed'
  ).length

  results.summary = {
    total: Object.keys(results.tests).length,
    passed: passedTests,
    failed: failedTests,
    warnings: Object.values(results.tests).filter(
      (t: any) => t.status === 'warning'
    ).length,
  }

  res.json(results)
})
