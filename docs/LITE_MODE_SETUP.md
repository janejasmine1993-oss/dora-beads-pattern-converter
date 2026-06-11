# LITE_MODE（会员体验版）设置指南

**日期**：2026-06-11  
**版本**：v0.9.0-lite  
**目标**：零成本、无数据库的会员体验版

---

## 概述

LITE_MODE 是哆啦拼豆图纸器的一个轻量化版本，专为快速上线和低成本维护而设计：

- ✅ 无需 PostgreSQL 数据库
- ✅ 无需后端服务器
- ✅ 纯前端应用，可部署到任何静态托管平台（CloudBase、Cloudflare Pages 等）
- ✅ 使用本地 localStorage 存储用户作品
- ✅ 简单口令验证会员身份（早期内测方案）

---

## 启用 LITE_MODE

### 方式 1：本地开发

编辑 `.env.local`：

```bash
VITE_LITE_MODE=true
VITE_MEMBER_ACCESS_CODE=member2024
VITE_ACCESS_CODE_VERSION=2026-06
VITE_AI_RUNTIME_MODE=mock
VITE_AI_PROVIDER=mock
```

然后启动：

```bash
npm run dev
```

访问 http://localhost:5173，输入口令 `member2024` 进入

### 方式 2：生产部署

编辑 `.env.production`：

```bash
VITE_LITE_MODE=true
VITE_MEMBER_ACCESS_CODE=your_custom_password
VITE_ACCESS_CODE_VERSION=2026-06
```

> ⚠️ **重要**：上线前必须将 `VITE_MEMBER_ACCESS_CODE` 修改为实际的会员口令

构建：

```bash
npm run build
```

然后根据部署平台选择相应的部署命令：

**腾讯云 CloudBase**（推荐）：
```bash
tcb hosting deploy dist
```

**Cloudflare Pages**（备选）：
```bash
wrangler pages deploy dist --project-name dora-beads-pattern-converter
```

**其他静态托管**：
- GitHub Pages
- Vercel
- Netlify
- 阿里云 OSS 等

具体部署说明详见 [docs/11_DEPLOYMENT.md](../11_DEPLOYMENT.md)。

---

## 配置参数说明

| 参数 | 说明 | 默认值 | 更新频率 |
|------|------|-------|--------|
| `VITE_LITE_MODE` | 启用会员体验版 | `true` | 不需要 |
| `VITE_MEMBER_ACCESS_CODE` | 会员访问口令（首次进入需输入）| `member2024` | **每月/每期** |
| `VITE_ACCESS_CODE_VERSION` | 口令版本号（格式：YYYY-MM）| `2026-06` | **每月/每期** |
| `VITE_AI_RUNTIME_MODE` | AI 运行模式（LITE_MODE 推荐 mock）| `mock` | 不需要 |
| `VITE_AI_PROVIDER` | AI 服务商（LITE_MODE 推荐 mock）| `mock` | 不需要 |

---

## LITE_MODE 下的功能清单

### ✅ 保留的核心功能

这些功能在 LITE_MODE 下完全可用：

- **图片上传**：JPG / PNG / WEBP
- **拼豆图纸生成**：
  - 图片直转图纸
  - AI 优化（Mock 模式）
  - 像素图转色号
  - 现有图纸再编辑
- **品牌色号切换**：5 个品牌色卡
- **图纸预览**：
  - 像素图预览
  - 格子图预览
  - 色号图预览
  - 统计图预览
- **色号用量统计**：完整的豆数、克数计算
- **导出功能**：PNG / PDF / CSV 导出

### ❌ 隐藏的功能（代码保留，可恢复）

这些功能在 LITE_MODE 下被隐藏，但代码仍然存在，可随时恢复：

| 功能 | 原因 | 替代方案 |
|------|------|--------|
| 注册登录 | 无用户认证 | 口令验证 |
| 我的作品云端库 | 无 PostgreSQL | 本地 localStorage |
| 会员中心 | 无会员系统 | 人工管理 |
| AI 次数显示 | 无计费系统 | Mock 模式（无限次） |
| 兑换码 | 无支付系统 | 人工发放 |
| 云端保存 | 无后端 | 本地浏览器保存 |

---

## 本地作品存储

### 原理

在 LITE_MODE 下，用户生成的作品记录保存在 `localStorage` 中：

