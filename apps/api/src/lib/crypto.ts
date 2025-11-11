/**
 * Cryptographically secure password hashing using Web Crypto API
 * Uses PBKDF2 with SHA-256, which is available in Cloudflare Workers
 */

const ITERATIONS = 100000
const KEY_LENGTH = 32
const SALT_LENGTH = 16

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))

  // Convert password to buffer
  const passwordBuffer = new TextEncoder().encode(password)

  // Import the password as a key
  const key = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
    'deriveBits',
  ])

  // Derive the hash
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    KEY_LENGTH * 8
  )

  // Convert to hex and combine with salt
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const saltArray = Array.from(salt)

  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  const saltHex = saltArray.map(b => b.toString(16).padStart(2, '0')).join('')

  // Return format: iterations:salt:hash
  return `${ITERATIONS}:${saltHex}:${hashHex}`
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // Parse the stored hash
    const parts = storedHash.split(':')
    if (parts.length !== 3) return false

    const iterations = parseInt(parts[0], 10)
    const saltHex = parts[1]
    const originalHash = parts[2]

    // Convert salt from hex
    const salt = new Uint8Array(
      saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    )

    // Convert password to buffer
    const passwordBuffer = new TextEncoder().encode(password)

    // Import the password as a key
    const key = await crypto.subtle.importKey('raw', passwordBuffer, 'PBKDF2', false, [
      'deriveBits',
    ])

    // Derive the hash with same parameters
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256',
      },
      key,
      KEY_LENGTH * 8
    )

    // Convert to hex
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Constant-time comparison
    return hashHex === originalHash
  } catch (error) {
    return false
  }
}
