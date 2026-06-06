export interface CloudConfig {
  provider: 'cloudflare' | 'tencentcloud' | 'aliyun' | 'hybrid'
  region?: string
  endpoints: {
    storage?: string
    database?: string
    ai?: string
    auth?: string
    payment?: string
  }
}

export interface StorageKey {
  bucket: string
  path: string
  contentType: string
  etag?: string
  size?: number
}

export interface DatabaseConnection {
  host: string
  port: number
  database: string
  ssl?: boolean
}

export interface AiCapability {
  id: string
  name: string
  provider: 'aliyun' | 'tencentcloud' | 'local'
  costPerCall: number
  isAvailable: boolean
}

export interface AuthProvider {
  type: 'wechat' | 'qq' | 'phone' | 'email'
  clientId?: string
  clientSecret?: string
  redirectUri?: string
}

export interface PaymentConfig {
  provider: 'wxpay' | 'alipay' | 'stripe'
  merchantId: string
  apiKey: string
  notifyUrl?: string
}
