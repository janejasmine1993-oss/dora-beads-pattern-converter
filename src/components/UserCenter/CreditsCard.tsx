import type { AiCredits } from '../../types/work'

interface CreditsCardProps {
  credits: AiCredits | null
  onConsume: () => void
  onReset: () => void
}

export function CreditsCard({ credits, onConsume, onReset }: CreditsCardProps) {
  if (!credits) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 opacity-50">
        <p className="text-gray-500 text-sm">请先登录查看 AI 次数</p>
      </div>
    )
  }

  const totalAvailable = credits.dailyRemaining + credits.extraCredits
  const usagePercentage = (credits.dailyUsed / credits.dailyTotal) * 100

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">AI 次数</h3>

      <div className="space-y-3">
        {/* 今日次数进度条 */}
        <div>
          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
            <span>今日使用</span>
            <span>
              {credits.dailyUsed} / {credits.dailyTotal}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>

        {/* 次数概览 */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-1">
          <p className="text-sm font-semibold text-blue-900">
            今日剩余：<span className="text-lg">{credits.dailyRemaining}</span> 次
          </p>
          {credits.extraCredits > 0 && (
            <p className="text-xs text-blue-700">+ 额外赠送 {credits.extraCredits} 次</p>
          )}
          {totalAvailable > 0 && (
            <p className="text-xs text-blue-700">总可用：{totalAvailable} 次</p>
          )}
        </div>

        {/* 重置时间 */}
        <p className="text-xs text-gray-500">
          重置时间：{new Date(credits.resetAt).toLocaleTimeString('zh-CN')}
        </p>
      </div>

      <div className="border-t border-gray-200 mt-3 pt-3 space-y-2">
        <button
          onClick={onConsume}
          disabled={totalAvailable === 0}
          className={`w-full px-3 py-2 text-sm rounded transition ${
            totalAvailable === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          模拟消耗 1 次
        </button>
        <button
          onClick={onReset}
          className="w-full px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition"
        >
          重置今日次数
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
        💡 当前为 mock 模式，用于测试次数限制逻辑
      </p>
    </div>
  )
}
