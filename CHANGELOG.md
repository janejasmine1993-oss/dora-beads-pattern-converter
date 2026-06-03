# CHANGELOG

## v0.3.1 - 2026-06-03

### Fixed（图纸质量修复）

- **透明背景不再变黑**：引入 `TRANSPARENT_ALPHA_THRESHOLD=32`，alpha<32 的像素标记为 `isTransparent=true`，不参与色号匹配，不显示色号标注
- **保持原图比例**：新增 `resizeWithContain()` 实现 contain 模式，图片等比缩放居中，多余区域透明，不再强制拉伸
- **透明边界自动裁剪**：新增 `cropTransparentBorder()`，自动检测主体 bounding box，加 5% 安全边距后裁剪，确保主体充满目标画布
- **空白区域不计豆**：`computeColorStats` 跳过透明格子；`PatternData` 新增 `beadCount`/`transparentCount` 字段
- **统计面板修正**：豆量统计改为显示实际用豆（非透明格子数），同时展示空白格数量
- **Canvas 渲染修复**：像素图/格子图/色号图均先绘制棋盘格背景表示透明区域，非透明格子覆盖其上；色号图不在透明格上显示标注
- **PNG 导出修复**：透明格导出为浅灰棋盘格，非透明格显示品牌色，不再满屏 A1

### Changed

- `src/types/pattern.ts`：`PixelCell` 新增 `isTransparent`；`PatternCell` 新增 `isTransparent`；`PatternData` 新增 `beadCount`/`transparentCount`；新增 `TRANSPARENT_COLOR` 常量和 `FitMode` 类型
- `src/lib/image/resize.ts`：新增 `TRANSPARENT_ALPHA_THRESHOLD` 常量和 `resizeWithContain()`
- `src/lib/image/crop.ts`：完整实现 `cropTransparentBorder()`
- `src/lib/image/pixelate.ts`：提取像素时计算 `isTransparent`
- `src/lib/utils/stats.ts`：跳过透明格子
- `src/components/PreviewCanvas/canvasRenderer.ts`：所有 Tab 正确处理透明区域
- `src/lib/export/exportPng.ts`：透明格显示棋盘格背景，不显示标注
- `src/App.tsx`：管线升级为 cropTransparentBorder → resizeWithContain → extractPixels → rematchPalette；版本号 v0.3.1

### Known Issues

- 色卡仍为示例数据（非真实 MARD/COCO 等品牌色号），颜色还原质量受限于色卡数量
- PDF / Excel / CSV 导出未实现

---

## v0.2.5 - 2026-06-03

### Added

- 🌐 **项目正式上线**：https://dora-beads-pattern-converter.pages.dev（Cloudflare Pages）
- 实现 PNG 导出核心逻辑（`src/lib/export/exportPng.ts`）：格子图/色号图高清导出，含水印
- 升级 ExportPanel：导出格子图 PNG、导出色号图 PNG 真实可用，PDF/Excel/CSV 保留为占位
- 初始化 Git 仓库，代码托管至 GitHub：https://github.com/janejasmine1993-oss/dora-beads-pattern-converter
- 创建 `docs/11_DEPLOYMENT.md`：完整部署说明

### Changed

- `src/App.tsx`：版本号更新为 v0.2.5，ExportPanel 接口改为传 `patternData`
- `vite.config.ts`：恢复简洁配置（Cloudflare 部署在根路径，无需 base 设置）
- `docs/11_DEPLOYMENT.md`：记录线上地址、Wrangler 部署方式、GitHub 自动部署升级指引

### Known Issues

- 色卡数据仍为示例数据
- PDF / Excel / CSV 导出未实现
- Cloudflare Pages 目前为 Wrangler CLI 手动部署，可升级为 GitHub 自动部署

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
