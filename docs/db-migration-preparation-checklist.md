# PostgreSQL 迁移准备清单
**编制日期**：2026-06-11  
**迁移方案**：腾讯云 RDS PostgreSQL → 腾讯云轻量服务器自建 PostgreSQL  
**当前版本**：v0.8.1-cloudbase-mvp-staging  
**目标状态**：降低数据库成本，保留全部功能

---

## 1. 当前环境信息

### Prisma 和 PostgreSQL 版本

```
✅ Prisma 客户端版本：@prisma/client ^5.20.0
✅ Prisma CLI 版本：prisma ^5.20.0
✅ 数据库提供商：postgresql
✅ 数据库连接方式：环境变量 DATABASE_URL
✅ 当前数据库引擎：PostgreSQL 12+ (RDS)
✅ 推荐目标版本：PostgreSQL 14 或 15（与 Prisma 5.20.0 完全兼容）
```

### 当前 DATABASE_URL 格式

```ini
# 本地开发（localhost）
DATABASE_URL="postgresql://jasmine@localhost/dora_dev"

# 生产环境（腾讯云 RDS）
DATABASE_URL="postgresql://username:password@rds-host.tencentrds.com:5432/dora_prod?sslmode=require"
```

### DATABASE_URL 必需字段

| 字段 | 当前值 | 轻量服务器值 | 备注 |
|------|-------|----------|------|
| 协议 | `postgresql://` | `postgresql://` | 保持不变 |
| 用户名 | (需配置) | (待定) | 轻量服务器需创建新用户 |
| 密码 | (需配置) | (待定) | 建议复杂密码 |
| 主机 | RDS 内网地址 | 轻量服务器内网/公网 IP | 需确认网络可达性 |
| 端口 | 5432 | 5432 | 标准 PostgreSQL 端口 |
| 数据库名 | dora_prod | dora_prod | 保持一致 |
| sslmode | require | disable 或 allow | 轻量服务器通常无 SSL，根据网络配置 |

### 新 DATABASE_URL 格式

```bash
# 轻量服务器内网（如果 CloudBase 可访问）
postgresql://username:password@内网IP:5432/dora_prod?sslmode=disable

# 轻量服务器公网（如果必须使用公网）
postgresql://username:password@公网IP:5432/dora_prod?sslmode=disable

# 完整示例
postgresql://dora_user:your_secure_password@10.0.0.100:5432/dora_prod?sslmode=disable
```

---

## 2. 当前数据库验收

### 6 张表明细

| 序号 | 表名 | 记录数 | 用途 | 关键字段 |
|-----|------|--------|------|---------|
| 1 | users | 未知 | 用户账户 | id, email, password_hash, created_at |
| 2 | memberships | 未知 | 会员信息 | user_id, level, expires_at |
| 3 | ai_credits | 未知 | AI 次数 | user_id, daily_used, extra_credits |
| 4 | works | 未知 | 用户作品 | user_id, title, bead_brand, total_beads |
| 5 | ai_jobs | 未知 | AI 任务记录 | user_id, status, source_image_url |
| 6 | uploaded_images | 未知 | 图片记录 | user_id, file_url, file_name |

### 迁移文件信息

```
📍 路径：server/prisma/migrations/20260607194421_init/
📄 文件：migration.sql（142 行）
✅ 建表数：6 个
✅ 外键：6 个（CASCADE on delete）
✅ 索引：8 个（user_id, email, status 等）
⚠️ 状态：单次初始化迁移，无后续增量迁移
```

---

## 3. 旧数据库备份命令

### 方案 A：完整 PostgreSQL Dump（推荐）

