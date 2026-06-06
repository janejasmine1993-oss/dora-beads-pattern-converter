import { useState } from 'react'

interface AppHeaderProps {
  currentPage: 'home' | 'workspace'
  onNavigate: (page: 'home' | 'workspace') => void
  onFeatureClick: (feature: 'works' | 'membership' | 'redeem' | 'help' | 'login') => void
}

export function AppHeader({
  currentPage,
  onNavigate,
  onFeatureClick,
}: AppHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'home', label: '首页', page: 'home' as const },
    { id: 'workspace', label: '工作台', page: 'workspace' as const },
  ]

  const featureItems = [
    { id: 'works', label: '我的作品', feature: 'works' as const },
    { id: 'membership', label: '会员', feature: 'membership' as const },
    { id: 'help', label: '帮助', feature: 'help' as const },
    { id: 'redeem', label: '兑换码', feature: 'redeem' as const },
    { id: 'login', label: '内测登录', feature: 'login' as const },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🫧</span>
            <span className="font-bold text-gray-900">哆啦拼豆图纸</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.page)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.page
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {/* AI Credits Display */}
            <div className="px-3 py-1.5 bg-blue-50 rounded text-xs font-medium text-gray-700">
              AI 次数 --
            </div>

            {/* Feature Buttons */}
            <div className="flex items-center gap-2">
              {featureItems.slice(0, 3).map(item => (
                <button
                  key={item.id}
                  onClick={() => onFeatureClick(item.feature)}
                  className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Dropdown for more items */}
            <div className="relative group">
              <button className="text-xs text-gray-600 hover:text-gray-900 transition-colors px-2 py-1">
                更多 ▼
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {featureItems.slice(3).map(item => (
                  <button
                    key={item.id}
                    onClick={() => onFeatureClick(item.feature)}
                    className="block w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 first:rounded-t last:rounded-b"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-gray-900"
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
          <div className="md:hidden pb-4 border-t border-gray-200 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.page)
                  setMobileMenuOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 text-sm rounded transition-colors ${
                  currentPage === item.page
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="px-4 py-2 border-t border-gray-200 mt-2">
              <div className="text-xs text-gray-500 mb-2">AI 次数 --</div>
              {featureItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    onFeatureClick(item.feature)
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left px-2 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded"
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
