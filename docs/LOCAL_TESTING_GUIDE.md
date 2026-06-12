# v0.7.3 本地测试指南

**重要说明**：当前 v0.7.3 中，腾讯混元 provider 还是**框架占位实现**，还没有真实调用腾讯云 SDK。

## 当前状态

| 功能 | 状态 | 说明 |
|------|------|------|
| Provider 框架 | ✅ 完成 | tencentHunyuanProvider.ts 结构完整 |
| Prompt 映射 | ✅ 完成 | 10 个 preset 对应提示词已配置 |
| Style 映射 | ✅ 完成 | Preset 到 Style ID 已映射 |
| 错误处理 | ✅ 完成 | 密钥、权限、余额等错误已处理 |
| 真实 SDK 调用 | ❌ 未完成 | 需要在 v0.7.4 实现 |
| 真实腾讯返回图片 | ❌ 未支持 | 当前返回 mock URL |

## 本地网址

### 前端
```
http://localhost:5173
```

### 后端主服务
```
http://localhost:3001
```

### 健康检查接口

**简单健康检查**
```
GET http://localhost:3001/health
```

返回：
```json
{
  "ok": true,
  "service": "dora-beads-ai-server",
  "version": "0.7.3",
  "timestamp": "2026-06-07T12:00:00.000Z"
}
```

**AI 模块详细检查**
```
GET http://localhost:3001/api/health
```

返回示例（Mock 模式）：
```json
{
  "ok": true,
  "service": "dora-beads-ai-server",
  "version": "0.7.3",
  "ai": {
    "runtimeMode": "mock",
    "provider": "mock",
    "tencentKeysConfigured": false,
    "status": "mock-mode"
  },
  "timestamp": "2026-06-07T12:00:00.000Z"
}
```

返回示例（Real 模式，缺 Key）：
```json
{
  "ok": true,
  "service": "dora-beads-ai-server",
  "version": "0.7.3",
  "ai": {
    "runtimeMode": "real",
    "provider": "tencent-hunyuan",
    "tencentKeysConfigured": false,
    "status": "missing-keys"
  },
  "timestamp": "2026-06-07T12:00:00.000Z"
}
```

返回示例（Real 模式，有 Key，但 SDK 还未实现）：
```json
{
  "ok": true,
  "service": "dora-beads-ai-server",
  "version": "0.7.3",
  "ai": {
    "runtimeMode": "real",
    "provider": "tencent-hunyuan",
    "tencentKeysConfigured": true,
    "status": "ready"  // 注：当前 SDK 未实现，真实调用会返回 mock URL
  },
  "timestamp": "2026-06-07T12:00:00.000Z"
}
```

## 启动命令

### 终端 1：启动后端

```bash
cd /Users/jasmine/Documents/Projects/dora-beads-pattern-converter/server
npm install
npm run dev
```

预期输出：
```
🚀 AI Style Server running at http://localhost:3001
```

### 终端 2：启动前端

```bash
cd /Users/jasmine/Documents/Projects/dora-beads-pattern-converter
npm install
npm run dev
```

