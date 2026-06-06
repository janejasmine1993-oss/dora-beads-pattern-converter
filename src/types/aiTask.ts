export type AiTaskType = 'background-removal' | 'style-transfer' | 'super-resolution' | 'color-enhancement'

export type AiTaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface AiTask {
  id: string
  userId: string
  projectId?: string
  taskType: AiTaskType
  status: AiTaskStatus
  inputImageUrl: string
  outputImageUrl?: string
  createdAt: number
  startedAt?: number
  completedAt?: number
  errorMessage?: string
  retryCount: number
  costCredit: number
}

export interface BackgroundRemovalTask extends AiTask {
  taskType: 'background-removal'
  params: {
    style: 'basic' | 'flat' | 'chibi' | 'healing' | 'block'
    preserveOriginalSize: boolean
  }
}

export interface StyleTransferTask extends AiTask {
  taskType: 'style-transfer'
  params: {
    sourceStyle: string
    referenceImageUrl?: string
  }
}

export interface SuperResolutionTask extends AiTask {
  taskType: 'super-resolution'
  params: {
    scaleFactor: 2 | 4
    model: 'standard' | 'quality'
  }
}

export interface AiServiceResponse {
  success: boolean
  taskId: string
  status: AiTaskStatus
  outputUrl?: string
  estimatedWaitTime?: number
  error?: {
    code: string
    message: string
  }
}

export interface AiServiceProvider {
  name: 'aliyun' | 'tencentcloud' | 'local'
  capabilities: AiTaskType[]
  isAvailable: boolean
  responseTime?: number
}
