# PostgreSQL 迁移方案总览

> **状态**：准备阶段完成 ✅  
> **目标**：腾讯云 RDS → 腾讯云轻量服务器自建  
> **成本**：年省 ¥2,640-6,960 💰  
> **难度**：🟢 低  
> **编制日期**：2026-06-11

---

## 📚 文档导航

本迁移方案由 4 份文档组成，请按需阅读：

### 1. **db-migration-2026-06.md** ⭐ 先读这个
   - **用途**：完整的可行性分析报告
   - **长度**：629 行，详细程度 ⭐⭐⭐⭐⭐
   - **适合**：需要全面了解迁移的技术人员
   - **主要内容**：
     - A. 项目架构（前端/后端/数据库）
     - B. 数据库设计（6 张表结构）
     - C. 功能依赖分析（哪些功能需要 DB）
     - D. 停用影响分析（无 DB 会发生什么）
     - E-J. 迁移各方面详细分析

### 2. **db-migration-preparation-checklist.md** ⭐⭐ 然后读这个
   - **用途**：详细的迁移准备清单
   - **长度**：1,092 行，实操性强 ⭐⭐⭐⭐
   - **适合**：即将执行迁移的工程师
   - **主要内容**：
     - 当前环境信息（版本、配置）
     - 7 份完整 bash 脚本（备份、恢复、验证）
     - 轻量服务器初始化步骤
     - 安全配置建议（VPC、防火墙、fail2ban）
     - 回滚方案（如何快速恢复）
     - 最终迁移清单（按阶段检查）

### 3. **db-migration-quick-reference.md** ⭐⭐⭐ 迁移时的速查表
   - **用途**：快速参考卡片（打印版推荐）
   - **长度**：368 行，速查性强 ⭐⭐⭐⭐⭐
   - **适合**：迁移现场的即时参考
   - **主要内容**：
     - 核心技术参数（一页纸概览）
     - 4 大备份命令（快速版）
     - 轻量初始化（8 条命令）
     - 部署更新（3 种方式）
     - 风险速查表（5 行总结）
     - 故障排查（3 分钟快速定位）

### 4. **MIGRATION-README.md** 📍 本文件
   - **用途**：总体导航和执行路线图
   - **长度**：本文档
   - **适合**：所有参与者

---

## 🚀 执行路线图

### 第一阶段：信息收集（1 小时）

```
1. 📖 阅读本文档
   ↓
2. 📖 精读 db-migration-2026-06.md 的前 D 部分
   ↓
3. ✅ 确认理解以下核心点：
   - 6 张表的关键字段
   - DATABASE_URL 的新格式
   - 防火墙的必要配置
```

### 第二阶段：准备（2-3 天）

```
1. 🛠️ 购买腾讯云轻量服务器（2核2GB，Ubuntu 22.04）
   ↓
2. 🔐 获取轻量服务器 SSH 登录信息
   ↓
3. 💾 备份当前 RDS PostgreSQL
   运行：bash scripts/db-migration-tools.sh backup-rds
   ↓
4. ✅ 验证备份完整性
   运行：bash scripts/db-migration-tools.sh verify-backup <文件名>
   ↓
5. 📋 准备轻量服务器初始化信息
   参考：docs/db-migration-preparation-checklist.md 第 5 部分
```

### 第三阶段：初始化轻量服务器（2-3 小时）

```
1. 🔗 SSH 登录轻量服务器
   ↓
2. 📥 上传备份文件和脚本到轻量服务器
   ↓
3. 🚀 运行初始化
   参考：docs/db-migration-preparation-checklist.md 第 5 部分
   或简化版：bash scripts/db-migration-tools.sh init-light-server
   ↓
4. ✅ 验证初始化结果
   运行：bash scripts/db-migration-tools.sh verify-light <IP> <user> <pass>
```

### 第四阶段：本地测试（1-2 小时）

