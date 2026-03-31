import { and, eq } from "drizzle-orm"
import { db, attachments, notes } from "../../../utils/db"
import { requireAuth } from "../../../utils/requireAuth"
import { validateId } from "../../../utils/validation"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const noteId = validateId(event, "noteId")

  // Verify note belongs to user
  const [note] = await db
    .select({ id: notes.id })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, session.user.id)))
    .limit(1)

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: "Note not found" })
  }

  const query = getQuery(event)
  const typeFilter = query.type as string | undefined

  let conditions = and(
    eq(attachments.noteId, noteId),
    eq(attachments.userId, session.user.id),
  )

  if (typeFilter === "image" || typeFilter === "file") {
    conditions = and(conditions, eq(attachments.type, typeFilter))
  }

  const results = await db
    .select()
    .from(attachments)
    .where(conditions!)

  return results.map((a) => ({
    ...a,
    url: `/api/uploads/${a.id}`,
  }))
})