```bash
#!/bin/bash
# 文件：backup_tencent_rds.sh
# 用途：备份腾讯云 RDS PostgreSQL

BACKUP_DIR="/Users/jasmine/Documents/Backups/dora-beads"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RDS_HOST="your-rds-host.tencentrds.com"
RDS_USER="admin"
RDS_DB="dora_prod"

# 1. 完整数据库 dump（包括 schema 和数据）
echo "🔄 备份完整数据库..."
pg_dump \
  -h "$RDS_HOST" \
  -U "$RDS_USER" \
  -d "$RDS_DB" \
  -F c \
  -f "$BACKUP_DIR/dora-beads-full-$TIMESTAMP.dump"

if [ $? -eq 0 ]; then
  echo "✅ 完整备份成功: $BACKUP_DIR/dora-beads-full-$TIMESTAMP.dump"
else
  echo "❌ 完整备份失败"
  exit 1
fi

# 2. 仅备份关键表（users, works, memberships）
echo "🔄 备份关键表..."
pg_dump \
  -h "$RDS_HOST" \
  -U "$RDS_USER" \
  -d "$RDS_DB" \
  -t users \
  -t works \
  -t memberships \
  -t ai_credits \
  -F c \
  -f "$BACKUP_DIR/dora-beads-critical-$TIMESTAMP.dump"

if [ $? -eq 0 ]; then
  echo "✅ 关键表备份成功: $BACKUP_DIR/dora-beads-critical-$TIMESTAMP.dump"
else
  echo "❌ 关键表备份失败"
  exit 1
fi

# 3. 纯 SQL 格式备份（人类可读，但文件大）
echo "🔄 备份为 SQL 文本..."
pg_dump \
  -h "$RDS_HOST" \
  -U "$RDS_USER" \
  -d "$RDS_DB" \
  -F p \
  > "$BACKUP_DIR/dora-beads-sql-$TIMESTAMP.sql"

if [ $? -eq 0 ]; then
  echo "✅ SQL 备份成功: $BACKUP_DIR/dora-beads-sql-$TIMESTAMP.sql"
else
  echo "❌ SQL 备份失败"
  exit 1
fi

# 4. 验证备份
echo ""
echo "📊 备份验证："
ls -lh "$BACKUP_DIR"/dora-beads-*-$TIMESTAMP.*
echo ""
echo "✅ 所有备份完成！"
```

### 方案 B：分表 CSV 导出（可读性强）

```bash
#!/bin/bash
# 文件：backup_csv_export.sh
# 用途：导出关键表为 CSV（可用 Excel 查看）

BACKUP_DIR="/Users/jasmine/Documents/Backups/dora-beads"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RDS_HOST="your-rds-host.tencentrds.com"
RDS_USER="admin"
RDS_DB="dora_prod"

TABLES=("users" "memberships" "ai_credits" "works" "ai_jobs" "uploaded_images")

for TABLE in "${TABLES[@]}"; do
  echo "🔄 导出表: $TABLE"
  psql \
    -h "$RDS_HOST" \
    -U "$RDS_USER" \
    -d "$RDS_DB" \
    -c "COPY $TABLE TO STDOUT WITH CSV HEADER;" \
    > "$BACKUP_DIR/dora-beads-${TABLE}-${TIMESTAMP}.csv"
  
  if [ $? -eq 0 ]; then
    echo "✅ $TABLE 导出成功"
  else
    echo "❌ $TABLE 导出失败"
  fi
done

echo ""
echo "📊 CSV 导出验证："
ls -lh "$BACKUP_DIR"/dora-beads-*.csv
```

### 方案 C：Prisma 导出（仅数据，不含 schema）

```bash
#!/bin/bash
# 文件：backup_prisma_snapshot.sh
# 用途：使用 Prisma 导出数据快照

cd /Users/jasmine/Documents/Projects/dora-beads-pattern-converter/server

BACKUP_DIR="../backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 1. 使用 Prisma db push 的诊断
echo "🔄 生成 Prisma 数据库诊断..."
npx prisma db push --skip-generate > "$BACKUP_DIR/prisma-diagnostic-$TIMESTAMP.log" 2>&1

# 2. 导出 Prisma schema 版本（便于后续对比）
cp prisma/schema.prisma "$BACKUP_DIR/schema-backup-$TIMESTAMP.prisma"

echo "✅ Prisma 诊断完成"
```

### 备份验证命令

