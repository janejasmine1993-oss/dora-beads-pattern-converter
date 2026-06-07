export interface UserWork {
  id: string
  userId: string
  title: string
  sourceImageName?: string
  previewImageUrl?: string
  patternSize: {
    width: number
    height: number
  }
  beadBrand: string
  colorCount: number
  totalBeads: number
  createdAt: string
  updatedAt: string
  tags?: string[]
}

export type UserWorkInput = Omit<UserWork, 'id' | 'createdAt' | 'updatedAt'>

export interface AiCredits {
  userId: string
  dailyTotal: number
  dailyUsed: number
  dailyRemaining: number
  extraCredits: number
  resetAt: string
}
