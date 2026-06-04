# CHANGELOG

## v0.3.5 - 2026-06-04（高清渲染与放大清晰度优化）

### Changed

- **专业 PNG 2× 高清导出**（`drawPatternTemplate.ts`）：
  - 新增 `EXPORT_SCALE = 2` 常量；物理 Canvas 尺寸翻倍（`canvas.width/height × 2`）
  - 通过 `ctx.scale(2, 2)` 统一缩放，所有逻辑坐标代码无需修改
  - 52×52 图纸导出宽度从 ~1264px 升至 ~2528px；104×104 从 ~1680px 升至 ~3360px
  - 0.5px 细网格线在 2× 后变为 1px 物理像素，完全消除抗锯齿模糊
  - 1.8px 10格粗线变为 3.6px 物理像素，十字定位更清晰
  - 格子内色号文字在 2× 后物理尺寸翻倍，放大查看依然清晰锐利
- **格子内色号字体栈调整**：`FF_MONO` 改为 `Consolas, Menlo, Monaco, "Courier New", monospace`（Consolas/Menlo 字形更紧凑、数字间距更均匀，适合多字符色号）
- **预览 Canvas HiDPI 缩放**（`PreviewCanvas/index.tsx`）：
  - 使用 `window.devicePixelRatio`（上限 2×）缩放 Canvas 物理像素
  - 通过 `canvas.style.width/height` 将 CSS 显示尺寸锁定为逻辑尺寸，Retina 屏渲染清晰
  - `drawStatsTab` 传入逻辑尺寸（非物理 canvas.width），保证统计图布局正确

---

## v0.3.4 - 2026-06-04（图纸命名、品牌展示、镜像功能与版式细节优化）

### Added

- **图纸名称输入框**：左侧面板新增"图纸名称"输入框，上传图片时自动以文件名（去扩展名）作为默认值，用户可手动修改
- **左右镜像功能**：导出面板新增镜像开关（默认关闭），开启后图案左右翻转，适合反面拼、熨烫或镜像制作
  - 镜像只改变图案格子的 x 坐标映射，所有文字（品牌文案、色号标注、坐标、图例、水印）保持正常可读方向
  - 预览（格子图/色号图/像素图）与导出同步生效
  - 预览 Tab 栏右侧显示红色"镜像"标签
- **右侧统计区同步信息**：图纸统计面板新增"图纸名称"和"镜像状态"字段，导出前可确认当前状态

### Changed

- **专业 PNG 品牌展示升级**：左上角第一行固定显示"哆啦拼豆图纸"（品牌），第二行显示色卡系列（如 Mard221）
- **专业 PNG 右上角**：显示图纸名称；开启镜像时自动追加 `[镜像]` 标记，过长标题自动截断
- **专业 PNG 统计栏**：开启镜像时第一行品牌信息追加 `[镜像]` 标记
- **10 格粗分区线加深加粗**：颜色从 `rgba(0,0,0,0.28)` 升级为 `rgba(80,8,8,0.36)`，线宽从 1.2px 升级为 1.8px，与细网格形成更明显层级
- **四周坐标标尺改为酒红色**：背景 `#fff0f2`、边框 `rgba(138,21,56,0.28)`、数字 `#8A1538`（深酒红）
- **外边框改为酒红色**：`#8A1538`，与标尺协调统一
- **水印条配色改为酒红色系**：背景 `#fff0f2`，文字酒红色
- **全局字体栈升级**：专业 PNG 所有文字区域改用 `"PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Helvetica Neue", Arial, sans-serif`；色号标注改用 `"SF Mono", Menlo, Consolas, "Courier New", monospace`
- **文件名规则升级**：格式为 `哆啦拼豆图纸_图纸名_[镜像]_品牌_宽x高_日期.png`
- **简洁模式导出**：同步支持镜像和新文件名规则，水印文字改为"哆啦拼豆图纸"

---

## v0.3.3 - 2026-06-03（专业图纸版式升级 + 品牌真实色号显示）

### Changed

