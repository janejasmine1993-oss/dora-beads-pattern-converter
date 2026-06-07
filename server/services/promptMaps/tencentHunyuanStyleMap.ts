/**
 * 腾讯混元生图风格 ID 映射表
 *
 * 源文档：腾讯云 AIART 图像风格化接口文档
 * https://cloud.tencent.com/document/product/1668/46724
 *
 * 注意：以下 style ID 应根据腾讯云最新官方文档核对
 * 如无法确认，优先使用默认风格（通常为 "201"）
 */

export const TENCENT_HUNYUAN_STYLE_MAP: Record<string, string> = {
  // 默认风格（如果不确定，使用此值）
  'pixel-clean': '201',          // 基础插画风格
  'bead-pattern': '201',         // 基础插画风格
  'cute-cartoon': '101',         // Q 版卡通（需核实 ID）
  'watercolor': '301',           // 水彩风格（需核实 ID）
  'illustration': '201',         // 基础插画风格
  'anime-soft': '108',           // 柔和动漫（需核实 ID）

  // 图片处理预设（不走风格化，但为了完整性保留）
  'clean-background': '201',
  'remove-background': '201',
  'color-optimize': '201',
  'reduce-noise': '201',
}

/**
 * 获取对应的腾讯混元风格 ID
 * 如果 presetId 未找到对应的 style，返回默认风格 "201"
 */
export function getStyleIdByPreset(presetId: string): string {
  return TENCENT_HUNYUAN_STYLE_MAP[presetId] || '201'
}

/**
 * 腾讯混元生图支持的所有风格 ID 列表（参考）
 * 请根据官方最新文档更新此列表
 *
 * 常见风格 ID（示例，需核实）：
 * - 101: 卡通风格
 * - 108: 柔和动漫
 * - 201: 插画风格
 * - 301: 水彩风格
 * - 401: 油画风格
 * 等...
 */
export const SUPPORTED_TENCENT_STYLES = ['101', '108', '201', '301', '401']
