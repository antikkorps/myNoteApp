import { and, eq } from "drizzle-orm"
import { db, folders, notes } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = Number(getRouterParam(event, "id"))

  // Détacher les notes du dossier avant suppression
  await db
    .update(notes)
    .set({ folderId: null })
    .where(and(eq(notes.folderId, id), eq(notes.userId, session.user.id)))

  // Remettre les sous-dossiers à la racine
  await db
    .update(folders)
    .set({ parentId: null })
    .where(and(eq(folders.parentId, id), eq(folders.userId, session.user.id)))

  // Supprimer le dossier
  const [deleted] = await db
    .delete(folders)
    .where(and(eq(folders.id, id), eq(folders.userId, session.user.id)))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: "Folder not found" })
  }

  return { deleted: true }
})
