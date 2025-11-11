import type { Env } from '../types'

/**
 * Rate limiter using Cloudflare KV
 * Implements sliding window rate limiting
 */

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export const RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
} as const

export class RateLimiter {
  constructor(
    private kv: KVNamespace,
    private config: RateLimitConfig
  ) {}

  /**
   * Check if request should be rate limited
   * Returns true if allowed, false if rate limited
   */
  async checkLimit(identifier: string): Promise<boolean> {
    const key = `ratelimit:${identifier}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get current count
    const data = await this.kv.get(key, 'json')
    const requests: number[] = (data as number[]) || []

    // Filter out old requests outside the window
    const recentRequests = requests.filter(timestamp => timestamp > windowStart)

    // Check if limit exceeded
    if (recentRequests.length >= this.config.maxRequests) {
      return false
    }

    // Add current request
    recentRequests.push(now)

    // Store updated list with TTL
    await this.kv.put(key, JSON.stringify(recentRequests), {
      expirationTtl: Math.ceil(this.config.windowMs / 1000),
    })

    return true
  }

  /**
   * Get remaining requests in current window
   */
  async getRemainingRequests(identifier: string): Promise<number> {
    const key = `ratelimit:${identifier}`
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    const data = await this.kv.get(key, 'json')
    const requests: number[] = (data as number[]) || []

    const recentRequests = requests.filter(timestamp => timestamp > windowStart)

    return Math.max(0, this.config.maxRequests - recentRequests.length)
  }
}

/**
 * Create rate limiter instance
 */
export function createRateLimiter(kv: KVNamespace, config: RateLimitConfig): RateLimiter {
  return new RateLimiter(kv, config)
}
