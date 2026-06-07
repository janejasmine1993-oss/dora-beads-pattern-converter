import type { MembershipMock, MembershipLevel } from '../../services/mock/membershipMockService'

interface MembershipCardProps {
  membership: MembershipMock | null
  daysUntilExpiry: number
  allLevels: MembershipLevel[]
  getBenefits: (level: MembershipLevel) => any
  onUpgrade: (level: MembershipLevel) => void
}

export function MembershipCard({
  membership,
  daysUntilExpiry,
  allLevels,
  getBenefits,
  onUpgrade,
}: MembershipCardProps) {
  if (!membership) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 opacity-50">
        <p className="text-gray-500 text-sm">请先登录查看会员信息</p>
      </div>
    )
  }

  const currentBenefits = getBenefits(membership.level)
  const levelNames: Record<MembershipLevel, string> = {
    free: '免费用户',
    monthly: '月会员',
    yearly: '年会员',
    lifetime: '永久会员',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">会员中心</h3>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
        <p className="text-sm font-semibold text-blue-900 mb-1">{levelNames[membership.level]}</p>
        <p className="text-xs text-blue-700">
          {daysUntilExpiry > 0 ? `距过期还剩 ${daysUntilExpiry} 天` : '已过期'}
        </p>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <p className="text-gray-600">
          <span className="font-semibold">每日 AI 次数：</span>
          {currentBenefits.dailyAiLimit === Infinity ? '无限' : currentBenefits.dailyAiLimit} 次
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">可保存作品数：</span>
          {currentBenefits.maxSavedWorks === Infinity ? '无限' : currentBenefits.maxSavedWorks} 个
        </p>
        <p className="text-gray-600">
          <span className="font-semibold">高清导出：</span>
          {currentBenefits.canHighQualityExport ? '✅ 支持' : '❌ 不支持'}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">模拟升级会员</p>
        <div className="grid grid-cols-2 gap-2">
          {allLevels.map(level => (
            <button
              key={level}
              onClick={() => onUpgrade(level)}
              disabled={membership.level === level}
              className={`px-2 py-1 text-xs rounded transition ${
                membership.level === level
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'border border-blue-300 text-blue-600 hover:bg-blue-50'
              }`}
            >
              升为{levelNames[level]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
        💡 当前为 mock 模式，暂无真实支付
      </p>
    </div>
  )
}
