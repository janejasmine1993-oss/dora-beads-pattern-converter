# API 后端测试 - curl 命令

本文档提供 curl 命令用于测试后端 API。

**重要**：所有测试都请求本地后端代理，不涉及真实 SecretId/SecretKey。

---

## 健康检查

### 1. 简单健康检查

```bash
curl -X GET http://localhost:3001/health
```

预期响应：
```json
{
  "ok": true,
  "service": "dora-beads-ai-server",
  "version": "0.7.4",
  "timestamp": "2026-06-07T12:00:00.000Z"
}
```

### 2. AI 模块健康检查

```bash
curl -X GET http://localhost:3001/api/health
```

预期响应（当配置了真实 Key）：
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

## AI 风格化 API 测试

### 前置准备：获取 base64 图片

#### 方式 1：使用本地图片转 base64（Mac/Linux）

```bash
# 将图片转为 base64
base64 < /path/to/image.jpg > /tmp/image_base64.txt

# 或使用单行命令
base64 -i /path/to/image.jpg | tr -d '\n'
```

#### 方式 2：在线工具

访问 https://www.base64encode.org/ 上传图片并获取 base64。

---

### 测试：调用 ImageToImage（图像风格化）

**环境要求**：
- 后端已启动
- `AI_RUNTIME_MODE=real`
- `AI_PROVIDER=tencent-hunyuan`
- `TENCENT_SECRET_ID` 和 `TENCENT_SECRET_KEY` 已配置

**命令**：

```bash
# 1. 先将图片转为 base64 并保存到文件
base64 -i /path/to/your/image.jpg > /tmp/img_base64.txt

# 2. 读取 base64 内容
IMG_BASE64=$(cat /tmp/img_base64.txt | tr -d '\n')

# 3. 发送请求
curl -X POST http://localhost:3001/api/ai-style/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"presetId\": \"bead-pattern\",
    \"sourceImage\": {
      \"id\": \"test_image_001\",
      \"name\": \"test.jpg\",
      \"type\": \"image/jpeg\",
      \"size\": 102400,
      \"previewUrl\": \"data:image/jpeg;base64,${IMG_BASE64}\",
      \"base64\": \"${IMG_BASE64}\",
      \"createdAt\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\"
    },
    \"strength\": 0.8,
    \"keepOriginalColors\": true,
    \"targetUseCase\": \"bead-pattern\"
  }"
```

**预期响应**（成功）：
```json
{
  "id": "tencent_1717824000000_a1b2c3d4",
  "provider": "tencent-hunyuan",
  "status": "success",
  "presetId": "bead-pattern",
  "resultImageUrl": "https://cos-xxxxxx.cos.ap-guangzhou.myqcloud.com/xxx.jpg?token...",
  "message": "腾讯混元图像风格化成功：bead-pattern",
  "creditCost": 1,
  "createdAt": "2026-06-07T12:00:00.000Z"
}
```

**预期响应**（缺 Key）：
```json
{
  "id": "tencent_error_xxx",
  "provider": "tencent-hunyuan",
  "status": "failed",
  "presetId": "bead-pattern",
  "message": "腾讯混元密钥未配置",
  "errorMessage": "未配置腾讯云 SecretId / SecretKey，请检查 server/.env.local",
  "creditCost": 0,
  "createdAt": "2026-06-07T12:00:00.000Z"
}
```

---

### 测试：调用 RefineImage（图片变清晰）

```bash
# 准备 base64
IMG_BASE64=$(cat /tmp/img_base64.txt | tr -d '\n')

# 发送请求
curl -X POST http://localhost:3001/api/ai-style/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"presetId\": \"enhance-clarity\",
    \"sourceImage\": {
      \"id\": \"test_image_002\",
      \"name\": \"test.jpg\",
      \"type\": \"image/jpeg\",
      \"size\": 102400,
      \"previewUrl\": \"data:image/jpeg;base64,${IMG_BASE64}\",
      \"base64\": \"${IMG_BASE64}\",
      \"createdAt\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\"
    },
    \"strength\": 0.8,
    \"keepOriginalColors\": true,
    \"targetUseCase\": \"bead-pattern\"
  }"
```

