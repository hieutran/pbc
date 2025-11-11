import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../types'
import { HTTP_STATUS } from '@pbc/shared'
import { AuthService } from '../services/authService'
import { ValidationError } from '../lib/errors'
import { rateLimiter } from '../middleware/rateLimiter'
import { RATE_LIMITS } from '../lib/rateLimiter'
import { authMiddleware } from '../middleware/auth'

const authRoutes = new Hono<{ Bindings: Env }>()

// Apply rate limiting to auth routes
authRoutes.use('*', rateLimiter(RATE_LIMITS.auth))

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// Register
authRoutes.post('/register', async c => {
  const body = await c.req.json()

  // Validate input
  const result = registerSchema.safeParse(body)
  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.errors)
  }

  const authService = new AuthService(c.env, c.env.DB)
  const data = await authService.register(result.data)

  return c.json(
    {
      success: true,
      data,
    },
    HTTP_STATUS.CREATED
  )
})

// Login
authRoutes.post('/login', async c => {
  const body = await c.req.json()

  // Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.errors)
  }

  const authService = new AuthService(c.env, c.env.DB)
  const data = await authService.login(result.data)

  return c.json({
    success: true,
    data,
  })
})

// Refresh token
authRoutes.post('/refresh', async c => {
  const body = await c.req.json()

  // Validate input
  const result = refreshSchema.safeParse(body)
  if (!result.success) {
    throw new ValidationError('Invalid input', result.error.errors)
  }

  const authService = new AuthService(c.env, c.env.DB)
  const tokens = await authService.refreshToken(result.data.refreshToken)

  return c.json({
    success: true,
    data: { tokens },
  })
})

// Logout (requires authentication)
authRoutes.post('/logout', authMiddleware, async c => {
  const userId = c.get('userId') as string

  const authService = new AuthService(c.env, c.env.DB)
  await authService.logout(userId)

  return c.json({
    success: true,
    data: { message: 'Logged out successfully' },
  })
})

export { authRoutes }