```
1. 📝 修改本地 DATABASE_URL
   编辑：server/.env.local
   新值：postgresql://dora_user:password@轻量IP:5432/dora_prod?sslmode=disable
   ↓
2. 🧪 启动本地开发环境
   运行：npm run dev（前端）
   运行：cd server && npm run dev（后端）
   ↓
3. ✅ 执行测试流程
   - 注册新用户
   - 创建作品
   - 查看会员信息
   - 检查 /api/health 状态
```

### 第五阶段：生产部署（1-2 小时）

```
1. 📝 修改生产环境配置
   选项 A：CloudBase 控制台 → 环境变量 → DATABASE_URL
   选项 B：更新 cloudbaserc.json
   ↓
2. 🚀 推送代码并部署
   运行：git commit && git push origin <branch>
   ↓
3. ⏳ 等待 CloudBase 自动构建和部署
   监控：CloudBase 控制台 → 构建日志
   ↓
4. ✅ 验证部署
   检查：/api/health 返回 connected: true
   测试：注册、登录、作品保存
```

### 第六阶段：监控（7 天）

```
Day 1-3：密切监控
  - 检查错误日志
  - 监控轻量服务器 CPU/内存
  - 观察用户反馈
  ↓
Day 4-7：例行监控
  - 每天检查 1-2 次
  - 确保无数据不一致
  ↓
Day 8+：可选操作
  - 关闭旧 RDS PostgreSQL
  - 保存最终备份到 COS
```

---

## 🔑 关键参数速查

### DATABASE_URL 格式
```
postgresql://用户:密码@IP:5432/dora_prod?sslmode=disable
```

### 6 张表
| 表名 | 用途 | 记录数 |
|------|------|-------|
| users | 用户账户 | ? |
| memberships | 会员信息 | ? |
| ai_credits | AI 次数 | ? |
| works | 作品 | ? |
| ai_jobs | AI 任务 | ? |
| uploaded_images | 图片记录 | ? |

### Prisma 版本
```
@prisma/client: ^5.20.0
PostgreSQL: 推荐 14 或 15
```

---

## 📊 风险和成本对比

### 成本节省
```
当前（RDS）：¥300-600/月
迁移后（轻量）：¥50-80/月
年节省：¥2,640-6,960 💰
ROI：极高（<1 周回本）
```

### 风险评估
```
代码兼容性：🟢 无风险（Prisma ORM 完全支持）
数据丢失：🟢 低风险（有完整备份）
网络问题：🟡 中风险（CloudBase ↔ 轻量需同 VPC）
密码暴露：🟡 中风险（强密码 + VPC 隔离）
服务中断：🟡 中风险（轻量宕机需手动重启）
```

### 回滚时间
```
决定回滚：< 5 分钟
执行回滚：5-10 分钟（修改 DATABASE_URL + 重新部署）
总时间：< 15 分钟
```

---

## 🛠️ 可用工具

### 自动化脚本
```bash
bash scripts/db-migration-tools.sh <command>

命令列表：
  backup-rds              备份 RDS
  backup-csv              导出 CSV
  verify-backup           验证备份
  init-light-server       初始化轻量
  restore-light           恢复数据
  verify-light            验证轻量
  test-local              本地测试
  prepare-rollback        准备回滚
```

### 文档对应关系
```
遇到什么问题？          应该看什么文档？
────────────────────────────────────────
想了解技术细节          db-migration-2026-06.md
需要详细步骤            db-migration-preparation-checklist.md
要快速参考              db-migration-quick-reference.md
迁移现场需要帮助        MIGRATION-README.md（本文档）
```

---

## ✅ 前置条件检查

在开始迁移前，确认已满足：

