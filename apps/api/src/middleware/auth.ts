import type { Context, Next } from 'hono'
import type { Env, JWTPayload } from '../types'
import { HTTP_STATUS, ERROR_CODES } from '@pbc/shared'

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: 'Missing or invalid authorization header',
        },
      },
      HTTP_STATUS.UNAUTHORIZED
    )
  }

  const token = authHeader.substring(7)

  try {
    // TODO: Implement actual JWT verification
    // For now, this is a placeholder
    const payload: JWTPayload = JSON.parse(atob(token.split('.')[1]))

    // Store user info in context
    c.set('userId', payload.userId)
    c.set('userEmail', payload.email)

    await next()
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INVALID_TOKEN,
          message: 'Invalid or expired token',
        },
      },
      HTTP_STATUS.UNAUTHORIZED
    )
  }
}
