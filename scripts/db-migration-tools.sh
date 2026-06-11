#!/bin/bash

# PostgreSQL 迁移工具集
# 用途：提供一站式的备份、恢复、验证命令
# 日期：2026-06-11
# 使用：bash scripts/db-migration-tools.sh <command> [args]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# 显示帮助
show_help() {
  cat << EOF
PostgreSQL 迁移工具集 v1.0

用法：bash scripts/db-migration-tools.sh <command> [options]

命令：
  backup-rds              备份当前 RDS PostgreSQL
  backup-csv              导出 RDS 数据为 CSV
  verify-backup           验证备份文件完整性
  init-light-server       初始化轻量服务器 PostgreSQL
  restore-light           恢复备份到轻量服务器
  verify-light            验证轻量服务器数据
  test-local              本地测试新数据库连接
  prepare-rollback        准备回滚信息

示例：
  bash scripts/db-migration-tools.sh backup-rds
  bash scripts/db-migration-tools.sh verify-backup backup-full-20260611.dump
  bash scripts/db-migration-tools.sh restore-light 轻量IP dora_user password backup.dump

详见：docs/db-migration-quick-reference.md
EOF
}

# 检查必需工具
check_requirements() {
  local tools=("psql" "pg_dump" "pg_restore")
  for tool in "${tools[@]}"; do
    if ! command -v "$tool" &> /dev/null; then
      print_error "$tool 未安装，请先安装 PostgreSQL 客户端"
      print_info "Mac: brew install postgresql"
      print_info "Linux: sudo apt-get install postgresql-client"
      exit 1
    fi
  done
}

# ============ 备份命令 ============

backup_rds() {
  print_info "开始备份 RDS PostgreSQL..."

  local rds_host="${1:-your-rds-host.tencentrds.com}"
  local rds_user="${2:-admin}"
  local rds_db="${3:-dora_prod}"

  read -p "RDS 密码: " -s rds_pass
  echo

  local backup_dir="./backups"
  mkdir -p "$backup_dir"

  local timestamp=$(date +%Y%m%d_%H%M%S)
  local backup_file="$backup_dir/dora-beads-full-$timestamp.dump"

  print_info "连接到 $rds_host..."

  PGPASSWORD="$rds_pass" pg_dump \
    -h "$rds_host" \
    -U "$rds_user" \
    -d "$rds_db" \
    -F c \
    --verbose \
    -f "$backup_file"

  if [ $? -eq 0 ]; then
    local file_size=$(ls -lh "$backup_file" | awk '{print $5}')
    print_success "备份完成: $backup_file ($file_size)"
  else
    print_error "备份失败"
    exit 1
  fi
}

backup_csv() {
  print_info "开始导出 CSV..."

  local rds_host="${1:-your-rds-host.tencentrds.com}"
  local rds_user="${2:-admin}"
  local rds_db="${3:-dora_prod}"

  read -p "RDS 密码: " -s rds_pass
  echo

  local backup_dir="./backups"
  mkdir -p "$backup_dir"

  local timestamp=$(date +%Y%m%d_%H%M%S)
  local tables=("users" "memberships" "ai_credits" "works" "ai_jobs" "uploaded_images")

  for table in "${tables[@]}"; do
    print_info "导出 $table..."
    PGPASSWORD="$rds_pass" psql \
      -h "$rds_host" \
      -U "$rds_user" \
      -d "$rds_db" \
      -c "COPY $table TO STDOUT WITH CSV HEADER;" \
      > "$backup_dir/dora-beads-${table}-${timestamp}.csv"
  done

  print_success "CSV 导出完成，位置: $backup_dir/"
  ls -lh "$backup_dir"/dora-beads-*.csv
}

# ============ 验证命令 ============

verify_backup() {
  local backup_file="$1"

  if [ -z "$backup_file" ]; then
    print_error "请指定备份文件"
    print_info "用法: bash scripts/db-migration-tools.sh verify-backup <备份文件>"
    exit 1
  fi

  print_info "验证备份: $backup_file"

  # 检查文件是否存在
  if [ ! -f "$backup_file" ]; then
    print_error "备份文件不存在: $backup_file"
    exit 1
  fi

  # 检查文件大小
  local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")
  print_info "文件大小: $(numfmt --to=iec $file_size 2>/dev/null || echo "${file_size} bytes")"

  if [ "$file_size" -lt 100000 ]; then
    print_warning "文件较小，可能缺少数据"
  fi

  # 检查 dump 文件格式
  if [[ "$backup_file" == *.dump ]]; then
    print_info "文件格式: PostgreSQL dump (二进制)"
    print_info "预览内容..."
    pg_restore -l "$backup_file" 2>/dev/null | head -20 || print_warning "无法读取 dump 内容"
  elif [[ "$backup_file" == *.sql ]]; then
    print_info "文件格式: SQL 文本"
    local create_count=$(grep -c "^CREATE TABLE" "$backup_file")
    local insert_count=$(grep -c "^INSERT INTO" "$backup_file")
    print_info "CREATE TABLE 语句: $create_count"
    print_info "INSERT INTO 语句: $insert_count"
  fi

  print_success "备份验证完成"
}

