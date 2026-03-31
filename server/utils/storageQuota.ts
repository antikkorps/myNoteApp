import { eq } from "drizzle-orm"
import { db, storageQuotas, users } from "./db"
import { getSetting } from "./appSettings"

const DEFAULT_QUOTA = 100 * 1024 * 1024 // 100 MB fallback if no DB setting

export async function getUserStorageUsage(userId: string): Promise<number> {
  const [user] = await db
    .select({ storageUsed: users.storageUsed })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  return user?.storageUsed ?? 0
}

export async function getDefaultStorageQuota(): Promise<number> {
  const value = await getSetting("storage.defaultQuotaBytes")
  return value ? Number(value) : DEFAULT_QUOTA
}

export async function getUserStorageQuota(userId: string): Promise<number> {
  // Check user-specific quota first
  const [userQuota] = await db
    .select({ maxBytes: storageQuotas.maxBytes })
    .from(storageQuotas)
    .where(eq(storageQuotas.userId, userId))
    .limit(1)

  if (userQuota) return userQuota.maxBytes

  // Fall back to global default from app_settings
  return getDefaultStorageQuota()
}

export async function checkStorageQuota(userId: string, fileSize: number): Promise<void> {
  const [usage, quota] = await Promise.all([
    getUserStorageUsage(userId),
    getUserStorageQuota(userId),
  ])

  if (usage + fileSize > quota) {
    const usedMB = Math.round(usage / (1024 * 1024))
    const quotaMB = Math.round(quota / (1024 * 1024))
    throw createError({
      statusCode: 413,
      statusMessage: `Storage quota exceeded (${usedMB}MB / ${quotaMB}MB)`,
    })
  }
}
