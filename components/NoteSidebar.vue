<template>
  <aside
    class="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col bg-white dark:bg-gray-900 max-md:absolute max-md:z-10 max-md:w-full max-md:border-r-0"
  >
    <div class="p-3">
      <UButton block @click="$emit('create')"> New Note </UButton>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div
        v-for="note in notes"
        :key="note.id"
        @click="$emit('select', note.id)"
        class="px-3 py-2 cursor-pointer text-sm border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        :class="{ 'bg-gray-200 dark:bg-gray-800 font-medium': note.id === activeNoteId }"
      >
        <div class="truncate">{{ note.title || "Untitled" }}</div>
        <div v-if="getNoteTags(note).length" class="flex flex-wrap gap-1 mt-1">
          <UBadge
            v-for="tag in getNoteTags(note).slice(0, 3)"
            :key="tag"
            color="neutral"
            variant="subtle"
            size="xs"
          >
            {{ tag }}
          </UBadge>
          <span
            v-if="getNoteTags(note).length > 3"
            class="text-xs text-gray-400"
          >
            +{{ getNoteTags(note).length - 3 }}
          </span>
        </div>
      </div>

      <p v-if="notes.length === 0" class="p-3 text-sm text-gray-400">No notes yet</p>
    </div>

    <TagCloud
      class="border-t border-gray-200 dark:border-gray-800 pt-3"
      :notes="allNotes"
      :active-tag="activeTag"
      @select="$emit('filter-tag', $event)"
    />
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  notes: Array<{ id: number; title: string; tags: string | null }>
  allNotes: Array<{ tags: string | null }>
  activeNoteId: number | null
  activeTag: string | null
}>()

defineEmits<{
  create: []
  select: [id: number]
  "filter-tag": [tag: string | null]
}>()

function getNoteTags(note: { tags: string | null }): string[] {
  return parseTags(note.tags)
}
</script>
