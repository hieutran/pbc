import type { Context, Next } from 'hono'
import type { Env } from '../types'
import { createRateLimiter, type RateLimitConfig } from '../lib/rateLimiter'
import { RateLimitError } from '../lib/errors'

/**
 * Rate limiting middleware factory
 */
export function rateLimiter(config: RateLimitConfig) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const limiter = createRateLimiter(c.env.KV, config)

    // Use IP address as identifier (with fallback)
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'

    // Check rate limit
    const allowed = await limiter.checkLimit(ip)

    if (!allowed) {
      throw new RateLimitError()
    }

    // Add rate limit headers
    const remaining = await limiter.getRemainingRequests(ip)
    c.header('X-RateLimit-Limit', config.maxRequests.toString())
    c.header('X-RateLimit-Remaining', remaining.toString())

    await next()
  }
}
