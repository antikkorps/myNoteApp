import { db, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"
import { validateBody, createNoteSchema } from "../../utils/validation"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const { title, content, tags, folderId, preferences } = await validateBody(event, createNoteSchema)

  const [note] = await db
    .insert(notes)
    .values({
      userId: session.user.id,
      title: title || "Untitled Note",
      content: content || "",
      tags: tags || "",
      folderId: folderId || null,
      preferences: preferences ? JSON.stringify(preferences) : null,
    })
    .returning()

  return note
})
