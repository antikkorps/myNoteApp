import { and, eq } from "drizzle-orm"
import { db, attachments } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"
import { readStoredFile } from "../../utils/storage"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const id = Number(getRouterParam(event, "id"))

  const [attachment] = await db
    .select()
    .from(attachments)
    .where(and(eq(attachments.id, id), eq(attachments.userId, session.user.id)))
    .limit(1)

  if (!attachment) {
    throw createError({ statusCode: 404, statusMessage: "File not found" })
  }

  const fileBuffer = await readStoredFile(attachment.storageKey)

  setResponseHeaders(event, {
    "Content-Type": attachment.mimeType,
    "Content-Length": String(attachment.size),
    "Content-Disposition": attachment.type === "image"
      ? `inline; filename="${attachment.filename}"`
      : `attachment; filename="${attachment.filename}"`,
    "Cache-Control": "private, max-age=31536000, immutable",
  })

  return fileBuffer
})
