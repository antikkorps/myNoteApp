<template>
  <header
    class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
  >
    <h1 class="text-lg font-semibold">Notes</h1>
    <div class="flex items-center gap-3">
      <span class="text-sm text-gray-500">{{ session?.data?.user?.email }}</span>
      <UButton size="sm" variant="ghost" @click="handleSignOut">Sign out</UButton>
    </div>
  </header>
</template>

<script setup lang="ts">
const { signOut, useSession } = useAuth()
const session = useSession()

async function handleSignOut() {
  await signOut()
  reloadNuxtApp({ path: "/login" })
}
</script>
