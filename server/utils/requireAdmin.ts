import type { H3Event } from "h3"
import { eq } from "drizzle-orm"
import { db, users } from "./db"
import { requireAuth } from "./requireAuth"

export async function requireAdmin(event: H3Event) {
  const session = await requireAuth(event)

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!user || user.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    })
  }

  return session
}
