import type { UserWork } from '../../types/work'

const LOCAL_STORAGE_KEY = 'dora_user_works'

function getWorks(userId: string): UserWork[] {
  const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  }
  return []
}

function saveWorks(userId: string, works: UserWork[]): void {
  localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(works))
}

export const worksMockService = {
  // 获取用户的所有作品
  getWorks(userId: string): UserWork[] {
    return getWorks(userId)
  },

  // 保存新作品
  saveWork(userId: string, work: Omit<UserWork, 'id' | 'createdAt' | 'updatedAt'>): UserWork {
    const works = getWorks(userId)
    const now = new Date().toISOString()
    const newWork: UserWork = {
      ...work,
      id: `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: now,
      updatedAt: now,
    }
    works.push(newWork)
    saveWorks(userId, works)
    return newWork
  },

  // 删除作品
  deleteWork(userId: string, workId: string): boolean {
    const works = getWorks(userId)
    const index = works.findIndex(w => w.id === workId)
    if (index >= 0) {
      works.splice(index, 1)
      saveWorks(userId, works)
      return true
    }
    return false
  },

  // 更新作品
  updateWork(userId: string, workId: string, updates: Partial<UserWork>): UserWork | null {
    const works = getWorks(userId)
    const work = works.find(w => w.id === workId)
    if (work) {
      const updated: UserWork = {
        ...work,
        ...updates,
        id: work.id, // 保持 ID 不变
        userId: work.userId, // 保持 userId 不变
        createdAt: work.createdAt, // 保持创建时间不变
        updatedAt: new Date().toISOString(),
      }
      const idx = works.findIndex(w => w.id === workId)
      works[idx] = updated
      saveWorks(userId, works)
      return updated
    }
    return null
  },

  // 按 ID 获取单个作品
  getWork(userId: string, workId: string): UserWork | null {
    const works = getWorks(userId)
    return works.find(w => w.id === workId) || null
  },

  // 重命名作品
  renameWork(userId: string, workId: string, title: string): UserWork | null {
    return this.updateWork(userId, workId, { title })
  },

  // 清除所有作品（仅用于测试）
  clearAll(userId: string): void {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_${userId}`)
  },
}
