#!/bin/sh

echo "🔄 执行数据库迁移..."
echo "DATABASE_URL 已设置: $([ -n "$DATABASE_URL" ] && echo "是" || echo "否")"
echo "NODE_ENV: $NODE_ENV"

npx prisma migrate deploy 2>&1
MIGRATE_STATUS=$?

if [ $MIGRATE_STATUS -eq 0 ]; then
  echo "✅ 数据库迁移成功"
else
  echo "⚠️ 数据库迁移失败 (代码: $MIGRATE_STATUS)，但继续启动应用"
fi

echo "🚀 启动应用..."
node dist/index.js
