import { describe, it, expect } from 'vitest'
import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
} from './errors'
import { HTTP_STATUS } from '@pbc/shared'

describe('errors', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(AppError)
      expect(error.name).toBe('AppError')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('TEST_ERROR')
      expect(error.message).toBe('Test message')
      expect(error.details).toBeUndefined()
    })

    it('should create error with details', () => {
      const details = { field: 'email', reason: 'invalid format' }
      const error = new AppError(400, 'TEST_ERROR', 'Test message', details)

      expect(error.details).toEqual(details)
    })

    it('should serialize to JSON correctly', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message')
      const json = error.toJSON()

      expect(json).toEqual({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test message',
        },
      })
    })

    it('should include details in JSON when present', () => {
      const details = { field: 'email' }
      const error = new AppError(400, 'TEST_ERROR', 'Test message', details)
      const json = error.toJSON()

      expect(json).toEqual({
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test message',
          details: { field: 'email' },
        },
      })
    })

    it('should have stack trace', () => {
      const error = new AppError(400, 'TEST_ERROR', 'Test message')

      expect(error.stack).toBeDefined()
      expect(error.stack).toContain('AppError')
    })
  })

  describe('ValidationError', () => {
    it('should create validation error with correct defaults', () => {
      const error = new ValidationError('Invalid input')

      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.name).toBe('ValidationError')
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST)
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
      expect(error.message).toBe('Invalid input')
    })

    it('should accept details', () => {
      const details = [
        { path: 'email', message: 'Invalid email' },
        { path: 'password', message: 'Too short' },
      ]
      const error = new ValidationError('Validation failed', details)

      expect(error.details).toEqual(details)
    })

    it('should serialize correctly', () => {
      const error = new ValidationError('Invalid input')
      const json = error.toJSON()

      expect(json).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
        },
      })
    })
  })

  describe('AuthenticationError', () => {
    it('should create auth error with default message', () => {
      const error = new AuthenticationError()

      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(AuthenticationError)
      expect(error.name).toBe('AuthenticationError')
      expect(error.statusCode).toBe(HTTP_STATUS.UNAUTHORIZED)
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
      expect(error.message).toBe('Authentication failed')
    })

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid credentials')

      expect(error.message).toBe('Invalid credentials')
    })

    it('should serialize correctly', () => {
      const error = new AuthenticationError('Token expired')
      const json = error.toJSON()

      expect(json).toEqual({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token expired',
        },
      })
    })
  })

  describe('NotFoundError', () => {
    it('should create not found error with default message', () => {
      const error = new NotFoundError()

      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(NotFoundError)
      expect(error.name).toBe('NotFoundError')
      expect(error.statusCode).toBe(HTTP_STATUS.NOT_FOUND)
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
      expect(error.message).toBe('Resource not found')
    })

    it('should accept custom resource name', () => {
      const error = new NotFoundError('User')

      expect(error.message).toBe('User not found')
    })

    it('should handle different resource names', () => {
      const userError = new NotFoundError('User')
      expect(userError.message).toBe('User not found')

      const sessionError = new NotFoundError('Session')
      expect(sessionError.message).toBe('Session not found')

      const techniqueError = new NotFoundError('Breathing technique')
      expect(techniqueError.message).toBe('Breathing technique not found')
    })

    it('should serialize correctly', () => {
      const error = new NotFoundError('Exercise')
      const json = error.toJSON()

      expect(json).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Exercise not found',
        },
      })
    })
  })

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Email already exists')

      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(ConflictError)
      expect(error.name).toBe('ConflictError')
      expect(error.statusCode).toBe(HTTP_STATUS.CONFLICT)
      expect(error.statusCode).toBe(409)
      expect(error.code).toBe('ALREADY_EXISTS')
      expect(error.message).toBe('Email already exists')
    })

    it('should serialize correctly', () => {
      const error = new ConflictError('Resource already exists')
      const json = error.toJSON()

      expect(json).toEqual({
        success: false,
        error: {
          code: 'ALREADY_EXISTS',
          message: 'Resource already exists',
        },
      })
    })
  })

  describe('RateLimitError', () => {
    it('should create rate limit error with fixed message', () => {
      const error = new RateLimitError()

      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(RateLimitError)
      expect(error.name).toBe('RateLimitError')
      expect(error.statusCode).toBe(HTTP_STATUS.TOO_MANY_REQUESTS)
      expect(error.statusCode).toBe(429)
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED')
      expect(error.message).toBe('Too many requests')
    })

    it('should serialize correctly', () => {
      const error = new RateLimitError()
      const json = error.toJSON()

      expect(json).toEqual({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
        },
      })
    })
  })

  describe('DatabaseError', () => {
    it('should create database error with default message', () => {
      const error = new DatabaseError()

      expect(error).toBeInstanceOf(AppError)
      expect(error).toBeInstanceOf(DatabaseError)
      expect(error.name).toBe('DatabaseError')
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('DATABASE_ERROR')
      expect(error.message).toBe('Database operation failed')
    })

    it('should accept custom message', () => {
      const error = new DatabaseError('Failed to connect to database')

      expect(error.message).toBe('Failed to connect to database')
    })

    it('should serialize correctly', () => {
      const error = new DatabaseError('Query timeout')
      const json = error.toJSON()

      expect(json).toEqual({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Query timeout',
        },
      })
    })
  })

  describe('error inheritance', () => {
    it('should maintain correct inheritance chain', () => {
      const validationError = new ValidationError('Test')
      const authError = new AuthenticationError()
      const notFoundError = new NotFoundError()
      const conflictError = new ConflictError('Test')
      const rateLimitError = new RateLimitError()
      const dbError = new DatabaseError()

      // All should be instances of Error
      expect(validationError).toBeInstanceOf(Error)
      expect(authError).toBeInstanceOf(Error)
      expect(notFoundError).toBeInstanceOf(Error)
      expect(conflictError).toBeInstanceOf(Error)
      expect(rateLimitError).toBeInstanceOf(Error)
      expect(dbError).toBeInstanceOf(Error)

      // All should be instances of AppError
      expect(validationError).toBeInstanceOf(AppError)
      expect(authError).toBeInstanceOf(AppError)
      expect(notFoundError).toBeInstanceOf(AppError)
      expect(conflictError).toBeInstanceOf(AppError)
      expect(rateLimitError).toBeInstanceOf(AppError)
      expect(dbError).toBeInstanceOf(AppError)
    })
  })

  describe('error handling patterns', () => {
    it('should be catchable with try-catch', () => {
      expect(() => {
        throw new ValidationError('Test')
      }).toThrow(ValidationError)

      expect(() => {
        throw new ValidationError('Test')
      }).toThrow(AppError)

      expect(() => {
        throw new ValidationError('Test')
      }).toThrow(Error)
    })

    it('should preserve error information when caught', () => {
      try {
        throw new ValidationError('Invalid email', { field: 'email' })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        if (error instanceof ValidationError) {
          expect(error.statusCode).toBe(400)
          expect(error.code).toBe('VALIDATION_ERROR')
          expect(error.message).toBe('Invalid email')
          expect(error.details).toEqual({ field: 'email' })
        }
      }
    })

    it('should work with error type guards', () => {
      const error: Error = new NotFoundError('User')

      if (error instanceof NotFoundError) {
        expect(error.statusCode).toBe(404)
        expect(error.code).toBe('NOT_FOUND')
      } else {
        throw new Error('Type guard failed')
      }
    })
  })

  describe('error details handling', () => {
    it('should handle null details', () => {
      const error = new AppError(400, 'TEST', 'Test', null)
      const json = error.toJSON()

      // null should not be included in JSON
      expect(json.error).not.toHaveProperty('details')
    })

    it('should handle undefined details', () => {
      const error = new AppError(400, 'TEST', 'Test', undefined)
      const json = error.toJSON()

      expect(json.error).not.toHaveProperty('details')
    })

    it('should handle complex details objects', () => {
      const details = {
        fields: ['email', 'password'],
        errors: [{ path: 'email', message: 'Invalid' }],
        nested: {
          deep: {
            value: 123,
          },
        },
      }
      const error = new AppError(400, 'TEST', 'Test', details)
      const json = error.toJSON()

      expect(json.error.details).toEqual(details)
    })

    it('should handle array details', () => {
      const details = ['error1', 'error2', 'error3']
      const error = new AppError(400, 'TEST', 'Test', details)
      const json = error.toJSON()

      expect(json.error.details).toEqual(details)
    })

    it('should handle primitive details', () => {
      const error1 = new AppError(400, 'TEST', 'Test', 'string detail')
      const error2 = new AppError(400, 'TEST', 'Test', 123)
      const error3 = new AppError(400, 'TEST', 'Test', true)

      expect(error1.toJSON().error.details).toBe('string detail')
      expect(error2.toJSON().error.details).toBe(123)
      expect(error3.toJSON().error.details).toBe(true)
    })
  })
})
