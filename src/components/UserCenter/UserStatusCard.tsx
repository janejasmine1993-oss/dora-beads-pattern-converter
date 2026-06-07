import { useState } from 'react'
import type { User } from '../../types/user'
import { authRuntimeConfig } from '../../services/auth/authRuntimeConfig'

interface UserStatusCardProps {
  user: User | null
  isLoggedIn: boolean
  isSubmitting?: boolean
  onLogin?: () => void
  onLoginWithEmail?: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  onRegister?: (email: string, password: string, nickname: string) => Promise<{ success: boolean; error?: string }>
  onLogout: () => void | Promise<void>
}

export function UserStatusCard({ user, isLoggedIn, isSubmitting, onLogin, onLoginWithEmail, onRegister, onLogout }: UserStatusCardProps) {
  const [formTab, setFormTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isMockMode = authRuntimeConfig.mode === 'mock'

  const handleLogin = async () => {
    if (!onLoginWithEmail) return
    setError(null)
    const result = await onLoginWithEmail(email, password)
    if (!result.success) {
      setError(result.error || '登录失败')
    }
  }

  const handleRegister = async () => {
    if (!onRegister) return
    setError(null)
    const result = await onRegister(email, password, nickname)
    if (!result.success) {
      setError(result.error || '注册失败')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">用户状态</h3>

      {isMockMode ? (
        // Mock 模式：保留原有行为
        <>
          {!isLoggedIn ? (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">当前状态：游客</p>
              <button
                onClick={onLogin}
                className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition"
              >
                模拟登录
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">状态：</span>已登录
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">昵称：</span>
                {user?.nickname}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">ID：</span>
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{user?.id}</code>
              </p>
              <button
                onClick={onLogout}
                className="w-full mt-3 px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 transition"
              >
                退出登录
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
            💡 当前为 Mock 登录模式
          </p>
        </>
      ) : (
        // Real 模式：显示真实登录表单
        <>
          {!isLoggedIn ? (
            <div>
              {/* Tab 切换 */}
              <div className="flex gap-2 mb-4 border-b border-gray-200">
                <button
                  onClick={() => { setFormTab('login'); setError(null) }}
                  className={`pb-2 text-sm font-medium transition border-b-2 ${
                    formTab === 'login' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                  }`}
                >
                  登录
                </button>
                <button
                  onClick={() => { setFormTab('register'); setError(null) }}
                  className={`pb-2 text-sm font-medium transition border-b-2 ${
                    formTab === 'register' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'
                  }`}
                >
                  注册
                </button>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  {error}
                </div>
              )}

              {formTab === 'login' ? (
                // 登录表单
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="密码"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleLogin}
                    disabled={isSubmitting || !email || !password}
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {isSubmitting ? '登录中...' : '登录'}
                  </button>
                </div>
              ) : (
                // 注册表单
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="昵称"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="邮箱"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="密码（至少 6 位）"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleRegister}
                    disabled={isSubmitting || !email || !password || !nickname || password.length < 6}
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {isSubmitting ? '注册中...' : '注册'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 已登录状态
            <div className="space-y-2">
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">✅ 已登录</span>
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">昵称：</span>
                {user?.nickname}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">邮箱：</span>
                {user?.email}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">用户ID：</span>
                <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{user?.id}</code>
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-semibold">登录方式：</span>
                邮箱登录
              </p>
              <button
                onClick={onLogout}
                className="w-full mt-3 px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 transition"
              >
                退出登录
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
            🔒 邮箱密码已安全加密存储
          </p>
        </>
      )}
    </div>
  )
}
