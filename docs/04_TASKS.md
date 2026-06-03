# Tasks

## v0.1.0 任务（已完成）

- [x] 初始化项目（React + TypeScript + Vite + Tailwind CSS）
- [x] 创建 README.md
- [x] 创建 VERSION.md
- [x] 创建 CHANGELOG.md
- [x] 创建 docs 文档体系（00~10）
- [x] 创建 src 目录结构
- [x] 创建三栏页面布局
- [x] 创建上传区域（点击上传 + 拖拽上传）
- [x] 创建尺寸设置区域（常用尺寸 + 自定义宽高 + 成品尺寸计算）
- [x] 创建中间预览区域（Tab 占位）
- [x] 创建右侧统计与导出区域（品牌选择 + 统计占位 + 导出按钮）
- [x] 创建示例色卡数据（5 个品牌各 20 个颜色）
- [x] 创建类型定义文件
- [x] 创建 lib 模块骨架（image/, export/, utils/）
- [x] 更新已知问题（docs/10_KNOWN_ISSUES.md）
- [x] 记录提示词（docs/09_PROMPT_LOG.md）

## v0.2.0 任务（已完成）

- [x] 实现图像缩放到目标格数（resize.ts：loadImage + resizeImageToCanvas）
- [x] 实现像素提取（pixelate.ts：extractPixels，输出 PixelCell[]）
- [x] 实现 Lab + Delta-E 76 色号匹配（paletteMatch.ts + color.ts）
- [x] 实现 Canvas 像素图绘制（canvasRenderer.ts：drawPixelTab）
- [x] 实现 Canvas 格子图绘制（drawGridTab，含网格线）
- [x] 实现 Canvas 色号图绘制（drawColorCodeTab，含短编号标注）
- [x] 实现 Canvas 统计图绘制（drawStatsTab，色彩分布可视化）
- [x] 实现豆量统计（stats.ts：computeColorStats，含克数计算）
- [x] 升级右侧统计面板（完整色号明细表）
- [x] 添加"生成图纸"按钮（含加载状态 + 错误提示）
- [x] 切换品牌自动重匹配（无需重新上传图片）
- [x] 新增 data/palettes/index.ts 统一管理色卡加载
- [x] 更新 VERSION.md 至 v0.2.0
- [x] 更新 CHANGELOG.md
- [x] 更新 docs/07_TEST_CHECKLIST.md
- [x] 更新 docs/10_KNOWN_ISSUES.md
- [x] 更新 docs/08_DECISION_LOG.md
- [x] 记录 docs/09_PROMPT_LOG.md

## v0.2.5 任务（已完成）

- [x] 实现 PNG 导出（exportPng.ts：格子图 + 色号图，高清，含水印，自动命名）
- [x] 升级 ExportPanel（PNG 真实导出，含成功/失败提示）
- [x] 创建 docs/11_DEPLOYMENT.md（部署说明）
- [x] 确认 npm run build 通过
- [x] 更新 VERSION.md 至 v0.2.5
- [x] 更新 CHANGELOG.md
- [x] 更新 README.md

## v0.3.1 任务（已完成）

- [x] 修复透明背景变黑问题（TRANSPARENT_ALPHA_THRESHOLD）
- [x] 修复图纸拉伸问题（resizeWithContain）
- [x] 修复透明区域计豆问题
- [x] 接入真实品牌色卡（291 色/品牌，含预计算 Lab 值）

## v0.3.2 任务（已完成）

- [x] 新增颜色数量控制（ColorControlPanel，15/20/25/30/自定义）
- [x] 实现 Median-Cut 量化（quantize.ts）
- [x] 实现低用量色号合并（mergeColors.ts，默认阈值 5 颗）
- [x] 实现专业图纸模板（drawPatternTemplate.ts）
- [x] 新增导出模式切换（简洁 / 专业）
- [x] 作品名自动从文件名提取

## v0.3.3 任务（已完成）

- [x] 专业图纸版式升级：标题栏双行（品牌系列名 + 尺寸副标）
- [x] 格子内标注改为真实品牌色号（A01、ZG7 等，移除内部短码）
- [x] 图例升级：品牌色号（主）+ 颜色名（副）+ 用量 + 建议备货·克数
- [x] 图例节标题：`色号图例（品牌 · N 色）`
- [x] 刻度尺升级：蓝紫配色，10 倍数/首末格加粗，统一 drawRuler() 函数
- [x] 统计栏双行：品牌（含系列名）/ 颜色种数 / 用豆 / 损耗 + 图纸/主体/成品/日期
- [x] 主体范围计算（calcBodyRange，显示非透明主体格数）
- [x] 智能字号：色号长度 ≥3 时自动缩小字号
- [x] 水印条升级（靛蓝配色）
- [x] 修复 TS6196 构建错误（移除未使用的 ColorStat 导入）

## 待办任务

- [ ] CSV 导出（生成并下载统计表）
- [ ] 优化大尺寸（128×128+）生成性能（Web Worker 或分批处理）
- [ ] PDF 导出（jsPDF）
- [ ] Excel 导出（xlsx）
