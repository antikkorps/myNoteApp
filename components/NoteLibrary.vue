<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <div class="px-4 md:px-12 pt-8 pb-4">
      <h1 class="text-3xl font-bold">All Notes</h1>
      <p class="text-sm text-gray-400 mt-1">{{ notes.length }} notes</p>
    </div>

    <!-- Sort controls -->
    <div class="px-4 md:px-12 pb-3 flex items-center gap-2">
      <UButton
        size="xs"
        :variant="sortBy === 'updatedAt' ? 'solid' : 'ghost'"
        @click="sortBy = 'updatedAt'"
      >
        Recent
      </UButton>
      <UButton
        size="xs"
        :variant="sortBy === 'title' ? 'solid' : 'ghost'"
        @click="sortBy = 'title'"
      >
        Title
      </UButton>
    </div>

    <!-- Notes list -->
    <div class="flex-1 overflow-y-auto px-4 md:px-12 pb-8">
      <div
        v-for="note in sortedNotes"
        :key="note.id"
        class="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        @click="$emit('select-note', note.id)"
      >
        <UIcon name="i-lucide-file-text" class="size-5 shrink-0 text-gray-400" />
        <div class="flex-1 min-w-0">
          <div class="font-medium truncate">{{ note.title || "Untitled" }}</div>
          <div class="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            <span v-if="getFolderName(note.folderId)">
              {{ getFolderName(note.folderId) }}
            </span>
            <span>{{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>
        <div v-if="getNoteTags(note).length" class="flex gap-1 shrink-0">
          <UBadge
            v-for="tag in getNoteTags(note).slice(0, 3)"
            :key="tag"
            color="neutral"
            variant="subtle"
            size="xs"
          >
            {{ tag }}
          </UBadge>
        </div>
      </div>

      <p v-if="notes.length === 0" class="text-center text-gray-400 py-12">
        No notes yet. Create one to get started.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Note {
  id: number
  title: string
  content: string
  tags: string | null
  folderId: number | null
  updatedAt: string
}

interface Folder {
  id: number
  name: string
  parentId: number | null
}

const props = defineProps<{
  notes: Note[]
  folders: Folder[]
}>()

defineEmits<{
  "select-note": [id: number]
}>()

const sortBy = ref<"updatedAt" | "title">("updatedAt")

const sortedNotes = computed(() => {
  const list = [...props.notes]
  if (sortBy.value === "title") {
    return list.sort((a, b) => (a.title || "Untitled").localeCompare(b.title || "Untitled"))
  }
  return list.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
})

function getFolderName(folderId: number | null): string | null {
  if (!folderId) return null
  return props.folders.find((f) => f.id === folderId)?.name ?? null
}

function getNoteTags(note: { tags: string | null }): string[] {
  return parseTags(note.tags)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
</script>
