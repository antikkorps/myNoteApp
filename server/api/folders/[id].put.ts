import { and, eq } from "drizzle-orm"
import { db, folders } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"
import { validateBody, validateId, updateFolderSchema } from "../../utils/validation"

async function wouldCreateCycle(folderId: number, newParentId: number, userId: string): Promise<boolean> {
  let currentId: number | null = newParentId
  const visited = new Set<number>()

  while (currentId !== null) {
    if (currentId === folderId) return true
    if (visited.has(currentId)) return true
    visited.add(currentId)

    const [parent] = await db
      .select({ parentId: folders.parentId })
      .from(folders)
      .where(and(eq(folders.id, currentId), eq(folders.userId, userId)))
      .limit(1)

    currentId = parent?.parentId ?? null
  }

  return false
}

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = validateId(event)
  const { name, parentId } = await validateBody(event, updateFolderSchema)

  if (parentId !== undefined && parentId !== null) {
    if (parentId === id) {
      throw createError({ statusCode: 400, statusMessage: "A folder cannot be its own parent" })
    }

    if (await wouldCreateCycle(id, parentId, session.user.id)) {
      throw createError({ statusCode: 400, statusMessage: "This move would create a circular folder structure" })
    }
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
