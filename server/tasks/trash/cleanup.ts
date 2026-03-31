import { lt, eq, and, isNotNull, sql, inArray } from "drizzle-orm"
import { db, notes, attachments, users } from "../../utils/db"
import { deleteFile } from "../../utils/storage"

export default defineTask({
  meta: {
    name: "trash:cleanup",
    description: "Permanently delete notes in trash for more than 30 days",
  },
  async run() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Find notes to purge
    const notesToPurge = await db
      .select({ id: notes.id, userId: notes.userId })
      .from(notes)
      .where(and(isNotNull(notes.deletedAt), lt(notes.deletedAt, thirtyDaysAgo)))

    if (notesToPurge.length === 0) {
      return { result: "No notes to purge" }
    }

    const noteIds = notesToPurge.map((n) => n.id)

    // Get attachments before cascade delete
    const orphanedAttachments = await db
      .select({
        storageKey: attachments.storageKey,
        size: attachments.size,
        userId: attachments.userId,
      })
      .from(attachments)
      .where(inArray(attachments.noteId, noteIds))

    // Delete notes (cascades to attachments in DB)
    await db
      .delete(notes)
      .where(inArray(notes.id, noteIds))

    // Delete files from disk
    await Promise.all(orphanedAttachments.map((a) => deleteFile(a.storageKey)))

    // Update denormalized storage usage per user
    const sizeByUser = new Map<string, number>()
    for (const a of orphanedAttachments) {
      sizeByUser.set(a.userId, (sizeByUser.get(a.userId) ?? 0) + a.size)
    }
    await Promise.all(
      Array.from(sizeByUser.entries()).map(([userId, totalSize]) =>
        db
          .update(users)
          .set({ storageUsed: sql`GREATEST(${users.storageUsed} - ${totalSize}, 0)` })
          .where(eq(users.id, userId)),
      ),
    )

    return {
      result: `Purged ${notesToPurge.length} notes, deleted ${orphanedAttachments.length} files`,
    }
  },
})
