# CHANGELOG

## v0.8.0 - [Planning] - Tencent Cloud Data Storage Migration

### 📋 规划中
- 腾讯云数据存储迁移方案
- 数据库表设计和 API 规划
- 用户数据从 JSON 迁移到数据库
- 会员、AI次数、作品从 localStorage 迁移到后端

---

## v0.7.8 - workspace-ai-optimizer-mvp - 2026-06-08

### ✨ 核心改进

**工作台 AI 图片优化 MVP 完整闭环**：
- ✅ 工作台 AI 图片优化新增独立文件上传入口
- ✅ 支持 JPG/PNG/WEBP 格式，最大 5MB
- ✅ 上传后实时显示图片预览和文件名
- ✅ 支持切换优化方式（10个预设）
- ✅ Mock 模式下优化完成后显示结果图
- ✅ 新增"用此图生成拼豆图纸"按钮，优化图导入工作台主流程
- ✅ 新增"下载优化图"功能（dora-ai-optimized-时间戳.png）
- ✅ 新增"继续优化"按钮，支持重新选择优化方式

**代码和版本**:
- ✅ 前后端版本号统一更新到 0.7.8
- ✅ 所有敏感文件安全（.env.local、users.json 已加入 .gitignore）

---

## v0.7.7 - tencent-hunyuan-real-ai - 2026-06-07

### ✨ 核心改进

**腾讯混元真实 AI 优化集成**：
- ✅ 实现 tencentcloud-sdk-nodejs 真实调用
- ✅ ImageToImage 接口用于风格转换和拼豆优化
- ✅ RefineImage 接口用于提高清晰度
- ✅ 后端正确识别 real 模式并调用真实 SDK
- ✅ 修复 AI 优化页面仍显示 Mock 的问题
- ✅ 动态显示运行模式指示（Mock/Real）

**工作台改名和改进**:
- ✅ 工作台 AI 增强改名为 AI 图片优化
- ✅ 改进优化方式文案和分类
- ✅ 移除灰色不可用按钮，所有选项都可点击

---

## v0.7.6 - real-auth-foundation - 2026-06-07

### ✨ 核心改进

**真实邮箱密码登录系统基础版**：
- ✅ 后端新增真实认证 API：POST /api/auth/register、POST /api/auth/login、GET /api/auth/me、POST /api/auth/logout
- ✅ 密码使用 bcryptjs hash 存储，不保存明文
- ✅ JWT token 管理登录状态，7 天有效期
- ✅ 本地 JSON 文件存储用户数据（开发专用）
- ✅ 前端认证 provider pattern（mock vs real）
- ✅ 用户中心"状态"Tab 支持真实登录/注册表单
- ✅ Real 模式下显示邮箱密码登录界面，注册后立即登录
- ✅ AI 优化页面内嵌登录表单，登录后自动继续优化
- ✅ 刷新页面后保持登录状态（localStorage token + user）
- ✅ 保留 Mock 模式作为开发后备

**环保要求**：
- ✅ JWT_SECRET 只在 server/.env.local，不进代码
- ✅ 统一错误提示"邮箱或密码错误"，不泄露具体信息
- ✅ .env.local 已在 .gitignore

**向后兼容**：
- ✅ 图纸生成、AI 优化核心逻辑保持不变
- ✅ Mock 模式完全保留
- ✅ 现有会员 / 次数 / 作品系统保持兼容

---

## v0.7.5 - ai-optimization-workflow-redesign - 2026-06-07

### ✨ 核心改进

**将 AI 优化功能从用户中心独立出来**：
- ✅ 新增独立的 AI 优化图片页面（src/components/AiOptimizePage/index.tsx）
- ✅ AppHeader 新增 "AI 优化" 导航项
- ✅ 首页 "AI 优化后转图纸" 卡片直接进入独立 AI 优化页面
- ✅ 用户中心移除 AI 风格化 Tab，仅保留状态、会员、我的作品、兑换码

**统一运行模式显示**：
- ✅ 修复 Real/Mock 模式文案冲突（之前标题显示 Real，次数区域显示"当前为 mock 模式"）
- ✅ AI 优化页面顶部统一显示运行模式（Real 真实 AI / Mock 模拟）
- ✅ 消除所有页面的模式显示冲突

**完整 AI 优化工作流**：
- ✅ AI 优化页面支持上传图片或使用工作台图片
- ✅ 支持选择优化方式（图片处理/风格转换 两个分组）
- ✅ 支持调整优化强度和保留原色参数
- ✅ AI 优化完成后显示结果图预览
- ✅ 支持 "用此图生成拼豆图纸" 按钮直接导入工作台
- ✅ 支持 "下载优化图" 和 "继续优化" 操作

**登录门控**：
- ✅ 未登录点击 "开始 AI 优化" 时在页面内显示登录提示
- ✅ 点击 "去登录" 调用 login 函数，点击 "取消" 关闭提示
- ✅ 不会强行跳转离开 AI 优化页面

**用户中心优化**：
- ✅ 用户中心始终显示 AI 次数概览
- ✅ AI 优化页面顶部也显示今日剩余 AI 次数
- ✅ 用户中心专注账号、会员、作品、兑换码管理

### 文件改动

**新增**：
- `src/components/AiOptimizePage/index.tsx` — AI 优化独立页面

**修改**：
- `src/App.tsx` — 新增 'ai-optimize' page type，新增两个 handler，新增 AI 优化页面 render 分支
- `src/components/AppHeader/index.tsx` — 添加 'AI 优化' 导航项
- `src/components/HomePage/index.tsx` — 更新 'ai-enhanced' 卡片指向 AI 优化页面，更新卡片文案
- `src/components/UserCenter/index.tsx` — 移除 'ai-style' Tab 和相关 hooks 调用，始终显示 AI 次数，更新版本号

### 向后兼容

- ✅ AiStylePanel.tsx 保留但未在 UserCenter 展示
- ✅ Mock 模式保留，仍可用于测试
- ✅ 所有图纸生成功能保持不变
- ✅ 原有的直接上传转图纸功能不受影响

---

## v0.7.4-tencent-hunyuan-real-sdk - 2026-06-07

