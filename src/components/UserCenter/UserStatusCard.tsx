import type { User } from '../../types/user'

interface UserStatusCardProps {
  user: User | null
  isLoggedIn: boolean
  onLogin: () => void
  onLogout: () => void
}

export function UserStatusCard({ user, isLoggedIn, onLogin, onLogout }: UserStatusCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">用户状态</h3>

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
        💡 当前为 mock 模式，暂未接入真实登录系统
      </p>
    </div>
  )
}
