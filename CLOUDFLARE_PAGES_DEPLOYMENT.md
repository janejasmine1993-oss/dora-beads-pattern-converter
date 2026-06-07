# Cloudflare Pages 部署指南

## 项目信息

- **项目名称**：dora-beads-pattern-converter
- **GitHub 仓库**：janejasmine1993-oss/dora-beads-pattern-converter
- **当前版本**：v0.6.4
- **构建工具**：Vite
- **构建产物目录**：`dist/`
- **构建命令**：`npm run build`
- **安装命令**：`npm install`

---

## 部署方式 1️⃣：自动部署（GitHub 集成，推荐）

### 步骤 1：访问 Cloudflare Pages 控制台

1. 访问 [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. 左侧菜单选择 **Pages**
3. 点击 **Create a project**
4. 选择 **Connect to Git**

### 步骤 2：授权 GitHub 账户

1. 选择 **GitHub** 作为 Git 提供商
2. 授权 Cloudflare 访问您的 GitHub 账户
3. 在授权后，选择仓库：`janejasmine1993-oss/dora-beads-pattern-converter`

### 步骤 3：配置构建设置

在 Cloudflare Pages 配置页面填入以下信息：

| 字段 | 值 |
|------|-----|
| **Project name** | dora-beads-pattern-converter |
| **Production branch** | main (或 rebuild-v0.6-from-v0.4.3) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Node.js Version** | 18 (或更高) |

### 步骤 4：保存并部署

1. 点击 **Save and Deploy**
2. Cloudflare 将自动：
   - Clone 您的仓库
   - 运行 `npm install`
   - 运行 `npm run build`
   - 发布 `dist/` 目录到 Pages
3. 等待部署完成（通常 2-3 分钟）
4. 您将看到一个 pages.dev 域名，例如：
   ```
   https://dora-beads-pattern-converter.pages.dev
   ```

### 后续自动部署

- 每次您 push 代码到 GitHub，Cloudflare Pages 会**自动重新部署**
- 无需手动操作

---

## 部署方式 2️⃣：手动部署（使用 Wrangler CLI）

### 前置条件

1. 安装 Wrangler CLI：
   ```bash
   npm install -g wrangler
   ```

2. 登录 Cloudflare：
   ```bash
   wrangler login
   ```

### 部署步骤

1. 确保已构建产物：
   ```bash
   npm run build
   # 产物在 dist/ 目录
   ```

2. 创建 `wrangler.toml` 配置（如果不存在）：
   ```toml
   name = "dora-beads-pattern-converter"
   pages_build_output_dir = "dist"
   
   [env.production]
   name = "dora-beads-pattern-converter"
   ```

3. 部署到 Cloudflare Pages：
   ```bash
   wrangler pages deploy dist/
   ```

4. 部署完成后，您将看到部署后的 URL

---

## 验收清单

部署完成后，在浏览器访问 Cloudflare Pages URL，检查以下项目：

### 首页测试
- [ ] 首页正常加载
- [ ] 四个功能卡显示正确
- [ ] 顶部导航栏完整

### 工作台测试
- [ ] 上传图片功能正常
- [ ] 裁剪功能可用
- [ ] 生成图纸成功
- [ ] 预览 Tab 全部可用

### 编辑测试
- [ ] 进入编辑模式
- [ ] 工具栏功能正常
- [ ] 颜色高亮按钮可用
- [ ] 替换颜色功能正常
- [ ] 导出 PNG 成功

### 性能检查
- [ ] 页面加载快速（< 3 秒）
- [ ] 交互响应流畅
- [ ] 无控制台错误

---

## 常见问题

### Q: 我应该选择哪种部署方式？
**A**: 推荐**方式 1（自动部署）**。只需连接一次 GitHub，后续所有 push 都会自动部署，无需手动操作。

### Q: 部署需要多长时间？
**A**: 通常 2-3 分钟。您可以在 Cloudflare Pages 控制台看到实时进度。

### Q: 如何更新已部署的应用？
**A**: 
- **方式 1**：直接 git push，Cloudflare 会自动重新部署
- **方式 2**：重新运行 `wrangler pages deploy dist/`

### Q: 如何绑定自定义域名？
**A**: 在 Cloudflare Pages 项目设置 → **Custom domains** → 添加您的域名

### Q: 部署失败了怎么办？
**A**: 
1. 检查 Build log（Cloudflare Pages 控制台）
2. 确认本地能 `npm run build` 成功
3. 确认 `dist/` 目录存在
4. 尝试重新部署

---

## 后续支持

- Cloudflare Pages 文档：https://developers.cloudflare.com/pages/
- 遇到问题可查看 Build logs 获取详细错误信息

**祝部署顺利！** 🚀
