# 数据模型设计

## 核心表结构

### 1. users - 用户信息

```javascript
{
  _id: ObjectId,
  id: string,                    // 应用层 ID (uuid)
  email: string,                 // 邮箱（可选）
  phone: string,                 // 手机（可选）
  openId: string,                // 微信/QQ openId
  nickname: string,              // 昵称
  avatar: string,                // 头像 URL
  preferredBrand: string,        // 默认品牌 (MARD / PERLER / etc)
  totalPatterns: number,         // 总生成图纸数
  totalExports: number,          // 总导出次数
  aiTasksUsed: number,           // 已用 AI 次数
  createdAt: timestamp,          // 注册时间
  lastLoginAt: timestamp,        // 最后登录时间
  isTestUser: boolean,           // 是否为内测用户
  isBlocked: boolean,            // 是否被封禁
}

索引：
- unique: openId
- unique: email
- index: createdAt (倒序)
- index: isTestUser
```

### 2. memberships - 会员状态

```javascript
{
  _id: ObjectId,
  id: string,
  userId: string,                // 关联 users._id
  tier: enum,                    // free | test | basic | pro | enterprise
  planId: string,                // 关联的计划 ID
  startDate: timestamp,          // 生效时间
  endDate: timestamp,            // 失效时间
  autoRenew: boolean,            // 是否自动续费
  isActive: boolean,             // 是否当前有效
  updatedAt: timestamp,
}

索引：
- unique: userId (一个用户一条记录)
- index: isActive
- index: endDate
```

### 3. projects - 项目/作品

```javascript
{
  _id: ObjectId,
  id: string,
  userId: string,                // 关联 users._id
  name: string,                  // 项目名称
  description: string,           // 项目描述
  thumbnail: string,             // 缩略图 URL
  brand: string,                 // 品牌 (MARD / PERLER / etc)
  patternSize: {                 // 图纸尺寸
    width: number,
    height: number,
  },
  tags: [string],                // 标签
  isPublic: boolean,             // 是否公开
  isDeleted: boolean,            // 软删除标记
  stats: {
    views: number,               // 浏览数
    downloads: number,           // 下载数
    favorites: number,           // 收藏数
  },
  createdAt: timestamp,
  updatedAt: timestamp,
}

索引：
- index: userId, createdAt (倒序)
- index: isPublic, isDeleted
- index: tags
```

### 4. pattern_files - 图纸文件元数据

```javascript
{
  _id: ObjectId,
  id: string,
  projectId: string,             // 关联 projects._id
  filename: string,              // 原始文件名
  fileType: enum,                // source | pattern | export
  storageKey: string,            // 对象存储 key（见下文）
  mimeType: string,              // image/png, image/jpeg, etc
  sizeBytes: number,             // 文件大小
  generationMethod: enum,        // photo-direct | ai-enhanced | pixel-grid | existing-pattern
  metadata: {
    width?: number,
    height?: number,
    // 其他自定义字段
  },
  uploadedAt: timestamp,
}

索引：
- index: projectId
- index: fileType
```

### 5. pattern_data - 图纸数据元数据

**关键决策：PatternData.cells 过大，不存数据库**

```javascript
{
  _id: ObjectId,
  id: string,
  projectId: string,
  fileId: string,                // 关联 pattern_files._id
  
  // 不存 cells！cells 存对象存储
  storageKey: string,            // COS 中存储 cells 的 key
  
  // 只存 metadata
  metadata: {
    brand: string,
    width: number,
    height: number,
    totalBeads: number,
    uniqueColors: number,
    beadCounts: {                // 按颜色统计豆数
      colorCode: number,
      // ...
    },
    colorStats: [                // 详细的色号统计
      {
        colorCode: string,
        colorName: string,
        count: number,
        countWithLoss: number,
        grams: number,
      },
      // ...
    ],
  },
  
  generatedAt: timestamp,
  processingDurationMs: number,  // 生成耗时
}

索引：
- unique: fileId (一个文件一条 pattern_data)
- index: projectId
- index: generatedAt
```

### 6. ai_tasks - AI 任务记录

```javascript
{
  _id: ObjectId,
  id: string,
  userId: string,
  projectId: string,             // 可选
  
  taskType: enum,                // background-removal | style-transfer | super-resolution
  status: enum,                  // pending | processing | completed | failed | cancelled
  
  inputImageUrl: string,
  outputImageUrl?: string,       // 完成后生成
  
  params: {
    // 根据 taskType 不同
    // background-removal: { style: 'basic' | 'flat' | ... }
    // style-transfer: { sourceStyle: string }
    // super-resolution: { scaleFactor: 2 | 4 }
  },
  
  costCredit: number,            // 消耗的积分/次数
  
  createdAt: timestamp,
  startedAt?: timestamp,
  completedAt?: timestamp,
  errorMessage?: string,
  retryCount: number,
}

索引：
- index: userId, createdAt (倒序)
- index: status
- index: projectId
```

