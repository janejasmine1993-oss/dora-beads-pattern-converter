interface Membership {
  level: 'free' | 'monthly' | 'yearly' | 'lifetime'
  status: string
  startedAt: string
  expiresAt: string | null
  benefits: {
    dailyAiCredits: number
    maxWorks: number
    canHdExport: boolean
    canBatchManage: boolean
  }
}

interface MembershipCardProps {
  membership: Membership | null
  daysUntilExpiry: number
  loading?: boolean
  error?: string | null
  onUpgrade?: (level: 'free' | 'monthly' | 'yearly' | 'lifetime') => void
}

const LEVEL_NAMES = {
  free: '免费用户',
  monthly: '月会员',
  yearly: '年会员',
  lifetime: '永久会员',
}

export function MembershipCard({
  membership,
  daysUntilExpiry,
  loading,
  error,
  onUpgrade,
}: MembershipCardProps) {
  if (!membership) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 opacity-50">
        <p className="text-gray-500 text-sm">请先登录查看会员信息</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-4 mb-4 bg-red-50">
        <p className="text-red-600 text-sm">❌ {error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">会员中心（服务端数据）</h3>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
        <p className="text-sm font-semibold text-blue-900 mb-1">{LEVEL_NAMES[membership.level]}</p>
        <p className="text-xs text-blue-700">
          {membership.expiresAt ? (
            daysUntilExpiry > 0 ? `距过期还剩 ${daysUntilExpiry} 天` : '已过期'
          ) : (
            '永久有效'
          )}
        </p>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <p className="text-gray-600">
          <span className="font-semibold">每日 AI 次数：</span>
          {membership.benefits.dailyAiCredits === 500 ? '无限' : membership.benefits.dailyAiCredits} 次
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">可保存作品数：</span>
          {membership.benefits.maxWorks === -1 ? '无限' : membership.benefits.maxWorks} 个
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">高清导出：</span>
          {membership.benefits.canHdExport ? '✅ 支持' : '❌ 不支持'}
        </p>
      </div>

      {onUpgrade && (
        <div className="border-t border-gray-200 pt-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">🧪 开发测试：升级会员</p>
          <div className="grid grid-cols-2 gap-2">
            {(['free', 'monthly', 'yearly', 'lifetime'] as const).map(level => (
              <button
                key={level}
                onClick={() => onUpgrade(level)}
                disabled={membership.level === level || loading}
                className={`px-2 py-1 text-xs rounded transition ${
                  membership.level === level || loading
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'border border-blue-300 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {loading ? '处理中...' : `升为${LEVEL_NAMES[level]}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
        ✨ 从服务端读取，支持真实支付升级
      </p>
    </div>
  )
}
