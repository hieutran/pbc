import { Hono } from 'hono'
import { z } from 'zod'
import type { Env } from '../types'
import { HTTP_STATUS, ERROR_CODES } from '@pbc/shared'

const authRoutes = new Hono<{ Bindings: Env }>()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Register
authRoutes.post('/register', async c => {
  try {
    const body = await c.req.json()
    const { email, password } = registerSchema.parse(body)

    // TODO: Implement actual registration logic
    // 1. Hash password with Argon2id
    // 2. Check if user exists
    // 3. Create user in D1
    // 4. Generate JWT tokens
    // 5. Store refresh token in KV

    return c.json(
      {
        success: true,
        data: {
          user: {
            id: 'user-123',
            email,
            createdAt: new Date().toISOString(),
          },
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
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

// Login
authRoutes.post('/login', async c => {
  try {
    const body = await c.req.json()
    const { email, password } = loginSchema.parse(body)

    // TODO: Implement actual login logic
    // 1. Find user in D1
    // 2. Verify password
    // 3. Generate JWT tokens
    // 4. Store refresh token in KV

    return c.json({
      success: true,
      data: {
        user: {
          id: 'user-123',
          email,
          createdAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
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

// Refresh token
authRoutes.post('/refresh', async c => {
  try {
    const { refreshToken } = await c.req.json()

    // TODO: Implement token refresh logic
    // 1. Verify refresh token
    // 2. Check if token exists in KV
    // 3. Generate new access token
    // 4. Optionally rotate refresh token

    return c.json({
      success: true,
      data: {
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      },
    })
  } catch (error) {
    throw error
  }
})

// Logout
authRoutes.post('/logout', async c => {
  try {
    // TODO: Implement logout logic
    // 1. Get refresh token from request
    // 2. Remove from KV
    // 3. Optionally blacklist access token

    return c.json({
      success: true,
      data: { message: 'Logged out successfully' },
    })
  } catch (error) {
    throw error
  }
})

export { authRoutes }
