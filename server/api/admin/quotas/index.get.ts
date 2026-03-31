import { eq } from "drizzle-orm"
import { db, storageQuotas, users } from "../../../utils/db"
import { requireAdmin } from "../../../utils/requireAdmin"
import { getDefaultStorageQuota } from "../../../utils/storageQuota"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const defaultQuotaBytes = await getDefaultStorageQuota()

  const userQuotas = await db
    .select({
      id: storageQuotas.id,
      userId: storageQuotas.userId,
      maxBytes: storageQuotas.maxBytes,
      userName: users.name,
      userEmail: users.email,
      createdAt: storageQuotas.createdAt,
      updatedAt: storageQuotas.updatedAt,
    })
    .from(storageQuotas)
    .innerJoin(users, eq(storageQuotas.userId, users.id))
    .orderBy(users.name)

  return { defaultQuotaBytes, userQuotas }
})
