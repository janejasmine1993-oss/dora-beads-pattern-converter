const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export interface WorkResponse {
  id: string
  userId: string
  title: string
  sourceImageUrl?: string | null
  previewImageUrl?: string | null
  patternDataUrl?: string | null
  beadBrand?: string | null
  patternWidth?: number | null
  patternHeight?: number | null
  colorCount?: number | null
  totalBeads?: number | null
  status: string
  createdAt: string
  updatedAt: string
}

export async function getWorks(token: string): Promise<WorkResponse[]> {
  const response = await fetch(`${API_BASE}/api/works`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get works: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to get works')
  }

  return data.works || []
}

export async function createWork(token: string, payload: Partial<WorkResponse>) {
  const response = await fetch(`${API_BASE}/api/works`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to create work: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to create work')
  }

  return data.work
}

export async function getWork(token: string, id: string) {
  const response = await fetch(`${API_BASE}/api/works/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get work: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to get work')
  }

  return data.work
}

export async function updateWork(token: string, id: string, payload: Partial<WorkResponse>) {
  const response = await fetch(`${API_BASE}/api/works/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Failed to update work: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to update work')
  }

  return data.work
}

export async function deleteWork(token: string, id: string) {
  const response = await fetch(`${API_BASE}/api/works/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to delete work: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to delete work')
  }

  return true
}
