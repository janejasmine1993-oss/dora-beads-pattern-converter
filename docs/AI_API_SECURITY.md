# AI API 安全指南

## 核心原则：前端无 Key，后端有 Key

### ❌ **禁止在前端存储 API Key**

```typescript
// ❌ 错误做法
const apiKey = 'sk-xxxxxxxxxxxx'  // 绝对不行！
const apiKey = import.meta.env.VITE_API_KEY  // ❌ 前端环境变量暴露
localStorage.setItem('api-key', key)  // ❌ localStorage 暴露
```

### ✅ **正确做法：后端代理**

```
用户浏览器
    ↓
前端应用（zero API keys）
    ↓
Node.js 后端代理（has API keys in .env）
    ↓
腾讯混元 / 火山引擎 / OpenAI API
```

---

## 安全检查清单

### 1. API Key 管理

- [ ] 所有 API Key 仅在 `.env.local` 中存储
- [ ] `.env.local` 已添加到 `.gitignore`
- [ ] 前端代码中不包含任何 `VITE_SECRET_*` 环境变量
- [ ] 后端 server/ 目录有 `.env.local` 不追踪的配置
- [ ] 敏感信息不会通过错误信息暴露给用户

### 2. 网络请求

- [ ] 前端仅请求自己的后端 `/api/ai-style/*` 路由
- [ ] 后端不将 API Key 返回给前端
- [ ] 后端响应中不包含原始 API Key
- [ ] 所有外部 API 调用都在后端进行

### 3. 用户认证

- [ ] 后端验证用户身份（如有登录系统）
- [ ] 后端验证用户有足够的 AI 次数
- [ ] 后端记录用户的 API 调用日志
- [ ] 后端防止未认证用户调用 API

### 4. 速率限制

- [ ] 后端实现速率限制（如 10 req/min per user）
- [ ] 后端防止同一用户快速刷次数
- [ ] 后端防止同一 IP 大量请求
- [ ] 超限时返回 429 Too Many Requests

### 5. 图片处理

- [ ] 检查上传图片大小（最大 5MB）
- [ ] 检查图片格式（仅允许 JPG/PNG/WEBP）
- [ ] 检查图片内容安全（可选，依赖于业务）
- [ ] 删除处理后的临时文件

### 6. 错误处理

- [ ] 后端捕获所有真实 API 错误
- [ ] 不将真实 API 错误信息返回给前端
- [ ] 不暴露底层实现细节（如服务商名称）
- [ ] 前端显示用户友好的错误消息

### 7. 日志记录

- [ ] 记录每次 AI 调用（user_id, preset, timestamp）
- [ ] 记录调用结果（成功/失败）
- [ ] 记录 API 费用消耗
- [ ] 定期审查日志查找异常

### 8. 监控告警

- [ ] 监控后端错误率
- [ ] 监控成本消耗速度
- [ ] 监控异常流量
- [ ] 设置告警阈值（如成本超过 $100/天）

---

## 后端代理实现要点

### 安全的后端服务框架

```typescript
// server/index.ts
import express from 'express'
import { aiStyleRouter } from './routes/aiStyle'

const app = express()

// 中间件：验证用户身份
app.use('/api', authenticateUser)

// 中间件：速率限制
app.use('/api', rateLimit({ windowMs: 60000, max: 10 }))

// 中间件：检查 AI 次数
app.use('/api/ai-style', checkAiCredits)

// 路由：AI 风格化
app.use('/api/ai-style', aiStyleRouter)

export default app
```

### 防止 API Key 泄露的检查

```typescript
// 回应前检查
function sanitizeResponse(data: any): any {
  delete data.apiKey
  delete data.secretKey
  delete data.apiSecret
  return data
}
```

---

## 前端安全要求

### 环境变量检查

```bash
# ✅ 正确：后端环境变量（不暴露）
TENCENT_SECRET_ID=xxx
TENCENT_SECRET_KEY=xxx

# ❌ 错误：前端环境变量
VITE_API_KEY=xxx
VITE_SECRET=xxx
```

### 请求示例

```typescript
// ✅ 正确：请求自己的后端
const response = await fetch('/api/ai-style/generate', {
  method: 'POST',
  body: JSON.stringify({ presetId, sourceImage }),
})

// ❌ 错误：直接请求第三方 API
const response = await fetch('https://api.tencentcloud.com/...', {
  headers: { Authorization: `Bearer ${apiKey}` },
})
```

---

## CI/CD 安全

### GitHub Actions 配置

```yaml
# ✅ 正确：使用 GitHub Secrets
- name: Deploy
  env:
    TENCENT_SECRET_ID: ${{ secrets.TENCENT_SECRET_ID }}
    TENCENT_SECRET_KEY: ${{ secrets.TENCENT_SECRET_KEY }}
  run: npm run deploy
```

### 构建检查

```bash
# ✅ 检查前端代码中没有 API Key
grep -r "TENCENT_SECRET_ID\|OPENAI_API_KEY" src/
# 应该无输出
```

---

## 故障排查

### 如果前端意外拥有 API Key

1. 立即重置所有 API Key
2. 检查 `.env.local` 是否在 `.gitignore` 中
3. 检查 Git 历史是否包含密钥（`git log -S "secret"`）
4. 如果已提交，使用 `git-filter-branch` 清理历史

### 如果后端暴露了错误信息

```typescript
// ❌ 错误
catch (error) {
  res.json({ error: error.message })  // 暴露真实错误
}

// ✅ 正确
catch (error) {
  console.error('API Error:', error)  // 服务器日志
  res.json({ error: 'AI 处理失败，请重试' })  // 用户友好
}
```

---

## 审计清单（部署前）

- [ ] 扫描前端代码，确认没有 API Key
- [ ] 检查 `.gitignore` 包含 `.env.local`
- [ ] 测试 API Key 轮换流程
- [ ] 测试 API 速率限制
- [ ] 测试错误消息不暴露内部细节
- [ ] 检查日志不记录敏感信息
- [ ] 验证后端仅接受来自自己的请求
- [ ] 配置监控告警

---

## 相关链接

- [OWASP API 安全 Top 10](https://owasp.org/www-project-api-security/)
- [Node.js 环境变量最佳实践](https://nodejs.org/en/knowledge/file-system/security/introduction/)

