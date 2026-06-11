# 哆啦拼豆图纸转换器 (dora-beads-pattern-converter)

**当前版本：v0.9.0-lite**

> 📍 **当前运行模式**：会员体验版 (LITE_MODE)  
> 🎯 无需 PostgreSQL，纯前端应用，可部署到腾讯云 CloudBase、Cloudflare Pages 等静态托管  
> 🚀 快速启动，零成本维护

## 项目简介

网页版拼豆图纸转换器，将用户上传的图片转换成指定尺寸的拼豆图纸。

核心流程：
```
上传图片 → 设置图纸尺寸 → 生成像素图 → 生成拼豆网格图 → 匹配品牌色号 → 统计豆量 → 导出文件
```

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Canvas API

## 如何安装

```bash
npm install
```

## 如何启动（本地开发）

### LITE_MODE（会员体验版，无数据库）

```bash
# 当前默认配置已启用 LITE_MODE
npm run dev
```

访问 http://localhost:5173，在输入框中输入口令 `member2024` 即可进入

> ⚠️ **注意**：`member2024` 是本地测试口令。生产环境上线前，请在 `.env.production` 中修改为当期会员口令并更新 `VITE_ACCESS_CODE_VERSION`

### 标准模式（需要后端和 PostgreSQL）

编辑 `.env.local` 文件，修改：
```ini
VITE_LITE_MODE=false
VITE_API_BASE_URL=http://localhost:3001
```

然后启动后端：
```bash
cd server && npm run dev
```

再启动前端：
```bash
npm run dev
```

## 线上部署

**v0.9.0-lite** 是纯前端应用，已针对 CloudBase 静态托管优化。

### 部署方案

**主线部署**：腾讯云 CloudBase（推荐）
```bash
npm run build
tcb hosting deploy dist
```

**备选方案**：
- Cloudflare Pages：`wrangler pages deploy dist`
- GitHub Pages / Vercel / Netlify：参考各平台文档

**成本**：¥0/月（静态托管免费）

**配置**：
- 只部署 `dist/` 目录
- 不部署 `server/`（无后端）
- 不需要 PostgreSQL（无数据库）

### 部署前准备

在 `.env.production` 中：
```bash
VITE_LITE_MODE=true
VITE_MEMBER_ACCESS_CODE=当期会员口令      # ⚠️ 部署前改为实际口令
VITE_ACCESS_CODE_VERSION=2026-06         # 与口令同步更新
```

详见 [docs/11_DEPLOYMENT.md](docs/11_DEPLOYMENT.md)。

本地开发地址 `http://localhost:5173` 只在当前电脑上可用。

## 当前已完成功能

- 三栏页面布局
- 图片上传（点击 + 拖拽，JPG / PNG / WEBP）
- 图纸尺寸选择（6 个常用尺寸 + 自定义宽高）
- 成品尺寸自动计算（每颗豆子 2.6mm）
- **图片像素化**：缩放至目标格数，提取每格 RGBA
- **Lab + Delta-E 76 色号匹配**：将每格颜色匹配至最近品牌色
- **Canvas 像素图预览**（硬边，无插值）
- **Canvas 格子图预览**（品牌色 + 网格线）
- **Canvas 色号图预览**（含 A1/A2 短编号标注）
- **Canvas 统计图预览**（色彩分布可视化）
- 右侧完整豆量统计（色号明细、含损耗备货量、克数）
- 切换品牌后自动重新匹配色号
- 5 个品牌示例色卡数据（MARD / COCO / 漫漫 / 盼盼 / 咪小窝）
- **导出格子图 PNG**（高清，含水印，自动命名）
- **导出色号图 PNG**（高清，含短编号标注）

## 当前未完成功能

- PDF 导出
- Excel / CSV 导出
- 色号量化（控制最大色号数）
- 自动去背景（预留接口）
- AI 风格化（预留接口）
- 小图改大 AI 超分（预留接口）
- 真实品牌色卡数据（当前为示例数据）

## LITE_MODE 说明

**LITE_MODE**（会员体验版）是一个零成本、无数据库的版本，专为快速上线而设计：

### 特点

✅ **无需 PostgreSQL**：完全静态前端部署  
✅ **无需后端**：所有功能在浏览器中本地处理  
✅ **快速启动**：可直接在 Cloudflare Pages 等静态服务上部署  
✅ **成本最低**：零数据库运维成本  
✅ **会员门槛**：简单口令验证（早期内测方案）  

### 隐藏的功能

在 LITE_MODE 下，以下功能被隐藏（代码仍保留，可随时恢复）：

- ❌ 注册登录（用户认证）
- ❌ 我的作品云端库（使用本地 localStorage 替代）
- ❌ 会员中心（会员由人工管理）
- ❌ AI 次数显示（仅 Mock 模式）
- ❌ 兑换码
- ❌ 云端保存（用本地保存替代）

### 保留的功能

✅ 图片上传  
✅ 拼豆图纸生成  
✅ 品牌色号切换  
✅ 图纸预览  
✅ 色号用量统计  
✅ PNG/PDF/CSV 导出  

### 配置方式

在 `.env.local` 或 `.env.production` 中配置：

```bash
# 启用 LITE_MODE
VITE_LITE_MODE=true

# 会员访问口令（固定口令，仅供授权会员使用）
VITE_MEMBER_ACCESS_CODE=member2024

# 口令版本号（格式：YYYY-MM，每次换口令时必须同时更新）
# 示例：6月为 2026-06，7月为 2026-07
VITE_ACCESS_CODE_VERSION=2026-06
```

**每月/每期更换口令时的步骤：**
1. 修改 `VITE_MEMBER_ACCESS_CODE` 为新的会员口令
2. 修改 `VITE_ACCESS_CODE_VERSION` 为新的版本号（YYYY-MM）
3. 无需修改代码，只需更新这两个环境变量
4. 旧版本的授权会自动失效，用户需重新输入新口令

详见 [docs/LITE_MODE_SETUP.md](docs/LITE_MODE_SETUP.md)

## 常用命令

```bash
npm run dev      # 开发模式启动（LITE_MODE）
npm run build    # 生产构建（输出到 dist/）
npm run preview  # 预览生产构建
npm run lint     # 代码检查
```
