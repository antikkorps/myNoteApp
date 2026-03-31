import { eq } from "drizzle-orm"
import { db, storageQuotas } from "../../../utils/db"
import { requireAdmin } from "../../../utils/requireAdmin"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const userId = getRouterParam(event, "userId")!

  const [deleted] = await db
    .delete(storageQuotas)
    .where(eq(storageQuotas.userId, userId))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "Quota not found for this user" })
  }

  return { deleted: true }
})
