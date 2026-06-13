import { useState } from 'react'

interface FeedbackPanelProps {
  isOpen: boolean
  onClose: () => void
  currentSize?: { width: number; height: number }
  currentBrand?: string
  currentColorCount?: number
  samplingMode?: string
  portraitEnhance?: boolean
  highFidelityMode?: boolean
}

const FEEDBACK_FORM_URL = 'https://wcnqbrkrauvd.feishu.cn/share/base/form/shrcneOqnTiFylhYWImvrOfe5Lf' // 飞书表单链接

export function FeedbackPanel({
  isOpen,
  onClose,
  currentSize,
  currentBrand = '-',
  currentColorCount = 0,
  samplingMode = '-',
  portraitEnhance = false,
  highFidelityMode = false
}: FeedbackPanelProps) {
  const [issueType, setIssueType] = useState('')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const feedbackContent = `【问题类型】${issueType || '未选择'}\n\n【留言内容】${message || '无'}\n\n【联系方式】${contact || '未提供'}\n\n【当前参数】\n工作流模式: ${highFidelityMode ? '高还原像素画' : '基础图纸模式'}\n当前尺寸: ${currentSize ? `${currentSize.width} × ${currentSize.height}` : '-'}\n当前品牌: ${currentBrand}\n颜色数量: ${currentColorCount}\n采样方式: ${samplingMode}\n人像增强: ${portraitEnhance ? '已启用' : '已禁用'}`

  const handleCopyFeedback = async () => {
    try {
      await navigator.clipboard.writeText(feedbackContent)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      alert('复制失败，请手动复制')
    }
  }

  const handleSubmit = () => {
    if (!issueType || !message) {
      alert('请至少填写问题类型和留言内容')
      return
    }

    if (FEEDBACK_FORM_URL) {
      window.open(FEEDBACK_FORM_URL, '_blank')
    } else {
      alert('反馈表单暂未配置，请先复制反馈内容发送给我。')
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">问题反馈 / 留言板</h2>
            <p className="text-blue-100 text-sm mt-1">
              如果你在使用图纸器时遇到问题，或者有想要新增的功能，可以在这里留言。我会根据大家的反馈持续优化。
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Issue Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              问题类型 <span className="text-red-500">*</span>
            </label>
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- 请选择 --</option>
              <option value="生成失败">生成失败</option>
              <option value="颜色不准">颜色不准</option>
              <option value="图纸尺寸问题">图纸尺寸问题</option>
              <option value="导出 PNG / PDF 问题">导出 PNG / PDF 问题</option>
              <option value="高还原模式问题">高还原模式问题</option>
              <option value="裁切 / 编辑问题">裁切 / 编辑问题</option>
              <option value="其他建议">其他建议</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              留言内容 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="请描述你遇到的问题，最好写清楚操作步骤。"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              联系方式 <span className="text-gray-400 text-xs">(可选)</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="微信 / 邮箱 / 抖音号，可不填"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Current Parameters */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">当前图纸参数（自动填充）</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-600">工作流模式：</span>
                <span className="font-medium text-gray-900">{highFidelityMode ? '高还原像素画' : '基础图纸模式'}</span>
              </div>
              <div>
                <span className="text-gray-600">当前尺寸：</span>
                <span className="font-medium text-gray-900">
                  {currentSize ? `${currentSize.width} × ${currentSize.height}` : '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">当前品牌：</span>
                <span className="font-medium text-gray-900">{currentBrand}</span>
              </div>
              <div>
                <span className="text-gray-600">颜色数量：</span>
                <span className="font-medium text-gray-900">{currentColorCount}</span>
              </div>
              <div>
                <span className="text-gray-600">采样方式：</span>
                <span className="font-medium text-gray-900">{samplingMode === 'average' ? '平均采样' : '中心采样'}</span>
              </div>
              <div>
                <span className="text-gray-600">人像增强：</span>
                <span className="font-medium text-gray-900">{portraitEnhance ? '已启用' : '已禁用'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-2">
          <button
            onClick={handleCopyFeedback}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isCopied
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isCopied ? '✓ 已复制' : '📋 复制反馈'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
          >
            关闭
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            提交反馈
          </button>
        </div>
      </div>
    </div>
  )
}
