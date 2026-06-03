# CHANGELOG

## v0.2.5 - 2026-06-03

### Added

- 创建 `docs/11_DEPLOYMENT.md`：完整部署说明（Vercel / Netlify / GitHub 上传步骤）
- 确认 `npm run build` 通过，构建输出目录 `dist/` 可直接部署
- 确认项目无后端依赖、无环境变量，可纯静态部署
- 实现 PNG 导出核心逻辑（`src/lib/export/exportPng.ts`）：格子图/色号图高清导出，含水印
- 升级 ExportPanel：导出格子图 PNG、导出色号图 PNG 真实可用，PDF/Excel/CSV 保留为占位

### Changed

- `src/App.tsx`：版本号更新为 v0.2.5，ExportPanel 接口改为传 `patternData`
- `docs/00_PROJECT_INDEX.md`：版本更新，新增部署文档索引
- `docs/04_TASKS.md`：新增 v0.2.5 任务记录

### Known Issues

- 尚未初始化 Git 仓库（需用户确认后执行）
- 尚未部署到 Vercel / Netlify（需用户登录操作）
- 色卡数据仍为示例数据
- PDF / Excel / CSV 导出未实现

---

## v0.2.0 - 2026-06-03

### Added

- 实现真实图片像素化算法（`resize.ts` + `pixelate.ts`）
- 实现 Lab 色彩空间 Delta-E 76 色号匹配（`paletteMatch.ts` + `color.ts`）
- 实现 Canvas 像素图预览（硬边，无插值）
- 实现 Canvas 格子图预览（品牌色 + 网格线）
- 实现 Canvas 色号图预览（含短编号 A1/A2 标注，格子≥10px 时显示）
- 实现 Canvas 统计图预览（色彩分布堆叠条 + 色块网格）
- 实现豆量统计：每色号实际用量、含 5% 损耗备货量、约需克数
- 实现"生成图纸"按钮，附加载状态和错误提示
- 切换品牌后自动重新匹配色号（无需重新上传）
- 新增 `src/data/palettes/index.ts` 统一管理品牌色卡加载
- 新增 `src/lib/utils/stats.ts` 色号统计计算
- 新增 `src/components/PreviewCanvas/canvasRenderer.ts` Canvas 绘制工具
- 右侧统计面板升级为完整色号明细表（短编号 / 色块 / 色号 / 用量 / 克数）

### Changed

- `src/types/pattern.ts`：新增 `PixelCell`、更新 `PatternData`（含 `rawPixels`）、`ColorStat` 新增 `grams`
- `src/components/SettingsPanel`：新增"生成图纸"按钮、大尺寸提醒
- `src/components/PreviewCanvas`：重写为真实 Canvas 绘制
- `src/components/StatsPanel`：升级为完整统计视图
- `src/App.tsx`：接入完整生成流程，版本号更新为 v0.2.0

### Fixed

- 暂无

### Known Issues

- 色卡数据仍为示例数据，未接入真实品牌色卡
- PNG / PDF / Excel / CSV 导出未实现
- 自动去背景 / AI 风格化 / AI 超分接口未实现

---

## v0.1.0 - 2026-06-03

### Added

- 初始化项目（React + TypeScript + Vite + Tailwind CSS）
- 创建完整文档体系（README.md, VERSION.md, CHANGELOG.md, docs/）
- 创建基础 src 目录结构（components, data, lib, types）
- 创建三栏页面 UI 骨架
- 左侧面板：上传区域（点击/拖拽）、尺寸选择、自定义宽高、成品尺寸计算
- 中间面板：预览 Tab 占位（原图/像素图/格子图/色号图/统计图）
- 右侧面板：品牌选择、统计区占位、四个导出按钮占位
- 创建 5 个品牌示例色卡 JSON 文件（mard, coco, manman, panpan, mixiaowo）
- 创建类型定义文件（palette.ts, pattern.ts, export.ts）
- 创建 lib 模块骨架（image/, export/, utils/）

### Known Issues

- 色卡数据目前是示例数据，未接入完整真实品牌色卡
- 图像转换算法暂未实现
- PDF / Excel / CSV 导出暂未实现