### 7. usage_logs - 用户行为日志

```javascript
{
  _id: ObjectId,
  id: string,
  userId: string,
  
  action: enum,                  // pattern-generated | export | ai-used | file-upload
  taskType?: string,             // 可选：使用的服务类型
  costCredit: number,            // 消耗的积分/次数
  
  metadata: {
    projectId?: string,
    fileId?: string,
    patternSize?: { width, height },
    // 其他自定义字段
  },
  
  timestamp: timestamp,
}

索引：
- index: userId, timestamp (倒序)
- index: action
- TTL: 90 天自动删除（可选）
```

### 8. orders - 订单

```javascript
{
  _id: ObjectId,
  id: string,
  orderId: string,               // 业务 order ID
  userId: string,
  
  type: enum,                    // membership | ai-credits
  
  amount: number,                // 金额（分）
  currency: string,              // CNY | USD
  
  paymentMethod: enum,           // wxpay | alipay | stripe
  
  status: enum,                  // pending | completed | failed | refunded
  
  relatedId: string,             // 关联的 membership_id 或 credit_record_id
  
  transactionId?: string,        // 第三方支付交易号
  
  createdAt: timestamp,
  completedAt?: timestamp,
}

索引：
- unique: orderId
- index: userId, createdAt
- index: status
```

### 9. redeem_codes - 兑换码

```javascript
{
  _id: ObjectId,
  id: string,
  code: string,                  // 兑换码 (e.g., DORA2024ALPHA001)
  
  rewardType: enum,              // membership | ai-credits | lifetime
  rewardValue: any,              // 根据 type
  
  maxRedeems: number,            // 最多可兑换次数
  currentRedeems: number,        // 已兑换次数
  
  createdAt: timestamp,
  expiresAt: timestamp,
  
  createdBy: string,             // 创建人（后台管理员）
  notes: string,                 // 备注（内部用）
}

索引：
- unique: code
- index: expiresAt
```

### 10. redeem_records - 兑换记录

```javascript
{
  _id: ObjectId,
  id: string,
  userId: string,
  codeId: string,                // 关联 redeem_codes._id
  code: string,                  // 冗余存储便于查询
  
  rewardType: enum,
  rewardValue: any,
  
  redeemAt: timestamp,
  validUntil: timestamp,         // 奖励过期时间
}

索引：
- unique: (userId, codeId) (一个用户一个码只能兑换一次)
- index: userId, redeemAt
```

## 存储方案

### 对象存储 (Tencent COS / Aliyun OSS)

**原始图片**

```
s3://dora-beads/users/{userId}/source-images/{fileId}.jpg
```

**生成的图纸 PNG**

```
s3://dora-beads/users/{userId}/exports/{projectId}/{format}/professional.png
s3://dora-beads/users/{userId}/exports/{projectId}/{format}/draft.png
```

**图纸数据（JSON 压缩）**

```
s3://dora-beads/users/{userId}/patterns/{projectId}/pattern-data.json.gz

内容：
{
  width: 52,
  height: 52,
  cells: [
    { row: 0, col: 0, colorCode: 'A01', isTransparent: false },
    { row: 0, col: 1, colorCode: 'A02', isTransparent: false },
    // ... 2704 cells
  ]
}
```

## 访问权限

| 操作 | 是否需要认证 | 限制 |
|-----|----------|------|
| 创建项目 | ✅ | 每个用户 |
| 编辑自己的项目 | ✅ | 仅 owner |
| 删除自己的项目 | ✅ | 仅 owner（软删除） |
| 查看公开项目 | ❌ | 任何人 |
| 下载公开项目 | ❌ | 任何人，需扣费 |
| 下载私有项目 | ✅ | 仅 owner |
| 查询用户排行 | ❌ | 基于公开数据 |

## 备份与恢复

- 每日增量备份
- 异地容灾（至少两个地域）
- 用户数据删除后 30 天内可恢复
- 每月全量备份到离线存储

## 隐私与安全

- 所有用户数据都在国内存储
- 个人信息（邮箱、手机）加密存储
- 支付信息完全由支付宝/微信管理，我们不存
- 定期安全审计
