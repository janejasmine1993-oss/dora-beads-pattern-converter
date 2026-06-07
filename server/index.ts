import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })  // 加载 .env.local 文件
import express from 'express'
import cors from 'cors'
import { aiStyleRouter } from './routes/aiStyle'
import { authRouter } from './routes/auth'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'dora-beads-ai-server',
    version: '0.7.3',
    timestamp: new Date().toISOString(),
  })
})

// AI 健康检查（带 provider 信息）
app.get('/api/health', (req, res) => {
  const runtimeMode = process.env.AI_RUNTIME_MODE || 'mock'
  const provider = process.env.AI_PROVIDER || 'mock'
  const hasKeys = !!(process.env.TENCENT_SECRET_ID && process.env.TENCENT_SECRET_KEY)

  res.json({
    ok: true,
    service: 'dora-beads-ai-server',
    version: '0.7.3',
    ai: {
      runtimeMode,
      provider,
      tencentKeysConfigured: hasKeys,
      status: runtimeMode === 'real' && provider === 'tencent-hunyuan' ? (hasKeys ? 'ready' : 'missing-keys') : 'mock-mode',
    },
    timestamp: new Date().toISOString(),
  })
})

// AI 风格化路由
app.use('/api/ai-style', aiStyleRouter)

// Auth 路由
app.use('/api/auth', authRouter)

// 错误处理中间件
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((err: any, _req: express.Request, res: express.Response) => {
  console.error('Server Error:', err)
  res.status(500).json({
    id: `error_${Date.now()}`,
    provider: 'error',
    status: 'failed',
    presetId: '',
    message: 'AI 服务暂时不可用',
    errorMessage: '服务器内部错误',
    creditCost: 0,
    createdAt: new Date().toISOString(),
  })
})

// 启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  app.listen(PORT, () => {
    console.log(`🚀 AI Style Server running at http://localhost:${PORT}`)
  })
}

export default app
