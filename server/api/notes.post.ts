import { db, notes } from "../utils/db"
import { requireAuth } from "../utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const body = await readBody(event)
  const { title, content, tags } = body

  const [note] = await db
    .insert(notes)
    .values({
      userId: session.user.id,
      title: title || "Untitled Note",
      content: content || "",
      tags: tags || "",
    })
    .returning()

  return note
})