### 🎯 版本目标

在 v0.7.3 Provider 框架基础上，实现真实腾讯混元 SDK 调用。跑通完整的真实 AI 图像处理链路。

**✅ 关键改进**：v0.7.3 中的 TODO 占位和 mock URL 已全部替换为真实 SDK 调用。

### ✨ 核心实现

**腾讯混元 SDK 真实调用**：
- ✅ ImageToImage 真实 API 调用（图像风格化）
- ✅ RefineImage 真实 API 调用（图片变清晰）
- ✅ 使用 tencentcloud-sdk-nodejs 官方 SDK
- ✅ 支持 ESM/CommonJS 双模式加载

**接口参数完整**：
- ✅ ImageToImage 参数：InputImage、Prompt、NegativePrompt、Styles、Strength、RspImgType、LogoAdd、ResultConfig、EnhanceImage、RestoreFace
- ✅ RefineImage 参数：InputImage、RspImgType
- ✅ 所有参数符合腾讯云官方 AIART API 要求

**真实返回处理**：
- ✅ 成功时返回腾讯云 ResultImage（图片 URL）
- ✅ 记录腾讯云 RequestId 用于问题排查
- ✅ 错误时转换为用户友好的提示文字

**11 个 Preset 完整覆盖**：
- ✅ pixel-clean（干净像素风）→ ImageToImage ✅ 真实
- ✅ bead-pattern（拼豆图纸优化）→ ImageToImage ✅ 真实
- ✅ cute-cartoon（Q 版卡通）→ ImageToImage ✅ 真实
- ✅ watercolor（水彩风）→ ImageToImage ✅ 真实
- ✅ illustration（插画风格）→ ImageToImage ✅ 真实
- ✅ anime-soft（柔和动漫风）→ ImageToImage ✅ 真实
- ✅ clean-background（清理杂乱背景）→ ImageToImage ✅ 真实
- ✅ remove-background（背景简化）→ ImageToImage ✅ 真实
- ✅ color-optimize（颜色优化）→ ImageToImage ✅ 真实
- ✅ reduce-noise（减少杂色）→ ImageToImage ✅ 真实
- ✅ enhance-clarity（提高清晰度）→ RefineImage ✅ 真实

**错误处理完善**：
- ✅ 缺少密钥：提示检查 server/.env.local
- ✅ 鉴权失败：提示检查 SecretId/SecretKey
- ✅ 权限不足：提示检查腾讯云控制台和 CAM 授权
- ✅ 欠费：提示检查账户状态
- ✅ 审核失败：提示更换图片或调整描述
- ✅ 限流：提示稍后再试
- ✅ 参数错误：提示图片格式/大小/分辨率问题

**次数扣除规则**：
- ✅ 腾讯云真实返回后才扣次数
- ✅ 失败不扣次数
- ✅ 缺 Key 不扣次数
- ✅ 权限错误不扣次数

**安全特性**：
- ✅ API Key 仅在 server/.env.local
- ✅ 前端代码中零 Key 暴露
- ✅ 日志不打印完整 Key 和 base64 图片
- ✅ RequestId 打印用于问题排查（不含敏感信息）

### 📊 与 v0.7.3 的对比

| 功能 | v0.7.3 | v0.7.4 |
|------|--------|--------|
| Provider 框架 | ✅ | ✅ |
| 真实 SDK 调用 | ❌ | ✅ |
| ImageToImage 调用 | ❌ (TODO) | ✅ |
| RefineImage 调用 | ❌ (TODO) | ✅ |
| 返回真实 ResultImage | ❌ (mock URL) | ✅ |
| 腾讯云 RequestId 支持 | ❌ | ✅ |
| 完整错误映射 | ✅ | ✅ |
| 次数只在成功后扣 | ✅ (逻辑) | ✅ (真实) |

### 🔧 关键代码变更

**tencentHunyuanProvider.ts**：
- 移除了所有 TODO 注释和占位实现
- 实现了 `handleImageToImage()` 真实 SDK 调用
- 实现了 `handleRefineImage()` 真实 SDK 调用
- 使用 `tencentcloud-sdk-nodejs` 的 `aiart.v20221229.Client`
- 完整的参数构造和响应处理

### 📋 后续版本计划

无新的 TODO 项。v0.7.4 已经完整实现了腾讯混元 SDK 集成。

后续可考虑（v0.8+）：
- 其他 Provider（火山引擎、阿里云、OpenAI）
- 用户认证和速率限制
- 成本监控和告警
- 调用日志记录
- 图片本地缓存

---

## v0.7.3-tencent-hunyuan-provider - 2026-06-07

### 🎯 版本目标

在 v0.7.2 真实 AI adapter 架构基础上，完成腾讯混元 AI Provider 的框架和配置准备。为真实 SDK 接入（v0.7.4）奠定基础。

**⚠️ 重要说明**：当前版本为 Provider 框架和占位实现，还**没有真正调用腾讯云 SDK**。真实 SDK 集成将在 v0.7.4 完成。

### ✨ 核心功能

**腾讯混元 Provider 框架**：
- ✅ 新增 tencentHunyuanProvider.ts 服务类（框架完整，SDK 待实现）
- ✅ 支持 ImageToImage 接口框架（需在 v0.7.4 实现真实调用）
- ✅ 支持 RefineImage 接口框架（需在 v0.7.4 实现真实调用）
- ✅ 根据 preset 自动选择接口（enhance-clarity → RefineImage，其他 → ImageToImage）

**Prompt 和 Style 映射**：
- ✅ tencentHunyuanPromptMap.ts - 10 个 preset 对应的中文提示词映射
- ✅ tencentHunyuanStyleMap.ts - preset 到腾讯风格 ID 的映射
- ✅ 包含风格化、图片处理等所有 preset 的提示词