**预期响应**（成功）：
```json
{
  "id": "tencent_1717824030000_x9y8z7w6",
  "provider": "tencent-hunyuan",
  "status": "success",
  "presetId": "enhance-clarity",
  "resultImageUrl": "https://cos-xxxxxx.cos.ap-guangzhou.myqcloud.com/refined_xxx.jpg?token...",
  "message": "腾讯混元图片变清晰成功：enhance-clarity",
  "creditCost": 1,
  "createdAt": "2026-06-07T12:00:00.000Z"
}
```

---

## 测试脚本（自动化）

### Shell 脚本：完整测试流程

创建文件 `test_api.sh`：

```bash
#!/bin/bash

set -e

IMAGE_FILE="${1:-test.jpg}"

if [ ! -f "$IMAGE_FILE" ]; then
  echo "Error: Image file not found: $IMAGE_FILE"
  exit 1
fi

echo "📸 Converting image to base64..."
IMG_BASE64=$(base64 -i "$IMAGE_FILE" | tr -d '\n')
echo "✓ Image converted"

echo ""
echo "🔍 Checking health..."
curl -s http://localhost:3001/api/health | jq '.'

echo ""
echo "🎨 Testing ImageToImage (bead-pattern)..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/ai-style/generate \
  -H "Content-Type: application/json" \
  -d "{
    \"presetId\": \"bead-pattern\",
    \"sourceImage\": {
      \"id\": \"test_001\",
      \"name\": \"$(basename $IMAGE_FILE)\",
      \"type\": \"image/jpeg\",
      \"size\": $(stat -f%z "$IMAGE_FILE"),
      \"previewUrl\": \"data:image/jpeg;base64,${IMG_BASE64}\",
      \"base64\": \"${IMG_BASE64}\",
      \"createdAt\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\"
    },
    \"strength\": 0.8,
    \"keepOriginalColors\": true,
    \"targetUseCase\": \"bead-pattern\"
  }")

echo "$RESPONSE" | jq '.'

STATUS=$(echo "$RESPONSE" | jq -r '.status')

if [ "$STATUS" = "success" ]; then
  echo "✅ Success!"
  IMAGE_URL=$(echo "$RESPONSE" | jq -r '.resultImageUrl')
  echo "📷 Result image: $IMAGE_URL"
  echo "💡 Open in browser: $IMAGE_URL"
else
  echo "❌ Failed"
  ERROR=$(echo "$RESPONSE" | jq -r '.errorMessage')
  echo "Error: $ERROR"
fi
```

**使用方法**：

```bash
# 给脚本添加执行权限
chmod +x test_api.sh

# 运行测试
./test_api.sh /path/to/image.jpg

# 或使用默认 test.jpg
./test_api.sh
```

---

## Python 测试脚本

创建文件 `test_api.py`：

