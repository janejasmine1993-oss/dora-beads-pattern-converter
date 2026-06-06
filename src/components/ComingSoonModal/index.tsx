interface ComingSoonModalProps {
  isOpen: boolean
  feature: 'works' | 'membership' | 'redeem' | 'help' | 'login'
  onClose: () => void
}

const featureMessages: Record<string, { title: string; description: string }> = {
  works: {
    title: '我的作品',
    description: '我的作品功能即将开放，敬请期待！',
  },
  membership: {
    title: '会员中心',
    description: '会员内测即将开放，敬请期待！',
  },
  redeem: {
    title: '兑换码',
    description: '内测兑换码功能即将开放，敬请期待！',
  },
  help: {
    title: '帮助中心',
    description: '帮助中心即将开放，敬请期待！',
  },
  login: {
    title: '内测登录',
    description: '内测登录功能即将开放，敬请期待！',
  },
}

export function ComingSoonModal({ isOpen, feature, onClose }: ComingSoonModalProps) {
  if (!isOpen) return null

  const message = featureMessages[feature]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {message.title}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {message.description}
          </p>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </>
  )
}
