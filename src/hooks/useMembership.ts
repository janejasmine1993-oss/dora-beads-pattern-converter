import { useState, useEffect } from 'react'
import type { MembershipLevel } from '../services/mock/membershipMockService'
import type { MembershipMock } from '../services/mock/membershipMockService'
import { membershipMockService } from '../services/mock/membershipMockService'

export function useMembership(userId: string | undefined) {
  const [membership, setMembership] = useState<MembershipMock | null>(null)
  const [daysUntilExpiry, setDaysUntilExpiry] = useState(0)

  useEffect(() => {
    if (!userId) {
      setMembership(null)
      return
    }

    const m = membershipMockService.getMembership(userId)
    setMembership(m)
    setDaysUntilExpiry(membershipMockService.getDaysUntilExpiry(m))
  }, [userId])

  const upgradeMembership = (level: MembershipLevel) => {
    if (!userId) return
    const updated = membershipMockService.mockUpgradeMembership(userId, level)
    setMembership(updated)
    setDaysUntilExpiry(membershipMockService.getDaysUntilExpiry(updated))
  }

  const getBenefits = (level: MembershipLevel) => {
    return membershipMockService.getBenefits(level)
  }

  const getAllLevels = (): MembershipLevel[] => {
    return membershipMockService.getAllLevels()
  }

  return {
    membership,
    daysUntilExpiry,
    upgradeMembership,
    getBenefits,
    getAllLevels,
  }
}