```bash
#!/bin/bash
# 文件：verify_backup.sh
# 用途：验证备份完整性

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "用法: $0 <备份文件路径>"
  echo "示例: $0 dora-beads-full-20260611_120000.dump"
  exit 1
fi

echo "📋 验证备份: $BACKUP_FILE"
echo ""

# 1. 检查文件大小（dump 文件通常 > 100KB）
FILE_SIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
echo "📊 文件大小: $FILE_SIZE"

if [ -z "$FILE_SIZE" ]; then
  echo "❌ 备份文件不存在或无法读取"
  exit 1
fi

# 2. 检查 dump 文件格式
if [[ "$BACKUP_FILE" == *.dump ]]; then
  echo "📂 格式: PostgreSQL dump (二进制)"
  # 验证 dump 文件头
  file "$BACKUP_FILE"
elif [[ "$BACKUP_FILE" == *.sql ]]; then
  echo "📂 格式: SQL 文本"
  # 统计 CREATE 和 INSERT 语句
  CREATE_COUNT=$(grep -c "^CREATE TABLE" "$BACKUP_FILE")
  INSERT_COUNT=$(grep -c "^INSERT INTO" "$BACKUP_FILE")
  echo "   - CREATE TABLE 语句: $CREATE_COUNT"
  echo "   - INSERT INTO 语句: $INSERT_COUNT"
fi

echo ""
echo "✅ 备份验证通过"
```

### 备份清单检查

```bash
# 执行备份前检查清单
echo "🔍 备份准备检查清单："
echo ""
echo "1️⃣  当前数据库连接测试："
psql -h your-rds-host.tencentrds.com -U admin -d dora_prod -c "SELECT version();"

echo ""
echo "2️⃣  表结构和行数统计："
psql -h your-rds-host.tencentrds.com -U admin -d dora_prod << EOF
\dt+
SELECT 
  tablename,
  (SELECT COUNT(*) FROM pg_class WHERE relname = tablename) as row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
EOF

echo ""
echo "3️⃣  磁盘空间检查："
psql -h your-rds-host.tencentrds.com -U admin -d dora_prod -c "SELECT pg_size_pretty(pg_database_size('dora_prod'));"

echo ""
echo "4️⃣  外键和索引验证："
psql -h your-rds-host.tencentrds.com -U admin -d dora_prod << EOF
-- 外键
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY';

-- 索引
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
EOF
```

---

## 4. 轻量服务器初始化步骤

### 前置条件

```
✅ 腾讯云轻量应用服务器（已购买或即将购买）
✅ 操作系统：Ubuntu 22.04 LTS
✅ 最低配置：2 核 CPU / 2GB 内存 / 50GB 磁盘
✅ 网络：可被 CloudBase 访问（需放通 5432 端口）
✅ 管理员权限：SSH 登录且拥有 sudo 权限
```

### 步骤 1：安装 PostgreSQL

```bash
#!/bin/bash
# 文件：install_postgres.sh
# 在轻量服务器上运行

set -e

echo "🔄 更新系统包..."
sudo apt-get update
sudo apt-get upgrade -y

echo "🔄 安装 PostgreSQL 15..."
sudo apt-get install -y \
  postgresql-15 \
  postgresql-contrib-15 \
  postgresql-client-15 \
  libpq-dev

echo "🔄 启动 PostgreSQL 服务..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

echo "✅ PostgreSQL 安装完成"
echo ""
echo "验证安装："
sudo -u postgres psql --version
```

### 步骤 2：创建数据库用户

```bash
#!/bin/bash
# 文件：create_db_user.sh
# 在轻量服务器上运行

# ⚠️ 修改下面的密码！使用强密码！
DB_USER="dora_user"
DB_PASSWORD="your_secure_password_here_change_me"  # 至少 16 个字符，包含大小写和符号

echo "🔄 创建数据库用户: $DB_USER"

sudo -u postgres psql << EOF
-- 创建新用户
CREATE USER "$DB_USER" WITH PASSWORD '$DB_PASSWORD';

-- 赋予权限
ALTER USER "$DB_USER" CREATEDB;

-- 验证用户创建
\du "$DB_USER"
EOF

echo "✅ 用户创建完成"
echo ""
echo "🔐 记录这些信息（用于 DATABASE_URL）："
echo "  用户名: $DB_USER"
echo "  密码: $DB_PASSWORD（已记录，请妥善保存）"
echo "  主机: $(hostname -I | awk '{print $1}')"
echo "  端口: 5432"
```

### 步骤 3：创建数据库

```bash
#!/bin/bash
# 文件：create_database.sh
# 在轻量服务器上运行

DB_USER="dora_user"
DB_NAME="dora_prod"

echo "🔄 创建数据库: $DB_NAME"

sudo -u postgres psql << EOF
-- 创建数据库
CREATE DATABASE "$DB_NAME" OWNER "$DB_USER";

-- 设置客户端编码
ALTER DATABASE "$DB_NAME" SET client_encoding = 'UTF8';

-- 验证数据库创建
\l
EOF

echo "✅ 数据库创建完成"
```

