import { desc, eq, isNull, and } from "drizzle-orm"
import { db, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const data = await db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, session.user.id), isNull(notes.deletedAt)))
    .orderBy(desc(notes.updatedAt))

  return data
})
