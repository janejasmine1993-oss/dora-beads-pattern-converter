import type { AiTask, BackgroundRemovalTask, AiServiceResponse } from '../../types/aiTask'

export interface IAiService {
  removeBackground(imageUrl: string, style: string): Promise<AiServiceResponse>
  styleTransfer(imageUrl: string, style: string): Promise<AiServiceResponse>
  superResolution(imageUrl: string, scaleFactor: 2 | 4): Promise<AiServiceResponse>
  getTaskStatus(taskId: string): Promise<AiTask | null>
  cancelTask(taskId: string): Promise<void>
  estimateCost(taskType: string, params: Record<string, unknown>): Promise<number>
}

export class MockAiService implements IAiService {
  private tasks: Map<string, AiTask> = new Map()
  private taskCounter = 0

  async removeBackground(imageUrl: string, _style: string): Promise<AiServiceResponse> {
    const taskId = `ai-${++this.taskCounter}`
    const task: BackgroundRemovalTask = {
      id: taskId,
      userId: 'mock-user',
      taskType: 'background-removal',
      status: 'pending',
      inputImageUrl: imageUrl,
      createdAt: Date.now(),
      retryCount: 0,
      costCredit: 1,
      params: {
        style: 'basic',
        preserveOriginalSize: true,
      },
    }
    this.tasks.set(taskId, task)

    setTimeout(() => {
      const t = this.tasks.get(taskId)
      if (t) {
        t.status = 'completed'
        t.outputImageUrl = `${imageUrl}?processed=true`
        t.completedAt = Date.now()
      }
    }, 2000)

    return {
      success: true,
      taskId,
      status: 'pending',
      estimatedWaitTime: 2,
    }
  }

  async styleTransfer(imageUrl: string, _style: string): Promise<AiServiceResponse> {
    const taskId = `ai-${++this.taskCounter}`
    const task: AiTask = {
      id: taskId,
      userId: 'mock-user',
      taskType: 'style-transfer',
      status: 'pending',
      inputImageUrl: imageUrl,
      createdAt: Date.now(),
      retryCount: 0,
      costCredit: 3,
    }
    this.tasks.set(taskId, task)
    return {
      success: true,
      taskId,
      status: 'pending',
      estimatedWaitTime: 3,
    }
  }

  async superResolution(imageUrl: string, _scaleFactor: 2 | 4): Promise<AiServiceResponse> {
    const taskId = `ai-${++this.taskCounter}`
    const task: AiTask = {
      id: taskId,
      userId: 'mock-user',
      taskType: 'super-resolution',
      status: 'pending',
      inputImageUrl: imageUrl,
      createdAt: Date.now(),
      retryCount: 0,
      costCredit: 2,
    }
    this.tasks.set(taskId, task)
    return {
      success: true,
      taskId,
      status: 'pending',
      estimatedWaitTime: 5,
    }
  }

  async getTaskStatus(taskId: string): Promise<AiTask | null> {
    return this.tasks.get(taskId) || null
  }

  async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (task && task.status === 'pending') {
      task.status = 'cancelled'
    }
  }

  async estimateCost(taskType: string, _params: Record<string, unknown>): Promise<number> {
    const costMap: Record<string, number> = {
      'background-removal-basic': 0,
      'background-removal-ai': 1,
      'style-flat': 3,
      'style-chibi': 5,
      'style-healing': 5,
      'style-block': 3,
      'super-resolution': 2,
    }
    return costMap[taskType] || 1
  }
}

let aiService: IAiService | null = null

export function getAiService(): IAiService {
  if (!aiService) {
    aiService = new MockAiService()
  }
  return aiService
}

export function setAiService(service: IAiService): void {
  aiService = service
}
