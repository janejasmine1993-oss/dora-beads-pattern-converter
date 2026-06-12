# 腾讯云数据存储迁移方案

## 一、当前存储现状

### 用户认证数据
- **存储位置**：`server/data/users.json`（JSON 文件）
- **内容**：用户 ID、邮箱、密码 hash、昵称、头像、创建时间
- **问题**：仅用于本地开发，不适合生产环境，无备份，无扩展性

### 会员信息
- **存储位置**：浏览器 localStorage（key: `dora_membership`）
- **内容**：会员等级、过期时间、日限制、最大作品数
- **问题**：客户端存储，易被修改，无服务端验证

### AI 次数额度
- **存储位置**：浏览器 localStorage（key: `dora_ai_credits_[userId]`）
- **内容**：每日剩余次数、额外次数、重置时间
- **问题**：客户端存储，无权限控制，易被作弊，无审计日志

### 拼豆作品
- **存储位置**：浏览器 localStorage（key: `dora_user_works_[userId]`）
- **内容**：作品 ID、标题、品牌、颜色数、珠子数、尺寸
- **问题**：刷新消失，无备份，无分享，无云端恢复

### AI 优化任务
- **存储位置**：React useState（临时内存）
- **内容**：无持久化
- **问题**：刷新消失，无记录，无历史，无优化图保存

### 兑换码
- **存储位置**：浏览器 localStorage（key: `dora_redeem_history_[userId]`）
- **内容**：兑换码和使用记录
- **问题**：客户端存储，无服务端验证，易被伪造

---

## 二、为什么必须迁移

### 安全风险
1. **无身份验证的数据修改**：localStorage 数据可被任何网页脚本修改
2. **会员权限可绕过**：会员等级在客户端可被修改
3. **AI 次数可作弊**：次数限制在客户端，可被绕过
4. **兑换码可伪造**：兑换记录在客户端，可被篡改

### 功能限制
1. **无多设备同步**：数据仅存本地，换设备全部消失
2. **无云备份**：用户数据无备份，一旦清除缓存全部丢失
3. **无分享功能**：作品无中心存储，无法分享给其他用户
4. **无历史记录**：AI 优化无记录，无法回溯历史版本
5. **无审计日志**：无法跟踪数据变化和用户行为

### 商业阻碍
1. **无法正式支付**：会员购买和扣费需要后端支持
2. **无法收费内测**：无安全的次数控制，无法付费扣费
3. **无法做数据分析**：用户行为数据全在客户端，无法收集
4. **无法做风控**：无法检测异常行为和欺诈

---

## 三、腾讯云方案对比

### 方案 A：CloudBase 一体化

**优点**：
- ✅ 前端直连云数据库，无需自建后端
- ✅ 云函数处理业务逻辑，按需计费
- ✅ CloudBase 托管前端代码和云函数
- ✅ 文件存储集成，无需额外配置 COS
- ✅ 后续接微信小程序无缝接入
- ✅ 开发速度快

**缺点**：
- ❌ 成本无法精确控制（按执行次数计费）
- ❌ 冷启动延迟
- ❌ 复杂查询性能一般
- ❌ 社区资源少，问题排查困难
- ❌ 与传统后端架构差异大，学习曲线陡

**适合场景**：
- 个人项目、MVP 快速上线
- 后续主要以微信小程序为主
- 追求开发速度优先于成本控制

---

### 方案 B：CVM + PostgreSQL + COS

**优点**：
- ✅ 传统 Web 后端架构，完全可控
- ✅ PostgreSQL 关系数据库，SQL 功能完整
- ✅ Node.js Express，生态成熟，社区活跃
- ✅ 可精确控制成本（购买指定规格的 CVM）
- ✅ 支付、订单等复杂业务逻辑容易实现
- ✅ 性能可预测，适合长期运营

**缺点**：
- ❌ 需要自己管理服务器运维
- ❌ 初期成本高（购买服务器）
- ❌ 开发过程需要 SQL 和服务端技能
- ❌ 后续接小程序需要额外 SDK 集成

**适合场景**：
- Web App 为主的应用
- 需要复杂后端业务逻辑
- 追求成本控制和长期稳定性
- 团队有 Node.js 和 SQL 经验

---

### 方案 C：CloudBase + PostgreSQL 混合

**优点**：
- ✅ 前端和小程序走 CloudBase（快速迭代）
- ✅ 核心业务走 PostgreSQL（稳定可靠）
- ✅ 文件存储走 COS（成本低）
- ✅ 灵活性最高

