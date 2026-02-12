import { eq } from 'drizzle-orm'
import { db, notes } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)
    const { title, content, tags } = body

    if (!title || !content) {
      throw new Error('Title and content are required')
    }

    const [note] = await db.update(notes).set({
      title,
      content,
      tags: tags || '',
      updatedAt: new Date(),
    }).where(eq(notes.id, id)).returning()

    if (!note) {
      throw new Error('Note not found')
    }

    return { success: true, data: note }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})
