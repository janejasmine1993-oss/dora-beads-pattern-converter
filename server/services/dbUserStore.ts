import { prisma } from './db'
import type { StoredUser } from '../types/auth'

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname || '',
    avatarUrl: user.avatarUrl || '',
    passwordHash: user.passwordHash,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname || '',
    avatarUrl: user.avatarUrl || '',
    passwordHash: user.passwordHash,
    createdAt: user.createdAt.toISOString(),
  }
}

export async function createUser(user: StoredUser): Promise<StoredUser> {
  const created = await prisma.user.create({
    data: {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      loginProvider: 'email',
    },
  })

  // 自动创建默认 membership
  await prisma.membership.create({
    data: {
      userId: user.id,
      level: 'free',
    },
  })

  // 自动创建默认 ai_credits
  await prisma.aiCredits.create({
    data: {
      userId: user.id,
      dailyTotal: 5,
      dailyUsed: 0,
      extraCredits: 0,
    },
  })

  return {
    id: created.id,
    email: created.email,
    nickname: created.nickname || '',
    avatarUrl: created.avatarUrl || '',
    passwordHash: created.passwordHash,
    createdAt: created.createdAt.toISOString(),
  }
}

export async function updateLastLoginAt(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  })
}