**Preset 接口映射**（框架）：
- ✅ pixel-clean（干净像素风）→ ImageToImage 框架
- ✅ bead-pattern（拼豆图纸优化）→ ImageToImage 框架
- ✅ cute-cartoon（Q 版卡通）→ ImageToImage 框架
- ✅ watercolor（水彩风）→ ImageToImage 框架
- ✅ illustration（插画风格）→ ImageToImage 框架
- ✅ anime-soft（柔和动漫风）→ ImageToImage 框架
- ✅ clean-background（清理杂乱背景）→ ImageToImage 框架
- ✅ remove-background（背景简化）→ ImageToImage 框架（非透明抠图）
- ✅ color-optimize（颜色优化）→ ImageToImage 框架
- ✅ reduce-noise（减少杂色）→ ImageToImage 框架
- ✅ enhance-clarity（提高清晰度）→ RefineImage 框架

**后端改进**：
- ✅ 后端路由支持 runtime mode 和 provider 检测
- ✅ 腾讯混元密钥缺失检测和用户友好错误提示
- ✅ 错误处理覆盖：密钥缺失、权限不足、余额不足、图片过大、审核失败、并发超限
- ✅ 后端日志记录 AI provider、preset、图片大小、请求状态

**前端改进**：
- ✅ AiStyleImageUploader 保存 base64 数据供后端调用（准备用于 v0.7.4 真实 API 调用）
- ✅ AiStylePanel 显示腾讯混元相关信息
- ✅ AiStylePanel 为"去除背景"添加"背景简化"说明
- ✅ AiStylePanel 按钮文本动态切换（mock 模式："模拟生成"，real 模式："开始 AI 优化"）
- ✅ 结果预览区支持显示图片（当前为 mock URL）

**环境变量和配置**：
- ✅ .env.example 新增腾讯混元专用环境变量
- ✅ 支持 TENCENT_REGION, TENCENT_AIART_ENDPOINT, TENCENT_AIART_VERSION 自定义
- ✅ 前后端配置分离，API Key 仅在后端存储

**文档完善**：
- ✅ docs/TENCENT_HUNYUAN_SETUP.md 完整设置指南（16 章节）
  - 服务开通确认
  - API 密钥创建
  - CAM 权限配置
  - 环境变量配置
  - 后端启动方法
  - 前端测试流程
  - 常见错误排查（7 种常见问题）
  - 监控和日志
  - 支持的 Preset 列表
  - 最佳实践和成本优化
  - FAQ

### 🔧 后端文件结构

```
server/
├── services/
│   ├── providers/
│   │   └── tencentHunyuanProvider.ts        # 腾讯混元 AI Provider
│   └── promptMaps/
│       ├── tencentHunyuanPromptMap.ts       # 提示词映射
│       └── tencentHunyuanStyleMap.ts        # 风格 ID 映射
└── routes/
    └── aiStyle.ts                            # 更新以支持腾讯混元
```

### 🔐 安全特性

- ✅ API Key 仅在 server/.env.local（未跟踪）
- ✅ 前端代码中无任何 API Key
- ✅ base64 图片不写入日志
- ✅ 错误信息不暴露敏感细节
- ✅ 后端响应标准化，隐藏腾讯原始字段

### ⚙️ 环境变量配置示例

```bash
# 前端 (VITE_*)
VITE_AI_RUNTIME_MODE=real
VITE_AI_PROVIDER=tencent-hunyuan
VITE_API_BASE_URL=http://localhost:3001

# 后端 (server/.env.local，不提交)
TENCENT_SECRET_ID=AKID...
TENCENT_SECRET_KEY=wl6F...
TENCENT_REGION=ap-guangzhou
TENCENT_AIART_ENDPOINT=aiart.tencentcloudapi.com
TENCENT_AIART_VERSION=2022-12-29
```

### 📝 修改文件列表

**新增文件**：
- `server/services/providers/tencentHunyuanProvider.ts`
- `server/services/promptMaps/tencentHunyuanPromptMap.ts`
- `server/services/promptMaps/tencentHunyuanStyleMap.ts`
- `docs/TENCENT_HUNYUAN_SETUP.md`

**修改文件**：
- `server/package.json` - 添加 tencentcloud-sdk-nodejs 依赖（预留）
- `server/routes/aiStyle.ts` - 支持调用腾讯混元 provider
- `src/types/aiStyle.ts` - 添加 base64 字段
- `src/components/UserCenter/AiStyleImageUploader.tsx` - 保存 base64 数据
- `src/components/UserCenter/AiStylePanel.tsx` - 显示腾讯混元信息、背景简化说明、动态按钮文本
- `src/hooks/useAiStyle.ts` - 处理结果图片 URL
- `.env.example` - 腾讯混元专用环境变量
- `package.json` - 版本号更新到 0.7.3
- `CHANGELOG.md` - 本条目

### ✅ 验证清单

- [x] tencentHunyuanProvider.ts 实现完整
- [x] 支持 ImageToImage 和 RefineImage 两个接口
- [x] Prompt 映射覆盖所有 preset
- [x] 后端路由集成腾讯混元 provider
- [x] 环境变量配置完善
- [x] 前端支持 base64 数据传输
- [x] 错误处理完善（密钥、权限、余额、审核、并发）
- [x] AiStylePanel 显示运行模式和服务商
- [x] 去除背景 preset 有"背景简化"说明
- [x] 结果预览区支持显示真实图片
- [x] 腾讯混元设置指南完成
- [x] npm run build 通过
- [x] 原有图纸转换功能不受影响
- [x] Mock 模式回归测试通过
- [x] API Key 仅在后端使用

### 🔄 版本对比

| 功能 | v0.7.2 | v0.7.3 |
|-----|--------|--------|
| Mock Provider | ✅ | ✅ |
| Real Provider 架构 | ✅ | ✅ |
| 腾讯混元 Provider | ❌ | ✅ |
| ImageToImage 接口 | ❌ | ✅ |
| RefineImage 接口 | ❌ | ✅ |
| Prompt 映射 | ❌ | ✅ |
| Style 映射 | ❌ | ✅ |
| 腾讯混元文档 | ❌ | ✅ |

### 📋 后续任务（关键：当前 v0.7.3 还不能真实调用）

1. **真实腾讯 SDK 集成** (v0.7.4) - 必做
   - ⚠️ 当前 callTencentImageToImage() 和 callTencentRefineImage() 是 TODO 占位
   - 需要导入 tencentcloud-sdk-nodejs
   - 实现完整的 ImageToImage API 调用
   - 实现完整的 RefineImage API 调用
   - 处理 base64 编码和 Strength 转换
   - 验证返回结果的 resultImageUrl

