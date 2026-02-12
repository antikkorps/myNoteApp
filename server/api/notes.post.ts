import { db, notes } from '../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { title, content, tags } = body

    if (!title || !content) {
      throw new Error('Title and content are required')
    }

    const [note] = await db.insert(notes).values({
      title,
      content,
      tags: tags || '',
    }).returning()

    return { success: true, data: note }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})
