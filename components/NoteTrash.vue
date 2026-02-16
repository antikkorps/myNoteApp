<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <div class="px-4 md:px-12 pt-8 pb-4">
      <h1 class="text-3xl font-bold">Trash</h1>
      <p class="text-sm text-gray-400 mt-1">{{ notes.length }} notes</p>
    </div>

    <div class="flex-1 overflow-y-auto px-4 md:px-12 pb-8">
      <div
        v-for="note in notes"
        :key="note.id"
        class="flex items-center gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <UIcon name="i-lucide-file-text" class="size-5 shrink-0 text-gray-400" />
        <div class="flex-1 min-w-0">
          <div class="font-medium truncate">{{ note.title || "Untitled" }}</div>
          <div class="text-xs text-gray-400 mt-0.5">
            Deleted {{ formatDate(note.deletedAt!) }}
          </div>
        </div>
        <div class="flex gap-1 shrink-0">
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-undo-2"
            @click="$emit('restore', note.id)"
          >
            Restore
          </UButton>
          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            @click="$emit('destroy', note.id)"
          >
            Delete forever
          </UButton>
        </div>
      </div>

      <p v-if="notes.length === 0" class="text-center text-gray-400 py-12">
        Trash is empty.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Note } from "~/types"

defineProps<{
  notes: Note[]
}>()

defineEmits<{
  restore: [id: number]
  destroy: [id: number]
}>()

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "today"
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
</script>
