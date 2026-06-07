import { useState, useEffect } from 'react'
import type { UserWork, UserWorkInput } from '../types/work'
import { worksMockService } from '../services/mock/worksMockService'

export function useWorks(userId: string | undefined) {
  const [works, setWorks] = useState<UserWork[]>([])

  useEffect(() => {
    if (!userId) {
      setWorks([])
      return
    }

    const w = worksMockService.getWorks(userId)
    setWorks(w)
  }, [userId])

  const saveWork = (work: UserWorkInput) => {
    if (!userId) return null
    const saved = worksMockService.saveWork(userId, work)
    setWorks([saved, ...works])
    return saved
  }

  const deleteWork = (workId: string) => {
    if (!userId) return false
    const success = worksMockService.deleteWork(userId, workId)
    if (success) {
      setWorks(works.filter(w => w.id !== workId))
    }
    return success
  }

  const renameWork = (workId: string, title: string) => {
    if (!userId) return null
    const updated = worksMockService.renameWork(userId, workId, title)
    if (updated) {
      setWorks(works.map(w => (w.id === workId ? updated : w)))
    }
    return updated
  }

  const refresh = () => {
    if (!userId) return
    const w = worksMockService.getWorks(userId)
    setWorks(w)
  }

  return {
    works,
    saveWork,
    deleteWork,
    renameWork,
    refresh,
  }
}
