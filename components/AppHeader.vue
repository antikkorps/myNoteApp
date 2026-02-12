<template>
  <header
    class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
  >
    <div class="flex items-center gap-2">
      <UButton
        size="sm"
        variant="ghost"
        icon="i-lucide-menu"
        @click="sidebarOpen = !sidebarOpen"
      />
      <h1 class="text-lg font-semibold">Notes</h1>
    </div>
    <div class="flex items-center gap-3">
      <span class="text-sm text-gray-500 hidden sm:inline">{{
        session?.data?.user?.email
      }}</span>
      <UColorModeButton size="sm" variant="ghost" />
      <UButton size="sm" variant="ghost" icon="i-lucide-power" @click="handleSignOut" />
    </div>
  </header>
</template>

<script setup lang="ts">
const { signOut, useSession } = useAuth()
const session = useSession()

const sidebarOpen = inject("sidebarOpen", ref(true))

async function handleSignOut() {
  await signOut()
  reloadNuxtApp({ path: "/login" })
}
</script>
