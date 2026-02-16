import { eq } from "drizzle-orm"
import { db, folders } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const userFolders = await db
    .select()
    .from(folders)
    .where(eq(folders.userId, session.user.id))
    .orderBy(folders.name)

  return userFolders
})
