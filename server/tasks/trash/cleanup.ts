import { lt } from "drizzle-orm"
import { isNotNull, and } from "drizzle-orm"
import { db, notes } from "../../utils/db"

export default defineTask({
  meta: {
    name: "trash:cleanup",
    description: "Permanently delete notes in trash for more than 30 days",
  },
  async run() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const deleted = await db
      .delete(notes)
      .where(and(isNotNull(notes.deletedAt), lt(notes.deletedAt, thirtyDaysAgo)))
      .returning({ id: notes.id })

    return {
      result: `Purged ${deleted.length} notes older than 30 days`,
    }
  },
})
