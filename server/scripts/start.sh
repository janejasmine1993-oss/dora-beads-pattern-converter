#!/bin/sh

echo "🔄 执行数据库迁移..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
  echo "✅ 数据库迁移成功"
else
  echo "⚠️ 数据库迁移失败，但继续启动应用"
fi

echo "🚀 启动应用..."
node dist/index.js
