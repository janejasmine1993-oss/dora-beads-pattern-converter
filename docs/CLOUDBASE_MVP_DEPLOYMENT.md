# v0.8.1 CloudBase MVP 部署指南

## 概述

本文档说明如何将哆啦拼豆图纸转换器部署到腾讯云 CloudBase，作为公网 MVP 测试环境。

当前状态：
- ✅ 前端：React Vite，可部署到 CloudBase 静态托管
- ✅ 后端：Express Node.js，可部署到 CloudBase 云托管
- ✅ 数据库：PostgreSQL（需要配置云实例）
- ✅ AI 优化：Mock 模式
- ✅ COS 存储：Mock 模式
- ❌ 支付系统：未接入

## 前置条件

### 1. 腾讯云账号

1. 访问 https://cloud.tencent.com/
2. 注册或登录腾讯云账号
3. 完成实名认证
4. 绑定支付方式（信用卡或其他）

### 2. CloudBase 环境

1. 进入 CloudBase 控制台：https://console.cloud.tencent.com/tcb
2. 创建环境：
   - 环境名：`dora-beads-mvp`
   - 地域：选择最近的地域（如 `ap-shanghai`）
   - 套餐：选择标准版（每月 100 万次云函数免费额度）

### 3. 云数据库（PostgreSQL）

#### 方案 A：Supabase（推荐 MVP）

Supabase 提供免费的 PostgreSQL 数据库，特别适合 MVP 阶段。

1. 访问 https://supabase.com
2. 登录或注册
3. 创建新项目：
   - Project name: `dora-beads`
   - Region: 选择亚太地区
   - Database: PostgreSQL
4. 获取连接字符串：
   - 进入 Settings → Database
   - 复制 "URI" 连接字符串

#### 方案 B：腾讯云 PostgreSQL

1. 进入 RDS 控制台
2. 创建 PostgreSQL 实例
3. 配置：
   - 版本：13 或更高
   - 实例规格：1GB
   - 存储：20GB
4. 获取内网和外网地址

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
| 注册/登录 | ✅ 真实 | 使用 JWT token |
| 数据库 | ✅ 真实 | PostgreSQL on Supabase/Tencent |
| 会员系统 | ✅ 真实 | 从数据库读取 |
| AI 次数 | ✅ 真实 | 从数据库读取和扣除 |
| 作品保存 | ✅ 真实 | PostgreSQL 持久化 |
| AI 优化 | ✅ Mock | 本地 Mock provider |
| COS 存储 | ✅ Mock | 本地 Mock URL |
| 支付系统 | ❌ 未接入 | 计划 v0.9.0 |

## 费用预估

### Supabase（推荐）

- 免费额度：充足的 MVP 测试
- 超出部分：按量付费，通常 $10-50/月

### CloudBase

- 静态托管：1GB 流量免费，超出 $0.5 per GB
- 云托管：100 万次调用免费，超出 $0.0000166 per 次
- 数据库：单独付费

### 总成本

月均 $0-50，适合 MVP 阶段验证。

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

检查：
- [ ] DATABASE_URL 环境变量正确
- [ ] 数据库防火墙允许 CloudBase IP
- [ ] Prisma migrate 已执行：`npx prisma migrate deploy`

### 2. 前端 API 请求 404

检查：
- [ ] 路由代理规则已配置
- [ ] VITE_API_BASE_URL=/api
- [ ] 后端服务正常运行

### 3. 容器构建失败

检查：
- [ ] Dockerfile 路径正确
- [ ] package.json 依赖完整
- [ ] npm install 可正常执行

### 4. 内存或超时

考虑：
- [ ] 升级 CloudBase 云托管配置
- [ ] 优化后端代码
- [ ] 使用缓存

## 下一步

MVP 验证成功后，计划：

1. **v0.8.2**：接入真实 COS 存储
2. **v0.9.0**：接入腾讯混元 AI
3. **v1.0.0**：接入支付系统

## 支持

遇到问题请检查：

- CloudBase 文档：https://cloud.tencent.com/document/product/876
- Supabase 文档：https://supabase.com/docs
- 项目 GitHub：https://github.com/janejasmine1993-oss/dora-beads-pattern-converter
