# 部署说明

## 线上地址

```
https://dora-beads-pattern-converter.pages.dev
```

平台：**Cloudflare Pages**
部署时间：2026-06-03
部署方式：Wrangler CLI 直接部署

---

## 本地地址 vs 公网地址

`http://localhost:5173` 是本地开发地址，**只能在当前电脑上访问**。

公网地址是 `https://dora-beads-pattern-converter.pages.dev`，任何人均可访问。

---

## 项目类型

本项目是**纯前端静态应用（Vite + React SPA）**：

- 无后端服务器
- 无数据库
- 无环境变量
- 所有计算在用户浏览器中完成（Canvas、图像处理）

---

## 构建信息

| 项目 | 内容 |
|------|------|
| 构建命令 | `npm run build` |
| 输出目录 | `dist/` |
| 框架 | Vite |
| Base 路径 | `/`（根路径，无需配置）|

---

## 当前部署方式：Wrangler CLI 手动部署

目前使用 Wrangler CLI 手动部署。每次更新代码后需要：

```bash
npm run build
npx wrangler pages deploy dist --project-name dora-beads-pattern-converter
```

---

## 推荐升级：连接 GitHub 自动部署

可以将 Cloudflare Pages 连接到 GitHub 仓库，之后每次 `git push` 自动触发构建和部署。

**操作步骤：**

1. 打开 https://dash.cloudflare.com → Pages → `dora-beads-pattern-converter`
2. 进入 **Settings → Builds & deployments**
3. 点击 **Connect to Git**
4. 选择 GitHub 仓库 `janejasmine1993-oss/dora-beads-pattern-converter`
5. 配置：
   - Build command：`npm run build`
   - Build output directory：`dist`
6. 保存

连接后 `git push origin main` 即可自动部署，无需手动操作。

---

## 代码仓库

GitHub：https://github.com/janejasmine1993-oss/dora-beads-pattern-converter

---

## 关于 Gitee Pages

Gitee Pages 自 2022 年起对个人免费账号全面关闭，服务菜单中不再显示该入口。此方案已放弃。