```python
#!/usr/bin/env python3

import requests
import base64
import json
import sys
from datetime import datetime

def encode_image(image_path):
    """将图片编码为 base64"""
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

def check_health():
    """检查 API 健康状态"""
    print("🔍 Checking API health...")
    response = requests.get('http://localhost:3001/api/health')
    print(json.dumps(response.json(), indent=2))
    return response.json()

def test_image_to_image(image_path):
    """测试 ImageToImage API"""
    print("\n🎨 Testing ImageToImage (bead-pattern)...")
    
    # 编码图片
    img_base64 = encode_image(image_path)
    
    # 获取文件大小
    import os
    file_size = os.path.getsize(image_path)
    
    # 构造请求
    payload = {
        "presetId": "bead-pattern",
        "sourceImage": {
            "id": "test_001",
            "name": os.path.basename(image_path),
            "type": "image/jpeg",
            "size": file_size,
            "previewUrl": f"data:image/jpeg;base64,{img_base64}",
            "base64": img_base64,
            "createdAt": datetime.utcnow().isoformat() + "Z"
        },
        "strength": 0.8,
        "keepOriginalColors": True,
        "targetUseCase": "bead-pattern"
    }
    
    # 发送请求
    response = requests.post(
        'http://localhost:3001/api/ai-style/generate',
        json=payload,
        headers={'Content-Type': 'application/json'}
    )
    
    result = response.json()
    print(json.dumps(result, indent=2))
    
    # 检查结果
    if result.get('status') == 'success':
        print("✅ Success!")
        print(f"📷 Result image: {result.get('resultImageUrl')}")
    else:
        print("❌ Failed")
        print(f"Error: {result.get('errorMessage')}")
    
    return result

def test_refine_image(image_path):
    """测试 RefineImage API"""
    print("\n✨ Testing RefineImage (enhance-clarity)...")
    
    # 编码图片
    img_base64 = encode_image(image_path)
    
    # 获取文件大小
    import os
    file_size = os.path.getsize(image_path)
    
    # 构造请求
    payload = {
        "presetId": "enhance-clarity",
        "sourceImage": {
            "id": "test_002",
            "name": os.path.basename(image_path),
            "type": "image/jpeg",
            "size": file_size,
            "previewUrl": f"data:image/jpeg;base64,{img_base64}",
            "base64": img_base64,
            "createdAt": datetime.utcnow().isoformat() + "Z"
        },
        "strength": 0.8,
        "keepOriginalColors": True,
        "targetUseCase": "bead-pattern"
    }
    
    # 发送请求
    response = requests.post(
        'http://localhost:3001/api/ai-style/generate',
        json=payload,
        headers={'Content-Type': 'application/json'}
    )
    
    result = response.json()
    print(json.dumps(result, indent=2))
    
    # 检查结果
    if result.get('status') == 'success':
        print("✅ Success!")
        print(f"📷 Result image: {result.get('resultImageUrl')}")
    else:
        print("❌ Failed")
        print(f"Error: {result.get('errorMessage')}")
    
    return result

if __name__ == '__main__':
    image_file = sys.argv[1] if len(sys.argv) > 1 else 'test.jpg'
    
    # 检查文件是否存在
    import os
    if not os.path.exists(image_file):
        print(f"Error: Image file not found: {image_file}")
        sys.exit(1)
    
    # 运行测试
    check_health()
    test_image_to_image(image_file)
    test_refine_image(image_file)
```

**使用方法**：

```bash
# 给脚本添加执行权限
chmod +x test_api.py

# 运行测试
python3 test_api.py /path/to/image.jpg

# 或使用默认 test.jpg
python3 test_api.py
```

---

## 验证响应格式

### 检查响应中的关键字段

```bash
# 提取返回的图片 URL
curl -s -X POST http://localhost:3001/api/ai-style/generate ... | jq '.resultImageUrl'

# 提取返回的 RequestId（嵌入在 id 中）
curl -s -X POST http://localhost:3001/api/ai-style/generate ... | jq '.id'

# 检查是否成功
curl -s -X POST http://localhost:3001/api/ai-style/generate ... | jq '.status'

# 检查是否扣除了次数
curl -s -X POST http://localhost:3001/api/ai-style/generate ... | jq '.creditCost'
```

---

## 故障排查

### 问题 1：连接失败

```bash
$ curl http://localhost:3001/api/health
curl: (7) Failed to connect to localhost port 3001
```

**解决**：
1. 检查后端是否启动
2. 检查端口 3001 是否被占用

---

### 问题 2：JSON 格式错误

```bash
$ curl ... | jq
parse error: Invalid JSON
```

**解决**：
1. 确保 -d 参数中的 JSON 格式正确
2. 使用 `jq` 验证 JSON：`echo '...' | jq .`

---

### 问题 3：base64 转换错误

```bash
# 长行导致 JSON 错误
```

**解决**：
1. 确保 base64 字符串中没有换行符
2. 使用 `tr -d '\n'` 移除换行符

---

**版本**：v0.7.4  
**更新时间**：2026-06-07