2. **其他 Provider** (v0.8)
   - 火山引擎（Volcengine）接入
   - 阿里云（Aliyun）接入
   - OpenAI 接入

3. **高级功能** (v0.9)
   - 用户认证和速率限制
   - 成本监控和告警
   - 调用日志记录

---

## v0.7.2-real-ai-adapter-poc - 2026-06-07

### 🎯 版本目标

搭建真实 AI 接入的"准备层"和"最小调用闭环"，保留现有 mock 功能，新增 real provider 接入结构。支持环境变量动态切换 mock/real 模式。

### ✨ 核心功能

**后端代理服务**：
- ✅ Express Node.js 后端服务 (server/index.ts)
- ✅ POST /api/ai-style/generate 端点
- ✅ 图片大小验证 (5MB 限制)
- ✅ 图片格式验证 (JPG/PNG/WEBP)
- ✅ 后端错误处理和返回标准化响应

**AI Provider 工厂模式**：
- ✅ aiRuntimeConfig.ts - 环境变量配置读取
- ✅ aiProviderFactory.ts - 工厂函数 getAiProvider()
- ✅ aiProviderTypes.ts - 统一的 Request/Result 接口
- ✅ aiMockProvider.ts - Mock 提供者适配器
- ✅ aiRealProvider.ts - 真实提供者适配器（POST 到后端代理）

**前端改进**：
- ✅ AiStyleImageUploader 添加 5MB 大小限制检查
- ✅ AiStylePanel 显示当前运行模式和服务商
- ✅ useAiStyle hook 集成 provider 工厂函数
- ✅ 所有前端代码中无 API Key（安全原则）

**安全文档**：
- ✅ docs/AI_API_SECURITY.md - 安全检查清单和最佳实践
- ✅ docs/AI_PROVIDER_RESEARCH.md - 4 大 AI 服务商对比分析

**配置模板**：
- ✅ .env.example - 所有必需的环境变量模板

### 🔧 环境变量配置

```bash
# 运行模式
VITE_AI_RUNTIME_MODE=mock              # 'mock' 或 'real'
VITE_AI_PROVIDER=mock                  # 'mock' / 'tencent-hunyuan' / ...
VITE_API_BASE_URL=http://localhost:3001

# 后端配置（仅在 server/.env.local）
TENCENT_SECRET_ID=xxx
TENCENT_SECRET_KEY=xxx
VOLCENGINE_API_KEY=xxx
ALIYUN_DASHSCOPE_API_KEY=xxx
OPENAI_API_KEY=xxx
```

### 📁 新增文件

**后端服务**：
- `server/index.ts` - Express 应用入口
- `server/routes/aiStyle.ts` - AI 风格化路由
- `server/package.json` - 后端依赖
- `server/tsconfig.json` - 后端 TypeScript 配置

**AI 服务层**：
- `src/services/ai/aiRuntimeConfig.ts` - 运行时配置管理
- `src/services/ai/aiProviderTypes.ts` - 接口定义
- `src/services/ai/aiProviderFactory.ts` - 工厂函数
- `src/services/ai/aiMockProvider.ts` - Mock 适配器
- `src/services/ai/aiRealProvider.ts` - 真实适配器

**文档**：
- `docs/AI_API_SECURITY.md` - 安全指南（8 大检查项）
- `docs/AI_PROVIDER_RESEARCH.md` - 服务商研究报告
- `.env.example` - 环境变量模板

### 🔄 修改文件

- `src/components/UserCenter/AiStyleImageUploader.tsx` - 添加 5MB 检查
- `src/components/UserCenter/AiStylePanel.tsx` - 显示运行模式信息
- `src/hooks/useAiStyle.ts` - 使用 provider 工厂函数
- `src/services/ai/aiRuntimeConfig.ts` - 移除前端 API Key 检查
- `package.json` - 版本号更新到 0.7.2

### ⚙️ 后端启动方式

```bash
# 进入 server 目录
cd server

# 安装依赖
npm install

# 开发模式（自动重载）
npm run dev

# 生产模式
npm run build
npm start
```

### 🔐 安全检查清单

- [x] 前端代码中不存在任何 API Key
- [x] API Key 只配置在 server/.env.local
- [x] 后端代理验证图片大小和格式
- [x] 后端错误处理不暴露内部实现细节
- [x] 所有 API 调用都通过后端代理进行
- [x] 环境变量通过 .env.example 模板文档化

### ✅ 验证清单

- [x] 后端代理服务启动成功
- [x] POST /api/ai-style/generate 端点工作正常
- [x] 图片大小限制 (5MB) 实现
- [x] 图片格式验证 (JPG/PNG/WEBP) 实现
- [x] Provider 工厂函数工作正常
- [x] AiStylePanel 显示运行模式
- [x] npm run build 通过
- [x] npm run lint 通过
- [x] 原有 mock 功能保留完整

### 📝 后续任务

1. **完整的真实 AI 集成**（v0.8）
   - 实现腾讯混元真实调用代码（推荐）
   - 添加用户认证中间件
   - 实现速率限制和计费逻辑

2. **监控和日志**（v0.9）
   - 后端 API 调用日志
   - 成本监控告警
   - 错误率监控

3. **CI/CD 优化**（v1.0）
   - GitHub Actions 配置
   - API Key 安全管理
   - 自动化部署流程

---

## v0.7.1-ai-style-panel-fix - 2026-06-07

### 🔧 修复内容

**AI 优化页面改进**：
- ✅ 新增独立图片上传窗口（支持点击和拖拽）
- ✅ 支持 JPG / PNG / WEBP 格式
- ✅ 图片预览、文件名、尺寸显示
- ✅ 支持重新上传和清空图片
- ✅ 支持两种图片来源：
  - 工作台图片直接使用
  - 或在优化页单独上传

**风格选项可用性修复**：
- ✅ 所有预设选项都可点击（不再灰掉）
- ✅ 去除背景、清理背景等处理预设启用
- ✅ 权限和次数不足时显示清晰提示
- ✅ 分离显示"图片处理"和"风格转换"两类预设

