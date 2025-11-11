import type { Context } from 'hono'
import type { Env } from '../types'
import { HTTP_STATUS, ERROR_CODES } from '@pbc/shared'

export const errorHandler = (err: Error, c: Context<{ Bindings: Env }>) => {
  console.error('Error:', err)

  // Handle specific error types
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

  // Default internal server error
  return c.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
      },
    },
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  )
}