- [ ] 腾讯云轻量应用服务器已购买（2核2GB，Ubuntu 22.04）
- [ ] 可通过 SSH 登录轻量服务器
- [ ] 本地已安装 PostgreSQL 客户端（psql、pg_dump、pg_restore）
- [ ] 当前 RDS PostgreSQL 可访问
- [ ] 获得 RDS 管理员用户名和密码
- [ ] 备份文件存储空间充足（≥ 100 MB）
- [ ] 团队成员都阅读过本文档
- [ ] 已制定回滚方案和应急联系人

---

## ⚠️ 不要做的事

```
❌ 不要在迁移前删除旧 RDS（至少保留 7 天）
❌ 不要用弱密码（< 16 字符，无特殊符号）
❌ 不要跳过备份验证步骤
❌ 不要在高峰时段部署
❌ 不要同时修改其他服务（只改 DATABASE_URL）
❌ 不要忘记配置防火墙规则
❌ 不要在验证完成前向用户宣布迁移
```

---

## 📞 故障排查速查

| 问题 | 症状 | 解决方案 |
|------|------|--------|
| 无法连接轻量 PG | /api/health 返回错误 | 检查 IP、用户、密码，测试网络连通性 |
| Dockerfile 失败 | 构建日志显示数据库错误 | 确认 DATABASE_URL 格式正确 |
| 性能下降 | 响应慢，超时 | 检查轻量服务器 CPU/内存，调整规格 |
| 数据不一致 | 作品丢失或错误 | 从备份恢复，检查外键关系 |
| 无法回滚 | 旧 RDS 已删除 | 从备份文件恢复（1-2 小时）|

---

## 📈 预期时间线

```
Day 1：准备阶段（4-6 小时）
  - 备份当前数据库
  - 验证备份完整性
  - 购买和配置轻量服务器

Day 2-3：初始化阶段（4-6 小时）
  - 安装 PostgreSQL
  - 创建用户和数据库
  - 导入备份数据

Day 4：测试阶段（3-4 小时）
  - 本地开发环境测试
  - 功能流程验证
  - 性能基准测试

Day 5：部署阶段（2-3 小时）
  - 更新环境变量
  - 部署到 CloudBase
  - 生产验证

Day 6-12：监控阶段（日常 30 分钟）
  - 日常健康检查
  - 错误日志分析
  - 用户反馈收集

Day 13+：清理阶段（1-2 小时）
  - 关闭旧 RDS（可选）
  - 保存最终备份
  - 更新文档和流程
```

---

## 🎯 成功标志

迁移成功当且仅当：

✅ `/api/health` 返回 `database: { connected: true }`  
✅ 可以正常注册新用户  
✅ 用户数据可以保存和查询  
✅ 会员信息从数据库正确读取  
✅ AI 次数可以正确扣除和恢复  
✅ 历史作品可以查询和加载  
✅ 没有数据库相关的错误日志  
✅ 轻量服务器运行 7 天无故障  

---

## 📚 附录：文件清单

```
📁 docs/
  ├── db-migration-2026-06.md              ← 详细分析报告
  ├── db-migration-preparation-checklist.md ← 执行清单
  ├── db-migration-quick-reference.md      ← 速查表
  └── MIGRATION-README.md                   ← 本文档

📁 scripts/
  └── db-migration-tools.sh                ← 自动化工具脚本

📁 backups/
  └── (将存放备份文件)
    ├── dora-beads-full-20260611_HHMMSS.dump
    ├── dora-beads-critical-20260611_HHMMSS.dump
    └── dora-beads-*.csv
```

---

## 📝 变更历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-06-11 | 初版发布 |

---

## 🤝 需要帮助？

1. **技术问题**：查看 `db-migration-quick-reference.md` 的"故障排查"部分
2. **步骤不明确**：参考 `db-migration-preparation-checklist.md` 的详细脚本
3. **快速参考**：使用 `db-migration-quick-reference.md`（推荐打印）
4. **完整理解**：阅读 `db-migration-2026-06.md`

---

**准备清单编制完成** ✅  
**状态：待执行迁移**  
**下一步：按照"执行路线图"第一阶段开始**

