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
  vite: {
    optimizeDeps: {
      include: [
        "prosemirror-state",
        "prosemirror-view",
        "prosemirror-model",
        "prosemirror-transform",
        "@tiptap/pm/state",
        "@tiptap/pm/view",
        "@tiptap/pm/model",
        "@tiptap/pm/transform",
        "@tiptap/core",
        "@tiptap/vue-3",
        "@tiptap/suggestion",
      ],
    },
  },
})
