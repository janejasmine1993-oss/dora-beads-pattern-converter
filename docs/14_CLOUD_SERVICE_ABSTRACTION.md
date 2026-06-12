# 云服务抽象层设计

## 目标

不让业务代码依赖具体的云平台（Cloudflare / 腾讯云 / 阿里云），通过适配器模式（Adapter）和工厂模式（Factory），实现云平台的无缝切换。

## 架构图

```
┌─────────────────────────────────────────┐
│       React 应用 (App.tsx 等)           │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│    业务逻辑层 (components, hooks)        │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     云服务抽象层 (services/)             │
│ ┌────────────────────────────────────┐  │
│ │ StorageService (接口)              │  │
│ │ DatabaseService (接口)             │  │
│ │ AiService (接口)                   │  │
│ │ AuthService (接口)                 │  │
│ │ PaymentService (接口)              │  │
│ └────────────────────────────────────┘  │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│   适配器层 (adapters/)                   │
│ ┌─────────────┐ ┌─────────────┐         │
│ │ CloudflareAdapter │ │ TencentAdapter  │  │
│ │ MockAdapter │ │ AliyunAdapter   │  │
│ └─────────────┘ └─────────────┘         │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  第三方 SDK 和 API                       │
│  Cloudflare API | 腾讯云 SDK | 阿里云 SDK   │
└─────────────────────────────────────────┘
```

## 服务接口定义

### 1. StorageService - 对象存储

**位置：** `src/services/storage/index.ts`

```typescript
export interface IStorageService {
  // 上传文件
  uploadFile(file: File, path: string): Promise<StorageKey>
  
  // 下载文件
  downloadFile(storageKey: StorageKey): Promise<Blob>
  
  // 删除文件
  deleteFile(storageKey: StorageKey): Promise<void>
  
  // 获取签名 URL（用于分享）
  getSignedUrl(storageKey: StorageKey, expiresIn: number): Promise<string>
  
  // 检查文件是否存在
  exists(storageKey: StorageKey): Promise<boolean>
}

export interface StorageKey {
  bucket: string        // 桶名（如 dora-beads）
  path: string          // 文件路径
  contentType: string   // MIME 类型
  etag?: string         // 文件版本标识
  size?: number         // 文件大小
}
```

**实现：**
- `CloudflareAdapter`: 使用 Cloudflare Workers KV
- `TencentAdapter`: 使用腾讯云 COS
- `AliyunAdapter`: 使用阿里云 OSS
- `MockAdapter`: 本地内存（开发测试）

### 2. DatabaseService - 数据库

**位置：** `src/services/database/index.ts`

```typescript
export interface IDatabaseService {
  // 用户操作
  getUser(userId: string): Promise<User | null>
  createUser(user: User): Promise<User>
  updateUser(userId: string, updates: Partial<User>): Promise<User>
  deleteUser(userId: string): Promise<void>

  // 项目操作
  getProject(projectId: string): Promise<Project | null>
  listProjects(userId: string): Promise<Project[]>
  createProject(project: Project): Promise<Project>
  updateProject(projectId: string, updates: Partial<Project>): Promise<Project>
  deleteProject(projectId: string): Promise<void>

  // 图纸操作
  getSavedPattern(patternId: string): Promise<SavedPattern | null>
  listSavedPatterns(userId: string, limit: number): Promise<SavedPattern[]>
  createSavedPattern(pattern: SavedPattern): Promise<SavedPattern>
  
  // 会员操作
  getUserMembership(userId: string): Promise<UserMembership | null>
  setUserMembership(membership: UserMembership): Promise<UserMembership>
  
  // 通用查询接口（支持 ORM 查询）
  query(table: string): IQuery
}

export interface IQuery {
  where(field: string, operator: string, value: unknown): IQuery
  orderBy(field: string, direction: 'asc' | 'desc'): IQuery
  limit(count: number): IQuery
  offset(count: number): IQuery
  execute(): Promise<unknown[]>
}
```

**实现：**
- `TencentAdapter`: 腾讯云 MongoDB / 云数据库
- `AliyunAdapter`: 阿里云 MongoDB / PolarDB
- `MockAdapter`: 本地 Map 存储

### 3. AiService - AI 图像处理

**位置：** `src/services/ai/index.ts`

```typescript
export interface IAiService {
  // 去背景
  removeBackground(imageUrl: string, style: string): Promise<AiServiceResponse>
  
  // 风格转换
  styleTransfer(imageUrl: string, style: string): Promise<AiServiceResponse>
  
  // 超分辨率
  superResolution(imageUrl: string, scaleFactor: 2 | 4): Promise<AiServiceResponse>
  
  // 查询任务状态
  getTaskStatus(taskId: string): Promise<AiTask | null>
  
  // 取消任务
  cancelTask(taskId: string): Promise<void>
  
  // 估算成本
  estimateCost(taskType: string, params: Record<string, unknown>): Promise<number>
}

export interface AiServiceResponse {
  success: boolean
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  outputUrl?: string
  estimatedWaitTime?: number
  error?: { code: string; message: string }
}
```

