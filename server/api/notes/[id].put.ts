import { and, eq } from "drizzle-orm"
import { db, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = Number(getRouterParam(event, "id"))
  const body = await readBody(event)
  const { title, content, tags, folderId, preferences } = body

  const updateData: Record<string, unknown> = { updatedAt: new Date() }
  if (title !== undefined) updateData.title = title
  if (content !== undefined) updateData.content = content
  if (tags !== undefined) updateData.tags = tags || ""
  if ("folderId" in body) updateData.folderId = folderId || null
  if (preferences !== undefined) updateData.preferences = JSON.stringify(preferences)

  const [note] = await db
    .update(notes)
    .set(updateData)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
    .returning()

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: "Note not found" })
  }

  return note
})
