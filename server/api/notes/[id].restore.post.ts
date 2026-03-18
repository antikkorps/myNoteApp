import { and, eq, isNotNull } from "drizzle-orm"
import { db, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = Number(getRouterParam(event, "id"))

  const [note] = await db
    .update(notes)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id), isNotNull(notes.deletedAt)))
    .returning()

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: "Note not found in trash" })
  }

  return note
})