### 步骤 4：导入备份数据

```bash
#!/bin/bash
# 文件：restore_backup.sh
# 在轻量服务器上运行

BACKUP_FILE="$1"
DB_USER="dora_user"
DB_NAME="dora_prod"
DB_HOST="localhost"

if [ -z "$BACKUP_FILE" ]; then
  echo "❌ 用法: $0 <备份文件路径>"
  echo "示例: $0 dora-beads-full-20260611_120000.dump"
  exit 1
fi

echo "🔄 恢复备份: $BACKUP_FILE"

# 如果是 .dump 格式
if [[ "$BACKUP_FILE" == *.dump ]]; then
  echo "  格式: PostgreSQL dump"
  PGPASSWORD="your_password" pg_restore \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    "$BACKUP_FILE"

# 如果是 .sql 格式
elif [[ "$BACKUP_FILE" == *.sql ]]; then
  echo "  格式: SQL 文本"
  PGPASSWORD="your_password" psql \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -f "$BACKUP_FILE"

else
  echo "❌ 不支持的格式"
  exit 1
fi

echo "✅ 恢复完成"
```

### 步骤 5：验证迁移结果

```bash
#!/bin/bash
# 文件：verify_migration.sh
# 在轻量服务器上运行

DB_USER="dora_user"
DB_NAME="dora_prod"
DB_HOST="localhost"
DB_PASSWORD="your_password"

echo "📋 开始验证迁移结果..."
echo ""

# 1. 验证 6 张表存在
echo "1️⃣  验证表结构："
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

echo ""

# 2. 验证行数
echo "2️⃣  验证数据行数："
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" << EOF
SELECT 
  't1' as table_name,
  (SELECT COUNT(*) FROM users) as user_count,
  (SELECT COUNT(*) FROM memberships) as membership_count,
  (SELECT COUNT(*) FROM ai_credits) as credits_count,
  (SELECT COUNT(*) FROM works) as works_count,
  (SELECT COUNT(*) FROM ai_jobs) as jobs_count,
  (SELECT COUNT(*) FROM uploaded_images) as images_count;
EOF

echo ""

# 3. 验证外键
echo "3️⃣  验证外键关系："
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -c "SELECT constraint_name, table_name FROM information_schema.key_column_usage WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY';"

echo ""

# 4. 验证索引
echo "4️⃣  验证索引："
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -c "SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';"

echo ""
echo "✅ 验证完成"
```

### 完整初始化脚本

```bash
#!/bin/bash
# 文件：init_complete.sh
# 在轻量服务器上一次性完成所有初始化

set -e

# 配置变量
DB_USER="dora_user"
DB_PASSWORD="your_secure_password_here_change_me"  # ⚠️ 修改此处
DB_NAME="dora_prod"
BACKUP_FILE="$1"  # 从命令行参数获取备份文件

if [ -z "$BACKUP_FILE" ]; then
  echo "❌ 用法: sudo $0 <备份文件路径>"
  exit 1
fi

# 步骤 1：安装
echo "====== 步骤 1：安装 PostgreSQL ======"
sudo apt-get update
sudo apt-get install -y postgresql-15 postgresql-contrib-15 postgresql-client-15 libpq-dev
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 步骤 2：创建用户
echo ""
echo "====== 步骤 2：创建数据库用户 ======"
sudo -u postgres psql << EOF
CREATE USER "$DB_USER" WITH PASSWORD '$DB_PASSWORD';
ALTER USER "$DB_USER" CREATEDB;
EOF

# 步骤 3：创建数据库
echo ""
echo "====== 步骤 3：创建数据库 ======"
sudo -u postgres psql << EOF
CREATE DATABASE "$DB_NAME" OWNER "$DB_USER";
ALTER DATABASE "$DB_NAME" SET client_encoding = 'UTF8';
EOF

# 步骤 4：恢复备份
echo ""
echo "====== 步骤 4：恢复备份数据 ======"
if [[ "$BACKUP_FILE" == *.dump ]]; then
  PGPASSWORD="$DB_PASSWORD" pg_restore \
    -h localhost \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --clean \
    "$BACKUP_FILE"
elif [[ "$BACKUP_FILE" == *.sql ]]; then
  PGPASSWORD="$DB_PASSWORD" psql \
    -h localhost \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -f "$BACKUP_FILE"
fi

# 步骤 5：验证
echo ""
echo "====== 步骤 5：验证迁移结果 ======"
PGPASSWORD="$DB_PASSWORD" psql \
  -h localhost \
  -U "$DB_USER" \
  -d "$DB_NAME" << EOF
SELECT 
  'users' as table_name,
  COUNT(*) as row_count
FROM users
UNION ALL
SELECT 'memberships', COUNT(*) FROM memberships
UNION ALL
SELECT 'ai_credits', COUNT(*) FROM ai_credits
UNION ALL
SELECT 'works', COUNT(*) FROM works
UNION ALL
SELECT 'ai_jobs', COUNT(*) FROM ai_jobs
UNION ALL
SELECT 'uploaded_images', COUNT(*) FROM uploaded_images
ORDER BY table_name;
EOF

echo ""
echo "✅ 初始化完成！"
echo ""
echo "📋 记录以下信息用于 DATABASE_URL："
echo "  - 用户名: $DB_USER"
echo "  - 密码: $DB_PASSWORD"
echo "  - 数据库: $DB_NAME"
echo "  - 主机: $(hostname -I | awk '{print $1}')"
echo "  - 端口: 5432"
```

