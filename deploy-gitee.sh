#!/bin/bash
# deploy-gitee.sh
# 用途：构建项目并将 dist/ 推送到 Gitee 的 gitee-pages 分支
# 使用方式：bash deploy-gitee.sh

set -e  # 任何命令失败立即停止

REPO_NAME="dora-beads-pattern-converter"
GITEE_USER="你的Gitee用户名"  # TODO: 替换为你的 Gitee 用户名
GITEE_REMOTE="git@gitee.com:${GITEE_USER}/${REPO_NAME}.git"

echo "▶ 构建项目（Gitee Pages base 路径）..."
VITE_BASE="/${REPO_NAME}/" npm run build

echo "▶ 进入 dist/ 目录..."
cd dist

echo "▶ 初始化临时 git 仓库..."
git init
git config user.email "janejasmine1993@gmail.com"
git config user.name "Jasmine"
git checkout -b gitee-pages

echo "▶ 提交构建产物..."
git add -A
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"

echo "▶ 推送到 Gitee gitee-pages 分支..."
git push -f "${GITEE_REMOTE}" gitee-pages

cd ..
echo "✅ 部署完成！"
echo "   等待 1-2 分钟后访问："
echo "   https://${GITEE_USER}.gitee.io/${REPO_NAME}/"
