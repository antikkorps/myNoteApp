import { and, eq } from "drizzle-orm"
import { db, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuth(event)
    const id = Number(getRouterParam(event, "id"))
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
    if (!note) {
      throw createError({ statusCode: 404, statusMessage: "Note not found" })
    }
    return { success: true, data: note }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})
