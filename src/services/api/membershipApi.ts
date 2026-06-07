const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export async function getMembership(token: string) {
  const response = await fetch(`${API_BASE}/api/membership/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get membership: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to get membership')
  }

  return data.membership
}

export async function devUpgradeMembership(token: string, level: string) {
  const response = await fetch(`${API_BASE}/api/membership/dev-upgrade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ level }),
  })

  if (!response.ok) {
    throw new Error(`Failed to upgrade membership: ${response.statusText}`)
  }

  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'Failed to upgrade membership')
  }

  return {
    membership: data.membership,
    credits: data.credits,
  }
}
