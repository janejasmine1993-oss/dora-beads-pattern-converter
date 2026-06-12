import { prisma } from './db'

export type AiJobStatus = 'pending' | 'processing' | 'success' | 'failed'

export interface CreateAiJobInput {
  userId: string
  presetId?: string
  provider?: string
  sourceImageUrl?: string
}

export async function createAiJob(input: CreateAiJobInput) {
  const job = await prisma.aiJob.create({
    data: {
      userId: input.userId,
      presetId: input.presetId,
      provider: input.provider,
      sourceImageUrl: input.sourceImageUrl,
      status: 'pending',
      creditCost: 1,
    },
  })

  return {
    id: job.id,
    userId: job.userId,
    presetId: job.presetId,
    provider: job.provider,
    status: job.status,
    sourceImageUrl: job.sourceImageUrl,
    resultImageUrl: job.resultImageUrl,
    creditCost: job.creditCost,
    errorMessage: job.errorMessage,
    requestId: job.requestId,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() || null,
  }
}

export async function markAiJobProcessing(jobId: string, userId: string) {
  const job = await prisma.aiJob.findUnique({
    where: { id: jobId },
  })

  if (!job || job.userId !== userId) {
    return null
  }

  const updated = await prisma.aiJob.update({
    where: { id: jobId },
    data: {
      status: 'processing',
    },
  })

  return {
    id: updated.id,
    userId: updated.userId,
    presetId: updated.presetId,
    provider: updated.provider,
    status: updated.status,
    sourceImageUrl: updated.sourceImageUrl,
    resultImageUrl: updated.resultImageUrl,
    creditCost: updated.creditCost,
    errorMessage: updated.errorMessage,
    requestId: updated.requestId,
    createdAt: updated.createdAt.toISOString(),
    completedAt: updated.completedAt?.toISOString() || null,
  }
}

export async function markAiJobSuccess(
  jobId: string,
  userId: string,
  resultImageUrl: string,
  requestId?: string
) {
  const job = await prisma.aiJob.findUnique({
    where: { id: jobId },
  })

  if (!job || job.userId !== userId) {
    return null
  }

  const updated = await prisma.aiJob.update({
    where: { id: jobId },
    data: {
      status: 'success',
      resultImageUrl,
      requestId: requestId || job.requestId,
      completedAt: new Date(),
    },
  })

  return {
    id: updated.id,
    userId: updated.userId,
    presetId: updated.presetId,
    provider: updated.provider,
    status: updated.status,
    sourceImageUrl: updated.sourceImageUrl,
    resultImageUrl: updated.resultImageUrl,
    creditCost: updated.creditCost,
    errorMessage: updated.errorMessage,
    requestId: updated.requestId,
    createdAt: updated.createdAt.toISOString(),
    completedAt: updated.completedAt?.toISOString() || null,
  }
}

export async function markAiJobFailed(
  jobId: string,
  userId: string,
  errorMessage: string,
  requestId?: string
) {
  const job = await prisma.aiJob.findUnique({
    where: { id: jobId },
  })

  if (!job || job.userId !== userId) {
    return null
  }

  const updated = await prisma.aiJob.update({
    where: { id: jobId },
    data: {
      status: 'failed',
      errorMessage,
      requestId: requestId || job.requestId,
      completedAt: new Date(),
    },
  })

  return {
    id: updated.id,
    userId: updated.userId,
    presetId: updated.presetId,
    provider: updated.provider,
    status: updated.status,
    sourceImageUrl: updated.sourceImageUrl,
    resultImageUrl: updated.resultImageUrl,
    creditCost: updated.creditCost,
    errorMessage: updated.errorMessage,
    requestId: updated.requestId,
    createdAt: updated.createdAt.toISOString(),
    completedAt: updated.completedAt?.toISOString() || null,
  }
}

export async function getAiJobById(jobId: string, userId: string) {
  const job = await prisma.aiJob.findUnique({
    where: { id: jobId },
  })

  if (!job || job.userId !== userId) {
    return null
  }

  return {
    id: job.id,
    userId: job.userId,
    presetId: job.presetId,
    provider: job.provider,
    status: job.status,
    sourceImageUrl: job.sourceImageUrl,
    resultImageUrl: job.resultImageUrl,
    creditCost: job.creditCost,
    errorMessage: job.errorMessage,
    requestId: job.requestId,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() || null,
  }
}

export async function getUserAiJobs(userId: string) {
  const jobs = await prisma.aiJob.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return jobs.map(job => ({
    id: job.id,
    userId: job.userId,
    presetId: job.presetId,
    provider: job.provider,
    status: job.status,
    sourceImageUrl: job.sourceImageUrl,
    resultImageUrl: job.resultImageUrl,
    creditCost: job.creditCost,
    errorMessage: job.errorMessage,
    requestId: job.requestId,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt?.toISOString() || null,
  }))
}
