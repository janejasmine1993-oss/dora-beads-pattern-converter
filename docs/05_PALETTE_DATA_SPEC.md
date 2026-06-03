# 色卡数据规范

## 支持品牌

当前支持 5 个品牌，全部已接入真实色卡数据：

| 品牌 | 颜色数 | 数据来源 | 授权状态 |
|------|--------|---------|---------|
| MARD | 291 | mumu-0922/pindou（基于 Zippland/perler-beads colorSystemMapping）| MIT/community，仅用于开发测试，商用前需确认 |
| COCO | 291 | 同上 | 同上 |
| 漫漫 | 290 | 同上 | 同上 |
| 盼盼 | 291 | 同上 | 同上 |
| 咪小窝 | 291 | 同上 | 同上 |

> ⚠️ 数据来源为开源社区项目，授权类型为 "community"，Zippland/perler-beads 使用 AGPL v3。
> **仅用于本地开发测试，商用前需要确认授权或自行整理真实品牌色卡。**

## 数据来源

**主要来源：**
- `mumu-0922/pindou`：https://github.com/mumu-0922/pindou
  - 路径：`lib/data/palettes/*.json`
  - 原始数据包含 id、brand、code、name、hex、rgb、lab、source、license 字段

**次要来源：**
- `Zippland/perler-beads`（AGPL v3）：https://github.com/Zippland/perler-beads
  - 文件：`src/app/colorSystemMapping.json`
  - 包含跨品牌色号映射（相同颜色在各品牌的编号对照）

## 统一数据格式

每条色卡数据的格式：

```json
{
  "brand": "MARD",
  "code": "A01",
  "name": "A01",
  "hex": "#FAF4C8",
  "rgb": [250, 244, 200],
  "lab": [95.66, -4.93, 21.97]
}
```

| 字段 | 说明 |
|------|------|
| brand | 品牌名（大写中文/英文）|
| code | 品牌色号编号 |
| name | 颜色显示名（目前与 code 相同，待接入官方中文名）|
| hex | 十六进制颜色值 |
| rgb | RGB 数组 [R, G, B] |
| lab | CIE Lab 色彩空间值（可选，用于加速 Delta-E 匹配）|

## 文件存放位置

```
src/data/palettes/
  mard.json       291 色
  coco.json       291 色
  manman.json     290 色
  panpan.json     291 色
  mixiaowo.json   291 色
```

## 性能优化

色卡数据包含预计算的 `lab` 值，`paletteMatch.ts` 优先使用，跳过运行时 RGB→Lab 转换，匹配速度提升约 10 倍。

## 后续待办

- 接入官方中文颜色名称（当前 name 字段与 code 相同）
- 确认各品牌色卡的商用授权状态
- 可选：接入 MARD221 官方色卡（如有公开数据）

## GitHub 检索记录

已检索过的关键词和项目：

```
MARD COCO 漫漫 盼盼 咪小窝 拼豆 色卡
MARD COCO 漫漫 盼盼 咪小窝 perler beads palette
拼豆 色号系统 GitHub
perler beads colorSystemMapping.json
```

已检查项目：
```
mumu-0922/pindou          ✅ 找到完整 291 色数据
Zippland/perler-beads     ✅ 找到 colorSystemMapping.json
liangdabiao/perler-beads-ai  未检查到可用色卡文件
atonasting/fuse-bead-tool    未检查到可用色卡文件
Jett-Wu/Perler_Beads_Generator  未检查到可用色卡文件
```