**缺点**：
- ❌ 架构复杂度高
- ❌ 多个平台维护成本高
- ❌ CloudBase 和 PostgreSQL 数据同步困难

**适合场景**：
- 既需要快速迭代，又需要复杂业务逻辑
- 团队资源充足，能承受复杂性

---

## 四、推荐方案：B（CVM + PostgreSQL + COS）

### 推荐理由

1. **项目长期规划清晰**
   - 已有完整的 Web App 原型（工作台、AI 优化页）
   - 计划支付内测版，需要可靠的支付系统
   - 用户数据是重资产，需要长期保护

2. **技术栈成熟**
   - 已有 Node.js Express 后端基础
   - 已有 TypeScript、JWT、bcryptjs 经验
   - 团队熟悉关系数据库概念

3. **成本可控**
   - 腾讯云轻量应用服务器（¥45/月）成本低
   - PostgreSQL 云数据库可按量计费
   - 可精确预估运维成本

4. **功能完整**
   - PostgreSQL 支持复杂 SQL 查询
   - 支付系统实现容易
   - 用户行为数据分析支持完整

5. **风险低**
   - 传统架构，排查问题容易
   - 社区资源丰富
   - 若需改小程序，可保持后端不变

### 备选：日后接小程序时再评估 CloudBase

如果后续业务重点转向微信小程序，可以在 CloudBase 中重新实现相同的 API，与当前 PostgreSQL 后端共存。

---

## 五、数据库表设计

