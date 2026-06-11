# 哆啦拼豆图纸转换器 - PostgreSQL 迁移可行性报告

**报告生成时间**：2026-06-11  
**报告类型**：仅检查分析，不涉及代码修改或部署  
**当前版本**：v0.8.1-cloudbase-mvp-staging  
**当前分支**：rebuild-v0.6-from-v0.4.3  
**git commit**：a551248 (fix: fail fast if database migration fails)

---

## A. 项目架构概览

### 前端
- **框架**：React 19 + TypeScript + Vite
- **位置**：`/src/` 目录
- **主要页面**：
  - HomePage（首页）
  - 图片上传及处理
  - 我的作品（MyWorksPanel）
  - AI 风格化（AIStylePanel）
  - 统计报告（StatsPanel）
  - 工作台（WorkbenchPage）

### 后端
- **框架**：Express.js + Node.js + TypeScript
- **位置**：`/server/` 目录
- **核心服务**：
  - 认证系统（JWT）
  - 会员系统
  - AI 次数管理
  - 作品管理
  - 图片上传
  - AI 任务记录

### 数据库
- **当前数据库**：PostgreSQL
- **ORM 框架**：Prisma v5.20.0
- **部署方式**：腾讯云 CloudBase（云托管）+ 腾讯云 RDS PostgreSQL（托管数据库）
- **连接字符串**：通过 `DATABASE_URL` 环境变量配置

---

## B. 数据库设计

### 当前数据库表结构

```
users（用户表）
├── 主键：id
├── email（唯一）
├── password_hash
├── nickname
├── avatar_url
├── login_provider（默认：email）
├── status（默认：active）
├── created_at / updated_at / last_login_at

memberships（会员表）
├── 主键：id
├── user_id（唯一外键 → users）
├── level（free/monthly/yearly/lifetime）
├── status
├── started_at / expires_at
├── created_at / updated_at

ai_credits（AI 次数表）
├── 主键：id
├── user_id（唯一外键 → users）
├── daily_total（根据会员等级决定）
├── daily_used
├── extra_credits
├── reset_at
├── created_at / updated_at

works（作品表）
├── 主键：id
├── user_id（外键 → users）
├── title / 品牌 / 尺寸 / 颜色数等
├── status（draft/completed/exported）
├── created_at / updated_at

ai_jobs（AI 任务表）
├── 主键：id
├── user_id（外键 → users）
├── preset_id / provider / status
├── source_image_url / result_image_url
├── credit_cost / error_message
├── created_at / completed_at

uploaded_images（图片记录表）
├── 主键：id
├── user_id（外键 → users）
├── type（source/ai_result/export）
├── file_url / fileName / mimeType
├── created_at
```

---

## C. 功能依赖分析

### ✅ 强依赖 PostgreSQL 的功能

1. **注册登录**
   - 表：users
   - 操作：创建用户、验证密码、记录登录时间
   - API：POST /api/auth/register，POST /api/auth/login，GET /api/auth/me
   - 前端 Hook：useAuth()
   - **迁移难度**：低（仅替换 DATABASE_URL，无需改业务代码）

2. **会员系统**
   - 表：memberships，ai_credits
   - 操作：读取会员等级、更新会员权益、同步 AI 次数
   - API：GET /api/membership/me，POST /api/membership/dev-upgrade
   - 前端 Hook：useMembership()
   - **迁移难度**：低

3. **AI 次数额度**
   - 表：ai_credits
   - 操作：检查剩余次数、扣除次数、自动重置
   - API：GET /api/credits/me，POST /api/credits/consume，POST /api/credits/dev-reset
   - 前端 Hook：useCredits()
   - **迁移难度**：低

