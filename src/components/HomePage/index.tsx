type ImportMode = 'photo-direct' | 'ai-enhanced' | 'pixel-grid' | 'existing-pattern'

interface HomePageProps {
  onStartCreating: () => void
  onSelectMode: (mode: ImportMode) => void
}

interface ModeCard {
  id: ImportMode
  label: string
  title: string
  description: string
  bgColor: string
  bgGradient: string
}

const modes: ModeCard[] = [
  {
    id: 'photo-direct',
    label: '最常用',
    title: '图片直转图纸',
    description: '上传任意照片，自动匹配品牌色号，一键生成可打印的专业拼豆图纸。',
    bgColor: 'from-pink-100 to-pink-50',
    bgGradient: 'from-pink-500 to-pink-400',
  },
  {
    id: 'ai-enhanced',
    label: '推荐',
    title: 'AI 优化后转图纸',
    description: '先用 AI 去背景或风格化处理图片，再转成图纸，主体更干净，颜色更准。',
    bgColor: 'from-orange-100 to-orange-50',
    bgGradient: 'from-orange-500 to-orange-400',
  },
  {
    id: 'pixel-grid',
    label: '工具',
    title: '像素图转色号',
    description: '上传已有像素格子图，通过格子校准精确对齐，自动识别并匹配最合适的品牌色号。',
    bgColor: 'from-green-100 to-green-50',
    bgGradient: 'from-green-500 to-green-400',
  },
  {
    id: 'existing-pattern',
    label: '进阶',
    title: '已有图纸再编辑',
    description: '导入旧版拼豆图纸，还原为可编辑格子矩阵，重新修改并导出，创作更自由。',
    bgColor: 'from-purple-100 to-purple-50',
    bgGradient: 'from-purple-500 to-purple-400',
  },
]

export function HomePage({ onStartCreating, onSelectMode }: HomePageProps) {
  function handleModeSelect(mode: ImportMode) {
    onSelectMode(mode)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-pink-200 to-pink-100 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-40 left-10 w-96 h-96 bg-gradient-to-br from-purple-200 to-purple-100 rounded-full opacity-20 blur-3xl" />

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="mb-4 inline-block px-3 py-1 bg-pink-200 rounded-full text-xs font-semibold text-pink-700">
                ✨ 开启拼豆创作新体验
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                <span className="text-gray-900">图片一键转</span>
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent"> 拼豆图纸</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                支持品牌色号匹配 · AI 优化处理 · 图纸自由编辑 · 专业导出
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onStartCreating}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-full hover:shadow-lg transition-all transform hover:scale-105 text-base"
                >
                  开始制作图纸 →
                </button>
                <button
                  onClick={onStartCreating}
                  className="px-8 py-3 bg-white text-pink-600 font-semibold rounded-full border-2 border-pink-300 hover:bg-pink-50 transition-all text-base"
                >
                  查看功能介绍
                </button>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-300 to-purple-300 rounded-3xl opacity-10 blur-2xl" />
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src="/src/assets/hero.png"
                  alt="拼豆视觉"
                  className="max-w-xs drop-shadow-lg hover:drop-shadow-xl transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Import Modes Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            四种导入方式
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modes.map(mode => (
              <div
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className="group cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${mode.bgColor} rounded-3xl p-8 h-full border-2 border-white hover:border-pink-200 hover:shadow-xl transition-all transform hover:-translate-y-2`}>
                  {/* Label Tag */}
                  <div className={`inline-block px-3 py-1 bg-gradient-to-r ${mode.bgGradient} text-white rounded-full text-xs font-semibold mb-4`}>
                    {mode.label}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {mode.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                    {mode.description}
                  </p>

                  {/* Arrow Button */}
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleModeSelect(mode.id)
                    }}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:text-pink-600 transition-colors"
                  >
                    进入 <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Slogan Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-3xl p-12 border-2 border-pink-200">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  让每一颗拼豆，都更有创意与温度
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
                    <span className="text-gray-700 font-medium">精准色号匹配</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
                    <span className="text-gray-700 font-medium">专业图纸输出</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
                    <span className="text-gray-700 font-medium">轻松上手使用</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-6xl">🐼</div>
                <p className="text-sm text-gray-600 mt-2">熊猫陪伴您的创作</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gradient-to-r from-gray-900 to-gray-800 text-gray-400 text-center text-sm relative z-10">
        <p className="font-medium">哆啦拼豆图纸转换器</p>
        <p className="mt-2">品牌色号来自各厂商官方数据，仅用于学习参考</p>
        <p className="mt-3 text-xs">v0.6.2 · 内测版本</p>
      </footer>
    </div>
  )
}