### 1. users（用户）

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  login_provider VARCHAR(50) DEFAULT 'email',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);
```

替代：`server/data/users.json`

---

### 2. memberships（会员）

```sql
CREATE TABLE memberships (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level VARCHAR(50) DEFAULT 'free',
  status VARCHAR(50) DEFAULT 'active',
  started_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

会员等级：
- `free`：免费版（日 10 次）
- `monthly`：月卡（日 100 次）
- `yearly`：年卡（日 300 次）
- `lifetime`：终身卡（无限次）

替代：localStorage `dora_membership`

---

### 3. ai_credits（AI 次数）

```sql
CREATE TABLE ai_credits (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  daily_total INT DEFAULT 10,
  daily_used INT DEFAULT 0,
  extra_credits INT DEFAULT 0,
  reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**规则**：
- 每日次数根据会员等级决定（free=10, monthly=100, yearly=300, lifetime=999）
- 每日凌晨 0 点重置 daily_used
- extra_credits 额外购买的次数，独立计数
- 优先扣 daily_total，再扣 extra_credits

替代：localStorage `dora_ai_credits_[userId]`

---

### 4. works（拼豆作品）

```sql
CREATE TABLE works (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  source_image_url TEXT,
  preview_image_url TEXT,
  pattern_data_url TEXT,
  bead_brand VARCHAR(50),
  pattern_width INT,
  pattern_height INT,
  color_count INT,
  total_beads INT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

status：
- `draft`：草稿
- `completed`：已完成
- `exported`：已导出

替代：localStorage `dora_user_works_[userId]`

---

### 5. ai_jobs（AI 优化任务）

```sql
CREATE TABLE ai_jobs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preset_id VARCHAR(100) NOT NULL,
  provider VARCHAR(50) DEFAULT 'tencent-hunyuan',
  status VARCHAR(50) DEFAULT 'pending',
  source_image_url TEXT NOT NULL,
  result_image_url TEXT,
  credit_cost INT DEFAULT 1,
  error_message TEXT,
  request_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);
```

status：
- `pending`：等待处理
- `processing`：处理中
- `success`：成功
- `failed`：失败

新增：完整记录每次优化，支持历史查询和重复使用

---

### 6. uploaded_images（上传的图片）

```sql
CREATE TABLE uploaded_images (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  mime_type VARCHAR(50),
  size INT,
  width INT,
  height INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

type：
- `source`：用户上传的原图
- `ai_result`：AI 优化结果图
- `export`：导出的 PNG/PDF

新增：统一管理所有用户文件，支持文件管理和清理

---

## 六、文件存储设计

### 使用腾讯云 COS（对象存储）

**存储路径**：

```
/prod/users/{userId}/uploads/{imageId}.png       # 用户原始上传
/prod/users/{userId}/ai-results/{jobId}.png      # AI 优化结果
/prod/users/{userId}/exports/{workId}.png        # 导出的图纸（PNG）
/prod/users/{userId}/exports/{workId}.pdf        # 导出的图纸（PDF）
```

**开发期路径**：

```
/dev/users/{userId}/uploads/{imageId}.png
/dev/users/{userId}/ai-results/{jobId}.png
/dev/users/{userId}/exports/{workId}.png
```

### 数据库只保存 URL

```
uploaded_images.file_url = "https://dora.cos.ap-guangzhou.myqcloud.com/prod/users/user_xxx/uploads/img_yyy.png"
ai_jobs.result_image_url = "https://dora.cos.ap-guangzhou.myqcloud.com/prod/users/user_xxx/ai-results/job_zzz.png"
works.preview_image_url = "https://dora.cos.ap-guangzhou.myqcloud.com/prod/users/user_xxx/exports/work_aaa.png"
```

### 腾讯混元返回图处理

**问题**：腾讯混元返回的 URL 有时效限制（通常 24 小时后失效）

**解决方案**：
1. 后端收到腾讯混元返回的 URL
2. 后端下载图片到本地临时目录
3. 上传到 COS，获得永久 URL
4. 存储永久 URL 到数据库
5. 删除本地临时文件

**代码伪码**：
```typescript
const resultUrl = await tencentProvider.generate(request);  // 临时 URL
const imageBuffer = await downloadImage(resultUrl);          // 下载
const permanentUrl = await uploadToCOS(imageBuffer);         // 上传到 COS
await updateAiJob(jobId, { result_image_url: permanentUrl }); // 存储
```

---

## 七、后端 API 设计

### Auth 相关

```
POST /api/auth/register
  请求：{ email, password, nickname }
  响应：{ token, user }

POST /api/auth/login
  请求：{ email, password }
  响应：{ token, user }

GET /api/auth/me
  请求：Bearer token
  响应：{ user }

POST /api/auth/logout
  请求：Bearer token
  响应：{ success }
```

### Membership 相关

```
GET /api/membership/me
  请求：Bearer token
  响应：{ id, userId, level, expiresAt }

POST /api/membership/mock-upgrade
  请求：{ level: 'monthly' | 'yearly' | 'lifetime' }
  响应：{ membership }
  说明：仅开发期使用，便于测试
```

### AI Credits 相关

```
GET /api/credits/me
  请求：Bearer token
  响应：{ dailyTotal, dailyUsed, extraCredits, resetAt }

POST /api/credits/consume
  请求：{ jobId, creditCost }
  响应：{ success, remaining }
  说明：后端校验会员权限和次数限制，才能扣费

POST /api/credits/reset-dev
  请求：Bearer token
  响应：{ success }
  说明：仅开发期使用，重置每日次数
```

### Works 相关

```
GET /api/works
  请求：Bearer token
  响应：[{ id, title, updatedAt, ... }]

POST /api/works
  请求：{ title, brandName, ... }
  响应：{ id, ... }

GET /api/works/:id
  请求：Bearer token
  响应：{ id, title, ... }

PATCH /api/works/:id
  请求：{ title?, ... }
  响应：{ id, ... }

DELETE /api/works/:id
  请求：Bearer token
  响应：{ success }
```

### AI Jobs 相关

```
POST /api/ai-style/generate
  请求：{ presetId, sourceImage, ... }
  响应：{ jobId, status }

GET /api/ai-jobs
  请求：Bearer token
  响应：[{ id, presetId, status, ... }]

GET /api/ai-jobs/:id
  请求：Bearer token
  响应：{ id, status, resultImageUrl, ... }
```

---

## 八、迁移策略

### 开发期策略

**当前阶段**（v0.7.8）：
- 保持现有 JSON + localStorage 架构
- 仅用于测试原型

**迁移阶段**（v0.8.0）：
- 新建数据库表
- 后端 API 实现
- 前端逐步迁移到后端 API
- 旧数据无需迁移（都是测试数据）

**上线前**（v0.9.0）：
- 完整测试数据库架构
- 真实用户测试
- 数据备份和恢复流程验证
- 性能测试

### 不迁移现有测试数据

```
当前 server/data/users.json 中的测试用户不迁移
当前 localStorage 中的测试数据不迁移
上线时使用全新数据库
```

---

## 九、实施顺序（v0.8.0 拆分）

### v0.8.0-a：数据库连接和 schema

- [ ] 选择腾讯云服务（轻量服务器 + PostgreSQL）
- [ ] 在本地创建 PostgreSQL 数据库
- [ ] 创建所有 6 张表的 SQL schema
- [ ] 验证 npm run build 通过
- [ ] 验证 npm run dev 通过

**预期时间**：2-3 天
**成果物**：本地可连接的数据库

---

### v0.8.0-b：Users 迁移到数据库

- [ ] 后端：实现 `/api/auth/register` 写入 PostgreSQL
- [ ] 后端：实现 `/api/auth/login` 从 PostgreSQL 查询
- [ ] 后端：authMiddleware 从 PostgreSQL 验证用户
- [ ] 移除 `server/data/users.json`
- [ ] 前端：保持不变（已使用 API）
- [ ] 验证：注册、登录、登出流程
- [ ] 验证 npm run build 通过

**预期时间**：2-3 天
**成果物**：用户认证完全数据库化

---

### v0.8.0-c：Memberships 和 AI Credits 服务端化

- [ ] 后端：实现会员数据库读写
- [ ] 后端：实现 `/api/membership/me` 接口
- [ ] 后端：实现每日重置逻辑（midnight cron job）
- [ ] 后端：AI 次数校验服务端化
- [ ] 后端：实现 `/api/credits/consume` 接口
- [ ] 前端：useAuth 和 useCredits 改为调用后端 API
- [ ] 前端：移除 localStorage 会员和次数调用
- [ ] 验证：登录后正确显示会员等级和次数
- [ ] 验证 npm run build 通过

**预期时间**：3-4 天
**成果物**：会员和次数完全服务端化，无法被客户端绕过

---

### v0.8.0-d：Works 服务端化

- [ ] 后端：实现作品数据库 CRUD
- [ ] 后端：实现 `/api/works` 相关接口
- [ ] 前端：useWorks hook 改为调用后端 API
- [ ] 前端：移除 localStorage 作品调用
- [ ] 前端：图纸生成后保存到后端
- [ ] 验证：作品保存、加载、删除流程
- [ ] 验证：刷新页面后作品仍存在
- [ ] 验证 npm run build 通过

**预期时间**：3-4 天
**成果物**：作品数据云端持久化

---

### v0.8.0-e：AI Jobs 和文件存储

- [ ] 配置 COS（创建 bucket、上传测试）
- [ ] 后端：实现上传文件到 COS
- [ ] 后端：实现腾讯混元结果转存 COS
- [ ] 后端：实现 AI Job 完整记录
- [ ] 后端：实现 `/api/ai-style/generate` 调用
- [ ] 后端：实现 `/api/ai-jobs` 查询接口
- [ ] 前端：上传图片到 COS
- [ ] 前端：AI 优化结果从 useState 改为后端 API
- [ ] 前端：支持查看历史 AI 任务
- [ ] 验证 npm run build 通过
- [ ] 清理：数据库中的测试数据

**预期时间**：4-5 天
**成果物**：完整的 AI 优化任务记录和文件存储

---

## 十、安全要求清单

### 环境变量安全

- [ ] 数据库连接字符串在 `.env.local`，未 commit
- [ ] COS Secret 在 `.env.local`，未 commit
- [ ] 所有 Secret 从 `process.env` 读取，不硬编码

### 代码安全

- [ ] 所有需要登录的接口都用 authMiddleware
- [ ] 用户只能访问自己的数据（user_id 校验）
- [ ] AI 次数只能后端扣除，前端无权修改
- [ ] 会员权限只能后端判断，前端无权伪造

### 数据库安全

- [ ] 密码使用 bcryptjs hash，不存明文
- [ ] JWT token 7 天过期
- [ ] 敏感查询使用参数化，防 SQL 注入

---

## 十一、实施时间预期

**v0.8.0 全部完成预期**：15-20 天

- v0.8.0-a：2-3 天
- v0.8.0-b：2-3 天
- v0.8.0-c：3-4 天
- v0.8.0-d：3-4 天
- v0.8.0-e：4-5 天
- 测试和调试：2-3 天

---

## 十二、风险和注意事项

### 技术风险

1. **PostgreSQL 性能**：初期用户少，性能无忧；后期需监控慢查询
2. **COS 成本**：按下载计费，需监控；可配置 CDN 加速
3. **服务器宕机**：轻量服务器需配置数据库备份

### 业务风险

1. **用户数据丢失**：需定期备份数据库
2. **文件存储成本**：AI 生成的图片可能很多，需评估存储成本

### 缓解措施

1. 每日自动备份数据库到本地
2. 定期（周）备份到腾讯云对象存储
3. 图片 COS 配置生命周期（6 个月后清理未使用的测试图）

---

## 十三、总结

| 项目 | 值 |
|------|-----|
| 推荐方案 | **方案 B**：CVM + PostgreSQL + COS |
| 初期成本 | ~¥100/月（轻量服务器 ¥45 + 数据库 ¥55） |
| 迁移周期 | 约 3 周（v0.8.0 完整实施） |
| 团队资源 | 1 名全栈工程师 |
| 预期收益 | 完全数据库化，支持支付和会员系统，用户数据安全 |

