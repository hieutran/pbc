import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../types'
import { authMiddleware } from '../middleware/auth'
import { HTTP_STATUS, ERROR_CODES } from '@pbc/shared'

const userRoutes = new Hono<{ Bindings: Env }>()

// Apply auth middleware to all routes
userRoutes.use('*', authMiddleware)

// Get current user
userRoutes.get('/me', async c => {
  try {
    const userId = c.get('userId')
    const userEmail = c.get('userEmail')

    // TODO: Fetch full user data from D1
    return c.json({
      success: true,
      data: {
        user: {
          id: userId,
          email: userEmail,
          createdAt: new Date().toISOString(),
          settings: {},
        },
      },
    })
  } catch (error) {
    throw error
  }
})

// Update user settings
const updateSettingsSchema = z.object({
  defaultTechnique: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.enum(['en', 'vi', 'es', 'fr', 'de', 'ja', 'zh']).optional(),
  soundEnabled: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
  reminderTime: z.string().optional(),
})

userRoutes.patch('/settings', async c => {
  try {
    const userId = c.get('userId')
    const body = await c.req.json()
    const settings = updateSettingsSchema.parse(body)

    // TODO: Update settings in D1
    return c.json({
      success: true,
      data: {
        user: {
          id: userId,
          email: c.get('userEmail'),
          createdAt: new Date().toISOString(),
          settings,
        },
      },
    })
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

export { userRoutes }
