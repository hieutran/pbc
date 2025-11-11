import type { Env } from '../types'
import { UserRepository } from './repositories'
import { hashPassword, verifyPassword } from '../lib/crypto'
import { generateTokenPair, verifyToken } from '../lib/jwt'
import { AuthenticationError, ConflictError } from '../lib/errors'
import { createLogger } from '../lib/logger'

const logger = createLogger('AuthService')

export interface RegisterInput {
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResult {
  user: {
    id: string
    email: string
    createdAt: string
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export class AuthService {
  private userRepo: UserRepository

  constructor(
    private env: Env,
    private db: D1Database
  ) {
    this.userRepo = new UserRepository(db)
  }

  /**
   * Generate a unique user ID
   */
  private generateUserId(): string {
    return crypto.randomUUID()
  }

  /**
   * Register a new user
   */
  async register(input: RegisterInput): Promise<AuthResult> {
    const { email, password } = input

    // Check if user already exists
    const existingUser = await this.userRepo.findByEmail(email)
    if (existingUser) {
      throw new ConflictError('User with this email already exists')
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const userId = this.generateUserId()
    const user = await this.userRepo.create(userId, email, passwordHash)

    // Generate tokens
    const tokens = await generateTokenPair(
      user.id,
      user.email,
      this.env.JWT_SECRET,
      this.env.REFRESH_SECRET
    )

    // Store refresh token in KV
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    logger.info('User registered successfully', { userId: user.id, email: user.email })

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      tokens,
    }
  }

  /**
   * Login a user
   */
  async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input

    // Find user
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Generate tokens
    const tokens = await generateTokenPair(
      user.id,
      user.email,
      this.env.JWT_SECRET,
      this.env.REFRESH_SECRET
    )

    // Store refresh token in KV
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    logger.info('User logged in successfully', { userId: user.id })

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      tokens,
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify refresh token
    const payload = await verifyToken(refreshToken, this.env.REFRESH_SECRET)

    if (payload.type !== 'refresh') {
      throw new AuthenticationError('Invalid token type')
    }

    // Check if refresh token exists in KV
    const storedToken = await this.getRefreshToken(payload.userId)
    if (!storedToken || storedToken !== refreshToken) {
      throw new AuthenticationError('Invalid refresh token')
    }

    // Generate new token pair
    const tokens = await generateTokenPair(
      payload.userId,
      payload.email,
      this.env.JWT_SECRET,
      this.env.REFRESH_SECRET
    )

    // Store new refresh token and remove old one
    await this.storeRefreshToken(payload.userId, tokens.refreshToken)

    logger.info('Token refreshed', { userId: payload.userId })

    return tokens
  }

  /**
   * Logout a user
   */
  async logout(userId: string): Promise<void> {
    // Remove refresh token from KV
    await this.env.KV.delete(`refresh_token:${userId}`)
    logger.info('User logged out', { userId })
  }

  /**
   * Store refresh token in KV
   */
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const key = `refresh_token:${userId}`
    // Store with 7 day expiration (same as token)
    await this.env.KV.put(key, token, {
      expirationTtl: 7 * 24 * 60 * 60,
    })
  }

  /**
   * Get refresh token from KV
   */
  private async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh_token:${userId}`
    return await this.env.KV.get(key)
  }
}