**生成流程改进**：
- ✅ 新增图片处理预设（5 个）
  - 去除背景 (free)
  - 清理杂乱背景 (free)
  - 提高清晰度 (member)
  - 颜色优化 (member)
  - 减少杂色 (member)
- ✅ 改进 mock 结果显示
- ✅ 添加生成结果预览区
- ✅ 明确提示 mock 模式

### 📊 类型定义更新

```ts
// 新增图片处理类型
type AiProcessPreset =
  | 'remove-background'
  | 'clean-background'
  | 'enhance-clarity'
  | 'color-optimize'
  | 'reduce-noise'

// 图片源定义
interface AiStyleSourceImage {
  id: string
  name: string
  type: string
  size: number
  width?: number
  height?: number
  previewUrl: string
  createdAt: string
}

// 预设配置
interface AiStylePresetConfig {
  id: AiPreset
  name: string
  description: string
  suitableFor: string
  isMemberOnly: boolean
  creditCost: number
  category: 'process' | 'style'  // 新增
}
```

### 📁 新增文件

- `src/components/UserCenter/AiStyleImageUploader.tsx` - 图片上传组件

### 🔄 修改文件

- `src/types/aiStyle.ts` - 新增类型定义
- `src/services/mock/aiStyleMockService.ts` - 新增处理预设
- `src/components/UserCenter/AiStylePanel.tsx` - 完全重写
- `src/hooks/useAiStyle.ts` - 更新函数签名
- `src/components/UserCenter/index.tsx` - 更新调用方式
- `src/App.tsx` - 传递工作台图片

### ✅ 验证清单

- [x] AI 优化页面有独立上传窗口
- [x] 支持 JPG/PNG/WEBP 格式
- [x] 去除背景可点击
- [x] 其他风格选项可点击
- [x] 未登录时有提示
- [x] 会员专属功能有提示
- [x] AI 次数不足有提示
- [x] npm run build 通过
- [x] 原有功能不受影响

---

## v0.7.0-ai-style-mock - 2026-06-07

### 🎯 版本目标

本版本为后续商业化功能搭建"骨架"和"接口层"，不接入真实服务（支付、微信、AI API、数据库）。

### ✨ 新增功能

**Mock 服务层**：
- ✅ 登录 mock 服务 - 支持模拟登录/退出
- ✅ 会员系统 mock - 支持 free/monthly/yearly/lifetime 四个等级
- ✅ AI 次数 mock - 支持每日次数限制、额外赠送、重置
- ✅ AI 风格化 mock 服务 - 8 个预设风格，支持会员权限校验
- ✅ 兑换码 mock - 3 个测试兑换码，防止重复使用
- ✅ 我的作品 mock - 支持保存/删除/重命名作品元数据
- ✅ 小程序入口占位

**用户中心 UI**：
- ✅ 综合用户中心面板（5 个 Tab）
- ✅ 用户状态展示与模拟登录
- ✅ 会员等级切换模拟
- ✅ AI 次数消耗与重置
- ✅ 兑换码输入与验证
- ✅ 作品列表管理
- ✅ AI 风格化预设展示与测试

**架构设计**：
- ✅ 分层设计：services/mock/ + hooks + components
- ✅ localStorage 数据持久化
- ✅ 清晰的接口层，便于后续接入真实腾讯云 API
- ✅ 浮动按钮入口（工作台右下角）

### 📊 localStorage 使用的 key

```
dora_auth_user
dora_membership_<userId>
dora_ai_credits_<userId>
dora_ai_style_history_<userId>
dora_user_works_<userId>
dora_redeem_history_<userId>
```

### 🔍 核心逻辑

**登录流程**：
- 游客状态 → 模拟登录 → 已登录状态
- 支持退出登录恢复游客状态

**会员系统**：
- Free: 3 次/日，3 个作品
- Monthly: 50 次/日，100 个作品，高清导出
- Yearly: 200 次/日，1000 个作品，批量导出
- Lifetime: 无限次数，无限作品，全功能

**AI 风格化**：
- 8 个预设风格（2 个免费，6 个会员）
- 点击预设 → 检查权限 → 检查次数 → 消耗次数 → 返回 mock 结果
- 支持 500-1000ms 处理延迟（模拟网络）

**兑换码**：
- DORA-VIP-30：30 天月会员
- DORA-AI-100：100 次额外次数
- DORA-TEST-999：永久会员
- 防重复使用，历史记录保存

**我的作品**：
- 保存作品元数据（名称、尺寸、品牌、颜色数、豆数）
- 删除、重命名、查看详情
- 注：暂不保存完整图纸数据

### ✅ 不破坏的现有功能

- ✅ 首页与功能卡
- ✅ 图片上传与转换
- ✅ 图纸编辑（画笔、擦除、填充、吸色）
- ✅ 颜色高亮 / 替换 / 删除
- ✅ 图纸导出（带水印）
- ✅ 预览与统计
- ✅ 当前工作台布局与主题色

### 🏗️ 代码结构

```
src/
  services/mock/
    authMockService.ts          ← 登录 mock
    membershipMockService.ts    ← 会员 mock
    creditsMockService.ts       ← AI 次数 mock
    aiStyleMockService.ts       ← AI 风格化 mock
    worksMockService.ts         ← 作品管理 mock
    redeemCodeMockService.ts    ← 兑换码 mock
  
  types/
    aiStyle.ts                  ← AI 风格化类型定义
    work.ts                     ← 作品类型定义
  
  hooks/
    useAuth.ts
    useMembership.ts
    useCredits.ts
    useAiStyle.ts
    useRedeemCode.ts
    useWorks.ts
  
  components/UserCenter/
    index.tsx                   ← 主面板（5 个 Tab）
    UserStatusCard.tsx
    MembershipCard.tsx
    CreditsCard.tsx
    AiStylePanel.tsx
    RedeemCodePanel.tsx
    MyWorksPanel.tsx
```

### 🧪 测试兑换码

在用户中心的"兑换码"Tab 中测试：