```javascript
// localStorage key
const key = 'lite_local_works'

// 数据结构
[
  {
    id: 'work_1718072400000_abc123def',
    title: '我的第一个拼豆图纸',
    brand: 'MARD',
    width: 52,
    height: 52,
    colorCount: 12,
    totalBeads: 2704,
    previewImageUrl: 'data:image/png;base64,...',
    createdAt: '2026-06-11T12:00:00.000Z',
    updatedAt: '2026-06-11T12:00:00.000Z',
  }
]
```

### 限制

- **最多保存 10 个作品**（超出时自动删除最旧的）
- **仅保存在当前浏览器**（清除缓存后丢失）
- **不跨设备同步**（换设备则无法访问）

### API

使用 `localWorksService` 操作本地作品：

```typescript
import { localWorksService } from '@/services/localStorage/localWorksService'

// 获取所有作品
const works = localWorksService.getWorks()

// 保存新作品
const newWork = localWorksService.saveWork({
  title: '我的作品',
  brand: 'MARD',
  width: 52,
  height: 52,
  colorCount: 12,
  totalBeads: 2704,
  previewImageUrl: 'data:image/png;base64,...',
})

// 更新作品
localWorksService.updateWork(workId, { title: '新标题' })

// 删除作品
localWorksService.deleteWork(workId)

// 清空所有作品
localWorksService.clearWorks()
```

---

## 会员口令验证

### 工作流程

1. **首次访问**：用户打开应用，显示口令输入框
2. **输入口令**：用户输入正确的口令
3. **验证通过**：口令和版本号保存到 localStorage，显示应用
4. **后续访问**：检查 localStorage 中的令牌和版本号，自动登录
5. **版本号不匹配**：如果服务器端口令版本已更新，旧授权自动失效，重新要求输入

### 口令机制说明

**LITE_MODE 使用固定会员口令 + 版本号强制更新机制：**

- **固定口令**：所有授权会员使用同一口令
- **版本号控制**：每次更换口令时，同时更新版本号，强制用户重新验证
- **不支持一人一码**：目前不实现每人独立口令
- **不支持随机口令**：不生成临时验证码
- **人工管理**：口令由人工管理和更换，无需数据库

### 口令管理

**开发环境**（`.env.local`）：
```bash
VITE_MEMBER_ACCESS_CODE=member2024
VITE_ACCESS_CODE_VERSION=2026-06
```

**生产环境**（`.env.production`）：
```bash
VITE_MEMBER_ACCESS_CODE=your_secure_password_here
VITE_ACCESS_CODE_VERSION=2026-06
```

### 每月更换口令的步骤

当需要更换会员口令时（如每月初、每期开始）：

1. **修改口令**：编辑 `.env.production` 中的 `VITE_MEMBER_ACCESS_CODE`
   ```bash
   # 旧口令
   VITE_MEMBER_ACCESS_CODE=may_password_2026
   
   # 改为新口令
   VITE_MEMBER_ACCESS_CODE=june_password_2026
   ```

2. **更新版本号**：修改 `VITE_ACCESS_CODE_VERSION`
   ```bash
   # 旧版本（5月）
   VITE_ACCESS_CODE_VERSION=2026-05
   
   # 改为新版本（6月）
   VITE_ACCESS_CODE_VERSION=2026-06
   ```

3. **重新构建并部署**：
   ```bash
   npm run build
   wrangler pages deploy dist
   ```

4. **旧授权自动失效**：用户再次访问时，localStorage 中的旧版本号会被检测到，自动清除，重新显示口令输入框

### localStorage 数据结构

```javascript
// 访问权限标记
localStorage.getItem('lite_access_granted') // 值：'true' 或 'false'

// 授权时的口令版本号
localStorage.getItem('lite_access_code_version') // 值：'2026-06'

// 上次访问时间
localStorage.getItem('lite_last_access_time') // 值：ISO 时间戳
```

### 版本号格式

版本号采用 `YYYY-MM` 格式：
- `2026-01`：2026年1月
- `2026-02`：2026年2月
- `2026-06`：2026年6月
- `2026-07`：2026年7月
- ...以此类推

---

## UI 变化

### AppHeader 显示

LITE_MODE 下的页头显示：

```
哆啦拼豆图纸  |  首页  工作台  AI优化  帮助  |  [Lite 会员体验版]
```

- 隐藏：我的作品、会员、AI 次数、兑换码、登录按钮
- 新增：版本标识（粉色标签）

### 页面文案

页面各处会添加提示文案：

> ⚠️ 当前为会员体验版，作品仅保存在当前浏览器。清理缓存或更换设备后，作品记录可能丢失。

---

## 部署到生产环境

### 步骤 1：准备构建

```bash
npm run build
```

验证 `dist/` 目录生成成功

### 步骤 2：配置环境变量

