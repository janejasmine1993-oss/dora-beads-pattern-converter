const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export async function getCredits(token: string) {
  const response = await fetch(`${API_BASE}/api/credits/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get credits: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to get credits')
  }

  return data.credits
}

export async function consumeCredits(token: string, amount: number, reason: string, relatedJobId?: string) {
  const response = await fetch(`${API_BASE}/api/credits/consume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount,
      reason,
      relatedJobId,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to consume credits: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.message || 'Failed to consume credits')
  }

  return data.credits
}

export async function devResetCredits(token: string) {
  const response = await fetch(`${API_BASE}/api/credits/dev-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to reset credits: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to reset credits')
  }

  return data.credits
}
