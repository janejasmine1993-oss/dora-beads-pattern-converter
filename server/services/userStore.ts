import fs from 'fs'
import path from 'path'
import type { StoredUser } from '../types/auth'

// 仅用于本地开发测试，不适合生产环境
const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

export function readUsers(): StoredUser[] {
  try {
    if (!fs.existsSync(DATA_FILE)) return []
    const content = fs.readFileSync(DATA_FILE, 'utf-8')
    return content ? JSON.parse(content) : []
  } catch {
    return []
  }
}

export function writeUsers(users: StoredUser[]): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2))
}

export function findUserByEmail(email: string): StoredUser | null {
  const users = readUsers()
  return users.find(u => u.email === email) ?? null
}

export function findUserById(id: string): StoredUser | null {
  const users = readUsers()
  return users.find(u => u.id === id) ?? null
}

export function createUser(user: StoredUser): StoredUser {
  const users = readUsers()
  users.push(user)
  writeUsers(users)
  return user
}
