# v0.9.0-lite 回滚文档

**创建日期**：2026-06-11  
**版本**：v0.9.0-lite  
**部署平台**：腾讯云 CloudBase（静态托管）  
**类型**：无数据库安全版本 - 可安全回滚

---

## 🎯 版本说明

**v0.9.0-lite** 是一个特殊的**无数据库、无后端、静态托管**的安全版本，专为零成本快速部署而设计。

### 版本特点

✅ **无数据库依赖** — 不使用 PostgreSQL  
✅ **无后端依赖** — 不部署云函数或服务器  
✅ **纯前端应用** — 只部署 dist/ 目录  
✅ **完全可逆** — 所有原有代码完整保留  
✅ **零成本部署** — CloudBase 静态托管免费  
✅ **版本号强制更新** — 会员口令支持版本过期机制

### 部署配置

```json
// cloudbaserc.json - v0.9.0-lite
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

**关键特征**：
- ✅ 仅包含 `hosting` 静态托管配置
- ✅ 无 `cloudRunServices`（无后端）
- ✅ 无 `functionRoot`（无云函数）
- ✅ `publicPath: "dist"`（指向构建产物）

---

## 🔄 回滚场景

### 场景 1：回滚到完整版本（v0.8.1）

**触发条件**：
- 需要恢复认证、会员、AI 功能
- 需要启用 PostgreSQL 数据库
- 需要部署后端服务

**回滚步骤**：

#### 第 1 步：恢复 CloudBase 配置

```bash
# 恢复 v0.8.1 的原始配置
cp docs/cloudbase-config-backup-v0.8.1.json cloudbaserc.json
```

**恢复后的配置**：
```json
{
  "envId": "dora-beads-prod-d3fnxast620bb482",
  "projectPath": ".",
  "functionRoot": "server",
  "functions": [],
  "hosting": {
    "disableFunctionalDomain": false
  },
  "cloudRunServices": [
    {
      "name": "dora-beads-api",
      "servicePath": "server",
      "buildDir": "server",
      "dockerfile": "server/Dockerfile"
    }
  ],
  "version": "2.0"
}
```

#### 第 2 步：恢复环境变量

编辑 `.env.production`：

```bash
# 改为完整版本
VITE_LITE_MODE=false

# 配置后端 API 地址
VITE_API_BASE_URL=https://your-backend-url

# 其他配置
VITE_AUTH_MODE=real
VITE_AI_RUNTIME_MODE=real  # 或 mock
VITE_AI_PROVIDER=tencent-hunyuan  # 或其他
```

#### 第 3 步：启用数据库

1. 在腾讯云控制台创建或启用 PostgreSQL 实例
2. 设置数据库连接字符串
3. 运行数据库迁移：
   ```bash
   cd server
   npm run migrate
   ```

#### 第 4 步：部署

```bash
# 构建前端
npm run build

# 部署到 CloudBase（会同时部署前端和后端）
tcb deploy
```

**预期结果**：
- ✅ 前端静态托管（dist/）
- ✅ 后端云托管（server/）
- ✅ 数据库连接（PostgreSQL）
- ✅ 功能恢复：注册、登录、会员、AI、兑换码

---

### 场景 2：从 v0.9.0-lite 更新到新的 v0.9.x

**触发条件**：
- 修复 bug
- 更新前端逻辑
- 更新会员口令

**更新步骤**：

#### 仅更新前端

```bash
# 修改代码
# ...

# 构建
npm run build

# 部署（仅 dist/ 目录）
tcb hosting deploy dist
```

#### 更新会员口令

编辑 `.env.production`：

```bash
# 修改当期口令（例如从 member2024 改为 7月口令）
VITE_MEMBER_ACCESS_CODE=july_password_2026

# 同时更新版本号（强制旧授权失效）
VITE_ACCESS_CODE_VERSION=2026-07
```

然后重新部署：

```bash
npm run build
tcb hosting deploy dist
```

**效果**：
- ✅ 用户旧授权自动失效
- ✅ 用户需要重新输入新口令
- ✅ 无需清除 localStorage（版本号检查会自动处理）

---

### 场景 3：紧急回滚（部署出错）

**触发条件**：
- 部署后出现严重问题
- 需要立即回滚到上一个版本

**快速回滚步骤**：

#### 方式 A：使用 Git 回滚

```bash
# 查看历史版本
git log --oneline --all | grep -E "v0\.(8|9)"

# 回滚到前一个版本
git revert HEAD
# 或
git reset --hard <commit-hash>

# 重新构建和部署
npm run build
tcb hosting deploy dist
```

#### 方式 B：使用 CloudBase 版本管理

```bash
# 查看已部署版本
tcb hosting list

