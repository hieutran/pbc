import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './crypto'

describe('crypto', () => {
  describe('hashPassword', () => {
    it('should hash a password and return a string', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      expect(hash).toBeTypeOf('string')
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should return hash in correct format (iterations:salt:hash)', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const parts = hash.split(':')
      expect(parts).toHaveLength(3)
      expect(parseInt(parts[0], 10)).toBe(100000) // Default iterations
      expect(parts[1]).toHaveLength(32) // Salt in hex (16 bytes = 32 hex chars)
      expect(parts[2]).toHaveLength(64) // Hash in hex (32 bytes = 64 hex chars)
    })

    it('should generate different salts for same password', async () => {
      const password = 'testPassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2)

      // But salts should be different
      const salt1 = hash1.split(':')[1]
      const salt2 = hash2.split(':')[1]
      expect(salt1).not.toBe(salt2)
    })

    it('should handle empty password', async () => {
      const hash = await hashPassword('')
      expect(hash).toBeTypeOf('string')
      expect(hash.split(':')).toHaveLength(3)
    })

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(1000)
      const hash = await hashPassword(longPassword)
      expect(hash).toBeTypeOf('string')
      expect(hash.split(':')).toHaveLength(3)
    })

    it('should handle special characters', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      const hash = await hashPassword(specialPassword)
      expect(hash).toBeTypeOf('string')
      expect(hash.split(':')).toHaveLength(3)
    })

    it('should handle unicode characters', async () => {
      const unicodePassword = '密码测试🔐émojis'
      const hash = await hashPassword(unicodePassword)
      expect(hash).toBeTypeOf('string')
      expect(hash.split(':')).toHaveLength(3)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const isValid = await verifyPassword('wrongPassword', hash)
      expect(isValid).toBe(false)
    })

    it('should reject similar but different passwords', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      // Test case sensitivity
      const isValid1 = await verifyPassword('TestPassword123', hash)
      expect(isValid1).toBe(false)

      // Test extra character
      const isValid2 = await verifyPassword('testPassword123 ', hash)
      expect(isValid2).toBe(false)

      // Test missing character
      const isValid3 = await verifyPassword('testPassword12', hash)
      expect(isValid3).toBe(false)
    })

    it('should handle malformed hash gracefully', async () => {
      const password = 'testPassword123'

      // Hash with wrong number of parts
      const isValid1 = await verifyPassword(password, 'malformed')
      expect(isValid1).toBe(false)

      // Hash with only 2 parts
      const isValid2 = await verifyPassword(password, '100000:salt')
      expect(isValid2).toBe(false)

      // Hash with 4 parts
      const isValid3 = await verifyPassword(password, '100000:salt:hash:extra')
      expect(isValid3).toBe(false)

      // Empty hash
      const isValid4 = await verifyPassword(password, '')
      expect(isValid4).toBe(false)
    })

    it('should handle invalid hex in salt', async () => {
      const password = 'testPassword123'
      const invalidHash = '100000:GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG:' + '0'.repeat(64)

      const isValid = await verifyPassword(password, invalidHash)
      expect(isValid).toBe(false)
    })

    it('should handle invalid iterations', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      // Replace iterations with invalid value
      const parts = hash.split(':')
      const invalidHash = `notanumber:${parts[1]}:${parts[2]}`

      const isValid = await verifyPassword(password, invalidHash)
      expect(isValid).toBe(false)
    })

    it('should verify empty password', async () => {
      const password = ''
      const hash = await hashPassword(password)

      const isValid = await verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should verify long password', async () => {
      const longPassword = 'a'.repeat(1000)
      const hash = await hashPassword(longPassword)

      const isValid = await verifyPassword(longPassword, hash)
      expect(isValid).toBe(true)
    })

    it('should verify special characters', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'
      const hash = await hashPassword(specialPassword)

      const isValid = await verifyPassword(specialPassword, hash)
      expect(isValid).toBe(true)
    })

    it('should verify unicode characters', async () => {
      const unicodePassword = '密码测试🔐émojis'
      const hash = await hashPassword(unicodePassword)

      const isValid = await verifyPassword(unicodePassword, hash)
      expect(isValid).toBe(true)
    })

    it('should be resilient to timing attacks', async () => {
      // This is a basic test - true timing attack resistance requires
      // constant-time comparison in the underlying crypto library
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      // Try passwords that differ at different positions
      const start1 = Date.now()
      await verifyPassword('XtestPassword123', hash) // Diff at start
      const time1 = Date.now() - start1

      const start2 = Date.now()
      await verifyPassword('testPassword12X', hash) // Diff at end
      const time2 = Date.now() - start2

      // Both should take similar time (within reasonable margin)
      // This is a weak test but provides basic sanity check
      expect(Math.abs(time1 - time2)).toBeLessThan(50)
    })
  })

  describe('hash format compatibility', () => {
    it('should work with hashes created at different times', async () => {
      const password = 'testPassword123'

      // Create first hash
      const hash1 = await hashPassword(password)

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10))

      // Verify with first hash should still work
      const isValid1 = await verifyPassword(password, hash1)
      expect(isValid1).toBe(true)

      // Create second hash
      const hash2 = await hashPassword(password)

      // Both hashes should verify the same password
      const isValid2a = await verifyPassword(password, hash1)
      const isValid2b = await verifyPassword(password, hash2)
      expect(isValid2a).toBe(true)
      expect(isValid2b).toBe(true)

      // But they should be different hashes
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('security properties', () => {
    it('should use sufficient iterations (100,000)', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const iterations = parseInt(hash.split(':')[0], 10)
      expect(iterations).toBe(100000)
      expect(iterations).toBeGreaterThanOrEqual(100000) // OWASP minimum recommendation
    })

    it('should use sufficient salt length (16 bytes)', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const saltHex = hash.split(':')[1]
      const saltBytes = saltHex.length / 2
      expect(saltBytes).toBe(16)
      expect(saltBytes).toBeGreaterThanOrEqual(16) // OWASP minimum recommendation
    })

    it('should use sufficient hash length (32 bytes)', async () => {
      const password = 'testPassword123'
      const hash = await hashPassword(password)

      const hashHex = hash.split(':')[2]
      const hashBytes = hashHex.length / 2
      expect(hashBytes).toBe(32)
      expect(hashBytes).toBeGreaterThanOrEqual(32) // Strong hash length
    })
  })
})
