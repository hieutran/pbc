import type { Context } from 'hono'
import { HTTP_STATUS } from '@pbc/shared'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR', message, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', message)
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', `${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(HTTP_STATUS.CONFLICT, 'ALREADY_EXISTS', message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super(HTTP_STATUS.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED', 'Too many requests')
    this.name = 'RateLimitError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'DATABASE_ERROR', message)
    this.name = 'DatabaseError'
  }
}
