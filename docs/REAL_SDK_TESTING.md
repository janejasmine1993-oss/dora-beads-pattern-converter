# v0.7.4 真实腾讯混元 SDK 测试指南

**v0.7.4 已实现真实腾讯混元 SDK 调用。** 本指南说明如何测试。

## 关键信息

- ✅ **v0.7.4** 使用 tencentcloud-sdk-nodejs 真实调用
- ❌ **v0.7.3** 仅是 Provider 框架，返回 mock URL
- ✅ **真实调用** 已实现：ImageToImage、RefineImage
- ✅ **ResultImage** 返回腾讯云真实结果
- ✅ **次数扣除** 仅在成功后进行

---

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

---

## 测试环境配置

### 配置 1：Mock 模式（回归测试）

**前端** `.env.local`：
```env
VITE_AI_RUNTIME_MODE=mock
VITE_AI_PROVIDER=mock
VITE_API_BASE_URL=http://localhost:3001
```

**后端** `server/.env.local`：
```env
AI_RUNTIME_MODE=mock
AI_PROVIDER=mock
```

**预期**：1-2 秒完成，返回 mock URL（v0.7.3 行为）

---

### 配置 2：Real 模式，缺 Key（错误处理测试）

**前端** `.env.local`：
```env
VITE_AI_RUNTIME_MODE=real
VITE_AI_PROVIDER=tencent-hunyuan
VITE_API_BASE_URL=http://localhost:3001
```

**后端** `server/.env.local`：
```env
AI_RUNTIME_MODE=real
AI_PROVIDER=tencent-hunyuan
TENCENT_SECRET_ID=
TENCENT_SECRET_KEY=
TENCENT_REGION=ap-guangzhou
TENCENT_AIART_ENDPOINT=aiart.tencentcloudapi.com
TENCENT_AIART_VERSION=2022-12-29
```

**预期**：显示"未配置腾讯云 SecretId / SecretKey"

---

### 配置 3：Real 模式，有真实 Key（真实调用测试）

**前端** `.env.local`：
```env
VITE_AI_RUNTIME_MODE=real
VITE_AI_PROVIDER=tencent-hunyuan
VITE_API_BASE_URL=http://localhost:3001
```

**后端** `server/.env.local`：
```env
AI_RUNTIME_MODE=real
AI_PROVIDER=tencent-hunyuan
TENCENT_SECRET_ID=你的腾讯云 SecretId
TENCENT_SECRET_KEY=你的腾讯云 SecretKey
TENCENT_REGION=ap-guangzhou
TENCENT_AIART_ENDPOINT=aiart.tencentcloudapi.com
TENCENT_AIART_VERSION=2022-12-29
```

**预期**：返回腾讯云真实生成的图片 URL

---

## 测试步骤

### 第 1 步：Mock 模式回归（确保原有功能不破坏）

1. 配置环境为 Mock 模式
2. 重启后端和前端
3. 访问 http://localhost:5173
4. 进入 AI 优化页面
5. 上传一张图片
6. 点击"模拟生成"
7. 应在 1-2 秒内显示"生成结果"

**验证点**：
- [ ] 页面显示"运行模式：📦 Mock（模拟）"
- [ ] 显示"生成结果"区域
- [ ] AI 次数正常扣除（如果登录）

---

### 第 2 步：Real 模式，缺 Key（验证错误处理）

1. 配置环境为 Real 模式，但 TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY 为空
2. 重启后端
3. 访问 http://localhost:3001/api/health
4. 验证返回：`"status": "missing-keys"`
5. 前端上传图片，选择"拼豆图纸优化"
6. 点击"开始 AI 优化"
7. 应显示错误提示

**验证点**：
- [ ] 页面显示"运行模式：🚀 Real（真实）"
- [ ] 显示错误提示："未配置腾讯云 SecretId / SecretKey..."
- [ ] 不扣 AI 次数（失败不扣）

**后端日志**：
```
[Tencent Hunyuan] Starting ImageToImage for preset: bead-pattern
```

---

### 第 3 步：Real 模式，真实 Key（真实调用测试）

**前置条件**：
- 拥有腾讯云账户
- 已开通腾讯混元生图服务
- 已获得有效的 SecretId / SecretKey
- 账户余额充足

