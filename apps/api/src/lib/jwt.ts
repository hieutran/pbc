import type { JWTPayload } from '../types'
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '@pbc/shared'

/**
 * JWT utilities using Web Crypto API
 * Cloudflare Workers compatible
 */

interface TokenPayload extends JWTPayload {
  type: 'access' | 'refresh'
}

/**
 * Generate HMAC signature for JWT
 */
async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))

  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

/**
 * Verify HMAC signature
 */
async function verify(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await sign(data, secret)

  // Constant-time comparison
  if (signature.length !== expectedSignature.length) return false

  let result = 0
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i)
  }

  return result === 0
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) {
    str += '='
  }
  return atob(str)
}

/**
 * Generate JWT access token
 */
export async function generateAccessToken(
  userId: string,
  email: string,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: TokenPayload = {
    userId,
    email,
    type: 'access',
    iat: now,
    exp: now + ACCESS_TOKEN_EXPIRY,
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))

  const data = `${encodedHeader}.${encodedPayload}`
  const signature = await sign(data, secret)

  return `${data}.${signature}`
}

/**
 * Generate JWT refresh token
 */
export async function generateRefreshToken(
  userId: string,
  email: string,
  secret: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: TokenPayload = {
    userId,
    email,
    type: 'refresh',
    iat: now,
    exp: now + REFRESH_TOKEN_EXPIRY,
  }

  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))

  const data = `${encodedHeader}.${encodedPayload}`
  const signature = await sign(data, secret)

  return `${data}.${signature}`
}

/**
 * Verify and decode JWT token
 */
export async function verifyToken(token: string, secret: string): Promise<TokenPayload> {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid token format')
  }

  const [encodedHeader, encodedPayload, signature] = parts
  const data = `${encodedHeader}.${encodedPayload}`

  // Verify signature
  const isValid = await verify(data, signature, secret)
  if (!isValid) {
    throw new Error('Invalid token signature')
  }

  // Decode payload
  const payload = JSON.parse(base64UrlDecode(encodedPayload)) as TokenPayload

  // Check expiration
  const now = Math.floor(Date.now() / 1000)
  if (payload.exp < now) {
    throw new Error('Token expired')
  }

  return payload
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(
  userId: string,
  email: string,
  jwtSecret: string,
  refreshSecret: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(userId, email, jwtSecret),
    generateRefreshToken(userId, email, refreshSecret),
  ])

  return { accessToken, refreshToken }
}
