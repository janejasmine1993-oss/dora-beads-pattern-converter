type ImportMode = 'photo-direct' | 'ai-enhanced' | 'pixel-grid' | 'existing-pattern'

interface HomePageProps {
  onStartCreating: () => void
  onSelectMode: (mode: ImportMode) => void
}

interface ModeCard {
  id: ImportMode
  title: string
  description: string
  scenario: string
  icon: string
}

const modes: ModeCard[] = [
  {
    id: 'photo-direct',
    title: '图片直转图纸',
    description: '上传照片或手绘稿',
    scenario: '快速生成专业图纸',
    icon: '📸',
  },
  {
    id: 'ai-enhanced',
    title: 'AI 优化后转图纸',
    description: '智能去背景和风格转换',
    scenario: '优化图片质量后生成',
    icon: '🤖',
  },
  {
    id: 'pixel-grid',
    title: '像素图转色号',
    description: '手动设置网格参数',
    scenario: '精确识别像素图的色号',
    icon: '🔲',
  },
  {
    id: 'existing-pattern',
    title: '已有图纸再编辑',
    description: '导入既有拼豆图纸',
    scenario: '继续编辑和优化',
    icon: '📋',
  },
]

const highlights = [
  { title: '品牌色号匹配', description: '支持 20+ 品牌色卡' },
  { title: 'AI 优化入口', description: '多种风格化处理' },
  { title: '图纸自由编辑', description: '完整的编辑工具集' },
  { title: '专业 PNG 导出', description: '高保真色号和水印' },
]

export function HomePage({ onStartCreating, onSelectMode }: HomePageProps) {
  function handleModeSelect(mode: ImportMode) {
    onSelectMode(mode)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl mb-4">🫧</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            图片一键转拼豆图纸
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            支持品牌色号匹配、AI 优化、图纸编辑和专业导出
          </p>
          <button
            onClick={onStartCreating}
            className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-lg"
          >
            开始制作图纸
          </button>
        </div>
      </section>

      {/* Import Modes Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            四种导入方式
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modes.map(mode => (
              <div
                key={mode.id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleModeSelect(mode.id)}
              >
                <div className="text-4xl mb-3">{mode.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {mode.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {mode.description}
                </p>
                <p className="text-xs text-gray-500 mb-4 italic">
                  {mode.scenario}
                </p>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleModeSelect(mode.id)
                  }}
                  className="w-full py-2 px-3 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                >
                  进入
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            核心功能亮点
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-6 border border-gray-200 text-center hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {h.title}
                </h3>
                <p className="text-sm text-gray-600">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            现在就开始设计
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            支持多种品牌、自由编辑、专业导出
          </p>
          <button
            onClick={onStartCreating}
            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-lg"
          >
            前往工作台
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center text-sm">
        <p>哆啦拼豆图纸转换器 v0.6.0 · 内测版本</p>
        <p className="mt-2">品牌色号来自各厂商官方数据，仅用于学习参考</p>
      </footer>
    </div>
  )
}