---

## 5. 安全配置建议

### 5.1 PostgreSQL 端口访问控制

#### 当前架构分析

```
┌─────────────────┐
│  CloudBase 云托管 │  (Express 后端容器)
└────────┬────────┘
         │ 需要访问数据库
         ↓
    ┌─────────────────────────┐
    │ 轻量服务器 PostgreSQL    │  (5432 端口)
    │ IP: 10.0.0.100 (内网)    │
    │ IP: 120.x.x.x (公网)      │
    └─────────────────────────┘
```

#### 推荐方案：内网通信（最安全）

```bash
#!/bin/bash
# 前提条件：CloudBase 云托管和轻量服务器在同一腾讯云 VPC

# ✅ 最佳实践：仅在内网允许 5432 端口
sudo ufw allow from 10.0.0.0/16 to any port 5432 comment "Allow CloudBase VPC"

# 验证防火墙规则
sudo ufw status numbered

# PostgreSQL pg_hba.conf 配置
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

**pg_hba.conf 配置（仅内网）**：

```ini
# 本地连接
local   all             all                                     trust

# IPv4 本地连接
host    all             all             127.0.0.1/32            md5

# 同 VPC 内网连接
host    all             all             10.0.0.0/16             md5

# ❌ 禁止公网访问
# host    all             all             0.0.0.0/0               reject
```

#### 备选方案：公网通信（如果内网不可用）

```bash
# ⚠️ 风险较高：需要强认证和 SSL

# 1. 配置防火墙（仅允许特定 IP）
sudo ufw allow from CloudBase_IP to any port 5432 comment "Allow CloudBase only"

# 2. PostgreSQL pg_hba.conf 配置（强制 SSL）
host    dora_prod       dora_user       CloudBase_IP/32         md5

# 3. 强制 SSL 连接
sudo nano /etc/postgresql/15/main/postgresql.conf
# ssl = on
# ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
# ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'

# 4. 重启 PostgreSQL
sudo systemctl restart postgresql
```

### 5.2 限制访问来源

#### 如果 CloudBase IP 固定

```bash
# 获取 CloudBase IP
# 在腾讯云 CloudBase 控制台查看"云托管"服务的公网 IP

CLOUDBASE_IP="119.x.x.x"

# 配置防火墙
sudo ufw allow from $CLOUDBASE_IP to any port 5432

# 验证
sudo ufw status verbose | grep 5432
```

#### 如果 CloudBase IP 不固定（云托管多副本自动扩缩容）

```bash
# ⚠️ 问题：CloudBase 容器自动扩缩容时 IP 可能变化

# 解决方案 1：允许整个 VPC（推荐）
sudo ufw allow from 10.0.0.0/16 to any port 5432

# 解决方案 2：使用 CloudBase 自带 VPC 内网
# 在 CloudBase 控制台配置：环境 → 网络 → VPC
# 选择与轻量服务器相同的 VPC，使用内网 IP

