/**
 * AppWithLiteMode：App 的包装层，处理 LITE_MODE 的口令验证
 *
 * 验证流程：
 * 1. 检查 LITE_MODE 是否启用
 * 2. 检查 localStorage 中的 accessGranted 标记
 * 3. 检查保存的 accessCodeVersion 是否与当前版本匹配
 * 4. 版本号不匹配时清除旧授权，要求重新输入
 */

import { useState, useEffect } from 'react'
import App from './App'
import { LITE_MODE, ACCESS_CODE_VERSION, LITE_MODE_CONFIG } from './config/liteMode'
import { MemberAccessModal } from './components/MemberAccessModal'

export function AppWithLiteMode() {
  const [memberAccessGranted, setMemberAccessGranted] = useState(() => {
    if (!LITE_MODE) return true

    const accessGranted = localStorage.getItem(LITE_MODE_CONFIG.localStorageKeys.accessGranted) === 'true'
    const storedVersion = localStorage.getItem(LITE_MODE_CONFIG.localStorageKeys.accessCodeVersion)

    // 同时检查权限和版本号
    return accessGranted && storedVersion === ACCESS_CODE_VERSION
  })

  // 监听 localStorage 变化（如果在其他标签页操作）
  useEffect(() => {
    if (!LITE_MODE) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LITE_MODE_CONFIG.localStorageKeys.accessGranted ||
          e.key === LITE_MODE_CONFIG.localStorageKeys.accessCodeVersion) {
        const accessGranted = localStorage.getItem(LITE_MODE_CONFIG.localStorageKeys.accessGranted) === 'true'
        const storedVersion = localStorage.getItem(LITE_MODE_CONFIG.localStorageKeys.accessCodeVersion)
        setMemberAccessGranted(accessGranted && storedVersion === ACCESS_CODE_VERSION)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // 在 LITE_MODE 下，未授予访问权限时显示口令输入框
  if (LITE_MODE && !memberAccessGranted) {
    return (
      <MemberAccessModal
        isOpen={true}
        onAccessGranted={() => setMemberAccessGranted(true)}
      />
    )
  }

  // 授予权限或非 LITE_MODE 时显示正常应用
  return <App />
}

// 导出清除访问权限的函数（供其他组件调用）
// 清除所有 Lite 口令相关的 localStorage 键
export function clearAccessCodeAuth() {
  localStorage.removeItem(LITE_MODE_CONFIG.localStorageKeys.accessGranted)
  localStorage.removeItem(LITE_MODE_CONFIG.localStorageKeys.accessCodeVersion)
  localStorage.removeItem(LITE_MODE_CONFIG.localStorageKeys.lastAccessTime)
  // 兼容旧版本：如果还存在旧 key，也一并清除
  localStorage.removeItem('lite_member_access_token')
}