**实现：**
- `TencentAdapter`: 腾讯云智能图像
- `AliyunAdapter`: 阿里云视觉智能平台
- `MockAdapter`: 本地 mock（返回原图）

### 4. AuthService - 用户认证

**位置：** `src/services/auth/index.ts`

```typescript
export interface IAuthService {
  // 微信登录
  loginWithWeChat(code: string): Promise<AuthToken>
  
  // 手机号登录
  loginWithPhone(phone: string, code: string): Promise<AuthToken>
  
  // 邮箱登录
  loginWithEmail(email: string, password: string): Promise<AuthToken>
  
  // 登出
  logout(userId: string, sessionId: string): Promise<void>
  
  // 刷新 token
  refreshToken(refreshToken: string): Promise<AuthToken>
  
  // 获取当前用户
  getCurrentUser(sessionId: string): Promise<User | null>
  
  // 验证 session
  validateSession(sessionId: string): Promise<boolean>
}

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: User
}
```

**实现：**
- `TencentAdapter`: 腾讯云账号 + 微信登录
- `AliyunAdapter`: 阿里云账号
- `MockAdapter`: 本地 mock

### 5. PaymentService - 支付

**位置：** `src/services/payment/index.ts`

```typescript
export interface IPaymentService {
  // 创建订单
  createOrder(userId: string, amount: number, description: string): Promise<PaymentOrder>
  
  // 获取订单
  getOrder(orderId: string): Promise<PaymentOrder | null>
  
  // 获取支付链接
  getPaymentUrl(orderId: string): Promise<string>
  
  // 验证支付
  verifyPayment(orderId: string, transactionId: string): Promise<boolean>
  
  // 退款
  refund(orderId: string, reason: string): Promise<boolean>
  
  // 处理回调
  handleCallback(callback: PaymentCallback): Promise<void>
}
```

**实现：**
- `WxPayAdapter`: 微信支付
- `AlipayAdapter`: 支付宝
- `StripeAdapter`: Stripe（海外）
- `MockAdapter`: 本地 mock

## 使用示例

### 初始化（在应用启动时）

```typescript
// src/bootstrap.ts

import { setStorageService } from './services/storage'
import { setDatabaseService } from './services/database'
import { setAiService } from './services/ai'
import { setAuthService } from './services/auth'

import { MockStorageService } from './services/storage'
import { MockDatabaseService } from './services/database'
import { MockAiService } from './services/ai'
import { MockAuthService } from './services/auth'

// 或者根据环境变量选择不同的适配器
const provider = process.env.CLOUD_PROVIDER || 'mock'

function initializeServices(provider: string) {
  switch (provider) {
    case 'cloudflare':
      // 暂不实现
      break
    case 'tencentcloud':
      // 暂不实现
      break
    case 'aliyun':
      // 暂不实现
      break
    case 'mock':
    default:
      setStorageService(new MockStorageService())
      setDatabaseService(new MockDatabaseService())
      setAiService(new MockAiService())
      setAuthService(new MockAuthService())
  }
}

initializeServices(provider)
```

### 业务代码（不依赖具体实现）

```typescript
// src/hooks/useUploadPattern.ts

import { getStorageService } from '../services/storage'
import { getDatabaseService } from '../services/database'

export function useUploadPattern() {
  const storage = getStorageService()
  const db = getDatabaseService()

  async function uploadPattern(file: File, projectId: string) {
    // 上传到对象存储
    const storageKey = await storage.uploadFile(file, `patterns/${projectId}`)
    
    // 保存元数据到数据库
    const pattern = await db.createSavedPattern({
      id: uuid(),
      userId: currentUserId,
      projectId,
      patternDataStorageKey: storageKey.path,
      // ...
    })
    
    return pattern
  }

  return { uploadPattern }
}
```

## 迁移计划

### v0.5.4（当前）

- [x] 定义所有服务接口
- [x] 实现 Mock 适配器
- [ ] 应用内导入但不强依赖

### v0.6.1

- [ ] 实现腾讯云 COS 适配器
- [ ] 实现腾讯云数据库适配器
- [ ] 环境变量选择是否使用云服务
- [ ] 内测用户可选迁移到腾讯云

### v0.7.0

- [ ] 实现阿里云 OSS 适配器（可选）
- [ ] 实现微信支付适配器
- [ ] 正式商业化使用云服务

## 最佳实践

1. **不要在组件中直接调用 SDK**：始终通过服务接口
2. **不要硬编码云配置**：使用环境变量或配置文件
3. **错误处理要统一**：在适配器层处理云 API 错误，向上层暴露统一的错误接口
4. **数据转换在适配器**：适配器负责把云 API 响应转换成应用数据模型
5. **单元测试时使用 Mock**：不依赖真实云服务

## 配置文件示例

```env
# .env.development
CLOUD_PROVIDER=mock
CLOUD_REGION=ap-beijing

# .env.production
CLOUD_PROVIDER=tencentcloud
CLOUD_REGION=ap-beijing
TENCENTCLOUD_SECRET_ID=xxx
TENCENTCLOUD_SECRET_KEY=xxx
```
