import type { User, AuthSession } from '../../types/user'
import type { Project, ProjectFile, SavedPattern } from '../../types/project'
import type { UserMembership, RedeemRecord, UsageLog } from '../../types/membership'

export interface IQuery {
  where(field: string, operator: string, value: unknown): IQuery
  orderBy(field: string, direction: 'asc' | 'desc'): IQuery
  limit(count: number): IQuery
  offset(count: number): IQuery
  execute(): Promise<unknown[]>
}

export interface IDatabaseService {
  // User operations
  getUser(userId: string): Promise<User | null>
  createUser(user: User): Promise<User>
  updateUser(userId: string, updates: Partial<User>): Promise<User>
  deleteUser(userId: string): Promise<void>

  // Project operations
  getProject(projectId: string): Promise<Project | null>
  listProjects(userId: string): Promise<Project[]>
  createProject(project: Project): Promise<Project>
  updateProject(projectId: string, updates: Partial<Project>): Promise<Project>
  deleteProject(projectId: string): Promise<void>

  // Project file operations
  getProjectFiles(projectId: string): Promise<ProjectFile[]>
  createProjectFile(file: ProjectFile): Promise<ProjectFile>
  deleteProjectFile(fileId: string): Promise<void>

  // Saved pattern operations
  getSavedPattern(patternId: string): Promise<SavedPattern | null>
  listSavedPatterns(userId: string, limit: number): Promise<SavedPattern[]>
  createSavedPattern(pattern: SavedPattern): Promise<SavedPattern>
  updateSavedPattern(patternId: string, updates: Partial<SavedPattern>): Promise<SavedPattern>
  deleteSavedPattern(patternId: string): Promise<void>

  // Membership operations
  getUserMembership(userId: string): Promise<UserMembership | null>
  setUserMembership(membership: UserMembership): Promise<UserMembership>
  recordUsageLog(log: UsageLog): Promise<void>

  // Redeem code operations
  validateRedeemCode(code: string): Promise<RedeemRecord | null>
  createRedeemRecord(record: RedeemRecord): Promise<RedeemRecord>

  // Session operations
  createSession(session: AuthSession): Promise<AuthSession>
  getSession(sessionId: string): Promise<AuthSession | null>
  deleteSession(sessionId: string): Promise<void>

  // Query builder
  query(table: string): IQuery
}

export class MockDatabaseService implements IDatabaseService {
  private users: Map<string, User> = new Map()
  private projects: Map<string, Project> = new Map()
  private projectFiles: Map<string, ProjectFile> = new Map()
  private savedPatterns: Map<string, SavedPattern> = new Map()
  private memberships: Map<string, UserMembership> = new Map()
  private usageLogs: UsageLog[] = []
  private sessions: Map<string, AuthSession> = new Map()

  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null
  }

  async createUser(user: User): Promise<User> {
    this.users.set(user.id, user)
    return user
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(userId)
    if (!user) throw new Error('User not found')
    const updated = { ...user, ...updates }
    this.users.set(userId, updated)
    return updated
  }

  async deleteUser(userId: string): Promise<void> {
    this.users.delete(userId)
  }

  async getProject(projectId: string): Promise<Project | null> {
    return this.projects.get(projectId) || null
  }

  async listProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.userId === userId)
  }

  async createProject(project: Project): Promise<Project> {
    this.projects.set(project.id, project)
    return project
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const project = this.projects.get(projectId)
    if (!project) throw new Error('Project not found')
    const updated = { ...project, ...updates }
    this.projects.set(projectId, updated)
    return updated
  }

  async deleteProject(projectId: string): Promise<void> {
    this.projects.delete(projectId)
  }

  async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    return Array.from(this.projectFiles.values()).filter(f => f.projectId === projectId)
  }

  async createProjectFile(file: ProjectFile): Promise<ProjectFile> {
    this.projectFiles.set(file.id, file)
    return file
  }

  async deleteProjectFile(fileId: string): Promise<void> {
    this.projectFiles.delete(fileId)
  }

  async getSavedPattern(patternId: string): Promise<SavedPattern | null> {
    return this.savedPatterns.get(patternId) || null
  }

  async listSavedPatterns(userId: string, limit: number): Promise<SavedPattern[]> {
    return Array.from(this.savedPatterns.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit)
  }

  async createSavedPattern(pattern: SavedPattern): Promise<SavedPattern> {
    this.savedPatterns.set(pattern.id, pattern)
    return pattern
  }

  async updateSavedPattern(patternId: string, updates: Partial<SavedPattern>): Promise<SavedPattern> {
    const pattern = this.savedPatterns.get(patternId)
    if (!pattern) throw new Error('Pattern not found')
    const updated = { ...pattern, ...updates }
    this.savedPatterns.set(patternId, updated)
    return updated
  }

  async deleteSavedPattern(patternId: string): Promise<void> {
    this.savedPatterns.delete(patternId)
  }

  async getUserMembership(userId: string): Promise<UserMembership | null> {
    return this.memberships.get(userId) || null
  }

  async setUserMembership(membership: UserMembership): Promise<UserMembership> {
    this.memberships.set(membership.userId, membership)
    return membership
  }

  async recordUsageLog(log: UsageLog): Promise<void> {
    this.usageLogs.push(log)
  }

  async validateRedeemCode(_code: string): Promise<RedeemRecord | null> {
    return null
  }

  async createRedeemRecord(record: RedeemRecord): Promise<RedeemRecord> {
    return record
  }

  async createSession(session: AuthSession): Promise<AuthSession> {
    this.sessions.set(session.sessionId, session)
    return session
  }

  async getSession(sessionId: string): Promise<AuthSession | null> {
    return this.sessions.get(sessionId) || null
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
  }

  query(_table: string): IQuery {
    return new MockQuery([])
  }
}

class MockQuery implements IQuery {
  data: unknown[]
  constructor(data: unknown[]) {
    this.data = data
  }

  where(_field: string, _operator: string, _value: unknown): IQuery {
    return this
  }

  orderBy(_field: string, _direction: 'asc' | 'desc'): IQuery {
    return this
  }

  limit(_count: number): IQuery {
    return this
  }

  offset(_count: number): IQuery {
    return this
  }

  async execute(): Promise<unknown[]> {
    return this.data
  }
}

let databaseService: IDatabaseService | null = null

export function getDatabaseService(): IDatabaseService {
  if (!databaseService) {
    databaseService = new MockDatabaseService()
  }
  return databaseService
}

export function setDatabaseService(service: IDatabaseService): void {
  databaseService = service
}
