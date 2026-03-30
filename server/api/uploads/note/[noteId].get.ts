import { and, eq } from "drizzle-orm"
import { db, attachments } from "../../../utils/db"
import { requireAuth } from "../../../utils/requireAuth"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)
  const noteId = Number(getRouterParam(event, "noteId"))

  const query = getQuery(event)
  const typeFilter = query.type as string | undefined

  let conditions = and(
    eq(attachments.noteId, noteId),
    eq(attachments.userId, session.user.id),
  )

  if (typeFilter === "image" || typeFilter === "file") {
    conditions = and(conditions, eq(attachments.type, typeFilter))
  }

  const results = await db
    .select()
    .from(attachments)
    .where(conditions!)

  return results.map((a) => ({
    ...a,
    url: `/api/uploads/${a.id}`,
  }))
})