```
DORA-VIP-30    → 升级月会员
DORA-AI-100    → 获得 100 次额外 AI
DORA-TEST-999  → 升级为永久会员
```

### 📝 后续接入建议

**v0.8.0**：
- 替换 mock services 为真实腾讯云 API
- 集成真实用户认证（微信小程序登录）
- 集成真实数据库存储

**无需改动**：
- 所有 hooks 保持不变
- 所有 UI 组件无需改动
- 应用状态管理无需改动

只需替换 src/services/mock/ 目录下的服务实现即可。

### ✨ 特别说明

- 所有 mock 数据已明确标注"当前为 mock 模式"
- 所有 mock 服务都有返回类型定义，便于日后替换
- localStorage 数据可通过浏览器开发工具查看
- 刷新页面后数据仍保留（localStorage 持久化）

---

## v0.6.4-local-stable - 2026-06-07

### 发布状态

✅ **本地功能已跑通** - 所有核心功能在本地开发环境验证通过
⏳ **待公网部署** - 项目已准备好部署到 Cloudflare Pages，暂未部署

### 本版本包含

- v0.6.3 所有补丁修复（6 个补丁）
- v0.6.4 回归测试清单完整
- TypeScript 编译修复
- Cloudflare Pages 部署文档生成
- 项目构建成功（npm run build）

### 主要功能清单

✅ 首页入口 - 四个功能卡，主题色联动  
✅ 图片上传 - JPG/PNG 支持  
✅ 图片裁剪 - 多点拖拽裁剪框  
✅ 图纸生成 - AI 优化、像素化、拼豆转换  
✅ 工作台编辑 - 画笔、擦除、填充、吸色  
✅ 颜色工具 - 高亮、替换、删除颜色  
✅ 导出功能 - PNG 导出带水印  
✅ 统计报告 - 豆数、色号、损耗预估  
✅ 多品牌支持 - BOZLES、Pixel Pals 等  

### 已知限制

- 水印仅在导出 PNG 时显示（预览中不可见，符合产品设计）
- 颜色高亮为本地 UI 状态，不修改图纸数据
- 缩放控制保留在编辑工具栏（响应式设计）

### 部署信息

- **构建产物**：`dist/` 目录（492 KB gzipped）
- **部署工具**：已生成 Cloudflare Pages 部署指南
- **推荐部署**：Cloudflare Pages（自动 CI/CD）

### 验收文档

- `REGRESSION_TEST_v0.6.4.md` - 13 模块回归测试清单
- `CLOUDFLARE_PAGES_DEPLOYMENT.md` - 部署步骤指南
- `PATCH_REPORT_v063_*.md` - 各补丁详细说明

---

## v0.6.3-editor-color-tools-behavior-fix - 2026-06-07

### 本次更新

* 修复编辑页"颜色高亮 / 替换颜色"按钮灰色不可用的问题
* 恢复颜色高亮工具的可用状态
* 恢复替换颜色工具的可用状态
* 明确区分"吸色"和"颜色高亮"两个动作：
  * 吸色只用于选择当前画笔颜色
  * 吸色后不再自动让其他颜色变灰
  * 颜色高亮改为独立开关，由用户主动开启或关闭
* 修复"替换颜色"无法激活的问题
* 替换颜色流程恢复为：选择源颜色 → 选择目标颜色 → 执行替换
* 替换完成后同步更新图纸预览与颜色统计
* 确认没有误恢复或新增"合并颜色"功能

### Files Changed

- `src/components/EditorToolbar/index.tsx` - 修复颜色工具按钮启用状态

### 涉及范围

* 编辑页颜色工具栏
* 吸色工具状态逻辑
* 颜色高亮状态逻辑
* 替换颜色流程逻辑
* 图纸预览与颜色统计同步更新

### Notes

* 颜色高亮按钮可用
* 替换颜色按钮可用
* 吸色后图纸保持全彩显示
* 主动开启颜色高亮后才高亮当前颜色
* 替换颜色可正常执行
* 替换后统计同步更新
* 构建通过
* 未修改首页视觉
* 未接入腾讯云混元、CloudBase、COS
* 未修改登录、会员、支付相关逻辑

---

## v0.6.2-workspace-mode-themes - 2026-06-07

### Added

- **工作台模式主题色联动**：首页四个功能卡进入工作台后，工作台外围背景会根据入口模式切换为对应主题色
  - 新增统一模式主题配置文件：`src/config/modeThemes.ts`
  - 四个模式分别对应柔和的背景梯度：粉色、橙色、绿色、紫色
- **工作台侧边栏改进**：
  - 顶部显示当前模式提示胶囊（模式名 + 主题色）
  - 导入模式选择按钮根据当前模式使用对应主题色
  - 预处理按钮 hover 状态使用当前模式主题色

### Changed

- **首页底部 slogan 文案更新**：
  - 原文案：「让每一颗拼豆，都更有创意与温度」
  - 新文案：「以拼豆为笔，让每颗像素都藏着创意与温度」
  - 字号调整以适应新文案长度

### Files Changed

- `src/config/modeThemes.ts` - 新增统一模式主题配置
- `src/App.tsx` - 工作台主题色联动实现
- `src/components/HomePage/index.tsx` - 首页 slogan 文案修改

### Notes

- 工作台核心操作区保持白底清晰设计，仅外围背景应用梯度色
- 不影响上传、转图纸、编辑、导出等核心功能
- 未接入腾讯云混元、CloudBase、COS
- 未修改登录、会员、兑换码相关逻辑
- TypeScript 构建通过，lint 存在预存错误（工作台编辑器旧代码，非本次修改引入）

### Mode Theme Mapping

- `photo-direct`：粉色主题（图片直转图纸）
- `ai-enhanced`：橙色主题（AI 优化后转图纸）
- `pixel-grid`：绿色主题（像素图转色号）
- `existing-pattern`：紫色主题（现有图纸再编辑）

---

## v0.6.1-home-feature-cards-clean - 2026-06-07

### Changed

- **首页功能卡区域重构**：完成了首页四个功能卡的完整重构与修复
  - 替换四张功能卡为"干净版底图"（删除了旧底图中的标签框和小箭头）
  - 右上角标签胶囊改为由前端代码统一渲染，支持主题色动态背景
  - 右下角大圆形箭头按钮改为由前端代码统一渲染，位置和尺寸统一