**步骤**：

1. 配置真实 Key 到 `server/.env.local`
2. 重启后端
3. 访问 http://localhost:3001/api/health
4. 验证返回：`"status": "ready"`
5. 访问前端
6. 进入 AI 优化页面

**验证点**：
- [ ] 页面显示"运行模式：🚀 Real（真实）"
- [ ] 页面显示"服务商：tencent-hunyuan"

**选择 enhance-clarity（RefineImage 接口）**：

1. 上传图片
2. 选择"提高清晰度"
3. 点击"开始 AI 优化"
4. 等待 5-30 秒（腾讯云处理时间）
5. 应显示"生成结果"

**验证点**：
- [ ] 后端日志显示：`[Tencent Hunyuan] Starting RefineImage...`
- [ ] 后端日志显示：`[Tencent Hunyuan] RefineImage success, RequestId: ...`
- [ ] 前端显示来自腾讯云的真实图片（不是 mock URL）
- [ ] 图片可直接预览（URL 格式）
- [ ] AI 次数被扣除（成功才扣）
- [ ] 消息显示成功提示

**后端日志示例**：
```
[AI Generate] Mode: real, Provider: tencent-hunyuan, Preset: enhance-clarity
[Tencent Hunyuan] Starting RefineImage for preset: enhance-clarity
[Tencent Hunyuan] RefineImage request: preset=enhance-clarity, image_size=102400
[Tencent Hunyuan] RefineImage success, RequestId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**选择 bead-pattern（ImageToImage 接口）**：

1. 上传不同的图片
2. 选择"拼豆图纸优化"
3. 点击"开始 AI 优化"
4. 等待 10-30 秒
5. 应显示"生成结果"

**验证点**：
- [ ] 后端日志显示：`[Tencent Hunyuan] Starting ImageToImage...`
- [ ] 后端日志显示：`[Tencent Hunyuan] ImageToImage success, RequestId: ...`
- [ ] 前端显示来自腾讯云的真实图片
- [ ] 图片是拼豆图纸优化风格
- [ ] AI 次数被扣除
- [ ] 消息显示成功提示

**后端日志示例**：
```
[AI Generate] Mode: real, Provider: tencent-hunyuan, Preset: bead-pattern
[Tencent Hunyuan] Starting ImageToImage for preset: bead-pattern
[Tencent Hunyuan] ImageToImage request: preset=bead-pattern, style=201, image_size=102400
[Tencent Hunyuan] ImageToImage success, RequestId: x9y8z7w6-v5u4-3210-tsrq-ponmlkjihgf
```

---

## 健康检查接口测试

### 简单健康检查

```bash
curl http://localhost:3001/health
```

返回：
```json
{
  "ok": true,
  "service": "dora-beads-ai-server",
  "version": "0.7.4",
  "timestamp": "2026-06-07T12:00:00.000Z"
}
```

### AI 模块详细检查

```bash
curl http://localhost:3001/api/health
```

返回（Real 模式，有 Key）：
```json
{
  "ok": true,
  "service": "dora-beads-ai-server",
  "version": "0.7.4",
  "ai": {
    "runtimeMode": "real",
    "provider": "tencent-hunyuan",
    "tencentKeysConfigured": true,
    "status": "ready"
  },
  "timestamp": "2026-06-07T12:00:00.000Z"
}
```

---

## 错误场景测试

### 错误 1：SecretKey 错误

**配置**：
```env
TENCENT_SECRET_ID=正确的ID
TENCENT_SECRET_KEY=错误的KEY
```

**预期错误**：
```
腾讯云鉴权失败，请检查 SecretId / SecretKey 是否正确
```

**后端日志**：
```
[Tencent Hunyuan] Error: AuthFailure ...
```

---

### 错误 2：CAM 无权限

**现象**：账户已激活但无 AIART 权限

**预期错误**：
```
腾讯混元生图未开通或当前账号无调用权限，请检查腾讯云控制台和 CAM 授权。
```

**后端日志**：
```
[Tencent Hunyuan] Error: UnauthorizedOperation ...
```

---

### 错误 3：图片大小超限

**现象**：上传 > 5MB 的图片

**预期**：
- 前端已限制：显示"图片大小超过 5MB 限制"
- 后端也校验：返回"图片过大"

---

### 错误 4：审核失败

**现象**：图片或提示词触发内容审核

**预期错误**：
```
图片或提示词未通过平台审核，请更换图片或调整描述后重试。
```

---

### 错误 5：账户欠费

**现象**：腾讯云账户余额为 0

**预期错误**：
```
腾讯云账户余额不足或服务不可用，请检查账户状态。
```

---

## 性能指标

### 预期处理时间

| 接口 | 预期时间 | 备注 |
|------|---------|------|
| ImageToImage | 10-30 秒 | 取决于图片大小和腾讯云负载 |
| RefineImage | 5-15 秒 | 通常比 ImageToImage 快 |

### 日志记录

**正常流程日志**：
```
[AI Generate] Mode: real, Provider: tencent-hunyuan, Preset: bead-pattern
[Tencent Hunyuan] Starting ImageToImage for preset: bead-pattern
[Tencent Hunyuan] ImageToImage request: preset=bead-pattern, style=201, image_size=102400
[Tencent Hunyuan] ImageToImage success, RequestId: xxxxx
```

**不应该出现的日志**：
- ❌ 完整的 SecretKey
- ❌ 完整的 base64 图片数据
- ❌ "[Tencent Mock] Would call..."（应该是真实调用）

---

## 测试用图片建议

### 推荐图片

- **尺寸**：800×600 ~ 2000×1500
- **大小**：100KB ~ 3MB
- **格式**：JPG 或 PNG
- **内容**：清晰的物体、人物、风景
- **质量**：非常模糊或质量极差的图片可能无法处理

### 不推荐图片

- ❌ 全黑或全白
- ❌ < 100×100 的小图
- ❌ 包含敏感内容（会被审核拒绝）
- ❌ 已是 mock URL 的图片（会重复处理）

---

## 预期vs实际

### 真实返回格式

**v0.7.3 行为**（Mock URL）：
```json
{
  "id": "tencent_mock_xxx",
  "resultImageUrl": "https://tencent-hunyuan-mock.example.com/img_xxx.jpg"
}
```

**v0.7.4 行为**（真实 URL）：
```json
{
  "id": "tencent_1717824000000_a1b2c3d4",
  "resultImageUrl": "https://cos-xxxxxx.cos.ap-guangzhou.myqcloud.com/xxx.jpg?xxxtoken..."
}
```

差异：
- ✅ v0.7.4 返回腾讯云 COS URL（真实图片）
- ✅ v0.7.4 包含 RequestId 用于问题排查
- ✅ v0.7.4 次数真实扣除

---

## 常见问题

### Q：真实调用时显示 timeout

A：
1. 检查网络是否正常
2. 检查腾讯云 API 是否可达（ping aiart.tencentcloudapi.com）
3. 腾讯云可能在处理，稍后重试
4. 检查后端日志是否有错误

### Q：返回 mock URL

A：
1. 检查 `server/.env.local` 中 TENCENT_SECRET_ID 是否为空
2. 检查后端是否已重启
3. 访问 http://localhost:3001/api/health 检查 tencentKeysConfigured 状态

### Q：RequestId 显示在哪里

A：只在后端日志中。前端返回的 `id` 不是 RequestId，但包含了它。

### Q：图片 URL 有效期

A：腾讯云返回的 URL 有效期约 1 小时，建议用户及时保存结果。

### Q：为什么不保存图片到数据库

A：当前版本没有数据库，用户需要手动保存。后续版本可考虑添加。

---

## 下一步验证

- [ ] Mock 模式正常工作
- [ ] Real 模式缺 Key 时有错误提示
- [ ] Real 模式有 Key 时能调用腾讯云
- [ ] 返回的图片 URL 可以直接在浏览器打开
- [ ] 成功时扣 AI 次数
- [ ] 失败时不扣 AI 次数
- [ ] 后端日志包含 RequestId
- [ ] 前后端通信正常

---

**版本**：v0.7.4  
**更新时间**：2026-06-07  
**SDK 状态**：✅ 真实 SDK 已集成，可用于生产环境
