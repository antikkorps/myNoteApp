import { and, eq, isNotNull, sql } from "drizzle-orm"
import { db, notes, attachments, users } from "../../../utils/db"
import { requireAuth } from "../../../utils/requireAuth"
import { deleteFile } from "../../../utils/storage"
import { validateId } from "../../../utils/validation"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = validateId(event)

  // Get attachments before deleting (cascade will remove DB rows)
  const noteAttachments = await db
    .select({ storageKey: attachments.storageKey, size: attachments.size })
    .from(attachments)
    .where(eq(attachments.noteId, id))

  const [note] = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id), isNotNull(notes.deletedAt)))
    .returning()

  if (!note) {
    throw createError({ statusCode: 404, statusMessage: "Note not found in trash" })
  }

  // Clean up files from storage
  await Promise.all(noteAttachments.map((a) => deleteFile(a.storageKey)))

  // Update denormalized storage usage
  const totalSize = noteAttachments.reduce((sum, a) => sum + a.size, 0)
  if (totalSize > 0) {
    await db
      .update(users)
      .set({ storageUsed: sql`GREATEST(${users.storageUsed} - ${totalSize}, 0)` })
      .where(eq(users.id, session.user.id))
  }

  return { destroyed: true }
})
