export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
  },
})
