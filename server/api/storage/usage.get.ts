import { eq } from "drizzle-orm"
import { db, users } from "../../utils/db"
import { requireAuth } from "../../utils/requireAuth"
import { getUserStorageQuota } from "../../utils/storageQuota"

export default defineEventHandler(async (event) => {
  const session = await requireAuth(event)

  const [user] = await db
    .select({ storageUsed: users.storageUsed })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  const usedBytes = user?.storageUsed ?? 0
  const quotaBytes = await getUserStorageQuota(session.user.id)

  return {
    usedBytes,
    quotaBytes,
    usedMB: Math.round(usedBytes / (1024 * 1024)),
    quotaMB: Math.round(quotaBytes / (1024 * 1024)),
  }
})
