import { LRUCache } from 'lru-cache'

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Max requests per interval
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 10,
}

// Global rate limit store using LRU cache
const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 10000, // Max 10k unique identifiers in memory
  ttl: 1000 * 60 * 60, // 1 hour TTL to prevent memory bloat
})

export function createRateLimiter(config: RateLimitConfig = DEFAULT_CONFIG) {
  return (identifier: string): boolean => {
    const now = Date.now()
    const entry = rateLimitCache.get(identifier)

    if (!entry || now > entry.resetAt) {
      // New or expired window
      rateLimitCache.set(identifier, { count: 1, resetAt: now + config.interval })
      return true
    }

    // Within existing window
    if (entry.count < config.maxRequests) {
      entry.count++
      return true
    }

    return false
  }
}

// Pre-configured rate limiters for common endpoints
export const loginLimiter = createRateLimiter({
  interval: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
})

export const qrScanLimiter = createRateLimiter({
  interval: 1 * 60 * 1000, // 1 minute
  maxRequests: 30, // 30 scans per minute (reasonable for busy location)
})

export const paymentLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 payment attempts per minute
})

export const formSubmitLimiter = createRateLimiter({
  interval: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 form submissions per minute
})

// Utility to get client identifier from request
export function getClientIdentifier(
  req: Request | { headers: Headers }
): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  return ip
}
