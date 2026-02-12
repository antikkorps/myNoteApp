<template>
  <aside
    class="w-64 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col bg-gray-50 dark:bg-gray-950 max-md:absolute max-md:z-10 max-md:w-full max-md:border-r-0"
  >
    <div class="p-3">
      <UButton block @click="$emit('create')"> New Note </UButton>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div
        v-for="note in notes"
        :key="note.id"
        @click="$emit('select', note.id)"
        class="px-3 py-2 cursor-pointer text-sm truncate border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        :class="{ 'bg-gray-200 dark:bg-gray-800 font-medium': note.id === activeNoteId }"
      >
        {{ note.title || "Untitled" }}
      </div>

      <p v-if="notes.length === 0" class="p-3 text-sm text-gray-400">No notes yet</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  notes: Array<{ id: number; title: string }>
  activeNoteId: number | null
}>()

defineEmits<{
  create: []
  select: [id: number]
}>()
</script>
