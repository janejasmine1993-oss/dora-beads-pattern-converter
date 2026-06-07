import { useState } from 'react'
import { UserStatusCard } from './UserStatusCard'
import { MembershipCard } from './MembershipCard'
import { CreditsCard } from './CreditsCard'
import { AiStylePanel } from './AiStylePanel'
import { RedeemCodePanel } from './RedeemCodePanel'
import { MyWorksPanel } from './MyWorksPanel'
import { useAuth } from '../../hooks/useAuth'
import { useMembership } from '../../hooks/useMembership'
import { useCredits } from '../../hooks/useCredits'
import { useAiStyle } from '../../hooks/useAiStyle'
import { useRedeemCode } from '../../hooks/useRedeemCode'
import { useWorks } from '../../hooks/useWorks'
type Tab = 'status' | 'membership' | 'ai-style' | 'works' | 'redeem'

interface UserCenterProps {
  isOpen: boolean
  onClose: () => void
  currentWorkspaceImage?: { url: string; name: string }
}

export function UserCenter({ onClose, currentWorkspaceImage }: UserCenterProps) {
  const [activeTab, setActiveTab] = useState<Tab>('status')
  const { user, isLoggedIn, login, logout } = useAuth()
  const { membership, daysUntilExpiry, upgradeMembership, getBenefits, getAllLevels } = useMembership(user?.id)
  const { credits, consumeCredit, resetCredits } = useCredits(user?.id)
  const { presets, isProcessing: isProcessingStyle, error: styleError, processStyle } = useAiStyle(user?.id)
  const { availableCodes, redeemHistory, isProcessing: isProcessingRedeem, redeem } = useRedeemCode(user?.id)
  const { works, saveWork, deleteWork, renameWork } = useWorks(user?.id)

  const handleSaveMockWork = () => {
    if (!user) return
    saveWork({
      userId: user.id,
      title: `我的作品 - ${new Date().toLocaleTimeString('zh-CN')}`,
      beadBrand: 'BOZLES',
      colorCount: Math.floor(Math.random() * 15) + 3,
      totalBeads: Math.floor(Math.random() * 5000) + 100,
      patternSize: { width: 32, height: 32 },
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-screen overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">用户中心</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab 导航 */}
        <div className="border-b border-gray-200 bg-gray-50 sticky top-16 flex overflow-x-auto">
          {(
            [
              { id: 'status' as const, label: '状态' },
              { id: 'membership' as const, label: '会员' },
              { id: 'ai-style' as const, label: 'AI 风格化' },
              { id: 'works' as const, label: '我的作品' },
              { id: 'redeem' as const, label: '兑换码' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max px-4 py-2 text-sm font-medium transition border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-blue-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="p-4">
          {activeTab === 'status' && (
            <UserStatusCard user={user} isLoggedIn={isLoggedIn} onLogin={login} onLogout={logout} />
          )}

          {activeTab === 'membership' && (
            <MembershipCard
              membership={membership || null}
              daysUntilExpiry={daysUntilExpiry}
              allLevels={getAllLevels()}
              getBenefits={getBenefits}
              onUpgrade={upgradeMembership}
            />
          )}

          {activeTab === 'ai-style' && (
            <>
              <CreditsCard
                credits={credits || null}
                onConsume={() => consumeCredit(1)}
                onReset={resetCredits}
              />
              <AiStylePanel
                isLoggedIn={isLoggedIn}
                membership={membership || null}
                presets={presets}
                isProcessing={isProcessingStyle}
                error={styleError}
                onProcessStyle={processStyle}
                credits={
                  credits
                    ? { dailyRemaining: credits.dailyRemaining, extraCredits: credits.extraCredits }
                    : null
                }
                currentWorkspaceImage={currentWorkspaceImage}
              />
            </>
          )}

          {activeTab === 'works' && (
            <MyWorksPanel
              isLoggedIn={isLoggedIn}
              works={works}
              onSaveMockWork={handleSaveMockWork}
              onDeleteWork={deleteWork}
              onRenameWork={renameWork}
            />
          )}

          {activeTab === 'redeem' && (
            <RedeemCodePanel
              isLoggedIn={isLoggedIn}
              availableCodes={availableCodes}
              redeemHistory={redeemHistory}
              isProcessing={isProcessingRedeem}
              onRedeem={redeem}
            />
          )}

          {/* 次数显示（在其他 tab 也显示） */}
          {activeTab !== 'ai-style' && credits && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <p className="text-blue-900">
                <span className="font-semibold">AI 次数：</span>
                {credits.dailyRemaining + credits.extraCredits} 次可用
              </p>
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
          <p>🔧 v0.7.1 - Mock 模式 - 仅用于测试和演示</p>
        </div>
      </div>
    </div>
  )
}
