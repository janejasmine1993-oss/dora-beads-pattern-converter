import { useState, useEffect } from 'react'
import { AiStyleImageUploader } from '../UserCenter/AiStyleImageUploader'
import { useAuth } from '../../hooks/useAuth'
import { useCredits } from '../../hooks/useCredits'
import { useAiStyle } from '../../hooks/useAiStyle'
import { aiRuntimeConfig } from '../../services/ai/aiRuntimeConfig'
import { authRuntimeConfig } from '../../services/auth/authRuntimeConfig'
import type { AiStyleSourceImage, AiStyleResult } from '../../types/aiStyle'

interface AiOptimizePageProps {
  onBack: () => void
  onUseResultInWorkspace: (imageUrl: string) => void
  onRequireLogin?: () => void
  currentWorkspaceImage?: { url: string; name: string }
}

const processPresetCategories = [
  { category: '图片处理', presetIds: ['enhance-clarity', 'bg-simplify', 'color-optimize', 'reduce-noise'] },
]

const stylePresetCategories = [
  { category: '风格转换', presetIds: ['bead-pattern', 'pixel-clean', 'qversion', 'illustration', 'watercolor', 'soft-anime'] },
]

export function AiOptimizePage({ onBack, onUseResultInWorkspace, onRequireLogin, currentWorkspaceImage }: AiOptimizePageProps) {
  const { user, isLoggedIn, isSubmitting, login, loginWithEmail } = useAuth()
  const { credits } = useCredits(user?.id)
  const { presets, isProcessing, error: styleError, processStyle } = useAiStyle(user?.id)

  const [selectedImage, setSelectedImage] = useState<AiStyleSourceImage | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [strength, setStrength] = useState(0.8)
  const [keepOriginalColors, setKeepOriginalColors] = useState(true)
  const [lastResult, setLastResult] = useState<AiStyleResult | null>(null)
  const [showLoginGate, setShowLoginGate] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [statusType, setStatusType] = useState<'info' | 'error' | 'success'>('info')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)

  const isRealMode = aiRuntimeConfig.mode === 'real'
  const isRealAuthMode = authRuntimeConfig.mode === 'real'

  useEffect(() => {
    if (currentWorkspaceImage && !selectedImage) {
      const img = new Image()
      img.onload = () => {
        setSelectedImage({
          id: 'workspace_image',
          name: currentWorkspaceImage.name,
          type: 'image/jpeg',
          size: 0,
          previewUrl: currentWorkspaceImage.url,
          base64: currentWorkspaceImage.url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          createdAt: new Date().toISOString(),
        })
      }
      img.src = currentWorkspaceImage.url
    }
  }, [currentWorkspaceImage, selectedImage])

  function handleImageSelected(image: AiStyleSourceImage) {
    setSelectedImage(image)
    setLastResult(null)
    setStatusMessage(null)
  }

  function handleClearImage() {
    setSelectedImage(null)
    setLastResult(null)
    setStatusMessage(null)
  }

  function handleUseWorkspaceImage() {
    if (currentWorkspaceImage) {
      const img = new Image()
      img.onload = () => {
        setSelectedImage({
          id: 'workspace_image',
          name: currentWorkspaceImage.name,
          type: 'image/jpeg',
          size: 0,
          previewUrl: currentWorkspaceImage.url,
          base64: currentWorkspaceImage.url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          createdAt: new Date().toISOString(),
        })
        setStatusMessage('已使用当前工作台图片')
        setStatusType('info')
      }
      img.src = currentWorkspaceImage.url
    }
  }

  async function handleStartOptimize() {
    if (!isLoggedIn) {
      setShowLoginGate(true)
      return
    }
    if (!selectedImage) {
      setStatusMessage('请先上传或选择一张图片')
      setStatusType('error')
      return
    }
    if (!selectedPreset) {
      setStatusMessage('请选择一种优化方式')
      setStatusType('error')
      return
    }

    setStatusMessage(null)
    try {
      await processStyle(selectedPreset, selectedImage)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '优化失败，请重试'
      setStatusMessage(errorMsg)
      setStatusType('error')
    }
  }

  useEffect(() => {
    if (styleError) {
      setStatusMessage(styleError)
      setStatusType('error')
    }
  }, [styleError])

  const getPresetName = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId)
    return preset?.name || presetId
  }

  const allPresets = [...processPresetCategories, ...stylePresetCategories]

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition"
            title="返回首页"
          >
            ← 返回首页
          </button>
          <h1 className="text-2xl font-bold text-gray-900">AI 优化图片</h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Runtime mode badge */}
          {isRealMode ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              🚀 Real 真实 AI · {aiRuntimeConfig.provider}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              📦 Mock 模拟
            </span>
          )}

          {/* Credits display */}
          {credits && (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-700">
              💎 今日剩余：{credits.dailyRemaining + credits.extraCredits} 次
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Upload & Selection */}
        <aside className="w-80 shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4">
          {/* Image uploader */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📸 图片</h3>
            <AiStyleImageUploader
              onImageSelected={handleImageSelected}
              selectedImage={selectedImage}
              onClear={handleClearImage}
              currentWorkspaceImage={currentWorkspaceImage}
              onUseWorkspaceImage={handleUseWorkspaceImage}
            />
          </div>

          {/* Optimization methods */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">🎨 优化方式</h3>
            <div className="space-y-3">
              {allPresets.map(category => (
                <div key={category.category}>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{category.category}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {category.presetIds.map(presetId => {
                      const isSelected = selectedPreset === presetId
                      return (
                        <button
                          key={presetId}
                          onClick={() => setSelectedPreset(presetId)}
                          className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                          }`}
                        >
                          {getPresetName(presetId)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">⚙️ 参数</h3>

            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">
                优化强度：{(strength * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={strength}
                onChange={e => setStrength(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keepOriginalColors}
                onChange={e => setKeepOriginalColors(e.target.checked)}
              />
              <span className="text-xs font-semibold text-gray-700">保留原色</span>
            </label>
          </div>

          {/* Login gate */}
          {showLoginGate && (
            <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              {isRealAuthMode ? (
                // Real 模式：内嵌登录表单
                <>
                  <p className="text-sm font-semibold text-yellow-900 mb-3">🔒 请先登录</p>
                  {loginError && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      {loginError}
                    </div>
                  )}
                  <div className="space-y-2 mb-3">
                    <input
                      type="email"
                      placeholder="邮箱"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                    <input
                      type="password"
                      placeholder="密码"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setLoginError(null)
                        const result = await loginWithEmail(loginEmail, loginPassword)
                        if (result.success) {
                          setShowLoginGate(false)
                          setLoginEmail('')
                          setLoginPassword('')
                        } else {
                          setLoginError(result.error || '登录失败')
                        }
                      }}
                      disabled={isSubmitting || !loginEmail || !loginPassword}
                      className="flex-1 px-2 py-1.5 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                    >
                      {isSubmitting ? '登录中...' : '登录'}
                    </button>
                    <button
                      onClick={() => {
                        setShowLoginGate(false)
                        setLoginEmail('')
                        setLoginPassword('')
                        setLoginError(null)
                      }}
                      className="flex-1 px-2 py-1.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                      稍后再说
                    </button>
                  </div>
                </>
              ) : (
                // Mock 模式：原有行为
                <>
                  <p className="text-sm text-yellow-900 mb-3">请先登录后再使用 AI 优化功能</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (authRuntimeConfig.mode === 'real' && onRequireLogin) {
                          onRequireLogin()
                        } else {
                          login()
                        }
                        setShowLoginGate(false)
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                      去登录
                    </button>
                    <button
                      onClick={() => setShowLoginGate(false)}
                      className="flex-1 px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      取消
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Status message */}
          {statusMessage && (
            <div className={`mb-4 rounded-lg p-3 text-xs ${
              statusType === 'error' ? 'bg-red-50 border border-red-200 text-red-700' :
              statusType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
              'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              {statusMessage}
            </div>
          )}

          {/* Start button */}
          <button
            onClick={handleStartOptimize}
            disabled={isProcessing || !selectedImage || !selectedPreset}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isProcessing ? '🔄 优化中...' : '开始 AI 优化'}
          </button>
        </aside>

        {/* Right panel - Result preview */}
        <main className="flex-1 p-6 overflow-y-auto">
          {isProcessing ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500" />
                <p className="text-gray-600">正在优化图片...</p>
              </div>
            </div>
          ) : lastResult?.status === 'success' && lastResult.previewImageUrl ? (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">✨ AI 优化完成</h3>

              <div className="rounded-lg bg-white border border-gray-200 p-4">
                <img
                  src={lastResult.previewImageUrl}
                  alt="AI优化结果"
                  className="max-h-96 w-full object-contain rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => onUseResultInWorkspace(lastResult.previewImageUrl!)}
                  className="px-4 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  用此图生成拼豆图纸
                </button>
                <a
                  href={lastResult.previewImageUrl}
                  download="optimized.jpg"
                  className="px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition text-sm text-center"
                >
                  下载优化图
                </a>
                <button
                  onClick={() => {
                    setLastResult(null)
                    setSelectedPreset(null)
                  }}
                  className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  继续优化
                </button>
              </div>

              {lastResult.message && (
                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3">{lastResult.message}</p>
              )}
            </div>
          ) : lastResult?.status === 'failed' ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-6">
              <h3 className="text-lg font-bold text-red-900 mb-2">❌ 优化失败</h3>
              <p className="text-red-800">{lastResult.message || '未知错误'}</p>
              <button
                onClick={() => setLastResult(null)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
              >
                返回重试
              </button>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">📭 请先上传图片并选择优化方式</p>
                <p className="text-sm text-gray-500">然后点击左侧「开始 AI 优化」按钮开始处理</p>
                {!isRealMode && (
                  <p className="mt-4 text-xs text-gray-400 bg-gray-100 rounded-lg p-3">
                    当前为 Mock 模拟模式，1-2 秒内会返回演示结果
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
