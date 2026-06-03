# Prompt Log

## 2026-06-03 第 5 轮指令（v0.3.3 专业图纸版式升级 + 品牌真实色号显示）

### 目标

升级专业图纸模板，在格子和图例中显示真实品牌色号（A01、ZG7 等），全面优化版式和配色。

### 使用工具

Claude Code

### 提示词摘要

v0.3.3 专业打印图纸版式升级 + 品牌真实色号显示。上一个 Claude Code 因上下文过长中断，本轮接手补完。主要内容：格子标注和图例改为真实品牌色号；标题栏双行（系列名+品牌名/作品名+尺寸）；图例节标题；刻度尺蓝紫配色+加粗；统计栏双行；主体范围计算；水印升级。

### 结果

- 接手上一个 Claude Code 未完成的工作，确认 drawPatternTemplate.ts 已完成所有功能改造
- 修复遗留的 TS6196 构建错误（ColorStat 导入未使用）
- 构建通过（零错误）
- 更新 VERSION.md → v0.3.3，CHANGELOG.md，docs/04_TASKS.md，docs/10_KNOWN_ISSUES.md
- 提交代码

---

## 2026-06-03 第 4 轮指令（v0.3.1 ~ v0.3.2）

### 目标

修复图纸质量问题 + 接入真实品牌色卡 + 专业图纸模板 + 颜色数量控制。

### 使用工具

Claude Code

### 提示词摘要

v0.3.1：修复透明背景/比例/空白计豆/Canvas 渲染问题；接入 291 色真实色卡。v0.3.2：颜色数量控制（量化 + 合并），专业图纸模板，导出模式切换，作品名自动提取。

### 结果

- v0.3.1：透明处理、contain 缩放、自动裁剪、真实色卡（291 色/品牌，含 Lab 预计算）
- v0.3.2：ColorControlPanel、quantize.ts（Median-Cut）、mergeColors.ts、drawPatternTemplate.ts（专业图纸）、导出模式切换

---

## 2026-06-03 第 3 轮指令（v0.2.5 部署准备）

### 目标

部署准备：检查构建、创建部署文档、说明 Git 初始化和上线步骤，不新增业务功能。

### 使用工具

Claude Code

### 提示词摘要

v0.2.5 部署准备。要求：检查 npm run build、创建 docs/11_DEPLOYMENT.md（Vercel/Netlify 部署步骤）、检查 git 状态、不新增业务功能、不做登录/支付/会员/AI 相关功能。

### 结果

- 确认 `npm run build` 通过（零错误，输出 `dist/`）
- 确认项目为纯静态 SPA，无需后端，无需环境变量
- 确认 `.gitignore` 已存在（Vite 模板自带）
- 确认项目**尚未初始化 git 仓库**（等待用户确认后执行）
- 创建 `docs/11_DEPLOYMENT.md`（Vercel/Netlify/GitHub 完整部署步骤）
- 版本推进至 v0.2.5
- 同期完成了 PNG 导出功能（格子图 + 色号图，高清含水印）

---

## 2026-06-03 第 2 轮指令

### 目标

实现真实图片像素化、Canvas 预览、基础色号匹配和豆量统计（v0.2.0）。

### 使用工具

Claude Code

### 提示词摘要

开发 v0.2.0，主题：实现真实图片像素化、Canvas 预览、基础色号匹配和豆量统计。

具体要求：
- 实现 resize.ts（loadImage + resizeImageToCanvas）
- 实现 pixelate.ts（extractPixels → PixelCell[]）
- 实现 paletteMatch.ts（Lab Delta-E 色号匹配）
- 实现 Canvas 像素图、格子图、色号图、统计图四个 Tab 的真实绘制
- 实现豆量统计（实际用量、5% 损耗、克数）
- 添加"生成图纸"按钮（手动触发，含加载/错误状态）
- 切换品牌自动重匹配
- 继续使用示例色卡，不接入真实 API
- 不做导出功能

### 结果

- 实现了 Lab + Delta-E 76 色号匹配算法（`color.ts` + `paletteMatch.ts`）
- 实现了 Canvas 四种绘制模式（像素图/格子图/色号图/统计图）
- 实现了完整豆量统计面板（含色号明细、克数）
- 实现了"生成图纸"按钮和完整生成流程
- 切换品牌自动重匹配（不重新像素化）
- 构建零错误，版本推进至 v0.2.0

---

## 2026-06-03 第 1 轮指令

### 目标

初始化项目骨架、文档体系和基础三栏 UI。

### 使用工具

Claude Code

### 提示词摘要

初始化 React + TypeScript + Vite + Tailwind CSS 项目，创建完整文档体系、三栏 UI 骨架、上传区域、尺寸设置、预览 Tab 占位、品牌选择、统计占位、导出按钮、5 个品牌示例色卡 JSON、lib 模块骨架、TypeScript 类型定义。

### 结果

- 完成项目初始化（v0.1.0）
- 完成完整文档体系（README.md, VERSION.md, CHANGELOG.md, docs/00~10）
- 完成三栏 UI 骨架
- 完成示例色卡 JSON（5 个品牌各 20 色）
- 完成 lib 模块骨架（占位函数）
