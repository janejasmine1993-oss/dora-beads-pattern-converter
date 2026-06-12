const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface UploadedImage {
  id: string
  type: string
  fileUrl: string
  fileName: string
  mimeType: string
  size?: number
  width?: number
  height?: number
  createdAt: string
}

export async function uploadImage(token: string, file: File): Promise<UploadedImage> {
  // 验证文件类型
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('仅支持 JPG / PNG / WEBP 格式')
  }

  // 验证文件大小
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error(`文件超过 5MB 限制 (当前: ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
  }

  // 读取文件为 base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1]

        const response = await fetch(`${API_BASE}/api/uploads/image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            base64Data,
            fileName: file.name,
            mimeType: file.type,
            type: 'source',
          }),
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Upload failed')
        }

        resolve(data.image)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}