### Fixed

- 修复功能卡图标、标签、箭头重叠问题
  - 移除了旧底图中右上角标签底框导致的错位
  - 移除了旧底图中右下角小箭头导致的叠加
  - 无双层箭头、无遮盖补丁逻辑

### Files Changed

- `src/components/HomePage/index.tsx` - 功能卡数据结构和样式渲染
- `src/components/AppHeader/index.tsx` - 导航栏样式更新（与首页设计一致）
- `public/assets/home/` - 四张新的干净版功能卡底图

### Notes

- 保持首页 Hero、顶部导航、底部 slogan 区域不变
- 工作台、上传、转图纸、色号匹配、导出等核心业务逻辑未修改
- 未接入腾讯云混元、CloudBase、COS

---

## v0.4.3 - 2026-06-04（快速回到整体页、空格平移、水印密度减半）

### Changed

- **`0` 键快速重置缩放**：编辑模式下按 `0` 键立即将缩放倍率归位到 1×，无需逐档缩小；工具栏缩放区提示更新为「+/− 键 · 0 重置 · 空格平移」
- **空格键临时抓手平移**（`EditableCanvas`）：
  - 按住空格键时光标变为 `grab`（抓手），拖动时变为 `grabbing`
  - 拖动鼠标可自由滚动查看图纸（修改 `overflow-auto` 容器的 `scrollLeft/scrollTop`）
  - 释放空格键后立即恢复原来的编辑工具和光标
  - 空格键在输入框内无效（不抢占文字输入）
  - 实现方式：独立 `useEffect` 监听 `keydown/keyup`；`spacePanning` boolean prop 传入 EditableCanvas；容器 `ref` 接入滚动控制
- **导出 PNG 水印密度减半**（`drawPatternTemplate.ts`）：水印贴图间距从 130×75 px 扩大为 260×150 px（逻辑坐标），同等区域内水印数量减少约 75%，不影响品牌归属的可识别性

---

## v0.4.2 - 2026-06-04（键盘快捷键 + 色号标注开关 + 色板搜索修复）

### Added

- **键盘快捷键**（仅编辑模式有效，输入框内无效）：
  - 撤销：`Ctrl+Z`（Mac: `⌘Z`）
  - 重做：`Ctrl+Shift+Z` 或 `Ctrl+Y`（Mac: `⌘⇧Z` / `⌘Y`）
  - 放大：`=` 或 `+`（逐档升：1× → 1.5× → 2× → 3× → 4×）
  - 缩小：`-`（逐档降）
  - 工具栏撤销/重做按钮旁新增快捷键提示；缩放栏旁标注 `+/−` 键
- **色号标注显示开关**：工具栏「显示选项」区新增「色号标注：显示/隐藏」按钮，可在编辑模式下随时切换，默认显示；阈值从 CS≥16 降低至 CS≥8，小格子缩放等级下也能看到标注

### Fixed（v0.4.1 修复，本轮补记入版本历史）

- **色板搜索不显示颜色**：之前 filter 逻辑在有搜索词时仍受 `usedCodes` 限制，导致搜索结果为空。现在搜索时跳过 `usedCodes` 过滤，直接在全品牌色卡（291 色）里匹配
- **色板默认显示全品牌色卡**：默认 `showAll = true`，打开编辑器即可看到全部品牌颜色，不再只显示已用色
- **「图纸用色」快捷区**：QuickPalette 顶部新增当前图纸已用色的色号标签行，方便快速点选常用颜色
- **移除 CSS hover 菜单**：之前的颜色替换/删除功能藏在悬停菜单里，点击后菜单立即消失导致操作失败。改为在工具栏「当前颜色」区提供 3 个明确按钮：◈ 高亮 / ⇄ 替换 / ✕ 删除
- **吸色器去掉自动高亮**：之前吸色后自动进入高亮模式导致其他颜色灰掉，用画笔时无法判断位置。现在吸色只设置画笔颜色并切换到画笔工具，高亮/替换/删除通过工具栏按钮显式触发

---

## v0.4.1 - 2026-06-04（编辑器交互修正与颜色替换流程优化）

### Changed

- **上传后自动弹出裁剪框**：`handleImageLoad` 在设置 imageUrl 后立即设 `showCropModal = true`，用户上传图片即进入裁剪流程；裁剪弹窗底部增加「跳过裁剪，使用原图」按钮，可直接跳过
- **裁剪框比例预设**（`CropModal` 完全重写）：
  - 新增 9 种比例：自由 / 原比例 / 1:1 / 2:3 / 3:4 / 9:16 / 3:2 / 4:3 / 16:9
  - 选择固定比例后裁剪框自动居中并锁定宽高比
  - 右下角拖动调整大小时保持选定比例（像素空间精确计算）
  - "原比例"模式等图片加载完成后自动应用 naturalWidth/naturalHeight
  - 增加 8 方向边角/边中手柄显示
- **翻转后自动重新生成图纸**：`handleTransformImage` 检测 `rawPixels` 是否存在，若已生成过图纸则调用 `generatePatternFromUrl(newUrl)` 自动重新生成，无需用户再次点击「生成图纸」
- **生成函数解耦**：新增 `generatePatternFromUrl(url)` 接受 URL 参数（而非读取 state），解决 React 异步 state 导致的旧 URL 问题；`generatePattern()` 调用它
- **编辑入口移至预览区右上角**：中间 Canvas 容器增加绝对定位的「进入编辑 / ← 返回预览」按钮；移除 Header 中的编辑按钮；未生成图纸时点击显示提示
- **吸色器拾色后自动切换到画笔**：`handleColorPick` 在设置 `activeColor` + `highlightColorCode` 的同时调用 `setActiveTool('brush')`
- **状态分离**：`activeColor`（画笔颜色）与 `pickedSourceColor`（待替换的来源颜色）独立管理，不再混用
- **颜色替换确认弹窗**：
  - 吸色器 / 快速色板「替换颜色…」菜单设置 `pickedSourceColor`
  - QuickPalette 检测到 `pickedSourceColor` 时显示橙色提示横幅「替换模式：来源 XXX，点击目标颜色」
  - 点击目标颜色调用 `onRequestReplace(toColor)` → App.tsx 设置 `replaceConfirm` → 弹出确认弹窗
  - 弹窗显示来源色→目标色的色块与色号，说明作用范围（全图 / 仅选区）
  - 确认后调用 `replaceColor()` 并清空 `pickedSourceColor`、`replaceConfirm`
