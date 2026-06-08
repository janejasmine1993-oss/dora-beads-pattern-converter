# 构建阶段
FROM node:22-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package.json package-lock.json ./
COPY prisma ./prisma

# 安装依赖
RUN npm ci

# 复制源代码
COPY tsconfig.json ./
COPY index.ts ./
COPY routes ./routes
COPY services ./services
COPY middleware ./middleware
COPY types ./types
COPY scripts ./scripts

# 生成 Prisma Client
RUN npx prisma generate

# 编译 TypeScript
RUN npm run build

# 运行阶段
FROM node:22-alpine

WORKDIR /app

# 安装 dumb-init 用于处理 PID 1 信号
RUN apk add --no-cache dumb-init

# 复制 package 文件
COPY package.json package-lock.json ./
COPY prisma ./prisma

# 安装生产依赖
RUN npm ci --only=production && \
    npx prisma generate

# 从构建阶段复制编译结果
COPY --from=builder /app/dist ./dist

# 设置环境
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# 使用 dumb-init 启动应用
ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["node", "dist/index.js"]
