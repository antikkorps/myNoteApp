<template>
  <!-- Menu contextuel -->
  <UDropdownMenu :items="menuItems" :content="{ align: 'start' }">
    <UButton
      icon="i-lucide-ellipsis"
      size="xs"
      variant="ghost"
      class="opacity-0 group-hover:opacity-100 transition-opacity"
      @click.stop
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
const menuItems = [
  {
    label: "New Note",
    icon: "i-lucide-file-plus",
  },
  {
    label: "New Folder",
    icon: "i-lucide-folder-plus",
  },
]
</script>
