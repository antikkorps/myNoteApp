import { and, eq, isNull } from "drizzle-orm"
import { db, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"
import { validateBody, validateId, updateNoteSchema } from "../../utils/validation"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = validateId(event)
  const body = await validateBody(event, updateNoteSchema)

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (body.title !== undefined) updateData.title = body.title
  if (body.content !== undefined) updateData.content = body.content
  if (body.tags !== undefined) updateData.tags = body.tags || ""
  if (body.folderId !== undefined) updateData.folderId = body.folderId || null
  if (body.preferences !== undefined) updateData.preferences = JSON.stringify(body.preferences)

  const [note] = await db
    .update(notes)
    .set(updateData)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id), isNull(notes.deletedAt)))
    .returning()

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: "Note not found" })
  }

  return note
})
