export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || "",
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
    betterAuthUrl: process.env.BETTER_AUTH_URL || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
  },
})
