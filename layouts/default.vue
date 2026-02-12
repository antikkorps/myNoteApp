<template>
  <div class="h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1 overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "../components/AppHeader.vue"

const sidebarOpen = ref(true)
provide("sidebarOpen", sidebarOpen)
</script>
