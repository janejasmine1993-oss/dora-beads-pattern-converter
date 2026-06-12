import { prisma } from './db'

export interface CreateWorkInput {
  title: string
  sourceImageUrl?: string | null
  previewImageUrl?: string | null
  patternDataUrl?: string | null
  beadBrand?: string | null
  patternWidth?: number | null
  patternHeight?: number | null
  colorCount?: number | null
  totalBeads?: number | null
  status?: string
}

export interface UpdateWorkInput {
  title?: string
  sourceImageUrl?: string | null
  previewImageUrl?: string | null
  patternDataUrl?: string | null
  beadBrand?: string | null
  patternWidth?: number | null
  patternHeight?: number | null
  colorCount?: number | null
  totalBeads?: number | null
  status?: string
}

export async function getWorksByUserId(userId: string) {
  const works = await prisma.work.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return works.map(work => ({
    id: work.id,
    userId: work.userId,
    title: work.title,
    sourceImageUrl: work.sourceImageUrl,
    previewImageUrl: work.previewImageUrl,
    patternDataUrl: work.patternDataUrl,
    beadBrand: work.beadBrand,
    patternWidth: work.patternWidth,
    patternHeight: work.patternHeight,
    colorCount: work.colorCount,
    totalBeads: work.totalBeads,
    status: work.status,
    createdAt: work.createdAt.toISOString(),
    updatedAt: work.updatedAt.toISOString(),
  }))
}

export async function getWorkById(id: string, userId: string) {
  const work = await prisma.work.findUnique({
    where: { id },
  })

  if (!work) {
    return null
  }

  // 检查权限：只能访问自己的作品
  if (work.userId !== userId) {
    return null
  }

  return {
    id: work.id,
    userId: work.userId,
    title: work.title,
    sourceImageUrl: work.sourceImageUrl,
    previewImageUrl: work.previewImageUrl,
    patternDataUrl: work.patternDataUrl,
    beadBrand: work.beadBrand,
    patternWidth: work.patternWidth,
    patternHeight: work.patternHeight,
    colorCount: work.colorCount,
    totalBeads: work.totalBeads,
    status: work.status,
    createdAt: work.createdAt.toISOString(),
    updatedAt: work.updatedAt.toISOString(),
  }
}

export async function createWork(userId: string, input: CreateWorkInput) {
  const work = await prisma.work.create({
    data: {
      userId,
      title: input.title || '新作品',
      sourceImageUrl: input.sourceImageUrl,
      previewImageUrl: input.previewImageUrl,
      patternDataUrl: input.patternDataUrl,
      beadBrand: input.beadBrand,
      patternWidth: input.patternWidth,
      patternHeight: input.patternHeight,
      colorCount: input.colorCount,
      totalBeads: input.totalBeads,
      status: input.status || 'draft',
    },
  })

  return {
    id: work.id,
    userId: work.userId,
    title: work.title,
    sourceImageUrl: work.sourceImageUrl,
    previewImageUrl: work.previewImageUrl,
    patternDataUrl: work.patternDataUrl,
    beadBrand: work.beadBrand,
    patternWidth: work.patternWidth,
    patternHeight: work.patternHeight,
    colorCount: work.colorCount,
    totalBeads: work.totalBeads,
    status: work.status,
    createdAt: work.createdAt.toISOString(),
    updatedAt: work.updatedAt.toISOString(),
  }
}

export async function updateWork(id: string, userId: string, input: UpdateWorkInput) {
  // 先检查权限
  const work = await prisma.work.findUnique({
    where: { id },
  })

  if (!work || work.userId !== userId) {
    return null
  }

  const updated = await prisma.work.update({
    where: { id },
    data: {
      title: input.title !== undefined ? input.title : work.title,
      sourceImageUrl: input.sourceImageUrl !== undefined ? input.sourceImageUrl : work.sourceImageUrl,
      previewImageUrl: input.previewImageUrl !== undefined ? input.previewImageUrl : work.previewImageUrl,
      patternDataUrl: input.patternDataUrl !== undefined ? input.patternDataUrl : work.patternDataUrl,
      beadBrand: input.beadBrand !== undefined ? input.beadBrand : work.beadBrand,
      patternWidth: input.patternWidth !== undefined ? input.patternWidth : work.patternWidth,
      patternHeight: input.patternHeight !== undefined ? input.patternHeight : work.patternHeight,
      colorCount: input.colorCount !== undefined ? input.colorCount : work.colorCount,
      totalBeads: input.totalBeads !== undefined ? input.totalBeads : work.totalBeads,
      status: input.status !== undefined ? input.status : work.status,
    },
  })

  return {
    id: updated.id,
    userId: updated.userId,
    title: updated.title,
    sourceImageUrl: updated.sourceImageUrl,
    previewImageUrl: updated.previewImageUrl,
    patternDataUrl: updated.patternDataUrl,
    beadBrand: updated.beadBrand,
    patternWidth: updated.patternWidth,
    patternHeight: updated.patternHeight,
    colorCount: updated.colorCount,
    totalBeads: updated.totalBeads,
    status: updated.status,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  }
}

export async function deleteWork(id: string, userId: string) {
  // 先检查权限
  const work = await prisma.work.findUnique({
    where: { id },
  })

  if (!work || work.userId !== userId) {
    return false
  }

  await prisma.work.delete({
    where: { id },
  })

  return true
}