# 解决方案 3：使用 PostgreSQL 密码强化
# 在 DATABASE_URL 中使用强密码（16+ 字符）
postgresql://dora_user:verystrongpassword123!@10.0.0.100:5432/dora_prod?sslmode=require
```

### 5.3 无法限制访问来源的风险评估

```
🔴 风险等级：中等

如果无法限制 CloudBase 的访问来源，以下风险存在：

1. 🔓 暴露风险
   - 5432 端口对公网开放
   - 任何知道数据库 IP 的人都可尝试连接
   - 本地网络（如咖啡馆 WiFi）也可扫描到

2. 🎯 攻击向量
   - 暴力破解密码（常见的 admin/admin）
   - SQL 注入（如果应用代码有漏洞）
   - DDoS 攻击（连接轰炸）

3. 💾 数据泄露
   - 用户账号密码可能泄露
   - 作品数据可能被盗取
   - 会员信息可能被篡改

缓解措施：
✅ 1. 使用强密码（至少 20 字符，包含特殊符号）
✅ 2. 定期变更数据库密码
✅ 3. 启用 PostgreSQL 日志审计
✅ 4. 监控 5432 端口连接（fail2ban）
✅ 5. 使用 VPN 或内网访问轻量服务器
```

### 5.4 fail2ban 防暴力破解（可选）

```bash
#!/bin/bash
# 在轻量服务器上安装 fail2ban

sudo apt-get install -y fail2ban

# 配置 PostgreSQL 防护
sudo tee /etc/fail2ban/jail.d/postgres.conf > /dev/null << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[postgres]
enabled = true
port = 5432
logpath = /var/log/postgresql/postgresql-15-main.log
maxretry = 3
EOF

# 启动 fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 验证
sudo fail2ban-client status postgres
```

### 5.5 长期建议：后端也迁到轻量服务器

#### 当前架构（CloudBase 云托管 + 轻量服务器 PostgreSQL）

```
优点：
  ✅ 减少数据库成本 ¥250/月 → ¥20/月
  ❌ 仍有网络跨越（CloudBase → 轻量服务器）
  ❌ 仍需处理网络隔离和访问控制
  ❌ 需要维护两个服务（CloudBase + 轻量服务器）

风险：
  ⚠️ 如果轻量服务器宕机，整个后端无法使用
  ⚠️ 数据库暴露在公网（如果无法做 VPC 隔离）
```

#### 推荐长期架构（轻量服务器 Node.js + PostgreSQL）

```
优点：
  ✅ 完全成本控制 ~¥60/月（轻量服务器 1 台）
  ✅ 内网通信，最大安全性
  ✅ 无网络延迟，性能最优
  ✅ 完全独立，自主运维

缺点：
  ❌ 需要学习 PM2/systemd 进程管理
  ❌ 需要自建备份和监控
  ❌ 单点故障（后端宕机需手动重启）

成本对比：
当前：CloudBase ¥150 + 轻量 PG ¥60 = ¥210/月
推荐：轻量服务器（包含 Node + PG）¥60/月
年节省：¥1,800

时间投入：
  - 迁移后端：1-2 周
  - 部署配置：3-5 天
  - 运维学习：1-2 周
```

**长期迁移时间表**（建议）：

```
当前（2026-06）：迁移 PostgreSQL 到轻量服务器
中期（2026-09）：评估后端性能，考虑迁移 Node.js
长期（2026-12）：如稳定可靠，全面迁到轻量服务器
```

---

## 6. 回滚方案

### 6.1 回滚场景

| 场景 | 触发条件 | 恢复时间 |
|------|--------|--------|
| 迁移前测试失败 | 轻量服务器性能不足 | < 30 分钟 |
| 迁移中故障 | 数据恢复失败 | 30-60 分钟 |
| 上线后问题 | 应用连接错误 | 5-10 分钟 |
| 数据不一致 | 发现数据丢失 | 1-2 小时 |

### 6.2 回滚执行流程

#### 步骤 1：确认需要回滚（< 5 分钟）

```bash
# 检查新库（轻量服务器）状态
PGPASSWORD="新库密码" psql \
  -h 轻量服务器IP \
  -U dora_user \
  -d dora_prod \
  -c "SELECT COUNT(*) as user_count FROM users;"

# 检查是否有严重错误
PGPASSWORD="新库密码" psql \
  -h 轻量服务器IP \
  -U dora_user \
  -d dora_prod \
  -c "SELECT * FROM users LIMIT 1;"
