# v0.8.1 CloudBase MVP 部署指南

## 概述

本文档说明如何将哆啦拼豆图纸转换器部署到腾讯云 CloudBase + 腾讯云 PostgreSQL，作为国内公网 MVP 环境。

**方案选择：CloudBase + 腾讯云 PostgreSQL**

当前状态：
- ✅ 前端：React Vite，部署到 CloudBase 静态托管
- ✅ 后端：Express Node.js，部署到 CloudBase 云托管
- ✅ 数据库：腾讯云 PostgreSQL（第一选择），国内稳定
- ⚠️ 备选数据库：Supabase（海外），仅用于临时测试
- ✅ AI 优化：Mock 模式
- ✅ COS 存储：Mock 模式
- ❌ 支付系统：未接入
- ❌ 域名：未绑定，使用 CloudBase 默认域名

## 前置条件

### 1. 腾讯云账号

1. 访问 https://cloud.tencent.com/
2. 注册或登录腾讯云账号
3. 完成实名认证
4. 绑定支付方式（信用卡或其他）

### 2. CloudBase 环境

1. 进入 CloudBase 控制台：https://console.cloud.tencent.com/tcb
2. 创建环境：
   - 环境名：`dora-beads-mvp` 或 `dora-beads-staging`
   - 地域：选择靠近用户群体的地域（推荐 `ap-guangzhou` 或 `ap-shanghai`）
   - 套餐：选择标准版（每月 100 万次云函数调用免费额度）

### 3. 腾讯云 PostgreSQL（第一选择）

**推荐配置（最低成本）**

1. 进入 RDS 控制台：https://console.cloud.tencent.com/dcs
2. 创建 PostgreSQL 实例：
   - 版本：PostgreSQL 13 或更高（推荐 14）
   - 地域：与 CloudBase 同地域（确保网络延迟低）
   - 实例规格：1GB 内存（按量付费最低配）
   - 存储：20GB（足够 MVP 测试）
   - 账户：创建数据库账户（记录用户名和密码）
   - 数据库：创建数据库 `dora_staging` 或 `dora_prod`

3. 安全组配置：
   - 允许 CloudBase 云托管服务的 IP 段访问
   - CloudBase 官方会提供 IP 段信息

4. 获取连接字符串：
   - 进入实例详情页
   - 复制"内网地址"和"端口"
   - 格式：`postgresql://用户名:密码@内网地址:5432/dora_staging`

5. 成本估算（按量付费）：
   - 实例运行费：~¥0.38/小时
   - 存储费：~¥0.005/GB/小时
   - 月均成本：¥50-100（取决于用量）
   - MVP 阶段足够，生产环境按需升级

### 4. 备选：Supabase PostgreSQL（仅用于临时海外测试）

**不推荐作为国内正式环境**

Supabase 数据库位于海外，国内用户直接访问可能受网络影响。仅在以下场景使用：
- 海外用户测试
- 临时演示（无国内用户）
- 开发者个人测试

如需使用 Supabase：
1. 访问 https://supabase.com
2. 创建项目，获取连接字符串
3. 注意：CloudBase 后端与 Supabase 的跨境网络连接可能受到影响

### 4. 本地工具

```bash
npm install -g @cloudbase/cli
```

## 部署步骤

### 步骤 1：准备前端

```bash
# 1. 构建前端
npm run build

# 2. 验证 dist 目录生成成功
ls -la dist/

# 3. 查看生成的 index.html
cat dist/index.html | head -20
```

### 步骤 2：准备后端

```bash
# 1. 构建后端
cd server
npm run build

# 2. 验证 dist 目录生成成功
ls -la dist/

# 3. 验证 Dockerfile 存在
ls -la Dockerfile
```

### 步骤 3：配置环境变量

在 CloudBase 云托管环境中设置以下环境变量：

**对于 Supabase：**
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres
JWT_SECRET=your-secret-key-at-least-32-chars
AUTH_MODE=real
AI_RUNTIME_MODE=mock
AI_PROVIDER=mock
NODE_ENV=production
PORT=3001
```

**对于腾讯云 PostgreSQL：**
```
DATABASE_URL=postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
JWT_SECRET=your-secret-key-at-least-32-chars
AUTH_MODE=real
AI_RUNTIME_MODE=mock
AI_PROVIDER=mock
NODE_ENV=production
PORT=3001
```

### 步骤 4：部署前端

```bash
# 1. 初始化 CloudBase
cloudbase init

