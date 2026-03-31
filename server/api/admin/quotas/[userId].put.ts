import { eq } from "drizzle-orm"
import { db, storageQuotas, users } from "../../../utils/db"
import { requireAdmin } from "../../../utils/requireAdmin"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const userId = getRouterParam(event, "userId")!
  const body = await readBody<{ maxBytes: number }>(event)

  if (!body.maxBytes || typeof body.maxBytes !== "number" || body.maxBytes < 0) {
    throw createError({ statusCode: 400, statusMessage: "maxBytes must be a positive number" })
  }

  // Verify user exists
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" })
  }

  // Upsert user-specific quota
  const [existing] = await db
    .select({ id: storageQuotas.id })
    .from(storageQuotas)
    .where(eq(storageQuotas.userId, userId))
    .limit(1)

  if (existing) {
    const [updated] = await db
      .update(storageQuotas)
      .set({ maxBytes: body.maxBytes, updatedAt: new Date() })
      .where(eq(storageQuotas.userId, userId))
      .returning()
    return updated
  }

  const [created] = await db
    .insert(storageQuotas)
    .values({ userId, maxBytes: body.maxBytes })
    .returning()

  return created
})
