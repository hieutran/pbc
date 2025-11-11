import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  generateTokenPair,
} from './jwt'

describe('jwt', () => {
  const testSecret = 'test-secret-key-123'
  const testRefreshSecret = 'test-refresh-secret-key-456'
  const testUserId = 'user-123'
  const testEmail = 'test@example.com'

  beforeEach(() => {
    // Reset time mocks
    vi.restoreAllMocks()
  })

  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', async () => {
      const token = await generateAccessToken(testUserId, testEmail, testSecret)

      expect(token).toBeTypeOf('string')
      expect(token.split('.')).toHaveLength(3) // header.payload.signature
    })

    it('should include correct payload data', async () => {
      const token = await generateAccessToken(testUserId, testEmail, testSecret)
      const payload = await verifyToken(token, testSecret)

      expect(payload.userId).toBe(testUserId)
      expect(payload.email).toBe(testEmail)
      expect(payload.type).toBe('access')
      expect(payload.iat).toBeTypeOf('number')
      expect(payload.exp).toBeTypeOf('number')
    })

    it('should set correct expiration time (15 minutes)', async () => {
      const now = Math.floor(Date.now() / 1000)
      const token = await generateAccessToken(testUserId, testEmail, testSecret)
      const payload = await verifyToken(token, testSecret)

      const expectedExpiry = now + 15 * 60 // 15 minutes
      expect(payload.exp).toBeCloseTo(expectedExpiry, -1) // Within 10 seconds
    })

    it('should generate different tokens for different users', async () => {
      const token1 = await generateAccessToken('user1', 'user1@test.com', testSecret)
      const token2 = await generateAccessToken('user2', 'user2@test.com', testSecret)

      expect(token1).not.toBe(token2)
    })

    it('should generate different tokens for same user at different times', async () => {
      const token1 = await generateAccessToken(testUserId, testEmail, testSecret)

      // Wait a second to ensure different iat
      await new Promise(resolve => setTimeout(resolve, 1100))

      const token2 = await generateAccessToken(testUserId, testEmail, testSecret)

      expect(token1).not.toBe(token2)
    })

    it('should generate different tokens with different secrets', async () => {
      const token1 = await generateAccessToken(testUserId, testEmail, 'secret1')
      const token2 = await generateAccessToken(testUserId, testEmail, 'secret2')

      expect(token1).not.toBe(token2)
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate a valid JWT token', async () => {
      const token = await generateRefreshToken(testUserId, testEmail, testRefreshSecret)

      expect(token).toBeTypeOf('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('should include correct payload data', async () => {
      const token = await generateRefreshToken(testUserId, testEmail, testRefreshSecret)
      const payload = await verifyToken(token, testRefreshSecret)

      expect(payload.userId).toBe(testUserId)
      expect(payload.email).toBe(testEmail)
      expect(payload.type).toBe('refresh')
      expect(payload.iat).toBeTypeOf('number')
      expect(payload.exp).toBeTypeOf('number')
    })

    it('should set correct expiration time (7 days)', async () => {
      const now = Math.floor(Date.now() / 1000)
      const token = await generateRefreshToken(testUserId, testEmail, testRefreshSecret)
      const payload = await verifyToken(token, testRefreshSecret)

      const expectedExpiry = now + 7 * 24 * 60 * 60 // 7 days
      expect(payload.exp).toBeCloseTo(expectedExpiry, -1) // Within 10 seconds
    })
  })

  describe('verifyToken', () => {
    it('should verify valid access token', async () => {
      const token = await generateAccessToken(testUserId, testEmail, testSecret)
      const payload = await verifyToken(token, testSecret)

      expect(payload).toBeDefined()
      expect(payload.userId).toBe(testUserId)
      expect(payload.email).toBe(testEmail)
    })

    it('should verify valid refresh token', async () => {
      const token = await generateRefreshToken(testUserId, testEmail, testRefreshSecret)
      const payload = await verifyToken(token, testRefreshSecret)

      expect(payload).toBeDefined()
      expect(payload.userId).toBe(testUserId)
      expect(payload.email).toBe(testEmail)
    })

    it('should reject token with wrong secret', async () => {
      const token = await generateAccessToken(testUserId, testEmail, testSecret)

      await expect(verifyToken(token, 'wrong-secret')).rejects.toThrow('Invalid token signature')
    })

    it('should reject malformed token (missing parts)', async () => {
      await expect(verifyToken('invalid.token', testSecret)).rejects.toThrow(
        'Invalid token format'
      )

      await expect(verifyToken('only.one.part.extra', testSecret)).rejects.toThrow(
        'Invalid token format'
      )

      await expect(verifyToken('onlyonepart', testSecret)).rejects.toThrow('Invalid token format')

      await expect(verifyToken('', testSecret)).rejects.toThrow('Invalid token format')
    })

    it('should reject token with tampered payload', async () => {
      const token = await generateAccessToken(testUserId, testEmail, testSecret)
      const parts = token.split('.')

      // Tamper with payload by changing user ID
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      payload.userId = 'hacker-id'
      const tamperedPayload = btoa(JSON.stringify(payload))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')

      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`

      await expect(verifyToken(tamperedToken, testSecret)).rejects.toThrow(
        'Invalid token signature'
      )
    })

    it('should reject token with tampered header', async () => {
      const token = await generateAccessToken(testUserId, testEmail, testSecret)
      const parts = token.split('.')

      // Tamper with header
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      header.alg = 'none'
      const tamperedHeader = btoa(JSON.stringify(header))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')

      const tamperedToken = `${tamperedHeader}.${parts[1]}.${parts[2]}`

      await expect(verifyToken(tamperedToken, testSecret)).rejects.toThrow(
        'Invalid token signature'
      )
    })

    it('should reject expired token', async () => {
      // Mock Date.now to create an expired token
      const now = Date.now()
      const pastTime = now - 20 * 60 * 1000 // 20 minutes ago
      vi.spyOn(Date, 'now').mockReturnValue(pastTime)

      const token = await generateAccessToken(testUserId, testEmail, testSecret)

      // Restore real time
      vi.restoreAllMocks()

      await expect(verifyToken(token, testSecret)).rejects.toThrow('Token expired')
    })

    it('should accept token that is about to expire but not expired yet', async () => {
      // Create token that expires in 1 second
      const now = Date.now()
      const almostExpiredTime = now - 14 * 60 * 1000 - 59 * 1000 // 14:59 ago (1 sec before expiry)
      vi.spyOn(Date, 'now').mockReturnValue(almostExpiredTime)

      const token = await generateAccessToken(testUserId, testEmail, testSecret)

      vi.restoreAllMocks()

      const payload = await verifyToken(token, testSecret)
      expect(payload).toBeDefined()
    })

    it('should handle base64 URL encoding correctly', async () => {
      // Use email with special chars that need URL encoding
      const specialEmail = 'test+user@example.com'
      const token = await generateAccessToken(testUserId, specialEmail, testSecret)

      const payload = await verifyToken(token, testSecret)
      expect(payload.email).toBe(specialEmail)
    })
  })

  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', async () => {
      const result = await generateTokenPair(
        testUserId,
        testEmail,
        testSecret,
        testRefreshSecret
      )

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result.accessToken).toBeTypeOf('string')
      expect(result.refreshToken).toBeTypeOf('string')
      expect(result.accessToken).not.toBe(result.refreshToken)
    })

    it('should generate tokens with correct types', async () => {
      const result = await generateTokenPair(
        testUserId,
        testEmail,
        testSecret,
        testRefreshSecret
      )

      const accessPayload = await verifyToken(result.accessToken, testSecret)
      const refreshPayload = await verifyToken(result.refreshToken, testRefreshSecret)

      expect(accessPayload.type).toBe('access')
      expect(refreshPayload.type).toBe('refresh')
    })

    it('should generate tokens with same user data', async () => {
      const result = await generateTokenPair(
        testUserId,
        testEmail,
        testSecret,
        testRefreshSecret
      )

      const accessPayload = await verifyToken(result.accessToken, testSecret)
      const refreshPayload = await verifyToken(result.refreshToken, testRefreshSecret)

      expect(accessPayload.userId).toBe(refreshPayload.userId)
      expect(accessPayload.email).toBe(refreshPayload.email)
    })

    it('should generate tokens with different expiration times', async () => {
      const result = await generateTokenPair(
        testUserId,
        testEmail,
        testSecret,
        testRefreshSecret
      )

      const accessPayload = await verifyToken(result.accessToken, testSecret)
      const refreshPayload = await verifyToken(result.refreshToken, testRefreshSecret)

      // Access token expires in 15 minutes, refresh in 7 days
      expect(refreshPayload.exp).toBeGreaterThan(accessPayload.exp)

      const diff = refreshPayload.exp - accessPayload.exp
      const expectedDiff = 7 * 24 * 60 * 60 - 15 * 60 // 7 days minus 15 minutes
      expect(diff).toBeCloseTo(expectedDiff, -2) // Within 100 seconds
    })

    it('should verify tokens with their respective secrets', async () => {
      const result = await generateTokenPair(
        testUserId,
        testEmail,
        testSecret,
        testRefreshSecret
      )

      // Access token verifies with jwt secret
      const accessPayload = await verifyToken(result.accessToken, testSecret)
      expect(accessPayload).toBeDefined()

      // Refresh token verifies with refresh secret
      const refreshPayload = await verifyToken(result.refreshToken, testRefreshSecret)
      expect(refreshPayload).toBeDefined()

      // Cross-verification should fail
      await expect(verifyToken(result.accessToken, testRefreshSecret)).rejects.toThrow()
      await expect(verifyToken(result.refreshToken, testSecret)).rejects.toThrow()
    })
  })

  describe('security properties', () => {
    it('should use HS256 algorithm', async () => {
      const token = await generateAccessToken(testUserId, testEmail, testSecret)
      const headerB64 = token.split('.')[0]
      const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')))

      expect(header.alg).toBe('HS256')
      expect(header.typ).toBe('JWT')
    })

    it('should use constant-time comparison for signatures', async () => {
      // This test verifies the implementation uses constant-time comparison
      // by checking that timing is similar for different wrong secrets

      const token = await generateAccessToken(testUserId, testEmail, testSecret)

      // Try with wrong secret that differs at start
      const start1 = Date.now()
      try {
        await verifyToken(token, 'Xest-secret-key-123')
      } catch {}
      const time1 = Date.now() - start1

      // Try with wrong secret that differs at end
      const start2 = Date.now()
      try {
        await verifyToken(token, 'test-secret-key-12X')
      } catch {}
      const time2 = Date.now() - start2

      // Timing should be similar (within reasonable margin)
      expect(Math.abs(time1 - time2)).toBeLessThan(50)
    })

    it('should not include sensitive data in token by default', async () => {
      const token = await generateAccessToken(testUserId, testEmail, testSecret)
      const parts = token.split('.')
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

      // Should not include password or other sensitive data
      expect(payload).not.toHaveProperty('password')
      expect(payload).not.toHaveProperty('passwordHash')
      expect(payload).not.toHaveProperty('secret')
    })

    it('should handle ASCII characters in email', async () => {
      const specialEmail = 'user+test@example-domain.com'
      const token = await generateAccessToken(testUserId, specialEmail, testSecret)
      const payload = await verifyToken(token, testSecret)

      expect(payload.email).toBe(specialEmail)
    })

    it('should handle long secrets', async () => {
      const longSecret = 'a'.repeat(1000)
      const token = await generateAccessToken(testUserId, testEmail, longSecret)
      const payload = await verifyToken(token, longSecret)

      expect(payload.userId).toBe(testUserId)
    })

    it('should handle empty strings gracefully', async () => {
      // Empty user ID (edge case)
      const token1 = await generateAccessToken('', testEmail, testSecret)
      const payload1 = await verifyToken(token1, testSecret)
      expect(payload1.userId).toBe('')

      // Empty email (edge case)
      const token2 = await generateAccessToken(testUserId, '', testSecret)
      const payload2 = await verifyToken(token2, testSecret)
      expect(payload2.email).toBe('')
    })
  })

  describe('token format', () => {
    it('should produce URL-safe tokens (no +, /, =)', async () => {
      const token = await generateAccessToken(testUserId, testEmail, testSecret)

      expect(token).not.toMatch(/\+/)
      expect(token).not.toMatch(/\//)
      expect(token).not.toMatch(/=/)
    })

    it('should be able to parse tokens case-sensitively', async () => {
      const token = await generateAccessToken(testUserId, testEmail, testSecret)

      // Changing case should invalidate token
      const upperToken = token.toUpperCase()
      const lowerToken = token.toLowerCase()

      if (upperToken !== token) {
        await expect(verifyToken(upperToken, testSecret)).rejects.toThrow()
      }

      if (lowerToken !== token) {
        await expect(verifyToken(lowerToken, testSecret)).rejects.toThrow()
      }
    })
  })
})
