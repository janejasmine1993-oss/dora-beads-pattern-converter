# PostgreSQL 迁移快速参考

**当前情况**
- 当前：腾讯云 RDS PostgreSQL
- 目标：腾讯云轻量服务器自建 PostgreSQL
- 成本：年省 ¥2,640-6,960
- 难度：🟢 低（仅改 DATABASE_URL）

---

## 核心技术参数

### 版本信息
```
Prisma: ^5.20.0 ✅ 完全支持 PostgreSQL 12+
PostgreSQL: 推荐 14 或 15
驱动: pg ^8.21.0
```

### 数据库结构
```
6 张表：users, memberships, ai_credits, works, ai_jobs, uploaded_images
外键：6 个（CASCADE on delete）
索引：8 个
大小：~ 10-50 MB（MVP 阶段）
```

### DATABASE_URL 格式
```
postgresql://username:password@host:port/dora_prod?sslmode=disable

字段说明：
- protocol: postgresql://（固定）
- username: dora_user（待创建）
- password: 强密码（16+ 字符）
- host: 轻量服务器内网 IP（推荐）或公网 IP
- port: 5432（PostgreSQL 标准端口）
- database: dora_prod（保持一致）
- sslmode: disable（内网）或 require（公网）
```

---

## 备份命令（快速版）

### 完整备份
```bash
pg_dump \
  -h your-rds-host \
  -U admin \
  -d dora_prod \
  -F c \
  > backup-$(date +%Y%m%d).dump
```

### CSV 导出（可读）
```bash
for table in users memberships ai_credits works ai_jobs uploaded_images; do
  psql -h your-rds-host -U admin -d dora_prod \
    -c "COPY $table TO STDOUT WITH CSV HEADER;" \
    > backup-$table.csv
done
```

### 验证备份
```bash
# 检查文件大小
ls -lh backup-*.dump

# 查看 dump 内容摘要
pg_restore -l backup-*.dump | head -20

# 测试恢复（到临时库）
createdb test_db
pg_restore -d test_db backup-*.dump
dropdb test_db
```

---

## 轻量服务器初始化（快速版）

### 安装 PostgreSQL
```bash
sudo apt-get update
sudo apt-get install -y postgresql-15 postgresql-contrib-15

sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 创建用户和库
```bash
# 创建用户
sudo -u postgres psql << EOF
CREATE USER dora_user WITH PASSWORD 'your_strong_password';
CREATE DATABASE dora_prod OWNER dora_user;
EOF
```

### 导入备份
```bash
PGPASSWORD='your_strong_password' pg_restore \
  -h localhost \
  -U dora_user \
  -d dora_prod \
  backup-*.dump
```

### 验证迁移
```bash
PGPASSWORD='your_strong_password' psql \
  -h localhost \
  -U dora_user \
  -d dora_prod << EOF
SELECT 
  'users' as t, COUNT(*) FROM users UNION ALL
  SELECT 'memberships', COUNT(*) FROM memberships UNION ALL
  SELECT 'ai_credits', COUNT(*) FROM ai_credits UNION ALL
  SELECT 'works', COUNT(*) FROM works UNION ALL
  SELECT 'ai_jobs', COUNT(*) FROM ai_jobs UNION ALL
  SELECT 'uploaded_images', COUNT(*) FROM uploaded_images;
EOF
```

---

## 防火墙配置（快速版）

### VPC 内网（推荐）
```bash
# 允许 VPC 内的所有 IP
sudo ufw allow from 10.0.0.0/16 to any port 5432
```

### 仅允许 CloudBase IP（如固定）
```bash
# 替换为实际的 CloudBase IP
CLOUDBASE_IP="119.x.x.x"
sudo ufw allow from $CLOUDBASE_IP to any port 5432
```

### PostgreSQL pg_hba.conf（仅内网）
```bash
# 编辑
sudo nano /etc/postgresql/15/main/pg_hba.conf

# 添加（VPC 内网）
host    dora_prod       dora_user       10.0.0.0/16             md5

# 重启
sudo systemctl restart postgresql
```

---

## 部署更新（快速版）

### 本地开发环境
```bash
# 修改 server/.env.local
DATABASE_URL="postgresql://dora_user:password@轻量IP:5432/dora_prod?sslmode=disable"

# 测试
cd server
npm run dev

# 验证
curl http://localhost:3001/api/health
```

### 生产环境（CloudBase）
```bash
# 方式 1：在 CloudBase 控制台
# 云托管 → 环境变量 → 修改 DATABASE_URL

# 方式 2：通过 cloudbaserc.json
{
  "cloudRunServices": [{
    "name": "dora-beads-api",
    "env": {
      "DATABASE_URL": "postgresql://dora_user:password@轻量IP:5432/dora_prod"
    }
  }]
}

