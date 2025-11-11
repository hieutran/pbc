import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../types'
import { authMiddleware } from '../middleware/auth'
import { HTTP_STATUS, ERROR_CODES } from '@pbc/shared'

const exerciseRoutes = new Hono<{ Bindings: Env }>()

// Apply auth middleware to all routes
exerciseRoutes.use('*', authMiddleware)

// Validation schemas
const createSessionSchema = z.object({
  technique: z.string(),
  duration: z.number().positive(),
  settings: z.object({
    inhale: z.number().optional(),
    exhale: z.number().optional(),
    holdInhale: z.number().optional(),
    holdExhale: z.number().optional(),
    cycles: z.number().optional(),
  }),
})

// Create exercise session
exerciseRoutes.post('/sessions', async c => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const data = createSessionSchema.parse(body)

    // TODO: Implement session creation
    // 1. Validate technique exists
    // 2. Insert session into D1
    // 3. Return created session

    return c.json(
      {
        success: true,
        data: {
          session: {
            id: 'session-123',
            userId,
            technique: data.technique,
            duration: data.duration,
            settings: data.settings,
            completedAt: new Date().toISOString(),
          },
        },
      },
      HTTP_STATUS.CREATED
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Invalid input',
            details: error.errors,
          },
        },
        HTTP_STATUS.BAD_REQUEST
      )
    }
    throw error
  }
})

// Get user's exercise sessions
exerciseRoutes.get('/sessions', async c => {
  try {
    const userId = c.get('userId')
    const limit = c.req.query('limit') || '20'
    const offset = c.req.query('offset') || '0'

    // TODO: Implement session retrieval
    // 1. Query D1 for user's sessions
    // 2. Apply pagination
    // 3. Return sessions

    return c.json({
      success: true,
      data: {
        sessions: [],
        total: 0,
      },
    })
  } catch (error) {
    throw error
  }
})

// Get exercise statistics
exerciseRoutes.get('/stats', async c => {
  try {
    const userId = c.get('userId')

    // TODO: Implement stats calculation
    // 1. Query D1 for all user sessions
    // 2. Calculate aggregates
    // 3. Return stats

    return c.json({
      success: true,
      data: {
        stats: {
          totalSessions: 0,
          totalDuration: 0,
          totalCycles: 0,
          favoriteTechnique: 'nadi-shodhana',
          currentStreak: 0,
          longestStreak: 0,
          sessionsPerTechnique: {},
        },
      },
    })
  } catch (error) {
    throw error
  }
})

export { exerciseRoutes }
