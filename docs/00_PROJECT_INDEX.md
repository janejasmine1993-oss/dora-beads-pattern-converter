# 项目总索引

## 项目目标

将用户上传的图片转换成拼豆图纸，支持多品牌色卡匹配、豆量统计和多格式导出。

## 当前版本

v0.2.5

## 当前阶段

部署就绪阶段

## 重要文件位置

| 文件 | 说明 |
|------|------|
| `README.md` | 项目说明、启动方式 |
| `VERSION.md` | 当前版本号 |
| `CHANGELOG.md` | 变更记录 |
| `src/App.tsx` | 应用入口，组装三栏布局 |
| `src/components/` | UI 组件目录 |
| `src/data/palettes/` | 品牌色卡 JSON 数据 |
| `src/lib/image/` | 图片处理逻辑 |
| `src/lib/export/` | 导出逻辑 |
| `src/lib/utils/` | 工具函数 |
| `src/types/` | TypeScript 类型定义 |

## 文档说明

| 文档 | 说明 |
|------|------|
| `docs/00_PROJECT_INDEX.md` | 本文件，项目总索引 |
| `docs/01_REQUIREMENTS.md` | 完整需求文档 |
| `docs/02_MVP_SCOPE.md` | 当前阶段范围控制 |
| `docs/03_ARCHITECTURE.md` | 技术架构文档 |
| `docs/04_TASKS.md` | 任务清单 |
| `docs/05_PALETTE_DATA_SPEC.md` | 色卡数据规范 |
| `docs/06_EXPORT_SPEC.md` | 导出规范 |
| `docs/07_TEST_CHECKLIST.md` | 测试清单 |
| `docs/08_DECISION_LOG.md` | 决策记录 |
| `docs/09_PROMPT_LOG.md` | AI 提示词记录 |
| `docs/10_KNOWN_ISSUES.md` | 已知问题 |
| `docs/11_DEPLOYMENT.md` | 部署说明（Vercel / Netlify）|

## 开发顺序

1. ✅ 项目初始化 + 文档体系
2. ✅ 三栏 UI 骨架
3. ✅ 上传区域 + 尺寸设置
4. ✅ 预览 Tab 占位
5. ✅ 右侧面板占位
6. ✅ 示例色卡数据
7. ✅ 图像像素化算法（resize + pixelate）
8. ✅ 拼豆网格图生成（Canvas drawGridTab）
9. ✅ 色号匹配算法（Lab + Delta-E 76）
10. ✅ 豆量统计（computeColorStats）
11. ✅ PNG 导出（格子图 + 色号图，高清含水印）
12. ⬜ 上线部署（需用户操作 GitHub + Vercel）