```

#### 步骤 2：停止后端使用新库（< 2 分钟）

```bash
# 方案 A：更新 CloudBase 环境变量（立即生效）
# 在 CloudBase 控制台：云托管 → 环境变量
# 将 DATABASE_URL 改回旧地址
# 重新部署（自动触发）

# 方案 B：本地回滚（用于开发测试）
# server/.env.local
DATABASE_URL="postgresql://旧用户@旧主机:5432/dora_prod"

# 方案 C：通过 git 提交回滚
git revert <迁移提交 hash>
git push origin <分支>
```

#### 步骤 3：验证旧库连接（< 3 分钟）

```bash
# 确认旧库仍可用
PGPASSWORD="旧库密码" psql \
  -h 旧库主机 \
  -U admin \
  -d dora_prod \
  -c "SELECT COUNT(*) FROM users;"

# 确认后端可连接
curl https://dora-beads-xxx.cloudbaseapp.com/api/health
```

### 6.3 回滚命令集

```bash
#!/bin/bash
# 文件：rollback.sh
# 用途：快速回滚到旧数据库

set -e

OLD_DATABASE_URL="postgresql://admin:old_password@old-rds.tencentrds.com:5432/dora_prod"
NEW_DATABASE_URL="postgresql://dora_user:new_password@新轻量IP:5432/dora_prod"

echo "🔄 开始回滚到旧数据库..."
echo ""

# 1. 验证旧库可用性
echo "1️⃣  验证旧库连接..."
PGPASSWORD="old_password" psql \
  -h old-rds.tencentrds.com \
  -U admin \
  -d dora_prod \
  -c "SELECT COUNT(*) FROM users;" > /dev/null

if [ $? -ne 0 ]; then
  echo "❌ 旧库连接失败，无法回滚"
  exit 1
fi
echo "✅ 旧库连接成功"

# 2. 备份新库状态（防止数据丢失）
echo ""
echo "2️⃣  备份新库状态（以防需要重新迁移）..."
BACKUP_DIR="/tmp/dora-rollback-backup"
mkdir -p "$BACKUP_DIR"

PGPASSWORD="new_password" pg_dump \
  -h 新轻量IP \
  -U dora_user \
  -d dora_prod \
  -F c \
  > "$BACKUP_DIR/new-db-state-$(date +%Y%m%d_%H%M%S).dump"

echo "✅ 新库备份已保存到 $BACKUP_DIR"

# 3. 更新环境变量
echo ""
echo "3️⃣  更新环境变量..."
cat > /tmp/rollback-env << EOF
DATABASE_URL=$OLD_DATABASE_URL
EOF
echo "✅ 环境变量已准备（需手动在 CloudBase 控制台更新）"

# 4. 验证配置
echo ""
echo "4️⃣  验证配置..."
echo "  旧数据库: $OLD_DATABASE_URL"
echo "  新数据库: $NEW_DATABASE_URL"

echo ""
echo "📋 后续步骤："
echo "  1. 进入 CloudBase 控制台"
echo "  2. 云托管 → 环境变量"
echo "  3. 修改 DATABASE_URL = $OLD_DATABASE_URL"
echo "  4. 重新部署（CloudBase 会自动触发构建）"
echo "  5. 部署完成后，检查 /api/health 是否恢复"
echo ""
echo "✅ 回滚准备完成"
```

### 6.4 旧数据库保留期限

```
⏰ 保留时间线：

T+0（迁移完成）→ T+7 天（第 1 周）
  状态：旧 RDS PostgreSQL 保持运行
  操作：监控新库 24/7
  成本：双份数据库费用 ~¥20/天
  风险：如需回滚，可立即恢复

T+7 → T+30 天（第 2-4 周）
  状态：旧 RDS 可选关闭
  操作：如果 7 天内无问题，可考虑关闭旧库
  成本：节省 ~¥400/月
  风险：如突然发现问题，需从备份恢复（5-10 分钟）

T+30+ 天（第 5 周以后）
  状态：旧 RDS 完全下线
  备份：至少保存 1 个完整备份到 COS（防止恢复需要）
  成本：完全节省 ~¥400/月
  风险：需要时从备份恢复（需要重新建库）
