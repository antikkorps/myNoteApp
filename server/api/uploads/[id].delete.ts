import { and, eq } from "drizzle-orm"
import { db, attachments } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"
import { deleteFile } from "../../utils/storage"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = Number(getRouterParam(event, "id"))

  const [attachment] = await db
    .delete(attachments)
    .where(and(eq(attachments.id, id), eq(attachments.userId, session.user.id)))
    .returning()

  if (!attachment) {
    throw createError({ statusCode: 404, statusMessage: "File not found" })
  }

  await deleteFile(attachment.storageKey)

  return { deleted: true }
})
