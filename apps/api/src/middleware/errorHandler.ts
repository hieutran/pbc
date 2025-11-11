import type { Context } from 'hono'
import type { Env } from '../types'
import { HTTP_STATUS, ERROR_CODES } from '@pbc/shared'
import { AppError } from '../lib/errors'
import { createLogger } from '../lib/logger'

const logger = createLogger('ErrorHandler')

export const errorHandler = (err: Error, c: Context<{ Bindings: Env }>) => {
  // Log error
  logger.error('Request error', err, {
    path: c.req.path,
    method: c.req.method,
  })

  // Handle known application errors
  if (err instanceof AppError) {
    return c.json(err.toJSON(), err.statusCode)
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return c.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Validation failed',
          details: err,
        },
      },
      HTTP_STATUS.BAD_REQUEST
    )
  }

  // Handle JWT errors
  if (err.message.includes('token') || err.message.includes('JWT')) {
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

  // Default internal server error
  return c.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message:
          c.env.ENVIRONMENT === 'production'
            ? 'An unexpected error occurred'
            : err.message || 'An unexpected error occurred',
      },
    },
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  )
}
