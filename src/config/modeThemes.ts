type ImportMode = 'photo-direct' | 'ai-enhanced' | 'pixel-grid' | 'existing-pattern'

export interface ModeTheme {
  name: string
  bgGradient: string
  borderColor: string
  accentColor: string
  badgeBg: string
  badgeText: string
}

export const modeThemes: Record<ImportMode, ModeTheme> = {
  'photo-direct': {
    name: '图片直转图纸',
    bgGradient: 'from-[#fff5f7] to-[#ffe8f0]',
    borderColor: 'border-[#ff9ec6]',
    accentColor: '#ff3f78',
    badgeBg: 'bg-[#ff3f78]',
    badgeText: 'text-white',
  },
  'ai-enhanced': {
    name: 'AI 优化后转图纸',
    bgGradient: 'from-[#fff9f3] to-[#ffe8d9]',
    borderColor: 'border-[#ffc66d]',
    accentColor: '#ff9f25',
    badgeBg: 'bg-[#ff9f25]',
    badgeText: 'text-white',
  },
  'pixel-grid': {
    name: '像素图转色号',
    bgGradient: 'from-[#f0fdf9] to-[#d1f5e8]',
    borderColor: 'border-[#5ee4c1]',
    accentColor: '#44c7a9',
    badgeBg: 'bg-[#44c7a9]',
    badgeText: 'text-white',
  },
  'existing-pattern': {
    name: '现有图纸再编辑',
    bgGradient: 'from-[#faf8ff] to-[#eae0ff]',
    borderColor: 'border-[#d4a5ff]',
    accentColor: '#8c55ff',
    badgeBg: 'bg-[#8c55ff]',
    badgeText: 'text-white',
  },
}
