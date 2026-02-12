import { desc } from 'drizzle-orm'
import { db, notes } from '../utils/db'

export default defineEventHandler(async () => {
  try {
    const data = await db.select().from(notes).orderBy(desc(notes.updatedAt))
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Failed to fetch notes' }
  }
})
