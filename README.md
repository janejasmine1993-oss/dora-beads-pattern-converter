# 哆啦拼豆图纸转换器 (dora-beads-pattern-converter)

**当前版本：v0.4.3** | **线上地址：[dora-beads-pattern-converter.pages.dev](https://dora-beads-pattern-converter.pages.dev)**

## 项目简介

网页版拼豆图纸转换器，将用户上传的图片转换成指定尺寸的拼豆图纸。

核心流程：
```
上传图片 → 设置图纸尺寸 → 生成像素图 → 生成拼豆网格图 → 匹配品牌色号 → 统计豆量 → 导出文件
```

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Canvas API

## 如何安装

```bash
npm install
```

## 如何启动（本地开发）

```bash
npm run dev
```

访问 http://localhost:5173（**仅本机可用**，不是公网地址）

## 线上地址

**https://dora-beads-pattern-converter.pages.dev**（Cloudflare Pages）

本地开发地址 `http://localhost:5173` 只在当前电脑上可用，不是公网地址。

部署说明详见 [docs/11_DEPLOYMENT.md](docs/11_DEPLOYMENT.md)。

## 当前已完成功能

- 三栏页面布局
- 图片上传（点击 + 拖拽，JPG / PNG / WEBP）
- 图纸尺寸选择（6 个常用尺寸 + 自定义宽高）
- 成品尺寸自动计算（每颗豆子 2.6mm）
- **图片像素化**：缩放至目标格数，提取每格 RGBA
- **Lab + Delta-E 76 色号匹配**：将每格颜色匹配至最近品牌色
- **Canvas 像素图预览**（硬边，无插值）
- **Canvas 格子图预览**（品牌色 + 网格线）
- **Canvas 色号图预览**（含 A1/A2 短编号标注）
- **Canvas 统计图预览**（色彩分布可视化）
- 右侧完整豆量统计（色号明细、含损耗备货量、克数）
- 切换品牌后自动重新匹配色号
- 5 个品牌示例色卡数据（MARD / COCO / 漫漫 / 盼盼 / 咪小窝）
- **导出格子图 PNG**（高清，含水印，自动命名）
- **导出色号图 PNG**（高清，含短编号标注）

## 当前未完成功能

- PDF 导出
- Excel / CSV 导出
- 色号量化（控制最大色号数）
- 自动去背景（预留接口）
- AI 风格化（预留接口）
- 小图改大 AI 超分（预留接口）
- 真实品牌色卡数据（当前为示例数据）

## 常用命令

```bash
npm run dev      # 开发模式启动
npm run build    # 生产构建（输出到 dist/）
npm run preview  # 预览生产构建
npm run lint     # 代码检查
```
