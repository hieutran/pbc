import type { Env } from '../types'
import { DatabaseError } from '../lib/errors'
import { createLogger } from '../lib/logger'

const logger = createLogger('Database')

/**
 * User repository for database operations
 */

export interface UserRow {
  id: string
  email: string
  password_hash: string
  created_at: string
  updated_at: string
}

export interface UserSettingsRow {
  user_id: string
  default_technique: string | null
  theme: string
  sound_enabled: number
  reminder_enabled: number
  reminder_time: string | null
}

export interface SessionRow {
  id: string
  user_id: string
  technique: string
  duration: number
  cycles: number | null
  settings: string
  completed_at: string
}

export class UserRepository {
  constructor(private db: D1Database) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM users WHERE email = ?')
        .bind(email)
        .first<UserRow>()

      return result
    } catch (error) {
      logger.error('Failed to find user by email', error as Error, { email })
      throw new DatabaseError('Failed to query user')
    }
  }

  async findById(id: string): Promise<UserRow | null> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM users WHERE id = ?')
        .bind(id)
        .first<UserRow>()

      return result
    } catch (error) {
      logger.error('Failed to find user by id', error as Error, { id })
      throw new DatabaseError('Failed to query user')
    }
  }

  async create(id: string, email: string, passwordHash: string): Promise<UserRow> {
    try {
      await this.db
        .prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)')
        .bind(id, email, passwordHash)
        .run()

      // Create default settings
      await this.db
        .prepare('INSERT INTO user_settings (user_id) VALUES (?)')
        .bind(id)
        .run()

      const user = await this.findById(id)
      if (!user) throw new DatabaseError('Failed to create user')

      logger.info('User created', { userId: id, email })
      return user
    } catch (error) {
      logger.error('Failed to create user', error as Error, { email })
      throw new DatabaseError('Failed to create user')
    }
  }

  async getSettings(userId: string): Promise<UserSettingsRow | null> {
    try {
      const result = await this.db
        .prepare('SELECT * FROM user_settings WHERE user_id = ?')
        .bind(userId)
        .first<UserSettingsRow>()

      return result
    } catch (error) {
      logger.error('Failed to get user settings', error as Error, { userId })
      throw new DatabaseError('Failed to get settings')
    }
  }

  async updateSettings(
    userId: string,
    settings: Partial<Omit<UserSettingsRow, 'user_id'>>
  ): Promise<void> {
    try {
      const updates: string[] = []
      const values: unknown[] = []

      Object.entries(settings).forEach(([key, value]) => {
        updates.push(`${key} = ?`)
        values.push(value)
      })

      if (updates.length === 0) return

      values.push(userId)

      await this.db
        .prepare(`UPDATE user_settings SET ${updates.join(', ')} WHERE user_id = ?`)
        .bind(...values)
        .run()

      logger.info('User settings updated', { userId })
    } catch (error) {
      logger.error('Failed to update settings', error as Error, { userId })
      throw new DatabaseError('Failed to update settings')
    }
  }
}

export class SessionRepository {
  constructor(private db: D1Database) {}

  async create(
    id: string,
    userId: string,
    technique: string,
    duration: number,
    settings: Record<string, unknown>,
    cycles?: number
  ): Promise<SessionRow> {
    try {
      await this.db
        .prepare(
          'INSERT INTO exercise_sessions (id, user_id, technique, duration, cycles, settings) VALUES (?, ?, ?, ?, ?, ?)'
        )
        .bind(id, userId, technique, duration, cycles || null, JSON.stringify(settings))
        .run()

      const session = await this.db
        .prepare('SELECT * FROM exercise_sessions WHERE id = ?')
        .bind(id)
        .first<SessionRow>()

      if (!session) throw new DatabaseError('Failed to create session')

      logger.info('Session created', { sessionId: id, userId, technique })
      return session
    } catch (error) {
      logger.error('Failed to create session', error as Error, { userId })
      throw new DatabaseError('Failed to create session')
    }
  }

  async findByUserId(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SessionRow[]> {
    try {
      const result = await this.db
        .prepare(
          'SELECT * FROM exercise_sessions WHERE user_id = ? ORDER BY completed_at DESC LIMIT ? OFFSET ?'
        )
        .bind(userId, limit, offset)
        .all<SessionRow>()

      return result.results || []
    } catch (error) {
      logger.error('Failed to query sessions', error as Error, { userId })
      throw new DatabaseError('Failed to query sessions')
    }
  }

  async countByUserId(userId: string): Promise<number> {
    try {
      const result = await this.db
        .prepare('SELECT COUNT(*) as count FROM exercise_sessions WHERE user_id = ?')
        .bind(userId)
        .first<{ count: number }>()

      return result?.count || 0
    } catch (error) {
      logger.error('Failed to count sessions', error as Error, { userId })
      throw new DatabaseError('Failed to count sessions')
    }
  }

  async getStats(userId: string): Promise<{
    totalSessions: number
    totalDuration: number
    totalCycles: number
    sessionsPerTechnique: Record<string, number>
  }> {
    try {
      // Get total stats
      const totals = await this.db
        .prepare(
          'SELECT COUNT(*) as total_sessions, SUM(duration) as total_duration, SUM(cycles) as total_cycles FROM exercise_sessions WHERE user_id = ?'
        )
        .bind(userId)
        .first<{ total_sessions: number; total_duration: number; total_cycles: number }>()

      // Get sessions per technique
      const techniques = await this.db
        .prepare(
          'SELECT technique, COUNT(*) as count FROM exercise_sessions WHERE user_id = ? GROUP BY technique'
        )
        .bind(userId)
        .all<{ technique: string; count: number }>()

      const sessionsPerTechnique: Record<string, number> = {}
      techniques.results?.forEach(row => {
        sessionsPerTechnique[row.technique] = row.count
      })

      return {
        totalSessions: totals?.total_sessions || 0,
        totalDuration: totals?.total_duration || 0,
        totalCycles: totals?.total_cycles || 0,
        sessionsPerTechnique,
      }
    } catch (error) {
      logger.error('Failed to get stats', error as Error, { userId })
      throw new DatabaseError('Failed to get stats')
    }
  }
}
