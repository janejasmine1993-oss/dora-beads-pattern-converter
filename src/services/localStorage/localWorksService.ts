/**
 * 本地作品存储服务 (LITE_MODE)
 * 使用 localStorage 保存最近生成的作品记录
 */

import { LITE_MODE_CONFIG } from '../../config/liteMode'

export interface LocalWork {
  id: string
  title: string
  brand: string
  width: number
  height: number
  colorCount: number
  totalBeads: number
  previewImageUrl: string | null
  createdAt: string
  updatedAt: string
}

class LocalWorksService {
  private key = LITE_MODE_CONFIG.localStorageKeys.localWorks
  private maxWorks = LITE_MODE_CONFIG.maxLocalWorks

  /**
   * 获取所有本地作品
   */
  getWorks(): LocalWork[] {
    try {
      const data = localStorage.getItem(this.key)
      if (!data) return []
      const works = JSON.parse(data) as LocalWork[]
      // 按创建时间倒序
      return works.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      console.error('[LocalWorks] 读取作品失败:', error)
      return []
    }
  }

  /**
   * 保存新作品
   */
  saveWork(work: Omit<LocalWork, 'id' | 'createdAt' | 'updatedAt'>): LocalWork {
    try {
      const works = this.getWorks()
      const newWork: LocalWork = {
        ...work,
        id: `work_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // 限制最大作品数
      if (works.length >= this.maxWorks) {
        works.pop() // 删除最旧的
      }

      works.unshift(newWork)
      localStorage.setItem(this.key, JSON.stringify(works))
      return newWork
    } catch (error) {
      console.error('[LocalWorks] 保存作品失败:', error)
      throw error
    }
  }

  /**
   * 更新作品
   */
  updateWork(id: string, updates: Partial<LocalWork>): LocalWork | null {
    try {
      const works = this.getWorks()
      const index = works.findIndex(w => w.id === id)
      if (index === -1) return null

      const updated: LocalWork = {
        ...works[index],
        ...updates,
        id: works[index].id, // 保持 ID 不变
        createdAt: works[index].createdAt, // 保持创建时间
        updatedAt: new Date().toISOString(),
      }

      works[index] = updated
      localStorage.setItem(this.key, JSON.stringify(works))
      return updated
    } catch (error) {
      console.error('[LocalWorks] 更新作品失败:', error)
      throw error
    }
  }

  /**
   * 删除作品
   */
  deleteWork(id: string): boolean {
    try {
      const works = this.getWorks()
      const filtered = works.filter(w => w.id !== id)
      if (filtered.length === works.length) return false // 没有找到

      localStorage.setItem(this.key, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('[LocalWorks] 删除作品失败:', error)
      throw error
    }
  }

  /**
   * 获取单个作品
   */
  getWork(id: string): LocalWork | null {
    const works = this.getWorks()
    return works.find(w => w.id === id) || null
  }

  /**
   * 清空所有作品
   */
  clearWorks(): void {
    try {
      localStorage.removeItem(this.key)
    } catch (error) {
      console.error('[LocalWorks] 清空作品失败:', error)
    }
  }

  /**
   * 获取本地存储大小估算（字节）
   */
  getStorageSize(): number {
    try {
      const data = localStorage.getItem(this.key)
      return data ? data.length : 0
    } catch {
      return 0
    }
  }
}

export const localWorksService = new LocalWorksService()
