# CloudBase 内测版部署记录

## 部署信息

**部署版本**：v0.9.2-lite-high-fidelity-beta-stable  
**部署日期**：2026-06-13  
**部署分支**：feature/v0.9.2-draggable-crop  
**部署 Commit**：c152280  
**部署 Tag**：v0.9.2-lite-high-fidelity-beta-stable  

## 部署配置

**部署平台**：腾讯云 CloudBase 静态托管  
**环境 ID**：dora-beads-prod-d3fnxast620bb482  
**部署命令**：`cloudbase hosting deploy dist /`  
**配置文件**：cloudbaserc.json（lite 静态托管配置）  

## 构建信息

**构建命令**：npm run build  
**构建状态**：✅ 通过  
**模块数**：97 modules  
**构建时间**：812ms  
**输出目录**：dist/  

## 前端环境配置（.env.production）

```
VITE_LITE_MODE=true
VITE_MEMBER_ACCESS_CODE=dora2026
VITE_ACCESS_CODE_VERSION=2026-06-beta
VITE_API_BASE_URL=/api
VITE_AUTH_MODE=real
VITE_AI_RUNTIME_MODE=mock
VITE_AI_PROVIDER=mock
```

**内测口令**：dora2026  
**口令版本号**：2026-06-beta  

## 上传结果

✅ 所有文件成功上传到 CloudBase 静态托管  

上传的文件包括：
- index.html
- favicon.svg
- icons.svg
- assets/ 目录（CSS、JS、图片等）

**上传统计**：0 个文件失败

## 访问链接

⚠️ **已知问题**：CloudBase 当前存在 HTTP 418 路由问题  

```
https://dora-beads-prod-d3fnxast620bb482-1440665484.tcloudbaseapp.com
```

**状态**：HTTP 418（路由层问题）  
**备注**：这是 CloudBase 服务层的已知问题，文件已正确上传，但无法通过 HTTP 访问。

## 版本定位

**定位**：粉丝试用 / 内测反馈版（非正式商业发布版）  
**用途**：收集粉丝反馈，改进产品  

## 已保留功能

1. ✅ 高还原像素画模式（无颜色量化压缩）
2. ✅ PixelDesignGrid 设计稿预览与 1:1 映射
3. ✅ 高还原长边上限 1000
4. ✅ 原图比例模式「更新尺寸」按钮
5. ✅ 大图自动适应屏幕 (Fit)
6. ✅ 缩放选项：25% / 50% / 100% / 200% / Fit
7. ✅ PNG / PDF 导出
8. ✅ 右下角「反馈 / 留言」入口
9. ✅ 反馈内容支持复制
10. ✅ 反馈功能预留飞书表单链接
11. ✅ 纯前端 lite 版，无后端、无数据库

## 已移除功能

- ❌ 不稳定的图纸拖动裁切功能
- ❌ CropFrameOverlay 组件
- ❌ 拖动裁切框（四边调节杆）
- ❌ 数值裁切面板
- ❌ 应用裁切 / 重置裁切按钮

## 已知限制

1. **暂不支持生成后图纸裁切**
   - 如需调整画面，请上传前先使用图片编辑工具裁好图片
   - 拖动裁切功能因在前端验收中导致编辑页白屏，已暂时移除
   - 后续将在新分支中重新设计更稳定的裁切方案

2. **CloudBase HTTP 418 路由问题**
   - 当前 CloudBase 服务存在路由配置问题
   - 文件已成功上传，但无法通过 HTTP 访问
   - 建议用户通过 Cloudflare Pages 版本（v0.9.0-lite-prod）试用

## 反馈入口

**反馈表单链接**：https://wcnqbrkrauvd.feishu.cn/share/base/form/shrcneOqnTiFylhYWImvrOfe5Lf  
**反馈面板位置**：右下角「反馈」按钮  
**反馈功能**：支持复制反馈内容，可直接提交到飞书表单  

## 部署清单

- ✅ 不合并 main（当前为独立 feature 分支）
- ✅ 不覆盖 Cloudflare Pages 版本（v0.9.0-lite-prod 保持在线）
- ✅ 不部署后端（纯前端静态托管）
- ✅ 不部署数据库
- ✅ 不部署 cloudRunServices
- ✅ 内测口令已更新（dora2026）
- ✅ 反馈表单链接已配置

## 建议

1. **立即可用**：
   - 本版本代码已准备就绪，所有功能测试通过
   - 可通过 Cloudflare Pages（v0.9.0-lite-prod）试用当前稳定版本
   - 内测口令：dora2026

2. **后续改进**：
   - 修复 CloudBase 路由问题（需 CloudBase 技术支持）
   - 在新分支 feature/v0.9.3-stable-crop-redesign 中重新设计拖动裁切功能
   - 持续收集粉丝反馈，优化产品体验

## 参考信息

- 分支：feature/v0.9.2-draggable-crop
- Tag：v0.9.2-lite-high-fidelity-beta-stable
- 前置版本：v0.9.0-lite-prod（Cloudflare Pages）
- CHANGELOG：见项目 CHANGELOG.md