在 `.env.production` 中设置：

```bash
VITE_LITE_MODE=true
VITE_MEMBER_ACCESS_CODE=your_secure_password
VITE_ACCESS_CODE_VERSION=2026-06
VITE_AI_RUNTIME_MODE=mock
VITE_AI_PROVIDER=mock
```

> ⚠️ **重要**：`VITE_MEMBER_ACCESS_CODE` 必须修改为实际的会员口令，不能使用测试口令 `member2024`

### 步骤 3：部署到生产环境

选择相应的部署平台：

**腾讯云 CloudBase**（推荐主线部署）：
```bash
npm run build
tcb hosting deploy dist
```

**Cloudflare Pages**（备选方案 A）：
```bash
npm run build
wrangler pages deploy dist --project-name dora-beads-pattern-converter
```

**GitHub Pages**（备选方案 B）：
```bash
npm run build
# 推送到 GitHub，在仓库设置中启用 Pages，选择 dist 目录
```

**其他平台**（Vercel、Netlify 等）：
- 参考各平台的部署文档
- 构建命令：`npm run build`
- 输出目录：`dist`
- 环境变量：`VITE_LITE_MODE=true`、`VITE_MEMBER_ACCESS_CODE`、`VITE_ACCESS_CODE_VERSION`

### 步骤 4：验证部署

在部署后的网址上，输入会员口令验证应用是否正常运行。

---

## 回滚到标准模式

如果未来需要恢复 PostgreSQL + 后端模式，只需：

1. **修改环境变量**：
   ```bash
   VITE_LITE_MODE=false
   VITE_API_BASE_URL=your_backend_url
   ```

2. **启用数据库功能**：
   - 注册登录接口会自动启用
   - 我的作品会读取云端数据
   - AI 次数显示会启用
   - 兑换码功能会启用

3. **代码完全保留**：
   - 所有原有功能代码未删除
   - 仅通过 LITE_MODE 配置隐藏/启用
   - 无需重写或修改功能代码

---

## 常见问题

### Q: 如何更换会员口令？

A: 只需修改两个环境变量：
1. 编辑 `.env.production`
2. 修改 `VITE_MEMBER_ACCESS_CODE` 为新口令
3. 修改 `VITE_ACCESS_CODE_VERSION` 为新版本号（YYYY-MM）
4. 重新构建部署：`npm run build && wrangler pages deploy dist`

用户再次访问时，旧授权会自动失效，需要输入新口令。

### Q: 口令忘了怎么办？

A: 口令保存在 `.env.production` 中。检查该文件中的 `VITE_MEMBER_ACCESS_CODE` 值。

### Q: 能否为每个用户设置不同口令？

A: 当前版本不支持。LITE_MODE 只实现了固定会员口令，所有授权用户共享一个口令。未来如需一人一码，需要恢复后端 + 数据库，实现完整的用户认证系统。

### Q: 作品数据丢失了怎么办？

A: LITE_MODE 的作品保存在浏览器 localStorage 中。清除浏览器缓存会丢失。建议定期导出数据。

### Q: 如何导出本地作品？

A: 打开浏览器控制台：
```javascript
localStorage.getItem('lite_local_works') // 复制输出的 JSON
```

### Q: 如何恢复导出的作品？

A: 在浏览器控制台运行：
```javascript
localStorage.setItem('lite_local_works', '粘贴之前复制的 JSON')
```

### Q: 能否多人共享同一口令？

A: 可以。口令仅作为早期内测的门槛，不用于身份验证，多人可使用同一口令。

### Q: 如何限制访问？

A: 定期更换口令，重新部署应用。旧口令自动失效。

---

## 成本对比

| 方案 | 成本 | 维护工作量 | 功能完整度 |
|------|------|-----------|----------|
| LITE_MODE | ¥0/月 | 最低 | 基础功能完整 |
| 轻量 PostgreSQL | ¥50-80/月 | 中等 | 完整功能 |
| 标准部署 | ¥300-600/月 | 较高 | 完整功能 + 备份 |

---

## 下一步

### 短期（1-3 个月）

- 🎯 LITE_MODE 上线，测试用户反馈
- 📊 收集用户使用数据
- 🐛 修复反馈的 bug

### 中期（3-6 个月）

- 💾 如用户需求，迁移到轻量 PostgreSQL
- 👥 实现真实会员系统
- 💳 接入支付系统

### 长期（6+ 个月）

- 📱 小程序版本
- 🤖 AI 功能集成
- 🌍 国际化支持

---

**文档版本**：1.0  
**最后更新**：2026-06-11