- **专业图纸模板版式全面升级**（`drawPatternTemplate.ts`）：
  - **真实品牌色号**：格子内标注和图例均直接显示品牌官方色号（如 A01、ZG7），不再使用内部短码（A1、B2 等）
  - **标题栏双行**：左侧显示品牌系列名（大号字）+ 品牌名（副标），右侧显示作品名（大号字）+ 图纸尺寸/主体尺寸（副标）
  - **品牌系列名映射**：MARD → Mard221；其他品牌保持原名
  - **主体范围计算**：`calcBodyRange()` 自动检测非透明格子的 bounding box，显示主体格数（不含透明边缘）
  - **智能字号适配**：色号长度 ≥3 时自动缩小字号，避免溢出格子
  - **图例升级**：显示品牌色号（主）+ 颜色名（副，若与色号不同）+ 实际用量（颗）+ 建议备货·克数
  - **图例节标题**：`色号图例（品牌名 · N 色）` + 分隔线
  - **统计栏双行**：第 1 行：品牌（含系列名）、颜色种数、实际用豆、含 5% 损耗；第 2 行：图纸尺寸、主体范围、成品约尺寸、生成日期
  - **刻度尺升级**：蓝紫色背景（`#eef2ff`）+ 强调色数字（`#4338ca`），10 倍数和首末格加粗；四向均采用统一 `drawRuler()` 辅助函数
  - **外框加深**：网格外框颜色由半透明改为 `#1e293b`，线宽 2px
  - **水印条升级**：背景 `#eef2ff`，文字靛蓝色半透明

### Fixed

- 移除 `drawPatternTemplate.ts` 中未使用的 `ColorStat` 类型导入（修复 TS6196 构建错误）
- 移除对 `buildShortCodeMap` 的依赖（不再需要内部短码映射）

---

## v0.3.2 - 2026-06-03（专业图纸模板 + 颜色合并优化）

### Added

- **颜色数量控制**：新增 ColorControlPanel，可选 15/20/25/30 色或自定义（5-100）
- **相近色合并**：实现 Median-Cut 色彩量化（`quantize.ts`），生成前将像素减少到目标颜色数，大幅减少碎色
- **少量颜色自动合并**：实现低用量色号合并（`mergeColors.ts`），默认阈值 5 颗，用量低于阈值的颜色自动合并到最近色
- **专业 PNG 图纸模板**（`drawPatternTemplate.ts`）：
  - 顶部信息栏：品牌名（左）+ 作品名（右）+ 尺寸（中）
  - 上下左右四向坐标刻度
  - 每 10 格加粗分区线
  - 每 26 格拼板边界线（蓝色辅助线）
  - 格子内色号短编号
  - 底部色卡图例（色块 + 短编号 + 品牌色号 + 备货量 + 克数）
  - 底部统计栏（颜色种数、用豆、备货量、图纸尺寸、成品尺寸）
  - 水印条
- **导出模式选择**：简洁格子 / 专业图纸（ExportPanel 新增 toggle）
- **作品名自动提取**：上传图片时从文件名提取作品名，传给专业模板
- 切换颜色设置后自动重新生成（无需重新上传图片）

### Changed

- `src/App.tsx`：新增 maxColors、mergeThreshold、workTitle 状态；管线升级为量化→匹配→合并
- `src/components/ExportPanel`：新增模式选择，传 workTitle 给导出函数
- `src/lib/export/exportPng.ts`：新增 'professional' 模式，调用 drawPatternTemplate

---

## v0.3.1 - 2026-06-03（图纸质量修复 + 真实色卡接入）

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

### Added（真实色卡接入）

- 接入真实品牌色卡数据（来源：mumu-0922/pindou + Zippland/perler-beads colorSystemMapping）
  - MARD：291 色
  - COCO：291 色
  - 漫漫：290 色
  - 盼盼：291 色
  - 咪小窝：291 色
- 色卡数据包含预计算 Lab 值，`paletteMatch.ts` 优先使用，匹配速度提升 ~10 倍
- `PaletteColor` 类型新增可选 `lab` 字段

### Known Issues

- 色卡数据来源为开源社区项目，授权为"community"，仅用于开发测试，商用前需确认
- 颜色名称当前与编号相同（如 "A01"），未接入官方中文名
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
