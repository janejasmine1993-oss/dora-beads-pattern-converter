# 技术架构文档

## 技术栈

| 技术 | 说明 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Tailwind CSS v4 | 样式 |
| Canvas API | 图像处理与预览渲染 |

## 项目目录结构

```
dora-beads-pattern-converter/
├── public/
├── src/
│   ├── components/
│   │   ├── UploadPanel/        # 左侧上传区域
│   │   ├── SettingsPanel/      # 左侧尺寸设置区域
│   │   ├── PreviewCanvas/      # 中间预览区域
│   │   ├── PalettePanel/       # 右侧品牌色卡选择
│   │   ├── StatsPanel/         # 右侧统计区域
│   │   └── ExportPanel/        # 右侧导出区域
│   ├── data/
│   │   └── palettes/           # 品牌色卡 JSON 数据
│   │       ├── mard.json
│   │       ├── coco.json
│   │       ├── manman.json
│   │       ├── panpan.json
│   │       └── mixiaowo.json
│   ├── lib/
│   │   ├── image/              # 图片处理逻辑
│   │   │   ├── crop.ts
│   │   │   ├── resize.ts
│   │   │   ├── enhance.ts
│   │   │   ├── pixelate.ts
│   │   │   ├── quantize.ts
│   │   │   ├── paletteMatch.ts
│   │   │   ├── mergeColors.ts
│   │   │   └── removeBackground.ts
│   │   ├── export/             # 导出逻辑
│   │   │   ├── exportPng.ts
│   │   │   ├── exportPdf.ts
│   │   │   ├── exportExcel.ts
│   │   │   └── exportCsv.ts
│   │   └── utils/              # 工具函数
│   │       ├── size.ts
│   │       ├── fileName.ts
│   │       └── color.ts
│   ├── types/
│   │   ├── palette.ts
│   │   ├── pattern.ts
│   │   └── export.ts
│   ├── App.tsx                 # 应用入口，组装三栏布局
│   ├── main.tsx
│   └── index.css
├── docs/
├── README.md
├── VERSION.md
└── CHANGELOG.md
```

## 核心模块划分

### 图片处理流程

```
用户上传图片
  → resize.ts 缩放至目标格数（宽×高像素）
  → enhance.ts 可选图像增强
  → pixelate.ts 生成像素化数组 [r,g,b][]
  → quantize.ts 颜色量化（减少颜色数量）
  → paletteMatch.ts 用 Delta-E 算法匹配最近品牌色
  → mergeColors.ts 合并相近色减少色号数
  → 输出 PatternData（每格色号、统计信息）
```

### Canvas 绘制逻辑

```
PatternData
  → PreviewCanvas 根据当前 Tab 绘制：
    - 原图：直接显示上传图片
    - 像素图：Canvas drawImage 缩放后放大
    - 格子图：每格绘制矩形 + 网格线
    - 色号图：每格绘制色号文字
    - 统计图：色块面积可视化
```

### 色卡匹配流程

```
每个像素 [r,g,b]
  → 转换为 Lab 颜色空间
  → 遍历品牌色卡，计算 Delta-E 距离
  → 取距离最小的色号
  → 输出该格的 PaletteColor
```

### 导出逻辑

```
PatternData + Canvas
  → exportPng.ts: Canvas.toDataURL() → 下载
  → exportPdf.ts: 调用 jsPDF（TODO）
  → exportExcel.ts: 调用 xlsx（TODO）
  → exportCsv.ts: 生成 CSV 字符串 → 下载
```

## 后续扩展接口

- `removeBackground.ts`：预留自动去背景接口（TODO）
- `enhance.ts`：预留 AI 超分接口（TODO）
- 云端保存：预留接口，不在 MVP 实现
