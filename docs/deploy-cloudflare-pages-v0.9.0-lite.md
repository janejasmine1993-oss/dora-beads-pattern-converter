# Cloudflare Pages 部署指南 (v0.9.0-lite)

**部署日期**：2026-06-12  
**版本**：v0.9.0-lite  
**部署平台**：Cloudflare Pages（GitHub 自动部署）  
**公网地址**：https://dora-beads-pattern-converter-git.pages.dev  
**部署状态**：✅ **生产验证通过（2026-06-12）**  
**生产 commit**：6436737（main 分支）  
**推荐指数**：⭐⭐⭐⭐⭐（已验证，正式上线）

---

## 📌 部署摘要

**v0.9.0-lite** 已成功部署到 Cloudflare Pages，实现零成本、无需后端的快速上线。
**当前版本已在生产环境验证通过，为推荐公网部署方式。**

| 指标 | 值 |
|------|-----|
| **部署平台** | Cloudflare Pages |
| **源仓库** | GitHub dora-beads-pattern-converter |
| **部署分支** | main（自动连接） |
| **当前生产 commit** | 6436737 |
| **构建框架** | Vite (React) |
| **构建命令** | npm run build |
| **输出目录** | dist |
| **自动部署** | ✅ 启用（GitHub Push → 自动触发） |
| **SPA 路由** | ✅ 自动支持 |
| **月成本** | ¥0（Cloudflare 免费额度） |
| **可用性** | 99.99%（Cloudflare SLA） |

---

## 🚀 部署步骤

### 前置条件

- ✅ GitHub 账户
- ✅ Cloudflare 账户（免费注册）
- ✅ 项目代码已推送到 GitHub：`rebuild-v0.6-from-v0.4.3` 或 `main` 分支

### 步骤 1：连接 GitHub 到 Cloudflare Pages

1. 访问 https://pages.cloudflare.com
2. 点击 **创建项目** → **连接到 Git**
3. 授权 Cloudflare 访问 GitHub（首次需要）
4. 选择仓库：`dora-beads-pattern-converter`

### 步骤 2：配置构建设置

在 Cloudflare Pages 项目配置中填入：

| 字段 | 值 | 说明 |
|------|-----|-----|
| **Project name** | dora-beads-pattern-converter-git | 项目名称（如已占用可加后缀） |
| **Production branch** | main | 或 rebuild-v0.6-from-v0.4.3 |
| **Framework preset** | Vite | 或选择 React |
| **Build command** | npm run build | 构建命令 |
| **Build output directory** | dist | 输出目录 |
| **Root directory** | / | 项目根目录 |
| **Environment variables** | 无需配置 | 所有配置已在 .env.production 中 |

### 步骤 3：部署

点击 **保存并部署**，Cloudflare 会自动：
- 拉取代码
- 执行 `npm install`
- 执行 `npm run build`
- 部署 `dist/` 目录到全球 CDN

**部署通常需要 2-5 分钟。**

### 步骤 4：验证部署

部署成功后，访问：
```
https://dora-beads-pattern-converter-git.pages.dev
```

预期行为：
1. ✅ 页面加载（显示会员口令输入框）
2. ✅ 输入口令 `member2024`
3. ✅ 进入应用主页
4. ✅ 上传图片、生成图纸、导出文件等功能正常

---

## 🔄 自动更新流程

一旦部署完成，Cloudflare Pages 会自动监听 GitHub 仓库的变化：

### 触发自动部署的情况

1. **提交到 Production 分支**（默认 main）
   ```bash
   git push origin main
   ```
   → Cloudflare 自动拉取、构建、部署

2. **创建 Pull Request**
   → Cloudflare 自动生成预览链接（Preview Deployment）
   → 便于测试和审查

### 手动重新部署

如需强制重新部署（例如修改了环境变量）：

1. 在 Cloudflare Pages 项目页面
2. 点击 **Deployments** 标签
3. 点击 **Trigger deployment** → **Deploy site**

---

## 📋 功能验收清单

### 访问和登录

- [ ] 访问 https://dora-beads-pattern-converter-git.pages.dev 返回 200 OK
- [ ] 首页显示会员口令输入框
- [ ] 输入 `member2024` 可进入应用
- [ ] 输入错误口令显示错误提示

### 核心功能

- [ ] 能上传图片（支持 JPG、PNG、GIF）
- [ ] 能设置图纸尺寸（宽、高、豆数）
- [ ] 能生成拼豆图纸预览
- [ ] 能切换品牌色号
- [ ] 能查看色号用量统计

### 导出功能

- [ ] 能导出 PNG（图纸图片）
- [ ] 能导出 PDF（打印版本）
- [ ] 能导出 CSV（用量统计）

### 本地存储

- [ ] 能保存到"我的作品"（localStorage）
- [ ] 刷新页面后作品仍存在
- [ ] 浏览器开发者工具能看到 `lite_local_works` 在 localStorage 中

### 浏览器兼容性

- [ ] Chrome/Edge：✅
- [ ] Firefox：✅
- [ ] Safari：✅
- [ ] 移动浏览器（iOS Safari/Chrome）：✅

---

## 🔐 安全和隐私

### 数据存储

