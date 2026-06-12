import type { StorageKey } from '../../types/cloud'

export interface IStorageService {
  uploadFile(file: File, path: string): Promise<StorageKey>
  downloadFile(storageKey: StorageKey): Promise<Blob>
  deleteFile(storageKey: StorageKey): Promise<void>
  getSignedUrl(storageKey: StorageKey, expiresIn: number): Promise<string>
  exists(storageKey: StorageKey): Promise<boolean>
}

export class MockStorageService implements IStorageService {
  private store: Map<string, Blob> = new Map()

  async uploadFile(file: File, path: string): Promise<StorageKey> {
    const key = `${Date.now()}-${path}`
    this.store.set(key, file)
    return {
      bucket: 'dora-beads',
      path: key,
      contentType: file.type,
      size: file.size,
    }
  }

  async downloadFile(storageKey: StorageKey): Promise<Blob> {
    const blob = this.store.get(storageKey.path)
    if (!blob) throw new Error('File not found')
    return blob
  }

  async deleteFile(storageKey: StorageKey): Promise<void> {
    this.store.delete(storageKey.path)
  }

  async getSignedUrl(storageKey: StorageKey, expiresIn: number): Promise<string> {
    return `https://storage.example.com/${storageKey.path}?expires=${Date.now() + expiresIn}`
  }

  async exists(storageKey: StorageKey): Promise<boolean> {
    return this.store.has(storageKey.path)
  }
}

let storageService: IStorageService | null = null

export function getStorageService(): IStorageService {
  if (!storageService) {
    storageService = new MockStorageService()
  }
  return storageService
}

export function setStorageService(service: IStorageService): void {
  storageService = service
}
