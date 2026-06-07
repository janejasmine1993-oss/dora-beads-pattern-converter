export type AuthRuntimeMode = 'mock' | 'real'

export interface AuthRuntimeConfig {
  mode: AuthRuntimeMode
}

export const authRuntimeConfig: AuthRuntimeConfig = {
  mode: (import.meta.env.VITE_AUTH_MODE || 'mock') as AuthRuntimeMode,
}

export function getAuthConfigStatus(): string {
  return `Auth mode: ${authRuntimeConfig.mode}`
}
