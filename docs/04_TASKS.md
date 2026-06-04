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

## v0.4.2 任务（已完成）

- [x] 键盘快捷键：Ctrl/⌘+Z 撤销，Ctrl/⌘+Y / Ctrl/⌘+⇧Z 重做，+/− 缩放
- [x] 色号标注显示开关（showCellCodes，默认显示，CS≥8 即显示）
- [x] 工具栏快捷键提示（撤销/重做旁 + 缩放旁）
- [x] 修复：色板搜索显示全品牌色（不受 usedCodes 过滤）
- [x] 修复：色板默认 showAll=true 显示全品牌色卡
- [x] 修复：移除 hover 菜单，改为工具栏显式操作按钮
- [x] 修复：吸色器不再自动高亮

## v0.4.1 任务（已完成）

- [x] 上传后自动弹出裁剪框
- [x] 裁剪框 9 种比例预设（含"自由"和"原比例"）
- [x] 比例锁定：拖动右下角时保持像素宽高比
- [x] 翻转后自动重新生成（generatePatternFromUrl 解耦）
- [x] 编辑入口移至预览区右上角绝对定位按钮
- [x] 吸色后自动切换到画笔工具
- [x] 状态分离：activeColor（画笔）与 pickedSourceColor（替换来源）独立
- [x] 颜色替换确认弹窗（来源→目标，全图/选区范围说明）
- [x] QuickPalette 替换模式横幅 + onSetPickedSource / onRequestReplace 接口

## v0.4.0 任务（已完成）

### A 层：导入前预处理
- [x] 裁剪功能（CropModal，拖拽交互式裁剪框）
- [x] 旋转/翻转（5 种方向，Canvas transform 实现）

### B 层：图纸编辑（P0 全部完成）
- [x] 编辑模式开关（顶部 Header 按钮）
- [x] EditableCanvas（可交互画布，支持全部工具）
- [x] 吸色器（读取品牌色号，同步高亮全图同色）
- [x] 画笔（单格点击/拖拽连续绘制）
- [x] 橡皮（单格/拖拽擦除为透明）
- [x] 填充（BFS 同色联通填充）
- [x] 删除填充（BFS 联通区域擦除）
- [x] 矩形选区（拖拽框选，反选，取消）
- [x] 同色高亮（高亮色 + 其余半透明）
- [x] 颜色替换（快速色板悬停菜单）
- [x] 一键删除某色（快速色板悬停菜单）
- [x] 主体描边（边缘透明格填充当前色）
- [x] 撤销/重做（50 步历史栈）
- [x] 缩放 1×~4×
- [x] 快速色板（QuickPalette，搜索、已用色过滤）
- [x] 编辑后统计实时同步（patternData 每次编辑全量更新）

### P1（已知未完成）
- [ ] 一键去背景（AI 抠图）
- [ ] 填充 Lab Delta-E 阈值模式
- [ ] 项目状态本地保存

## v0.3.6 任务（已完成）

- [x] 格子区新增极淡斜向水印（方案 B，`globalAlpha=0.055`，clipped 到格子范围）
- [x] 底部水印条文字透明度提升至 80%，改为 bold
- [x] 删除 26 格蓝色分区线
- [x] 10 格粗线改为中性深灰 `rgba(30,30,30,0.32)`，1.6px
- [x] 透明格子去除棋盘格填充，仅保留白底 + 网格线

## v0.3.5 任务（已完成）

- [x] 专业 PNG 加 `EXPORT_SCALE = 2`，物理画布翻倍，`ctx.scale(2,2)` 统一缩放
- [x] 格子内色号字体栈改为 `Consolas, Menlo, Monaco, "Courier New", monospace`
- [x] 预览 Canvas 加 devicePixelRatio 缩放（上限 2×），CSS 尺寸锁定为逻辑尺寸
- [x] `drawStatsTab` 传逻辑尺寸修复统计图在 HiDPI 下的布局

## v0.3.4 任务（已完成）

- [x] 新增图纸名称输入框（SettingsPanel，上传后自动从文件名提取默认值）
- [x] 新增左右镜像功能（ExportPanel 镜像开关，预览与导出同步）
- [x] 镜像只改变格子 x 映射，所有文字保持正常可读方向
- [x] 专业 PNG 左上角固定显示"哆啦拼豆图纸"，第二行显示色卡系列名
- [x] 专业 PNG 右上角显示图纸名称，开启镜像时追加 `[镜像]`，过长标题自动截断
- [x] 统计面板新增图纸名称和镜像状态显示
- [x] 10 格粗分区线加深（`rgba(80,8,8,0.36)`, 1.8px）
- [x] 四周坐标标尺改为酒红色（`#8A1538`）
- [x] 外边框改为酒红色
- [x] 全局字体升级为系统字体栈（PingFang SC / Microsoft YaHei 等）
- [x] 文件名包含图纸名称和镜像标记
- [x] 简洁模式导出同步支持镜像
- [x] 更新 docs/06_EXPORT_SPEC.md

## 待办任务

- [ ] CSV 导出（生成并下载统计表）
- [ ] 优化大尺寸（128×128+）生成性能（Web Worker 或分批处理）
- [ ] PDF 导出（jsPDF）
- [ ] Excel 导出（xlsx）