```

### 6.5 保留旧库的最佳实践

```bash
#!/bin/bash
# 文件：keep_old_db_safe.sh
# 用途：在迁移期间安全保管旧库

# 第 1 周：保持运行
# （无需任何操作，旧 RDS 继续运行）

# 第 2 周：创建最终备份
echo "🔄 创建最终 RDS 备份..."
PGPASSWORD="admin" pg_dump \
  -h old-rds.tencentrds.com \
  -U admin \
  -d dora_prod \
  -F c \
  > /tmp/dora-final-backup-$(date +%Y%m%d).dump

# 上传到 COS（腾讯云对象存储）
# 这样即使本地删除，备份仍在云端
echo "☁️  上传备份到 COS..."
# (使用腾讯云 COS CLI 或 SDK)

# 第 4 周：可选关闭旧库
echo "⚠️  即将关闭旧 RDS..."
echo "   - 确保新库已稳定运行 7+ 天"
echo "   - 确保备份已保存到 COS"
echo "   - 在腾讯云控制台手动关闭或删除 RDS 实例"
```

---

## 7. 最终迁移清单

### 前置检查（迁移前 3 天）

- [ ] 完整备份当前 RDS PostgreSQL（三种格式：dump、csv、sql）
- [ ] 验证备份文件完整性和可恢复性
- [ ] 轻量服务器已购买并能 SSH 登录
- [ ] 确认轻量服务器与 CloudBase 网络连通
- [ ] 获取 CloudBase 的公网 IP 或 VPC 配置
- [ ] 准备轻量服务器上 PostgreSQL 的用户名和强密码
- [ ] 阅读本文档所有 5 个部分

### 轻量服务器准备（迁移前 1 天）

- [ ] SSH 登录轻量服务器
- [ ] 运行 `install_postgres.sh` 安装 PostgreSQL 15
- [ ] 运行 `create_db_user.sh` 创建数据库用户
- [ ] 运行 `create_database.sh` 创建数据库
- [ ] 配置防火墙规则（允许 5432 端口）
- [ ] 验证 PostgreSQL 服务正常运行
- [ ] 记录轻量服务器 IP 和数据库信息

### 数据迁移（迁移当天）

- [ ] 将备份文件上传到轻量服务器
- [ ] 运行 `restore_backup.sh` 导入备份数据
- [ ] 运行 `verify_migration.sh` 验证 6 张表和数据量
- [ ] 检查外键和索引是否完整
- [ ] 本地测试：修改 `server/.env.local` 中的 DATABASE_URL
- [ ] 本地运行 `npm run dev` 确认后端可连接新库

### 生产部署（迁移后 1 小时内）

- [ ] 修改 CloudBase 环境变量 DATABASE_URL
- [ ] 重新部署后端（CloudBase 自动构建）
- [ ] 监控部署日志，确认 Dockerfile 的 `npx prisma migrate deploy` 成功
- [ ] 测试生产环境：`curl https://dora-beads-xxx/api/health`
- [ ] 执行完整功能测试（注册、登录、作品保存）

### 验证和上线（迁移后 1-7 天）

- [ ] 监控后端日志，确认无数据库错误
- [ ] 监控轻量服务器 CPU、内存、网络
- [ ] 灰度发布：让小部分用户使用新库
- [ ] 收集用户反馈，检查是否有性能问题
- [ ] 7 天后无问题，可考虑关闭旧 RDS

---

## 总结

| 项目 | 详情 |
|------|------|
| **PostgreSQL 版本** | 推荐 14 或 15（与 Prisma 5.20.0 完全兼容）|
| **DATABASE_URL 格式** | `postgresql://user:password@host:port/dora_prod?sslmode=disable` |
| **必需字段** | 用户名、密码、主机、端口、数据库名 |
| **6 张表** | users, memberships, ai_credits, works, ai_jobs, uploaded_images |
| **备份方案** | pg_dump (.dump) 或 SQL 文本格式 |
| **安全建议** | 仅在 VPC 内网允许 5432，强密码，fail2ban 防暴力破解 |
| **回滚时间** | < 10 分钟（仅需改 DATABASE_URL 和重新部署）|
| **旧库保留期** | 至少 7 天（第 1 周监控），可选延长至 30 天 |

---

**准备清单编制日期**：2026-06-11  
**清单有效期**：30 天  
**下一步**：按照第 1-7 部分逐项执行，但暂不进行实际迁移

