import { and, eq } from "drizzle-orm"
import { db, folders } from "./db"

export async function wouldCreateCycle(
  folderId: number,
  newParentId: number,
  userId: string,
): Promise<boolean> {
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
