import { and, eq } from "drizzle-orm"
import { db, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)
    const id = Number(getRouterParam(event, "id"))
    const body = await readBody(event)
    const { title, content, tags } = body

    const [note] = await db
      .update(notes)
      .set({
        title,
        content,
        tags: tags || "",
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
      .returning()

    if (!note) {
      throw createError({ statusCode: 404, statusMessage: "Note not found" })
    }

    return { success: true, data: note }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})
