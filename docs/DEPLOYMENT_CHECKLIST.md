# v0.8.1 CloudBase + 腾讯云 PostgreSQL 部署清单

**项目版本：** v0.8.1-cloudbase-mvp  
**目标平台：** 腾讯云 CloudBase（前端）+ 腾讯云 PostgreSQL（数据库）  
**预计时间：** 30-60 分钟（首次设置）  
**预计成本：** ¥346-446/月（约 $50-65）

---

## 📋 阶段 1：本地准备（15 分钟）

部署前确认本地编译成功。

### 1.1 前端构建

```bash
npm install
npm run build
```

验收：
- [ ] `dist/` 目录存在
- [ ] `dist/index.html` 文件大小 > 1KB
- [ ] 无编译错误

### 1.2 后端构建

```bash
cd server
npm install
npm run build
```

验收：
- [ ] `dist/` 目录存在
- [ ] `dist/index.js` 文件存在
- [ ] 无编译错误

### 1.3 文件检查

```bash
# 确认敏感文件未被追踪
git status | grep -E ".env|users.json"
```

验收：
- [ ] `.env.local` 在输出中或不出现
- [ ] `server/.env.local` 不出现
- [ ] `server/data/users.json` 不出现

---

## 🔐 阶段 2：腾讯云账号和资源准备（10 分钟）

### 2.1 腾讯云账号

1. 访问 https://cloud.tencent.com/
2. 注册或登录
3. **实名认证**（必需）
4. **绑定支付方式**（信用卡或其他）

### 2.2 CloudBase 环境

1. 进入 https://console.cloud.tencent.com/tcb
2. 点击"新建环境"
3. 填写：
   - 环境名：`dora-beads-staging` 或 `dora-beads-mvp`
   - 地域：选择最近的地域（推荐 `ap-guangzhou` 或 `ap-shanghai`）
   - 套餐类型：标准版（100 万次调用免费/月）

**记录下来：**
- [ ] CloudBase envId（格式：`xxx-xxxxxxxxx`）

### 2.3 腾讯云 PostgreSQL 实例

1. 进入 https://console.cloud.tencent.com/dcs
2. 或通过 CloudBase 控制台 → 扩展能力 → RDS

**创建 PostgreSQL 实例：**

| 项目 | 选择 |
|------|------|
| 版本 | PostgreSQL 13 或更高（推荐 14） |
| 地域 | 与 CloudBase 同地域 |
| 规格 | 1GB 内存（按量付费） |
| 存储 | 20GB |

3. 创建数据库账户：
   - 账户名：`postgres` 或 `doraadmin`
   - 密码：16+ 字符，包含大小写字母、数字、符号

4. 创建数据库：
   - 数据库名：`dora_staging` 或 `dora_prod`
   - 字符集：`UTF8`

**记录下来：**
- [ ] 数据库地址（内网地址）
- [ ] 端口（通常 5432）
- [ ] 账户名
- [ ] 密码
- [ ] 数据库名

**安全组配置：**

1. 进入实例详情 → 安全组
2. 添加规则：
   - 协议：TCP
   - 端口：5432
   - 来源：CloudBase IP 段（CloudBase 会提供）
   - 或临时设置为 `0.0.0.0/0` 用于测试

---

## 🔑 阶段 3：环境变量准备（5 分钟）

生成并记录以下变量。**不要提交到 Git。**

### 3.1 JWT_SECRET

生成 32+ 字符的随机密钥：

```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))
```

**记录下来：**
- [ ] JWT_SECRET（例：`abc123def456...`）

### 3.2 DATABASE_URL

根据实际信息组装：

```
postgresql://[账户名]:[密码]@[数据库地址]:5432/[数据库名]
```

示例：
```
postgresql://doraadmin:MyPassw0rd123!@dora-db-xxx.sql.tencentcdb.com:5432/dora_staging
```

**记录下来：**
- [ ] DATABASE_URL

---

## 📤 阶段 4：CloudBase 后端部署（15 分钟）

### 4.1 配置环境变量

1. 进入 CloudBase 控制台 → 环境 → 云托管
2. 点击"新建服务"
3. 在"环境变量"中添加：

| 变量名 | 值 |
|--------|-----|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | `postgresql://...` |
| `JWT_SECRET` | `your-secret-key` |
| `AUTH_MODE` | `real` |
| `AI_RUNTIME_MODE` | `mock` |
| `AI_PROVIDER` | `mock` |

### 4.2 部署代码

**方案 A：通过 GitHub（推荐）**

1. 推送代码到 GitHub：
   ```bash
   git push origin main
   ```
2. 在 CloudBase 控制台"新建服务"中：
   - 选择"代码部署"
   - 连接 GitHub 仓库
   - 选择分支：`main`
   - 构建方式：`Dockerfile`

**方案 B：本地上传**

1. 压缩项目：
   ```bash
   zip -r dora-beads.zip . -x "node_modules/*" ".git/*"
   ```
2. CloudBase 控制台 → 新建服务 → 上传本地代码
3. 构建方式：`Dockerfile`

### 4.3 等待部署

1. 点击"开始构建"
2. 等待 5-10 分钟
3. 观察日志输出