# 如果 CloudBase 支持版本回滚，可直接操作（需查看 CLI 文档）
```

#### 方式 C：手动恢复

1. 在 GitHub 上下载前一个版本的 `dist/` 备份
2. 手动上传到 CloudBase：
   ```bash
   tcb hosting deploy <path-to-previous-dist> /
   ```

---

## 📊 版本对应关系

| 版本 | 后端 | 数据库 | 成本 | 部署方式 | 备份配置 |
|------|------|--------|------|--------|--------|
| v0.8.1 | ✅ CloudBase 云托管 | ✅ PostgreSQL | ¥50-100/月 | 云托管 | 原 cloudbaserc.json |
| **v0.9.0-lite** | ❌ 无 | ❌ 无 | ¥0/月 | 静态托管 | docs/cloudbase-config-backup-v0.8.1.json |

---

## 🔐 数据安全

### v0.9.0-lite（当前）
- **用户数据**：存储在用户浏览器 localStorage
- **安全性**：仅受浏览器安全策略保护
- **备份**：用户可导出 JSON 备份
- **丢失风险**：用户清除缓存会丢失

### 回滚到 v0.8.1+（完整版）
- **用户数据**：存储在 PostgreSQL 数据库
- **安全性**：数据库加密、访问控制
- **备份**：数据库定期备份
- **丢失风险**：极低（数据库备份）

---

## 📝 回滚清单

### 从 v0.9.0-lite 回滚到完整版（v0.8.1）

- [ ] **备份当前配置**
  - [ ] 导出用户在 v0.9.0-lite 中保存的作品
  - [ ] 记录当前使用情况和 bug 报告

- [ ] **恢复配置**
  - [ ] `cp docs/cloudbase-config-backup-v0.8.1.json cloudbaserc.json`
  - [ ] 修改 `.env.production` 中的 `VITE_LITE_MODE=false`
  - [ ] 配置后端 API 地址

- [ ] **启用数据库**
  - [ ] 在腾讯云创建或启用 PostgreSQL
  - [ ] 运行数据库迁移

- [ ] **部署**
  - [ ] `npm run build`
  - [ ] `tcb deploy`

- [ ] **验证**
  - [ ] 访问应用，检查注册/登录功能
  - [ ] 检查数据库连接
  - [ ] 测试会员、AI、兑换码功能
  - [ ] 监控日志，检查错误

### 从出错状态回滚

- [ ] **确定问题**
  - [ ] 查看 CloudBase 日志
  - [ ] 检查浏览器控制台错误

- [ ] **选择回滚方法**
  - [ ] Git 方式（推荐）
  - [ ] 手动上传方式

- [ ] **执行回滚**
  - [ ] 恢复代码或 dist/
  - [ ] 重新部署

- [ ] **验证**
  - [ ] 测试基本功能
  - [ ] 确认错误已消除

---

## 🛠️ 技术细节

### v0.9.0-lite 的 localStorage 结构

```javascript
// 会员口令相关
localStorage['lite_access_granted'] = 'true'  // 是否已授权
localStorage['lite_access_code_version'] = '2026-06'  // 口令版本号

// 作品存储
localStorage['lite_local_works'] = '[...]'  // JSON 作品数组（最多 10 个）

// 访问时间
localStorage['lite_last_access_time'] = 'ISO时间戳'  // 最后访问时间
```

### 回滚时的 localStorage 清理

从 v0.9.0-lite 恢复到完整版本时，建议用户清除 v0.9.0-lite 相关的 localStorage：

```javascript
// 在浏览器开发者工具中执行
localStorage.removeItem('lite_access_granted')
localStorage.removeItem('lite_access_code_version')
localStorage.removeItem('lite_local_works')
localStorage.removeItem('lite_last_access_time')
```

或使用代码中提供的函数：

```typescript
import { clearAccessCodeAuth } from './src/AppWithLiteMode'
clearAccessCodeAuth()
```

---

## 📞 常见问题

### Q: 回滚会影响用户吗？

**A**: 
- **v0.9.0-lite 用户**：影响。需要提前备份 localStorage 中的作品。
- **v0.8.1+ 用户**：无影响。数据在 PostgreSQL 中，不受 v0.9.0-lite localStorage 影响。

### Q: 回滚需要停机吗？

**A**: 仅静态托管回滚（在 v0.9.0-lite 版本内）几乎无停机时间。回滚到完整版本（v0.8.1）如需启用数据库，可能需要 5-10 分钟准备时间。

### Q: 回滚后数据会丢失吗？

**A**: 取决于版本：
- v0.9.0-lite 中的作品：可能丢失（需用户提前导出）
- v0.8.1+ 中的作品：完全保留（PostgreSQL 数据库）

### Q: 如何快速测试回滚？

**A**: 建议在测试环境操作：
1. 克隆仓库到新目录
2. 恢复配置
3. 部署到测试 CloudBase 环境
4. 验证后再应用到生产

---

## 总结

**v0.9.0-lite 是一个完全可逆的安全版本**。所有原有代码和配置均已备份，随时可恢复完整功能。

- ✅ 原配置已备份：`docs/cloudbase-config-backup-v0.8.1.json`
- ✅ 代码完整保留：server/、认证、会员等均未删除
- ✅ 快速部署：仅需部署静态文件，无数据库复杂性
- ✅ 可随时升级：修改环境变量和配置即可恢复完整功能

---

**文档版本**：1.0  
**最后更新**：2026-06-11  
**状态**：✅ v0.9.0-lite 已安全部署

