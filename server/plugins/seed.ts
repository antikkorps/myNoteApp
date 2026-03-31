import { eq } from "drizzle-orm"
import { users } from "../database/schema"
import { auth } from "../utils/auth"
import { db } from "../utils/db"

export default defineNitroPlugin(async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@noteapp.local"
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.warn("ADMIN_PASSWORD is not set. Skipping admin user creation.")
      return
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1)

    if (existing.length === 0) {
      await auth.api.signUpEmail({
        body: {
          name: "Admin",
          email: adminEmail,
          password: adminPassword,
        },
      })
      // Set admin role
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.email, adminEmail))
      console.log("Admin user created")
    } else if (existing[0]!.role !== "admin") {
      // Ensure existing admin user has admin role
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.email, adminEmail))
      console.log("Admin user role updated")
    } else {
      console.log("Admin user already exists")
    }
  } catch (error) {
    console.error("Error seeding admin user:", error)
  }
})
