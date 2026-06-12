import { authRuntimeConfig } from './authRuntimeConfig'
import { authMockProvider } from './authMockProvider'
import { authRealProvider } from './authRealProvider'
import type { AuthProvider } from './authMockProvider'

export function getAuthProvider(): AuthProvider {
  return authRuntimeConfig.mode === 'real' ? authRealProvider : authMockProvider
}
