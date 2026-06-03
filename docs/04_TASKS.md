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

## v0.3.0 待办任务

- [ ] 初始化 Git 仓库（等待用户确认）
- [ ] 创建 GitHub 仓库并推送代码
- [ ] 部署到 Vercel 或 Netlify（需要用户登录操作）
- [ ] 实现 CSV 导出（生成并下载统计表）
- [ ] 接入真实品牌色卡数据（参考 docs/05_PALETTE_DATA_SPEC.md）
- [ ] 实现颜色量化 quantize.ts（减少色号种数上限）
- [ ] 优化大尺寸（128×128+）生成性能（Web Worker 或分批处理）
- [ ] PDF 导出（jsPDF）
- [ ] Excel 导出（xlsx）