预期输出：
```
  VITE v8.0.16  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## 测试场景

### 场景 1：Mock 模式（推荐首先测试）

**配置**

前端 `.env.local`：
```env
VITE_AI_RUNTIME_MODE=mock
VITE_AI_PROVIDER=mock
VITE_API_BASE_URL=http://localhost:3001
```

后端 `server/.env.local`：
```env
AI_RUNTIME_MODE=mock
AI_PROVIDER=mock
```

**测试步骤**

1. 访问 http://localhost:5173
2. 点击左上角"用户"进入用户中心
3. 点击"登录测试面板"→"测试登录"
4. 进入"人工智能优化"选项卡
5. 验证顶部显示：
   ```
   运行模式：📦 Mock（模拟）
   服务商：Mock
   ℹ️ 当前为模拟模式，不会真实消耗 AI 配额
   ```
6. 上传一张 5MB 以内的 JPG/PNG/WEBP 图片
7. 选择"拼豆图纸优化"
8. 点击"模拟生成"
9. 等待 1-2 秒，应显示"生成结果"
10. 验证：
    - 消息显示"✅ AI 风格化 mock 已完成"
    - 结果区显示：优化方式、原图文件、生成时间
    - 当前为 mock 模式，未消耗 AI 配额

**预期结果**

✅ 成功。Mock 模式应完全可用，无错误。

**后端日志**

```
[AI Generate] Mode: mock, Provider: mock, Preset: bead-pattern
```

---

### 场景 2：Real 模式，缺 Key（验证错误提示）

**配置**

前端 `.env.local`：
```env
VITE_AI_RUNTIME_MODE=real
VITE_AI_PROVIDER=tencent-hunyuan
VITE_API_BASE_URL=http://localhost:3001
```

后端 `server/.env.local`：
```env
AI_RUNTIME_MODE=real
AI_PROVIDER=tencent-hunyuan
TENCENT_SECRET_ID=
TENCENT_SECRET_KEY=
```

**测试步骤**

1. 重启后端（使用新的 `.env.local`）
2. 访问 http://localhost:3001/api/health
3. 验证返回：
   ```json
   "status": "missing-keys"
   ```
4. 访问前端 http://localhost:5173
5. 进入 AI 优化页面
6. 验证顶部显示：
   ```
   运行模式：🚀 Real（真实）
   服务商：tencent-hunyuan
   ```
7. 上传图片并选择"拼豆图纸优化"
8. 点击"开始 AI 优化"
9. 预期显示错误：
   ```
   ❌ 未配置腾讯云 SecretId / SecretKey，请检查 server/.env.local
   ```

**预期结果**

✅ 显示清晰的错误提示，不会尝试调用腾讯云。

**后端日志**

```
[AI Generate] Mode: real, Provider: tencent-hunyuan, Preset: bead-pattern
[Tencent Hunyuan] Starting ImageToImage for preset: bead-pattern
```

---

### 场景 3：Real 模式，有 Key（框架演示）

**配置**

前端 `.env.local`：
```env
VITE_AI_RUNTIME_MODE=real
VITE_AI_PROVIDER=tencent-hunyuan
VITE_API_BASE_URL=http://localhost:3001
```

后端 `server/.env.local`：
```env
AI_RUNTIME_MODE=real
AI_PROVIDER=tencent-hunyuan
TENCENT_SECRET_ID=你的腾讯 SecretId
TENCENT_SECRET_KEY=你的腾讯 SecretKey
TENCENT_REGION=ap-guangzhou
TENCENT_AIART_ENDPOINT=aiart.tencentcloudapi.com
TENCENT_AIART_VERSION=2022-12-29
```

**测试步骤**

1. 重启后端
2. 访问 http://localhost:3001/api/health
3. 验证返回：
   ```json
   "status": "ready"
   ```
4. 访问前端
5. 进入 AI 优化页面
6. 上传图片并选择"拼豆图纸优化"
7. 点击"开始 AI 优化"
8. 观察后端日志

**当前行为**

❌ 当前会返回 **mock URL**，因为 SDK 还未实现。

**后端日志**

```
[AI Generate] Mode: real, Provider: tencent-hunyuan, Preset: bead-pattern
[Tencent Hunyuan] Starting ImageToImage for preset: bead-pattern
[Tencent Hunyuan] ImageToImage request: preset=bead-pattern, style=201, image_size=102400
[Tencent Mock] Would call ImageToImage with:
  - prompt length: 150
  - styles: ["201"]
  - strength: 0.8