**预期日志：**
```
Step 1/N : FROM node:18-alpine
...
RUN npm run build
...
Successfully built xxx
Successfully tagged xxx
Pushing image...
```

**记录下来：**
- [ ] 后端服务 URL（格式：`https://dora-beads-backend-xxx.cloudbaseapp.com`）

---

## 📱 阶段 5：CloudBase 前端部署（10 分钟）

### 5.1 部署静态文件

在 CloudBase 控制台 → 静态托管：

1. 点击"上传"或使用 CLI：
   ```bash
   # 安装 CloudBase CLI（如未安装）
   npm install -g @cloudbase/cli
   
   # 登录
   cloudbase login
   
   # 部署
   cloudbase hosting:deploy dist/
   ```

2. 等待 2-3 分钟

**记录下来：**
- [ ] 前端域名（格式：`https://dora-beads-xxx.cloudbaseapp.com`）

### 5.2 配置路由代理

在 CloudBase 控制台 → 静态托管 → 设置 → 路由规则：

1. 添加规则：
   - 路径：`/api/*`
   - 目标地址：后端服务 URL（例：`https://dora-beads-backend-xxx.cloudbaseapp.com`）
   - 是否转发：是

2. 保存

---

## 🧪 阶段 6：数据库初始化（5 分钟）

在部署后端前或后，执行迁移：

### 方案 A：通过 CloudBase 控制台

1. 进入后端云托管 → 日志
2. 查看初始化输出，确认 Prisma migrate 已运行

### 方案 B：本地执行（仅开发环境）

```bash
cd server
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
npx prisma generate
```

验收：
- [ ] 数据库表已创建（users, memberships, ai_credits 等）
- [ ] 无迁移错误

---

## ✅ 阶段 7：验收测试（10 分钟）

### 7.1 后端健康检查

```bash
curl https://[前端域名]/api/health
```

预期响应：
```json
{"status":"healthy","timestamp":"2026-06-08T..."}
```

验收：
- [ ] 返回 HTTP 200
- [ ] 响应包含 `healthy`

### 7.2 前端可访问

1. 打开浏览器：`https://[前端域名]`
2. 应看到哆啦拼豆应用首页

验收：
- [ ] 页面加载成功
- [ ] 无 404 错误
- [ ] 无 CORS 错误

### 7.3 用户注册

1. 打开"用户中心"
2. 点击"注册"
3. 填写：
   - 邮箱：test@example.com
   - 密码：Test1234!
4. 点击"注册"

验收：
- [ ] 注册成功
- [ ] 自动跳转到登录状态
- [ ] 显示用户信息

### 7.4 刷新保持登录

1. 按 F5 刷新页面
2. 用户中心仍显示已登录

验收：
- [ ] 刷新后保持登录状态
- [ ] Token 正确存储在 localStorage

### 7.5 数据库验证

1. 用户中心显示会员等级和 AI 次数
2. 这些数据来自数据库，非 Mock

验收：
- [ ] 能正常读取会员数据
- [ ] 能正常读取 AI 次数

### 7.6 AI 优化流程

1. 进入"AI 图片优化"
2. 上传图片
3. 点击"优化"
4. 等待 Mock AI 返回结果

验收：
- [ ] 流程正常运行
- [ ] AI 次数被扣除
- [ ] 结果图片可显示

### 7.7 作品保存

1. 进入"我的作品"
2. 点击"创建新作品"
3. 输入作品名称
4. 保存

验收：
- [ ] 作品保存成功
- [ ] 列表中出现新作品

### 7.8 刷新后作品仍存在

1. 按 F5 刷新
2. 回到"我的作品"

验收：
- [ ] 刚才保存的作品仍在列表中
- [ ] 数据已持久化到数据库

---

## 📋 最终检查清单

部署完成后：

- [ ] 前端公网地址可访问
- [ ] 后端 /api/health 返回 200
- [ ] 用户能注册和登录
- [ ] 刷新后保持登录状态
- [ ] 能读取会员和 AI 次数
- [ ] AI 优化流程正常
- [ ] 作品能保存和加载
- [ ] 数据库连接稳定

---

## 📞 常见问题速查

| 问题 | 解决方案 |
|------|--------|
| 部署失败 | 检查 Dockerfile 和 package.json |
| 数据库连接失败 | 检查 DATABASE_URL、安全组、IP 段 |
| API 404 | 检查路由代理配置 |
| CORS 错误 | 确认前后端在同一 CloudBase 环境 |
| 数据丢失 | 确认使用了云数据库，非本地文件 |

详细解答见：docs/CLOUDBASE_MVP_DEPLOYMENT.md → 常见问题

---

## 🎯 部署完成标志

当你看到以下情况时，部署成功：

```
✅ 公网前端登录验收网址：https://dora-beads-xxx.cloudbaseapp.com
✅ 公网后端健康检查网址：https://dora-beads-xxx.cloudbaseapp.com/api/health
✅ 用户能注册、登录、保存作品
✅ 刷新后数据不丢失
✅ AI 优化流程正常
✅ 会员系统正常
```

---

**下一步：** 按照本清单逐步部署，遇到问题查看 docs/CLOUDBASE_MVP_DEPLOYMENT.md
