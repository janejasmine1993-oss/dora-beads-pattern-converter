import type { AiStylePreset, AiProcessPreset, AiStylePresetConfig, AiStyleRequest, AiStyleResult, AiPreset } from '../../types/aiStyle'
import { membershipMockService } from './membershipMockService'
import { creditsMockService } from './creditsMockService'

const LOCAL_STORAGE_HISTORY_KEY = 'dora_ai_style_history'

export const AI_PROCESS_PRESETS: Record<AiProcessPreset, AiStylePresetConfig> = {
  'remove-background': {
    id: 'remove-background',
    name: '去除背景',
    description: '移除图片背景，保留主体对象',
    suitableFor: '人物、物体、产品照',
    isMemberOnly: false,
    creditCost: 1,
    category: 'process',
  },
  'clean-background': {
    id: 'clean-background',
    name: '清理杂乱背景',
    description: '简化复杂背景，使主体更突出',
    suitableFor: '背景复杂的照片、风景图',
    isMemberOnly: false,
    creditCost: 1,
    category: 'process',
  },
  'enhance-clarity': {
    id: 'enhance-clarity',
    name: '提高清晰度',
    description: '增强图片清晰度和细节',
    suitableFor: '模糊、低清图片',
    isMemberOnly: true,
    creditCost: 2,
    category: 'process',
  },
  'color-optimize': {
    id: 'color-optimize',
    name: '颜色优化',
    description: '自动调整色彩平衡和饱和度',
    suitableFor: '色彩失衡、过度曝光的照片',
    isMemberOnly: true,
    creditCost: 1,
    category: 'process',
  },
  'reduce-noise': {
    id: 'reduce-noise',
    name: '减少杂色',
    description: '降低图片噪点和颗粒感',
    suitableFor: '高感光 ISO 拍摄的照片',
    isMemberOnly: true,
    creditCost: 2,
    category: 'process',
  },
}

export const AI_STYLE_PRESETS: Record<AiStylePreset, AiStylePresetConfig> = {
  'pixel-clean': {
    id: 'pixel-clean',
    name: '干净像素风',
    description: '适合把原图整理成更清晰、更适合拼豆转换的像素风格',
    suitableFor: '头像、图标、小动物、简单插画',
    isMemberOnly: false,
    creditCost: 1,
    category: 'style',
  },
  'bead-pattern': {
    id: 'bead-pattern',
    name: '拼豆图纸优化',
    description: '优化图片使其更适合转换成拼豆图纸',
    suitableFor: '各种拼豆图案设计',
    isMemberOnly: false,
    creditCost: 1,
    category: 'style',
  },
  'illustration': {
    id: 'illustration',
    name: '插画风格',
    description: '转换为温暖的插画风格',
    suitableFor: '创意插画、角色设计',
    isMemberOnly: true,
    creditCost: 3,
    category: 'style',
  },
  'cute-cartoon': {
    id: 'cute-cartoon',
    name: 'Q版卡通',
    description: '转换为可爱的卡通风格',
    suitableFor: '角色、小物件',
    isMemberOnly: true,
    creditCost: 3,
    category: 'style',
  },
  'flat-icon': {
    id: 'flat-icon',
    name: '扁平图标',
    description: '转换为现代扁平风格的图标',
    suitableFor: '图标、logo',
    isMemberOnly: true,
    creditCost: 2,
    category: 'style',
  },
  'anime-soft': {
    id: 'anime-soft',
    name: '柔和动漫风',
    description: '柔和的动画风格处理',
    suitableFor: '人物、角色',
    isMemberOnly: true,
    creditCost: 3,
    category: 'style',
  },
  'watercolor': {
    id: 'watercolor',
    name: '水彩风',
    description: '转换为水彩画的笔触效果',
    suitableFor: '风景、静物',
    isMemberOnly: true,
    creditCost: 5,
    category: 'style',
  },
  'chinese-flower-map': {
    id: 'chinese-flower-map',
    name: '繁花中国地图风',
    description: '转换为传统中式花纹样式',
    suitableFor: '传统纹样、装饰图案',
    isMemberOnly: true,
    creditCost: 5,
    category: 'style',
  },
}

