import { and, eq } from "drizzle-orm"
import { db, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = Number(getRouterParam(event, "id"))

  const [note] = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
    .returning()

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: "Note not found" })
  }

  return { deleted: true }
})
