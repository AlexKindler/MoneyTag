const windowMs = 60 * 1000 // 1 minute
const maxRequests = 30

const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of requestCounts) {
    if (now > value.resetTime) {
      requestCounts.delete(key)
    }
  }
}, 5 * 60 * 1000).unref?.()

export function rateLimit(identifier: string): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = requestCounts.get(identifier)

  if (!entry || now > entry.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return { success: true, remaining: maxRequests - 1 }
  }

  entry.count++

  if (entry.count > maxRequests) {
    return { success: false, remaining: 0 }
  }

  return { success: true, remaining: maxRequests - entry.count }
}

export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers)
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  return headers.get("x-real-ip") || "anonymous"
}
