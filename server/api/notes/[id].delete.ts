import { eq } from 'drizzle-orm'
import { db, notes } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))

    const [note] = await db.delete(notes).where(eq(notes.id, id)).returning()

    if (!note) {
      throw new Error('Note not found')
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})
