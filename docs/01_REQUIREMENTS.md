# 完整需求文档

## 色卡数据来源检索规则

Codex 在实现色卡系统时，不要凭空编造真实品牌色号。

第一步请优先在 GitHub 搜索以下关键词：

```text
MARD COCO 漫漫 盼盼 咪小窝 拼豆 色卡
MARD COCO 漫漫 盼盼 咪小窝 perler beads palette
拼豆 色号系统 GitHub
拼豆 色卡 JSON
perler beads colorSystemMapping.json
```

优先参考以下 GitHub 项目中的色卡结构或数据线索：

```text
Zippland/perler-beads
mumu-0922/pindou
liangdabiao/perler-beads-ai
atonasting/fuse-bead-tool
Jett-Wu/Perler_Beads_Generator
```

重点检查这些可能包含色卡数据的文件名：

```text
colorSystemMapping.json
palette.json
palettes.json
colors.json
beads.json
mard.json
coco.json
colorMap.json
```

如果找到真实色卡数据，需要做三件事：

1. 确认数据来源，并记录到 `docs/08_DECISION_LOG.md`。
2. 检查开源协议，不要直接复制不允许商用或不允许二次使用的数据。
3. 将数据统一整理成以下格式后，再放入 `src/data/palettes/`：

```json
{
  "brand": "MARD",
  "code": "001",
  "name": "白色",
  "hex": "#FFFFFF",
  "rgb": [255, 255, 255]
}
```

如果暂时找不到完整真实色卡：

1. 每个品牌先创建一个示例 JSON 文件。
2. 每个品牌先放入 5-10 个基础颜色。
3. 保证品牌切换、色号匹配、豆量统计流程可以跑通。
4. 在代码中标注 TODO。
5. 在 `docs/10_KNOWN_ISSUES.md` 记录：

```text
当前色卡为示例数据，后续需要接入真实品牌色卡。
```

不允许因为色卡数据不完整导致项目无法启动或主流程报错。
