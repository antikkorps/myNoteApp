import { db, users } from "../../../utils/db"
import { requireAdmin } from "../../../utils/requireAdmin"
import { getUserStorageQuota } from "../../../utils/storageQuota"

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const allUsers = await db
    .select({
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
      usedBytes: users.storageUsed,
    })
    .from(users)
    .orderBy(users.name)

  const results = await Promise.all(
    allUsers.map(async (row) => ({
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail,
      usedBytes: row.usedBytes,
      quotaBytes: await getUserStorageQuota(row.userId),
    })),
  )

  return results
})
