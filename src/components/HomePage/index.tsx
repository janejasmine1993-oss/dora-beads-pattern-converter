type ImportMode = 'photo-direct' | 'ai-enhanced' | 'pixel-grid' | 'existing-pattern'

interface HomePageProps {
  onStartCreating: () => void
  onSelectMode: (mode: ImportMode) => void
}

interface FeatureCard {
  id: ImportMode
  title: string
  label: string
  description: string
  image: string
  arrowClass: string
  labelBgColor: string
}

const HOME_ASSET_PATH = '/assets/home'

const featureCards: FeatureCard[] = [
  {
    id: 'photo-direct',
    title: '图片直转图纸',
    label: '最常用',
    description: '上传任意照片，自动匹配品牌色号，一键生成可打印的专业拼豆图纸。',
    image: `${HOME_ASSET_PATH}/feature-card-direct.png`,
    arrowClass: 'from-[#ff3f78] to-[#ff78a7]',
    labelBgColor: 'bg-[#ff3f78]',
  },
  {
    id: 'ai-enhanced',
    title: 'AI 优化后转图纸',
    label: '推荐',
    description: '先用 AI 去背景或风格化处理图片，再转成图纸，主体更清晰，颜色更准确。',
    image: `${HOME_ASSET_PATH}/feature-card-ai.png`,
    arrowClass: 'from-[#ff9f25] to-[#ffbd4a]',
    labelBgColor: 'bg-[#ff9f25]',
  },
  {
    id: 'pixel-grid',
    title: '像素图转色号',
    label: '工具',
    description: '上传已有像素格子图，通过格子校准精确对齐，自动识别并匹配最合适的品牌色号。',
    image: `${HOME_ASSET_PATH}/feature-card-pixel.png`,
    arrowClass: 'from-[#44c7a9] to-[#70dcc6]',
    labelBgColor: 'bg-[#44c7a9]',
  },
  {
    id: 'existing-pattern',
    title: '现有图纸再编辑',
    label: '进阶',
    description: '导入旧版拼豆图纸，为可编辑格子矩阵，重新修改并导出，创作更自由。',
    image: `${HOME_ASSET_PATH}/feature-card-edit.png`,
    arrowClass: 'from-[#8c55ff] to-[#bb63ff]',
    labelBgColor: 'bg-[#8c55ff]',
  },
]

const tagItems = [
  '品牌色号精准匹配',
  'AI 智能优化',
  '自由编辑调整',
  '多格式专业导出',
]