# 部署
git push origin <branch>
# CloudBase 自动触发构建和部署
```

---

## 回滚命令（快速版）

### 立即回滚
```bash
# 在 CloudBase 控制台修改 DATABASE_URL 回旧地址
DATABASE_URL="postgresql://admin@old-rds:5432/dora_prod"

# 重新部署（自动触发）
git revert <迁移提交>
git push origin <branch>
```

### 验证回滚
```bash
# 检查新库状态（可选，用于调查）
PGPASSWORD='new_password' psql \
  -h 轻量IP \
  -U dora_user \
  -d dora_prod \
  -c "SELECT COUNT(*) FROM users;"

# 验证旧库恢复
curl https://dora-beads-xxx/api/health
```

---

## 风险速查

| 风险 | 级别 | 缓解 |
|-----|------|------|
| 代码不兼容 | 🟢 无 | Prisma ORM 完全兼容 |
| 数据丢失 | 🟢 低 | 完整备份 + 恢复测试 |
| 网络不通 | 🟡 中 | 测试 CloudBase ↔ 轻量网络 |
| 密码暴露 | 🟡 中 | 强密码 + VPC 内网 |
| 轻量宕机 | 🟡 中 | 自动备份 + 监控告警 |
| 无法限制 IP | 🔴 高 | 强密码 + fail2ban + 监控 |

---

## 时间表

```
Day 1：备份 + 轻量初始化（4-6 小时）
Day 2-3：测试验证 + 性能检查（2-3 小时）
Day 4：部署上线 + 监控（1-2 小时）
Day 5-11：稳定运行监控（日常 30 分钟）
Day 12+：可选关闭旧库
```

---

## 关键时间点

| 事件 | 时间 | 操作 |
|------|------|------|
| 开始迁移 | Day 1 | pg_dump + 轻量初始化 |
| 第一次部署 | Day 2 | 更新 DATABASE_URL |
| 旧库可关闭 | Day 8 | 确保新库稳定 |
| 旧库下线截止 | Day 30 | 保存最终备份到 COS |

---

## 保险清单

迁移前确认：
- [ ] 备份文件 > 1 MB（说明包含数据）
- [ ] 备份可恢复测试（在临时库）
- [ ] 轻量服务器 SSH 可登录
- [ ] PostgreSQL 15 已安装
- [ ] 新用户和新库已创建
- [ ] 防火墙规则已配置
- [ ] CloudBase 可连接轻量（ping 测试）

迁移中确认：
- [ ] pg_restore 无错误
- [ ] 6 张表行数符合预期
- [ ] 外键完整
- [ ] 索引完整

迁移后确认：
- [ ] /api/health 返回 connected: true
- [ ] 注册新用户成功
- [ ] 查询作品列表成功
- [ ] 查看会员信息成功
- [ ] 无数据库错误日志

---

## 故障排查（3 分钟速查）

### 问题：无法连接轻量 PostgreSQL
```bash
# 1. 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 2. 检查 5432 端口是否开放
sudo ss -tulpn | grep 5432

# 3. 测试本地连接
psql -U dora_user -d dora_prod -h localhost

# 4. 测试远程连接
psql -U dora_user -d dora_prod -h 轻量IP

# 5. 检查防火墙
sudo ufw status
sudo ufw allow 5432
```

### 问题：Dockerfile 迁移失败
```bash
# 1. 检查 DATABASE_URL 格式
echo $DATABASE_URL

# 2. 检查 Prisma 连接
npx prisma db push --skip-generate

# 3. 运行迁移
npx prisma migrate deploy

# 4. 检查表是否存在
npx prisma db pull
```

### 问题：性能缓慢
```bash
# 1. 检查轻量服务器负载
ssh user@server "top -bn1 | head -10"

# 2. 检查 PostgreSQL 连接数
PGPASSWORD=pass psql -U user -d db \
  -c "SELECT count(*) FROM pg_stat_activity;"

# 3. 检查慢查询
psql -U user -d db \
  -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;"
```

---

## 文件位置速查

```
📄 项目文档：
  - /docs/db-migration-2026-06.md（详细报告）
  - /docs/db-migration-preparation-checklist.md（准备清单）
  - /docs/db-migration-quick-reference.md（本文件）

📄 环境配置：
  - server/.env.local（本地开发用户密码，不 commit）
  - server/prisma/schema.prisma（数据库定义）
  - server/prisma/migrations/（迁移历史）

📄 部署配置：
  - cloudbaserc.json（CloudBase 配置）
  - server/Dockerfile（容器镜像）

📄 备份文件：
  - /Backups/dora-beads/backup-full-*.dump
  - /Backups/dora-beads/backup-*.csv
```

---

## 更新日志

| 日期 | 变更 |
|------|------|
| 2026-06-11 | 初版发布 |

---

**快速参考编制日期**：2026-06-11  
**建议打印此文件作为迁移现场参考**
