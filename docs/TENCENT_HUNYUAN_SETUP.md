# 腾讯混元生图 - 设置指南

本指南将帮助你配置和使用腾讯混元生图 AI Provider。

## 1. 什么是腾讯混元生图

腾讯混元（Tencent Hunyuan）是腾讯云提供的一站式 AI 艺术创作平台，包括：
- **图像风格化（ImageToImage）**：将图片转换为各种艺术风格
- **图片变清晰（RefineImage）**：增强图片清晰度和细节

项目目前集成了这两项能力。

## 2. 前置条件

- 腾讯云账户
- 已开通腾讯混元生图服务
- 已创建访问密钥（SecretId 和 SecretKey）
- CAM（云访问管理）授权配置完成

## 3. 确认服务已开通

### 步骤 1：登录腾讯云控制台
访问 [腾讯云控制台](https://console.cloud.tencent.com/)

### 步骤 2：搜索 AI 艺术创作
- 在搜索框输入"AI 艺术创作"或"AIART"
- 或直接访问：https://cloud.tencent.com/product/ai-art

### 步骤 3：激活服务
- 点击"立即使用"
- 完成服务开通流程
- 确认账户余额充足（按量计费）

## 4. 创建 API 密钥

### 步骤 1：进入 CAM 控制台
访问 [CAM 控制台](https://console.cloud.tencent.com/cam/capi)

### 步骤 2：创建 API 密钥
- 点击"创建密钥"
- 选择"API 密钥"
- 复制 **SecretId** 和 **SecretKey**

**⚠️ 注意：SecretKey 只会显示一次，请务必妥善保存**

## 5. 配置 CAM 权限

### 步骤 1：进入用户详情
- 在 CAM 控制台找到你的用户
- 点击用户名进入详情页

### 步骤 2：添加权限
- 点击"关联策略"
- 搜索"aiart"或"AI 艺术创作"
- 选择权限策略：`QcloudAiartFullAccess`（完全访问）
- 或更细粒度的权限：`QcloudAiartImageGeneration`、`QcloudAiartImageEnhance`

### 步骤 3：确认授权
- 点击"确定"
- 等待权限生效（通常 1-2 分钟）

## 6. 配置后端环境变量

### 步骤 1：创建后端 .env.local

```bash
cd server
touch .env.local
```

### 步骤 2：编写配置

编辑 `server/.env.local`：

```env
# AI 运行模式
AI_RUNTIME_MODE=real
AI_PROVIDER=tencent-hunyuan

# 腾讯混元配置
TENCENT_SECRET_ID=你的SecretId
TENCENT_SECRET_KEY=你的SecretKey
TENCENT_REGION=ap-guangzhou
TENCENT_AIART_ENDPOINT=aiart.tencentcloudapi.com
TENCENT_AIART_VERSION=2022-12-29
```

**替换占位符：**
- `你的SecretId` → 从 CAM 控制台复制的 SecretId
- `你的SecretKey` → 从 CAM 控制台复制的 SecretKey

### 步骤 3：检查 .gitignore

确保 `server/.env.local` 已在 `.gitignore` 中（防止意外提交）：

```bash
# 检查
cat server/.gitignore | grep ".env.local"

# 如果没有，添加
echo ".env.local" >> server/.gitignore
```

## 7. 启动后端服务

### 步骤 1：安装依赖

```bash
cd server
npm install
```

### 步骤 2：启动开发服务器

```bash
npm run dev
```

预期输出：

```
🚀 AI Style Server running at http://localhost:3001
```

### 步骤 3：验证服务

```bash
curl http://localhost:3001/health

# 预期响应
{"status":"ok","timestamp":"2026-06-07T12:00:00.000Z"}
```

## 8. 配置前端

### 步骤 1：更新前端 .env.local

项目根目录 `.env.local`（如果没有则创建）：

```env
VITE_AI_RUNTIME_MODE=real
VITE_AI_PROVIDER=tencent-hunyuan
VITE_API_BASE_URL=http://localhost:3001
```

### 步骤 2：启动前端

```bash
npm run dev
```

## 9. 测试真实调用

### 测试流程

1. **打开应用**
   ```
   http://localhost:5173
   ```

2. **模拟登录**
   - 点击左上角用户名
   - 进入"用户中心"→"登录测试面板"
   - 点击"测试登录"

3. **进入 AI 优化页面**
   - 点击用户中心底部的"人工智能优化"选项卡

4. **验证配置**
   - 确认顶部显示：
     ```
     运行模式：🚀 Real（真实）
     服务商：tencent-hunyuan
     ```

5. **上传图片**
   - 点击"上传需要 AI 优化的图片"
   - 选择 JPG / PNG / WEBP 格式的图片（5MB 以内）
   - 确认图片预览正确

6. **选择优化方式**
   - 点击"拼豆图纸优化"或"干净像素风"
   - 按钮文本应显示"开始 AI 优化"（非"模拟生成"）

7. **执行优化**
   - 点击"开始 AI 优化"
   - 等待腾讯混元处理（通常 10-30 秒）
   - 观察后台日志输出

8. **验证结果**
   - 成功：显示"生成结果"区域，包含处理结果
   - 失败：显示错误提示信息

### 预期日志输出

后端控制台应显示：

```
[AI Generate] Mode: real, Provider: tencent-hunyuan, Preset: bead-pattern
[Tencent Hunyuan] Starting ImageToImage for preset: bead-pattern
[Tencent Hunyuan] ImageToImage request: preset=bead-pattern, style=201, image_size=102400
[Tencent Hunyuan] ImageToImage success
```

## 10. 常见错误排查

### 错误 1：密钥未配置

**症状**：页面显示 "未配置腾讯云 SecretId / SecretKey"

**原因**：
- `server/.env.local` 不存在或未配置
- 环境变量未被加载

**解决方案**：
```bash
# 检查文件存在
ls -la server/.env.local

# 检查内容
cat server/.env.local | grep TENCENT

# 重启后端服务
npm run dev  # 在 server 目录
```

### 错误 2：CAM 无权限

**症状**：
```
ResourceNotFound
腾讯混元生图服务未开通或当前账号无调用权限
```

**原因**：
- CAM 权限未配置
- 权限未生效

**解决方案**：
1. 登录腾讯云控制台
2. 进入 CAM 控制台 → 用户 → 你的用户
3. 重新添加权限：`QcloudAiartFullAccess`
4. 等待 2-3 分钟权限生效
5. 重试

### 错误 3：服务未开通

**症状**：
```
FailedOperation.ServiceIsolated
腾讯混元生图服务暂不可用，请检查账户状态
```

**原因**：
- 服务未激活
- 账户欠费

**解决方案**：
1. 进入腾讯混元控制台
2. 确认"立即使用"已点击
3. 检查账户余额（右上角"费用"）
4. 确保账户处于正常状态

### 错误 4：余额不足

**症状**：
```
FailedOperation.Balance
腾讯云账户余额不足或服务不可用，请检查账户状态
```

**原因**：
- 账户余额为 0 或负数

**解决方案**：
1. 进入腾讯云费用中心
2. 点击"充值"
3. 充值足够的金额（建议 50+ 元用于测试）
4. 重试

### 错误 5：图片过大

**症状**：
```
图片过大，请上传 5MB 以内的图片
```

**原因**：
- 选中的图片超过 5MB

**解决方案**：
- 使用更小的图片
- 或通过图像编辑器压缩图片

### 错误 6：内容审核不通过

**症状**：
```
ContentRejection
图片或提示词未通过平台审核，请更换图片或调整描述后重试
```

**原因**：
- 图片内容违反平台审核规则
- 提示词内容不当

**解决方案**：
- 尝试上传不同的图片
- 系统会自动使用合适的提示词，无法自定义

### 错误 7：请求频率超限

**症状**：
```
RateLimitExceeded
当前请求较多，请稍后再试
```

**原因**：
- 短时间内发送了过多请求

**解决方案**：
- 等待几秒钟后重试
- 避免频繁点击"开始 AI 优化"按钮

## 11. 监控和日志

### 后端日志

查看 server 的实时日志：

```bash
# 开发模式（已包含日志）
npm run dev

# 日志示例
[Tencent Hunyuan] Starting ImageToImage for preset: bead-pattern
[Tencent Mock] Would call ImageToImage with:
  - prompt length: 150
  - styles: ["201"]
  - strength: 0.8
```

### 前端日志

浏览器开发者工具：
1. 按 F12 打开开发者工具
2. 进入"控制台"选项卡
3. 观察网络请求和错误信息

### 性能指标

观察处理时间：
- ImageToImage：通常 10-30 秒
- RefineImage：通常 5-15 秒

## 12. 支持的 Preset 列表

### 风格化（使用 ImageToImage）

| Preset | 中文名称 | 是否真实 |
|--------|---------|---------|
| pixel-clean | 干净像素风 | ✅ |
| bead-pattern | 拼豆图纸优化 | ✅ |
| cute-cartoon | Q 版卡通 | ✅ |
| watercolor | 水彩风 | ✅ |
| illustration | 插画风格 | ✅ |
| anime-soft | 柔和动漫风 | ✅ |

### 图片处理（使用对应接口）

| Preset | 中文名称 | 接口 | 是否真实 |
|--------|---------|------|---------|
| enhance-clarity | 提高清晰度 | RefineImage | ✅ |
| clean-background | 清理杂乱背景 | ImageToImage | ✅ |
| remove-background | 背景简化 | ImageToImage | ✅ |
| color-optimize | 颜色优化 | ImageToImage | ✅ |
| reduce-noise | 减少杂色 | ImageToImage | ✅ |

## 13. 环境变量参考

| 变量名 | 必需 | 示例值 | 说明 |
|--------|------|--------|------|
| AI_RUNTIME_MODE | ✅ | mock \| real | 运行模式 |
| AI_PROVIDER | ✅ | tencent-hunyuan | 服务商 |
| TENCENT_SECRET_ID | ✅ | AKID... | 腾讯云 SecretId |
| TENCENT_SECRET_KEY | ✅ | wl6F... | 腾讯云 SecretKey |
| TENCENT_REGION | ❌ | ap-guangzhou | 腾讯云区域（默认：广州） |
| TENCENT_AIART_ENDPOINT | ❌ | aiart.tencentcloudapi.com | API 端点 |
| TENCENT_AIART_VERSION | ❌ | 2022-12-29 | API 版本 |

## 14. 联系和支持

- 腾讯云官方文档：https://cloud.tencent.com/document/product/1668
- 本项目 GitHub Issues：[待补充]
- 腾讯云技术支持：https://cloud.tencent.com/document/product/1668/66702

## 15. 最佳实践

### 开发建议

1. **使用 Mock 模式开发**
   ```env
   VITE_AI_RUNTIME_MODE=mock
   VITE_AI_PROVIDER=mock
   ```
   - 无需真实 API Key
   - 快速迭代，无费用消耗

2. **定期测试真实模式**
   - 每周至少一次测试真实接口
   - 确保配置和权限有效

3. **监控账户余额**
   - 设置低余额告警
   - 及时充值，避免服务中断

### 成本优化

| 调用 | 单价 | 月预算 |
|-----|------|--------|
| ImageToImage (10 张) | 0.1 元/张 | 1 元 |
| RefineImage (10 张) | 0.05 元/张 | 0.5 元 |
| 总计 | - | 1.5 元 |

建议初期预留 50-100 元进行测试。

## 16. 常见问题

**Q：可以用免费额度吗？**
A：腾讯混元生图暂无免费额度，按量计费。建议先用 Mock 模式开发。

**Q：多个团队成员可以共用一个 SecretKey 吗？**
A：可以，但不推荐。建议为每个成员创建单独的 API 密钥。

**Q：支持离线模式吗？**
A：暂不支持。必须连接腾讯云服务器。

**Q：处理结果会被保存吗？**
A：腾讯云可能会保存，建议阅读其隐私政策。

**Q：可以自定义提示词吗？**
A：当前版本不支持。后续版本可能开放此功能。

---

**最后更新**：2026-06-07  
**版本**：0.7.3
