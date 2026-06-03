# 部署说明

## 本地地址 vs 公网地址

`http://localhost:5173` 是本地开发地址，**只能在当前电脑上访问**。

其他人无法通过这个地址访问你的项目。

要获得一个可以公开访问的网址，需要将项目部署到静态托管平台。

---

## 项目类型说明

本项目是 **纯前端静态应用（Vite + React SPA）**：

- 没有后端服务器
- 没有数据库
- 没有环境变量
- 所有计算在用户浏览器中完成（Canvas、图像处理）

这意味着部署非常简单，只需要把 `dist/` 目录里的文件托管到任何静态文件服务器即可。

---

## 构建信息

| 项目 | 内容 |
|------|------|
| 构建命令 | `npm run build` |
| 输出目录 | `dist/` |
| 框架 | Vite |
| 是否需要后端 | 否 |
| 是否需要环境变量 | 否 |
| 是否有客户端路由 | 否（单页，无需 SPA 重定向配置）|

---

## 推荐部署平台

**推荐 Vercel**（更简单，对 Vite 项目支持最好）。

Netlify 也完全可用，步骤类似。

---

## 方案一：Vercel 部署（推荐）

### 前提条件

1. 将项目代码上传到 GitHub 仓库（见下文"如何上传 GitHub"）
2. 注册 Vercel 账号：https://vercel.com

### 部署步骤

1. 打开 https://vercel.com，登录后点击 **Add New → Project**
2. 选择 **Import Git Repository**，授权 GitHub 后选择该项目仓库
3. 框架预设（Framework Preset）选择 **Vite**
4. 填写构建配置：

   | 字段 | 值 |
   |------|-----|
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install`（默认）|

5. 点击 **Deploy**
6. 部署成功后获得网址，格式类似：

   ```
   https://dora-beads-pattern-converter.vercel.app
   ```

### 后续更新

每次向 GitHub 主分支推送代码，Vercel 会自动重新构建和部署。

---

## 方案二：Netlify 部署

### 前提条件

1. 将项目代码上传到 GitHub 仓库
2. 注册 Netlify 账号：https://netlify.com

### 部署步骤

1. 打开 https://netlify.com，登录后点击 **Add new site → Import an existing project**
2. 选择 **GitHub**，授权后选择该项目仓库
3. 填写构建配置：

   | 字段 | 值 |
   |------|-----|
   | Build Command | `npm run build` |
   | Publish Directory | `dist` |

4. 点击 **Deploy site**
5. 部署成功后获得网址，格式类似：

   ```
   https://dora-beads-pattern-converter.netlify.app
   ```

---

## 如何上传到 GitHub

1. 在 GitHub 创建新仓库：https://github.com/new
   - 仓库名建议：`dora-beads-pattern-converter`
   - 可以设为 Private（私有）
   - 不要勾选"Initialize this repository"

2. 在终端执行（需要先告诉 Claude 执行，或自己执行）：

   ```bash
   cd /Users/jasmine/Documents/Projects/dora-beads-pattern-converter
   git init
   git add .
   git commit -m "Initial commit: v0.2.5 dora-beads-pattern-converter"
   git branch -M main
   git remote add origin https://github.com/你的用户名/dora-beads-pattern-converter.git
   git push -u origin main
   ```

3. 刷新 GitHub 页面确认代码已上传

---

## 当前状态（v0.2.5）

| 检查项 | 状态 |
|--------|------|
| `npm run build` | ✅ 通过，零错误 |
| 输出目录 `dist/` | ✅ 已生成 |
| `.gitignore` | ✅ 已存在（由 Vite 模板创建）|
| Git 仓库 | ❌ 尚未初始化，需要你确认后执行 |
| GitHub 仓库 | ❌ 尚未创建，需要你在 GitHub 创建 |
| Vercel/Netlify 部署 | ❌ 尚未部署，需要你登录平台操作 |

---

## 还差哪些步骤才能上线

以下步骤**需要你本人操作**（需要登录账号，Claude 无法代劳）：

1. **创建 GitHub 仓库**（需要你的 GitHub 账号）
2. 告诉 Claude 初始化 git 并提交代码，**或**自己执行上面的 git 命令
3. **登录 Vercel 或 Netlify**，连接 GitHub 仓库并点击 Deploy

整个过程大约 5-10 分钟。

---

## 是否需要特殊配置文件

由于本项目：
- 无客户端路由（无需 SPA 重定向规则）
- 无环境变量
- 使用标准 Vite 构建

**不需要** `vercel.json` 或 `netlify.toml`。

Vercel 和 Netlify 会自动识别 Vite 项目，默认配置即可正常工作。
