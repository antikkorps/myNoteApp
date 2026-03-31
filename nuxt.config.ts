export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === "development" },
  modules: ["@nuxt/ui"],
  css: ["~/assets/css/main.css"],
  nitro: {
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      // Every day at 3am
      "0 3 * * *": ["trash:cleanup"],
    },
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || "",
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || "",
    betterAuthUrl: process.env.BETTER_AUTH_URL || "",
    adminPassword: process.env.ADMIN_PASSWORD || "",
    uploadDir: process.env.UPLOAD_DIR || "./storage/uploads",
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
