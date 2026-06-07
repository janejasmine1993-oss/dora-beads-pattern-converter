import { useState } from 'react'

interface AppHeaderProps {
  currentPage: 'home' | 'workspace'
  onNavigate: (page: 'home' | 'workspace') => void
  onFeatureClick: (feature: 'works' | 'membership' | 'redeem' | 'help' | 'login') => void
}

type HeaderNavItem =
  | { id: string; label: string; page: 'home' | 'workspace' }
  | { id: string; label: string; feature: 'works' | 'membership' | 'help' }

export function AppHeader({
  currentPage,
  onNavigate,
  onFeatureClick,
}: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems: HeaderNavItem[] = [
    { id: 'home', label: '首页', page: 'home' as const },
    { id: 'workspace', label: '工作台', page: 'workspace' as const },
    { id: 'works', label: '我的作品', feature: 'works' as const },
    { id: 'membership', label: '会员', feature: 'membership' as const },
    { id: 'help', label: '帮助', feature: 'help' as const },
  ]

  const featureItems = [
    { id: 'redeem', label: '兑换码', feature: 'redeem' as const },
    { id: 'login', label: '内测登录', feature: 'login' as const },
  ]

  return (
    <header className="sticky top-0 z-30 bg-[#fffafc]/88 backdrop-blur-xl">
      <div className="mx-auto max-w-[1448px] px-3 sm:px-4">
        <div className="flex min-h-[82px] items-center justify-between gap-4 rounded-b-[24px] border-x border-b border-white/80 bg-white/78 px-4 shadow-[0_10px_32px_rgba(255,89,138,0.08)] sm:px-7">
          {/* Logo */}
          <button
            type="button"
            className="flex shrink-0 items-center gap-3"
            onClick={() => onNavigate('home')}
            aria-label="返回首页"
          >
            <img
              src="/assets/home/logo-panda.png"
              alt=""
              className="h-[54px] w-[54px] rounded-2xl object-cover shadow-[0_8px_18px_rgba(255,69,124,0.20)]"
            />
            <span className="hidden text-[27px] font-black leading-none text-[#ff2f70] sm:inline">
              哆啦拼豆图纸
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-4 lg:flex">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if ('page' in item) onNavigate(item.page)
                  else onFeatureClick(item.feature)
                }}
                className={`min-w-[74px] rounded-full px-5 py-3 text-base font-bold transition-all ${
                  'page' in item && currentPage === item.page
                    ? 'bg-[#ffe7ef] text-[#ff2f70] shadow-[inset_0_0_0_1px_rgba(255,111,151,0.14)]'
                    : 'text-[#435672] hover:bg-[#fff0f5] hover:text-[#ff2f70]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden shrink-0 items-center gap-4 md:flex">
            {/* AI Credits Display */}
            <div className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#f6e9ff] to-[#f0e6ff] px-5 text-base font-bold text-[#8d49df] shadow-[0_8px_18px_rgba(139,88,214,0.12)]">
              <span aria-hidden="true">✦</span>
              AI 次数 12
            </div>

            {/* Redeem Button */}
            <button
              onClick={() => onFeatureClick('redeem')}
              className="min-h-12 rounded-full border-2 border-[#ff5d91] bg-white px-6 text-base font-bold text-[#ff2f70] shadow-[0_8px_18px_rgba(255,95,144,0.10)] transition hover:-translate-y-0.5 hover:bg-[#fff5f8]"
            >
              兑换码
            </button>

            <button
              onClick={() => onFeatureClick('login')}
              className="min-h-12 rounded-full bg-gradient-to-r from-[#ff2f70] to-[#f51f66] px-7 text-base font-bold text-white shadow-[0_12px_24px_rgba(245,38,104,0.25)] transition hover:-translate-y-0.5"
            >
              内测登录
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full border border-[#ffd8e4] bg-white/80 p-2 text-[#ff2f70] shadow-sm md:hidden"
            aria-label="打开导航菜单"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  mobileMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="space-y-2 border-t border-pink-100 bg-white/92 px-4 pb-4 pt-3 md:hidden">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if ('page' in item) onNavigate(item.page)
                  else onFeatureClick(item.feature)
                  setMobileMenuOpen(false)
                }}
                className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                  'page' in item && currentPage === item.page
                    ? 'bg-pink-50 text-pink-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="px-4 py-2 border-t border-pink-100 mt-2">
              <div className="mb-2 text-xs font-bold text-[#8d49df]">AI 次数 12</div>
              {featureItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onFeatureClick(item.feature)
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-2 py-2 text-xs text-gray-600 hover:text-pink-600 rounded transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