# ============ 轻量服务器初始化 ============

init_light_server() {
  print_warning "此命令需要在轻量服务器上运行"
  print_info "请 SSH 登录轻量服务器后执行：sudo bash -s < scripts/db-migration-tools.sh init-light-server"

  if [ "$EUID" -ne 0 ]; then
    print_error "此命令需要 root 权限，请用 sudo 运行"
    exit 1
  fi

  print_info "开始初始化轻量服务器 PostgreSQL..."

  # 更新系统
  print_info "更新系统包..."
  apt-get update
  apt-get upgrade -y

  # 安装 PostgreSQL
  print_info "安装 PostgreSQL 15..."
  apt-get install -y postgresql-15 postgresql-contrib-15 postgresql-client-15 libpq-dev

  # 启动服务
  print_info "启动 PostgreSQL..."
  systemctl start postgresql
  systemctl enable postgresql

  print_success "PostgreSQL 安装完成"
  print_info "版本："
  sudo -u postgres psql --version

  # 创建用户和数据库
  print_info "创建数据库用户..."
  read -p "输入新用户名 [dora_user]: " db_user
  db_user=${db_user:-dora_user}

  read -p "输入新密码 (≥16 字符): " -s db_pass
  echo

  if [ ${#db_pass} -lt 16 ]; then
    print_warning "密码长度 < 16 字符，继续? (y/n)"
    read -r confirm
    if [ "$confirm" != "y" ]; then
      exit 1
    fi
  fi

  sudo -u postgres psql << EOF
CREATE USER "$db_user" WITH PASSWORD '$db_pass';
ALTER USER "$db_user" CREATEDB;
CREATE DATABASE dora_prod OWNER "$db_user";
ALTER DATABASE dora_prod SET client_encoding = 'UTF8';
EOF

  print_success "用户和数据库创建完成"
  print_info "记录以下信息："
  print_info "  用户名: $db_user"
  print_info "  密码: $db_pass"
  print_info "  服务器 IP: $(hostname -I | awk '{print $1}')"
  print_info "  端口: 5432"
}

# ============ 恢复命令 ============

restore_light() {
  local light_ip="$1"
  local light_user="$2"
  local light_pass="$3"
  local backup_file="$4"

  if [ -z "$backup_file" ]; then
    print_error "用法: bash scripts/db-migration-tools.sh restore-light <IP> <用户> <密码> <备份文件>"
    print_info "示例: bash scripts/db-migration-tools.sh restore-light 10.0.0.100 dora_user mypassword backup.dump"
    exit 1
  fi

  if [ ! -f "$backup_file" ]; then
    print_error "备份文件不存在: $backup_file"
    exit 1
  fi

  print_info "准备恢复数据到轻量服务器..."
  print_info "  轻量 IP: $light_ip"
  print_info "  用户: $light_user"
  print_info "  备份文件: $backup_file"

  read -p "确认继续? (y/n): " confirm
  if [ "$confirm" != "y" ]; then
    print_warning "已取消"
    exit 0
  fi

  print_info "连接到轻量服务器..."

  # 先测试连接
  PGPASSWORD="$light_pass" psql \
    -h "$light_ip" \
    -U "$light_user" \
    -d dora_prod \
    -c "SELECT version();" > /dev/null

  if [ $? -ne 0 ]; then
    print_error "无法连接轻量服务器，请检查 IP、用户名、密码"
    exit 1
  fi

  print_info "恢复备份..."

  if [[ "$backup_file" == *.dump ]]; then
    PGPASSWORD="$light_pass" pg_restore \
      -h "$light_ip" \
      -U "$light_user" \
      -d dora_prod \
      --clean \
      --verbose \
      "$backup_file"
  elif [[ "$backup_file" == *.sql ]]; then
    PGPASSWORD="$light_pass" psql \
      -h "$light_ip" \
      -U "$light_user" \
      -d dora_prod \
      -f "$backup_file"
  fi

  if [ $? -eq 0 ]; then
    print_success "备份恢复完成"
  else
    print_error "恢复失败"
    exit 1
  fi
}

# ============ 验证轻量服务器 ============

verify_light() {
  local light_ip="$1"
  local light_user="$2"
  local light_pass="$3"

  if [ -z "$light_pass" ]; then
    read -p "轻量服务器 IP [10.0.0.100]: " light_ip
    light_ip=${light_ip:-10.0.0.100}
    read -p "轻量服务器用户 [dora_user]: " light_user
    light_user=${light_user:-dora_user}
    read -p "轻量服务器密码: " -s light_pass
    echo
  fi

  print_info "验证轻量服务器数据..."

  PGPASSWORD="$light_pass" psql \
    -h "$light_ip" \
    -U "$light_user" \
    -d dora_prod << EOF
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
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

  if [ $? -eq 0 ]; then
    print_success "验证完成"
  else
    print_error "验证失败"
    exit 1
  fi
}

# ============ 本地测试 ============

test_local() {
  local db_url="$1"

  if [ -z "$db_url" ]; then
    print_error "请指定 DATABASE_URL"
    print_info "用法: bash scripts/db-migration-tools.sh test-local <DATABASE_URL>"
    print_info "示例: bash scripts/db-migration-tools.sh test-local 'postgresql://dora_user:pass@10.0.0.100/dora_prod'"
    exit 1
  fi

  print_info "测试本地连接..."
  print_info "URL: $db_url"

  cd server

  # 创建临时 .env.local
  cat > .env.test << EOF
DATABASE_URL=$db_url
EOF

  print_info "测试 Prisma 连接..."

  DATABASE_URL="$db_url" npx prisma db push --skip-generate || {
    print_error "连接失败"
    rm -f .env.test
    exit 1
  }

  print_success "连接成功"

  # 清理
  rm -f .env.test
}

# ============ 准备回滚 ============

prepare_rollback() {
  print_info "准备回滚信息..."

  local rollback_file="./rollback-info-$(date +%Y%m%d_%H%M%S).txt"

  cat > "$rollback_file" << EOF
# PostgreSQL 回滚信息
# 生成时间：$(date)

## 当前配置（旧库）
PGPASSWORD_OLD=admin
RDS_HOST_OLD=your-rds-host.tencentrds.com
RDS_USER_OLD=admin
RDS_DB_OLD=dora_prod

## 新配置（轻量服务器）
LIGHT_IP_NEW=10.0.0.100
LIGHT_USER_NEW=dora_user
LIGHT_PASS_NEW=your_password
LIGHT_DB_NEW=dora_prod

## 环境变量
# 旧 DATABASE_URL
OLD_DATABASE_URL="postgresql://admin@your-rds-host.tencentrds.com:5432/dora_prod"

# 新 DATABASE_URL
NEW_DATABASE_URL="postgresql://dora_user:password@10.0.0.100:5432/dora_prod?sslmode=disable"

## 回滚步骤
1. 在 CloudBase 控制台修改 DATABASE_URL 回旧值：
   环境变量 → DATABASE_URL = $OLD_DATABASE_URL

2. 重新部署：
   git push origin <branch>

3. 验证：
   curl https://dora-beads-xxx/api/health

## 备份位置
$(ls -lh ./backups/dora-beads-* 2>/dev/null || echo "备份文件位置")

## 生成的日志
$(date)
EOF

  print_success "回滚信息已保存: $rollback_file"
  cat "$rollback_file"
}

# ============ 主程序 ============

main() {
  if [ $# -eq 0 ]; then
    show_help
    exit 0
  fi

  local command="$1"
  shift

  check_requirements

  case "$command" in
    backup-rds)
      backup_rds "$@"
      ;;
    backup-csv)
      backup_csv "$@"
      ;;
    verify-backup)
      verify_backup "$@"
      ;;
    init-light-server)
      init_light_server
      ;;
    restore-light)
      restore_light "$@"
      ;;
    verify-light)
      verify_light "$@"
      ;;
    test-local)
      test_local "$@"
      ;;
    prepare-rollback)
      prepare_rollback
      ;;
    -h|--help|help)
      show_help
      ;;
    *)
      print_error "未知命令: $command"
      show_help
      exit 1
      ;;
  esac
}

main "$@"
