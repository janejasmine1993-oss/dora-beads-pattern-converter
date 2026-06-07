import COS from 'cos-nodejs-sdk-v5'

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID || '',
  SecretKey: process.env.COS_SECRET_KEY || '',
})

export interface UploadParams {
  bucket: string
  region: string
  key: string
  body: Buffer | string
  contentType?: string
}

export interface UploadResult {
  location: string
  etag: string
  statusCode: number
}

export async function uploadBufferToCos(params: UploadParams): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: params.bucket,
        Region: params.region,
        Key: params.key,
        Body: params.body as any,
        ContentType: params.contentType || 'application/octet-stream',
      },
      (err: any, data: any) => {
        if (err) {
          reject(new Error(`COS upload failed: ${err.message}`))
        } else {
          resolve({
            location: data.Location,
            etag: data.ETag,
            statusCode: data.statusCode,
          })
        }
      }
    )
  })
}

export async function uploadBase64ToCos(params: {
  bucket: string
  region: string
  key: string
  base64Data: string
  contentType?: string
}): Promise<UploadResult> {
  const buffer = Buffer.from(params.base64Data, 'base64')
  return uploadBufferToCos({
    bucket: params.bucket,
    region: params.region,
    key: params.key,
    body: buffer,
    contentType: params.contentType,
  })
}

export async function deleteCosFile(params: {
  bucket: string
  region: string
  key: string
}): Promise<boolean> {
  return new Promise((resolve, reject) => {
    cos.deleteObject(
      {
        Bucket: params.bucket,
        Region: params.region,
        Key: params.key,
      },
      (err: any, data: any) => {
        if (err) {
          reject(new Error(`COS delete failed: ${err.message}`))
        } else {
          resolve(data.statusCode === 204 || data.statusCode === 200)
        }
      }
    )
  })
}

export function getPublicFileUrl(params: {
  baseUrl: string
  key: string
}): string {
  return `${params.baseUrl}/${params.key}`
}

export function generateCosKey(params: {
  userId: string
  type: 'upload' | 'ai-result' | 'export'
  id: string
  ext: string
}): string {
  const typeDir = params.type === 'upload' ? 'uploads' : params.type === 'ai-result' ? 'ai-results' : 'exports'
  return `users/${params.userId}/${typeDir}/${params.id}.${params.ext}`
}
