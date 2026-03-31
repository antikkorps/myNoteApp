const store = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 10 // max attempts per window

const RATE_LIMITED_PATHS = [
  "/api/auth/sign-in/email",
  "/api/auth/sign-up/email",
]

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000)

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (!RATE_LIMITED_PATHS.some((p) => path.startsWith(p))) return

  const method = getMethod(event)
  if (method !== "POST") return

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown"
  const key = `${ip}:${path}`
  const now = Date.now()

  let entry = store.get(key)
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    store.set(key, entry)
  }

  entry.count++

  setResponseHeader(event, "X-RateLimit-Limit", String(MAX_ATTEMPTS))
  setResponseHeader(event, "X-RateLimit-Remaining", String(Math.max(0, MAX_ATTEMPTS - entry.count)))

  if (entry.count > MAX_ATTEMPTS) {
    setResponseHeader(event, "Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)))
    throw createError({
      statusCode: 429,
      statusMessage: "Too many attempts, please try again later",
    })
  }
})