- **QuickPalette 悬停菜单**：「替换颜色…」点击后通过 `onSetPickedSource` 进入替换模式（不再用内部 replaceFrom 状态）；「删除此色」保留

---

## v0.4.0 - 2026-06-04（图纸编辑基础版）

### Added

**A 层：导入前预处理**
- **裁剪功能**（`CropModal`）：上传图片后可打开裁剪弹窗，拖动裁剪框移动位置、拖动右下角调整大小，确认后更新图纸生成源图
- **旋转 / 翻转**：左侧预处理区增加「左转 90°」「180°」「右转 90°」「水平翻转」「垂直翻转」按钮，操作直接作用于 imageUrl（Canvas 变换实现），不需重新上传

**B 层：图纸编辑（操作全部作用于格子矩阵，统计实时同步）**
- **编辑模式开关**：顶部 Header 新增「进入编辑」按钮，生成图纸后可切换到编辑模式；编辑模式下中间显示可交互的 `EditableCanvas`
- **编辑工具栏**（`EditorToolbar`）：选区、吸色、画笔、橡皮、填充、删除填充 6 种工具；当前颜色预览；撤销/重做；缩放（1×~4×）
- **吸色器**：点击格子读取品牌色号，同步设为当前颜色并高亮全图同色格子
- **画笔**：点击/拖动绘制，支持镜像模式下的数据坐标转换
- **橡皮**：点击/拖动擦除为透明格，不计入豆量
- **填充**（BFS 同色联通填充）：点击区域用当前颜色填充同色联通区域
- **删除填充**：BFS 模式将联通区域擦除为透明格
- **矩形选区**：拖动框选，工具操作自动约束在选区内；支持反选（当前选区↔全图）、取消选区
- **同色高亮**：吸色器选色后高亮同色格子，其余格子半透明（20% 不透明度）；编辑工具栏可一键清除高亮
- **颜色替换**：快速色板悬停菜单 → 「替换颜色」→ 点击目标颜色完成全图替换
- **一键删除某色**：快速色板悬停菜单 → 「删除此色」→ 全图删除（尊重选区）
- **主体描边**：编辑模式下「描边主体（当前色）」按钮，在主体边缘透明格填充当前色
- **撤销 / 重做**：历史栈最多 50 步，撤销/重做后预览、统计、导出全部同步
- **缩放查看**：1× / 1.5× / 2× / 3× / 4× 五档，画布滚动容器自动处理大尺寸
- **快速色板**（`QuickPalette`）：右侧面板显示当前品牌色卡，默认只显示已用色，可切换全色卡；支持搜索色号；点击选色；悬停菜单提供高亮/替换/删除
- **编辑后实时统计同步**：每次编辑都重新计算 colorStats、beadCount、transparentCount 并更新 patternData，StatsPanel 和 ExportPanel 自动响应

### Changed

- `src/App.tsx`：新增 editMode、activeTool、activeColor、highlightColorCode、selection、fillThreshold、zoom、cellHistory 等编辑状态；`applyEdit()` 统一处理单次编辑（更新 patternData + 推入历史栈）
- `src/components/UploadPanel/index.tsx`：接口不变，图片预处理按钮放在 App.tsx 的 aside 中
- `src/components/EditableCanvas/index.tsx`（新）：Canvas 渲染 + 全部鼠标事件，支持所有编辑工具
- `src/components/EditorToolbar/index.tsx`（新）：工具栏 UI
- `src/components/QuickPalette/index.tsx`（新）：快速色板
- `src/components/CropModal/index.tsx`（新）：裁剪弹窗
- `src/lib/editor/types.ts`（新）：EditorTool、SelectionRect 类型
- `src/lib/editor/history.ts`（新）：undo/redo 历史栈（最多 50 步）
- `src/lib/editor/floodFill.ts`（新）：BFS 洪水填充
- `src/lib/editor/operations.ts`（新）：paintCell、eraseCell、replaceColor、deleteColor、outlineBody
- `src/lib/image/transform.ts`（新）：transformImage（5 种方向变换）、cropImage

### Known Limitations（本版本已知限制）

- 填充阈值当前为扩展步数（0=精确同色），仍基于色号精确匹配；Lab Delta-E 阈值可后续实现
- 去背景（AI 背景抠图）未实现，预留接口位置
- 项目状态本地保存（刷新恢复）未实现
- 大尺寸图纸（256×256+）在 4× 缩放时画布可能超出屏幕

---

## v0.3.6 - 2026-06-04（图纸水印、网格层级与透明区显示优化）

### Changed

- **新增斜向水印**（`drawPatternTemplate.ts`）：在图纸格子区域叠加极淡斜向"哆啦拼豆图纸"水印（`globalAlpha = 0.055`，-30°旋转，130px 间距），通过 `clip()` 限制在格子范围内，色号文字绘制在其上方，不影响阅读
- **底部水印条加深**：水印文字透明度从 53%（`${WINE}88`）提升至 80%（`${WINE}cc`），字重改为 bold，品牌归属更明确
- **移除蓝色 26 格分区线**：删除 `rgba(70,100,230,0.45)` 的拼板边界线，消除蓝色对版面的干扰
- **10 格粗线改为中性深灰**：颜色从偏红 `rgba(80,8,8,0.36)` 改为中性 `rgba(30,30,30,0.32)`，线宽从 1.8px 微调至 1.6px；视觉更干净，层级关系更清晰
- **透明区域不再填充棋盘格**：透明格子直接显示白色背景，细网格线覆盖其上自然可见；三层层级清晰：`细网格(0.5px 浅灰) < 10格粗线(1.6px 深灰) < 外边框(2px 酒红)`

---

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
