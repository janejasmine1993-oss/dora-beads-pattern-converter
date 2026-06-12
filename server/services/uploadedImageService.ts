import { prisma } from './db'

export type ImageType = 'source' | 'ai_result' | 'export'

export interface CreateImageInput {
  userId: string
  type: ImageType
  fileUrl: string
  fileName: string
  mimeType: string
  size?: number
  width?: number
  height?: number
}

export async function createUploadedImage(input: CreateImageInput) {
  const image = await prisma.uploadedImage.create({
    data: {
      userId: input.userId,
      type: input.type,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      mimeType: input.mimeType,
      size: input.size,
      width: input.width,
      height: input.height,
    },
  })

  return {
    id: image.id,
    userId: image.userId,
    type: image.type,
    fileUrl: image.fileUrl,
    fileName: image.fileName,
    mimeType: image.mimeType,
    size: image.size,
    width: image.width,
    height: image.height,
    createdAt: image.createdAt.toISOString(),
  }
}

export async function getUploadedImage(id: string, userId: string) {
  const image = await prisma.uploadedImage.findUnique({
    where: { id },
  })

  if (!image || image.userId !== userId) {
    return null
  }

  return {
    id: image.id,
    userId: image.userId,
    type: image.type,
    fileUrl: image.fileUrl,
    fileName: image.fileName,
    mimeType: image.mimeType,
    size: image.size,
    width: image.width,
    height: image.height,
    createdAt: image.createdAt.toISOString(),
  }
}

export async function getUserUploadedImages(userId: string) {
  const images = await prisma.uploadedImage.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return images.map(image => ({
    id: image.id,
    userId: image.userId,
    type: image.type,
    fileUrl: image.fileUrl,
    fileName: image.fileName,
    mimeType: image.mimeType,
    size: image.size,
    width: image.width,
    height: image.height,
    createdAt: image.createdAt.toISOString(),
  }))
}

export async function deleteUploadedImage(id: string, userId: string) {
  const image = await prisma.uploadedImage.findUnique({
    where: { id },
  })

  if (!image || image.userId !== userId) {
    return false
  }

  await prisma.uploadedImage.delete({
    where: { id },
  })

  return true
}
