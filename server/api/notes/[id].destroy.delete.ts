import { and, eq, isNotNull } from "drizzle-orm"
import { db, notes, attachments } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"
import { deleteFile } from "../../utils/storage"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = Number(getRouterParam(event, "id"))

  // Get attachments before deleting (cascade will remove DB rows)
  const noteAttachments = await db
    .select({ storageKey: attachments.storageKey })
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

  return { destroyed: true }
})
