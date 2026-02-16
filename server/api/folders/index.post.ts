import { db, folders } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const { name, parentId } = await readBody(event)

  const [folder] = await db
    .insert(folders)
    .values({
      userId: session.user.id,
      name: name || "New Folder",
      parentId: parentId || null,
    })
    .returning()

  return folder
})
