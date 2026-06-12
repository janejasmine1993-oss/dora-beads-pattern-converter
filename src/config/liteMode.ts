/**
 * LITE_MODE 配置
 * 当 LITE_MODE=true 时，应用进入"会员体验版"，不依赖 PostgreSQL
 *
 * 会员口令机制：
 * - 使用固定会员口令（VITE_MEMBER_ACCESS_CODE）
 * - 每月/每期更换一次，须同时修改 VITE_ACCESS_CODE_VERSION
 * - 版本号不匹配时强制重新验证
 */

export const LITE_MODE = import.meta.env.VITE_LITE_MODE === 'true'

// 会员口令（前端硬编码，仅用于早期体验版门槛）
export const MEMBER_ACCESS_CODE = import.meta.env.VITE_MEMBER_ACCESS_CODE || 'member2024'

// 口令版本号（格式：YYYY-MM，如 2026-06）
// 每次更换口令时必须同时更新此版本号，以强制用户重新输入
export const ACCESS_CODE_VERSION = import.meta.env.VITE_ACCESS_CODE_VERSION || '2026-06'

// LITE_MODE 下的配置
export const LITE_MODE_CONFIG = {
  // 功能开关
  enableAuth: !LITE_MODE,              // 注册登录
  enableMyWorks: true,                 // "我的作品"始终显示，LITE_MODE 下改为本地存储
  enableMembership: !LITE_MODE,        // 会员中心
  enableAiCredits: !LITE_MODE,         // AI 次数显示
  enableRedeemCode: !LITE_MODE,        // 兑换码
  enableCloudSave: !LITE_MODE,         // 云端保存

  // 本地作品最大记录数
  maxLocalWorks: 10,

  // LocalStorage keys
  localStorageKeys: {
    accessGranted: 'lite_access_granted',           // 是否授予访问权限
    accessCodeVersion: 'lite_access_code_version',  // 授权时的口令版本号
    localWorks: 'lite_local_works',
    lastAccessTime: 'lite_last_access_time',
  },
}

// 版本标识
export const APP_VERSION_LABEL = LITE_MODE ? 'Lite 会员体验版' : '标准版'