function HomeHero({ onStartCreating }: { onStartCreating: () => void }) {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1448px]">
        <div className="relative min-h-[482px] overflow-hidden bg-[#fff7f6] md:min-h-[485px]">
          <img
            src={`${HOME_ASSET_PATH}/hero-illustration.png`}
            alt="拼豆创作插画"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="relative z-10 flex min-h-[482px] max-w-[760px] flex-col justify-center px-7 py-16 sm:px-12 md:min-h-[485px] md:px-[92px]">
            <h1 className="max-w-[720px] text-[42px] font-black leading-[1.08] tracking-normal text-[#102b45] drop-shadow-[0_2px_0_rgba(255,255,255,0.85)] sm:text-[54px] md:whitespace-nowrap md:text-[62px]">
              图片一键转
              <span className="text-[#f82d69]">拼豆图纸</span>
            </h1>
            <p className="mt-5 max-w-[690px] text-base font-semibold leading-relaxed text-[#315d84] sm:text-[21px] md:whitespace-nowrap">
              支持品牌色号匹配 · AI 优化处理 · 图纸自由编辑 · 专业导出
            </p>

            <div className="mt-9 flex flex-wrap gap-5">
              <button
                onClick={onStartCreating}
                className="inline-flex min-h-16 items-center justify-center gap-4 rounded-full bg-gradient-to-r from-[#ff2d70] to-[#ff4a83] px-9 text-lg font-bold text-white shadow-[0_16px_32px_rgba(247,45,105,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(247,45,105,0.38)]"
              >
                <span aria-hidden="true">✦</span>
                开始制作图纸
                <span aria-hidden="true" className="text-2xl leading-none">→</span>
              </button>
              <button
                onClick={() => document.getElementById('home-features')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex min-h-16 items-center justify-center gap-3 rounded-full border-2 border-[#ff5c90] bg-white/84 px-8 text-lg font-bold text-[#f72d6a] shadow-[0_10px_24px_rgba(255,110,150,0.12)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
              >
                <span aria-hidden="true">▣</span>
                查看功能介绍
              </button>
            </div>

            <div className="mt-10 grid max-w-[720px] grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap">
              {tagItems.map((tag, index) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#4e6682]"
                >
                  <span
                    aria-hidden="true"
                    className={[
                      'flex h-8 w-8 items-center justify-center rounded-xl bg-white/82 text-base shadow-[0_5px_15px_rgba(242,78,132,0.14)]',
                      index === 0 ? 'text-[#f94c7d]' : '',
                      index === 1 ? 'text-[#9d67ff]' : '',
                      index === 2 ? 'text-[#4b9ef0]' : '',
                      index === 3 ? 'text-[#945dff]' : '',
                    ].join(' ')}
                  >
                    {['◉', '✦', '✎', '▤'][index]}
                  </span>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HomeFeatureCards({ onSelectMode }: { onSelectMode: (mode: ImportMode) => void }) {
  return (
    <section id="home-features" className="px-6 py-6 sm:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {featureCards.map(card => (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectMode(card.id)}
            className="group relative aspect-[1.08/1] overflow-hidden rounded-[24px] border border-white/90 bg-white text-left shadow-[0_14px_34px_rgba(100,86,111,0.11)] transition hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(100,86,111,0.16)]"
          >
            <img
              src={card.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <h2 className="absolute left-7 right-[88px] top-[30px] z-10 text-center text-[21px] font-black leading-tight text-[#182942]">
              {card.title}
            </h2>
            <span className={`absolute right-[34px] top-[28px] z-10 inline-flex h-[26px] items-center justify-center rounded-full px-[14px] text-center text-[13px] font-bold leading-none text-white ${card.labelBgColor}`}>
              {card.label}
            </span>
            <p className="absolute bottom-[38px] left-7 z-10 max-w-[218px] text-[15px] font-semibold leading-[1.72] text-[#48647f]">
              {card.description}
            </p>
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute z-20 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br ${card.arrowClass} text-[38px] font-bold leading-none text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] ring-[4px] ring-white ring-opacity-90 transition right-[22px] bottom-[22px] group-hover:translate-x-1`}
            >
              →
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function HomeSloganStrip() {
  const sellingPoints = ['精准色号匹配', '专业图纸输出', '轻松上手使用']

  return (
    <section className="px-6 pb-10 pt-4 sm:px-8">
      <div className="mx-auto max-w-[1368px]">
        <div className="relative min-h-[104px] overflow-hidden rounded-[32px]">
          <img
            src={`${HOME_ASSET_PATH}/slogan-strip.png`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="relative z-10 flex min-h-[104px] flex-col items-center justify-center gap-5 px-8 py-6 lg:flex-row lg:justify-end lg:gap-16 lg:pl-[260px] lg:pr-14">
            <h2 className="text-center text-[22px] font-black leading-tight text-[#ff2f70] sm:text-[26px]">
              让每一颗拼豆，都更有创意与温度
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-bold text-[#536c87] sm:text-base">
              {sellingPoints.map((point, index) => (
                <span key={point} className="inline-flex items-center gap-3">
                  <span className="text-lg text-[#ff3f78]" aria-hidden="true">
                    {['◉', '☆', '☺'][index]}
                  </span>
                  {point}
                  {index < sellingPoints.length - 1 && (
                    <span className="hidden h-5 w-px bg-[#91a6bd]/55 sm:inline-block" aria-hidden="true" />
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomePage({ onStartCreating, onSelectMode }: HomePageProps) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f7_0%,#fffefe_42%,#fff7fb_100%)]">
      <HomeHero onStartCreating={onStartCreating} />
      <HomeFeatureCards onSelectMode={onSelectMode} />
      <HomeSloganStrip />
    </main>
  )
}
