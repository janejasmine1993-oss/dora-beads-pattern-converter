# 色卡数据规范

## 支持品牌

第一版支持 5 个品牌：

- MARD
- COCO
- 漫漫
- 盼盼
- 咪小窝

## 统一数据格式

每条色卡数据的格式：

```json
{
  "brand": "MARD",
  "code": "001",
  "name": "白色",
  "hex": "#FFFFFF",
  "rgb": [255, 255, 255]
}
```

## 文件存放位置

```
src/data/palettes/
  mard.json
  coco.json
  manman.json
  panpan.json
  mixiaowo.json
```

每个 JSON 文件为数组格式：

```json
[
  { "brand": "MARD", "code": "001", "name": "白色", "hex": "#FFFFFF", "rgb": [255, 255, 255] },
  ...
]
```

## 色卡数据来源检索规则

不要凭空编造真实品牌色号。

### GitHub 搜索关键词

```
MARD COCO 漫漫 盼盼 咪小窝 拼豆 色卡
MARD COCO 漫漫 盼盼 咪小窝 perler beads palette
拼豆 色号系统 GitHub
拼豆 色卡 JSON
perler beads colorSystemMapping.json
```

### 优先参考 GitHub 项目

```
Zippland/perler-beads
mumu-0922/pindou
liangdabiao/perler-beads-ai
atonasting/fuse-bead-tool
Jett-Wu/Perler_Beads_Generator
```

### 重点检查文件名

```
colorSystemMapping.json
palette.json
palettes.json
colors.json
beads.json
mard.json
coco.json
colorMap.json
```

### 找到真实色卡后必须做的三件事

1. 确认数据来源，记录到 `docs/08_DECISION_LOG.md`
2. 检查开源协议，不复制不允许商用或不允许二次使用的数据
3. 将数据统一整理成本规范格式后，再放入 `src/data/palettes/`

## 当前状态

> TODO: 当前色卡为示例数据，后续需要接入真实品牌色卡。