[Tencent Hunyuan] ImageToImage success
```

**返回结果**

```json
{
  "id": "tencent_xxxxx",
  "provider": "tencent-hunyuan",
  "status": "success",
  "presetId": "bead-pattern",
  "resultImageUrl": "https://tencent-hunyuan-mock.example.com/img_1717824000000.jpg",
  "message": "腾讯混元图像风格化成功：bead-pattern",
  "creditCost": 1,
  "createdAt": "2026-06-07T12:00:00.000Z"
}
```

**预期结果**

✅ 框架工作正常，返回模拟 URL。

⚠️ **注**：这不是真实腾讯返回的结果。真实 SDK 实现在 v0.7.4。

---

## 前后端联通验证

### 1. 前端是否请求了后端？

打开浏览器开发者工具（F12）→ Network 选项卡：

1. 上传图片后点击"开始 AI 优化"
2. 应看到请求：
   ```
   POST http://localhost:3001/api/ai-style/generate
   ```
3. 请求体应包含：
   ```json
   {
     "presetId": "bead-pattern",
     "sourceImage": {
       "name": "xxx.jpg",
       "type": "image/jpeg",
       "size": 102400,
       "base64": "...",
       ...
     }
   }
   ```

### 2. 后端是否收到了请求？

观察后端日志应显示：
```
[AI Generate] Mode: real, Provider: tencent-hunyuan, Preset: bead-pattern
```

### 3. 日志内容检查

**应该打印的内容**：
- AI provider 名称
- Runtime mode（mock/real）
- Tencent action（ImageToImage/RefineImage）
- Preset 名称
- 请求状态（success/failed）

**不应该打印的内容**：
- 完整 SecretId
- 完整 SecretKey
- 完整 base64 图片数据
- 完整请求头

---

## 测试用图片建议

### 推荐格式

| 格式 | 尺寸 | 大小 | 备注 |
|------|------|------|------|
| JPG | 800×600 | 100-200KB | 最常见，推荐 |
| PNG | 800×600 | 200-400KB | 支持透明 |
| WEBP | 800×600 | 50-100KB | 更小，推荐 |

### 不支持的格式

❌ BMP, GIF, TIFF, SVG, PDF 等

### 不推荐的场景

| 场景 | 问题 |
|------|------|
| 全黑或全白图片 | AI 可能无法处理 |
| 非常小的图片（<100×100） | 细节丢失 |
| 非常大的图片（>5MB） | 上传失败 |
| 包含敏感内容的图片 | 审核可能失败 |

---

## 推荐测试顺序

1. **第 1 步**：Mock 模式 + 干净像素风
   - 验证基础流程是否工作
   - 预期：1-2 秒完成，显示 mock 结果

2. **第 2 步**：Real 模式，缺 Key
   - 验证错误处理是否正确
   - 预期：显示"未配置腾讯云 SecretId / SecretKey"

3. **第 3 步**：Real 模式，有 Key（如果已获得）
   - 验证框架是否准备好接收真实 SDK 实现
   - 预期：返回 mock URL（当前行为）
   - 提示：真实 SDK 在 v0.7.4 实现

4. **第 4 步**：提高清晰度（enhance-clarity）
   - 这个 preset 使用 RefineImage 接口
   - 验证不同接口的框架是否工作

5. **第 5 步**：去除背景（remove-background）
   - 验证是否显示"背景简化"说明
   - 检查 real 模式下是否有说明提示

---

## 环境变量检查清单

### 前端 `.env.local`

- [ ] `VITE_AI_RUNTIME_MODE` 是否设置（mock/real）
- [ ] `VITE_AI_PROVIDER` 是否设置（mock/tencent-hunyuan）
- [ ] `VITE_API_BASE_URL` 是否指向 http://localhost:3001
- [ ] 文件是否在 `.gitignore` 中

### 后端 `server/.env.local`

- [ ] `AI_RUNTIME_MODE` 是否设置
- [ ] `AI_PROVIDER` 是否设置
- [ ] `TENCENT_SECRET_ID` 是否配置（如需真实调用）
- [ ] `TENCENT_SECRET_KEY` 是否配置（如需真实调用）
- [ ] `TENCENT_REGION` 是否设置（推荐 ap-guangzhou）
- [ ] 文件是否在 `.gitignore` 中

### 验证 .gitignore

```bash
# 检查前端
cat .gitignore | grep ".env.local"

# 检查后端
cat server/.gitignore | grep ".env.local"
```

预期输出：
```
.env.local
```

---

## 常见问题

### Q：前端访问不了 http://localhost:5173

A：
1. 检查前端是否启动了
2. 查看控制台输出，看 Vite 报告的实际地址
3. 可能是 5173 端口被占用，Vite 会使用下一个可用端口

### Q：后端访问不了 http://localhost:3001

A：
1. 检查后端是否启动了
2. 检查是否有错误日志
3. 尝试访问 http://localhost:3001/health 确认服务运行

### Q：前端请求后端失败

A：
1. 打开浏览器 DevTools → Network
2. 查看 POST http://localhost:3001/api/ai-style/generate 的状态
3. 检查 CORS 错误（应该已配置）
4. 确认 `VITE_API_BASE_URL` 是否正确

### Q：显示"未配置腾讯云 SecretId"但我已配置

A：
1. 重启后端（环境变量变更需要重启）
2. 检查 `server/.env.local` 的内容
3. 确认 Key 不为空字符串

### Q：Real 模式返回 mock URL

A：✅ 这是正常的。当前 SDK 还未实现，会返回 mock URL。真实实现在 v0.7.4。

---

## 下一步：真实 SDK 实现

当前框架已就绪，v0.7.4 需要：

1. 在 `tencentHunyuanProvider.ts` 中替换 `callTencentImageToImage()` 的实现
2. 使用 `tencentcloud-sdk-nodejs` 的 AIART 模块
3. 传递正确的参数（base64、prompt、styles 等）
4. 返回真实的 resultImageUrl 或 resultImageBase64
5. 完整的错误处理和映射

---

**创建时间**：2026-06-07  
**版本**：v0.7.3  
**状态**：框架完成，SDK 实现待做