# 2. 部署静态网站
cloudbase hosting:deploy dist/
```

### 步骤 5：部署后端

```bash
# 1. 进入 CloudBase 控制台
# 2. 进入"云托管"→"新建服务"
# 3. 选择"使用代码部署"
# 4. 选择本 GitHub 仓库或上传本地代码
# 5. 构建方式：选择"Dockerfile"
# 6. 设置环境变量（从步骤 3 复制）
# 7. 点击"开始构建"
```

或使用 CLI：

```bash
# 1. 进入后端目录
cd server

# 2. 登录 CloudBase
cloudbase login

# 3. 部署容器化应用
cloudbase run:deploy --runtime docker
```

### 步骤 6：配置路由代理

在 CloudBase 静态托管中配置 `/api` 路由代理到后端：

1. 进入 CloudBase 控制台
2. 静态托管 → 设置 → 路由规则
3. 添加规则：
   ```
   路径：/api/*
   目标地址：https://[backend-service-url]
   是否转发：是
   ```

### 步骤 7：获取公网地址

部署完成后：

1. 前端：CloudBase 将分配默认域名，格式为 `https://dora-beads-xxx.cloudbaseapp.com`
2. 后端：CloudBase 云托管服务 URL，格式为 `https://dora-beads-backend-xxx.cloudbaseapp.com`
3. API：通过 `/api` 路由代理访问

## 验收测试

### 测试 1：前端可访问

```bash
curl -I https://dora-beads-xxx.cloudbaseapp.com
# 应返回 HTTP 200
```

### 测试 2：后端健康检查

```bash
curl https://dora-beads-xxx.cloudbaseapp.com/api/health
# 应返回健康状态 JSON
```

### 测试 3：登录验收

1. 打开前端 URL
2. 注册新用户
3. 登录成功
4. 刷新保持登录状态

### 测试 4：数据库连接

1. 打开用户中心
2. 确认会员来自数据库
3. 确认 AI 次数来自数据库

### 测试 5：功能验收

- [ ] 注册/登录
- [ ] 查看会员等级
- [ ] 查看 AI 次数
- [ ] 上传图片
- [ ] AI 优化（Mock）
- [ ] 保存作品
- [ ] 我的作品列表

## 当前 MVP 状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 注册/登录 | ✅ 真实 | 使用 JWT token，邮箱+密码 |
| 数据库 | ✅ 真实 | PostgreSQL（腾讯云 RDS，国内）|
| 会员系统 | ✅ 真实 | 从数据库读取 |
| AI 次数 | ✅ 真实 | 从数据库读取和扣除 |
| 作品保存 | ✅ 真实 | PostgreSQL 持久化 |
| AI Jobs 记录 | ✅ 真实 | PostgreSQL 记录任务状态 |
| 图片上传 | ✅ 真实 | 上传记录持久化 |
| AI 优化 | ✅ Mock | 本地 Mock provider，支持流程验证 |
| COS 存储 | ✅ Mock | 本地 Mock URL，支持流程验证 |
| 支付系统 | ❌ 未接入 | 计划 v0.9.0 |
| 域名 | ❌ 未绑定 | 使用 CloudBase 默认域名 |
| 腾讯混元 AI | ❌ Mock | 计划 v0.9.0 接入真实 API |

## 费用预估

### 方案 1：腾讯云 PostgreSQL + CloudBase（推荐，国内最优）

**PostgreSQL 实例（1GB 按量付费）：**
- 实例运行费：~¥0.38/小时 × 24 小时 × 30 天 = ~¥274/月
- 存储费：20GB × ¥0.005/GB/小时 × 24 × 30 = ~¥72/月
- **月均小计：¥346（约 $50）**

**CloudBase 云托管：**
- 静态托管：1GB 流量免费，超出 ¥0.5/GB
- 云托管：100 万次调用免费/月，超出 ¥0.0000166/次
- **月均小计：¥0-100（取决于用量）**

**总成本预估：¥346-446/月（约 $50-65）**

适合国内用户，网络稳定，数据合规。

### 方案 2：Supabase PostgreSQL + CloudBase（临时海外测试）

**Supabase：**
- 免费额度：500MB 存储，50k 文件上传，充足 MVP
- 超出部分：按量付费，通常 $10-50/月

**CloudBase：**
- 同方案 1

**总成本预估：$0-100/月**

**注意：** 不推荐作为国内生产环境，跨境网络可能有延迟。仅用于临时测试或海外用户。

### 降低成本建议

1. **关闭不使用的实例**：开发完成后可停止数据库实例
2. **使用预留实例券**：腾讯云提供 1-3 年预付折扣
3. **监控流量**：使用 CloudBase 监控避免超额成本

## 回滚方法

如果需要回滚：

### 前端回滚
```bash
# 1. 删除当前部署
cloudbase hosting:delete

# 2. 重新部署本地 dist
cloudbase hosting:deploy dist/
```

### 后端回滚
```bash
# 在 CloudBase 控制台
# 1. 进入云托管 → 服务详情
# 2. 选择历史版本
# 3. 点击"回滚"
```

## 常见问题

### 1. 数据库连接失败

**症状：** 后端启动时报错 `Error: ECONNREFUSED` 或 `connection timeout`

**腾讯云 PostgreSQL 检查清单：**
- [ ] 数据库实例状态为"运行中"
- [ ] 确认实例所在地域与 CloudBase 相同
- [ ] 安全组允许 CloudBase IP 段访问（CloudBase 会提供 IP 段）
- [ ] 数据库账户名和密码正确
- [ ] 连接字符串格式：`postgresql://user:password@host:5432/dora_staging`
- [ ] Prisma migrate 已执行：`npx prisma migrate deploy`

**Supabase 检查清单（备选）：**
- [ ] 项目状态为"Running"
- [ ] 连接字符串使用"URI"格式，非"connection string"
- [ ] 检查 Supabase 防火墙设置

### 2. Prisma 迁移失败

**症状：** `npx prisma migrate deploy` 返回错误

**解决：**
```bash
# 1. 检查连接
npx prisma db push --skip-generate --force-reset

# 2. 重新生成 Prisma Client
npx prisma generate

# 3. 执行迁移
npx prisma migrate deploy
```

### 3. 前端 API 请求 404

**症状：** 浏览器控制台报 404，或 `/api/health` 返回 404

**检查：**
- [ ] 路由代理规则已在 CloudBase 控制台配置
- [ ] VITE_API_BASE_URL=/api（前端 .env.production）
- [ ] 后端云托管服务已部署且状态为"正常运行"
- [ ] 检查 CloudBase 日志，确认请求到达后端

### 4. 容器构建失败

**症状：** CloudBase 构建日志显示 npm install 或 tsc 错误

**检查：**
- [ ] Dockerfile 路径正确：`server/Dockerfile`
- [ ] package.json 依赖列表完整（包括 bcryptjs、jsonwebtoken）
- [ ] npm install 本地可执行：`cd server && npm install`
- [ ] TypeScript 编译通过：`npm run build`

### 5. 内存不足或超时

**症状：** 容器重启，或请求经常超时

**解决：**
- [ ] 升级 CloudBase 云托管配置（从标准→高级）
- [ ] 优化后端代码，检查内存泄漏
- [ ] 增加 Nginx 超时配置

### 6. 部署后仍是本地数据库

**症状：** 修改数据后刷新丢失，或多用户无法共享数据

**原因：** 后端仍使用本地 users.json 或 SQLite

**解决：**
- [ ] 确认环境变量 DATABASE_URL 已设置
- [ ] 检查后端代码是否读取了 DATABASE_URL
- [ ] 查看 CloudBase 日志，确认数据库连接成功

### 7. 跨域或请求被拒

**症状：** 浏览器报 CORS 错误

**解决：**
- [ ] 确认前端和后端在同一 CloudBase 环境
- [ ] 检查 Nginx 配置中的 CORS 头设置
- [ ] 或在 Express 中添加 CORS 中间件

## 部署清单（用户自检）

部署前请确认：

- [ ] 腾讯云账号已注册并完成实名认证
- [ ] CloudBase 环境已创建，获得 envId
- [ ] 腾讯云 PostgreSQL 实例已创建
- [ ] 数据库用户和密码已记录
- [ ] 获取了完整的 DATABASE_URL 连接字符串
- [ ] JWT_SECRET 已生成（至少 32 字符）
- [ ] 本地 `npm run build` 和 `cd server && npm run build` 都成功
- [ ] 前端 dist/ 目录存在
- [ ] 后端已配置好 Dockerfile

部署过程中：

- [ ] 不提交任何 .env 文件到 Git
- [ ] 不在代码中硬编码密钥
- [ ] 在 CloudBase 环境变量中设置 DATABASE_URL 和 JWT_SECRET
- [ ] 部署后执行 `npx prisma migrate deploy` 初始化数据库

## 下一步

MVP 验证成功后，计划：

1. **v0.8.2**：接入真实腾讯 COS 存储（替换 Mock）
2. **v0.9.0**：接入腾讯混元 AI 真实 API（替换 Mock）
3. **v1.0.0**：接入支付系统（微信支付/支付宝）
4. **v1.1.0+**：自定义域名、CDN 加速、性能优化

## 支持

遇到问题请检查：

- CloudBase 文档：https://cloud.tencent.com/document/product/876
- Supabase 文档：https://supabase.com/docs
- 项目 GitHub：https://github.com/janejasmine1993-oss/dora-beads-pattern-converter
