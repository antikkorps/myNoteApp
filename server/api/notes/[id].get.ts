import { and, eq, isNull } from "drizzle-orm"
import { db, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = Number(getRouterParam(event, "id"))

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id), isNull(notes.deletedAt)))

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: "Note not found" })
  }

  return note
})
