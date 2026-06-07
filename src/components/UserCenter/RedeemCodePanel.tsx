import { useState } from 'react'
import type { RedeemCodeDefinition } from '../../services/mock/redeemCodeMockService'

interface RedeemCodePanelProps {
  isLoggedIn: boolean
  availableCodes: RedeemCodeDefinition[]
  redeemHistory: string[]
  isProcessing: boolean
  onRedeem: (code: string) => Promise<any>
}

export function RedeemCodePanel({
  isLoggedIn,
  availableCodes,
  redeemHistory,
  isProcessing,
  onRedeem,
}: RedeemCodePanelProps) {
  const [inputCode, setInputCode] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  if (!isLoggedIn) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 opacity-50">
        <p className="text-gray-500 text-sm">请先登录使用兑换码</p>
      </div>
    )
  }

  const handleRedeem = async () => {
    if (!inputCode.trim()) {
      setMessage('请输入兑换码')
      setMessageType('error')
      return
    }

    const result = await onRedeem(inputCode)
    setMessageType(result.success ? 'success' : 'error')
    setMessage(result.message)
    if (result.success) {
      setInputCode('')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">兑换码</h3>

      {/* 输入框 */}
      <div className="mb-3">
        <input
          type="text"
          value={inputCode}
          onChange={e => setInputCode(e.target.value.toUpperCase())}
          placeholder="输入兑换码，如 DORA-VIP-30"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2 focus:outline-none focus:border-blue-500"
          disabled={isProcessing}
        />
        <button
          onClick={handleRedeem}
          disabled={isProcessing || !inputCode.trim()}
          className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-300 transition"
        >
          {isProcessing ? '处理中...' : '兑换'}
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <p
          className={`text-xs p-2 rounded mb-3 ${
            messageType === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </p>
      )}

      {/* 可用兑换码列表 */}
      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">测试用兑换码（Mock）</p>
        <div className="space-y-2">
          {availableCodes.map(code => {
            const isUsed = redeemHistory.includes(code.code)
            return (
              <div
                key={code.code}
                className={`p-2 bg-gray-50 rounded text-xs border ${
                  isUsed ? 'border-gray-300 opacity-50' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <code className="font-semibold text-gray-700 block">{code.code}</code>
                    <p className="text-gray-600">{code.description}</p>
                  </div>
                  {isUsed && <span className="text-gray-400 text-xs ml-2">已使用</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
        💡 当前为 mock 模式，仅用于测试
      </p>
    </div>
  )
}
