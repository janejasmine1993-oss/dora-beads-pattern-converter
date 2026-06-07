import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import type { UserWork, UserWorkInput } from '../types/work'
import { getWorks, createWork, deleteWork as deleteWorkApi, updateWork as updateWorkApi } from '../services/api/worksApi'

export function useWorks() {
  const { token } = useAuth()
  const [works, setWorks] = useState<UserWork[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 从后端读取作品列表
  useEffect(() => {
    if (!token) {
      setWorks([])
      setError(null)
      return
    }

    const fetchWorks = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getWorks(token)
        const works: UserWork[] = data.map(work => ({
          id: work.id,
          userId: work.userId,
          title: work.title || '无标题',
          sourceImageName: work.sourceImageUrl ? new URL(work.sourceImageUrl).pathname.split('/').pop() : undefined,
          previewImageUrl: work.previewImageUrl,
          patternSize: {
            width: work.patternWidth || 0,
            height: work.patternHeight || 0,
          },
          beadBrand: work.beadBrand || 'UNKNOWN',
          colorCount: work.colorCount || 0,
          totalBeads: work.totalBeads || 0,
          createdAt: work.createdAt,
          updatedAt: work.updatedAt,
        }))
        setWorks(works)
      } catch (err) {
        console.error('Failed to fetch works:', err)
        setError(err instanceof Error ? err.message : '无法获取作品列表')
      } finally {
        setLoading(false)
      }
    }

    fetchWorks()
  }, [token])

  const saveWork = async (work: UserWorkInput) => {
    if (!token) {
      setError('请先登录')
      return null
    }

    try {
      setError(null)
      const created = await createWork(token, {
        title: work.title,
        beadBrand: work.beadBrand,
        patternWidth: work.patternSize?.width,
        patternHeight: work.patternSize?.height,
        colorCount: work.colorCount,
        totalBeads: work.totalBeads,
        previewImageUrl: work.previewImageUrl,
        status: 'draft',
      })

      const newWork: UserWork = {
        id: created.id,
        userId: created.userId,
        title: created.title || '无标题',
        sourceImageName: created.sourceImageUrl ? new URL(created.sourceImageUrl).pathname.split('/').pop() : undefined,
        previewImageUrl: created.previewImageUrl,
        patternSize: {
          width: created.patternWidth || 0,
          height: created.patternHeight || 0,
        },
        beadBrand: created.beadBrand || 'UNKNOWN',
        colorCount: created.colorCount || 0,
        totalBeads: created.totalBeads || 0,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      }

      setWorks([newWork, ...works])
      return newWork
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存作品失败'
      setError(message)
      return null
    }
  }

  const deleteWork = async (workId: string) => {
    if (!token) {
      setError('请先登录')
      return false
    }

    try {
      setError(null)
      await deleteWorkApi(token, workId)
      setWorks(works.filter(w => w.id !== workId))
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : '删除作品失败'
      setError(message)
      return false
    }
  }

  const renameWork = async (workId: string, title: string) => {
    if (!token) {
      setError('请先登录')
      return null
    }

    try {
      setError(null)
      const updated = await updateWorkApi(token, workId, { title })

      const updatedWork: UserWork = {
        id: updated.id,
        userId: updated.userId,
        title: updated.title || '无标题',
        sourceImageName: updated.sourceImageUrl ? new URL(updated.sourceImageUrl).pathname.split('/').pop() : undefined,
        previewImageUrl: updated.previewImageUrl,
        patternSize: {
          width: updated.patternWidth || 0,
          height: updated.patternHeight || 0,
        },
        beadBrand: updated.beadBrand || 'UNKNOWN',
        colorCount: updated.colorCount || 0,
        totalBeads: updated.totalBeads || 0,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      }

      setWorks(works.map(w => (w.id === workId ? updatedWork : w)))
      return updatedWork
    } catch (err) {
      const message = err instanceof Error ? err.message : '重命名作品失败'
      setError(message)
      return null
    }
  }

  const refresh = async () => {
    if (!token) return

    setLoading(true)
    try {
      const data = await getWorks(token)
      const works: UserWork[] = data.map(work => ({
        id: work.id,
        userId: work.userId,
        title: work.title || '无标题',
        sourceImageName: work.sourceImageUrl ? new URL(work.sourceImageUrl).pathname.split('/').pop() : undefined,
        previewImageUrl: work.previewImageUrl,
        patternSize: {
          width: work.patternWidth || 0,
          height: work.patternHeight || 0,
        },
        beadBrand: work.beadBrand || 'UNKNOWN',
        colorCount: work.colorCount || 0,
        totalBeads: work.totalBeads || 0,
        createdAt: work.createdAt,
        updatedAt: work.updatedAt,
      }))
      setWorks(works)
    } catch (err) {
      console.error('Failed to refresh works:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    works,
    loading,
    error,
    saveWork,
    deleteWork,
    renameWork,
    refresh,
  }
}
