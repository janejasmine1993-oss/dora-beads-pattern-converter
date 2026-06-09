#!/bin/sh

echo "🔄 执行数据库迁移..."
echo "DATABASE_URL 已设置: $([ -n "$DATABASE_URL" ] && echo "是" || echo "否")"
echo "NODE_ENV: $NODE_ENV"

# 执行迁移，捕获完整输出
npx prisma migrate deploy 2>&1 | tee /tmp/migrate.log
MIGRATE_STATUS=$?

if [ $MIGRATE_STATUS -eq 0 ]; then
  echo "✅ 数据库迁移成功"
else
  echo "❌ 数据库迁移失败 (代码: $MIGRATE_STATUS)"
  echo "迁移日志已保存到 /tmp/migrate.log"
  # 不再继续，让容器失败
  exit 1
fi

echo "🚀 启动应用..."
node dist/index.js
