import { useState } from 'react'
import { MEMBER_ACCESS_CODE, ACCESS_CODE_VERSION, LITE_MODE_CONFIG } from '../../config/liteMode'

interface MemberAccessModalProps {
  isOpen: boolean
  onAccessGranted: () => void
}

export function MemberAccessModal({ isOpen, onAccessGranted }: MemberAccessModalProps) {
  const [inputCode, setInputCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // 模拟短暂延迟
    setTimeout(() => {
      if (inputCode.trim() === MEMBER_ACCESS_CODE) {
        // 保存访问权限和版本号到 localStorage
        localStorage.setItem(LITE_MODE_CONFIG.localStorageKeys.accessGranted, 'true')
        localStorage.setItem(LITE_MODE_CONFIG.localStorageKeys.accessCodeVersion, ACCESS_CODE_VERSION)
        localStorage.setItem(LITE_MODE_CONFIG.localStorageKeys.lastAccessTime, new Date().toISOString())
        onAccessGranted()
        setInputCode('')
      } else {
        setError('口令不正确，请重试')
      }
      setIsSubmitting(false)
    }, 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">🎉 会员体验版</h2>
          <p className="text-gray-600">
            欢迎使用哆啦拼豆图纸器 Lite 版本
          </p>
          <p className="mt-2 text-sm text-gray-500">
            早期内测版，仅供授权会员使用
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accessCode" className="block text-sm font-medium text-gray-700 mb-2">
              请输入访问口令
            </label>
            <input
              id="accessCode"
              type="password"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value)
                setError(null)
              }}
              placeholder="输入口令以继续"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !inputCode.trim()}
            className="w-full px-4 py-2 bg-pink-500 text-white font-medium rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '验证中...' : '进入'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            💡 如需访问权限，请联系客服
          </p>
        </div>
      </div>
    </div>
  )
}