4. **我的作品云端保存**
   - 表：works
   - 操作：创建/读取/修改/删除作品，跨设备同步
   - API：GET/POST/PATCH/DELETE /api/works/*
   - 前端 Hook：useWorks()
   - **迁移难度**：低
   - **关键**：停用 PostgreSQL 后作品无法保存，刷新消失

5. **AI 优化任务记录**
   - 表：ai_jobs，uploaded_images
   - 操作：创建任务、记录状态、保存结果 URL
   - API：POST /api/ai-style/generate，GET /api/ai-jobs
   - **迁移难度**：低

6. **图片上传记录**
   - 表：uploaded_images
   - 操作：记录用户上传的图片 URL 和元数据
   - API：POST /api/uploads/image
   - **迁移难度**：低
   - **关键**：上传成功但记录数据库失败时，前端可能无法完整追踪

### ❌ 不依赖 PostgreSQL 的功能

1. **图片上传**
   - 操作：处理文件、验证格式、上传到 COS（当前 Mock）
   - 前端代码：直接处理 File API、Canvas API
   - **不需要数据库**：上传本身由浏览器和 COS 完成
   - **备注**：上传成功后的"记录"需要数据库

2. **拼豆图纸生成**
   - 操作：像素化、色号匹配、网格计算
   - 前端代码：src/lib/image/（图像处理库）
   - **完全客户端运行**：无网络请求
   - **不需要数据库**

3. **品牌色号切换**
   - 操作：加载色卡、匹配颜色、计算豆量
   - 前端代码：src/data/palettes/（色卡数据）
   - **完全客户端运行**
   - **不需要数据库**

4. **图纸预览**
   - 操作：Canvas 绘制、缩放、实时预览
   - 前端代码：src/components/PreviewCanvas/
   - **完全客户端运行**
   - **不需要数据库**

5. **PNG/PDF/CSV 导出**
   - 操作：Canvas → Blob → 下载
   - 前端代码：src/lib/export/（导出库）
   - **完全客户端运行**
   - **不需要数据库**
   - **备注**：导出记录（可选）需要数据库

---

## D. 停用 PostgreSQL 的影响

### 🔴 严重影响（应用无法正常使用）

| 功能 | 影响程度 | 原因 |
|------|--------|------|
| 注册/登录 | 完全失效 | 用户信息无处存储 |
| 会员等级显示 | 完全失效 | 无法读取会员权益 |
| AI 次数显示/扣除 | 完全失效 | 无法验证和限制次数 |
| 我的作品保存 | 完全失效 | 刷新页面后全部丢失 |
| 跨设备作品同步 | 完全失效 | 无数据库存储 |
| 云端作品加载 | 完全失效 | 无法检索历史作品 |

### 🟡 中等影响（功能受限）

| 功能 | 影响程度 | 原因 |
|------|--------|------|
| AI 优化 | 无法记录 | 历史任务无法追踪 |
| 图片上传 | 无记录 | COS URL 无数据库备份 |

### 🟢 无影响（应用仍可使用）

| 功能 | 影响程度 | 原因 |
|------|--------|------|
| 图片上传 | 继续工作 | 纯客户端处理 |
| 图纸生成 | 继续工作 | 本地算法 |
| 色号匹配 | 继续工作 | 客户端库 |
| 导出 PNG | 继续工作 | 浏览器下载 |

---

## E. 停用当前腾讯云 PostgreSQL 会出现的问题

### 应用启动阶段

```
❌ /api/health 诊断端点会显示 database: { connected: false }
❌ Dockerfile 的 npx prisma migrate deploy 会失败
❌ 后端启动失败，CloudBase 容器无法部署成功
❌ 部署流程中断，导致整个后端无法上线
```

### 运行时问题

```
❌ 用户无法注册：POST /api/auth/register 返回 500 错误（数据库连接失败）
❌ 用户无法登录：POST /api/auth/login 返回 500 错误
❌ 用户中心显示错误：GET /api/membership/me 无响应
❌ 作品列表空白：GET /api/works 返回 500 错误
❌ 上传图片失败：POST /api/uploads/image 记录失败，虽然前端显示上传成功
❌ AI 次数显示错误：GET /api/credits/me 无法获取
```

### 用户体验问题

```
❌ 登录状态丢失：刷新页面后自动登出
❌ 作品数据丢失：刷新页面后之前的作品消失
❌ 无法保存作品：生成的图纸无法保存到云端
❌ 无法查看历史：无法检索之前生成过的作品
❌ 无法验证会员：无法确认用户的会员身份
```

---

## F. 迁移到腾讯云轻量服务器自建 PostgreSQL 需要改哪些文件

### 需要修改的文件

#### 1. **环境变量配置** ❗ 必须修改

```
.env（本地开发）
server/.env（本地开发）
.env.production（生产环境）
server/.env.local（本地开发的服务端配置）
cloudbaserc.json（部署配置）
```

**具体修改**：
- `DATABASE_URL` 从腾讯云 RDS 改为轻量服务器的 PostgreSQL
- 格式保持相同：`postgresql://user:password@host:port/database`

#### 2. **Docker 构建配置** 可能需要修改

```
server/Dockerfile
```

**具体修改**（如果轻量服务器在云内网）：
- 添加 `--network host` 或网络配置
- 可能需要调整 `RUN apk add` 的依赖
- 健康检查可能需要调整超时时间

#### 3. **Prisma 配置** ✅ 无需修改

```
server/prisma/schema.prisma
```

**原因**：
- 已使用 `provider = "postgresql"`
- 已使用 `url = env("DATABASE_URL")`
- 迁移文件完全可复用

#### 4. **CloudBase 云托管配置** 需要修改

```
cloudbaserc.json
```

**具体修改**：
- 在环境变量中设置轻量服务器的 `DATABASE_URL`
- 确保云托管容器可以访问轻量服务器（网络配置）

### 无需修改的文件

```
✅ server/package.json（Prisma、Prisma Client 依赖无变化）
✅ server/package-lock.json
✅ src/ 前端代码（完全无关）
✅ server/routes/（所有路由文件）
✅ server/services/（所有业务逻辑）
✅ server/middleware/（认证中间件）
✅ server/types/（类型定义）
```

---

## G. 是否可以只替换 DATABASE_URL

### ✅ 答案：可以

**替换步骤**：

1. **获取轻量服务器的 PostgreSQL 连接字符串**
   ```
   postgresql://username:password@轻量服务器IP或域名:5432/dora_prod
   ```

2. **修改环境变量**
   - 本地开发：`server/.env.local` 中修改 `DATABASE_URL`
   - 生产环境：CloudBase 控制台的环境变量中修改 `DATABASE_URL`

3. **执行迁移**
   ```bash
   cd server
   npx prisma migrate deploy
   ```

4. **验证**
   ```bash
   npx prisma db push --skip-generate
   curl http://localhost:3001/api/health
   ```

### ✅ 原因

- **Prisma 配置已完整**：
  - 已配置 `provider = "postgresql"`
  - 已配置 `url = env("DATABASE_URL")`
  - 迁移文件完全兼容

- **后端代码无数据库特定逻辑**：
  - 所有数据库操作通过 Prisma ORM
  - 没有硬编码的 SQL 或连接字符串

- **前端代码零数据库依赖**：
  - 所有数据库操作通过后端 API
  - 使用标准的 HTTP 请求

### ⚠️ 前置条件

1. 轻量服务器已安装 PostgreSQL
2. 轻量服务器的 PostgreSQL 版本 ≥ 12
3. CloudBase 云托管容器可访问轻量服务器（网络连通性）
4. 轻量服务器的防火墙允许 CloudBase 访问 5432 端口

---

## H. 迁移前必须备份哪些数据

### 🔴 关键数据（必须备份）

| 数据类型 | 表 | 重要性 | 备份方式 |
|---------|---|----|--------|
| 用户账户 | users | 🔴 必须 | PostgreSQL dump + JSON 导出 |
| 用户作品 | works | 🔴 必须 | PostgreSQL dump + CSV 导出 |
| 会员信息 | memberships | 🔴 必须 | PostgreSQL dump |
| AI 次数 | ai_credits | 🟡 重要 | PostgreSQL dump |
| AI 历史 | ai_jobs | 🟡 重要 | PostgreSQL dump |
| 图片记录 | uploaded_images | 🟡 重要 | PostgreSQL dump + 文件列表 |

### 备份命令（当前 CloudBase PostgreSQL）

```bash
# 1. 远程完整 dump（包括所有表）
pg_dump postgresql://user:password@cloudbase-host:5432/dora_prod > backup_full_$(date +%Y%m%d_%H%M%S).sql

# 2. 仅备份用户和作品数据
pg_dump -t users -t works -t memberships -t ai_credits postgresql://user:password@cloudbase-host:5432/dora_prod > backup_critical_$(date +%Y%m%d_%H%M%S).sql

# 3. 导出为 CSV（人类可读）
psql postgresql://user:password@cloudbase-host:5432/dora_prod -c "COPY users TO STDOUT WITH CSV HEADER;" > backup_users.csv
psql postgresql://user:password@cloudbase-host:5432/dora_prod -c "COPY works TO STDOUT WITH CSV HEADER;" > backup_works.csv

# 4. 验证备份
file backup_full_*.sql
wc -l backup_*.csv
```

### 备份清单

```
✅ 备份文件名：backup_full_YYYYMMDD_HHMMSS.sql（≥ 1 MB）
✅ 备份文件名：backup_critical_YYYYMMDD_HHMMSS.sql
✅ CSV 备份：backup_users.csv / backup_works.csv
✅ 存储位置：本地 + 腾讯云对象存储 COS（异地备份）
✅ 备份时间：迁移前 24 小时内
✅ 测试恢复：从备份恢复到临时数据库，验证数据完整性
```

### 恢复测试

```bash
# 在临时数据库中恢复
createdb dora_test
psql dora_test < backup_critical_YYYYMMDD_HHMMSS.sql

# 验证数据
psql dora_test -c "SELECT COUNT(*) as user_count FROM users;"
psql dora_test -c "SELECT COUNT(*) as work_count FROM works;"

# 如果恢复成功，删除临时数据库
dropdb dora_test
```

---

## I. 推荐的下一步执行顺序

### 第 1 阶段：准备和备份（1-2 天）

```
1. ✅ 当前 CloudBase PostgreSQL 完整备份
   - pg_dump 完整数据库
   - 复制备份文件到 COS 和本地
   - 测试从备份恢复

2. ✅ 审查迁移文档
   - 阅读 docs/TENCENT_CLOUD_DATA_MIGRATION_PLAN.md
   - 确认 Prisma schema 和迁移文件无修改需求

3. ✅ 获取轻量服务器信息
   - 轻量服务器 IP 地址
   - PostgreSQL 版本（确保 ≥ 12）
   - 数据库用户和密码
```

### 第 2 阶段：轻量服务器 PostgreSQL 准备（2-3 天）

```
4. ✅ 创建轻量服务器 PostgreSQL 实例
   - 腾讯云轻量应用服务器：购买或已有
   - 安装 PostgreSQL 14+（推荐）
   - 创建新数据库：dora_prod

5. ✅ 初始化轻量服务器 PostgreSQL
   - 创建数据库用户
   - 设置访问权限
   - 配置防火墙规则（允许 CloudBase IP 访问）

6. ✅ 测试网络连通性
   - CloudBase 云托管容器 → 轻量服务器 PostgreSQL
   - 执行 psql 连接测试
   - 记录连接字符串
```

### 第 3 阶段：数据迁移（1 天）

```
7. ✅ 恢复数据到轻量服务器
   - 从备份文件恢复 dora_prod 数据库
   - psql dora_prod < backup_critical_*.sql
   - 验证数据完整性（检查行数）

8. ✅ 执行 Prisma 迁移
   - npx prisma migrate deploy（应该立即成功，因为已有数据）
   - 或 npx prisma db push（如果需要更新 schema）

9. ✅ 验证迁移结果
   - 连接轻量服务器 PostgreSQL 验证表结构
   - 运行诊断查询检查外键和索引
```

### 第 4 阶段：部署更新（1 天）

```
10. ✅ 更新环境变量
    - 本地：server/.env.local 的 DATABASE_URL
    - 生产：CloudBase 环境变量的 DATABASE_URL
    - 验证连接字符串格式正确

11. ✅ 测试本地开发环境
    - npm run dev（前端）
    - cd server && npm run dev（后端）
    - 注册新用户 → 创建作品 → 查看会员
    - 监控后端日志确认 DB 连接成功

12. ✅ 部署到 CloudBase
    - git commit 包含新的 DATABASE_URL（或环境变量配置）
    - 推送到 GitHub
    - CloudBase 触发自动构建和部署
    - 监控部署日志
```

### 第 5 阶段：验证和回滚预案（1 天）

```
13. ✅ 生产环境验证
    - 访问 https://dora-beads-xxx.cloudbaseapp.com
    - 执行完整用户流程：注册 → 登录 → 保存作品 → 查看会员
    - 检查 /api/health 诊断端点

14. ✅ 监控和日志
    - 检查 CloudBase 日志（容器启动日志）
    - 检查后端日志（数据库连接日志）
    - 设置告警（如 DB 连接失败）

15. ✅ 回滚预案准备
    - 旧 CloudBase PostgreSQL 保持 24 小时
    - 备份文件存储多份副本
    - 记录回滚流程（恢复 DATABASE_URL 和 CloudBase）
```

---

## J. 风险评估

### 🟢 低风险（推荐迁移）

| 风险 | 评估 | 缓解措施 |
|------|------|--------|
| 代码兼容性 | 低 | 仅改 DATABASE_URL，Prisma 完全兼容 |
| 数据丢失 | 低 | 完整备份 + 恢复测试 |
| 迁移时间 | 低 | 数据量小（MVP 阶段），迁移 < 5 分钟 |
| SQL 兼容性 | 低 | PostgreSQL ≥ 12，迁移文件通用 |

### 🟡 中风险（需要注意）

| 风险 | 评估 | 缓解措施 |
|------|------|--------|
| 网络连通性 | 中 | 事前测试 CloudBase ↔ 轻量服务器网络 |
| 防火墙配置 | 中 | 提前配置安全组，允许 5432 端口 |
| 轻量服务器宕机 | 中 | 定期自动备份，建议设置 RTO = 1 小时 |

### 🔴 高风险（几乎不存在）

| 风险 | 评估 | 缓解措施 |
|------|------|--------|
| 无 | - | 该迁移架构清晰，风险可控 |

---

## K. 成本对比

### 当前：腾讯云 CloudBase + RDS PostgreSQL

```
CloudBase 云托管：¥100-200/月（按调用次数）
RDS PostgreSQL：¥200-400/月（按规格和存储）
总月成本：¥300-600
```

### 迁移后：腾讯云轻量服务器自建 PostgreSQL

```
轻量服务器（2核2GB）：¥40-60/月
PostgreSQL 备份：¥10-20/月（对象存储）
总月成本：¥50-80
```

### 成本节省

```
年度节省：(¥300-600 - ¥50-80) × 12 = ¥2,640-6,960
迁移工作量：< 1 周
ROI：极高
```

---

## L. 迁移检查清单

### ✅ 开始迁移前

- [ ] 完整备份当前 CloudBase PostgreSQL
- [ ] 验证备份文件可恢复
- [ ] 轻量服务器 PostgreSQL 已安装（版本 ≥ 12）
- [ ] 轻量服务器与 CloudBase 网络连通
- [ ] 防火墙规则已配置（允许 5432）
- [ ] 获取完整连接字符串：postgresql://user:password@ip:5432/dora_prod
- [ ] 阅读 Prisma 迁移文件，确认无特殊配置

### ✅ 迁移中

- [ ] 备份恢复到轻量服务器 dora_prod
- [ ] 执行 npx prisma migrate deploy
- [ ] 验证所有表和索引完整
- [ ] 本地开发环境测试（npm run dev）
- [ ] 完整用户流程测试（注册→登录→保存→查询）
- [ ] 检查后端日志无错误

### ✅ 迁移后

- [ ] /api/health 返回 database: { connected: true }
- [ ] 生产环境完整测试（所有用户功能）
- [ ] 监控告警已设置
- [ ] 旧 CloudBase RDS 保持 7 天（防止回滚需要）
- [ ] 文档已更新（DATABASE_URL 来源）

---

## 总结

| 项 | 答案 |
|----|------|
| **是否适合迁移** | ✅ 是，强烈推荐 |
| **代码改动量** | 🟢 极少（仅环境变量） |
| **迁移难度** | 🟢 低（Prisma 完全兼容） |
| **风险等级** | 🟢 低（可控且可回滚） |
| **所需时间** | 3-5 天（包括测试） |
| **成本节省** | 💰 年省 ¥2,640-6,960 |
| **数据库停用风险** | 🔴 严重（用户功能全部失效） |

### 核心建议

1. **立即开始备份**：当前 CloudBase PostgreSQL 完整备份
2. **准备轻量服务器**：安装 PostgreSQL，准备网络
3. **小流量测试**：先在测试数据库验证迁移流程
4. **灰度发布**：切换小部分流量到轻量服务器，观察 24 小时
5. **完全切换**：确认无问题后更新生产 DATABASE_URL

---

**报告完成日期**：2026-06-11  
**报告编制者**：Claude Code  
**报告有效期**：30 天（之后请重新审查）

