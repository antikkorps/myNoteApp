import { eq } from "drizzle-orm"
import { db, appSettings } from "./db"

export async function getSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1)

  return row?.value ?? null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const [existing] = await db
    .select({ key: appSettings.key })
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1)

  if (existing) {
    await db
      .update(appSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(appSettings.key, key))
  } else {
    await db.insert(appSettings).values({ key, value })
  }
}
