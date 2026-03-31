import { and, eq } from "drizzle-orm"
import { db, folders } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"
import { validateBody, validateId, updateFolderSchema } from "../../utils/validation"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = validateId(event)
  const { name, parentId } = await validateBody(event, updateFolderSchema)

  if (parentId === id) {
    throw createError({ statusCode: 400, statusMessage: "A folder cannot be its own parent" })
  }

  const [updated] = await db
    .update(folders)
    .set({
      ...(name !== undefined && { name }),
      ...(parentId !== undefined && { parentId }),
      updatedAt: new Date(),
    })
    .where(and(eq(folders.id, id), eq(folders.userId, session.user.id)))
    .returning()

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: "Folder not found" })
  }

  return updated
})
