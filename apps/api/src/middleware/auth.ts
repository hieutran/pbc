import type { Context, Next } from 'hono'
import type { Env } from '../types'
import { verifyToken } from '../lib/jwt'
import { AuthenticationError } from '../lib/errors'

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to context
 */
export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid authorization header')
  }

  const token = authHeader.substring(7)

  try {
    // Verify token
    const payload = await verifyToken(token, c.env.JWT_SECRET)

    // Check token type
    if (payload.type !== 'access') {
      throw new AuthenticationError('Invalid token type')
    }

    // Store user info in context
    c.set('userId', payload.userId)
    c.set('userEmail', payload.email)

    await next()
  } catch (error) {
    if (error instanceof Error) {
      throw new AuthenticationError(error.message)
    }
    throw new AuthenticationError('Authentication failed')
  }
}