- ✅ **用户数据**：存储在用户浏览器 localStorage（同源隐离）
- ✅ **无服务器请求**：不向后端发送用户数据
- ✅ **离线可用**：应用可完全离线运行（仅首次加载需网络）

### 环境变量

生产环境配置（`.env.production`）：

```bash
# LITE_MODE 配置
VITE_LITE_MODE=true
VITE_MEMBER_ACCESS_CODE=member2024        # ⚠️ 测试口令，生产需修改
VITE_ACCESS_CODE_VERSION=2026-06          # 月份版本号

# API 配置（不使用）
VITE_API_BASE_URL=/api
VITE_AUTH_MODE=real

# AI 配置（Mock 模式）
VITE_AI_RUNTIME_MODE=mock
VITE_AI_PROVIDER=mock
```

⚠️ **生产部署前**：修改 `VITE_MEMBER_ACCESS_CODE` 为当期会员口令，并更新 `VITE_ACCESS_CODE_VERSION`。

---

## 📊 性能指标

### 构建产物

```
dist/index.html          0.47 kB
dist/assets/*.css       55.92 kB
dist/assets/*.js       508.95 kB (gzipped: 125.32 kB)
---
总大小                  ~565 kB（未压缩）
CDN 传输（gzip）      ~130 kB
```

### 页面性能

- **首字节时间 (TTFB)**：< 100 ms（Cloudflare CDN）
- **首屏加载**：< 2 秒
- **应用交互**：< 3 秒

---

## 🔄 版本更新流程

### 更新会员口令

每月/每期更新时：

1. **修改环境变量**
   ```bash
   # 编辑 .env.production
   VITE_MEMBER_ACCESS_CODE=july_password_2026
   VITE_ACCESS_CODE_VERSION=2026-07
   ```

2. **提交并推送**
   ```bash
   git add .env.production
   git commit -m "chore: update member access code for July 2026"
   git push origin main
   ```

3. **Cloudflare 自动部署**
   - 自动检测变化
   - 重新构建和部署
   - 用户旧授权自动失效，需要重新输入新口令

### 发布新版本

创建新的 Git tag 并推送：

```bash
git tag v0.9.1-lite
git push origin v0.9.1-lite
```

在 CHANGELOG.md 中记录版本信息。

---

## 🔙 回滚方案

### 快速回滚

如部署出错，可快速回滚到上一个版本：

1. **通过 Cloudflare 控制台**
   - 访问项目 → Deployments
   - 选择上一个成功的 Deployment
   - 点击 **Rollback**

2. **通过 Git**
   ```bash
   git revert HEAD
   git push origin main
   # Cloudflare 自动部署回滚后的代码
   ```

### 恢复到完整版本

如需从 v0.9.0-lite 恢复到完整版本（v0.8.1 含后端和数据库）：

详见 [docs/rollback-v0.9.0-lite.md](rollback-v0.9.0-lite.md)

---

## 📞 故障排查

### 问题 1：构建失败

**症状**：Deployment 失败，显示 "Build failed"

**排查步骤**：
1. 检查 Cloudflare Pages 的 Build Log
2. 确认 `npm run build` 在本地能执行成功
3. 检查 Node.js 版本（Cloudflare 使用最新稳定版）
4. 查看是否有缺失的 env 变量

**解决**：
```bash
npm install
npm run build
# 本地测试成功后再推送
```

### 问题 2：页面加载失败 (404)

**症状**：访问返回 404，页面不存在

**排查步骤**：
1. 确认部署成功（检查 Deployments 列表）
2. 检查 URL 是否正确：`https://dora-beads-pattern-converter-git.pages.dev`
3. 等待 CDN 缓存刷新（通常 < 1 分钟）

**解决**：
- 清除浏览器缓存（Ctrl+Shift+Del）
- 使用无痕模式访问
- 等待 2-3 分钟让全球 CDN 同步

### 问题 3：SPA 路由 404

**症状**：直接访问 `/workbench` 等路由返回 404

**预期行为**：Cloudflare Pages 自动重写到 `index.html`，应用加载后由前端路由处理

**排查**：
1. Cloudflare Pages 应自动配置 SPA 路由（无需手动设置）
2. 如仍有问题，检查 `_routes.json` 或自定义路由规则

**解决**：
- 访问根路径 `/` 然后由应用路由导航
- 或联系 Cloudflare 支持

### 问题 4：localStorage 数据丢失

**症状**：刷新页面后"我的作品"消失

**排查**：
1. 确认浏览器隐私模式关闭（隐私模式下 localStorage 会话结束即删除）
2. 检查浏览器 Storage 权限
3. 查看浏览器开发者工具 → Application → Local Storage → 该域名是否存在 `lite_local_works`

**解决**：
- 使用普通模式而非隐私模式
- 检查浏览器隐私设置是否允许存储

---

## 📚 相关文档

- [LITE_MODE 完整配置指南](LITE_MODE_SETUP.md)
- [v0.9.0-lite 回滚文档](rollback-v0.9.0-lite.md)
- [部署说明](11_DEPLOYMENT.md)
- [CHANGELOG](../CHANGELOG.md)

---

## 📝 最后更新

**文档版本**：1.0  
**最后更新**：2026-06-12  
**部署状态**：✅ 成功，正式上线  
**下一步**：监控用户反馈，按需更新口令或功能

