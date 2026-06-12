# 部署说明

## 当前部署方案：v0.9.0-lite

**版本**：v0.9.0-lite  
**部署目标**：腾讯云 CloudBase 静态托管  
**部署方式**：纯前端，无后端、无数据库  
**成本**：¥0/月

---

## 项目类型

本项目是**纯前端静态应用（Vite + React SPA）**：

- 无后端服务器
- 无数据库
- 所有计算在用户浏览器中完成（Canvas、图像处理）
- 数据本地存储于 localStorage

---

## 构建信息

| 项目 | 内容 |
|------|------|
| 构建命令 | `npm run build` |
| 输出目录 | `dist/` |
| 框架 | Vite |
| Base 路径 | `/`（根路径）|
| 大小 | ~125KB (gzipped) |

---

## 部署方式对比

### 主线方案：CloudBase 静态托管（推荐）

**特点**：
- 零成本（静态托管免费）
- 国内 CDN，访问快
- 简单易用，仅需部署 dist/
- 后续可升级到完整版本

**配置文件**：`cloudbaserc.json`
```json
{
  "envId": "dora-beads-prod-d3fnxast620bb482",
  "projectPath": ".",
  "hosting": {
    "publicPath": "dist",
    "disableFunctionalDomain": false
  },
  "version": "2.0"
}
```

**部署命令**：
```bash
npm run build
tcb hosting deploy dist
```

### 备选方案 1：Cloudflare Pages

**特点**：
- 零成本
- 全球 CDN
- 支持自定义域名

**部署命令**：
```bash
npm run build
wrangler pages deploy dist
```

### 备选方案 2：GitHub Pages / Vercel / Netlify

参考各平台部署文档，构建目录设为 `dist`。

---

## 本地开发地址 vs 公网地址

**本地**：`http://localhost:5173`  
- 仅在当前电脑上可用
- 通过 `npm run dev` 启动

**公网**：由部署平台提供  
- CloudBase：`环境ID-云开发.run.tcloudbase.com`
- Cloudflare Pages：`dora-beads-pattern-converter.pages.dev`
- 任何人均可访问

---

## 环境变量配置

**.env.production（部署时使用）**：

```bash
VITE_LITE_MODE=true
VITE_MEMBER_ACCESS_CODE=member2024        # ⚠️ 部署前改为当期会员口令
VITE_ACCESS_CODE_VERSION=2026-06
VITE_AI_RUNTIME_MODE=mock
VITE_AI_PROVIDER=mock
```

**重要提醒**：
- `VITE_MEMBER_ACCESS_CODE` 当前是测试口令 `member2024`
- **真正部署前必须改为当期会员口令**
- `VITE_ACCESS_CODE_VERSION` 需要与口令同时更新

---

## 部署前检查清单

- [ ] `npm run build` 成功，无错误
- [ ] `dist/` 目录存在且包含 `index.html`
- [ ] `.env.production` 中 `VITE_LITE_MODE=true`
- [ ] `.env.production` 中 `VITE_MEMBER_ACCESS_CODE` 已改为当期口令
- [ ] 没有执行过后端部署（无 server/ 代码上传）
- [ ] 没有启用 PostgreSQL（LITE_MODE 无需）

---

## 部署后验收

- [ ] 访问公网地址
- [ ] 显示会员口令输入框
- [ ] 输入正确口令能进入
- [ ] 能上传图片
- [ ] 能生成拼豆图纸
- [ ] 能导出 PNG/PDF/CSV
- [ ] 能保存到"我的作品"
- [ ] 刷新页面后数据仍存在
- [ ] 浏览器 Network 中无 `/api/` 请求

---

## 后续升级

### 恢复完整版本（v0.8.1+）

如需恢复后端和数据库功能：

1. 恢复原 cloudbaserc.json：
   ```bash
   cp docs/cloudbase-config-backup-v0.8.1.json cloudbaserc.json
   ```

2. 启用数据库（腾讯云 PostgreSQL）

3. 修改 `.env.local`：
   ```bash
   VITE_LITE_MODE=false
   VITE_API_BASE_URL=https://your-backend-url
   ```

4. 后端代码、数据库逻辑完全保留，无需重写

---

## 常见问题

### Q: 为什么不需要后端？

A: LITE_MODE 将所有数据存储在用户浏览器的 localStorage 中，无需服务器。这是快速上线的权宜之计。

### Q: 数据会丢失吗？

A: 用户清除浏览器缓存后会丢失。我们在 UI 中提示用户定期导出数据。

### Q: 能支持多少用户？

A: 理论无限制（纯前端）。但由于每个用户独立存储，无法在设备间同步。

### Q: 如何升级到完整版本？

A: 参考"后续升级"部分。所有代码已保留，仅需改配置和部署后端。

---

## 相关文档

- [LITE_MODE 配置指南](docs/LITE_MODE_SETUP.md)
- [CloudBase 配置备份](docs/cloudbase-config-backup-v0.8.1.json)（用于恢复完整版本）
- [README.md](README.md)

---

**最后更新**：2026-06-11  
**版本**：v0.9.0-lite