export interface AiStyleHistory {
  userId: string
  results: AiStyleResult[]
}

export const aiStyleMockService = {
  // 获取所有预设
  getAllPresets(): AiStylePresetConfig[] {
    return [
      ...Object.values(AI_PROCESS_PRESETS),
      ...Object.values(AI_STYLE_PRESETS),
    ]
  },

  // 获取单个预设
  getPreset(presetId: AiPreset): AiStylePresetConfig | null {
    return AI_PROCESS_PRESETS[presetId as AiProcessPreset] || AI_STYLE_PRESETS[presetId as AiStylePreset] || null
  },

  // 获取所有图片处理预设
  getProcessPresets(): AiStylePresetConfig[] {
    return Object.values(AI_PROCESS_PRESETS)
  },

  // 获取所有风格转换预设
  getStylePresets(): AiStylePresetConfig[] {
    return Object.values(AI_STYLE_PRESETS)
  },

  // 获取免费预设
  getFreePresets(): AiStylePresetConfig[] {
    return this.getAllPresets().filter(p => !p.isMemberOnly)
  },

  // 获取会员专属预设
  getMemberPresets(): AiStylePresetConfig[] {
    return this.getAllPresets().filter(p => p.isMemberOnly)
  },

  // 模拟 AI 风格化请求
  async mockStyleTransfer(userId: string, request: AiStyleRequest): Promise<AiStyleResult> {
    // 检查用户是否登录
    if (!userId) {
      throw new Error('请先登录后再使用 AI 风格化功能')
    }

    // 检查是否上传了图片
    if (!request.sourceImage) {
      throw new Error('请先上传图片')
    }

    const preset = this.getPreset(request.presetId)
    if (!preset) {
      throw new Error('不支持的风格预设')
    }

    // 检查会员权限
    const membership = membershipMockService.getMembership(userId)
    if (preset.isMemberOnly && membership.level === 'free') {
      throw new Error('该功能为会员专属，请先升级会员')
    }

    // 检查 AI 次数
    const credits = creditsMockService.getCredits(userId)
    if (credits.dailyRemaining + credits.extraCredits < preset.creditCost) {
      throw new Error('今日 AI 次数不足，可升级会员或使用兑换码')
    }

    // 消耗次数
    creditsMockService.consumeCredit(userId, preset.creditCost)

    // 模拟处理延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 500))

    // 返回 mock 结果
    const result: AiStyleResult = {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'success',
      presetId: request.presetId,
      sourceImage: request.sourceImage,
      message: `AI ${preset.category === 'process' ? '处理' : '风格化'} mock 已完成：${preset.name}`,
      creditCost: preset.creditCost,
      createdAt: new Date().toISOString(),
    }

    // 保存到历史记录
    this.addToHistory(userId, result)

    return result
  },

  // 获取历史记录
  getHistory(userId: string): AiStyleResult[] {
    const stored = localStorage.getItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`)
    if (stored) {
      try {
        const history = JSON.parse(stored) as AiStyleHistory
        return history.results || []
      } catch {
        return []
      }
    }
    return []
  },

  // 添加到历史记录
  addToHistory(userId: string, result: AiStyleResult): void {
    const results = this.getHistory(userId)
    results.unshift(result) // 新的在最前面
    results.splice(100) // 只保留最近 100 条
    const history: AiStyleHistory = { userId, results }
    localStorage.setItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`, JSON.stringify(history))
  },

  // 清除历史（仅用于测试）
  clearHistory(userId: string): void {
    localStorage.removeItem(`${LOCAL_STORAGE_HISTORY_KEY}_${userId}`)
  },
}
